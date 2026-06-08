import { describe, expect, it } from "vitest";
import type { Observation } from "../src/engine.js";
import { maskObservation, renderMaskedScene } from "../src/blind-facade.js";

function sampleObservation(): Observation {
  return {
    story: { id: "demo", title: "Demo" },
    scene: {
      id: "secret_room",
      text: "A heavy door blocks the way.",
      ending: false,
      routeImportance: "optional"
    },
    choices: [
      { id: "open_door", label: "Open the door", to: "hidden_vault" },
      { id: "flee", label: "Flee back outside", to: "entrance" }
    ],
    state: { flags: { secret_known: true }, inventory: ["brass_key"] },
    score: {
      score: 10,
      delta: 10,
      soundCue: "score_award",
      recentAwards: [{ id: "found_key", label: "Found key", points: 10, earned: true }],
      awards: [{ id: "found_key", label: "Found key", points: 10, earned: true }]
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
    expect(masked.scoreDelta).toBe(10);
    expect(masked.scoreCue).toBe("score_award");
    expect(masked.recentAwards).toEqual([{ label: "Found key", points: 10 }]);
    expect(masked.objectives).toBeUndefined();
    expect(choiceIds).toEqual(["open_door", "flee"]);

    const serialized = JSON.stringify(masked);
    for (const leaked of [
      "secret_room",
      "hidden_vault",
      "open_door",
      "secret_known",
      "brass_key",
      "awards",
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
    expect(rendered).toContain("Award: +10 Found key");
    expect(rendered).toContain("Score: 10");
    expect(rendered).not.toContain("Score: 10/");
    expect(rendered).not.toContain("open_door");
    expect(rendered).not.toContain("hidden_vault");
  });

  it("groups long player-facing choice lists without leaking ids", () => {
    const observation = sampleObservation();
    observation.choices = [
      { id: "board_now", label: "Board the third car and pull the emergency release", to: "end" },
      { id: "watch_mara", label: "Watch Mara call the opened doors", to: "mara" },
      { id: "review_count", label: "Review the opened count", to: "count" },
      { id: "return_mitten", label: "Return the lost mitten to the child", to: "mitten" },
      { id: "listen_doors", label: "Listen to the passenger door echoes", to: "echoes" },
      { id: "search_bench", label: "Search the bench beside the platform", to: "bench" },
      { id: "return_booth", label: "Return to the signal booth", to: "booth" },
      { id: "wait", label: "Wait where you are", to: "wait" }
    ];

    const { masked, choiceIds } = maskObservation(observation);
    const rendered = renderMaskedScene(masked);

    expect(choiceIds).toEqual([
      "board_now",
      "watch_mara",
      "review_count",
      "return_mitten",
      "listen_doors",
      "search_bench",
      "return_booth",
      "wait"
    ]);
    expect(rendered).toContain("  Board / release:\n    0. Board the third car");
    expect(rendered).toContain("  Mara:\n    1. Watch Mara call the opened doors");
    expect(rendered).toContain("  Counts / answers:\n    2. Review the opened count");
    expect(rendered).toContain("  Return:\n    6. Return to the signal booth");
    expect(rendered).not.toContain("board_now");
    expect(rendered).not.toContain("listen_doors");
  });
});
