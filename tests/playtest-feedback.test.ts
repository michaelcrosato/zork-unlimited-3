import { describe, expect, it } from "vitest";
import {
  FeedbackRecordSchema,
  parseRawFeedback,
  parseTurnDecision,
  slugify,
  toCompactLine
} from "../src/playtest-feedback.js";

describe("playtest feedback schema", () => {
  it("parses a fenced JSON feedback block", () => {
    const text = `Here is my review.\n\n\`\`\`json\n{"verdict":"mid","issues":[{"sev":"S2","category":"pacing","turn":3,"evidence":"dragged"}]}\n\`\`\`\nthanks`;
    const raw = parseRawFeedback(text);
    expect(raw).not.toBeNull();
    expect(raw?.verdict).toBe("mid");
    expect(raw?.issues[0].confidence).toBe("med"); // default applied
  });

  it("parses a bare trailing JSON object", () => {
    const text = `chatter chatter {"verdict":"ok","top3":["x"],"issues":[]}`;
    const raw = parseRawFeedback(text);
    expect(raw?.verdict).toBe("ok");
    expect(raw?.top3).toEqual(["x"]);
  });

  it("returns null for invalid or missing JSON", () => {
    expect(parseRawFeedback("no json here at all")).toBeNull();
    expect(parseRawFeedback(`{"issues":[]}`)).toBeNull(); // missing required verdict
  });

  it("parses a per-turn choice decision", () => {
    expect(parseTurnDecision(`\`\`\`json\n{"choice":2,"reason":"looks useful"}\n\`\`\``)).toEqual({
      choice: 2,
      reason: "looks useful"
    });
    expect(parseTurnDecision(`{"choice":"two"}`)).toBeNull();
  });

  it("builds a compact line carrying evidence and positives", () => {
    const record = FeedbackRecordSchema.parse({
      run_id: "pt-1",
      ts: "2026-06-02T00:00:00Z",
      commit: "abc",
      model: "builtin",
      persona: "goal_seeker",
      variant: "no_hints",
      story: "stories/demo.yaml",
      decider: "llm",
      decision_parse_errors: 1,
      decision_fallbacks: 1,
      turns: 5,
      ended: true,
      final_scene: "good_ending",
      score: 60,
      max_score: 100,
      stuck_at: null,
      verdict: "ok",
      kept_working: "intercom reveal landed",
      issues: [
        {
          id: "pacing-locker",
          sev: "S3",
          category: "pacing",
          turn: 2,
          evidence: "three near-identical search options dragged",
          confidence: "med",
          scene: "locker",
          repro: ["search_locker"]
        }
      ]
    });

    const parsed = JSON.parse(toCompactLine(record));
    expect(parsed.kept).toBe("intercom reveal landed");
    expect(parsed.decider).toBe("llm");
    expect(parsed.decision_parse_errors).toBe(1);
    expect(parsed.decision_fallbacks).toBe(1);
    expect(parsed.issues[0].ev).toBe("three near-identical search options dragged");
    expect(parsed.issues[0].scene).toBe("locker");
    expect(parsed.parse_error).toBe(false);
  });

  it("slugifies labels", () => {
    expect(slugify("Cheap Gate Death!")).toBe("cheap-gate-death");
  });
});
