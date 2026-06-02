import { describe, expect, it } from "vitest";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runSession } from "../src/blind-playtester.js";
import { FeedbackRecordSchema } from "../src/playtest-feedback.js";

describe("blind playtester (built-in decider)", () => {
  it("plays the demo blind and returns a valid record without any LLM", async () => {
    const record = await runSession({ seed: 12345, persona: "goal_seeker", write: false });
    expect(() => FeedbackRecordSchema.parse(record)).not.toThrow();
    expect(record.persona).toBe("goal_seeker");
    expect(record.model).toBe("builtin");
    expect(record.parse_error).toBe(false);
    expect(record.turns).toBeGreaterThan(0);
    expect(record.run_id.startsWith("pt-")).toBe(true);
    for (const issue of record.issues) {
      expect(Array.isArray(issue.repro)).toBe(true);
    }
  });

  it("is deterministic for a fixed seed", async () => {
    const a = await runSession({ seed: 999, persona: "risk_taker", write: false });
    const b = await runSession({ seed: 999, persona: "risk_taker", write: false });
    expect(a.final_scene).toBe(b.final_scene);
    expect(a.score).toBe(b.score);
    expect(a.turns).toBe(b.turns);
  });

  it("does not fabricate qualitative themes in the built-in path", async () => {
    const record = await runSession({ seed: 7, persona: "completionist", write: false });
    expect(record.verdict).toContain("builtin decider");
  });

  it("writes a verbose log and a compact session line", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pt-"));
    const sessionsFile = join(dir, "sessions.jsonl");
    const record = await runSession({
      seed: 42,
      persona: "methodical_lore_reader",
      logDir: dir,
      sessionsFile,
      write: true
    });

    const line = (await readFile(sessionsFile, "utf8")).trim();
    const parsed = JSON.parse(line);
    expect(parsed.run_id).toBe(record.run_id);
    expect(parsed.persona).toBe("methodical_lore_reader");

    const verbose = JSON.parse(await readFile(join(dir, `${record.run_id}.json`), "utf8"));
    expect(verbose.final_scene).toBe(record.final_scene);
  });
});
