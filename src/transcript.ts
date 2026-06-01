import { GameState, Story } from "./schema.js";
import { observe } from "./engine.js";

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

  lines.push("## Final State");
  lines.push(
    `Scene: ${observation.scene.id} (${observation.scene.ending ? "ending" : "in progress"})`
  );
  lines.push(`Score: ${observation.score.score}/${observation.score.maxScore}`);
  lines.push("");
  lines.push("Score beats:");
  for (const achievement of observation.score.achievements) {
    const marker = achievement.earned ? "earned" : "missing";
    lines.push(`- ${marker}: ${achievement.label} (${achievement.points} pts)`);
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
    for (const choice of observation.choices) {
      lines.push(`- ${choice.label} (${choice.id} -> ${choice.to})`);
    }
  } else {
    lines.push("- none");
  }
  lines.push("");
  lines.push(`Inventory: ${state.inventory.length > 0 ? state.inventory.join(", ") : "empty"}`);
  lines.push(`Flags: ${Object.keys(state.flags).length > 0 ? JSON.stringify(state.flags) : "{}"}`);
  return `${lines.join("\n")}\n`;
}
