import { GameState } from "./schema.js";

export interface ScoreBreakdown {
  score: number;
  maxScore: number;
  achievements: Array<{
    id: string;
    label: string;
    points: number;
    earned: boolean;
  }>;
}

const ACHIEVEMENTS: Array<{
  id: string;
  label: string;
  points: number;
  earned: (state: GameState) => boolean;
}> = [
  {
    id: "lantern",
    label: "Found reliable light for the underpass",
    points: 5,
    earned: (state) => hasItem(state, "lantern") || state.flags.lights_on === true
  },
  {
    id: "map",
    label: "Recovered the marked Platform 13 map",
    points: 10,
    earned: (state) => hasItem(state, "map")
  },
  {
    id: "token",
    label: "Recovered the signal-booth token",
    points: 10,
    earned: (state) => hasItem(state, "token")
  },
  {
    id: "mara_file",
    label: "Resolved Mara Vale's ledger thread",
    points: 10,
    earned: (state) => state.flags.read_mara_file === true || state.flags.freed_mara === true
  },
  {
    id: "release_route",
    label: "Learned the third-car release route",
    points: 10,
    earned: (state) => state.flags.knows_release === true || state.flags.freed_mara === true
  },
  {
    id: "fuse",
    label: "Recovered the platform fuse",
    points: 10,
    earned: (state) => hasItem(state, "fuse")
  },
  {
    id: "badge",
    label: "Recovered Mara's employee badge",
    points: 10,
    earned: (state) => hasItem(state, "badge")
  },
  {
    id: "platform_lit",
    label: "Restored power to Platform 13",
    points: 10,
    earned: (state) => state.flags.platform_lit === true
  },
  {
    id: "freed_mara",
    label: "Cleared Mara's name from the signal ledger",
    points: 15,
    earned: (state) => state.flags.freed_mara === true
  },
  {
    id: "true_ending",
    label: "Opened every door with the emergency release",
    points: 10,
    earned: (state) =>
      state.currentScene === "true_ending" ||
      state.currentScene === "mara_handoff_true_ending" ||
      state.currentScene === "passenger_true_ending" ||
      state.currentScene === "passenger_answered_true_ending" ||
      state.currentScene === "passenger_answered_boarding_true_ending" ||
      state.currentScene === "passenger_counted_true_ending" ||
      state.currentScene === "passenger_reviewed_count_true_ending" ||
      state.currentScene === "passenger_manifest_true_ending" ||
      state.currentScene === "passenger_manifest_handoff_true_ending" ||
      state.currentScene === "passenger_manifest_thumbprint_true_ending" ||
      state.currentScene === "passenger_answered_handoff_true_ending" ||
      state.currentScene === "passenger_echoed_true_ending" ||
      state.currentScene === "passenger_helped_true_ending" ||
      state.currentScene === "passenger_roll_call_true_ending" ||
      state.currentScene === "passenger_lunch_tin_true_ending" ||
      state.currentScene === "passenger_conductor_true_ending" ||
      state.currentScene === "passenger_conductor_transfer_true_ending" ||
      state.currentScene === "passenger_conductor_count_true_ending" ||
      state.currentScene === "passenger_keepsake_true_ending" ||
      state.currentScene === "passenger_newspaper_true_ending" ||
      state.currentScene === "passenger_mitten_true_ending"
  }
];

export function scoreState(state: GameState): ScoreBreakdown {
  const achievements = ACHIEVEMENTS.map((achievement) => ({
    id: achievement.id,
    label: achievement.label,
    points: achievement.points,
    earned: achievement.earned(state)
  }));

  return {
    score: achievements
      .filter((achievement) => achievement.earned)
      .reduce((total, achievement) => total + achievement.points, 0),
    maxScore: achievements.reduce((total, achievement) => total + achievement.points, 0),
    achievements
  };
}

function hasItem(state: GameState, item: string): boolean {
  return state.inventory.includes(item);
}
