import { describe, expect, it } from "vitest";
import { choose, initialState, observe, observePlayer } from "../src/engine.js";
import { Story } from "../src/schema.js";

const story: Story = {
  id: "test",
  title: "Test Story",
  start: "start",
  objectives: [
    {
      text: "Find a reliable way to see in the underpass.",
      requires: { notItem: "key" }
    }
  ],
  scenes: {
    start: {
      text: "Start",
      ending: false,
      routeImportance: "main",
      choices: [
        {
          id: "take_key",
          label: "Take key",
          to: "locked",
          effects: { addItem: "key", set: { brave: true } }
        }
      ]
    },
    locked: {
      text: "Locked",
      ending: false,
      choices: [{ id: "unlock", label: "Unlock", to: "end", requires: { item: "key" } }]
    },
    end: {
      text: "End",
      ending: true,
      routeImportance: "optional",
      endingType: "ideal",
      endingGroup: "Test",
      endingFamily: "Core",
      choices: []
    }
  }
};

describe("engine", () => {
  it("applies effects and exposes legal choices", () => {
    let state = initialState(story);
    state = choose(story, state, "take_key");

    expect(state.inventory).toEqual(["key"]);
    expect(state.flags.brave).toBe(true);
    expect(observe(story, state).choices.map((choice) => choice.id)).toEqual(["unlock"]);
    expect(observe(story, state).scene.routeImportance).toBe("optional");
  });

  it("returns derived objectives in observations", () => {
    const state = initialState(story);

    expect(observe(story, state).objectives).toContain(
      "Find a reliable way to see in the underpass."
    );
  });

  it("clears objectives after reaching an ending", () => {
    let state = initialState(story);
    state = choose(story, state, "take_key");
    state = choose(story, state, "unlock");

    expect(observe(story, state).objectives).toEqual([]);
    expect(observe(story, state).scene.endingType).toBe("ideal");
    expect(observe(story, state).scene.endingGroup).toBe("Test");
  });

  it("returns a player view without internal ids, destinations, flags, or achievements", () => {
    const state = initialState(story);
    const view = observePlayer(story, state, { includeObjectives: true });

    expect(view.scene).toEqual({ text: "Start", ending: false, routeImportance: "main" });
    expect(view.choices).toEqual([{ index: 0, label: "Take key" }]);
    expect(view.objectives).toEqual(["Find a reliable way to see in the underpass."]);

    const serialized = JSON.stringify(view);
    for (const leaked of ["take_key", "locked", "brave", "inventory", "achievements"]) {
      expect(serialized).not.toContain(leaked);
    }
  });

  it("rejects choices that are not in the current scene", () => {
    const state = initialState(story);
    expect(() => choose(story, state, "unlock")).toThrow(/not available/);
  });
});
