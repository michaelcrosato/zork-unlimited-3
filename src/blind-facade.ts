import type { Observation } from "./engine.js";

/**
 * A masked view of a scene that is safe to show a *blind* playtester.
 *
 * The raw `Observation` returned by the engine leaks structure a fresh player
 * could never see: every choice carries its destination scene id (`to`), and
 * the payload includes internal scene ids, raw flags, and the full achievement
 * model. A genuinely blind playtest must hide all of that and present only what
 * a human reading the screen would have: prose, numbered choice labels, and the
 * visible score. The orchestrator keeps the real choice ids privately (via
 * `choiceIds`) so it can still drive the engine.
 */
export interface MaskedChoice {
  index: number;
  label: string;
}

export interface MaskedScene {
  text: string;
  ending: boolean;
  choices: MaskedChoice[];
  score: number;
  maxScore: number;
  /** Player-facing hint text, included only for the "with-hints" variant. */
  objectives?: string[];
}

export interface MaskedView {
  masked: MaskedScene;
  /** index -> real choice id, kept by the trusted orchestrator only. */
  choiceIds: string[];
}

export interface MaskOptions {
  includeObjectives?: boolean;
}

export function maskObservation(observation: Observation, options: MaskOptions = {}): MaskedView {
  const choiceIds = observation.choices.map((choice) => choice.id);
  const masked: MaskedScene = {
    text: observation.scene.text,
    ending: observation.scene.ending,
    choices: observation.choices.map((choice, index) => ({
      index,
      label: choice.label
    })),
    score: observation.score.score,
    maxScore: observation.score.maxScore
  };

  if (options.includeObjectives) {
    masked.objectives = [...observation.objectives];
  }

  return { masked, choiceIds };
}

/**
 * Renders a masked scene the way a player would read it on screen. Used both to
 * prompt an LLM decider and to build the end-of-run transcript. Deliberately
 * omits every internal id.
 */
export function renderMaskedScene(masked: MaskedScene): string {
  const lines: string[] = [masked.text.trim(), ""];
  if (masked.objectives && masked.objectives.length > 0) {
    lines.push("Objectives:");
    for (const objective of masked.objectives) {
      lines.push(`- ${objective}`);
    }
    lines.push("");
  }
  lines.push(`Score: ${masked.score}/${masked.maxScore}`);
  if (masked.ending) {
    lines.push("[THE STORY HAS ENDED]");
  } else {
    lines.push("Choices:");
    for (const choice of masked.choices) {
      lines.push(`  ${choice.index}. ${choice.label}`);
    }
  }
  return lines.join("\n");
}
