import { observe } from "./engine.js";
import type { GameState, Story } from "./schema.js";

export function jsonResult(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function invalidChoiceResult(
  story: Story,
  state: GameState,
  choiceId: string,
  error: unknown
) {
  const observation = observe(story, state);
  return jsonResult({
    ok: false,
    error: error instanceof Error ? error.message : String(error),
    rejectedChoice: choiceId,
    scene: observation.scene,
    choices: observation.choices,
    objectives: observation.objectives,
    score: observation.score
  });
}
