import { describe, expect, it } from "vitest";
import {
  classifyAnomalies,
  monitorCadence,
  type WatchSnapshot
} from "../src/orchestrator-watch.js";

function snapshot(overrides: Partial<WatchSnapshot> = {}): WatchSnapshot {
  const startedAt = new Date("2026-06-08T00:00:00.000Z");
  return {
    now: new Date("2026-06-08T00:01:00.000Z"),
    startedAt,
    runDir: "ai-runs/orchestrator",
    loopPid: 111,
    playtestPid: 222,
    loopAlive: true,
    playtestAlive: true,
    latestArtifact: { path: "ai-runs/cycle-test.md", mtimeMs: startedAt.getTime() },
    latestObservation: undefined,
    loopLogTail: "",
    playtestLogTail: "",
    ...overrides
  };
}

describe("orchestrator monitor cadence", () => {
  it("uses the requested staged monitoring schedule", () => {
    expect(monitorCadence(0)).toEqual({ stage: "first-5-minutes", delayMs: 60_000 });
    expect(monitorCadence(5 * 60_000)).toEqual({
      stage: "next-30-minutes",
      delayMs: 5 * 60_000
    });
    expect(monitorCadence(35 * 60_000)).toEqual({
      stage: "to-60-minute-checkpoint",
      delayMs: 15 * 60_000
    });
    expect(monitorCadence(60 * 60_000)).toEqual({
      stage: "hourly-through-24-hours",
      delayMs: 60 * 60_000
    });
    expect(monitorCadence(24 * 60 * 60_000)).toEqual({ stage: "complete", delayMs: 0 });
  });
});

describe("orchestrator anomaly classification", () => {
  it("flags wrapper death as a hard anomaly", () => {
    expect(classifyAnomalies(snapshot({ loopAlive: false }))).toContainEqual({
      severity: "hard",
      reason: "main loop wrapper pid 111 is dead"
    });
  });

  it("waits before treating missing artifacts as a hard anomaly", () => {
    expect(classifyAnomalies(snapshot({ latestArtifact: undefined }))).toEqual([]);

    expect(
      classifyAnomalies(
        snapshot({
          now: new Date("2026-06-08T00:10:00.000Z"),
          latestArtifact: undefined
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "no post-launch cycle report/prompt artifact appeared within 10 minutes"
    });
  });

  it("does not count pre-launch artifacts as fresh cycle evidence", () => {
    expect(
      classifyAnomalies(
        snapshot({
          now: new Date("2026-06-08T00:10:00.000Z"),
          latestArtifact: {
            path: "ai-runs/cycle-before-launch.md",
            mtimeMs: new Date("2026-06-07T23:59:59.000Z").getTime()
          }
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "no post-launch cycle report/prompt artifact appeared within 10 minutes"
    });
  });

  it("flags repeated push failures from recent logs", () => {
    expect(
      classifyAnomalies(
        snapshot({
          loopLogTail: "git push failed\nlater\npush attempt 2 failed"
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "repeated push failures detected (2)"
    });
  });

  it("flags failed agent commands from recent logs", () => {
    expect(
      classifyAnomalies(
        snapshot({
          loopLogTail: "AI agent command failed with exit code 2."
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "agent command or post-agent automation failed"
    });
  });

  it("flags MCP route failures from the latest cycle observation", () => {
    expect(
      classifyAnomalies(
        snapshot({
          latestObservation: JSON.stringify({
            timestamp: "2026-06-08T00:01:00.000Z",
            mcpRoute: { ok: false }
          })
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "latest cycle observation reports MCP route failure"
    });
  });

  it("flags post-agent failures from the latest cycle observation", () => {
    expect(
      classifyAnomalies(
        snapshot({
          latestObservation: JSON.stringify({
            timestamp: "2026-06-08T00:01:00.000Z",
            postAgentStatus: "failed"
          })
        })
      )
    ).toContainEqual({
      severity: "hard",
      reason: "latest cycle observation reports failed post-agent automation"
    });
  });

  it("ignores pre-launch cycle observation failures", () => {
    expect(
      classifyAnomalies(
        snapshot({
          latestObservation: JSON.stringify({
            timestamp: "2026-06-07T23:59:59.000Z",
            mcpRoute: { ok: false },
            postAgentStatus: "failed"
          })
        })
      )
    ).toEqual([]);
  });
});
