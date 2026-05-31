#!/usr/bin/env node
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { choose, initialState, observe } from "./engine.js";
import { runRandomPlaytests } from "./playtest.js";
import { readSave, writeSave } from "./save.js";
import { scoreState } from "./score.js";
import { loadStory } from "./story.js";
import { renderTranscript } from "./transcript.js";
import { validateStory } from "./validate.js";

const DEFAULT_STORY = "stories/demo.yaml";
const DEFAULT_SAVE = "saves/mcp-run.json";

const server = new McpServer({
  name: "zork-unlimited-cyoa",
  version: "0.1.0"
});

server.registerTool(
  "list_stories",
  {
    title: "List Stories",
    description: "List YAML story files available in the local stories directory.",
    inputSchema: z.object({
      directory: z.string().default("stories")
    })
  },
  async ({ directory }) => {
    const entries = await readdir(directory, { withFileTypes: true });
    const stories = entries
      .filter((entry) => entry.isFile() && /\.(ya?ml)$/i.test(entry.name))
      .map((entry) => join(directory, entry.name))
      .sort();

    return jsonResult({ stories });
  }
);

server.registerTool(
  "validate_story",
  {
    title: "Validate Story",
    description:
      "Validate a story graph for missing links, duplicate choices, dead ends, and reachability.",
    inputSchema: z.object({
      storyPath: z.string().default(DEFAULT_STORY)
    })
  },
  async ({ storyPath }) => {
    const story = await loadStory(storyPath);
    return jsonResult(validateStory(story));
  }
);

server.registerTool(
  "start_game",
  {
    title: "Start Game",
    description: "Start a new game from a story and write the save file.",
    inputSchema: z.object({
      storyPath: z.string().default(DEFAULT_STORY),
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ storyPath, savePath }) => {
    const story = await loadStory(storyPath);
    const state = initialState(story);
    await writeSave(savePath, storyPath, state);
    return jsonResult(observe(story, state));
  }
);

server.registerTool(
  "get_scene",
  {
    title: "Get Scene",
    description: "Read the current scene, visible choices, flags, and inventory from a save file.",
    inputSchema: z.object({
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ savePath }) => {
    const save = await readSave(savePath);
    const story = await loadStory(save.storyPath);
    return jsonResult(observe(story, save.state));
  }
);

server.registerTool(
  "choose_option",
  {
    title: "Choose Option",
    description:
      "Apply a legal choice id to the current save and return the next scene observation.",
    inputSchema: z.object({
      choiceId: z.string(),
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ choiceId, savePath }) => {
    const save = await readSave(savePath);
    const story = await loadStory(save.storyPath);
    const next = choose(story, save.state, choiceId);
    await writeSave(savePath, save.storyPath, next);
    return jsonResult(observe(story, next));
  }
);

server.registerTool(
  "get_state",
  {
    title: "Get State",
    description: "Read the raw game state from a save file.",
    inputSchema: z.object({
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ savePath }) => {
    const save = await readSave(savePath);
    return jsonResult(save.state);
  }
);

server.registerTool(
  "get_score",
  {
    title: "Get Score",
    description: "Read the current score, max score, and earned puzzle achievements.",
    inputSchema: z.object({
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ savePath }) => {
    const save = await readSave(savePath);
    return jsonResult(scoreState(save.state));
  }
);

server.registerTool(
  "get_transcript",
  {
    title: "Get Transcript",
    description: "Render the current playthrough as Markdown for review and feedback.",
    inputSchema: z.object({
      savePath: z.string().default(DEFAULT_SAVE)
    })
  },
  async ({ savePath }) => {
    const save = await readSave(savePath);
    const story = await loadStory(save.storyPath);
    return {
      content: [{ type: "text" as const, text: renderTranscript(story, save.state) }]
    };
  }
);

server.registerTool(
  "run_playtest",
  {
    title: "Run Playtest",
    description: "Run deterministic seeded random playthroughs and return path coverage samples.",
    inputSchema: z.object({
      storyPath: z.string().default(DEFAULT_STORY),
      runs: z.number().int().positive().max(1000).default(20),
      maxSteps: z.number().int().positive().max(500).default(50),
      strategy: z.enum(["random", "coverage"]).default("random"),
      includeRuns: z.boolean().default(false)
    })
  },
  async ({ storyPath, runs, maxSteps, strategy, includeRuns }) => {
    const story = await loadStory(storyPath);
    const report = runRandomPlaytests(story, runs, maxSteps, strategy);
    return jsonResult(includeRuns ? report : { summary: report.summary });
  }
);

function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

await server.connect(new StdioServerTransport());
