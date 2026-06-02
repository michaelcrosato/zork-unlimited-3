import type { Persona, Variant } from "./playtest-feedback.js";

export const PERSONA_BRIEF: Record<Persona, string> = {
  methodical_lore_reader: "You read everything, inspect carefully, and tolerate backtracking.",
  goal_seeker: "You want a clear objective and dislike ambiguity; you push toward progress.",
  risk_taker:
    "You take dangerous options and test warnings; you probe what happens if you ignore advice.",
  casual_clicker: "You skim prose and pick whatever label looks appealing; low patience.",
  completionist: "You try to collect every item and see every branch and the max score.",
  story_first: "You care about character payoff, emotional beats, and narrative continuity.",
  systems_skeptic:
    "You watch for score/objective inconsistencies, contradictions, and UI weirdness."
};

const SCHEMA_BLOCK = `{
  "verdict": "one-line overall verdict",
  "kept_working": "one thing that genuinely worked (optional)",
  "comprehension": {
    "goal": "what you believed your goal was",
    "plot_3_lines": "retell the plot in <=3 lines",
    "who_is_mara": "who you think Mara is",
    "unresolved": ["threads left unexplained"]
  },
  "subjective": { "immersion": 1-5, "agency": 1-5, "char_consistency": 1-5, "interest": 1-5 },
  "top3": ["short issue slugs, most important first"],
  "issues": [
    {
      "sev": "S0|S1|S2|S3|S4",
      "category": "bug|engine|ux|choice_label|signposting|pacing|agency|story|continuity|reward|goal|navigation|fairness|text|other",
      "turn": <0-based turn number from the transcript>,
      "evidence": "terse, concrete",
      "exp_vs_real": "what you expected vs what happened (optional)",
      "player_effect": "how it affected you (optional)",
      "confidence": "low|med|high"
    }
  ]
}`;

export interface CritiqueInput {
  persona: Persona;
  variant: Variant;
  transcript: string;
  ended: boolean;
  finalScene: string;
  score: number;
  maxScore: number;
  turns: number;
}

/**
 * Builds the end-of-run critique prompt. The model only ever sees the masked
 * transcript (no internal ids, destinations, flags, or achievement model).
 */
export function buildCritiquePrompt(input: CritiqueInput): string {
  return (
    `You are a FIRST-TIME player reviewing a text adventure you have never seen. You did not
make this game and you have no access to its code or story files. Be BRUTALLY honest: say
exactly what confused, bored, or felt unfair. Do not pad with praise.

Your player style this run (${input.persona}): ${PERSONA_BRIEF[input.persona]}

Below is the transcript of the run you just played, turn by turn, exactly as it appeared on
screen. Choices are referenced by their turn number.

--- TRANSCRIPT START ---
${input.transcript}
--- TRANSCRIPT END ---

Outcome: ${input.ended ? `ended at "${input.finalScene}"` : "did NOT reach an ending"}, ` +
    `score ${input.score}/${input.maxScore}, ${input.turns} turns.

Answer this interview, terse / LLM-shorthand, as ONE JSON object and nothing else after it.
Cover: goal clarity, onboarding (first turns), getting stuck or looping, choice clarity and
false affordances, fairness of any failure/ending, pacing, narrative coherence, text quality,
whether actions had perceptible feedback, engine glitches, emotional beats, comprehension, and
an overall verdict with your top-3 issues. Every issue must cite the turn it happened on.

Output JSON matching exactly this schema:
${SCHEMA_BLOCK}`
  );
}

export interface ConsolidatorInput {
  windowStart: string;
  windowEnd: string;
  aggregateJson: string;
}

/**
 * Optional LLM-judge prompt for naming themes + next-window priorities from the
 * mechanically aggregated clusters. The judge sees only derived aggregates, never
 * raw model identities, to avoid family-favoritism.
 */
export function buildConsolidatorPrompt(input: ConsolidatorInput): string {
  return `You are a release manager triaging blind-playtest feedback for a text adventure.
You are given MECHANICALLY AGGREGATED clusters from many sessions over the window
${input.windowStart} .. ${input.windowEnd}. Do NOT invent issues that are not in the data.

Aggregated clusters (JSON):
${input.aggregateJson}

Return ONE JSON object and nothing else:
{
  "themes": ["data-grounded recurring themes, each tied to cluster ids"],
  "priorities": [
    { "id": "<cluster id>", "action": "concrete fix", "scenes": ["scene ids"], "add_test": "what to assert" }
  ],
  "do_not_overreact": ["one-off / contradictory / low-confidence clusters to ignore for now"]
}`;
}
