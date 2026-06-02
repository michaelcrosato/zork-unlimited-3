import { describe, expect, it } from "vitest";
import type { Observation } from "../src/engine.js";
import { maskObservation, renderMaskedScene } from "../src/blind-facade.js";

function sampleObservation(): Observation {
  return {
    story: { id: "demo", title: "Demo" },
    scene: { id: "secret_room", text: "A heavy door blocks the way.", ending: false },
    choices: [
      { id: "open_door", label: "Open the door", to: "hidden_vault" },
      { id: "flee", label: "Flee back outside", to: "entrance" }
    ],
    state: { flags: { secret_known: true }, inventory: ["brass_key"] },
    score: {
      score: 10,
      maxScore: 100,
      achievements: [{ id: "found_key", label: "Found key", points: 10, earned: true }]
    },
    objectives: ["Find a way into the vault"]
  };
}

describe("blind facade", () => {
  it("hides internal structure and exposes only player-visible content", () => {
    const { masked, choiceIds } = maskObservation(sampleObservation());

    expect(masked.choices).toEqual([
      { index: 0, label: "Open the door" },
      { index: 1, label: "Flee back outside" }
    ]);
    expect(masked.score).toBe(10);
    expect(masked.maxScore).toBe(100);
    expect(masked.objectives).toBeUndefined();
    expect(choiceIds).toEqual(["open_door", "flee"]);

    const serialized = JSON.stringify(masked);
    for (const leaked of [
      "secret_room",
      "hidden_vault",
      "open_door",
      "secret_known",
      "brass_key",
      "achievements",
      "found_key"
    ]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it("includes objectives only for the with-hints variant", () => {
    const { masked } = maskObservation(sampleObservation(), { includeObjectives: true });
    expect(masked.objectives).toEqual(["Find a way into the vault"]);
  });

  it("renders a player-facing scene without internal ids", () => {
    const { masked } = maskObservation(sampleObservation());
    const rendered = renderMaskedScene(masked);
    expect(rendered).toContain("0. Open the door");
    expect(rendered).toContain("Score: 10/100");
    expect(rendered).not.toContain("open_door");
    expect(rendered).not.toContain("hidden_vault");
  });
});
