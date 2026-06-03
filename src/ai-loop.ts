#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { appendCycleObservation } from "./ai-loop-observations.js";
import type { CycleObservationInput } from "./ai-loop-observations.js";
import {
  cycleSavePath,
  exploratoryMaxSteps,
  formatIdealEndingBreakdown,
  getRestartSensitiveChangedPaths,
  idealEndingRate,
  parsePathLines,
  parsePorcelainPaths,
  requiresLoopRestart,
  restartRequestedExitCode
} from "./ai-loop-metrics.js";
import type { Story } from "./schema.js";
import { loadStory } from "./story.js";

export {
  cycleSavePath,
  exploratoryMaxSteps,
  formatIdealEndingBreakdown,
  getRestartSensitiveChangedPaths,
  idealEndingRate,
  parsePorcelainPaths,
  requiresLoopRestart,
  restartRequestedExitCode
} from "./ai-loop-metrics.js";

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

interface McpObservation {
  scene: {
    id: string;
    ending: boolean;
  };
  choices: Array<{
    id: string;
    to: string;
  }>;
  score: {
    score: number;
  };
}

interface McpPlaytestRun {
  run: number;
  ended: boolean;
  finalScene: string;
  score: number;
  steps: number;
  path: string[];
  readablePath?: string[];
}

interface CycleArtifacts {
  report: string;
  prompt: string;
  observation: CycleObservationInput;
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

    const artifacts = await runCycleWithRecovery(cycle);
    await writeText(reportPath, artifacts.report);
    await writeText(promptPath, artifacts.prompt);
    console.log(`Wrote ${reportPath}`);
    console.log(`Wrote ${promptPath}`);

    if (agentCommand) {
      console.log(`Running AI agent command: ${agentCommand}`);
      const baselineStatus = await runCommand("git status --porcelain");
      const baselineHead = await runCommand("git rev-parse HEAD");
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
      const changedPaths = await getChangedPathsSince(baselineHead.output.trim());
      const committedHash =
        postAgentResult.status === "committed" || postAgentResult.status === "pushed"
          ? await currentGitCommit()
          : undefined;
      await appendCycleObservation({
        ...artifacts.observation,
        agentCommand,
        changedFiles: changedPaths,
        committedHash,
        postAgentStatus: postAgentResult.status,
        mcpRoute: postAgentResult.mcpPlay
          ? mcpPlayObservation(postAgentResult.mcpPlay)
          : artifacts.observation.mcpRoute
      });
      const restartPaths = getRestartSensitiveChangedPaths(changedPaths);
      if (restartPaths.length > 0) {
        console.log(
          `Loop runtime changed (${restartPaths.join(
            ", "
          )}); exiting with code ${restartRequestedExitCode} so ./loop.sh can restart with fresh code.`
        );
        stopped = true;
        process.exitCode = restartRequestedExitCode;
      }
    } else {
      await appendCycleObservation({
        ...artifacts.observation,
        changedFiles: await getChangedPathsSince(artifacts.observation.gitCommit)
      });
      console.log("AI_AGENT_CMD is not set; cycle stopped after evidence and prompt generation.");
    }

    if (once || cycle >= maxCycles || stopped) break;
    await sleep(delayMs);
  } while (!stopped);
}

async function runCycleWithRecovery(cycle: number): Promise<CycleArtifacts> {
  try {
    return await runCycle(cycle);
  } catch (error) {
    const report = renderCycleFailureReport(cycle, error);
    return {
      report,
      prompt: await renderAgentPrompt(cycle, report),
      observation: {
        cycle,
        gitCommit: await currentGitCommit(),
        mcpRoute: { ok: false },
        metrics: { trueEndingRate: 0, unfinishedRuns: 0, bestScore: 0 }
      }
    };
  }
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
  const mcpPlay = await runMcpPlaythrough(cycle);
  const story = await loadStory("stories/demo.yaml");
  const report = renderReport(
    cycle,
    results,
    randomSummary,
    coverageSummary,
    mcpEvidence,
    mcpPlay,
    story
  );

  return {
    report,
    prompt: await renderAgentPrompt(cycle, report),
    observation: {
      cycle,
      gitCommit: await currentGitCommit(),
      mcpRoute: mcpPlayObservation(mcpPlay),
      metrics: metricSnapshot(randomSummary, story)
    }
  };
}

function renderCycleFailureReport(cycle: number, error: unknown): string {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);

  return `# AI Loop Cycle ${cycle}

Generated: ${new Date().toISOString()}

## Loop Failure

The pre-agent evidence phase threw before it could produce a normal report.
The outer loop is preserving this as an actionable cycle instead of exiting.

\`\`\`text
${message.slice(-6000)}
\`\`\`

## AI Feedback

- Treat this as the highest-priority blocker for the next autonomous change.
- Inspect the failing loop, story, MCP server, and tests.
- Make the smallest fix that restores a complete plan/build/health/play cycle.
- Run \`npm run health\` and actually play the game through MCP or the CLI before finishing.

## Suggested Next Actions

- Reproduce the failure locally.
- Fix the loop or game regression that prevented evidence gathering.
- Add or update a regression test when practical.
`;
}

function renderReport(
  cycle: number,
  results: CommandResult[],
  randomSummary: unknown,
  coverageSummary: unknown,
  mcpEvidence: McpEvidence,
  mcpPlay: McpPlayResult,
  story?: Story
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

## Long-Run Effectiveness Signals

${renderEffectivenessSignals(randomSummary, coverageSummary, mcpEvidence, story)}

## AI Feedback

${failed.length > 0 ? "- Fix failing health checks before changing content." : "- Health checks are green."}
- Treat missing MCP tools or failed MCP validation as blockers.
- Compare random and coverage summaries. Random misses point to normal-player discoverability issues.
- Actually play one route through MCP before making story or gameplay changes.
- Use the adaptive exploratory route to identify the next unclear objective or late-game distraction.
- Prefer one focused improvement in the next commit.

## Suggested Next Actions

${suggestNextActions(randomSummary, coverageSummary, story)
  .map((item) => `- ${item}`)
  .join("\n")}
`;
}

function suggestNextActions(
  randomSummary: unknown,
  coverageSummary: unknown,
  story?: Story
): string[] {
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

  const idealRate = idealEndingRate(random, story);
  const highScoreRate = random?.runs ? Number(random.bestScoreRuns ?? 0) / random.runs : 0;
  if (
    random &&
    coverage &&
    random.unfinished === 0 &&
    !random.unvisitedScenes?.length &&
    !coverage.unvisitedScenes?.length &&
    idealRate >= 0.35 &&
    highScoreRate >= 0.25
  ) {
    suggestions.push(
      "Core route metrics are healthy; favor meaningful new scenes, stronger character beats, or pacing improvements over another clue-only polish pass."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push("Expand the next story beat while preserving validation and coverage.");
  }

  return suggestions;
}

async function renderAgentPrompt(cycle: number, report: string): Promise<string> {
  const contract = await readPromptContract();

  return `# Autonomous Game Development Cycle ${cycle}

**Execution Environment Notice (May 2026)**: Operating under the GPT-5.5 Instant and OpenAI Codex Agentic Execution engine.

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
      runs?: number;
      unfinished?: number;
      unvisitedScenes?: string[];
      endings?: Record<string, number>;
      averageScore?: number;
      bestScore?: number;
      bestScoreRuns?: number;
    }
  | undefined {
  if (!value || typeof value !== "object") return undefined;
  return value as { unfinished?: number; unvisitedScenes?: string[] };
}

function metricSnapshot(randomSummary: unknown, story?: Story): CycleObservationInput["metrics"] {
  const random = asSummary(randomSummary);
  return {
    trueEndingRate: idealEndingRate(random, story),
    unfinishedRuns: Number(random?.unfinished ?? 0),
    bestScore: Number(random?.bestScore ?? 0)
  };
}

function mcpPlayObservation(result: McpPlayResult): CycleObservationInput["mcpRoute"] {
  return {
    ok: result.ok,
    finalScene: result.finalScene,
    score: result.score === undefined ? undefined : Number(result.score)
  };
}

async function currentGitCommit(): Promise<string> {
  const result = await runCommand("git rev-parse HEAD");
  return result.exitCode === 0 ? result.output.trim() : "unknown";
}

function renderEffectivenessSignals(
  randomSummary: unknown,
  coverageSummary: unknown,
  mcpEvidence: McpEvidence,
  story?: Story
): string {
  const random = asSummary(randomSummary);
  const coverage = asSummary(coverageSummary);
  if (!random || !coverage) {
    return "- Summary data was unavailable; repair report parsing before using long-run trends.";
  }

  const idealRate = idealEndingRate(random, story);
  const badEndingRate = endingRate(random, "bad_ending");
  const lostEndingRate = endingRate(random, "lost_ending");
  const escapeEndingRate = endingRate(random, "escape_ending", "warned_escape_ending");
  const highScoreRate = random.runs ? Number(random.bestScoreRuns ?? 0) / random.runs : 0;
  const coverageComplete = (coverage.unvisitedScenes?.length ?? 0) === 0;
  const exploratoryComplete = mcpEvidence.exploratory?.ok === true;

  return [
    `- Random ideal-ending rate: ${formatPercent(idealRate)} (${formatIdealEndingBreakdown(
      random,
      story
    )}).`,
    `- Random non-ideal ending pressure: bad ${formatPercent(badEndingRate)}, lost ${formatPercent(
      lostEndingRate
    )}, escape ${formatPercent(escapeEndingRate)}.`,
    `- Random high-score repeat rate: ${formatPercent(highScoreRate)}; average score: ${
      random.averageScore ?? "unknown"
    }.`,
    `- Coverage completeness: ${
      coverageComplete ? "all scenes visited" : `missing ${coverage.unvisitedScenes?.join(", ")}`
    }.`,
    `- Adaptive route: ${
      exploratoryComplete
        ? `finished at ${mcpEvidence.exploratory?.finalScene ?? "an ending"}`
        : `stopped at ${mcpEvidence.exploratory?.finalScene ?? "unknown"}`
    }.`,
    `- Primary long-run pressure: ${identifyLongRunPressure(
      random,
      coverage,
      exploratoryComplete,
      story
    )}`
  ].join("\n");
}

function identifyLongRunPressure(
  random: NonNullable<ReturnType<typeof asSummary>>,
  coverage: NonNullable<ReturnType<typeof asSummary>>,
  exploratoryComplete: boolean,
  story?: Story
): string {
  if (random.unfinished && random.unfinished > 0) {
    return "reduce dead ends or excessive loops before expanding content.";
  }
  if (coverage.unvisitedScenes?.length) {
    return "repair coverage reachability before adding new branches.";
  }
  if (!exploratoryComplete) {
    return "smooth the route where adaptive play stalls, especially repeated hub returns.";
  }
  if (idealEndingRate(random, story) >= 0.35 && (random.averageScore ?? 0) >= 60) {
    return "core guidance is healthy; invest in richer story depth, endings, or systems.";
  }
  return "improve normal-player discoverability for the true ending.";
}

function endingRate(
  summary: { runs?: number; endings?: Record<string, number> } | undefined,
  ...endingIds: string[]
): number {
  if (!summary?.runs) return 0;
  const total = endingIds.reduce(
    (sum, endingId) => sum + Number(summary.endings?.[endingId] ?? 0),
    0
  );
  return total / summary.runs;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
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
    command: "node",
    args: ["--import", "tsx", "src/mcp.ts"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  try {
    await client.connect(transport);
    const tools = (await client.listTools()).tools.map((tool) => tool.name).sort();
    const missingRequiredTools = requiredTools.filter((tool) => !tools.includes(tool));

    // 1. Story discovery
    const storiesRes = parseMcpJsonResult(
      await client.callTool({
        name: "list_stories",
        arguments: {}
      }),
      "list_stories"
    );
    const mainStory =
      storiesRes.stories.find((s: string) => s.endsWith("demo.yaml")) || "stories/demo.yaml";

    // 2. Story validation
    const validateStory = parseMcpJsonResult(
      await client.callTool({
        name: "validate_story",
        arguments: { storyPath: mainStory }
      }),
      "validate_story"
    );
    if (!validateStory.ok) {
      throw new Error(
        `validate_story returned ok: false. Errors: ${JSON.stringify(validateStory.errors)}`
      );
    }

    // 3. Automated playtest evidence with random strategy (include runs to inspect suspicious samples)
    const randomPlaytestRes = parseMcpJsonResult(
      await client.callTool({
        name: "run_playtest",
        arguments: {
          storyPath: mainStory,
          runs: 250,
          maxSteps: 80,
          strategy: "random",
          includeRuns: true
        }
      }),
      "run_playtest"
    );
    const randomSummary = randomPlaytestRes.summary;

    const suspiciousPaths: string[] = [];
    if (Array.isArray(randomPlaytestRes.runs)) {
      const suspicious = randomPlaytestRes.runs.filter(
        (run: McpPlaytestRun) =>
          !run.ended ||
          run.finalScene === "bad_ending" ||
          run.finalScene === "lost_ending" ||
          run.steps >= 40
      );
      for (const run of suspicious.slice(0, 3)) {
        suspiciousPaths.push(
          `Run #${run.run} (${run.ended ? "ended" : "unfinished"} at '${run.finalScene}', score ${run.score}, steps: ${run.steps}): ${formatSuspiciousPath(run)}`
        );
      }
    }

    const coverageSummary = parseMcpJsonResult(
      await client.callTool({
        name: "run_playtest",
        arguments: {
          storyPath: mainStory,
          runs: 100,
          maxSteps: 60,
          strategy: "coverage",
          includeRuns: false
        }
      }),
      "run_playtest"
    ).summary;

    const goalSummary = parseMcpJsonResult(
      await client.callTool({
        name: "run_playtest",
        arguments: {
          storyPath: mainStory,
          runs: 10,
          maxSteps: 40,
          strategy: "goal",
          includeRuns: false
        }
      }),
      "run_playtest"
    ).summary;

    // 5. Adaptive exploratory MCP route
    const exploratory = await runMcpExploratoryRoute(
      client,
      cycleSavePath("exploratory", cycle),
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

function formatSuspiciousPath(run: McpPlaytestRun): string {
  return (run.readablePath?.length ? run.readablePath : run.path).join(" -> ");
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
    let observation = parseMcpJsonResult(
      await client.callTool({
        name: "start_game",
        arguments: { storyPath, savePath }
      }),
      "start_game"
    );

    const history: string[] = [observation.scene.id];
    const rng = seededRandom(cycle + 4242);

    for (let step = 0; step < exploratoryMaxSteps; step += 1) {
      // Repeatedly call get_scene before choices to verify state
      observation = parseMcpJsonResult(
        await client.callTool({
          name: "get_scene",
          arguments: { savePath }
        }),
        "get_scene"
      );

      if (observation.scene.ending || observation.choices.length === 0) {
        break;
      }

      // Prioritize less visited scenes to avoid trivial loops and ensure backtracking/risky path exploration
      const choiceVisits = (observation as McpObservation).choices.map((choice) => {
        const destination = choice.to;
        const visits = history.filter((sceneId) => sceneId === destination).length;
        return { choice, visits };
      });

      // Sort ascending by history visits
      choiceVisits.sort((left, right) => left.visits - right.visits);

      // Take candidates with the minimum visits
      const minVisits = choiceVisits[0].visits;
      const candidates = choiceVisits.filter((candidate) => candidate.visits === minVisits);
      const selected = candidates[Math.floor(rng() * candidates.length)].choice;

      history.push(selected.to);
      observation = parseMcpJsonResult(
        await client.callTool({
          name: "choose_option",
          arguments: { savePath, choiceId: selected.id }
        }),
        "choose_option"
      );
    }

    // Call get_scene one last time for final observation
    observation = parseMcpJsonResult(
      await client.callTool({
        name: "get_scene",
        arguments: { savePath }
      }),
      "get_scene"
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
      score: `${observation.score.score}`,
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
  const mcpPlay = await runMcpPlaythrough(cycle);
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

async function getChangedPathsSince(baselineHead: string): Promise<string[]> {
  const committed = baselineHead
    ? await runCommand(`git diff --name-only ${shellQuote(baselineHead)} HEAD`)
    : { output: "" };
  const worktree = await runCommand("git status --porcelain --untracked-files=all");
  return [...parsePathLines(committed.output), ...parsePorcelainPaths(worktree.output)].sort();
}

async function writeText(path: string, text: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, text, "utf8");
}

async function runMcpPlaythrough(cycle: number): Promise<McpPlayResult> {
  const savePath = cycleSavePath("mcp", cycle);
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
    "take_badge",
    "close_locker",
    "go_to_platform",
    "install_fuse",
    "use_token_slot",
    "inspect_signal_ledger",
    "mark_mara_clear_from_ledger",
    "board_after_clearing_mara",
    "pull_release"
  ];

  const client = new Client({ name: "ai-loop-player", version: "0.1.0" });
  const transport = new StdioClientTransport({
    command: "node",
    args: ["--import", "tsx", "src/mcp.ts"],
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
  let observation = parseMcpJsonResult(
    await client.callTool({
      name: "start_game",
      arguments: { storyPath: "stories/demo.yaml", savePath }
    }),
    "start_game"
  );

  for (const choiceId of choices) {
    // 4. Repeatedly call get_scene before choices to verify state
    observation = parseMcpJsonResult(
      await client.callTool({
        name: "get_scene",
        arguments: { savePath }
      }),
      "get_scene"
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
        score: `${observation.score.score}`,
        transcript,
        error: `Choice '${choiceId}' was not available in '${observation.scene.id}'. Legal choices: ${legalChoices.join(", ")}`
      };
    }

    observation = parseMcpJsonResult(
      await client.callTool({
        name: "choose_option",
        arguments: { savePath, choiceId }
      }),
      "choose_option"
    );
  }

  // Get one last scene verification
  observation = parseMcpJsonResult(
    await client.callTool({
      name: "get_scene",
      arguments: { savePath }
    }),
    "get_scene"
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
    score: `${observation.score.score}`,
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

export function parseMcpJsonResult(result: unknown, toolName: string): any {
  const text = textContent(result);
  try {
    return JSON.parse(text);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    const excerpt = text.replace(/\s+/g, " ").slice(0, 300);
    throw new Error(`MCP tool '${toolName}' returned non-JSON text: ${detail}. Text: ${excerpt}`);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  await main();
}
