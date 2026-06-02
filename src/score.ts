import { GameState, Story } from "./schema.js";

export interface ScoreBreakdown {
  score: number;
  awards: ScoreAward[];
}

export interface ScoreAward {
  id: string;
  label: string;
  points: number;
  earned: boolean;
}

const FLAG_AWARDS: Array<{
  id: string;
  label: string;
  points: number;
  earned: (state: GameState, story?: Story) => boolean;
}> = [
  {
    id: "lights_on",
    label: "Made the underpass safe to navigate",
    points: 8,
    earned: (state) => state.flags.lights_on === true
  },
  {
    id: "read_notice",
    label: "Read the service notice warning",
    points: 2,
    earned: (state) => state.flags.read_notice === true
  },
  {
    id: "noticed_notice_back",
    label: "Found the message on the back of the notice",
    points: 3,
    earned: (state) => state.flags.noticed_notice_back === true
  },
  {
    id: "met_mara",
    label: "Answered Mara Vale in the tunnel",
    points: 6,
    earned: (state) => state.flags.met_mara === true
  },
  {
    id: "promised_mara",
    label: "Promised Mara you would help",
    points: 8,
    earned: (state) => state.flags.promised_mara === true
  },
  {
    id: "read_mara_file",
    label: "Read Mara Vale's personnel file",
    points: 10,
    earned: (state) => state.flags.read_mara_file === true
  },
  {
    id: "knows_release",
    label: "Learned the third-car release route",
    points: 14,
    earned: (state) => state.flags.knows_release === true || state.flags.freed_mara === true
  },
  {
    id: "platform_lit",
    label: "Restored power to Platform 13",
    points: 15,
    earned: (state) => state.flags.platform_lit === true
  },
  {
    id: "gate_control_inspected",
    label: "Inspected the gate control before using it",
    points: 4,
    earned: (state) => state.flags.gate_control_inspected === true
  },
  {
    id: "inspected_badge_back",
    label: "Read the note on Mara's badge",
    points: 4,
    earned: (state) => state.flags.inspected_badge_back === true
  },
  {
    id: "freed_mara",
    label: "Cleared Mara's name from the signal ledger",
    points: 25,
    earned: (state) => state.flags.freed_mara === true
  },
  {
    id: "read_manifest",
    label: "Read the passenger manifest",
    points: 8,
    earned: (state) => state.flags.read_manifest === true
  },
  {
    id: "heard_manifest_doors",
    label: "Listened to the manifest doors answer",
    points: 8,
    earned: (state) => state.flags.heard_manifest_doors === true
  },
  {
    id: "read_manifest_thumbprint",
    label: "Studied the thumbprint on the manifest",
    points: 10,
    earned: (state) => state.flags.read_manifest_thumbprint === true
  },
  {
    id: "heard_passenger_answers",
    label: "Heard passengers answer to their names",
    points: 12,
    earned: (state) => state.flags.heard_passenger_answers === true
  },
  {
    id: "helped_passengers_gather",
    label: "Helped the passengers gather together",
    points: 14,
    earned: (state) => state.flags.helped_passengers_gather === true
  },
  {
    id: "set_lunch_tin_pace",
    label: "Let the lunch-tin worker set the pace",
    points: 9,
    earned: (state) => state.flags.set_lunch_tin_pace === true
  },
  {
    id: "returned_lost_mitten",
    label: "Returned the child's lost mitten",
    points: 8,
    earned: (state) => state.flags.returned_lost_mitten === true
  },
  {
    id: "matched_manifest_keepsakes",
    label: "Matched keepsakes to manifest names",
    points: 10,
    earned: (state) => state.flags.matched_manifest_keepsakes === true
  },
  {
    id: "restored_newspaper_transfer",
    label: "Restored the newspaper woman's transfer",
    points: 10,
    earned: (state) => state.flags.restored_newspaper_transfer === true
  },
  {
    id: "conductor_called_clear",
    label: "Got the conductor to call the platform clear",
    points: 12,
    earned: (state) => state.flags.conductor_called_clear === true
  },
  {
    id: "manifest_handoff_seen",
    label: "Watched Mara open the manifest handoff",
    points: 10,
    earned: (state) =>
      state.flags.saw_mara_manifest_handoff === true ||
      state.flags.watched_mara_open_manifest === true
  },
  {
    id: "released_passengers",
    label: "Released the passenger doors",
    points: 22,
    earned: (state) => state.flags.released_passengers === true
  },
  {
    id: "ideal_ending",
    label: "Opened every door with the emergency release",
    points: 35,
    earned: (state, story) => isIdealEnding(story, state.currentScene)
  }
];

const ITEM_AWARDS: Record<string, { label: string; points: number }> = {
  lantern: { label: "Took a reliable light", points: 5 },
  map: { label: "Recovered the marked Platform 13 map", points: 10 },
  token: { label: "Recovered the signal-booth token", points: 10 },
  fuse: { label: "Recovered the platform fuse", points: 10 },
  badge: { label: "Recovered Mara's employee badge", points: 10 }
};

export function scoreState(state: GameState, story?: Story): ScoreBreakdown {
  const awards = [
    ...inventoryAwards(state),
    ...flagAwards(state, story),
    ...historyAwards(state, story)
  ].sort((left, right) => left.id.localeCompare(right.id));

  return {
    score: awards.reduce((total, award) => total + award.points, 0),
    awards
  };
}

export function isIdealEnding(story: Story | undefined, sceneId: string): boolean {
  const scene = story?.scenes[sceneId];
  if (scene?.endingType) return scene.endingType === "ideal";
  return sceneId === "true_ending" || sceneId.endsWith("_true_ending");
}

function hasItem(state: GameState, item: string): boolean {
  return state.inventory.includes(item);
}

function inventoryAwards(state: GameState): ScoreAward[] {
  return Object.entries(ITEM_AWARDS)
    .filter(([item]) => hasItem(state, item))
    .map(([item, award]) => ({
      id: `item_${item}`,
      label: award.label,
      points: award.points,
      earned: true
    }));
}

function flagAwards(state: GameState, story?: Story): ScoreAward[] {
  return FLAG_AWARDS.filter((award) => award.earned(state, story)).map((award) => ({
    id: `flag_${award.id}`,
    label: award.label,
    points: award.points,
    earned: true
  }));
}

function historyAwards(state: GameState, story?: Story): ScoreAward[] {
  const seen = new Set<string>();
  const awards: ScoreAward[] = [];

  for (const entry of state.history) {
    if (!entry.choice || seen.has(entry.choice)) continue;
    const points = pointsForChoice(entry.choice);
    if (points <= 0) continue;
    seen.add(entry.choice);
    awards.push({
      id: `choice_${entry.choice}`,
      label: entry.label ? `Chose: ${entry.label}` : humanizeChoice(entry.choice),
      points,
      earned: true
    });
  }

  if (story) {
    for (const sceneId of visitedScenesAfterStart(state)) {
      const scene = story.scenes[sceneId];
      if (!scene || scene.ending) continue;
      const points =
        scene.routeImportance === "main" ? 3 : scene.routeImportance === "supporting" ? 2 : 1;
      awards.push({
        id: `visit_${sceneId}`,
        label: `Explored ${humanizeChoice(sceneId)}`,
        points,
        earned: true
      });
    }
  }

  return awards;
}

function visitedScenesAfterStart(state: GameState): string[] {
  const seen = new Set<string>();
  for (const [index, entry] of state.history.entries()) {
    if (index > 0 && !entry.choice) seen.add(entry.scene);
  }
  return [...seen];
}

function pointsForChoice(choiceId: string): number {
  if (choiceId.includes("pull_release")) return 18;
  if (choiceId.includes("mark_mara_clear") || choiceId.includes("clear_manifest_and_mara")) {
    return 16;
  }
  if (choiceId.includes("install_fuse") || choiceId.includes("use_token")) return 12;
  if (choiceId.includes("gather") || choiceId.includes("help_passengers")) return 10;
  if (choiceId.includes("lead_") || choiceId.includes("carry_")) return 9;
  if (choiceId.includes("return_lost") || choiceId.includes("match_")) return 8;
  if (choiceId.includes("ask_") || choiceId.includes("answer_") || choiceId.includes("promise_"))
    return 6;
  if (choiceId.includes("read_") || choiceId.includes("inspect_") || choiceId.includes("study_"))
    return 5;
  if (choiceId.includes("listen_") || choiceId.includes("watch_") || choiceId.includes("touch_"))
    return 5;
  if (choiceId.includes("take_") || choiceId.includes("search_") || choiceId.includes("tune_"))
    return 4;
  if (choiceId.includes("follow_") || choiceId.includes("review_") || choiceId.includes("note_"))
    return 4;
  if (choiceId.includes("keep_")) return 3;
  if (choiceId.includes("board_with") || choiceId.includes("board_after")) return 3;
  if (choiceId.includes("open_") || choiceId.includes("continue_") || choiceId.includes("cross_"))
    return 2;
  if (choiceId.includes("return_") || choiceId.includes("leave_") || choiceId.includes("close_"))
    return 1;
  return 0;
}

function humanizeChoice(value: string): string {
  return value.replace(/_/g, " ");
}
