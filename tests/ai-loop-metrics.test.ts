import { describe, expect, it } from "vitest";
import {
  formatIdealEndingBreakdown,
  idealEndingRate,
  parsePathLines,
  parsePorcelainPaths,
  requiresLoopRestart
} from "../src/ai-loop-metrics.js";
import type { Story } from "../src/schema.js";

const story: Story = {
  id: "metrics",
  title: "Metrics",
  start: "start",
  objectives: [],
  scenes: {
    start: { text: "Start", ending: false, choices: [] },
    true_ending: {
      text: "Mara",
      ending: true,
      endingType: "ideal",
      endingGroup: "Mara",
      endingFamily: "Core",
      choices: []
    },
    passenger_true_ending: {
      text: "Passengers",
      ending: true,
      endingType: "ideal",
      endingGroup: "Passengers",
      endingFamily: "Core",
      choices: []
    },
    good_ending: {
      text: "Good",
      ending: true,
      endingType: "good",
      choices: []
    }
  }
};

describe("AI loop metrics helpers", () => {
  it("handles missing summary data without inflating route quality", () => {
    expect(idealEndingRate(undefined)).toBe(0);
    expect(formatIdealEndingBreakdown(undefined)).toBe("");
  });

  it("uses story ending metadata for ideal-ending grouping", () => {
    const summary = {
      runs: 10,
      endings: {
        true_ending: 3,
        passenger_true_ending: 4,
        good_ending: 3
      }
    };

    expect(idealEndingRate(summary, story)).toBe(0.7);
    expect(formatIdealEndingBreakdown(summary, story)).toBe(
      "Mara: 3 (Core: 3 (true_ending: 3)); Passengers: 4 (Core: 4 (passenger_true_ending: 4))"
    );
  });

  it("normalizes command path output before restart checks", () => {
    const paths = parsePathLines("\n README.md \r\nsrc/ai-loop.ts\n\n");

    expect(paths).toEqual(["README.md", "src/ai-loop.ts"]);
    expect(requiresLoopRestart(paths)).toBe(true);
  });

  it("parses concrete paths from porcelain status output", () => {
    expect(
      parsePorcelainPaths(
        " M README.md\n?? ai-loop-observations/cycles.jsonl\nR  old.ts -> src/ai-loop.ts\n"
      )
    ).toEqual(["README.md", "ai-loop-observations/cycles.jsonl", "old.ts", "src/ai-loop.ts"]);
  });
});
