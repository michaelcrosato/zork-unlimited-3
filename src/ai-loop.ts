#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

interface CommandResult {
  command: string;
  exitCode: number;
  output: string;
}

interface McpPlayResult {
  ok: boolean;
  finalScene?: string;
  score?: string;
  transcript?: string;
  error?: string;
}

interface McpEvidence {
  tools: string[];
  missingRequiredTools: string[];
  validateStory?: unknown;
  randomSummary?: unknown;
  coverageSummary?: unknown;
  goalSummary?: unknown;
  exploratory?: McpPlayResult;
  suspiciousPaths?: string[];
  error?: string;
}

interface CycleArtifacts {
  report: string;
  prompt: string;
}

interface AgentResult {
  command: string;
  exitCode: number;
  output: string;
  timedOut: boolean;
}

interface PostAgentResult {
  status: "skipped" | "clean" | "committed" | "pushed" | "failed";
  reason?: string;
  commands: CommandResult[];
  mcpPlay?: McpPlayResult;
}

const once = process.argv.includes("--once");
const delayMs = Number(process.env.AI_LOOP_DELAY_MS ?? "300000");
const maxCycles = process.env.AI_LOOP_MAX_CYCLES
  ? Number(process.env.AI_LOOP_MAX_CYCLES)
  : Infinity;
const evidenceOnly = process.env.AI_LOOP_EVIDENCE_ONLY === "1";
const agentCommand = evidenceOnly ? undefined : process.env.AI_AGENT_CMD;
const agentTimeoutMs = Number(process.env.AI_AGENT_TIMEOUT_MS ?? "3600000");
const autoCommit = process.env.AI_LOOP_AUTO_COMMIT !== "0";
const autoPush = process.env.AI_LOOP_AUTO_PUSH !== "0";
const allowDirtyBaseline = process.env.AI_LOOP_ALLOW_DIRTY_BASELINE === "1";

let stopped = false;
process.on("SIGINT", () => {
  stopped = true;
});
process.on("SIGTERM", () => {
  stopped = true;
});

async function main(): Promise<void> {
  let cycle = 0;

  do {
    cycle += 1;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = `ai-runs/cycle-${stamp}.md`;
    const promptPath = `ai-runs/cycle-${stamp}-prompt.md`;
    const agentPath = `ai-runs/cycle-${stamp}-agent.md`;
    const postAgentPath = `ai-runs/cycle-${stamp}-post-agent.md`;

    const artifacts = await runCycle(cycle);
    await writeText(reportPath, artifacts.report);
    await writeText(promptPath, artifacts.prompt);
    console.log(`Wrote ${reportPath}`);
    console.log(`Wrote ${promptPath}`);

    if (agentCommand) {
      console.log(`Running AI agent command: ${agentCommand}`);
      const baselineStatus = await runCommand("git status --porcelain");
      const agentResult = await runAgentCommand(
        agentCommand,
        artifacts.prompt,
        cycle,
        promptPath,
        reportPath
      );
      await writeText(agentPath, renderAgentResult(agentResult));
      console.log(`Wrote ${agentPath}`);
      if (agentResult.exitCode !== 0) {
        console.error(`AI agent command failed with exit code ${agentResult.exitCode}.`);
      }
      const postAgentResult = await runPostAgentAutomation(cycle, agentResult, baselineStatus);
      await writeText(postAgentPath, renderPostAgentResult(postAgentResult));
      console.log(`Wrote ${postAgentPath}`);
    } else {
      console.log("AI_AGENT_CMD is not set; cycle stopped after evidence and prompt generation.");
    }

    if (once || cycle >= maxCycles || stopped) break;
    await sleep(delayMs);
  } while (!stopped);
}

async function runCycle(cycle: number): Promise<CycleArtifacts> {
  const commands = [
    "npm run format:check",
    "npm run lint",
    "npm test",
    "npm run cyoa -- validate stories/demo.yaml --json",
    "npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy random --summary --json",
    "npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy coverage --summary --json"
  ];

  const results: CommandResult[] = [];
  for (const command of commands) {
    results.push(await runCommand(command));
  }

  const randomSummary = parseLastJson(results[4].output);
  const coverageSummary = parseLastJson(results[5].output);
  const mcpEvidence = await runMcpEvidence(cycle);
  if (mcpEvidence.error) {
    throw new Error(`MCP validation or playtest failed: ${mcpEvidence.error}`);
  }
  const mcpPlay = await runMcpPlaythrough();
  if (!mcpPlay.ok) {
    throw new Error(
      `True ending regression play failed: ${mcpPlay.error ?? "true_ending was not reached"}`
    );
  }
  const report = renderReport(cycle, results, randomSummary, coverageSummary, mcpEvidence, mcpPlay);

  return {
    report,
    prompt: await renderAgentPrompt(cycle, report)
  };
}

function renderReport(
  cycle: number,
  results: CommandResult[],
  randomSummary: unknown,
  coverageSummary: unknown,
  mcpEvidence: McpEvidence,
  mcpPlay: McpPlayResult
): string {
  const failed = results.filter((result) => result.exitCode !== 0);

  return `# AI Loop Cycle ${cycle}

Generated: ${new Date().toISOString()}

## Health

${results.map((result) => `- ${result.exitCode === 0 ? "PASS" : "FAIL"}: \`${result.command}\``).join("\n")}

## Random Playtest Summary

\`\`\`json
${JSON.stringify(randomSummary, null, 2)}
\`\`\`

### Suspicious Path Samples
${
  mcpEvidence.suspiciousPaths && mcpEvidence.suspiciousPaths.length > 0
    ? mcpEvidence.suspiciousPaths.map((p: string) => `- ${p}`).join("\n")
    : "- None detected"
}

## Coverage Playtest Summary

\`\`\`json
${JSON.stringify(coverageSummary, null, 2)}
\`\`\`

## MCP Tool Verification

- Tools: ${mcpEvidence.tools.length > 0 ? mcpEvidence.tools.join(", ") : "unknown"}
- Missing required tools: ${
    mcpEvidence.missingRequiredTools.length > 0
      ? mcpEvidence.missingRequiredTools.join(", ")
      : "none"
  }

## MCP validate_story

\`\`\`json
${JSON.stringify(mcpEvidence.validateStory ?? { error: mcpEvidence.error }, null, 2)}
\`\`\`

## MCP run_playtest Summaries

Random:

\`\`\`json
${JSON.stringify(mcpEvidence.randomSummary ?? { error: mcpEvidence.error }, null, 2)}
\`\`\`

Coverage:

\`\`\`json
${JSON.stringify(mcpEvidence.coverageSummary ?? { error: mcpEvidence.error }, null, 2)}
\`\`\`

Goal:

\`\`\`json
${JSON.stringify(mcpEvidence.goalSummary ?? { error: mcpEvidence.error }, null, 2)}
\`\`\`

## Actual MCP Playthrough

- Status: ${mcpPlay.ok ? "PASS" : "FAIL"}
- Final scene: ${mcpPlay.finalScene ?? "unknown"}
- Score: ${mcpPlay.score ?? "unknown"}

\`\`\`text
${(mcpPlay.transcript ?? mcpPlay.error ?? "No transcript.").slice(-3000)}
\`\`\`

## Adaptive Exploratory MCP Route

- Status: ${mcpEvidence.exploratory?.ok ? "PASS" : "INCOMPLETE"}
- Final scene: ${mcpEvidence.exploratory?.finalScene ?? "unknown"}
- Score: ${mcpEvidence.exploratory?.score ?? "unknown"}
- Finding: ${
    mcpEvidence.exploratory?.ok
      ? "Exploratory route reached an ending."
      : "Exploratory route stopped before the true ending; inspect transcript for signposting gaps."
  }

\`\`\`text
${(
  mcpEvidence.exploratory?.transcript ??
  mcpEvidence.exploratory?.error ??
  "No exploratory transcript."
).slice(-3000)}
\`\`\`

## AI Feedback

${failed.length > 0 ? "- Fix failing health checks before changing content." : "- Health checks are green."}
- Treat missing MCP tools or failed MCP validation as blockers.
- Compare random and coverage summaries. Random misses point to normal-player discoverability issues.
- Actually play one route through MCP before making story or gameplay changes.
- Use the adaptive exploratory route to identify the next unclear objective or late-game distraction.
- Prefer one focused improvement in the next commit.

## Suggested Next Actions

${suggestNextActions(randomSummary, coverageSummary)
  .map((item) => `- ${item}`)
  .join("\n")}
`;
}

function suggestNextActions(randomSummary: unknown, coverageSummary: unknown): string[] {
  const suggestions: string[] = [];
  const random = asSummary(randomSummary);
  const coverage = asSummary(coverageSummary);

  if (random?.unfinished && random.unfinished > 0) {
    suggestions.push(
      "Investigate random unfinished runs and reduce loops or increase player guidance."
    );
  }

  if (random?.unvisitedScenes?.length) {
    suggestions.push(`Improve normal-play discovery for: ${random.unvisitedScenes.join(", ")}.`);
  }

  if (coverage?.unvisitedScenes?.length) {
    suggestions.push(`Fix coverage gaps for: ${coverage.unvisitedScenes.join(", ")}.`);
  }

  if (suggestions.length === 0) {
    suggestions.push("Expand the next story beat while preserving validation and coverage.");
  }

  return suggestions;
}

async function renderAgentPrompt(cycle: number, report: string): Promise<string> {
  const contract = await readPromptContract();

  return `# Autonomous Game Development Cycle ${cycle}

${contract}

## Current Evidence

The loop has already run validation, automated playtests, and an actual MCP playthrough for this cycle. Use this evidence to choose the next improvement.

${report}

## Required Action Now

Pick one focused, high-impact improvement to the playable game. Inspect the repo, update the plan, build the improvement, run the required checks, actually play the game through MCP or the CLI, record feedback, and commit/push a coherent milestone if the work is green.

The outer bash loop will also verify, commit, and push after you return if \`AI_LOOP_AUTO_COMMIT\` and \`AI_LOOP_AUTO_PUSH\` are enabled. Do not leave unrelated or failing work in the tree.
`;
}

async function readPromptContract(): Promise<string> {
  try {
    return await readFile("AI_AGENT_PROMPT.md", "utf8");
  } catch {
    return `You are the autonomous development agent for this game. Improve the playable experience in a persistent plan/build/playtest/evaluate/iterate loop.`;
  }
}

function asSummary(value: unknown):
  | {
      unfinished?: number;
      unvisitedScenes?: string[];
    }
  | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as { unfinished?: number; unvisitedScenes?: string[] };
}

function parseLastJson(output: string): unknown {
  const start = output.lastIndexOf("\n{");
  const jsonText = start >= 0 ? output.slice(start + 1) : output.slice(output.indexOf("{"));
  try {
    return JSON.parse(jsonText);
  } catch {
    return { parseError: true, raw: output.slice(-2000) };
  }
}

function runCommand(command: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let output = "";

    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("close", (exitCode) => {
      resolve({ command, exitCode: exitCode ?? 1, output });
    });
  });
}

function runAgentCommand(
  command: string,
  prompt: string,
  cycle: number,
  promptPath: string,
  reportPath: string
): Promise<AgentResult> {
  return new Promise((resolve) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        AI_LOOP_CYCLE: String(cycle),
        AI_PROMPT_FILE: promptPath,
        AI_REPORT_FILE: reportPath
      }
    });

    let settled = false;
    let output = "";
    const timeout =
      agentTimeoutMs > 0
        ? setTimeout(() => {
            if (settled) return;
            settled = true;
            child.kill("SIGTERM");
            resolve({ command, exitCode: 124, output, timedOut: true });
          }, agentTimeoutMs)
        : undefined;

    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.on("error", (error) => {
      output += `\n${error instanceof Error ? error.message : String(error)}`;
    });
    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      resolve({ command, exitCode: exitCode ?? 1, output, timedOut: false });
    });

    child.stdin.end(prompt);
  });
}

function renderAgentResult(result: AgentResult): string {
  return `# AI Agent Result

- Command: \`${result.command}\`
- Exit code: ${result.exitCode}
- Timed out: ${result.timedOut ? "yes" : "no"}

\`\`\`text
${result.output.slice(-12000)}
\`\`\`
`;
}

async function runMcpEvidence(cycle: number): Promise<McpEvidence> {
  const requiredTools = [
    "list_stories",
    "validate_story",
    "start_game",
    "get_scene",
    "choose_option",
    "get_state",
    "get_transcript",
    "run_playtest"
  ];
  const client = new Client({ name: "ai-loop-evidence", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "mcp"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  try {
    await client.connect(transport);
    const tools = (await client.listTools()).tools.map((tool) => tool.name).sort();
    const missingRequiredTools = requiredTools.filter((tool) => !tools.includes(tool));

    // 1. Story discovery
    const storiesRes = JSON.parse(
      textContent(
        await client.callTool({
          name: "list_stories",
          arguments: {}
        })
      )
    );
    const mainStory =
      storiesRes.stories.find((s: string) => s.endsWith("demo.yaml")) || "stories/demo.yaml";

    // 2. Story validation
    const validateStory = JSON.parse(
      textContent(
        await client.callTool({
          name: "validate_story",
          arguments: { storyPath: mainStory }
        })
      )
    );
    if (!validateStory.ok) {
      throw new Error(
        `validate_story returned ok: false. Errors: ${JSON.stringify(validateStory.errors)}`
      );
    }

    // 3. Automated playtest evidence with random strategy (include runs to inspect suspicious samples)
    const randomPlaytestRes = JSON.parse(
      textContent(
        await client.callTool({
          name: "run_playtest",
          arguments: {
            storyPath: mainStory,
            runs: 250,
            maxSteps: 80,
            strategy: "random",
            includeRuns: true
          }
        })
      )
    );
    const randomSummary = randomPlaytestRes.summary;

    const suspiciousPaths: string[] = [];
    if (randomPlaytestRes.runs) {
      const suspicious = randomPlaytestRes.runs.filter(
        (run: any) =>
          !run.ended ||
          run.finalScene === "bad_ending" ||
          run.finalScene === "lost_ending" ||
          run.steps >= 40
      );
      for (const run of suspicious.slice(0, 3)) {
        suspiciousPaths.push(
          `Run #${run.run} (${run.ended ? "ended" : "unfinished"} at '${run.finalScene}', score ${run.score}/${run.maxScore}, steps: ${run.steps}): ${run.path.join(" -> ")}`
        );
      }
    }

    const coverageSummary = JSON.parse(
      textContent(
        await client.callTool({
          name: "run_playtest",
          arguments: {
            storyPath: mainStory,
            runs: 100,
            maxSteps: 50,
            strategy: "coverage",
            includeRuns: false
          }
        })
      )
    ).summary;

    const goalSummary = JSON.parse(
      textContent(
        await client.callTool({
          name: "run_playtest",
          arguments: {
            storyPath: mainStory,
            runs: 10,
            maxSteps: 40,
            strategy: "goal",
            includeRuns: false
          }
        })
      )
    ).summary;

    // 5. Adaptive exploratory MCP route
    const exploratory = await runMcpExploratoryRoute(
      client,
      "saves/ai-loop-exploratory.json",
      cycle,
      mainStory
    );

    await client.close();
    return {
      tools,
      missingRequiredTools,
      validateStory,
      randomSummary,
      coverageSummary,
      goalSummary,
      exploratory,
      suspiciousPaths
    };
  } catch (error) {
    await client.close().catch(() => undefined);
    return {
      tools: [],
      missingRequiredTools: requiredTools,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function seededRandom(seed: number): () => number {
  let h = seed ^ 0xdeadbeef;
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

async function runMcpExploratoryRoute(
  client: Client,
  savePath: string,
  cycle: number,
  storyPath: string
): Promise<McpPlayResult> {
  try {
    let observation = JSON.parse(
      textContent(
        await client.callTool({
          name: "start_game",
          arguments: { storyPath, savePath }
        })
      )
    );

    const history: string[] = [observation.scene.id];
    const maxSteps = 30;
    const rng = seededRandom(cycle + 4242);

    for (let step = 0; step < maxSteps; step += 1) {
      // Repeatedly call get_scene before choices to verify state
      observation = JSON.parse(
        textContent(
          await client.callTool({
            name: "get_scene",
            arguments: { savePath }
          })
        )
      );

      if (observation.scene.ending || observation.choices.length === 0) {
        break;
      }

      // Prioritize less visited scenes to avoid trivial loops and ensure backtracking/risky path exploration
      const choiceVisits = observation.choices.map((choice: any) => {
        const destination = choice.to;
        const visits = history.filter((sceneId) => sceneId === destination).length;
        return { choice, visits };
      });

      // Sort ascending by history visits
      choiceVisits.sort((left: any, right: any) => left.visits - right.visits);

      // Take candidates with the minimum visits
      const minVisits = choiceVisits[0].visits;
      const candidates = choiceVisits.filter((c: any) => c.visits === minVisits);
      const selected = candidates[Math.floor(rng() * candidates.length)].choice;

      history.push(selected.to);
      observation = JSON.parse(
        textContent(
          await client.callTool({
            name: "choose_option",
            arguments: { savePath, choiceId: selected.id }
          })
        )
      );
    }

    // Call get_scene one last time for final observation
    observation = JSON.parse(
      textContent(
        await client.callTool({
          name: "get_scene",
          arguments: { savePath }
        })
      )
    );

    const transcript = textContent(
      await client.callTool({
        name: "get_transcript",
        arguments: { savePath }
      })
    );

    return {
      ok: observation.scene.ending,
      finalScene: observation.scene.id,
      score: `${observation.score.score}/${observation.score.maxScore}`,
      transcript
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runPostAgentAutomation(
  cycle: number,
  agentResult: AgentResult,
  baselineStatus: CommandResult
): Promise<PostAgentResult> {
  const commands: CommandResult[] = [baselineStatus];

  if (!autoCommit) {
    return { status: "skipped", reason: "AI_LOOP_AUTO_COMMIT=0", commands };
  }

  if (baselineStatus.output.trim().length > 0 && !allowDirtyBaseline) {
    return {
      status: "failed",
      reason:
        "Repository was dirty before the agent ran; refusing to auto-commit mixed baseline changes. Set AI_LOOP_ALLOW_DIRTY_BASELINE=1 to override.",
      commands
    };
  }

  if (agentResult.exitCode !== 0) {
    return {
      status: "failed",
      reason: `Agent command exited ${agentResult.exitCode}; refusing to commit.`,
      commands
    };
  }

  const branch = (await runCommand("git branch --show-current")).output.trim();
  commands.push({ command: "git branch --show-current", exitCode: branch ? 0 : 1, output: branch });

  const dirtyBefore = await runCommand("git status --porcelain");
  commands.push(dirtyBefore);
  const aheadBefore = await runCommand("git rev-list --count @{u}..HEAD");
  commands.push(aheadBefore);

  const hasDirtyChanges = dirtyBefore.output.trim().length > 0;
  const hasUnpushedCommits = Number(aheadBefore.output.trim()) > 0;

  if (!hasDirtyChanges && !hasUnpushedCommits) {
    return {
      status: "clean",
      reason: "No repo changes or unpushed commits after agent run.",
      commands
    };
  }

  const health = await runCommand("npm run health");
  commands.push(health);
  const mcpPlay = await runMcpPlaythrough();
  if (health.exitCode !== 0 || !mcpPlay.ok) {
    return {
      status: "failed",
      reason: "Post-agent verification failed; refusing to commit or push.",
      commands,
      mcpPlay
    };
  }

  if (hasDirtyChanges) {
    const add = await runCommand("git add -A");
    commands.push(add);
    if (add.exitCode !== 0) {
      return { status: "failed", reason: "git add failed.", commands, mcpPlay };
    }

    const staged = await runCommand("git diff --cached --name-only");
    commands.push(staged);
    if (staged.output.trim().length > 0) {
      const commit = await runCommand(
        `git commit -m ${shellQuote(`AI loop cycle ${cycle} autonomous improvement`)}`
      );
      commands.push(commit);
      if (commit.exitCode !== 0) {
        return { status: "failed", reason: "git commit failed.", commands, mcpPlay };
      }
    }
  }

  if (!autoPush) {
    return {
      status: hasDirtyChanges ? "committed" : "clean",
      reason: "AI_LOOP_AUTO_PUSH=0",
      commands,
      mcpPlay
    };
  }

  if (!branch) {
    return {
      status: "failed",
      reason: "Could not determine current git branch.",
      commands,
      mcpPlay
    };
  }

  const push = await runCommand(`git push origin ${shellQuote(branch)}`);
  commands.push(push);
  if (push.exitCode !== 0) {
    return { status: "failed", reason: "git push failed.", commands, mcpPlay };
  }

  return { status: "pushed", commands, mcpPlay };
}

function renderPostAgentResult(result: PostAgentResult): string {
  return `# Post-Agent Automation Result

- Status: ${result.status}
- Reason: ${result.reason ?? "n/a"}
- MCP play: ${result.mcpPlay ? (result.mcpPlay.ok ? "PASS" : "FAIL") : "not run"}
- Final scene: ${result.mcpPlay?.finalScene ?? "n/a"}

## Commands

${result.commands
  .map(
    (command) => `### ${command.exitCode === 0 ? "PASS" : "FAIL"}: \`${command.command}\`

\`\`\`text
${command.output.slice(-4000)}
\`\`\``
  )
  .join("\n\n")}

## MCP Transcript

\`\`\`text
${(result.mcpPlay?.transcript ?? result.mcpPlay?.error ?? "").slice(-3000)}
\`\`\`
`;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

async function writeText(path: string, text: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
}

async function runMcpPlaythrough(): Promise<McpPlayResult> {
  const savePath = "saves/ai-loop-mcp.json";
  const choices = [
    "read_notice",
    "take_lantern_after_notice",
    "inspect_clock",
    "take_token",
    "open_service_door",
    "read_personnel_file",
    "keep_mara_file",
    "take_map",
    "tune_radio",
    "note_radio_route",
    "search_locker",
    "take_fuse",
    "search_locker",
    "take_badge",
    "go_to_platform",
    "install_fuse",
    "use_token_slot",
    "mark_mara_clear",
    "pull_release"
  ];

  const client = new Client({ name: "ai-loop-player", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "mcp"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  try {
    await client.connect(transport);
    const result = await runMcpRoute(client, savePath, choices, "true_ending");
    await client.close();
    return result;
  } catch (error) {
    await client.close().catch(() => undefined);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function runMcpRoute(
  client: Client,
  savePath: string,
  choices: string[],
  expectedFinalScene?: string
): Promise<McpPlayResult> {
  let observation = JSON.parse(
    textContent(
      await client.callTool({
        name: "start_game",
        arguments: { storyPath: "stories/demo.yaml", savePath }
      })
    )
  );

  for (const choiceId of choices) {
    // 4. Repeatedly call get_scene before choices to verify state
    observation = JSON.parse(
      textContent(
        await client.callTool({
          name: "get_scene",
          arguments: { savePath }
        })
      )
    );

    const legalChoices = observation.choices.map((choice: { id: string }) => choice.id);
    if (!legalChoices.includes(choiceId)) {
      const transcript = textContent(
        await client.callTool({
          name: "get_transcript",
          arguments: { savePath }
        })
      );
      return {
        ok: false,
        finalScene: observation.scene.id,
        score: `${observation.score.score}/${observation.score.maxScore}`,
        transcript,
        error: `Choice '${choiceId}' was not available in '${observation.scene.id}'. Legal choices: ${legalChoices.join(", ")}`
      };
    }

    observation = JSON.parse(
      textContent(
        await client.callTool({
          name: "choose_option",
          arguments: { savePath, choiceId }
        })
      )
    );
  }

  // Get one last scene verification
  observation = JSON.parse(
    textContent(
      await client.callTool({
        name: "get_scene",
        arguments: { savePath }
      })
    )
  );

  const transcript = textContent(
    await client.callTool({
      name: "get_transcript",
      arguments: { savePath }
    })
  );
  const finalScene = observation.scene.id;
  return {
    ok: expectedFinalScene ? finalScene === expectedFinalScene : observation.scene.ending,
    finalScene,
    score: `${observation.score.score}/${observation.score.maxScore}`,
    transcript
  };
}

function textContent(result: unknown): string {
  const content = (result as { content?: Array<{ type: string; text?: string }> }).content;
  const first = content?.[0];
  if (!first || first.type !== "text" || typeof first.text !== "string") {
    throw new Error("Expected text content from MCP tool");
  }
  return first.text;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await main();
