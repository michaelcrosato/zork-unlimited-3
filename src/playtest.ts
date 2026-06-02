import { choose, initialState, observe } from "./engine.js";
import { Condition, GameState, Story } from "./schema.js";
import { scoreState } from "./score.js";

export type PlaytestStrategy = "random" | "coverage" | "goal";

export interface PlaytestRun {
  run: number;
  status: "ending" | "frontier" | "dead_end" | "max_steps";
  ended: boolean;
  finalScene: string;
  steps: number;
  path: string[];
  readablePath: string[];
  score: number;
  maxScore: number;
}

export interface PlaytestReport {
  summary: {
    runs: number;
    ended: number;
    unfinished: number;
    frontierSamples: number;
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
  maxSteps = 60,
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
  const initial = initialState(story);
  const queue: Array<{ state: GameState; path: string[]; steps: number }> = [
    { state: initial, path: [story.start], steps: 0 }
  ];
  const seen = new Set<string>();
  const relevantFlags = collectRequiredFlags(story);
  const queued = new Set<string>([stateSignature(initial, relevantFlags)]);
  const expandedScenes = new Set<string>();
  const reportedScenes = new Set<string>();
  const runs: PlaytestRun[] = [];
  const sceneCount = Object.keys(story.scenes).length;

  while (queue.length > 0 && (runs.length < maxRuns || reportedScenes.size < sceneCount)) {
    const current = queue.pop()!;
    const signature = stateSignature(current.state, relevantFlags);
    queued.delete(signature);
    if (seen.has(signature)) continue;
    seen.add(signature);

    const observation = observe(story, current.state);
    expandedScenes.add(observation.scene.id);
    if (!reportedScenes.has(observation.scene.id) && !observation.scene.ending) {
      reportedScenes.add(observation.scene.id);
      runs.push({
        run: runs.length + 1,
        status: "frontier",
        ended: false,
        finalScene: observation.scene.id,
        steps: current.steps,
        path: current.path,
        readablePath: describePath(story, current.path),
        ...scoreOnly(current.state)
      });
    }

    if (observation.scene.ending || observation.choices.length === 0 || current.steps >= maxSteps) {
      reportedScenes.add(observation.scene.id);
      runs.push({
        run: runs.length + 1,
        status: classifyStoppedRun(observation.scene.ending, observation.choices.length, true),
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: current.steps,
        path: current.path,
        readablePath: describePath(story, current.path),
        ...scoreOnly(current.state)
      });
      continue;
    }

    const nextEntries = observation.choices.map((choice) => {
      const next = choose(story, current.state, choice.id);
      const destination = story.scenes[next.currentScene];
      const path = [...current.path, choice.id, next.currentScene];
      const steps = current.steps + 1;

      if (!reportedScenes.has(next.currentScene)) {
        const nextObservation = observe(story, next);
        reportedScenes.add(next.currentScene);
        runs.push({
          run: runs.length + 1,
          status: classifyStoppedRun(
            nextObservation.scene.ending,
            nextObservation.choices.length,
            false
          ),
          ended: nextObservation.scene.ending,
          finalScene: nextObservation.scene.id,
          steps,
          path,
          readablePath: describePath(story, path),
          ...scoreOnly(next)
        });
      }

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
        path,
        steps
      };
    });

    nextEntries.sort((left, right) => left.score - right.score);

    for (const entry of nextEntries) {
      const nextSignature = stateSignature(entry.state, relevantFlags);
      if (seen.has(nextSignature) || queued.has(nextSignature)) continue;
      queued.add(nextSignature);
      queue.push(entry);
    }
  }

  return runs;
}

function stateSignature(state: GameState, relevantFlags?: Set<string>): string {
  return JSON.stringify({
    scene: state.currentScene,
    flags: Object.keys(state.flags)
      .filter((key) => state.flags[key] && (!relevantFlags || relevantFlags.has(key)))
      .sort(),
    inventory: [...state.inventory].sort()
  });
}

function collectRequiredFlags(story: Story): Set<string> {
  const flags = new Set<string>();

  for (const scene of Object.values(story.scenes)) {
    for (const choice of scene.choices) {
      collectConditionFlags(choice.requires, flags);
    }
  }

  return flags;
}

function collectConditionFlags(condition: Condition | undefined, flags: Set<string>): void {
  if (!condition) return;
  if ("flag" in condition) flags.add(condition.flag);
  if ("all" in condition) condition.all.forEach((nested) => collectConditionFlags(nested, flags));
  if ("any" in condition) condition.any.forEach((nested) => collectConditionFlags(nested, flags));
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
    unfinished: runs.filter((run) => run.status === "dead_end" || run.status === "max_steps")
      .length,
    frontierSamples: runs.filter((run) => run.status === "frontier").length,
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
        status: classifyStoppedRun(observation.scene.ending, observation.choices.length, false),
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: step,
        path,
        readablePath: describePath(story, path),
        ...scoreOnly(state)
      };
    }

    const choice = observation.choices[Math.floor(random() * observation.choices.length)];

    path.push(choice.id);
    state = choose(story, state, choice.id);
    path.push(state.currentScene);
  }

  const observation = observe(story, state);
  return {
    run,
    status: classifyStoppedRun(observation.scene.ending, observation.choices.length, true),
    ended: observation.scene.ending,
    finalScene: observation.scene.id,
    steps: maxSteps,
    path,
    readablePath: describePath(story, path),
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
        status: classifyStoppedRun(observation.scene.ending, observation.choices.length, false),
        ended: observation.scene.ending,
        finalScene: observation.scene.id,
        steps: step,
        path,
        readablePath: describePath(story, path),
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

  const observation = observe(story, state);
  return {
    run,
    status: classifyStoppedRun(observation.scene.ending, observation.choices.length, true),
    ended: observation.scene.ending,
    finalScene: observation.scene.id,
    steps: maxSteps,
    path,
    readablePath: describePath(story, path),
    ...scoreOnly(state)
  };
}

function describePath(story: Story, path: string[]): string[] {
  return path.map((entry, index) => {
    if (story.scenes[entry]) return entry;

    const fromSceneId = path[index - 1];
    const fromScene = fromSceneId ? story.scenes[fromSceneId] : undefined;
    const choice = fromScene?.choices.find((candidate) => candidate.id === entry);
    if (!choice) return entry;

    return `${entry}: ${choice.label}`;
  });
}

function scoreDestination(sceneId: string): number {
  if (
    sceneId === "true_ending" ||
    sceneId === "mara_handoff_true_ending" ||
    sceneId === "passenger_true_ending" ||
    sceneId === "passenger_answered_true_ending" ||
    sceneId === "passenger_answered_boarding_true_ending" ||
    sceneId === "passenger_counted_true_ending" ||
    sceneId === "passenger_reviewed_count_true_ending" ||
    sceneId === "passenger_manifest_true_ending" ||
    sceneId === "passenger_manifest_handoff_true_ending" ||
    sceneId === "passenger_manifest_thumbprint_true_ending" ||
    sceneId === "passenger_answered_handoff_true_ending" ||
    sceneId === "passenger_echoed_true_ending" ||
    sceneId === "passenger_helped_true_ending" ||
    sceneId === "passenger_roll_call_true_ending" ||
    sceneId === "passenger_lunch_tin_true_ending" ||
    sceneId === "passenger_conductor_true_ending" ||
    sceneId === "passenger_conductor_transfer_true_ending" ||
    sceneId === "passenger_keepsake_true_ending" ||
    sceneId === "passenger_newspaper_true_ending" ||
    sceneId === "passenger_mitten_true_ending"
  ) {
    return 1000;
  }
  if (sceneId === "good_ending") return 200;
  if (sceneId === "escape_ending" || sceneId === "warned_escape_ending") return 50;
  if (sceneId === "bad_ending" || sceneId === "lost_ending") return -400;
  return 0;
}

function classifyStoppedRun(
  ended: boolean,
  choiceCount: number,
  hitStepLimit: boolean
): PlaytestRun["status"] {
  if (ended) return "ending";
  if (choiceCount === 0) return "dead_end";
  return hitStepLimit ? "max_steps" : "frontier";
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
