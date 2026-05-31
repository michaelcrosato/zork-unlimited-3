import { Choice, Condition, Story } from "./schema.js";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    scenes: number;
    endings: number;
    reachable: number;
  };
}

export function validateStory(story: Story): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const sceneIds = new Set(Object.keys(story.scenes));

  if (!sceneIds.has(story.start)) {
    errors.push(`Start scene '${story.start}' does not exist`);
  }

  for (const [sceneId, scene] of Object.entries(story.scenes)) {
    const choiceIds = new Set<string>();
    if (!scene.ending && scene.choices.length === 0) {
      warnings.push(`Scene '${sceneId}' is a non-ending dead end`);
    }

    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        errors.push(`Scene '${sceneId}' has duplicate choice id '${choice.id}'`);
      }
      choiceIds.add(choice.id);

      if (!sceneIds.has(choice.to)) {
        errors.push(`Choice '${sceneId}.${choice.id}' points to missing scene '${choice.to}'`);
      }

      validateConditionReferences(story, choice, `Choice '${sceneId}.${choice.id}'`, warnings);
    }
  }

  const reachable = getReachableScenes(story);
  for (const sceneId of sceneIds) {
    if (!reachable.has(sceneId)) {
      warnings.push(`Scene '${sceneId}' is unreachable`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: {
      scenes: sceneIds.size,
      endings: Object.values(story.scenes).filter((scene) => scene.ending).length,
      reachable: reachable.size
    }
  };
}

export function getReachableScenes(story: Story): Set<string> {
  const reachable = new Set<string>();
  const queue = [story.start];

  while (queue.length > 0) {
    const sceneId = queue.shift()!;
    if (reachable.has(sceneId)) continue;
    reachable.add(sceneId);

    const scene = story.scenes[sceneId];
    if (!scene) continue;
    for (const choice of scene.choices) {
      queue.push(choice.to);
    }
  }

  return reachable;
}

function validateConditionReferences(
  story: Story,
  choice: Choice,
  location: string,
  warnings: string[]
): void {
  if (!choice.requires) return;

  const conditionText = JSON.stringify(choice.requires);
  const itemNames = new Set<string>();
  const flagNames = new Set<string>();

  for (const scene of Object.values(story.scenes)) {
    for (const candidate of scene.choices) {
      for (const item of asArray(candidate.effects?.addItem)) itemNames.add(item);
      for (const flag of Object.keys(candidate.effects?.set ?? {})) flagNames.add(flag);
    }
  }

  for (const item of collectConditionValues(choice.requires, "item")) {
    if (!itemNames.has(item)) {
      warnings.push(`${location} requires item '${item}', but no choice adds it`);
    }
  }

  for (const flag of collectConditionValues(choice.requires, "flag")) {
    if (!flagNames.has(flag)) {
      warnings.push(`${location} requires flag '${flag}', but no choice sets it`);
    }
  }

  if (conditionText.includes("{}")) {
    warnings.push(`${location} has an empty-looking condition`);
  }
}

function collectConditionValues(condition: Condition, key: "item" | "flag"): string[] {
  if (key === "item" && "item" in condition) return [condition.item];
  if (key === "flag" && "flag" in condition) return [condition.flag];
  if ("all" in condition)
    return condition.all.flatMap((nested) => collectConditionValues(nested, key));
  if ("any" in condition)
    return condition.any.flatMap((nested) => collectConditionValues(nested, key));
  return [];
}

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
