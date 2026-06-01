import { describe, expect, it } from "vitest";
import { choose, initialState, observe } from "../src/engine.js";
import { Story } from "../src/schema.js";

const story: Story = {
  id: "test",
  title: "Test Story",
  start: "start",
  scenes: {
    start: {
      text: "Start",
      ending: false,
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
  });

  it("rejects choices that are not in the current scene", () => {
    const state = initialState(story);
    expect(() => choose(story, state, "unlock")).toThrow(/not available/);
  });
});
