import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runSession } from "../src/blind-playtester.js";
import { FeedbackRecordSchema } from "../src/playtest-feedback.js";

async function fakeAgent(dir: string, decision: string): Promise<string> {
  const script = join(dir, "fake-agent.mjs");
  const nodeScript = script.replace(/\\/g, "/");
  const critique = JSON.stringify({
    verdict: "terse fake critique",
    kept_working: "masked transcript was readable",
    top3: [],
    issues: []
  });
  await writeFile(
    script,
    `import { readFileSync } from "node:fs";

const prompt = readFileSync(0, "utf8");
const output = prompt.includes("Return ONE JSON object")
  ? ${JSON.stringify(decision)}
  : ${JSON.stringify(critique)};
console.log(output);
`,
    "utf8"
  );
  return `node "${nodeScript}"`;
}

describe("blind playtester (built-in decider)", () => {
  it("plays the demo blind and returns a valid record without any LLM", async () => {
    const record = await runSession({
      seed: 12345,
      persona: "goal_seeker",
      agentCmd: "",
      write: false
    });
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
    const a = await runSession({ seed: 999, persona: "risk_taker", agentCmd: "", write: false });
    const b = await runSession({ seed: 999, persona: "risk_taker", agentCmd: "", write: false });
    expect(a.final_scene).toBe(b.final_scene);
    expect(a.score).toBe(b.score);
    expect(a.turns).toBe(b.turns);
  });

  it("does not fabricate qualitative themes in the built-in path", async () => {
    const record = await runSession({
      seed: 7,
      persona: "completionist",
      agentCmd: "",
      write: false
    });
    expect(record.verdict).toContain("builtin decider");
  });

  it("writes a verbose log and a compact session line", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pt-"));
    const sessionsFile = join(dir, "sessions.jsonl");
    const record = await runSession({
      seed: 42,
      persona: "methodical_lore_reader",
      agentCmd: "",
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

  it("uses a configured LLM command as the per-turn blind decider", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pt-agent-"));
    const cmd = await fakeAgent(dir, JSON.stringify({ choice: 0, reason: "first visible option" }));
    const record = await runSession({
      seed: 1,
      persona: "goal_seeker",
      agentCmd: cmd,
      maxTurns: 3,
      write: false
    });

    expect(record.decider).toBe("llm");
    expect(record.model).toBe("node");
    expect(record.decision_parse_errors).toBe(0);
    expect(record.decision_fallbacks).toBe(0);
    expect(record.parse_error).toBe(false);
    expect(record.kept_working).toBe("masked transcript was readable");
  });

  it("falls back to the built-in decider when a per-turn response is invalid", async () => {
    const dir = await mkdtemp(join(tmpdir(), "pt-agent-bad-"));
    const cmd = await fakeAgent(dir, "not json");
    const record = await runSession({
      seed: 1,
      persona: "goal_seeker",
      agentCmd: cmd,
      maxTurns: 2,
      write: false
    });

    expect(record.decider).toBe("llm");
    expect(record.decision_parse_errors).toBeGreaterThan(0);
    expect(record.decision_fallbacks).toBe(record.decision_parse_errors);
    expect(record.turns).toBeGreaterThan(0);
  });
});
