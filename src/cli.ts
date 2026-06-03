#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { choose, initialState, observe } from "./engine.js";
import { runRandomPlaytests } from "./playtest.js";
import { readSave, writeSave } from "./save.js";
import { scoreState } from "./score.js";
import { loadStory } from "./story.js";
import { renderTranscript } from "./transcript.js";
import { validateStory } from "./validate.js";

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (command === "validate") return await validate(args);
    if (command === "start") return await start(args);
    if (command === "scene") return await scene(args);
    if (command === "choose") return await chooseCommand(args);
    if (command === "state") return await state(args);
    if (command === "score") return await score(args);
    if (command === "transcript") return await transcript(args);
    if (command === "playtest") return await playtest(args);
    usage();
    process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

async function validate(args: string[]): Promise<void> {
  const storyPath = required(args[0], "story path");
  const story = await loadStory(storyPath);
  const result = validateStory(story);
  print(result, hasFlag(args, "--json"));
  if (!result.ok) process.exitCode = 1;
}

async function start(args: string[]): Promise<void> {
  const storyPath = required(args[0], "story path");
  const savePath = required(option(args, "--save"), "--save");
  const story = await loadStory(storyPath);
  const state = initialState(story);
  await writeSave(savePath, storyPath, state);
  print(observe(story, state), hasFlag(args, "--json"));
}

async function scene(args: string[]): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  print(observe(story, save.state), hasFlag(args, "--json"));
}

async function chooseCommand(args: string[]): Promise<void> {
  const choiceId = required(args[0], "choice id");
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  const next = choose(story, save.state, choiceId);
  await writeSave(savePath, save.storyPath, next);
  print(observe(story, next), hasFlag(args, "--json"));
}

async function state(args: string[]): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  print(save.state, hasFlag(args, "--json"));
}

async function score(args: string[]): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  print(scoreState(save.state, story), hasFlag(args, "--json"));
}

async function transcript(args: string[]): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const outPath = option(args, "--out");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  const rendered = renderTranscript(story, save.state);

  if (outPath) {
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, rendered, "utf8");
  } else {
    process.stdout.write(rendered);
  }
}

async function playtest(args: string[]): Promise<void> {
  const storyPath = required(args[0], "story path");
  const runs = positiveIntegerOption(args, "--runs", 20);
  const maxSteps = positiveIntegerOption(args, "--max-steps", 60);
  const strategy = option(args, "--strategy") ?? "random";
  const story = await loadStory(storyPath);
  if (strategy !== "random" && strategy !== "coverage" && strategy !== "goal") {
    throw new Error(`Unknown playtest strategy '${strategy}'`);
  }
  const result = runRandomPlaytests(story, runs, maxSteps, strategy);
  print(hasFlag(args, "--summary") ? result.summary : result, hasFlag(args, "--json"));
}

function print(value: unknown, json: boolean): void {
  if (json || typeof value !== "object") {
    console.log(JSON.stringify(value, null, 2));
  } else {
    console.dir(value, { depth: null, colors: true });
  }
}

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required ${name}`);
  return value;
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index < 0) return undefined;

  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return value;
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function positiveIntegerOption(args: string[], name: string, defaultValue: number): number {
  const raw = option(args, name);
  if (raw === undefined) return defaultValue;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`);
  }
  return parsed;
}

function usage(): void {
  console.log(`Usage:
  cyoa validate <story.yaml> [--json]
  cyoa start <story.yaml> --save <save.json> [--json]
  cyoa scene --save <save.json> [--json]
  cyoa choose <choice_id> --save <save.json> [--json]
  cyoa state --save <save.json> [--json]
  cyoa score --save <save.json> [--json]
  cyoa transcript --save <save.json> [--out <transcript.md>]
  cyoa playtest <story.yaml> [--runs 20] [--max-steps 60] [--strategy random|coverage|goal] [--summary] [--json]`);
}

await main();
