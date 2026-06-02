import { z } from "zod";

/**
 * Severity scale (S0 most severe). Mirrors the consolidation weights.
 *   S0 crash / invalid choice / corrupt / impossible progress
 *   S1 likely-quit / cannot find next step
 *   S2 major confusion / misleading route / unfair ending
 *   S3 local friction / weak label / pacing / missed payoff
 *   S4 polish nit
 */
export const SEVERITIES = ["S0", "S1", "S2", "S3", "S4"] as const;
export const SEVERITY_WEIGHT: Record<(typeof SEVERITIES)[number], number> = {
  S0: 100,
  S1: 50,
  S2: 20,
  S3: 8,
  S4: 2
};

export const ISSUE_CATEGORIES = [
  "bug",
  "engine",
  "ux",
  "choice_label",
  "signposting",
  "pacing",
  "agency",
  "story",
  "continuity",
  "reward",
  "goal",
  "navigation",
  "fairness",
  "text",
  "other"
] as const;

export const PERSONAS = [
  "methodical_lore_reader",
  "goal_seeker",
  "risk_taker",
  "casual_clicker",
  "completionist",
  "story_first",
  "systems_skeptic"
] as const;
export type Persona = (typeof PERSONAS)[number];

export const VARIANTS = ["no_hints", "with_hints"] as const;
export type Variant = (typeof VARIANTS)[number];

const confidenceSchema = z.enum(["low", "med", "high"]);

/** What the model returns. Issues reference a turn number; the orchestrator
 *  enriches them with the real scene/choice ids + repro path afterwards. */
export const RawIssueSchema = z.object({
  sev: z.enum(SEVERITIES),
  category: z.enum(ISSUE_CATEGORIES),
  turn: z.number().int().min(0),
  evidence: z.string().min(1),
  exp_vs_real: z.string().optional(),
  player_effect: z.string().optional(),
  confidence: confidenceSchema.default("med")
});
export type RawIssue = z.infer<typeof RawIssueSchema>;

export const ComprehensionSchema = z.object({
  goal: z.string().optional(),
  plot_3_lines: z.string().optional(),
  who_is_mara: z.string().optional(),
  unresolved: z.array(z.string()).optional()
});

export const SubjectiveSchema = z.object({
  immersion: z.number().int().min(1).max(5).optional(),
  agency: z.number().int().min(1).max(5).optional(),
  char_consistency: z.number().int().min(1).max(5).optional(),
  interest: z.number().int().min(1).max(5).optional()
});

export const RawFeedbackSchema = z.object({
  verdict: z.string().min(1),
  kept_working: z.string().optional(),
  comprehension: ComprehensionSchema.optional(),
  subjective: SubjectiveSchema.optional(),
  top3: z.array(z.string()).default([]),
  issues: z.array(RawIssueSchema).default([])
});
export type RawFeedback = z.infer<typeof RawFeedbackSchema>;

export const TurnDecisionSchema = z.object({
  choice: z.number().int().min(0),
  reason: z.string().optional()
});
export type TurnDecision = z.infer<typeof TurnDecisionSchema>;

export const IssueSchema = RawIssueSchema.extend({
  id: z.string().min(1),
  scene: z.string().optional(),
  choice: z.string().optional(),
  repro: z.array(z.string()).default([])
});
export type Issue = z.infer<typeof IssueSchema>;

export const FeedbackRecordSchema = z.object({
  run_id: z.string().min(1),
  ts: z.string().min(1),
  commit: z.string(),
  model: z.string(),
  persona: z.enum(PERSONAS),
  variant: z.enum(VARIANTS),
  story: z.string(),
  decider: z.enum(["builtin", "llm"]).default("builtin"),
  decision_parse_errors: z.number().int().min(0).default(0),
  decision_fallbacks: z.number().int().min(0).default(0),
  turns: z.number().int().min(0),
  ended: z.boolean(),
  final_scene: z.string(),
  score: z.number().int().min(0),
  max_score: z.number().int().min(0),
  stuck_at: z.string().nullable(),
  progress: z.array(z.string()).default([]),
  parse_error: z.boolean().default(false),
  verdict: z.string(),
  kept_working: z.string().optional(),
  comprehension: ComprehensionSchema.optional(),
  subjective: SubjectiveSchema.optional(),
  top3: z.array(z.string()).default([]),
  issues: z.array(IssueSchema).default([])
});
export type FeedbackRecord = z.infer<typeof FeedbackRecordSchema>;

/**
 * Extracts the last JSON object from arbitrary model output (fenced ```json
 * blocks or a bare trailing object) and validates it against RawFeedbackSchema.
 * Returns null on any failure so the caller can record a parse_error rather
 * than crash the loop.
 */
export function parseRawFeedback(text: string): RawFeedback | null {
  return parseJsonFromText(text, RawFeedbackSchema);
}

export function parseTurnDecision(text: string): TurnDecision | null {
  return parseJsonFromText(text, TurnDecisionSchema);
}

function parseJsonFromText<Schema extends z.ZodTypeAny>(
  text: string,
  schema: Schema
): z.infer<Schema> | null {
  const candidates: string[] = [];

  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = fenceRegex.exec(text)) !== null) {
    candidates.push(match[1]);
  }

  // Fall back to the last balanced {...} block in the raw text.
  const lastClose = text.lastIndexOf("}");
  const firstOpen = text.indexOf("{");
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    candidates.push(text.slice(firstOpen, lastClose + 1));
  }

  for (const candidate of candidates.reverse()) {
    try {
      const parsed = schema.safeParse(JSON.parse(candidate));
      if (parsed.success) return parsed.data;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

/** Compact one-line JSON written to the committed sessions.jsonl inbox. Keeps a
 *  short evidence/positive snippet so the consolidator stays useful even after
 *  the verbose per-run logs (gitignored) are reclaimed with the container. */
export function toCompactLine(record: FeedbackRecord): string {
  return JSON.stringify({
    run_id: record.run_id,
    ts: record.ts,
    commit: record.commit,
    model: record.model,
    persona: record.persona,
    variant: record.variant,
    decider: record.decider,
    decision_parse_errors: record.decision_parse_errors,
    decision_fallbacks: record.decision_fallbacks,
    ended: record.ended,
    final_scene: record.final_scene,
    score: record.score,
    max_score: record.max_score,
    turns: record.turns,
    stuck_at: record.stuck_at,
    parse_error: record.parse_error,
    kept: record.kept_working?.slice(0, 120),
    issues: record.issues.map((issue) => ({
      id: issue.id,
      sev: issue.sev,
      category: issue.category,
      scene: issue.scene,
      confidence: issue.confidence,
      ev: issue.evidence.slice(0, 120)
    }))
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
