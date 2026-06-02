import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

import { choose, initialState, observe } from "./engine.js";
import { loadStory } from "./story.js";
import { scoreState } from "./score.js";
import type { GameState, Story } from "./schema.js";
import { maskObservation, renderMaskedScene, type MaskedView } from "./blind-facade.js";
import { runAgentCommand } from "./agent-runner.js";
import {
  FeedbackRecordSchema,
  parseRawFeedback,
  parseTurnDecision,
  slugify,
  toCompactLine,
  type FeedbackRecord,
  type Issue,
  type Persona,
  type RawFeedback,
  type Variant,
  PERSONAS,
  VARIANTS
} from "./playtest-feedback.js";
import { buildCritiquePrompt, buildTurnDecisionPrompt } from "./playtest-prompts.js";

const DEFAULT_STORY = "stories/demo.yaml";
const DEFAULT_MAX_TURNS = 40;
const DEFAULT_LOG_DIR = "ai-runs/playtest";
const DEFAULT_SESSIONS_FILE = "playtest-feedback/sessions.jsonl";

export interface SessionOptions {
  story?: string;
  persona?: Persona;
  variant?: Variant;
  maxTurns?: number;
  seed?: number;
  agentCmd?: string;
  timeoutMs?: number;
  logDir?: string;
  sessionsFile?: string;
  commit?: string;
  write?: boolean;
}

interface TurnEntry {
  turn: number;
  sceneId: string;
  chosenId: string;
  chosenLabel: string;
}

// Persona move heuristics. The orchestrator never peeks at choice destinations,
// so play stays as "blind" as the model's own view: decisions come from the
// visible label text plus this run's history only.
const PERSONA_PREFER: Record<Persona, RegExp> = {
  methodical_lore_reader: /\b(read|examine|inspect|look|study|listen|search|check)\b/i,
  goal_seeker: /\b(go|board|pull|release|use|open|install|continue|proceed|leave|exit|escape)\b/i,
  risk_taker: /\b(force|ignore|jump|without|break|smash|pry|run|dark|risk|skip)\b/i,
  casual_clicker: /$^/,
  completionist: /\b(take|search|open|inspect|collect|keep|recover|read)\b/i,
  story_first: /\b(talk|listen|ask|answer|read|remember|watch|follow)\b/i,
  systems_skeptic: /\b(check|inspect|review|count|verify|examine|note)\b/i
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickChoiceIndex(
  persona: Persona,
  view: MaskedView,
  takenInScene: Set<string>,
  rng: () => number
): number {
  const choices = view.masked.choices;
  const prefer = PERSONA_PREFER[persona];
  // Prefer choices not already taken in this scene to avoid trivial loops.
  const fresh = choices.filter((c) => !takenInScene.has(view.choiceIds[c.index]));
  const pool = fresh.length > 0 ? fresh : choices;

  if (persona === "casual_clicker") {
    return rng() < 0.6 ? pool[0].index : pool[Math.floor(rng() * pool.length)].index;
  }

  const weights = pool.map((c) => (prefer.test(c.label) ? 4 : 1));
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = rng() * total;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return pool[i].index;
  }
  return pool[pool.length - 1].index;
}

function buildTranscript(
  story: Story,
  turns: TurnEntry[],
  finalState: GameState,
  variant: Variant
): string {
  const blocks: string[] = [];
  let state = initialState(story);
  for (const turn of turns) {
    const view = maskObservation(observe(story, state), {
      includeObjectives: variant === "with_hints"
    });
    blocks.push(
      `## Turn ${turn.turn}\n${renderMaskedScene(view.masked)}\n> You chose: ${turn.chosenLabel}`
    );
    state = choose(story, state, turn.chosenId);
  }
  const finalView = maskObservation(observe(story, finalState), {
    includeObjectives: variant === "with_hints"
  });
  blocks.push(`## Final\n${renderMaskedScene(finalView.masked)}`);
  return blocks.join("\n\n");
}

function builtinFeedback(
  ended: boolean,
  finalScene: string,
  stuckAt: string | null,
  stuckTurn: number,
  lastTurn: number
): RawFeedback {
  const issues: RawFeedback["issues"] = [];
  if (stuckAt) {
    issues.push({
      sev: "S2",
      category: "navigation",
      turn: stuckTurn,
      evidence: `revisited a location repeatedly without progress`,
      confidence: "med"
    });
  }
  if (!ended) {
    issues.push({
      sev: "S2",
      category: "navigation",
      turn: lastTurn,
      evidence: "hit the turn cap without reaching an ending",
      confidence: "med"
    });
  } else if (finalScene === "bad_ending" || finalScene === "lost_ending") {
    issues.push({
      sev: "S2",
      category: "fairness",
      turn: lastTurn,
      evidence: `run ended in failure (${finalScene}); review foreshadowing/fairness`,
      confidence: "med"
    });
  }
  return {
    verdict: `[builtin decider — no LLM critique configured] reached ${finalScene} in ${lastTurn + 1} turns`,
    top3: [],
    issues
  };
}

function enrichIssues(raw: RawFeedback, turns: TurnEntry[]): Issue[] {
  const seen = new Map<string, number>();
  return raw.issues.map((issue) => {
    const turn = turns[issue.turn];
    const scene = turn?.sceneId;
    const repro = turns.slice(0, (turn?.turn ?? turns.length - 1) + 1).map((t) => t.chosenId);
    let id = slugify(`${issue.category}-${scene ?? `t${issue.turn}`}`);
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count + 1}`;
    return {
      ...issue,
      id,
      scene,
      choice: turn?.chosenId,
      repro
    };
  });
}

export async function runSession(options: SessionOptions = {}): Promise<FeedbackRecord> {
  const storyPath = options.story ?? DEFAULT_STORY;
  const persona = options.persona ?? "goal_seeker";
  const variant = options.variant ?? "no_hints";
  const maxTurns = options.maxTurns ?? DEFAULT_MAX_TURNS;
  const seed = options.seed ?? randomBytes(4).readUInt32LE(0);
  const agentCmd = options.agentCmd ?? process.env.AI_PLAYTEST_CMD;
  const write = options.write ?? true;
  const rng = mulberry32(seed);
  const turnDeciderEnabled =
    Boolean(agentCmd) && process.env.AI_PLAYTEST_TURN_DECIDER !== "0" && options.agentCmd !== "";

  const story = await loadStory(storyPath);
  let state = initialState(story);
  const turns: TurnEntry[] = [];
  const recentVisibleChoices: string[] = [];
  const visitCount = new Map<string, number>();
  const takenPerScene = new Map<string, Set<string>>();
  let stuckAt: string | null = null;
  let stuckTurn = 0;
  let decisionParseErrors = 0;
  let decisionFallbacks = 0;

  for (let turn = 0; turn < maxTurns; turn++) {
    const observation = observe(story, state);
    const sceneId = observation.scene.id;
    if (observation.scene.ending || observation.choices.length === 0) break;

    const visits = (visitCount.get(sceneId) ?? 0) + 1;
    visitCount.set(sceneId, visits);
    if (visits >= 3 && !stuckAt) {
      stuckAt = sceneId;
      stuckTurn = turn;
    }

    const view = maskObservation(observation, { includeObjectives: variant === "with_hints" });
    const taken = takenPerScene.get(sceneId) ?? new Set<string>();
    let index: number | null = null;

    if (turnDeciderEnabled && agentCmd) {
      const prompt = buildTurnDecisionPrompt({
        persona,
        variant,
        scene: renderMaskedScene(view.masked),
        turn,
        recentChoices: recentVisibleChoices.slice(-5)
      });
      const result = await runAgentCommand(agentCmd, prompt, {
        timeoutMs: options.timeoutMs ?? Number(process.env.AI_PLAYTEST_TIMEOUT_MS ?? 120000)
      });
      const decision = parseTurnDecision(result.output);
      if (decision && view.masked.choices.some((choice) => choice.index === decision.choice)) {
        index = decision.choice;
      } else {
        decisionParseErrors += 1;
      }
    }

    if (index === null) {
      decisionFallbacks += turnDeciderEnabled ? 1 : 0;
      index = pickChoiceIndex(persona, view, taken, rng);
    }

    const choiceId = view.choiceIds[index];
    const label = view.masked.choices[index].label;
    taken.add(choiceId);
    takenPerScene.set(sceneId, taken);

    turns.push({ turn, sceneId, chosenId: choiceId, chosenLabel: label });
    recentVisibleChoices.push(label);
    state = choose(story, state, choiceId);
  }

  const finalObs = observe(story, state);
  const ended = finalObs.scene.ending;
  const finalScene = finalObs.scene.id;
  const { score, maxScore } = scoreState(state);
  const progress = scoreState(state)
    .achievements.filter((a) => a.earned)
    .map((a) => a.id);
  const lastTurn = Math.max(turns.length - 1, 0);

  let raw: RawFeedback | null = null;
  let parseError = false;
  let model = "builtin";

  if (agentCmd) {
    model = process.env.AI_PLAYTEST_MODEL ?? agentCmd.trim().split(/\s+/)[0];
    const transcript = buildTranscript(story, turns, state, variant);
    const prompt = buildCritiquePrompt({
      persona,
      variant,
      transcript,
      ended,
      finalScene,
      score,
      maxScore,
      turns: turns.length
    });
    const result = await runAgentCommand(agentCmd, prompt, {
      timeoutMs: options.timeoutMs ?? Number(process.env.AI_PLAYTEST_TIMEOUT_MS ?? 120000)
    });
    raw = parseRawFeedback(result.output);
    if (!raw) parseError = true;
  }

  if (!raw) {
    raw = builtinFeedback(ended, finalScene, stuckAt, stuckTurn, lastTurn);
  }

  const record: FeedbackRecord = FeedbackRecordSchema.parse({
    run_id: `pt-${new Date().toISOString().replace(/[:.]/g, "-")}-${persona}-${randomBytes(2).toString("hex")}`,
    ts: new Date().toISOString(),
    commit: options.commit ?? process.env.AI_PLAYTEST_COMMIT ?? "unknown",
    model,
    persona,
    variant,
    story: storyPath,
    decider: turnDeciderEnabled ? "llm" : "builtin",
    decision_parse_errors: decisionParseErrors,
    decision_fallbacks: decisionFallbacks,
    turns: turns.length,
    ended,
    final_scene: finalScene,
    score,
    max_score: maxScore,
    stuck_at: stuckAt,
    progress,
    parse_error: parseError,
    verdict: raw.verdict,
    kept_working: raw.kept_working,
    comprehension: raw.comprehension,
    subjective: raw.subjective,
    top3: raw.top3,
    issues: enrichIssues(raw, turns)
  });

  if (write) {
    const logDir = options.logDir ?? DEFAULT_LOG_DIR;
    const sessionsFile = options.sessionsFile ?? DEFAULT_SESSIONS_FILE;
    await mkdir(logDir, { recursive: true });
    await mkdir(dirname(sessionsFile), { recursive: true });
    await writeFile(`${logDir}/${record.run_id}.json`, JSON.stringify(record, null, 2), "utf8");
    await appendFile(sessionsFile, `${toCompactLine(record)}\n`, "utf8");
  }

  return record;
}

function parseArgs(argv: string[]): SessionOptions {
  const options: SessionOptions = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => argv[++i];
    if (arg === "--persona") options.persona = next() as Persona;
    else if (arg === "--variant") options.variant = next() as Variant;
    else if (arg === "--story") options.story = next();
    else if (arg === "--max-turns") options.maxTurns = Number(next());
    else if (arg === "--seed") options.seed = Number(next());
    else if (arg === "--cmd") options.agentCmd = next();
    else if (arg === "--log-dir") options.logDir = next();
    else if (arg === "--jsonl") options.sessionsFile = next();
    else if (arg === "--no-write") options.write = false;
  }
  return options;
}

function currentCommit(): string {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.persona && !PERSONAS.includes(options.persona)) {
    throw new Error(`Unknown persona: ${options.persona}. Valid: ${PERSONAS.join(", ")}`);
  }
  if (options.variant && !VARIANTS.includes(options.variant)) {
    throw new Error(`Unknown variant: ${options.variant}. Valid: ${VARIANTS.join(", ")}`);
  }
  options.commit = options.commit ?? process.env.AI_PLAYTEST_COMMIT ?? currentCommit();
  const record = await runSession(options);
  console.log(
    `blind playtest ${record.run_id}: persona=${record.persona} model=${record.model} ` +
      `final=${record.final_scene} score=${record.score}/${record.max_score} ` +
      `turns=${record.turns} issues=${record.issues.length}${record.parse_error ? " (parse_error)" : ""}`
  );
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  main().catch((error) => {
    console.error("blind-playtester error:", error);
    process.exitCode = 1;
  });
}
