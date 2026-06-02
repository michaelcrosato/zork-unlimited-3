/**
 * Maintained scene-importance hints for blind-playtest consolidation.
 *
 * This is deliberately small and human-owned: it identifies the routes where
 * friction is most likely to affect normal players. The consolidator uses it
 * only as a priority multiplier for already-observed issues.
 */
export const MAIN_PATH_SCENES = [
  "entrance",
  "notice",
  "clock",
  "service_room",
  "personnel_file",
  "train_map",
  "radio",
  "locker",
  "platform",
  "signal_booth",
  "signal_ledger",
  "train_car",
  "mara_last_dispatch",
  "mara_last_dispatch_intercom",
  "true_ending"
] as const;

export const SUPPORTING_PATH_SCENES = [
  "dispatcher",
  "gate_control",
  "lit_platform",
  "mara_intercom",
  "passenger_platform",
  "passenger_manifest",
  "passenger_answers",
  "passenger_conductor_intercom",
  "passenger_conductor_roll_call"
] as const;

const MAIN = new Set<string>(MAIN_PATH_SCENES);
const SUPPORTING = new Set<string>(SUPPORTING_PATH_SCENES);

export function routeImportance(scene: string | undefined): { label: string; weight: number } {
  if (!scene) return { label: "unknown", weight: 1 };
  if (MAIN.has(scene)) return { label: "main", weight: 1.75 };
  if (SUPPORTING.has(scene)) return { label: "supporting", weight: 1.3 };
  return { label: "optional", weight: 1 };
}
