#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { inspect } from "node:util";
import { fileURLToPath } from "node:url";
import { choose, initialState, observe } from "./engine.js";
import { runRandomPlaytests } from "./playtest.js";
import { readSave, writeSave } from "./save.js";
import { scoreState } from "./score.js";
import { loadStory } from "./story.js";
import { renderTranscript } from "./transcript.js";
import { validateStory } from "./validate.js";

export interface CliIo {
  stdout: (text: string) => void;
  stderr: (text: string) => void;
}

const processIo: CliIo = {
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text)
};

async function main(): Promise<void> {
  process.exitCode = await runCliCommand(process.argv.slice(2));
}

export async function runCliCommand(args: string[], io: CliIo = processIo): Promise<number> {
  const [command, ...commandArgs] = args;

  try {
    if (command === "validate") {
      await validate(commandArgs, io);
      return 0;
    }
    if (command === "start") {
      await start(commandArgs, io);
      return 0;
    }
    if (command === "scene") {
      await scene(commandArgs, io);
      return 0;
    }
    if (command === "choose") {
      await chooseCommand(commandArgs, io);
      return 0;
    }
    if (command === "state") {
      await state(commandArgs, io);
      return 0;
    }
    if (command === "score") {
      await score(commandArgs, io);
      return 0;
    }
    if (command === "transcript") {
      await transcript(commandArgs, io);
      return 0;
    }
    if (command === "playtest") {
      await playtest(commandArgs, io);
      return 0;
    }
    usage(io);
    return 1;
  } catch (error) {
    io.stderr(`${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

async function validate(args: string[], io: CliIo): Promise<void> {
  const storyPath = required(args[0], "story path");
  const story = await loadStory(storyPath);
  const result = validateStory(story);
  print(result, hasFlag(args, "--json"), io);
  if (!result.ok) throw new Error("Story validation failed");
}

async function start(args: string[], io: CliIo): Promise<void> {
  const storyPath = required(args[0], "story path");
  const savePath = required(option(args, "--save"), "--save");
  const story = await loadStory(storyPath);
  const state = initialState(story);
  await writeSave(savePath, storyPath, state);
  print(observe(story, state), hasFlag(args, "--json"), io);
}

async function scene(args: string[], io: CliIo): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  print(observe(story, save.state), hasFlag(args, "--json"), io);
}

async function chooseCommand(args: string[], io: CliIo): Promise<void> {
  const choiceId = required(args[0], "choice id");
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  const next = choose(story, save.state, choiceId);
  await writeSave(savePath, save.storyPath, next);
  print(observe(story, next), hasFlag(args, "--json"), io);
}

async function state(args: string[], io: CliIo): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  print(save.state, hasFlag(args, "--json"), io);
}

async function score(args: string[], io: CliIo): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  print(scoreState(save.state, story), hasFlag(args, "--json"), io);
}

async function transcript(args: string[], io: CliIo): Promise<void> {
  const savePath = required(option(args, "--save"), "--save");
  const outPath = option(args, "--out");
  const save = await readSave(savePath);
  const story = await loadStory(save.storyPath);
  const rendered = renderTranscript(story, save.state);

  if (outPath) {
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, rendered, "utf8");
  } else {
    io.stdout(rendered);
  }
}

async function playtest(args: string[], io: CliIo): Promise<void> {
  const storyPath = required(args[0], "story path");
  const runs = positiveIntegerOption(args, "--runs", 20);
  const maxSteps = positiveIntegerOption(args, "--max-steps", 60);
  const strategy = option(args, "--strategy") ?? "random";
  const story = await loadStory(storyPath);
  if (strategy !== "random" && strategy !== "coverage" && strategy !== "goal") {
    throw new Error(`Unknown playtest strategy '${strategy}'`);
  }
  const result = runRandomPlaytests(story, runs, maxSteps, strategy);
  print(hasFlag(args, "--summary") ? result.summary : result, hasFlag(args, "--json"), io);
}

function print(value: unknown, json: boolean, io: CliIo): void {
  if (json || typeof value !== "object") {
    io.stdout(`${JSON.stringify(value, null, 2)}\n`);
  } else {
    io.stdout(`${inspect(value, { depth: null, colors: true })}\n`);
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

function usage(io: CliIo): void {
  io.stdout(`Usage:
  cyoa validate <story.yaml> [--json]
  cyoa start <story.yaml> --save <save.json> [--json]
  cyoa scene --save <save.json> [--json]
  cyoa choose <choice_id> --save <save.json> [--json]
  cyoa state --save <save.json> [--json]
  cyoa score --save <save.json> [--json]
  cyoa transcript --save <save.json> [--out <transcript.md>]
  cyoa playtest <story.yaml> [--runs 20] [--max-steps 60] [--strategy random|coverage|goal] [--summary] [--json]`);
}

function isCliEntryPoint(): boolean {
  return (
    process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])
  );
}

if (isCliEntryPoint()) {
  await main();
}
