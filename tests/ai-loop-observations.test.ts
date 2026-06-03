import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  appendCycleObservation,
  compareMetricSnapshots,
  readCycleObservations,
  renderMetricsReport
} from "../src/ai-loop-observations.js";

describe("AI loop observations", () => {
  it("compares metric snapshots with lower unfinished runs treated as better", () => {
    expect(
      compareMetricSnapshots(
        { trueEndingRate: 0.1, unfinishedRuns: 4, bestScore: 100 },
        { trueEndingRate: 0.2, unfinishedRuns: 1, bestScore: 110 }
      )
    ).toEqual({
      trueEndingRate: "up",
      unfinishedRuns: "up",
      bestScore: "up",
      verdict: "improved"
    });

    expect(
      compareMetricSnapshots(
        { trueEndingRate: 0.2, unfinishedRuns: 1, bestScore: 110 },
        { trueEndingRate: 0.1, unfinishedRuns: 3, bestScore: 120 }
      ).verdict
    ).toBe("mixed");
  });

  it("appends cycle records and ignores schema header records", async () => {
    const path = await tempObservationPath();
    await writeFile(path, '{"recordType":"schema","schemaVersion":1}\n', "utf8");

    await appendCycleObservation(
      {
        cycle: 1,
        timestamp: "2026-06-03T00:00:00.000Z",
        gitCommit: "abc",
        mcpRoute: { ok: true, finalScene: "true_ending", score: 100 },
        metrics: { trueEndingRate: 0.2, unfinishedRuns: 3, bestScore: 100 },
        changedFiles: ["stories/demo.yaml"]
      },
      path
    );
    const second = await appendCycleObservation(
      {
        cycle: 2,
        timestamp: "2026-06-03T00:05:00.000Z",
        gitCommit: "def",
        agentCommand: "codex exec -",
        mcpRoute: { ok: true, finalScene: "true_ending", score: 120 },
        metrics: { trueEndingRate: 0.3, unfinishedRuns: 1, bestScore: 120 },
        changedFiles: ["src/ai-loop.ts"],
        committedHash: "def"
      },
      path
    );

    expect(second.comparedToPrevious).toMatchObject({ verdict: "improved" });
    expect(await readCycleObservations(path)).toHaveLength(2);

    const raw = await readFile(path, "utf8");
    expect(raw.trim().split("\n")).toHaveLength(3);
  });

  it("renders latest cycle diff for the ai:metrics command", async () => {
    const path = await tempObservationPath();
    await appendCycleObservation(
      {
        cycle: 1,
        gitCommit: "abc",
        mcpRoute: { ok: true, finalScene: "good_ending", score: 80 },
        metrics: { trueEndingRate: 0.2, unfinishedRuns: 2, bestScore: 90 }
      },
      path
    );
    await appendCycleObservation(
      {
        cycle: 2,
        gitCommit: "def",
        mcpRoute: { ok: true, finalScene: "true_ending", score: 120 },
        metrics: { trueEndingRate: 0.2, unfinishedRuns: 0, bestScore: 120 },
        changedFiles: ["stories/demo.yaml"]
      },
      path
    );

    await expect(renderMetricsReport(path)).resolves.toContain("verdict: improved");
    await expect(renderMetricsReport(path)).resolves.toContain("unfinished runs: up (2 -> 0)");
    await expect(renderMetricsReport(path)).resolves.toContain("changed files: stories/demo.yaml");
  });
});

async function tempObservationPath(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "zork-ai-loop-observations-"));
  return join(dir, "cycles.jsonl");
}
