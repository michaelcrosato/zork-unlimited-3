import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";

interface McpContent {
  type: string;
  text?: string;
}

interface McpToolResult {
  content?: McpContent[];
}

function textContent(result: unknown): string {
  const content = (result as McpToolResult).content;
  const first = content?.[0];
  if (!first || first.type !== "text" || typeof first.text !== "string") {
    throw new Error("Expected text content from MCP tool");
  }
  return first.text;
}

async function main() {
  const runId = randomBytes(4).toString("hex");
  const savePath = `saves/playtest-run-${runId}.json`;

  const client = new Client(
    { name: "blind-playtester", version: "0.1.0" },
    {
      capabilities: {}
    }
  );
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "mcp"],
    cwd: process.cwd(),
    stderr: "pipe"
  });

  try {
    await client.connect(transport);

    let observationText = textContent(
      await client.callTool({
        name: "start_game",
        arguments: { storyPath: "stories/demo.yaml", savePath }
      })
    );
    let observation = JSON.parse(observationText);

    const pathTaken: string[] = [];
    const maxSteps = 50;
    let step = 0;

    // Simulate basic blind play by randomly picking options.
    // In a full LLM version, we'd prompt the LLM to choose here.
    while (!observation.scene.ending && observation.choices.length > 0 && step < maxSteps) {
      const choices = observation.choices;
      // Just pick random choice for now to stand in for LLM
      const choice = choices[Math.floor(Math.random() * choices.length)];

      pathTaken.push(observation.scene.id);
      pathTaken.push(choice.id);

      observationText = textContent(
        await client.callTool({
          name: "choose_option",
          arguments: { savePath, choiceId: choice.id }
        })
      );
      observation = JSON.parse(observationText);
      step++;
    }

    if (!observation.scene.ending) {
      pathTaken.push(observation.scene.id);
    }

    // Output JSON Log
    const log = {
      run_id: runId,
      path_taken: pathTaken,
      ending_reached: observation.scene.ending ? observation.scene.id : "max_steps",
      score: `${observation.score.score}/${observation.score.maxScore}`,
      feedback: {
        clarity: "Placeholder for LLM feedback on clarity",
        pacing: "Placeholder for LLM feedback on pacing",
        bugs: [],
        suggestions: []
      }
    };

    await mkdir("playtest-logs", { recursive: true });
    await writeFile(`playtest-logs/${runId}.json`, JSON.stringify(log, null, 2), "utf8");
    console.log(`Finished blind playtest run ${runId}`);
  } catch (err) {
    console.error("Playtester error:", err);
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  main();
}
