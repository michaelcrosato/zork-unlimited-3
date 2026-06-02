import { Choice, Condition, ObjectiveRule, Story } from "./schema.js";

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
  const knownReferences = collectKnownReferences(story);
  const endingGroupTypes = new Map<string, Set<string>>();

  if (!sceneIds.has(story.start)) {
    errors.push(`Start scene '${story.start}' does not exist`);
  }

  for (const [sceneId, scene] of Object.entries(story.scenes)) {
    const choiceIds = new Set<string>();
    if (!scene.ending && scene.choices.length === 0) {
      warnings.push(`Scene '${sceneId}' is a non-ending dead end`);
    }
    if (!scene.routeImportance) {
      warnings.push(`Scene '${sceneId}' is missing routeImportance metadata`);
    }
    if (scene.ending && !scene.endingType) {
      warnings.push(`Ending scene '${sceneId}' is missing endingType metadata`);
    }
    if (!scene.ending && scene.endingType) {
      errors.push(`Scene '${sceneId}' has endingType but is not marked as an ending`);
    }
    if (scene.endingType === "ideal" && !scene.endingGroup) {
      errors.push(`Ideal ending '${sceneId}' is missing endingGroup metadata`);
    }
    if (scene.endingGroup && !scene.endingType) {
      errors.push(`Scene '${sceneId}' has endingGroup but no endingType`);
    }
    if (scene.endingGroup && scene.endingType) {
      const types = endingGroupTypes.get(scene.endingGroup) ?? new Set<string>();
      types.add(scene.endingType);
      endingGroupTypes.set(scene.endingGroup, types);
    }

    for (const choice of scene.choices) {
      if (choiceIds.has(choice.id)) {
        errors.push(`Scene '${sceneId}' has duplicate choice id '${choice.id}'`);
      }
      choiceIds.add(choice.id);

      if (!sceneIds.has(choice.to)) {
        errors.push(`Choice '${sceneId}.${choice.id}' points to missing scene '${choice.to}'`);
      }

      validateConditionReferences(
        knownReferences,
        choice,
        `Choice '${sceneId}.${choice.id}'`,
        warnings
      );
    }
  }

  const reachable = getReachableScenes(story);
  for (const sceneId of sceneIds) {
    if (!reachable.has(sceneId)) {
      warnings.push(`Scene '${sceneId}' is unreachable`);
    }
    if (!reachable.has(sceneId) && story.scenes[sceneId]?.routeImportance === "main") {
      errors.push(`Main-path scene '${sceneId}' is unreachable`);
    }
  }

  for (const objective of story.objectives ?? []) {
    validateObjectiveReferences(knownReferences, objective, warnings);
  }

  for (const [group, types] of endingGroupTypes) {
    if (types.size > 1) {
      errors.push(`Ending group '${group}' mixes ending types: ${[...types].sort().join(", ")}`);
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

function validateObjectiveReferences(
  knownReferences: KnownReferences,
  objective: ObjectiveRule,
  warnings: string[]
): void {
  for (const item of collectObjectiveConditionValues(objective.requires, "item")) {
    if (!knownReferences.items.has(item)) {
      warnings.push(
        `Objective '${objective.text}' references item '${item}', but no choice adds it`
      );
    }
  }
  for (const flag of collectObjectiveConditionValues(objective.requires, "flag")) {
    if (!knownReferences.flags.has(flag)) {
      warnings.push(
        `Objective '${objective.text}' references flag '${flag}', but no choice sets it`
      );
    }
  }
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
  knownReferences: KnownReferences,
  choice: Choice,
  location: string,
  warnings: string[]
): void {
  if (!choice.requires) return;

  const conditionText = JSON.stringify(choice.requires);

  for (const item of collectConditionValues(choice.requires, "item")) {
    if (!knownReferences.items.has(item)) {
      warnings.push(`${location} requires item '${item}', but no choice adds it`);
    }
  }

  for (const flag of collectConditionValues(choice.requires, "flag")) {
    if (!knownReferences.flags.has(flag)) {
      warnings.push(`${location} requires flag '${flag}', but no choice sets it`);
    }
  }

  if (conditionText.includes("{}")) {
    warnings.push(`${location} has an empty-looking condition`);
  }
}

interface KnownReferences {
  items: Set<string>;
  flags: Set<string>;
}

function collectKnownReferences(story: Story): KnownReferences {
  const items = new Set<string>();
  const flags = new Set<string>();

  for (const scene of Object.values(story.scenes)) {
    for (const choice of scene.choices) {
      for (const item of asArray(choice.effects?.addItem)) items.add(item);
      for (const flag of Object.keys(choice.effects?.set ?? {})) flags.add(flag);
    }
  }

  return { items, flags };
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

function collectObjectiveConditionValues(condition: Condition, key: "item" | "flag"): string[] {
  if (key === "item" && "item" in condition) return [condition.item];
  if (key === "item" && "notItem" in condition) return [condition.notItem];
  if (key === "flag" && "flag" in condition) return [condition.flag];
  if (key === "flag" && "notFlag" in condition) return [condition.notFlag];
  if ("all" in condition)
    return condition.all.flatMap((nested) => collectObjectiveConditionValues(nested, key));
  if ("any" in condition)
    return condition.any.flatMap((nested) => collectObjectiveConditionValues(nested, key));
  return [];
}

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}
