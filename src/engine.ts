import { Choice, Condition, Effects, GameState, Story } from "./schema.js";
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
    maxScore: number;
  };
  objectives: string[];
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

  return {
    story: { id: story.id, title: story.title },
    scene: {
      id: state.currentScene,
      text: scene.text,
      ending: scene.ending
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
    score: scoreState(state),
    objectives: getObjectives(state)
  };
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

function getObjectives(state: GameState): string[] {
  const objectives: string[] = [];
  const has = (item: string) => state.inventory.includes(item);
  const flag = (name: string) => state.flags[name] === true;

  if (!has("lantern") && !flag("lights_on")) {
    objectives.push("Find a reliable way to see in the underpass.");
  }

  if (!flag("knows_platform")) {
    objectives.push("Find out where the chalk arrows and old line are leading.");
  }

  if (flag("knows_platform") && !flag("knows_release")) {
    objectives.push("Learn how to survive the driverless train before boarding it.");
  }

  if (
    (flag("knows_shutdown") ||
      flag("met_mara") ||
      flag("knows_release") ||
      flag("read_mara_file")) &&
    !has("token")
  ) {
    objectives.push("Investigate anything marked with the time 1:13 or signal access.");
  }

  if (flag("knows_platform") && !has("fuse")) {
    objectives.push("Find a way to power the platform gate control.");
  }

  if ((has("fuse") || flag("met_mara") || flag("read_mara_file")) && !has("badge")) {
    objectives.push("Find proof of Mara Vale's identity before clearing her name.");
  }

  if (has("token") && has("fuse") && !flag("platform_lit")) {
    objectives.push("Restore power at Platform 13 and try the token slot.");
  }

  if (flag("platform_lit") && has("token") && !flag("freed_mara")) {
    objectives.push("Use the signal booth to resolve Mara's ledger entry.");
  }

  if (flag("freed_mara") && flag("knows_release")) {
    objectives.push("Pull the emergency release in the third car.");
  } else if (has("map")) {
    objectives.push("Use the marked map if you need a safe way out.");
  }

  return objectives.slice(0, 4);
}
