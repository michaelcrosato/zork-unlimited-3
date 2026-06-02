import { z } from "zod";

export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ flag: z.string() }),
    z.object({ notFlag: z.string() }),
    z.object({ item: z.string() }),
    z.object({ notItem: z.string() }),
    z.object({ all: z.array(ConditionSchema).min(1) }),
    z.object({ any: z.array(ConditionSchema).min(1) })
  ])
);

export type Condition =
  | { flag: string }
  | { notFlag: string }
  | { item: string }
  | { notItem: string }
  | { all: Condition[] }
  | { any: Condition[] };

export const EffectsSchema = z.object({
  set: z.record(z.boolean()).optional(),
  addItem: z.union([z.string(), z.array(z.string())]).optional(),
  removeItem: z.union([z.string(), z.array(z.string())]).optional()
});

export type Effects = z.infer<typeof EffectsSchema>;

export const ChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  to: z.string().min(1),
  requires: ConditionSchema.optional(),
  effects: EffectsSchema.optional()
});

export type Choice = z.infer<typeof ChoiceSchema>;

export const RouteImportanceSchema = z.enum(["main", "supporting", "optional"]);
export type RouteImportance = z.infer<typeof RouteImportanceSchema>;

export const EndingTypeSchema = z.enum(["bad", "escape", "good", "ideal"]);
export type EndingType = z.infer<typeof EndingTypeSchema>;

export const SceneSchema = z.object({
  text: z.string().min(1),
  ending: z.boolean().optional().default(false),
  routeImportance: RouteImportanceSchema.optional(),
  endingType: EndingTypeSchema.optional(),
  endingGroup: z.string().min(1).optional(),
  endingFamily: z.string().min(1).optional(),
  choices: z.array(ChoiceSchema).default([])
});

export type Scene = z.infer<typeof SceneSchema>;

export const ObjectiveRuleSchema = z.object({
  text: z.string().min(1),
  requires: ConditionSchema
});

export type ObjectiveRule = z.infer<typeof ObjectiveRuleSchema>;

export const StorySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  start: z.string().min(1),
  objectives: z.array(ObjectiveRuleSchema).default([]),
  scenes: z.record(SceneSchema)
});

type ParsedStory = z.infer<typeof StorySchema>;
export type Story = Omit<ParsedStory, "objectives"> & {
  objectives?: ObjectiveRule[];
};

export interface GameState {
  storyId: string;
  currentScene: string;
  flags: Record<string, boolean>;
  inventory: string[];
  history: HistoryEntry[];
}

export interface HistoryEntry {
  scene: string;
  choice?: string;
  label?: string;
}

export interface SaveFile {
  storyPath: string;
  state: GameState;
}
