import { describe, expect, it } from "vitest";
import {
  formatIdealEndingBreakdown,
  idealEndingRate,
  parsePathLines,
  requiresLoopRestart
} from "../src/ai-loop-metrics.js";

describe("AI loop metrics helpers", () => {
  it("handles missing summary data without inflating route quality", () => {
    expect(idealEndingRate(undefined)).toBe(0);
    expect(formatIdealEndingBreakdown(undefined)).toContain("Mara: 0");
  });

  it("normalizes command path output before restart checks", () => {
    const paths = parsePathLines("\n README.md \r\nsrc/ai-loop.ts\n\n");

    expect(paths).toEqual(["README.md", "src/ai-loop.ts"]);
    expect(requiresLoopRestart(paths)).toBe(true);
  });
});
