import { describe, expect, it } from "vitest";
import { runRandomPlaytests } from "../src/playtest.js";
import { Story } from "../src/schema.js";
import { loadStory } from "../src/story.js";

describe("playtest strategies", () => {
  it("counts an ending reached on the final allowed random step", () => {
    const story: Story = {
      id: "single-step",
      title: "Single Step",
      start: "start",
      scenes: {
        start: {
          text: "Start.",
          ending: false,
          choices: [{ id: "finish", label: "Finish", to: "ending" }]
        },
        ending: {
          text: "Done.",
          ending: true,
          choices: []
        }
      }
    };

    const report = runRandomPlaytests(story, 1, 1, "random");

    expect(report.summary.unfinished).toBe(0);
    expect(report.summary.endings.ending).toBe(1);
    expect(report.runs[0]).toMatchObject({
      status: "ending",
      ended: true,
      finalScene: "ending",
      steps: 1,
      path: ["start", "finish", "ending"],
      readablePath: ["start", "finish: Finish", "ending"]
    });
  });

  it("counts an ending reached on the final allowed goal step", () => {
    const story: Story = {
      id: "single-step",
      title: "Single Step",
      start: "start",
      scenes: {
        start: {
          text: "Start.",
          ending: false,
          choices: [{ id: "pull_release", label: "Finish", to: "true_ending" }]
        },
        true_ending: {
          text: "Done.",
          ending: true,
          choices: []
        }
      }
    };

    const report = runRandomPlaytests(story, 1, 1, "goal");

    expect(report.summary.unfinished).toBe(0);
    expect(report.summary.endings.true_ending).toBe(1);
    expect(report.runs[0]).toMatchObject({
      status: "ending",
      ended: true,
      finalScene: "true_ending",
      steps: 1
    });
  });

  it("goal strategy treats the manifest true ending as an ideal destination", () => {
    const story: Story = {
      id: "manifest-goal",
      title: "Manifest Goal",
      start: "start",
      scenes: {
        start: {
          text: "Start.",
          ending: false,
          choices: [
            { id: "safe_exit", label: "Leave safely", to: "good_ending" },
            {
              id: "release_manifest",
              label: "Release the manifest",
              to: "passenger_true_ending"
            }
          ]
        },
        good_ending: {
          text: "Safe.",
          ending: true,
          choices: []
        },
        passenger_true_ending: {
          text: "All clear.",
          ending: true,
          choices: []
        }
      }
    };

    const report = runRandomPlaytests(story, 1, 1, "goal");

    expect(report.summary.endings.passenger_true_ending).toBe(1);
    expect(report.runs[0].finalScene).toBe("passenger_true_ending");
  });

  it("counts only genuine step-limit runs as unfinished", () => {
    const story: Story = {
      id: "loop",
      title: "Loop",
      start: "start",
      scenes: {
        start: {
          text: "Start.",
          ending: false,
          choices: [{ id: "wait", label: "Wait", to: "start" }]
        }
      }
    };

    const report = runRandomPlaytests(story, 1, 1, "random");

    expect(report.summary.unfinished).toBe(1);
    expect(report.summary.frontierSamples).toBe(0);
    expect(report.runs[0]).toMatchObject({
      status: "max_steps",
      ended: false,
      finalScene: "start",
      steps: 1
    });
  });

  it("coverage strategy discovers every demo scene", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 100, 60, "coverage");

    expect(report.summary.unfinished).toBe(0);
    expect(report.summary.frontierSamples).toBeGreaterThan(0);
    expect(report.summary.runs).toBeLessThanOrEqual(Object.keys(story.scenes).length + 100);
    expect(report.summary.unvisitedScenes).toEqual([]);
    expect(trueEndingCount(report.summary.endings)).toBeGreaterThan(0);
    expect(report.summary.bestScore).toBeGreaterThan(0);
    expect(report.summary.bestScoreRuns).toBeGreaterThan(0);
  }, 120000);

  it("seeded random demo play discovers optional receipt beats", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 100, 60, "random");

    expect(report.summary.unfinished).toBe(0);
    expect(report.summary.visitedScenes).toContain("passenger_echoed_check");
    expect(report.summary.visitedScenes).toContain("passenger_echoed_seat_receipt");
    expect(report.summary.visitedScenes).toContain("mara_manifest_thumbprint_receipt");
    expect(report.summary.unvisitedScenes).not.toContain("passenger_echoed_check");
    expect(report.summary.unvisitedScenes).not.toContain("passenger_echoed_seat_receipt");
    expect(report.summary.unvisitedScenes).not.toContain("mara_manifest_thumbprint_receipt");
  });

  it("goal strategy reliably reaches true endings with strong scores", async () => {
    const story = await loadStory("stories/demo.yaml");
    const report = runRandomPlaytests(story, 10, 40, "goal");

    expect(report.summary.unfinished).toBe(0);
    expect(trueEndingCount(report.summary.endings)).toBe(10);
    expect(report.summary.bestScore).toBeGreaterThan(0);
    expect(report.summary.bestScoreRuns).toBeGreaterThan(0);
  });
});

function trueEndingCount(endings: Record<string, number>): number {
  return (
    (endings.true_ending ?? 0) +
    (endings.mara_badge_proof_receipt_true_ending ?? 0) +
    (endings.mara_handoff_true_ending ?? 0) +
    (endings.mara_last_dispatch_true_ending ?? 0) +
    (endings.passenger_true_ending ?? 0) +
    (endings.passenger_answered_true_ending ?? 0) +
    (endings.passenger_answered_boarding_true_ending ?? 0) +
    (endings.passenger_counted_true_ending ?? 0) +
    (endings.passenger_reviewed_count_true_ending ?? 0) +
    (endings.passenger_manifest_true_ending ?? 0) +
    (endings.passenger_manifest_handoff_true_ending ?? 0) +
    (endings.passenger_manifest_thumbprint_true_ending ?? 0) +
    (endings.passenger_answered_handoff_true_ending ?? 0) +
    (endings.passenger_echoed_true_ending ?? 0) +
    (endings.passenger_morning_stop_checked_true_ending ?? 0) +
    (endings.passenger_helped_true_ending ?? 0) +
    (endings.passenger_roll_call_true_ending ?? 0) +
    (endings.passenger_lunch_tin_true_ending ?? 0) +
    (endings.passenger_conductor_true_ending ?? 0) +
    (endings.passenger_conductor_transfer_true_ending ?? 0) +
    (endings.passenger_conductor_transfer_stop_checked_true_ending ?? 0) +
    (endings.passenger_conductor_count_true_ending ?? 0) +
    (endings.passenger_keepsake_true_ending ?? 0) +
    (endings.passenger_newspaper_true_ending ?? 0) +
    (endings.passenger_newspaper_stop_checked_true_ending ?? 0) +
    (endings.passenger_mitten_true_ending ?? 0) +
    (endings.passenger_mitten_pair_checked_true_ending ?? 0)
  );
}
