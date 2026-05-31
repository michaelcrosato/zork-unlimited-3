import { describe, expect, it } from "vitest";
import { runRandomPlaytests } from "../src/playtest.js";
import { loadStory } from "../src/story.js";

describe("playtest strategies", () => {
  it("coverage strategy discovers every demo scene", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 100, 50, "coverage");

    expect(report.summary.unvisitedScenes).toEqual([]);
    expect(report.summary.endings.true_ending).toBeGreaterThan(0);
    expect(report.summary.bestScore).toBe(report.summary.maxScore);
    expect(report.summary.maxScoreRuns).toBeGreaterThan(0);
  });

  it("goal strategy reliably reaches the max-score true ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 10, 40, "goal");

    expect(report.summary.unfinished).toBe(0);
    expect(report.summary.endings.true_ending).toBe(10);
    expect(report.summary.bestScore).toBe(report.summary.maxScore);
    expect(report.summary.maxScoreRuns).toBe(10);
  });
});
