#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
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

const once = process.argv.includes("--once");
const delayMs = Number(process.env.AI_LOOP_DELAY_MS ?? "300000");
const maxCycles = process.env.AI_LOOP_MAX_CYCLES
  ? Number(process.env.AI_LOOP_MAX_CYCLES)
  : Infinity;

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
    const report = await runCycle(cycle);
    const reportPath = `ai-runs/cycle-${new Date().toISOString().replace(/[:.]/g, "-")}.md`;
    await writeText(reportPath, report);
    console.log(`Wrote ${reportPath}`);

    if (once || cycle >= maxCycles || stopped) break;
    await sleep(delayMs);
  } while (!stopped);
}

async function runCycle(cycle: number): Promise<string> {
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

  return renderReport(cycle, results, randomSummary, coverageSummary, mcpPlay);
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
