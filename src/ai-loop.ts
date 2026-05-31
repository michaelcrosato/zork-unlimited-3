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
  transcript?: string;
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

const once = process.argv.includes("--once");
const delayMs = Number(process.env.AI_LOOP_DELAY_MS ?? "300000");
const maxCycles = process.env.AI_LOOP_MAX_CYCLES
  ? Number(process.env.AI_LOOP_MAX_CYCLES)
  : Infinity;
const evidenceOnly = process.env.AI_LOOP_EVIDENCE_ONLY === "1";
const agentCommand = evidenceOnly ? undefined : process.env.AI_AGENT_CMD;
const agentTimeoutMs = Number(process.env.AI_AGENT_TIMEOUT_MS ?? "3600000");

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

    const artifacts = await runCycle(cycle);
    await writeText(reportPath, artifacts.report);
    await writeText(promptPath, artifacts.prompt);
    console.log(`Wrote ${reportPath}`);
    console.log(`Wrote ${promptPath}`);

    if (agentCommand) {
      console.log(`Running AI agent command: ${agentCommand}`);
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
  const mcpPlay = await runMcpPlaythrough();
  const report = renderReport(cycle, results, randomSummary, coverageSummary, mcpPlay);

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

## Coverage Playtest Summary

\`\`\`json
${JSON.stringify(coverageSummary, null, 2)}
\`\`\`

## Actual MCP Playthrough

- Status: ${mcpPlay.ok ? "PASS" : "FAIL"}
- Final scene: ${mcpPlay.finalScene ?? "unknown"}

\`\`\`text
${(mcpPlay.transcript ?? mcpPlay.error ?? "No transcript.").slice(-3000)}
\`\`\`

## AI Feedback

${failed.length > 0 ? "- Fix failing health checks before changing content." : "- Health checks are green."}
- Compare random and coverage summaries. Random misses point to normal-player discoverability issues.
- Actually play one route through MCP before making story or gameplay changes.
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
    await client.callTool({
      name: "start_game",
      arguments: { storyPath: "stories/demo.yaml", savePath }
    });

    let finalScene = "unknown";
    for (const choiceId of choices) {
      const result = await client.callTool({
        name: "choose_option",
        arguments: { savePath, choiceId }
      });
      const observation = JSON.parse(textContent(result));
      finalScene = observation.scene.id;
    }

    const transcript = textContent(
      await client.callTool({
        name: "get_transcript",
        arguments: { savePath }
      })
    );
    await client.close();

    return { ok: finalScene === "true_ending", finalScene, transcript };
  } catch (error) {
    await client.close().catch(() => undefined);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
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
