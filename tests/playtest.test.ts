import { describe, expect, it } from "vitest";
import { runRandomPlaytests } from "../src/playtest.js";
import { loadStory } from "../src/story.js";

describe("playtest strategies", () => {
  it("coverage strategy discovers every demo scene", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 100, 30, "coverage");

    expect(report.summary.unvisitedScenes).toEqual([]);
    expect(report.summary.endings.true_ending).toBeGreaterThan(0);
  });
});
