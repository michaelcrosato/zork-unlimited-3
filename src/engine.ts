import {
  Choice,
  Condition,
  Effects,
  EndingType,
  GameState,
  RouteImportance,
  Story
} from "./schema.js";
import { scoreState } from "./score.js";

export interface Observation {
  story: {
    id: string;
    title: string;
  };
  scene: {
    id: string;
    text: string;
    ending: boolean;
    routeImportance: RouteImportance;
    endingType?: EndingType;
    endingGroup?: string;
    endingFamily?: string;
  };
  choices: Array<{
    id: string;
    label: string;
    to: string;
  }>;
  state: {
    flags: Record<string, boolean>;
    inventory: string[];
  };
  score: {
    score: number;
    delta: number;
    soundCue?: "score_award";
    recentAwards: Array<{
      id: string;
      label: string;
      points: number;
      earned: boolean;
    }>;
    awards: Array<{
      id: string;
      label: string;
      points: number;
      earned: boolean;
    }>;
  };
  objectives: string[];
}

export interface PlayerObservation {
  story: {
    title: string;
  };
  scene: {
    text: string;
    ending: boolean;
    routeImportance: RouteImportance;
  };
  choices: Array<{
    index: number;
    label: string;
  }>;
  score: {
    score: number;
    delta: number;
    soundCue?: "score_award";
    recentAwards: Array<{
      label: string;
      points: number;
    }>;
  };
  objectives?: string[];
}

export interface PlayerObservationOptions {
  includeObjectives?: boolean;
}

export function initialState(story: Story): GameState {
  return {
    storyId: story.id,
    currentScene: story.start,
    flags: {},
    inventory: [],
    history: [{ scene: story.start }]
  };
}

export function observe(story: Story, state: GameState): Observation {
  const scene = story.scenes[state.currentScene];
  if (!scene) {
    throw new Error(`Current scene does not exist: ${state.currentScene}`);
  }
  const score = scoreState(state, story);
  const recentAwards = recentScoreAwards(story, state, score.awards);
  const delta = recentAwards.reduce((total, award) => total + award.points, 0);

  return {
    story: { id: story.id, title: story.title },
    scene: {
      id: state.currentScene,
      text: scene.text,
      ending: scene.ending,
      routeImportance: scene.routeImportance ?? "optional",
      endingType: scene.endingType,
      endingGroup: scene.endingGroup,
      endingFamily: scene.endingFamily
    },
    choices: scene.choices
      .filter((choice) => canChoose(state, choice))
      .map((choice) => ({
        id: choice.id,
        label: choice.label,
        to: choice.to
      })),
    state: {
      flags: { ...state.flags },
      inventory: [...state.inventory]
    },
    score: {
      ...score,
      delta,
      soundCue: delta > 0 ? "score_award" : undefined,
      recentAwards
    },
    objectives: scene.ending ? [] : getObjectives(story, state)
  };
}

export function observePlayer(
  story: Story,
  state: GameState,
  options: PlayerObservationOptions = {}
): PlayerObservation {
  const raw = observe(story, state);
  const player: PlayerObservation = {
    story: { title: raw.story.title },
    scene: {
      text: raw.scene.text,
      ending: raw.scene.ending,
      routeImportance: raw.scene.routeImportance
    },
    choices: raw.choices.map((choice, index) => ({
      index,
      label: choice.label
    })),
    score: {
      score: raw.score.score,
      delta: raw.score.delta,
      soundCue: raw.score.soundCue,
      recentAwards: raw.score.recentAwards.map((award) => ({
        label: award.label,
        points: award.points
      }))
    }
  };

  if (options.includeObjectives) {
    player.objectives = [...raw.objectives];
  }

  return player;
}

export function choose(story: Story, state: GameState, choiceId: string): GameState {
  const scene = story.scenes[state.currentScene];
  if (!scene) {
    throw new Error(`Current scene does not exist: ${state.currentScene}`);
  }

  const choice = scene.choices.find((candidate) => candidate.id === choiceId);
  if (!choice) {
    throw new Error(`Choice '${choiceId}' is not available in scene '${state.currentScene}'`);
  }

  if (!canChoose(state, choice)) {
    throw new Error(`Choice '${choiceId}' requirements are not met`);
  }

  if (!story.scenes[choice.to]) {
    throw new Error(`Choice '${choiceId}' points to missing scene '${choice.to}'`);
  }

  const next = applyEffects(state, choice.effects);
  next.currentScene = choice.to;
  next.history = [
    ...state.history,
    { scene: state.currentScene, choice: choice.id, label: choice.label },
    { scene: choice.to }
  ];
  return next;
}

export function canChoose(state: GameState, choice: Choice): boolean {
  return choice.requires ? evaluateCondition(state, choice.requires) : true;
}

export function evaluateCondition(state: GameState, condition: Condition): boolean {
  if ("flag" in condition) return state.flags[condition.flag] === true;
  if ("notFlag" in condition) return state.flags[condition.notFlag] !== true;
  if ("item" in condition) return state.inventory.includes(condition.item);
  if ("notItem" in condition) return !state.inventory.includes(condition.notItem);
  if ("all" in condition) return condition.all.every((nested) => evaluateCondition(state, nested));
  if ("any" in condition) return condition.any.some((nested) => evaluateCondition(state, nested));
  return false;
}

export function applyEffects(state: GameState, effects: Effects | undefined): GameState {
  const next: GameState = {
    ...state,
    flags: { ...state.flags },
    inventory: [...state.inventory],
    history: [...state.history]
  };

  if (!effects) return next;

  for (const [key, value] of Object.entries(effects.set ?? {})) {
    next.flags[key] = value;
  }

  for (const item of asArray(effects.addItem)) {
    if (!next.inventory.includes(item)) next.inventory.push(item);
  }

  for (const item of asArray(effects.removeItem)) {
    next.inventory = next.inventory.filter((candidate) => candidate !== item);
  }

  next.inventory.sort();
  return next;
}

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function recentScoreAwards(
  story: Story,
  state: GameState,
  awards: Observation["score"]["awards"]
): Observation["score"]["recentAwards"] {
  const choices = state.history
    .filter((entry) => entry.choice)
    .map((entry) => entry.choice)
    .filter((choice): choice is string => typeof choice === "string");
  if (choices.length === 0) return [];

  try {
    const previous = choices.slice(0, -1).reduce((current, choiceId) => {
      return choose(story, current, choiceId);
    }, initialState(story));
    const previousAwardIds = new Set(scoreState(previous, story).awards.map((award) => award.id));
    return awards.filter((award) => !previousAwardIds.has(award.id));
  } catch {
    return [];
  }
}

export function getObjectives(story: Story, state: GameState): string[] {
  return (story.objectives ?? [])
    .filter((objective) => evaluateCondition(state, objective.requires))
    .map((objective) => objective.text)
    .slice(0, 4);
}
