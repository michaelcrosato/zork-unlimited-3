import type { RouteImportance, Story } from "./schema.js";

const WEIGHTS: Record<RouteImportance | "unknown", number> = {
  main: 1.75,
  supporting: 1.3,
  optional: 1,
  unknown: 1
};

const FALLBACK_MAIN_SCENES = new Set([
  "entrance",
  "tunnel",
  "service_room",
  "clock",
  "platform",
  "lit_platform",
  "signal_booth",
  "signal_ledger",
  "train_car"
]);

export function routeImportance(
  story: Story | undefined,
  scene: string | undefined
): { label: RouteImportance | "unknown"; weight: number } {
  const label = scene
    ? (story?.scenes[scene]?.routeImportance ??
      (FALLBACK_MAIN_SCENES.has(scene) ? "main" : "optional"))
    : "unknown";
  return { label, weight: WEIGHTS[label] };
}
