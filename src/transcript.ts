import { GameState, Story } from "./schema.js";

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

  lines.push(`Inventory: ${state.inventory.length > 0 ? state.inventory.join(", ") : "empty"}`);
  lines.push(`Flags: ${Object.keys(state.flags).length > 0 ? JSON.stringify(state.flags) : "{}"}`);
  return `${lines.join("\n")}\n`;
}
