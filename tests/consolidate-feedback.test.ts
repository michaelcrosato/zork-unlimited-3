import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { consolidate } from "../src/consolidate-feedback.js";

function line(record: Record<string, unknown>): string {
  return JSON.stringify({
    variant: "no_hints",
    max_score: 100,
    turns: 20,
    parse_error: false,
    ...record
  });
}

async function fixtureSessions(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), "consolidate-"));
  const sessionsFile = join(dir, "sessions.jsonl");
  const lines = [
    line({
      run_id: "r1",
      ts: "2026-06-01T10:00:00Z",
      model: "gpt-5.5",
      persona: "goal_seeker",
      ended: true,
      final_scene: "passenger_true_ending",
      score: 100,
      stuck_at: null,
      issues: [
        {
          id: "cheap-gate-death",
          sev: "S0",
          category: "fairness",
          scene: "platform",
          confidence: "high",
          ev: "died with no warning"
        },
        {
          id: "nit-typo",
          sev: "S4",
          category: "text",
          scene: "entrance",
          confidence: "low",
          ev: "teh"
        }
      ]
    }),
    line({
      run_id: "r2",
      ts: "2026-06-01T11:00:00Z",
      model: "claude-4.x",
      persona: "risk_taker",
      ended: false,
      final_scene: "platform",
      score: 35,
      stuck_at: "platform",
      issues: [
        {
          id: "cheap-gate-death",
          sev: "S0",
          category: "fairness",
          scene: "platform",
          confidence: "med",
          ev: "forced gate insta-death"
        },
        {
          id: "confuse-goal",
          sev: "S2",
          category: "goal",
          scene: "entrance",
          confidence: "med",
          ev: "no idea what to do"
        }
      ]
    }),
    line({
      run_id: "r3",
      ts: "2026-06-01T12:00:00Z",
      model: "gemini-3.1",
      persona: "completionist",
      ended: true,
      final_scene: "good_ending",
      score: 60,
      stuck_at: null,
      kept: "intercom reveal landed",
      issues: [
        {
          id: "confuse-goal",
          sev: "S2",
          category: "goal",
          scene: "entrance",
          confidence: "med",
          ev: "unclear objective"
        }
      ]
    })
  ];
  await writeFile(sessionsFile, lines.join("\n") + "\n", "utf8");
  return dir;
}

describe("consolidate feedback", () => {
  it("aggregates, ranks, and never fabricates themes", async () => {
    const dir = await fixtureSessions();
    const digestFile = join(dir, "PLAYTEST_DIGEST.md");
    const result = await consolidate({
      sessionsFile: join(dir, "sessions.jsonl"),
      digestFile,
      watermarkFile: join(dir, ".watermark"),
      all: true,
      now: new Date("2026-06-02T00:00:00Z"),
      write: true
    });

    expect(result.records).toBe(3);
    const digest = await readFile(digestFile, "utf8");

    // Promoted, cross-model, recurring issues are ranked.
    expect(digest).toContain("### Ranked issues");
    expect(digest).toContain("cheap-gate-death");
    expect(digest).toContain("[cross-model]");
    expect(digest).toContain("confuse-goal");

    // One-off S4 is parked, not promoted.
    expect(digest).toContain("### Do not overreact");
    expect(digest).toContain("nit-typo");
    const rankedSection = digest.split("### Do not overreact")[0];
    expect(rankedSection).not.toContain("nit-typo");

    // Positives surfaced; machine-readable ids + priorities present.
    expect(digest).toContain("intercom reveal landed");
    expect(digest).toContain("<!-- ids:");
    expect(digest).toContain("priorities:");

    // Anti-fabrication: no hardcoded/placeholder themes (the Jules bug).
    expect(digest).not.toContain("Simulated");
    expect(digest).not.toContain("Most players");
  });

  it("returns nothing when there are no new sessions", async () => {
    const dir = await mkdtemp(join(tmpdir(), "consolidate-empty-"));
    const sessionsFile = join(dir, "sessions.jsonl");
    await writeFile(sessionsFile, "", "utf8");
    const result = await consolidate({
      sessionsFile,
      digestFile: join(dir, "PLAYTEST_DIGEST.md"),
      watermarkFile: join(dir, ".watermark"),
      all: true,
      write: false
    });
    expect(result.records).toBe(0);
    expect(result.section).toBeNull();
  });
});
