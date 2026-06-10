import { GameState, Story } from "./schema.js";
import { observe } from "./engine.js";
import { groupChoicesForDisplay } from "./choice-groups.js";

export function renderTranscript(story: Story, state: GameState): string {
  const lines = [`# ${story.title}`, ""];

  for (const entry of state.history) {
    if (entry.choice) {
      lines.push(`- Choice: ${entry.label ?? entry.choice} (${entry.choice})`);
      continue;
    }

    const scene = story.scenes[entry.scene];
    lines.push(`## ${entry.scene}`);
    lines.push(scene?.text ?? "(missing scene)");
    lines.push("");
  }

  const observation = observe(story, state);

  lines.push("## Route Audit");
  lines.push(`Steps taken: ${choiceCount(state)}`);
  lines.push(`Scenes visited: ${sceneAudit(state)}`);
  lines.push(`Repeated scenes: ${repeatedSceneAudit(state)}`);
  lines.push(`Current route importance: ${observation.scene.routeImportance}`);
  lines.push(
    `Ending type: ${
      observation.scene.ending ? (observation.scene.endingType ?? "unclassified") : "in progress"
    }`
  );
  lines.push("");

  lines.push("## Final State");
  lines.push(
    `Scene: ${observation.scene.id} (${observation.scene.ending ? "ending" : "in progress"})`
  );
  lines.push(`Score: ${observation.score.score}`);
  lines.push("");
  lines.push("Point awards:");
  if (observation.score.awards.length > 0) {
    for (const award of observation.score.awards) {
      lines.push(`- +${award.points}: ${award.label}`);
    }
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push("Objectives:");
  if (observation.objectives.length > 0) {
    for (const objective of observation.objectives) {
      lines.push(`- ${objective}`);
    }
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push("Available choices:");
  if (observation.choices.length > 0) {
    const groups = groupChoicesForDisplay(observation.choices);
    for (const group of groups) {
      if (group.label) lines.push(`${group.label}:`);
      for (const choice of group.choices) {
        lines.push(`- ${choice.label} (${choice.id} -> ${choice.to})`);
      }
    }
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push(`Inventory: ${state.inventory.length > 0 ? state.inventory.join(", ") : "empty"}`);
  lines.push(`Flags: ${Object.keys(state.flags).length > 0 ? JSON.stringify(state.flags) : "{}"}`);
  return `${lines.join("\n")}\n`;
}

function choiceCount(state: GameState): number {
  return state.history.filter((entry) => entry.choice).length;
}

function sceneAudit(state: GameState): string {
  const visits = sceneVisits(state);
  const unique = new Set(visits);
  return `${unique.size} unique / ${visits.length} total`;
}

function repeatedSceneAudit(state: GameState): string {
  const counts = new Map<string, number>();

  for (const sceneId of sceneVisits(state)) {
    counts.set(sceneId, (counts.get(sceneId) ?? 0) + 1);
  }

  const repeated = [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([sceneId, count]) => `${sceneId} x${count}`);

  return repeated.length > 0 ? repeated.join(", ") : "none";
}

function sceneVisits(state: GameState): string[] {
  return state.history.filter((entry) => !entry.choice).map((entry) => entry.scene);
}
