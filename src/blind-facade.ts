import type { Observation, PlayerObservation } from "./engine.js";
import { groupChoicesForDisplay } from "./choice-groups.js";

/**
 * A masked view of a scene that is safe to show a *blind* playtester.
 *
 * The raw `Observation` returned by the engine leaks structure a fresh player
 * could never see: every choice carries its destination scene id (`to`), and
 * the payload includes internal scene ids, raw flags, and the full award
 * model. A genuinely blind playtest must hide all of that and present only what
 * a human reading the screen would have: prose, numbered choice labels, and the
 * visible score. The orchestrator keeps the real choice ids privately (via
 * `choiceIds`) so it can still drive the engine.
 */
export interface MaskedChoice {
  index: number;
  label: string;
  choiceGroup?: string;
}

export interface MaskedScene {
  text: string;
  ending: boolean;
  choices: MaskedChoice[];
  score: number;
  scoreDelta: number;
  scoreCue?: "score_award";
  recentAwards: Array<{
    label: string;
    points: number;
  }>;
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
  const player = playerObservationFromRaw(observation, options);
  return {
    masked: playerToMaskedScene(player),
    choiceIds: observation.choices.map((choice) => choice.id)
  };
}

export function maskPlayerObservation(
  observation: PlayerObservation,
  choiceIds: string[]
): MaskedView {
  return {
    masked: playerToMaskedScene(observation),
    choiceIds: [...choiceIds]
  };
}

function playerObservationFromRaw(
  observation: Observation,
  options: MaskOptions
): PlayerObservation {
  const player: PlayerObservation = {
    story: { title: observation.story.title },
    scene: {
      text: observation.scene.text,
      ending: observation.scene.ending,
      routeImportance: "optional"
    },
    choices: observation.choices.map((choice, index) => ({
      index,
      label: choice.label,
      ...(choice.choiceGroup ? { choiceGroup: choice.choiceGroup } : {})
    })),
    score: {
      score: observation.score.score,
      delta: observation.score.delta,
      soundCue: observation.score.soundCue,
      recentAwards: observation.score.recentAwards.map((award) => ({
        label: award.label,
        points: award.points
      }))
    }
  };

  if (options.includeObjectives) {
    player.objectives = [...observation.objectives];
  }

  return player;
}

function playerToMaskedScene(observation: PlayerObservation): MaskedScene {
  const masked: MaskedScene = {
    text: observation.scene.text,
    ending: observation.scene.ending,
    choices: observation.choices.map((choice) => ({
      index: choice.index,
      label: choice.label,
      ...(choice.choiceGroup ? { choiceGroup: choice.choiceGroup } : {})
    })),
    score: observation.score.score,
    scoreDelta: observation.score.delta,
    scoreCue: observation.score.soundCue,
    recentAwards: observation.score.recentAwards.map((award) => ({
      label: award.label,
      points: award.points
    }))
  };

  if (observation.objectives) {
    masked.objectives = [...observation.objectives];
  }

  return masked;
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
  if (masked.recentAwards.length > 0) {
    const total = masked.recentAwards.reduce((sum, award) => sum + award.points, 0);
    const labels = masked.recentAwards.map((award) => award.label).join("; ");
    lines.push(`Award: +${total} ${labels}`);
  }
  lines.push(`Score: ${masked.score}`);
  if (masked.ending) {
    lines.push("[THE STORY HAS ENDED]");
  } else {
    lines.push("Choices:");
    const groups = groupChoicesForDisplay(masked.choices);
    for (const group of groups) {
      if (group.label) lines.push(`  ${group.label}:`);
      const indent = group.label ? "    " : "  ";
      for (const choice of group.choices) {
        lines.push(`${indent}${choice.index}. ${choice.label}`);
      }
    }
  }
  return lines.join("\n");
}
