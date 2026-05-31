import { choose, initialState, observe } from "./engine.js";
import { Choice, GameState, Story } from "./schema.js";

export type PlaytestStrategy = "random" | "coverage";

export interface PlaytestRun {
  run: number;
  ended: boolean;
  finalScene: string;
  steps: number;
  path: string[];
}

export interface PlaytestReport {
  summary: {
    runs: number;
    ended: number;
    unfinished: number;
    endings: Record<string, number>;
    visitedScenes: string[];
    unvisitedScenes: string[];
  };
  runs: PlaytestRun[];
}

export function runRandomPlaytests(
  story: Story,
  runs: number,
  maxSteps = 50,
  strategy: PlaytestStrategy = "random"
): PlaytestReport {
  const coverageMemory = {
    scenes: new Set<string>(),
    choices: new Set<string>()
  };
  const playtestRuns = Array.from({ length: runs }, (_, index) =>
    runOne(story, index + 1, maxSteps, strategy, coverageMemory)
  );
  return {
    summary: summarizePlaytests(story, playtestRuns),
    runs: playtestRuns
  };
}

export function summarizePlaytests(story: Story, runs: PlaytestRun[]): PlaytestReport["summary"] {
  const endings: Record<string, number> = {};
  const visited = new Set<string>();

  for (const run of runs) {
    for (const entry of run.path) {
      if (story.scenes[entry]) visited.add(entry);
    }

    if (run.ended) {
      endings[run.finalScene] = (endings[run.finalScene] ?? 0) + 1;
    }
  }

  const visitedScenes = [...visited].sort();
  const unvisitedScenes = Object.keys(story.scenes)
    .filter((sceneId) => !visited.has(sceneId))
    .sort();

  return {
    runs: runs.length,
    ended: runs.filter((run) => run.ended).length,
    unfinished: runs.filter((run) => !run.ended).length,
    endings,
    visitedScenes,
    unvisitedScenes
  };
}

function runOne(
  story: Story,
  run: number,
  maxSteps: number,
  strategy: PlaytestStrategy,
  coverageMemory: { scenes: Set<string>; choices: Set<string> }
): PlaytestRun {
  let state: GameState = initialState(story);
  const path: string[] = [state.currentScene];
  const random = seededRandom(run);
  const localVisits = new Map<string, number>();

  for (let step = 0; step < maxSteps; step += 1) {
    const observation = observe(story, state);
    coverageMemory.scenes.add(observation.scene.id);
    localVisits.set(observation.scene.id, (localVisits.get(observation.scene.id) ?? 0) + 1);

    if (observation.scene.ending || observation.choices.length === 0) {
      return {
        run,
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: step,
        path
      };
    }

    const choice =
      strategy === "coverage"
        ? pickCoverageChoice(story, state, observation.scene.id, random, coverageMemory, localVisits)
        : observation.choices[Math.floor(random() * observation.choices.length)];

    coverageMemory.choices.add(`${observation.scene.id}.${choice.id}`);
    path.push(choice.id);
    state = choose(story, state, choice.id);
    path.push(state.currentScene);
  }

  return {
    run,
    ended: false,
    finalScene: state.currentScene,
    steps: maxSteps,
    path
  };
}

function pickCoverageChoice(
  story: Story,
  state: GameState,
  sceneId: string,
  random: () => number,
  coverageMemory: { scenes: Set<string>; choices: Set<string> },
  localVisits: Map<string, number>
): Choice {
  const choices = story.scenes[sceneId].choices.filter((choice) => {
    try {
      choose(story, state, choice.id);
      return true;
    } catch {
      return false;
    }
  });

  const scored = choices.map((choice) => {
    const next = choose(story, state, choice.id);
    const destination = story.scenes[choice.to];
    const choiceKey = `${sceneId}.${choice.id}`;
    let score = random();

    if (!coverageMemory.choices.has(choiceKey)) score += 8;
    if (!coverageMemory.scenes.has(choice.to)) score += 20;
    if ((localVisits.get(choice.to) ?? 0) === 0) score += 4;
    if (destination?.ending && !coverageMemory.scenes.has(choice.to)) score += 12;
    score += countNewItems(state.inventory, next.inventory) * 5;
    score += countNewFlags(state.flags, next.flags) * 4;
    score -= (localVisits.get(choice.to) ?? 0) * 3;

    return { choice, score };
  });

  scored.sort((left, right) => right.score - left.score);
  return scored[0].choice;
}

function countNewItems(before: string[], after: string[]): number {
  const beforeSet = new Set(before);
  return after.filter((item) => !beforeSet.has(item)).length;
}

function countNewFlags(before: Record<string, boolean>, after: Record<string, boolean>): number {
  return Object.entries(after).filter(([key, value]) => value === true && before[key] !== true).length;
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
