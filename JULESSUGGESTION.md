# Suggestion: MCP Server Blind Test Script

I wrote a short script that acts as an autonomous subagent. It connects to the `npm run mcp` server over `stdio` and blindly plays the game for 5 steps by taking the first available choice.

This proves that the MCP server exposes the game logic cleanly to subagents that don't know the game structure.

If you find this useful to include in the repository as a test/example, you can add the following code as `src/mcp-tester.ts` (or anywhere you see fit).

```typescript
import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("Starting MCP Server...");
  const serverProcess = spawn("npm", ["run", "mcp"], {
    stdio: ["pipe", "pipe", "inherit"],
    shell: true
  });

  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "mcp"]
  });

  const client = new Client({ name: "mcp-tester", version: "1.0.0" }, { capabilities: {} });

  await client.connect(transport);
  console.log("Connected to MCP server.");

  const saveFile = "saves/mcp_blind_test.json";
  const storyFile = "stories/demo.yaml";

  console.log(`\n--- Starting Game (${storyFile}) ---`);
  let result = await client.callTool({
    name: "start_game",
    arguments: { storyPath: storyFile, savePath: saveFile }
  });

  if (result.isError) {
    console.error("Failed to start game:", result);
    process.exit(1);
  }

  let state = JSON.parse(result.content[0].text);
  console.log(`\nScene: ${state.scene.id}`);
  console.log(`${state.scene.text}`);

  for (let step = 1; step <= 5; step++) {
    if (state.scene.ending) {
      console.log("Reached an ending!");
      break;
    }

    if (!state.choices || state.choices.length === 0) {
      console.log("No choices available.");
      break;
    }

    // Blindly pick the first choice
    const choice = state.choices[0];
    console.log(`\n--- Step ${step}: Blindly choosing '${choice.id}' ---`);

    result = await client.callTool({
      name: "choose_option",
      arguments: { savePath: saveFile, choiceId: choice.id }
    });

    if (result.isError) {
      console.error("Failed to choose option:", result);
      break;
    }

    state = JSON.parse(result.content[0].text);
    console.log(`\nScene: ${state.scene.id}`);
    console.log(`${state.scene.text}`);
  }

  console.log("\n--- Playtest Finished. Fetching Transcript ---");
  const transcriptResult = await client.callTool({
    name: "get_transcript",
    arguments: { savePath: saveFile }
  });
  console.log("\n" + transcriptResult.content[0].text);

  await transport.close();
  serverProcess.kill();
}

main().catch(console.error);
```
