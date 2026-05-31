import { choose, initialState, observe } from "./engine.js";
import { GameState, Story } from "./schema.js";
import { scoreState } from "./score.js";

export type PlaytestStrategy = "random" | "coverage" | "goal";

export interface PlaytestRun {
  run: number;
  ended: boolean;
  finalScene: string;
  steps: number;
  path: string[];
  score: number;
  maxScore: number;
}

export interface PlaytestReport {
  summary: {
    runs: number;
    ended: number;
    unfinished: number;
    endings: Record<string, number>;
    visitedScenes: string[];
    unvisitedScenes: string[];
    bestScore: number;
    averageScore: number;
    maxScore: number;
    maxScoreRuns: number;
  };
  runs: PlaytestRun[];
}

export function runRandomPlaytests(
  story: Story,
  runs: number,
  maxSteps = 50,
  strategy: PlaytestStrategy = "random"
): PlaytestReport {
  if (strategy === "coverage") {
    const playtestRuns = runCoveragePlaytests(story, runs, maxSteps);
    return {
      summary: summarizePlaytests(story, playtestRuns),
      runs: playtestRuns
    };
  }

  if (strategy === "goal") {
    const playtestRuns = Array.from({ length: runs }, (_, index) =>
      runGoalOriented(story, index + 1, maxSteps)
    );
    return {
      summary: summarizePlaytests(story, playtestRuns),
      runs: playtestRuns
    };
  }

  const playtestRuns = Array.from({ length: runs }, (_, index) =>
    runOne(story, index + 1, maxSteps)
  );
  return {
    summary: summarizePlaytests(story, playtestRuns),
    runs: playtestRuns
  };
}

function runCoveragePlaytests(story: Story, maxRuns: number, maxSteps: number): PlaytestRun[] {
  const queue: Array<{ state: GameState; path: string[]; steps: number }> = [
    { state: initialState(story), path: [story.start], steps: 0 }
  ];
  const seen = new Set<string>();
  const expandedScenes = new Set<string>();
  const reportedScenes = new Set<string>();
  const runs: PlaytestRun[] = [];

  while (
    queue.length > 0 &&
    (runs.length < maxRuns || expandedScenes.size < Object.keys(story.scenes).length)
  ) {
    const current = queue.shift()!;
    const signature = stateSignature(current.state);
    if (seen.has(signature)) continue;
    seen.add(signature);

    const observation = observe(story, current.state);
    expandedScenes.add(observation.scene.id);
    if (!reportedScenes.has(observation.scene.id) && !observation.scene.ending) {
      reportedScenes.add(observation.scene.id);
      runs.push({
        run: runs.length + 1,
        ended: false,
        finalScene: observation.scene.id,
        steps: current.steps,
        path: current.path,
        ...scoreOnly(current.state)
      });
    }

    if (observation.scene.ending || observation.choices.length === 0 || current.steps >= maxSteps) {
      reportedScenes.add(observation.scene.id);
      runs.push({
        run: runs.length + 1,
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: current.steps,
        path: current.path,
        ...scoreOnly(current.state)
      });
      continue;
    }

    const nextEntries = observation.choices.map((choice) => {
      const next = choose(story, current.state, choice.id);
      const destination = story.scenes[next.currentScene];
      let score = 0;
      if (!destination.ending) score += 20;
      if (!expandedScenes.has(next.currentScene)) score += 40;
      if (!current.path.includes(next.currentScene)) score += 10;
      score += countNewItems(current.state.inventory, next.inventory) * 8;
      score += countNewFlags(current.state.flags, next.flags) * 6;
      if (choice.id.includes("token") || choice.id.includes("fuse") || choice.id.includes("badge"))
        score += 5;
      if (choice.id.includes("force") || choice.id.includes("flee") || choice.id.includes("stare"))
        score -= 8;
      return {
        score,
        state: next,
        path: [...current.path, choice.id, next.currentScene],
        steps: current.steps + 1
      };
    });

    nextEntries.sort((left, right) => right.score - left.score);

    for (const entry of nextEntries.reverse()) {
      queue.unshift(entry);
    }
  }

  return runs;
}

function stateSignature(state: GameState): string {
  return JSON.stringify({
    scene: state.currentScene,
    flags: Object.keys(state.flags)
      .filter((key) => state.flags[key])
      .sort(),
    inventory: [...state.inventory].sort()
  });
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
  const maxScore = runs[0]?.maxScore ?? scoreState(initialState(story)).maxScore;
  const bestScore = runs.reduce((best, run) => Math.max(best, run.score), 0);
  const averageScore =
    runs.length > 0
      ? Number((runs.reduce((total, run) => total + run.score, 0) / runs.length).toFixed(2))
      : 0;

  return {
    runs: runs.length,
    ended: runs.filter((run) => run.ended).length,
    unfinished: runs.filter((run) => !run.ended).length,
    endings,
    visitedScenes,
    unvisitedScenes,
    bestScore,
    averageScore,
    maxScore,
    maxScoreRuns: runs.filter((run) => run.score === maxScore).length
  };
}

function runOne(story: Story, run: number, maxSteps: number): PlaytestRun {
  let state: GameState = initialState(story);
  const path: string[] = [state.currentScene];
  const random = seededRandom(run);

  for (let step = 0; step < maxSteps; step += 1) {
    const observation = observe(story, state);

    if (observation.scene.ending || observation.choices.length === 0) {
      return {
        run,
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: step,
        path,
        ...scoreOnly(state)
      };
    }

    const choice = observation.choices[Math.floor(random() * observation.choices.length)];

    path.push(choice.id);
    state = choose(story, state, choice.id);
    path.push(state.currentScene);
  }

  return {
    run,
    ended: false,
    finalScene: state.currentScene,
    steps: maxSteps,
    path,
    ...scoreOnly(state)
  };
}

function runGoalOriented(story: Story, run: number, maxSteps: number): PlaytestRun {
  let state: GameState = initialState(story);
  const path: string[] = [state.currentScene];
  const random = seededRandom(run);
  const seen = new Map<string, number>();

  for (let step = 0; step < maxSteps; step += 1) {
    const observation = observe(story, state);

    if (observation.scene.ending || observation.choices.length === 0) {
      return {
        run,
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: step,
        path,
        ...scoreOnly(state)
      };
    }

    const currentScore = scoreState(state).score;
    const ranked = observation.choices
      .map((choice) => {
        const next = choose(story, state, choice.id);
        const nextObservation = observe(story, next);
        const nextScore = scoreState(next).score;
        const signature = stateSignature(next);
        const visits = seen.get(signature) ?? 0;
        return {
          choice,
          next,
          rank:
            (nextScore - currentScore) * 100 +
            scoreDestination(nextObservation.scene.id) +
            scoreChoiceId(choice.id) +
            countNewItems(state.inventory, next.inventory) * 30 +
            countNewFlags(state.flags, next.flags) * 20 -
            visits * 150 +
            random()
        };
      })
      .sort((left, right) => right.rank - left.rank);

    const selected = ranked[0];
    seen.set(stateSignature(selected.next), (seen.get(stateSignature(selected.next)) ?? 0) + 1);
    path.push(selected.choice.id);
    state = selected.next;
    path.push(state.currentScene);
  }

  return {
    run,
    ended: false,
    finalScene: state.currentScene,
    steps: maxSteps,
    path,
    ...scoreOnly(state)
  };
}

function scoreDestination(sceneId: string): number {
  if (sceneId === "true_ending") return 1000;
  if (sceneId === "good_ending") return 200;
  if (sceneId === "escape_ending") return 50;
  if (sceneId === "bad_ending" || sceneId === "lost_ending") return -400;
  return 0;
}

function scoreChoiceId(choiceId: string): number {
  if (choiceId.includes("pull_release")) return 500;
  if (choiceId.includes("mark_mara_clear")) return 250;
  if (choiceId.includes("use_token")) return 180;
  if (choiceId.includes("install_fuse")) return 140;
  if (choiceId.includes("note_radio")) return 120;
  if (choiceId.includes("take") || choiceId.includes("read") || choiceId.includes("inspect")) {
    return 80;
  }
  if (choiceId.includes("search") || choiceId.includes("tune")) return 60;
  if (choiceId.includes("force") || choiceId.includes("stare")) return -200;
  if (choiceId.includes("flee")) return -100;
  return 0;
}

function scoreOnly(state: GameState): { score: number; maxScore: number } {
  const score = scoreState(state);
  return { score: score.score, maxScore: score.maxScore };
}

function countNewItems(before: string[], after: string[]): number {
  const beforeSet = new Set(before);
  return after.filter((item) => !beforeSet.has(item)).length;
}

function countNewFlags(before: Record<string, boolean>, after: Record<string, boolean>): number {
  return Object.entries(after).filter(([key, value]) => value === true && before[key] !== true)
    .length;
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
