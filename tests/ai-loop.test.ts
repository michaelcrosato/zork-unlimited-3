import { describe, expect, it } from "vitest";
import {
  exploratoryMaxSteps,
  formatIdealEndingBreakdown,
  getRestartSensitiveChangedPaths,
  idealEndingRate,
  parsePorcelainPaths,
  requiresLoopRestart,
  restartRequestedExitCode
} from "../src/ai-loop.js";

describe("AI loop restart detection", () => {
  it("requires a restart when loop runtime files change", () => {
    expect(requiresLoopRestart(["stories/demo.yaml", "src/ai-loop.ts"])).toBe(true);
    expect(requiresLoopRestart(["package.json"])).toBe(true);
    expect(requiresLoopRestart(["package-lock.json"])).toBe(true);
  });

  it("reports only runtime-sensitive paths for restart messages", () => {
    expect(
      getRestartSensitiveChangedPaths(["README.md", "src/ai-loop.ts", "package-lock.json"])
    ).toEqual(["src/ai-loop.ts", "package-lock.json"]);
  });

  it("uses a stable restart-request exit code for loop.sh", () => {
    expect(restartRequestedExitCode).toBe(75);
  });

  it("does not require a restart for ordinary story, docs, or test changes", () => {
    expect(
      requiresLoopRestart(["README.md", "stories/demo.yaml", "tests/story-paths.test.ts"])
    ).toBe(false);
  });

  it("parses git porcelain paths including renames", () => {
    expect(
      parsePorcelainPaths(" M src/ai-loop.ts\n?? OUTPUTLOG.md\nR  old.md -> new.md\n")
    ).toEqual(["src/ai-loop.ts", "OUTPUTLOG.md", "old.md", "new.md"]);
  });

  it("counts true-ending variants as ideal endings in loop evidence", () => {
    const summary = {
      runs: 100,
      endings: {
        true_ending: 27,
        mara_handoff_true_ending: 10,
        passenger_true_ending: 22,
        passenger_answered_true_ending: 2,
        passenger_answered_boarding_true_ending: 1,
        passenger_counted_true_ending: 1,
        passenger_reviewed_count_true_ending: 1,
        passenger_manifest_true_ending: 1,
        passenger_manifest_handoff_true_ending: 1,
        passenger_answered_handoff_true_ending: 1,
        passenger_echoed_true_ending: 1,
        passenger_helped_true_ending: 5,
        passenger_lunch_tin_true_ending: 4,
        passenger_conductor_true_ending: 6,
        passenger_keepsake_true_ending: 3,
        passenger_newspaper_true_ending: 2,
        passenger_mitten_true_ending: 4,
        good_ending: 17
      }
    };

    expect(idealEndingRate(summary)).toBe(0.92);
    expect(formatIdealEndingBreakdown(summary)).toBe(
      "Mara: 37 (Core: 37 (true_ending: 27, mara_handoff_true_ending: 10)); Passengers: 55 (Core: 31 (passenger_true_ending: 22, passenger_helped_true_ending: 5, passenger_lunch_tin_true_ending: 4), Manifest: 5 (passenger_manifest_true_ending: 1, passenger_manifest_handoff_true_ending: 1, passenger_echoed_true_ending: 1, passenger_counted_true_ending: 1, passenger_reviewed_count_true_ending: 1), Roll call: 10 (passenger_answered_true_ending: 2, passenger_answered_boarding_true_ending: 1, passenger_answered_handoff_true_ending: 1, passenger_conductor_true_ending: 6), Keepsakes: 9 (passenger_keepsake_true_ending: 3, passenger_newspaper_true_ending: 2, passenger_mitten_true_ending: 4))"
    );
  });

  it("allows exploratory MCP routes enough steps for late-game detours", () => {
    expect(exploratoryMaxSteps).toBeGreaterThanOrEqual(45);
  });
});
