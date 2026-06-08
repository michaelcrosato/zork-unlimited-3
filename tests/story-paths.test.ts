import { describe, expect, it } from "vitest";
import { choose, initialState, observe } from "../src/engine.js";
import type { GameState } from "../src/schema.js";
import { loadStory } from "../src/story.js";

const RELEASE_OBJECTIVE = "Pull the emergency release in the third car.";
const OPENED_MANIFEST_OBJECTIVE =
  "Board now, or choose an optional opened-passenger thread such as the lunch-tin count or roster proof.";

function expectIdealScore(score: { score: number; awards: Array<{ id: string }> }): void {
  expect(score.score).toBeGreaterThan(0);
  expect(score.awards.some((award) => award.id === "flag_ideal_ending")).toBe(true);
}

describe("demo story critical paths", () => {
  it("can reach the true ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    const path = [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ];

    const finalState = path.reduce(
      (state, choiceId) => choose(story, state, choiceId),
      initialState(story)
    );
    const finalObservation = observe(story, finalState);

    expect(finalObservation.scene.id).toBe("true_ending");
    expect(finalObservation.scene.ending).toBe(true);
    expect(finalObservation.scene.text).toContain("the map stops trembling");
    expect(finalObservation.scene.text).toContain("Mara's badge warms");
    expect(finalObservation.scene.text).toContain("line fall silent");
    expect(finalObservation.state.inventory).toEqual(["badge", "fuse", "lantern", "map", "token"]);
    expect(finalObservation.state.flags.freed_mara).toBe(true);
    expectIdealScore(finalObservation.score);
  });

  it("warns before the forced-gate bad ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows"]) {
      state = choose(story, state, choiceId);
    }

    let warning = observe(story, state);
    expect(warning.scene.text).toContain("access plate hangs loose");
    expect(warning.scene.text).toContain("soot-scratched instructions");
    expect(warning.choices.find((choice) => choice.id === "inspect_gate_control")?.label).toBe(
      "Read the gate control before forcing anything"
    );
    expect(warning.choices.map((choice) => choice.label)).toContain(
      "Force the gate despite the empty fuse socket"
    );

    state = choose(story, state, "force_gate");

    warning = observe(story, state);
    expect(warning.scene.id).toBe("gate_warning");
    expect(warning.scene.text).toContain("one last chance");
    expect(warning.scene.text).toContain("empty fuse socket");
    expect(warning.scene.text).toContain("CLOCK = TOKEN");
    expect(warning.state.flags.knows_token_location).toBe(true);
    expect(warning.choices.map((choice) => choice.id)).toEqual([
      "back_away_from_gate",
      "listen_below_gate",
      "force_gate_anyway"
    ]);
    expect(warning.choices.map((choice) => choice.label)).toContain(
      "Ignore the final warning and force the gate anyway"
    );
    expect(warning.choices.find((choice) => choice.id === "back_away_from_gate")?.label).toBe(
      "Back away for the fuse, badge, map, and clock token"
    );
    expect(warning.choices.map((choice) => choice.id)).toContain("listen_below_gate");
    expect(warning.choices.map((choice) => choice.id)).toContain("back_away_from_gate");

    state = choose(story, state, "back_away_from_gate");
    const recovery = observe(story, state);
    expect(recovery.scene.id).toBe("service_room");
    expect(state.flags.backed_away_from_gate).toBe(true);
    expect(recovery.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(recovery.choices.map((choice) => choice.id)).toContain("go_to_stopped_clock");
  });

  it("adds a final sensory warning before the forced-gate bad ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows", "force_gate", "listen_below_gate"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_echo");
    expect(observation.scene.text).toContain("reading the first digits of her badge number");
    expect(observation.scene.text).toContain("The fuse socket sits silent");
    expect(observation.scene.text).toContain("fuse for light");
    expect(observation.scene.text).toContain("badge for proof");
    expect(observation.scene.text).toContain("map for the route");
    expect(observation.scene.text).toContain("token for the booth");
    expect(observation.state.flags.heard_gate_echo).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "back_away_after_gate_echo",
      "force_gate_after_echo"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "back_away_after_gate_echo")?.label
    ).toBe("Back away and gather the four answers");

    state = choose(story, state, "force_gate_after_echo");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_collapse");
    expect(observation.scene.text).toContain("not as a clue but as a countdown");
    expect(observation.scene.text).toContain("service-room door is still open");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "brace_gate_and_retreat",
      "crawl_under_collapsing_gate"
    ]);

    state = choose(story, state, "brace_gate_and_retreat");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_retreat_recovery");
    expect(observation.scene.text).toContain("four missing answers");
    expect(observation.scene.text).toContain("Mara's map on the desk");
    expect(observation.scene.text).toContain("signal token behind the stopped clock");
    expect(observation.state.flags.backed_away_from_gate).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "take_map_after_gate_retreat",
      "open_locker_after_gate_retreat",
      "go_to_clock_after_gate_retreat",
      "steady_hands_after_gate_retreat"
    ]);

    state = choose(story, state, "take_map_after_gate_retreat");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.inventory).toContain("map");
    expect(observation.choices.map((choice) => choice.id)).not.toContain("take_map");

    state = initialState(story);
    for (const choiceId of ["take_lantern", "follow_arrows", "force_gate", "listen_below_gate"]) {
      state = choose(story, state, choiceId);
    }

    state = choose(story, state, "back_away_after_gate_echo");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.backed_away_from_gate).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(observation.choices.map((choice) => choice.id)).toContain("take_map");

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "follow_arrows",
      "force_gate",
      "listen_below_gate",
      "force_gate_after_echo",
      "crawl_under_collapsing_gate"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("bad_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("badge number you never proved");
    expect(observation.scene.text).toContain("empty fuse socket");
    expect(observation.scene.text).toContain("another unfinished name");
  });

  it("lets collapsing-gate retreat players recover into the true ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "follow_arrows",
      "force_gate",
      "listen_below_gate",
      "force_gate_after_echo",
      "brace_gate_and_retreat"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    expect(observation.scene.id).toBe("gate_retreat_recovery");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "go_to_clock_after_gate_retreat"
    );

    for (const choiceId of [
      "go_to_clock_after_gate_retreat",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.backed_away_from_gate).toBe(true);
    expectIdealScore(observation.score);
  });

  it("points underprepared platform explorers back to the marked map", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.choices.find((choice) => choice.id === "force_gate")?.label).toBe(
      "Force the gate despite the empty fuse socket"
    );

    state = choose(story, state, "force_gate");
    observation = observe(story, state);

    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "back_away_from_gate",
      "listen_below_gate",
      "force_gate_anyway"
    ]);

    state = choose(story, state, "back_away_from_gate");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(observation.choices.map((choice) => choice.id)).toContain("take_map");
  });

  it("removes the forced-gate loop after players back away once", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "follow_arrows",
      "force_gate",
      "back_away_from_gate",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("platform");
    expect(choiceIds).not.toContain("force_gate");
    expect(choiceIds).toContain("return_to_service_room");
  });

  it("prevents empty platform return loops until players collect a useful tool", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows", "return_to_service_room"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.left_unprepared_platform).toBe(true);
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).not.toContain("go_to_platform");

    state = choose(story, state, "take_map");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("go_to_platform");
  });

  it("keeps clue-informed players in the service room until they collect a platform tool", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "tune_radio",
      "note_radio_route"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).not.toContain("go_to_platform");

    state = choose(story, state, "take_map");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("go_to_platform");
  });

  it("removes tunnel backtracking after the signal token is recovered", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "inspect_clock", "take_token", "open_service_door"]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.inventory).toContain("token");
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).toContain("go_to_platform");
    expect(choiceIds).not.toContain("return_to_tunnel");
  });

  it("gives uninformed clock leavers a final token warning and recovery path", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "inspect_clock", "leave_clock"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("clock_token_warning");
    expect(observation.scene.text).toContain("SIGNAL BOOTH ACCESS is not a souvenir stamp");
    expect(observation.scene.text).toContain("sounds like a key");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "take_token_after_clock_warning",
      "leave_warned_clock"
    ]);

    const recoveredState = choose(story, state, "take_token_after_clock_warning");
    observation = observe(story, recoveredState);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toContain("token");
    expect(observation.state.flags.found_token).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).not.toContain("inspect_clock");

    state = choose(story, state, "leave_warned_clock");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.choices.map((choice) => choice.id)).toContain("inspect_clock");

    state = choose(story, state, "inspect_clock");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.choices.map((choice) => choice.id)).toEqual(["take_token"]);
  });

  it("gives dark-tunnel explorers a final recovery beat before the false HOME lost ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["enter_dark", "follow_false_home_light"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("dark_home_warning");
    expect(observation.scene.text).toContain("Without the lantern, HOME looks less like a word");
    expect(observation.scene.text).toContain("close enough to pull the service lights on");
    expect(observation.state.flags.saw_dark_home_flicker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_chain_before_home_takes_you",
      "answer_mara_under_home_flicker",
      "keep_following_false_home"
    ]);

    state = choose(story, state, "keep_following_false_home");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("dark_home_grip");
    expect(observation.scene.text).toContain("The HOME sign gets close enough");
    expect(observation.scene.text).toContain("the tunnel has not let go of you yet");
    expect(observation.state.flags.felt_dark_home_grip).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "yank_chain_from_false_home_grip",
      "call_back_to_mara_from_false_home_grip",
      "let_dark_home_finish_your_name"
    ]);

    const recoveredState = choose(story, state, "yank_chain_from_false_home_grip");
    observation = observe(story, recoveredState);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.lights_on).toBe(true);
    expect(observation.state.flags.escaped_dark_home_flicker).toBe(true);

    const maraRecoveryState = choose(story, state, "call_back_to_mara_from_false_home_grip");
    observation = observe(story, maraRecoveryState);

    expect(observation.scene.id).toBe("dispatcher");
    expect(observation.state.flags.escaped_dark_home_flicker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("ask_mara_about_false_home");

    state = choose(story, state, "let_dark_home_finish_your_name");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.surrendered_dark_home_flicker).toBe(true);
    expect(observation.scene.text).toContain("The marked map falls unread in every version");
  });

  it("lets dark-HOME warning players recover into the true ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "enter_dark",
      "follow_false_home_light",
      "keep_following_false_home",
      "yank_chain_from_false_home_grip",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "return_to_tunnel",
      "inspect_clock",
      "take_token",
      "follow_arrows",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.escaped_dark_home_flicker).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets players ask Mara why the dark HOME sign answered first", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "enter_dark",
      "follow_false_home_light",
      "answer_mara_under_home_flicker"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("dispatcher");
    expect(observation.state.flags.escaped_dark_home_flicker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_mara_about_false_home",
      "ask_mara_about_train",
      "promise_to_help"
    ]);

    state = choose(story, state, "ask_mara_about_false_home");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_false_home_warning");
    expect(observation.scene.text).toContain("using a word it never earned");
    expect(observation.scene.text).toContain("Real morning is on the marked map");
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.heard_false_home_warning).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_mara_from_false_home_warning"
    ]);

    state = choose(story, state, "follow_mara_from_false_home_warning");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.lights_on).toBe(true);
    expect(observation.state.flags.promised_mara).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
  });

  it("keeps Mara-promising players in the service room until they recover the map", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["enter_dark", "answer_voice", "promise_to_help"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.promised_mara).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).not.toContain("go_to_platform");

    state = choose(story, state, "search_locker");
    state = choose(story, state, "take_fuse");
    state = choose(story, state, "take_badge");
    state = choose(story, state, "close_locker");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("take_map");
    expect(choiceIds).not.toContain("go_to_platform");

    state = choose(story, state, "take_map");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("go_to_platform");
  });

  it("makes the missing map obvious after Mara's other proof is gathered", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "enter_dark",
      "answer_voice",
      "promise_to_help",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "return_to_tunnel",
      "inspect_clock",
      "take_token",
      "open_service_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const mapChoice = observation.choices.find((choice) => choice.id === "take_map");

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.promised_mara).toBe(true);
    expect(observation.state.inventory).toEqual(["badge", "fuse", "token"]);
    expect(observation.objectives[0]).toBe("Recover the marked Platform 13 map before boarding.");
    expect(mapChoice?.label).toBe("Take the marked Platform 13 map from the desk");
    expect(observation.choices.map((choice) => choice.id)).not.toContain("return_to_tunnel");
    expect(observation.choices.map((choice) => choice.id)).not.toContain("go_to_platform");
  });

  it("focuses players on the map when it is the last missing preparation item", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "enter_dark",
      "answer_voice",
      "promise_to_help",
      "tune_radio",
      "note_radio_route",
      "read_personnel_file",
      "keep_mara_file",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_stopped_clock",
      "take_token",
      "open_service_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.inventory).toEqual(["badge", "fuse", "token"]);
    expect(observation.state.flags.read_mara_file).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual(["take_map"]);
    expect(observation.objectives[0]).toBe("Recover the marked Platform 13 map before boarding.");
  });

  it("keeps Mara-promising players from following the arrows without the map", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["enter_dark", "answer_voice", "promise_to_help", "return_to_tunnel"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.flags.promised_mara).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(choiceIds).toContain("open_service_door");
    expect(choiceIds).toContain("inspect_clock");
    expect(choiceIds).not.toContain("follow_arrows");

    state = choose(story, state, "open_service_door");
    state = choose(story, state, "search_locker");
    state = choose(story, state, "take_fuse");
    state = choose(story, state, "take_badge");
    state = choose(story, state, "close_locker");
    state = choose(story, state, "return_to_tunnel");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).not.toContain("follow_arrows");

    state = choose(story, state, "open_service_door");
    state = choose(story, state, "take_map");
    state = choose(story, state, "return_to_tunnel");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("follow_arrows");
  });

  it("removes the destructive gate option after players find the fuse", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("install_fuse");
    expect(choiceIds).not.toContain("force_gate");
  });

  it("adds an optional badge memory without blocking locker preparation", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "open_service_door", "search_locker", "take_badge"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).toContain("inspect_badge_back");
    expect(choiceIds).toContain("take_fuse");

    state = choose(story, state, "inspect_badge_back");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("badge_memory");
    expect(observation.scene.text).toContain("LAST TRAIN");
    expect(observation.scene.text).toContain("BADGE PROOF OPENS THE LEDGER");
    expect(observation.scene.text).toContain("DO NOT CLEAR ME BEFORE THE OTHERS");
    expect(observation.state.flags.inspected_badge_back).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.knows_release).toBe(true);

    state = choose(story, state, "return_from_badge_memory");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).not.toContain("inspect_badge_back");
    expect(choiceIds).toContain("take_fuse");

    state = choose(story, state, "take_fuse");
    state = choose(story, state, "close_locker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.inventory).toEqual(["badge", "fuse", "lantern"]);
  });

  it("keeps the badge memory available after taking both locker supplies", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("locker");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "inspect_badge_back",
      "close_locker"
    ]);

    state = choose(story, state, "inspect_badge_back");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("badge_memory");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.knows_release).toBe(true);
  });

  it("does not repeat Mara character beats at the posters after reading the badge", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_badge",
      "inspect_badge_back",
      "return_from_badge_memory",
      "take_fuse",
      "close_locker",
      "take_map",
      "go_to_platform",
      "install_fuse"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.state.flags.inspected_badge_back).toBe(true);
    expect(choiceIds).not.toContain("inspect_mara_posters");
  });

  it("keeps the stairwell warning available after players inspect Mara's posters", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "inspect_mara_posters",
      "return_to_lit_platform_after_posters"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.state.flags.inspected_mara_posters).toBe(true);
    expect(observation.state.inventory).not.toContain("token");
    expect(choiceIds).toContain("flee_platform");

    state = choose(story, state, "flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_warning");
    expect(observation.choices.map((choice) => choice.id)).toContain("listen_at_stairwell");

    state = choose(story, state, "listen_at_stairwell");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_stairwell_call");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("return_from_stairwell_call");

    state = choose(story, state, "return_from_stairwell_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "take_token_return_to_lit_platform"
    ]);
  });

  it("steers fuse carriers toward restoring platform power before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("install_fuse");
    expect(choiceIds).not.toContain("board_train");
  });

  it("keeps fully prepared platform players from looping back to an empty prep room", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("platform");
    expect(observation.state.inventory).toEqual(["badge", "fuse", "lantern", "map", "token"]);
    expect(choiceIds).toContain("install_fuse");
    expect(choiceIds).toContain("inspect_gate_control");
    expect(choiceIds).not.toContain("return_to_service_room");
  });

  it("removes stale map escape objectives once true-ending tools are gathered", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.objectives).toContain(
      "Restore power at Platform 13 and try the token slot."
    );
    expect(observation.objectives).not.toContain("Use the marked map if you need a safe way out.");
  });

  it("keeps map-only boarding available as an underprepared escape route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("train_car");
    expect(choiceIds).toContain("study_map_in_train");
    expect(choiceIds).toContain("ride_with_map");
    expect(choiceIds).toContain("look_at_sign");
  });

  it("adds an optional map-study beat for underprepared train riders", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "study_map_in_train"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("train_map");
    expect(observation.scene.text).toContain("MORNING PLATFORM");
    expect(observation.scene.text).toContain("away from the HOME sign");
    expect(observation.state.flags.checked_train_map).toBe(true);
    expect(choiceIds).toEqual(["ride_with_map_after_study", "lower_map_to_sign"]);

    state = choose(story, state, "ride_with_map_after_study");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_transfer");
    expect(observation.scene.text).toContain("Mara's is still the clearest");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "study_morning_map_note",
      "listen_at_morning_doors",
      "look_back_at_home_reflection",
      "mark_morning_transfer_warning",
      "step_into_morning",
      "turn_back_for_signal_token"
    ]);

    state = choose(story, state, "step_into_morning");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("good_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's badge number");
    expect(observation.scene.text).toContain("less like an ending");
  });

  it("adds an optional morning-map note before the safe escape choice", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "study_morning_map_note"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_map_note");
    expect(observation.scene.text).toContain("SAFE TRANSFER IS NOT CLEARANCE");
    expect(observation.scene.text).toContain("badge, the fuse, and the signal token");
    expect(observation.state.flags.read_morning_map_note).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_morning_map_note",
      "mark_warning_for_next_rescuer",
      "turn_back_from_map_note_for_token"
    ]);

    state = choose(story, state, "mark_warning_for_next_rescuer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_warning_mark");
    expect(observation.scene.text).toContain("CLOCK TOKEN");
    expect(observation.scene.text).toContain("CLEAR MARA VALE BEFORE THE RELEASE");
    expect(observation.state.flags.left_morning_warning).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_marking_morning_warning",
      "listen_to_morning_clock_catch_up",
      "turn_back_from_warning_mark_for_token"
    ]);

    state = choose(story, state, "turn_back_from_warning_mark_for_token");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toEqual(["lantern", "map", "token"]);
    expect(observation.state.flags.found_token).toBe(true);
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
  });

  it("lets morning-transfer riders recover from a final HOME reflection", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "look_back_at_home_reflection"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_echo");
    expect(observation.scene.text).toContain("The marked map trembles in your hand");
    expect(observation.scene.text).toContain("Away");
    expect(observation.state.flags.heard_home_sign_echo).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "cover_home_sign_with_map",
      "listen_under_home_sign",
      "step_into_home_reflection",
      "let_home_sign_finish"
    ]);

    state = choose(story, state, "listen_under_home_sign");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_dispatch");
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);

    state = choose(story, state, "cover_home_sign_after_dispatch");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("good_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("lets map-only escape riders mark the warning directly from morning transfer", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "mark_morning_transfer_warning"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_warning_mark");
    expect(observation.scene.text).toContain("CLOCK TOKEN");
    expect(observation.scene.text).toContain("BADGE PROOF");
    expect(observation.state.flags.left_morning_warning).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_marking_morning_warning",
      "listen_to_morning_clock_catch_up",
      "turn_back_from_warning_mark_for_token"
    ]);

    state = choose(story, state, "turn_back_from_warning_mark_for_token");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toEqual(["lantern", "map", "token"]);
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);

    for (const choiceId of [
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("adds an optional morning-door beat before the map-only good ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "study_map_in_train",
      "ride_with_map_after_study",
      "listen_at_morning_doors"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_doors");
    expect(observation.scene.text).toContain("leaving enough silence after each name");
    expect(observation.scene.text).toContain("the train has not stopped counting");
    expect(observation.state.flags.heard_morning_doors).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_morning_doors",
      "mark_door_warning_for_next_rescuer",
      "turn_back_from_morning_doors_for_token"
    ]);

    state = choose(story, state, "mark_door_warning_for_next_rescuer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_warning_mark");
    expect(observation.state.flags.left_morning_warning).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_marking_morning_warning",
      "listen_to_morning_clock_catch_up",
      "turn_back_from_warning_mark_for_token"
    ]);

    state = choose(story, state, "leave_after_marking_morning_warning");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("good_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("adds an optional morning-clock beat after marking the safe-transfer warning", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "listen_to_clock_from_morning_transfer"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_clock_catch_up");
    expect(observation.state.flags.heard_morning_clock_catch_up).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_morning_clock_catch_up",
      "turn_back_from_morning_clock_for_mara"
    ]);

    state = choose(story, state, "turn_back_from_morning_clock_for_mara");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "study_morning_map_note",
      "mark_warning_for_next_rescuer",
      "listen_to_morning_clock_catch_up"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("morning_clock_catch_up");
    expect(observation.scene.text).toContain("ticking past 1:13");
    expect(observation.scene.text).toContain("starts again from the first name");
    expect(observation.state.flags.heard_morning_clock_catch_up).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "leave_after_morning_clock_catch_up",
      "turn_back_from_morning_clock_for_token"
    ]);

    const returnedState = choose(story, state, "turn_back_from_morning_clock_for_token");
    observation = observe(story, returnedState);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toEqual(["lantern", "map", "token"]);
    expect(observation.state.flags.found_token).toBe(true);
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);

    state = returnedState;
    for (const choiceId of [
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "listen_at_morning_doors",
      "mark_door_warning_for_next_rescuer",
      "listen_to_morning_clock_catch_up",
      "turn_back_from_morning_clock_for_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.heard_morning_clock_catch_up).toBe(true);
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
  });

  it("lets morning-door listeners turn back toward the true ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "listen_at_morning_doors",
      "turn_back_from_morning_doors_for_token"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toEqual(["lantern", "map", "token"]);
    expect(observation.state.flags.found_token).toBe(true);
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.objectives).toContain("Find a way to power the platform gate control.");
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "listen_at_morning_doors",
      "turn_back_from_morning_doors_for_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.heard_morning_doors).toBe(true);
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).not.toContain("go_to_platform");
  });

  it("lets map-only escape riders turn back for Mara's ledger", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "turn_back_for_signal_token"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("clock");
    expect(observation.state.flags.returned_from_safe_escape).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(choiceIds).toEqual(["take_token"]);
  });

  it("keeps returned safe-escape riders focused on parts before revisiting the platform", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "ride_with_map",
      "turn_back_for_signal_token",
      "take_token"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("tunnel");
    expect(choiceIds).toContain("open_service_door");
    expect(choiceIds).not.toContain("follow_arrows");

    state = choose(story, state, "open_service_door");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).not.toContain("go_to_platform");

    for (const choiceId of ["search_locker", "take_fuse", "take_badge", "close_locker"]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("go_to_platform");
  });

  it("updates objectives after discovering Platform 13 by following arrows", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows"]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("platform");
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.scene.text).toContain("access plate hangs loose");
    expect(observation.scene.text).toContain("read before you make noise");
    expect(observation.choices.find((choice) => choice.id === "inspect_gate_control")?.label).toBe(
      "Read the gate control before forcing anything"
    );
    expect(observation.objectives).not.toContain(
      "Find out where the chalk arrows and old line are leading."
    );
  });

  it("lets unprepared platform explorers inspect the gate control for the token clue", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows", "inspect_gate_control"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_control");
    expect(observation.scene.text).toContain("CLOCK = TOKEN");
    expect(observation.state.flags.inspected_gate_control).toBe(true);
    expect(observation.state.flags.gate_control_inspected).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("read_gate_control_plaque");

    state = choose(story, state, "read_gate_control_plaque");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_control_plaque");
    expect(observation.scene.text).toContain("BADGE PROOF AND ROUTE MAP");
    expect(observation.scene.text).toContain("do not answer with your name");
    expect(observation.state.flags.read_gate_control_plaque).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);

    state = choose(story, state, "return_from_gate_control_plaque");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("gate_control");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "read_gate_control_plaque"
    );

    state = choose(story, state, "return_to_service_room_for_parts");
    observation = observe(story, state);

    const choiceIds = observation.choices.map((choice) => choice.id);
    expect(observation.scene.id).toBe("service_room");
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).toContain("go_to_stopped_clock");
  });

  it("lets token-informed players go straight from the service room to the stopped clock", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(choiceIds).toContain("go_to_stopped_clock");
    expect(choiceIds).not.toContain("return_to_tunnel");

    state = choose(story, state, "go_to_stopped_clock");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("clock");
    expect(choiceIds).toEqual(["take_token"]);

    state = choose(story, state, "take_token");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toContain("token");
    expect(choiceIds).not.toContain("inspect_clock");
  });

  it("lets prepared players continue directly from the inspected gate control to the signal booth", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "inspect_gate_control"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("gate_control");
    expect(choiceIds).toContain("install_fuse_and_insert_token");
    expect(choiceIds).not.toContain("install_fuse_from_gate_control");
    expect(choiceIds).toContain("return_to_service_room_for_parts");

    state = choose(story, state, "install_fuse_and_insert_token");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(choiceIds).toContain("inspect_signal_ledger");
  });

  it("adds an optional newspaper memory without consuming passenger help choices", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(choiceIds[0]).toBe("ask_newspaper_woman_about_stop");
    expect(choiceIds[1]).toBe("ask_newspaper_woman_to_read_transfer_column");
    expect(choiceIds).toContain("match_manifest_keepsakes");
    expect(choiceIds).toContain("help_passengers_gather");

    const directTransferState = choose(story, state, "ask_newspaper_woman_to_read_transfer_column");
    observation = observe(story, directTransferState);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.state.flags.restored_newspaper_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_conductor_to_punch_restored_transfer",
      "read_restored_transfer_into_roll_call",
      "carry_newspaper_transfer_to_third_car"
    ]);

    let conductorHandoffState = choose(
      story,
      directTransferState,
      "ask_conductor_to_punch_restored_transfer"
    );
    conductorHandoffState = choose(story, conductorHandoffState, "pass_punched_transfer_to_child");
    observation = observe(story, conductorHandoffState);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.scene.text).toContain("proof light enough to pass hand to hand");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);

    state = choose(story, state, "ask_newspaper_woman_about_stop");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_memory");
    expect(observation.scene.text).toContain("Warden Street, then morning transfer");
    expect(observation.scene.text).toContain("the route has started existing again");
    expect(observation.scene.text).toContain("a timetable the passengers can read to one another");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "study_newspaper_transfer_column",
      "return_lost_mitten_after_newspaper_memory",
      "match_keepsakes_after_newspaper_memory",
      "help_passengers_after_newspaper_memory",
      "board_after_newspaper_memory"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "help_passengers_after_newspaper_memory")
        ?.label
    ).toBe("Use the transfer column to gather passengers into the third car");
    expect(
      observation.choices.find((choice) => choice.id === "board_after_newspaper_memory")?.label
    ).toBe("Board the third car by the transfer column");

    const transferState = choose(story, state, "study_newspaper_transfer_column");
    observation = observe(story, transferState);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.scene.text).toContain("The blank transfer column is not blank anymore");
    expect(observation.scene.text).toContain("enough route for a clear signal");
    expect(observation.scene.text).toContain("making a connection");
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.state.flags.restored_newspaper_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_conductor_to_punch_restored_transfer",
      "read_restored_transfer_into_roll_call",
      "carry_newspaper_transfer_to_third_car"
    ]);

    const directRollCallState = choose(
      story,
      transferState,
      "read_restored_transfer_into_roll_call"
    );
    observation = observe(story, directRollCallState);

    expect(observation.scene.id).toBe("passenger_newspaper_roll_call");
    expect(observation.scene.text).toContain("turned the blank transfer column into a route");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_newspaper_roll_call",
      "confirm_newspaper_stops_before_release"
    ]);

    const conductorTransferState = choose(
      story,
      transferState,
      "ask_conductor_to_punch_restored_transfer"
    );
    observation = observe(story, conductorTransferState);

    expect(observation.scene.id).toBe("passenger_conductor_transfer");
    expect(observation.scene.text).toContain("Valid for morning");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_punched_transfer_to_child",
      "press_punched_transfer_to_speaker",
      "pull_release_with_punched_transfer",
      "hear_transfer_conductor_roll_call",
      "hold_for_transfer_conductor_roll_call"
    ]);

    observation = observe(
      story,
      choose(story, conductorTransferState, "pull_release_with_punched_transfer")
    );

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expectIdealScore(observation.score);

    observation = observe(
      story,
      choose(story, transferState, "carry_newspaper_transfer_to_third_car")
    );

    expect(observation.scene.id).toBe("passenger_newspaper_intercom");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "help_passengers_after_newspaper_memory");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_intercom");
    expect(observation.scene.text).toContain("becomes the crowd's timetable");
    expect(observation.scene.text).toContain("Warden Street, then morning transfer");
    expect(observation.scene.text).toContain("The names travel down the aisle like platform calls");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_newspaper_departure_board",
      "hear_final_newspaper_roll_call",
      "pull_release_after_gathered_intercom"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "check_newspaper_departure_board")?.label
    ).toBe("Check the departure board against the restored transfer");
    expect(
      observation.choices.find((choice) => choice.id === "hear_final_newspaper_roll_call")?.label
    ).toBe("Hear the transfer column become the final roll call");
    expect(
      observation.choices.find((choice) => choice.id === "pull_release_after_gathered_intercom")
        ?.label
    ).toBe("Pull the release while the transfer column holds");

    const departureBoardState = choose(story, state, "check_newspaper_departure_board");
    observation = observe(story, departureBoardState);

    expect(observation.scene.id).toBe("passenger_newspaper_departure_board");
    expect(observation.scene.text).toContain("the board answers with smaller words");
    expect(observation.scene.text).toContain("where they meant to go");
    expect(observation.scene.text).toContain("stop taking destinations away");
    expect(observation.state.flags.checked_newspaper_departure_board).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_departure_board_into_newspaper_roll_call",
      "pull_release_after_newspaper_departure_board"
    ]);

    const boardRollCallState = choose(
      story,
      departureBoardState,
      "read_departure_board_into_newspaper_roll_call"
    );
    observation = observe(story, boardRollCallState);

    expect(observation.scene.id).toBe("passenger_newspaper_roll_call");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);

    observation = observe(
      story,
      choose(story, departureBoardState, "pull_release_after_newspaper_departure_board")
    );

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expectIdealScore(observation.score);

    const rollCallState = choose(story, state, "hear_final_newspaper_roll_call");
    observation = observe(story, rollCallState);

    expect(observation.scene.id).toBe("passenger_newspaper_roll_call");
    expect(observation.scene.text).toContain("turned the blank transfer column into a route");
    expect(observation.scene.text).toContain("It sounds like directions");
    expect(observation.scene.text).toContain("shared platform");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_newspaper_roll_call",
      "confirm_newspaper_stops_before_release"
    ]);

    observation = observe(
      story,
      choose(story, rollCallState, "pull_release_after_newspaper_roll_call")
    );

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expectIdealScore(observation.score);

    const stopCheckState = choose(story, rollCallState, "confirm_newspaper_stops_before_release");
    observation = observe(story, stopCheckState);

    expect(observation.scene.id).toBe("passenger_newspaper_stop_check");
    expect(observation.scene.text).toContain("no one lets a street answer alone");
    expect(observation.scene.text).toContain("All named stops accounted for");
    expect(observation.state.flags.confirmed_newspaper_stops).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_newspaper_stops"
    ]);

    observation = observe(
      story,
      choose(story, stopCheckState, "pull_release_after_confirmed_newspaper_stops")
    );

    expect(observation.scene.id).toBe("passenger_newspaper_stop_checked_true_ending");
    expect(observation.scene.text).toContain("after every named stop has answered");
    expect(observation.scene.text).toContain("checked stops stay dark in the ink");
    expectIdealScore(observation.score);

    state = choose(story, state, "pull_release_after_gathered_intercom");

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.text).toContain("blank transfer column fills with destinations");
    expect(observation.scene.text).toContain(
      "keeps the paper unfolded until the last passenger has found a street beyond the line"
    );
    expect(observation.scene.text).toContain("finally be kept by everyone who read it together");
    expectIdealScore(observation.score);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "ask_newspaper_woman_about_stop",
      "board_after_newspaper_memory"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_intercom");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_gathered_intercom"
    );
  });

  it("adds an optional unanswered-row beat after reviewing the opened manifest count", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "check_for_unanswered_manifest_row"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_missing_count");
    expect(observation.scene.text).toContain("one row still waits without a voice");
    expect(observation.scene.text).toContain("whoever helped last");
    expect(observation.scene.text).toContain("make their own check");
    expect(observation.scene.text).toContain("we answer that space together");
    expect(observation.scene.text).toContain("room for everyone still crossing");
    expect(observation.state.flags.checked_missing_passenger_count).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_unanswered_row_become_roll_call",
      "ask_conductor_to_clear_unanswered_row",
      "hear_conductor_clear_unanswered_count",
      "board_with_unanswered_row_resolved",
      "return_from_unanswered_row"
    ]);

    state = choose(story, state, "return_from_unanswered_row");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_count");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "check_for_unanswered_manifest_row"
    );

    state = choose(story, state, "listen_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);

    state = choose(story, state, "board_after_answered_passengers");
    state = choose(story, state, "pull_release_after_answered_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expectIdealScore(observation.score);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "check_for_unanswered_manifest_row",
      "ask_conductor_to_clear_unanswered_row"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_signal");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "check_for_unanswered_manifest_row",
      "hear_conductor_clear_unanswered_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);

    state = choose(story, state, "pull_release_after_conductor_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_true_ending");
    expectIdealScore(observation.score);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "check_opened_manifest_blank_row",
      "board_with_unanswered_row_resolved",
      "pull_release_after_counted_chorus"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("no one is missing anymore");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.checked_missing_passenger_count).toBe(true);
    expect(observation.state.flags.shared_count_release_ready).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the passengers finish Mara's reviewed count together", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "board_with_reviewed_manifest_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_manifest_intercom");
    expect(observation.scene.text).toContain("checking that the others are still with them");
    expect(observation.scene.text).toContain("extra space");
    expect(observation.scene.text).toContain("no one lets the pause close around Mara again");
    expect(observation.scene.text).toContain("counting one another home");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_passengers_finish_reviewed_count",
      "ask_who_reviewed_count_left_blank",
      "pull_release_before_reviewed_count_finishes",
      "pull_release_after_counted_manifest_goodbye"
    ]);
    expect(
      observation.choices.find(
        (choice) => choice.id === "pull_release_before_reviewed_count_finishes"
      )?.label
    ).toBe("Start the release before Mara has to finish the count");
    expect(
      observation.choices.find(
        (choice) => choice.id === "pull_release_after_counted_manifest_goodbye"
      )?.label
    ).toBe("Let the reviewed count become the passengers' chorus");

    const missingCountState = choose(story, state, "ask_who_reviewed_count_left_blank");
    observation = observe(story, missingCountState);

    expect(observation.scene.id).toBe("passenger_missing_count");
    expect(observation.scene.text).toContain("not a missing passenger");
    expect(observation.scene.text).toContain("room for everyone still crossing");
    expect(observation.state.flags.checked_missing_passenger_count).toBe(true);

    const sharedChorusState = choose(
      story,
      missingCountState,
      "board_with_unanswered_row_resolved"
    );
    observation = observe(story, sharedChorusState);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.state.flags.shared_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_counted_chorus"
    ]);

    state = choose(story, state, "let_passengers_finish_reviewed_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.scene.text).toContain("make sure the child's second answer was heard");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expect(observation.scene.text).toContain("someone else's proof");
    expectIdealScore(observation.score);
  });

  it("still lets gate-control players install only the fuse when the token is missing", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "inspect_gate_control"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("gate_control");
    expect(choiceIds).toContain("install_fuse_from_gate_control");
    expect(choiceIds).not.toContain("install_fuse_and_insert_token");

    state = choose(story, state, "install_fuse_from_gate_control");
    expect(observe(story, state).scene.id).toBe("lit_platform");
  });

  it("focuses token-informed players on the stopped clock instead of lit-platform loops", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "inspect_gate_control",
      "install_fuse_from_gate_control",
      "return_from_lit_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.inventory).not.toContain("token");
    expect(choiceIds).toContain("go_to_stopped_clock");
    expect(choiceIds).not.toContain("return_to_tunnel");
    expect(choiceIds).not.toContain("return_to_lit_platform");

    state = choose(story, state, "go_to_stopped_clock");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("clock");
    expect(choiceIds).toEqual(["take_token"]);
  });

  it("still lets token-uninformed players revisit the lit platform for clues", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "return_from_lit_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.state.flags.knows_token_location).not.toBe(true);
    expect(choiceIds).toContain("return_to_lit_platform");

    state = choose(story, state, "return_to_tunnel");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("follow_arrows_to_lit_platform");
    expect(choiceIds).toContain("inspect_clock");
  });

  it("surfaces Mara's ledger thread from the service room", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.state.flags.read_mara_file).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );
  });

  it("lets careful notice readers discover the badge proof clue early", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["read_notice", "inspect_notice_back"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("notice_back");
    expect(observation.scene.text).toContain("BADGE PROOF REQUIRED");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    state = choose(story, state, "take_lantern_after_notice_back");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.state.inventory).toContain("lantern");
    expect(observation.state.flags.has_light).toBe(true);
  });

  it("focuses players on the stopped clock after the service room reveals the token clue", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "go_to_stopped_clock"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.choices.map((choice) => choice.id)).toEqual(["take_token"]);
  });

  it("makes the clock token the only clock action after Mara's file explains it", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "go_to_stopped_clock"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual(["take_token"]);
  });

  it("warns before the sign trap ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign"
    ]) {
      state = choose(story, state, choiceId);
    }

    expect(observe(story, state).scene.id).toBe("sign_warning");
    expect(observe(story, state).choices.map((choice) => choice.id)).toEqual([
      "listen_for_mara_under_home_warning",
      "let_home_overrun_first_dispatch",
      "look_away_from_sign",
      "stare_at_home",
      "step_toward_porch_light"
    ]);

    state = choose(story, state, "look_away_from_sign");
    expect(observe(story, state).scene.id).toBe("morning_transfer");
  });

  it("lets players use Mara's note to recover from the HOME sign before boarding too early", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("sign_warning");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_for_mara_under_home_warning",
      "let_home_overrun_first_dispatch",
      "look_away_from_sign",
      "follow_mara_note_from_sign",
      "stare_at_home",
      "step_toward_porch_light"
    ]);

    state = choose(story, state, "follow_mara_note_from_sign");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.resisted_home_sign_with_mara_note).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.objectives).toContain("Find a way to power the platform gate control.");
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    for (const choiceId of [
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the first HOME warning overrun Mara into the dispatch-specific lost ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "let_home_overrun_first_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_after_dispatch_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.surrendered_home_after_dispatch).toBe(true);
    expect(observation.state.flags.let_home_drown_mara).toBe(true);
    expect(observation.scene.text).toContain("Mara is still speaking");
    expect(observation.scene.text).toContain("clock token, fuse, badge, ledger");
  });

  it("lets the first HOME sign warning carry Mara's dispatch back into the true route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "listen_for_mara_under_home_warning"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_dispatch");
    expect(observation.scene.text).toContain("That is not home");
    expect(observation.scene.text).toContain("Clock token, fuse, badge, ledger");
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "turn_back_after_home_sign_dispatch",
      "cover_home_sign_after_dispatch",
      "step_into_false_home_after_dispatch",
      "let_home_sign_drown_mara"
    ]);

    state = choose(story, state, "turn_back_after_home_sign_dispatch");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.escaped_home_sign_dispatch).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    for (const choiceId of [
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_stopped_clock",
      "take_token",
      "open_service_door",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "listen_for_mara_under_home_warning",
      "step_into_false_home_after_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_after_dispatch_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.surrendered_home_after_dispatch).toBe(true);
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "listen_for_mara_under_home_warning",
      "let_home_sign_drown_mara"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_after_dispatch_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.surrendered_home_after_dispatch).toBe(true);
    expect(observation.state.flags.let_home_drown_mara).toBe(true);
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);
    expect(observation.scene.text).toContain("Mara is still speaking");
    expect(observation.scene.text).toContain("clock token, fuse, badge, ledger");
  });

  it("adds a final recoverable HOME sign warning before the lost ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_echo");
    expect(observation.scene.text).toContain("The marked map trembles in your hand");
    expect(observation.scene.text).toContain("Away");
    expect(observation.state.flags.heard_home_sign_echo).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "cover_home_sign_with_map",
      "listen_under_home_sign",
      "step_into_home_reflection",
      "let_home_sign_finish"
    ]);

    state = choose(story, state, "cover_home_sign_with_map");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("good_ending");
    expect(observation.scene.ending).toBe(true);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "step_into_home_reflection"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.surrendered_home_to_reflection).toBe(true);
    expect(observation.scene.text).toContain("The marked map falls unread");

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "listen_under_home_sign"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_dispatch");
    expect(observation.scene.text).toContain("That is not home");
    expect(observation.scene.text).toContain("Clock token, fuse, badge, ledger");
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "turn_back_after_home_sign_dispatch",
      "cover_home_sign_after_dispatch",
      "step_into_false_home_after_dispatch",
      "let_home_sign_drown_mara"
    ]);

    state = choose(story, state, "turn_back_after_home_sign_dispatch");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.escaped_home_sign_dispatch).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    for (const choiceId of [
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_stopped_clock",
      "take_token",
      "open_service_door",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "listen_under_home_sign",
      "step_into_false_home_after_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_after_dispatch_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.state.flags.surrendered_home_after_dispatch).toBe(true);
    expect(observation.state.flags.heard_home_sign_dispatch).toBe(true);
    expect(observation.scene.text).toContain("The marked map falls unread");
    expect(observation.scene.text).toContain("clock token, fuse, badge, ledger");

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "let_home_sign_finish"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_grip");
    expect(observation.scene.text).toContain("the map will not fall");
    expect(observation.scene.text).toContain("both places pulling at your name");
    expect(observation.scene.text).toContain("badge, fuse, clock token, ledger");
    expect(observation.state.flags.felt_home_sign_grip).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "jam_map_in_home_sign_doors",
      "wrench_map_free_from_home_sign",
      "surrender_to_home_sign"
    ]);

    state = choose(story, state, "wrench_map_free_from_home_sign");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("good_ending");
    expect(observation.scene.ending).toBe(true);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "let_home_sign_finish",
      "jam_map_in_home_sign_doors"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.escaped_home_sign_grip).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    for (const choiceId of [
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_stopped_clock",
      "take_token",
      "open_service_door",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "let_home_sign_finish",
      "surrender_to_home_sign"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("your kitchen window");

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "stare_at_home",
      "let_home_sign_finish",
      "surrender_to_home_sign"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lost_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("The marked map falls unread");

    state = initialState(story);
    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "board_train",
      "look_at_sign",
      "step_toward_porch_light"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("home_sign_grip");
    expect(observation.scene.text).toContain("both places pulling at your name");
    expect(observation.state.flags.felt_home_sign_grip).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "jam_map_in_home_sign_doors",
      "wrench_map_free_from_home_sign",
      "surrender_to_home_sign"
    ]);

    state = choose(story, state, "jam_map_in_home_sign_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.escaped_home_sign_grip).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.objectives).toContain(
      "Find proof of Mara Vale's identity before clearing her name."
    );

    for (const choiceId of [
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_stopped_clock",
      "take_token",
      "open_service_door",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "pull_release"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("focuses train-car choices on the release after Mara is cleared", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds[0]).toBe("pull_release");
    expect(observation.choices[0]?.label).toBe("Pull the emergency release now");
    expect(choiceIds).toContain("inspect_release_handle");
    expect(choiceIds).toContain("ask_mara_for_train_car_dispatch");
    expect(choiceIds).toContain("listen_to_mara_intercom");
    expect(choiceIds).not.toContain("ride_with_map");
    expect(choiceIds).not.toContain("look_at_sign");
  });

  it("lets players ask for Mara's last dispatch from the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "ask_mara_for_train_car_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_intercom");
    expect(observation.scene.text).toContain("Route held. Doors ready. Release authorized.");
    expect(observation.scene.text).toContain("every car hears the public record");
    expect(observation.scene.text).toContain("one pull will answer every door she held");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "wait_for_handoff_after_last_dispatch",
      "pull_release_after_last_dispatch_goodbye",
      "confirm_last_dispatch_receipt"
    ]);

    state = choose(story, state, "pull_release_after_last_dispatch_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's final dispatch");
    expect(observation.scene.text).toContain("the record closes because the doors are open");
    expect(observation.scene.text).toContain("sent everyone home");
    expectIdealScore(observation.score);
  });

  it("lets Mara's intercom goodbye flow directly into the final release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "listen_to_mara_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_intercom");
    expect(observation.scene.text).toContain("do not count the passengers");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_mara_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_mara_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expectIdealScore(observation.score);
  });

  it("lets the player ask for Mara's last dispatch from the train car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.scene.text).toContain("not an order now");
    expect(observation.scene.text).toContain("The release is the way out now");
    expect(observation.scene.text).toContain("one last dispatch");
    expect(observation.scene.text).toContain("belong to everyone");
    expect(observation.state.flags.heard_mara_last_dispatch).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release",
      "inspect_release_handle",
      "ask_mara_for_train_car_dispatch",
      "listen_to_mara_intercom",
      "wait_for_mara_at_far_door"
    ]);
    expect(observation.choices[0]?.label).toBe("Pull the emergency release now");
    expect(
      observation.choices.find((choice) => choice.id === "inspect_release_handle")?.label
    ).toBe("Check the emergency release before pulling");
    expect(
      observation.choices.find((choice) => choice.id === "ask_mara_for_train_car_dispatch")?.label
    ).toBe("Ask Mara for her final dispatch before pulling");

    state = choose(story, state, "ask_mara_for_train_car_dispatch");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_intercom");
    expect(observation.scene.text).toContain("Route held. Doors ready. Release authorized.");
    expect(observation.scene.text).toContain("every car hears the public record");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "wait_for_handoff_after_last_dispatch",
      "pull_release_after_last_dispatch_goodbye",
      "confirm_last_dispatch_receipt"
    ]);

    state = choose(story, state, "pull_release_after_last_dispatch_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Passenger release authorized by proof");
    expect(observation.scene.text).toContain("third car answers first");
    expect(observation.scene.text).toContain("signal ledger loses its last excuse");
    expectIdealScore(observation.score);
  });

  it("lets direct-release players check the emergency handle before pulling", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "inspect_release_handle"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("release_handle_check");
    expect(observation.scene.text).toContain("ALL DOORS");
    expect(observation.scene.text).toContain("Mara's cleared badge");
    expect(observation.scene.text).toContain("open what the ledger tried to keep closed");
    expect(observation.state.flags.checked_release_handle).toBe(true);
    expect(observation.objectives).toEqual([RELEASE_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handle_check"
    ]);

    state = choose(story, state, "pull_release_after_handle_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets immediate boarders wait for Mara to reach the far door", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "wait_for_mara_at_far_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("crossing the platform instead of haunting it");
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_goodbye",
      "confirm_mara_handoff_last_door"
    ]);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is not only a voice");
    expectIdealScore(observation.score);
  });

  it("pays off the notice-back badge proof clue in Mara's final intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release",
      "listen_to_badge_proof_intercom",
      "wait_for_badge_proof_mara_at_far_door"
    ]);

    state = choose(story, state, "listen_to_badge_proof_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_intercom");
    expect(observation.scene.text).toContain("Badge proof required");
    expect(observation.scene.text).toContain("made it an answer");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_badge_proof_goodbye",
      "confirm_badge_proof_receipt"
    ]);

    state = choose(story, state, "pull_release_after_badge_proof_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expectIdealScore(observation.score);
  });

  it("adds an optional badge-proof receipt before Mara's core ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "listen_to_badge_proof_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_intercom");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_badge_proof_goodbye",
      "confirm_badge_proof_receipt"
    ]);

    state = choose(story, state, "confirm_badge_proof_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_receipt");
    expect(observation.scene.text).toContain("Received by every door");
    expect(observation.scene.text).toContain("proof sounds finished");
    expect(observation.state.flags.confirmed_badge_proof_receipt).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_badge_proof_receipt"
    ]);

    state = choose(story, state, "pull_release_after_badge_proof_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_receipt_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("come back received");
    expect(observation.scene.text).toContain("nothing is waiting to be proved again");
    expectIdealScore(observation.score);
  });

  it("lets badge-proof direct boarders recover Mara's far-door handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "wait_for_badge_proof_mara_at_far_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("crossing the platform instead of haunting it");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_goodbye",
      "confirm_mara_handoff_last_door"
    ]);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets badge-proof readers answer Mara before boarding the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_released");
    expect(observation.scene.text).toContain("one final dispatch");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "watch_mara_leave_booth",
      "ask_mara_for_last_dispatch",
      "answer_badge_proof_before_boarding",
      "board_after_clearing_mara"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "ask_mara_for_last_dispatch")?.label
    ).toBe("Ask Mara for her final dispatch before boarding");

    state = choose(story, state, "answer_badge_proof_before_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_intercom");
    expect(observation.scene.text).toContain("Badge proof required");
    expect(observation.scene.text).toContain("made it an answer");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_badge_proof_goodbye",
      "confirm_badge_proof_receipt"
    ]);

    state = choose(story, state, "pull_release_after_badge_proof_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("preserves the badge-proof payoff after direct last-dispatch boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "ask_mara_for_last_dispatch",
      "board_after_last_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_intercom");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_badge_proof_after_last_dispatch",
      "wait_for_handoff_after_last_dispatch",
      "pull_release_after_last_dispatch_goodbye",
      "confirm_last_dispatch_receipt"
    ]);

    state = choose(story, state, "listen_to_badge_proof_after_last_dispatch");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_intercom");
    expect(observation.scene.text).toContain("Badge proof required");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_badge_proof_goodbye",
      "confirm_badge_proof_receipt"
    ]);

    state = choose(story, state, "pull_release_after_badge_proof_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expectIdealScore(observation.score);
  });

  it("adds an optional last-dispatch beat after clearing Mara's ledger row", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "ask_mara_for_last_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch");
    expect(observation.scene.text).toContain("Passenger release authorized by proof");
    expect(observation.scene.text).toContain("making a record no ledger can stamp shut");
    expect(observation.scene.text).toContain("badge number, the marked platform");
    expect(observation.scene.text).toContain("Third car. First seat. Pull once.");
    expect(observation.scene.text).toContain("Dispatch complete when the last door opens");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.objectives).toEqual([RELEASE_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_last_dispatch_into_car",
      "let_last_dispatch_become_handoff",
      "board_with_last_dispatch_in_speaker"
    ]);

    state = choose(story, state, "board_with_last_dispatch_in_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_intercom");
    expect(observation.scene.text).toContain("Route held. Doors ready. Release authorized.");
    expect(observation.scene.text).toContain("one pull will answer every door she held");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "wait_for_handoff_after_last_dispatch",
      "pull_release_after_last_dispatch_goodbye",
      "confirm_last_dispatch_receipt"
    ]);

    state = choose(story, state, "pull_release_after_last_dispatch_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's final dispatch");
    expect(observation.scene.text).toContain("signs off as a dispatcher");
    expect(observation.scene.text).toContain("doors are open");
    expectIdealScore(observation.score);
  });

  it("lets Mara's last dispatch become a physical handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "ask_mara_for_last_dispatch",
      "let_last_dispatch_become_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_boarding");
    expect(observation.scene.text).toContain("Mara does not vanish back into the speaker");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_mara_far_door_before_release",
      "listen_to_handoff_before_boarding",
      "board_after_mara_handoff"
    ]);

    state = choose(story, state, "board_after_mara_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release",
      "listen_to_mara_after_handoff"
    ]);

    state = choose(story, state, "listen_to_mara_after_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("opening the last door from the other side");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara carry her last dispatch directly into the third car intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "ask_mara_for_last_dispatch",
      "carry_last_dispatch_into_car"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_intercom");
    expect(observation.scene.text).toContain("Route held. Doors ready. Release authorized.");
    expect(observation.scene.text).toContain("public record");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "wait_for_handoff_after_last_dispatch",
      "pull_release_after_last_dispatch_goodbye",
      "confirm_last_dispatch_receipt"
    ]);

    state = choose(story, state, "confirm_last_dispatch_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_receipt");
    expect(observation.scene.text).toContain("Route held");
    expect(observation.scene.text).toContain("the line heard her correctly at last");
    expect(observation.scene.text).toContain("Received");
    expect(observation.state.flags.confirmed_last_dispatch_receipt).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_dispatch_receipt"
    ]);

    state = choose(story, state, "pull_release_after_dispatch_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_last_dispatch_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's final dispatch");
    expect(observation.scene.text).toContain("rain-bright morning");
    expect(observation.scene.text).toContain("record closes");
    expectIdealScore(observation.score);
  });

  it("lets Mara carry her last dispatch into the physical handoff after boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "ask_mara_for_train_car_dispatch",
      "wait_for_handoff_after_last_dispatch"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("crossing the platform instead of haunting it");
    expect(observation.state.flags.heard_mara_last_dispatch).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_goodbye",
      "confirm_mara_handoff_last_door"
    ]);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("keeps the direct release available after Mara's handoff beat", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "board_after_mara_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(choiceIds).toEqual(["pull_release", "listen_to_mara_after_handoff"]);
  });

  it("pays off Mara's handoff with a distinct ending after her final intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "board_after_mara_handoff",
      "listen_to_mara_after_handoff",
      "pull_release_after_handoff_goodbye"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is not only a voice");
    expect(observation.scene.text).toContain("holding them open");
    expectIdealScore(observation.score);
  });

  it("pays off the torn thumbprint when Mara leaves the booth", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "ask_mara_about_handoff_thumbprint_before_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_handoff_intercom");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.scene.text).toContain("same hand that tore the ledger");
    expect(observation.scene.text).toContain("witnessed the last door open");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_handoff",
      "carry_thumbprint_handoff_to_far_door"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expectIdealScore(observation.score);
  });

  it("surfaces Mara's torn-thumbprint handoff before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_boarding");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_mara_far_door_before_release",
      "ask_mara_about_handoff_thumbprint_before_boarding",
      "board_after_mara_handoff"
    ]);

    state = choose(story, state, "ask_mara_about_handoff_thumbprint_before_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_handoff_intercom");
    expect(observation.scene.text).toContain("same hand that tore the ledger");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_handoff",
      "carry_thumbprint_handoff_to_far_door"
    ]);

    state = choose(story, state, "carry_thumbprint_handoff_to_far_door");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expectIdealScore(observation.score);
  });

  it("uses manifest margin notes to bridge echoed and newspaper passenger routes", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.choices.map((choice) => choice.id)).toContain("read_passenger_manifest");

    state = choose(story, state, "read_passenger_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest");
    expect(observation.scene.text).toContain("every one still shut");
    expect(observation.scene.text).toContain("Mara's dispatcher row is set apart");
    expect(observation.state.flags.read_passenger_manifest).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_manifest_marginal_notes",
      "listen_to_manifest_doors_from_manifest",
      "return_to_signal_ledger_from_manifest"
    ]);

    state = choose(story, state, "read_manifest_marginal_notes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_notes");
    expect(observation.scene.text).toContain("Lenora Pike");
    expect(observation.scene.text).toContain("Eli Rose");
    expect(observation.scene.text).toContain("answer before opening");
    expect(observation.state.flags.read_manifest_marginal_notes).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_lenora_newspaper_note",
      "listen_after_manifest_notes",
      "return_from_manifest_notes"
    ]);

    const manifestNotesState = state;

    let newspaperState = choose(story, manifestNotesState, "follow_lenora_newspaper_note");
    observation = observe(story, newspaperState);

    expect(observation.scene.id).toBe("passenger_newspaper_memory");
    expect(observation.scene.text).toContain("Warden Street, then morning transfer");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "study_newspaper_transfer_column"
    );

    for (const choiceId of [
      "study_newspaper_transfer_column",
      "carry_newspaper_transfer_to_third_car",
      "hear_final_newspaper_roll_call",
      "pull_release_after_newspaper_roll_call"
    ]) {
      newspaperState = choose(story, newspaperState, choiceId);
    }

    observation = observe(story, newspaperState);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.text).toContain("blank transfer column fills with destinations");
    expectIdealScore(observation.score);

    state = choose(story, manifestNotesState, "return_from_manifest_notes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.objectives).toContain(
      "Open the kept-passenger manifest doors with Mara's badge proof."
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "clear_manifest_and_mara_from_ledger"
    );

    state = choose(story, state, "clear_manifest_and_mara_from_ledger");
    const openedManifestState = state;
    state = choose(story, state, "follow_opened_manifest_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("newspaper fold");
    expect(observation.scene.text).toContain("They ask to be followed");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.followed_opened_newspaper_fold).toBe(true);
    expect(observation.state.flags.heard_newspaper_memory).toBeUndefined();
    expect(observation.state.flags.studied_newspaper_transfer).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_listened_manifest_echoes",
      "follow_newspaper_fold_from_opened_echoes"
    ]);

    state = choose(story, state, "follow_newspaper_fold_from_opened_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);

    state = choose(story, state, "carry_newspaper_transfer_to_third_car");
    observation = observe(story, state);
    expect(observation.scene.id).toBe("passenger_newspaper_intercom");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);

    for (const choiceId of ["pull_release_after_gathered_intercom"]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.text).toContain("blank transfer column fills with destinations");
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "let_opened_manifest_names_answer_once");
    state = choose(story, state, "let_manifest_answers_keep_door_rhythm");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_manifest_intercom");
    expect(observation.scene.text).toContain("They keep time for people crossing it");

    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.text).toContain("they have become footsteps");
    expectIdealScore(observation.score);
  });

  it("lets ledger-first players pivot to the kept-passenger manifest before clearing Mara", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.choices.map((choice) => choice.id)).toContain("read_manifest_from_ledger");

    state = choose(story, state, "read_manifest_from_ledger");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest");
    expect(observation.state.flags.read_passenger_manifest).toBe(true);
    expect(observation.scene.text).toContain("every one still shut");
    expect(observation.scene.text).toContain("same badge proof that can open the rest");

    state = choose(story, state, "return_to_signal_ledger_from_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.objectives).toContain(
      "Open the kept-passenger manifest doors with Mara's badge proof."
    );
    expect(observation.objectives).not.toContain("Clear Mara's ledger entry with her badge proof.");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "clear_manifest_and_mara_from_ledger"
    );
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "mark_mara_clear_from_ledger"
    );

    for (const choiceId of [
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "board_third_car_with_passengers",
      "pull_release_with_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expectIdealScore(observation.score);
  });

  it("lets thumbprint-first players recover the kept-passenger manifest route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "read_manifest_after_thumbprint"
    );

    state = choose(story, state, "read_manifest_after_thumbprint");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest");
    expect(observation.state.flags.read_passenger_manifest).toBe(true);
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.scene.text).toContain("Mara's dispatcher row is set apart");

    for (const choiceId of [
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "board_with_echoed_manifest",
      "listen_to_echoed_manifest_from_boarding",
      "pull_release_after_echoed_manifest_goodbye"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.text).toContain("ordinary noise");
    expectIdealScore(observation.score);
  });

  it("adds a threshold beat before the direct passenger manifest release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain("hold_third_car_threshold");
    expect(
      observation.choices.find((choice) => choice.id === "hold_third_car_threshold")?.label
    ).toBe("Hold the third-car threshold open for every passenger");

    state = choose(story, state, "hold_third_car_threshold");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_boarding");
    expect(observation.scene.text).toContain("stand at the third-car threshold");
    expect(observation.scene.text).toContain("Each person leaves room for the next shoulder");
    expect(observation.scene.text).toContain("becoming a crowd");
    expect(observation.state.flags.held_passenger_threshold).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_threshold_from_boarding",
      "confirm_threshold_clearance_from_boarding",
      "reach_release_after_threshold_boarding"
    ]);

    state = choose(story, state, "listen_to_threshold_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("threshold you held");
    expect(observation.scene.text).toContain("each cleared inch becoming an invitation");
    expect(observation.scene.text).toContain("before the threshold remembers how to close");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_threshold_clearance_before_release",
      "pull_release_after_threshold_manifest"
    ]);

    state = choose(story, state, "pull_release_after_threshold_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_opened_threshold_from_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_intercom");
    expect(observation.scene.text).toContain("threshold you held");
    expect(observation.scene.text).toContain("each cleared inch becoming an invitation");
    expect(observation.state.flags.held_passenger_threshold).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "confirm_threshold_clearance_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_clearance_check");
    expect(observation.scene.text).toContain("the threshold makes one last count without numbers");
    expect(observation.scene.text).toContain("Threshold clear");
    expect(observation.state.flags.confirmed_threshold_clearance).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_threshold_clearance"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_threshold_clearance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "hold_third_car_threshold",
      "confirm_threshold_clearance_from_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_clearance_check");
    expect(observation.scene.text).toContain("the threshold makes one last count without numbers");
    expect(observation.scene.text).toContain("Threshold clear");
    expect(observation.state.flags.confirmed_threshold_clearance).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_confirmed_threshold_clearance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "hold_opened_manifest_threshold"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_boarding");
    expect(observation.scene.text).toContain("stand at the third-car threshold");
    expect(observation.scene.text).toContain("Each person leaves room for the next shoulder");
    expect(observation.state.flags.held_passenger_threshold).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBeUndefined();

    state = choose(story, state, "listen_to_threshold_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_intercom");
    expect(observation.scene.text).toContain("threshold you held");
    expect(observation.scene.text).toContain("each cleared inch becoming an invitation");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_threshold_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "hold_third_car_threshold",
      "reach_release_after_threshold_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_to_threshold_manifest_intercom"
    );
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_to_mara_manifest_intercom"
    );
  });

  it("lets direct manifest boarders make room for the passenger crowd", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.scene.text).toContain("emergency release waits under the first seat");
    expect(observation.scene.text).toContain("The direct path is already plain");
    expect(observation.scene.text).toContain(
      "get them aboard, reach under the first seat, and pull"
    );
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "make_room_for_passengers_in_third_car"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain("hold_third_car_threshold");
    const directReleaseIndex = observation.choices.findIndex(
      (choice) => choice.id === "board_third_car_with_passengers"
    );
    const makeRoomIndex = observation.choices.findIndex(
      (choice) => choice.id === "make_room_for_passengers_in_third_car"
    );

    expect(directReleaseIndex).toBeGreaterThan(-1);
    expect(directReleaseIndex).toBeLessThan(makeRoomIndex);
    expect(observation.choices[directReleaseIndex]?.label).toBe(
      "Board the third car and pull the emergency release"
    );
    expect(
      observation.choices.find((choice) => choice.id === "make_room_for_passengers_in_third_car")
        ?.label
    ).toBe("Make room inside the third car before reaching for the release");

    state = choose(story, state, "make_room_for_passengers_in_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_boarding");
    expect(observation.scene.text).toContain("the first seat has become more than");
    expect(observation.scene.text).toContain("crowded instead of haunted");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_making_room",
      "listen_to_room_made_for_passengers",
      "ask_conductor_to_clear_room_made",
      "unfold_newspaper_bundle_after_making_room",
      "reach_release_after_making_room"
    ]);

    const roomState = state;

    state = choose(story, roomState, "pass_room_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.scene.text).toContain("You do not pull the release alone");
    expect(observation.scene.text).toContain("room no one has to earn");
    expect(observation.state.flags.shared_release_reached).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_shared_release_after_making_room",
      "confirm_shared_room_release"
    ]);

    const sharedRoomReleaseState = state;

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);

    state = choose(story, sharedRoomReleaseState, "confirm_shared_room_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release_receipt");
    expect(observation.scene.text).toContain("the back row");
    expect(observation.scene.text).toContain("No hand is left out");
    expect(observation.state.flags.confirmed_shared_room_release).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_shared_room_release"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_shared_room_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expectIdealScore(observation.score);

    state = choose(story, roomState, "ask_conductor_to_clear_room_made");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_signal");
    expect(observation.scene.text).toContain("Platform clear");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_signal",
      "inspect_conductor_punch_memory",
      "follow_conductor_signal_to_third_car"
    ]);

    state = choose(story, state, "pull_release_on_conductor_signal");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expectIdealScore(observation.score);

    state = choose(story, roomState, "unfold_newspaper_bundle_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_memory");
    expect(observation.scene.text).toContain("Warden Street, then morning transfer");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();

    state = choose(story, state, "study_newspaper_transfer_column");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);

    state = choose(story, state, "carry_newspaper_transfer_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_intercom");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, roomState, "listen_to_room_made_for_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_intercom");
    expect(observation.scene.text).toContain("people making room for one another");
    expect(observation.scene.text).toContain("Proof that there is enough space");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_intercom",
      "pull_release_after_making_room"
    ]);

    state = choose(story, state, "pass_room_release_after_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.scene.text).toContain("You do not pull the release alone");
    expect(observation.scene.text).toContain("room no one has to earn");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);

    state = choose(story, roomState, "listen_to_room_made_for_passengers");
    observation = observe(story, state);

    state = choose(story, state, "pull_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);

    state = choose(story, roomState, "reach_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("pass_release_hand_to_hand");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_to_mara_manifest_intercom"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release_with_manifest");

    state = choose(story, state, "pass_release_hand_to_hand");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.scene.text).toContain("You do not pull the release alone");
    expect(observation.scene.text).toContain("everyone is allowed to share");
    expect(observation.scene.text).toContain("room no one has to earn");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players make room physically before the intercom payoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "make_room_from_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_boarding");
    expect(observation.scene.text).toContain("the first seat has become more than");
    expect(observation.scene.text).toContain("crowded instead of haunted");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.state.flags.saw_mara_manifest_handoff).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_making_room",
      "listen_to_room_made_for_passengers",
      "ask_conductor_to_clear_room_made",
      "unfold_newspaper_bundle_after_making_room",
      "reach_release_after_making_room"
    ]);

    state = choose(story, state, "listen_to_room_made_for_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_intercom");
    expect(observation.scene.text).toContain("people making room for one another");
    expect(observation.scene.text).toContain("Proof that there is enough space");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_intercom",
      "pull_release_after_making_room"
    ]);

    state = choose(story, state, "pass_room_release_after_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.scene.text).toContain("room no one has to earn");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expect(observation.scene.text).toContain("an empty aisle that finally belongs to no one");
    expectIdealScore(observation.score);
  });

  it("promotes the shared room-making release directly from opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "pass_shared_release_from_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.scene.text).toContain("You do not pull the release alone");
    expect(observation.scene.text).toContain("room no one has to earn");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.state.flags.shared_release_reached).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_shared_release_after_making_room",
      "confirm_shared_room_release"
    ]);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expectIdealScore(observation.score);
  });

  it("lets the opened passenger platform directly surface the room-making intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_as_passengers_make_room"
    );

    state = choose(story, state, "listen_as_passengers_make_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_intercom");
    expect(observation.scene.text).toContain("people making room for one another");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pass_room_release_after_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara's manifest handoff point players toward making room in the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.scene.text).toContain("asking for room");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "make_room_after_mara_manifest_handoff"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "hold_threshold_after_mara_manifest_handoff"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "finish_count_after_mara_manifest_handoff"
    );

    state = choose(story, state, "make_room_after_mara_manifest_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_boarding");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_making_room",
      "listen_to_room_made_for_passengers",
      "ask_conductor_to_clear_room_made",
      "unfold_newspaper_bundle_after_making_room",
      "reach_release_after_making_room"
    ]);

    state = choose(story, state, "listen_to_room_made_for_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pass_room_release_after_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("pays off Mara's opened manifest count before a direct passenger release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_and_confirm_opened_manifest_ready"
    );

    let openedDoorReadyState = choose(story, state, "board_and_confirm_opened_manifest_ready");
    observation = observe(story, openedDoorReadyState);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("footsteps under it");
    expect(observation.state.flags.heard_manifest_ready).toBe(true);
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_ready_manifest_after_opened_echoes"
    ]);

    openedDoorReadyState = choose(
      story,
      openedDoorReadyState,
      "confirm_ready_manifest_after_opened_echoes"
    );
    observation = observe(story, openedDoorReadyState);

    expect(observation.scene.id).toBe("passenger_manifest_ready_intercom");
    expect(observation.scene.text).toContain("Every kept name is aboard");
    expect(observation.state.flags.heard_manifest_ready).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_mara_finish_ready_manifest",
      "pull_release_with_ready_manifest"
    ]);

    const openedDoorDirectReleaseState = choose(
      story,
      openedDoorReadyState,
      "pull_release_with_ready_manifest"
    );
    observation = observe(story, openedDoorDirectReleaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    openedDoorReadyState = choose(
      story,
      openedDoorReadyState,
      "listen_to_mara_finish_ready_manifest"
    );
    openedDoorReadyState = choose(
      story,
      openedDoorReadyState,
      "pull_release_after_manifest_goodbye"
    );
    observation = observe(story, openedDoorReadyState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, state, "board_after_releasing_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_mara_finish_manifest_from_platform"
    );

    const manifestPlatformState = state;

    let platformIntercomState = choose(
      story,
      manifestPlatformState,
      "ask_mara_finish_manifest_from_platform"
    );
    observation = observe(story, platformIntercomState);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.scene.text).toContain("They remember the way out now");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_manifest_names_answer_once",
      "pull_release_after_manifest_goodbye"
    ]);

    platformIntercomState = choose(
      story,
      platformIntercomState,
      "pull_release_after_manifest_goodbye"
    );
    observation = observe(story, platformIntercomState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, manifestPlatformState, "board_third_car_with_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.read_passenger_manifest).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBeUndefined();
    expect(observation.state.flags.reviewed_open_manifest_count).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_mara_manifest_intercom",
      "confirm_manifest_passengers_are_aboard",
      "pull_release_with_manifest"
    ]);

    const manifestTrainState = state;

    let readyState = choose(story, manifestTrainState, "confirm_manifest_passengers_are_aboard");
    observation = observe(story, readyState);

    expect(observation.scene.id).toBe("passenger_manifest_ready_intercom");
    expect(observation.scene.text).toContain("Every kept name is aboard");
    expect(observation.scene.text).toContain("passenger list instead of a sentence");
    expect(observation.state.flags.heard_manifest_ready).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_mara_finish_ready_manifest",
      "pull_release_with_ready_manifest"
    ]);

    const readyDirectReleaseState = choose(story, readyState, "pull_release_with_ready_manifest");
    observation = observe(story, readyDirectReleaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    readyState = choose(story, readyState, "listen_to_mara_finish_ready_manifest");
    observation = observe(story, readyState);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.scene.text).toContain("They remember the way out now");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_manifest_names_answer_once",
      "pull_release_after_manifest_goodbye"
    ]);

    state = choose(story, state, "listen_to_mara_manifest_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.scene.text).toContain("each name answers with a small ordinary sound");
    expect(observation.scene.text).toContain("the line teaches them to wait again");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_manifest_names_answer_once",
      "pull_release_after_manifest_goodbye"
    ]);

    let directReleaseState = choose(story, state, "pull_release_after_manifest_goodbye");
    observation = observe(story, directReleaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expectIdealScore(observation.score);

    state = choose(story, state, "let_manifest_names_answer_once");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_answers");
    expect(observation.scene.text).toContain("a car full of people proving");
    expect(observation.state.flags.manifest_names_answered_once).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_manifest_answers_to_platform",
      "hand_manifest_answers_to_mara",
      "let_manifest_answers_keep_door_rhythm",
      "check_manifest_answers_against_echoes",
      "pull_release_after_manifest_answers"
    ]);

    let echoedCheckState = choose(story, state, "check_manifest_answers_against_echoes");
    observation = observe(story, echoedCheckState);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_checked_echoed_manifest_seats",
      "pull_release_after_checked_echoes"
    ]);

    echoedCheckState = choose(story, echoedCheckState, "pull_release_after_checked_echoes");
    observation = observe(story, echoedCheckState);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expectIdealScore(observation.score);

    state = choose(story, state, "pull_release_after_manifest_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expect(observation.scene.text).toContain("finish the count in morning air");
    expectIdealScore(observation.score);
  });

  it("pays off listening to passenger echoes before opening the manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    const passengerPlatformChoiceIds = observation.choices.map((choice) => choice.id);
    const echoedBoardingIndex = passengerPlatformChoiceIds.indexOf("board_with_echoed_manifest");
    expect(echoedBoardingIndex).toBeGreaterThan(-1);
    expect(echoedBoardingIndex).toBeLessThan(
      passengerPlatformChoiceIds.indexOf("ask_mara_to_sign_off_from_platform")
    );
    expect(observation.choices[echoedBoardingIndex]?.label).toBe(
      "Board with the door echoes and reach the emergency release"
    );
    expect(passengerPlatformChoiceIds).not.toContain("board_third_car_with_passengers");

    state = choose(story, state, "board_with_echoed_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.scene.text).toContain("sounds you heard behind the stamped");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_echoed_passengers_before_release",
      "listen_to_echoed_manifest_from_boarding",
      "reach_release_with_echoed_manifest"
    ]);

    state = choose(story, state, "check_echoed_passengers_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_echoes_to_speaker",
      "reach_release_after_checked_echoes"
    ]);

    state = choose(story, state, "carry_checked_echoes_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_manifest_intercom");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("same small sounds you heard behind the");
    expect(observation.scene.text).toContain("Now let the line hear them leaving");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_echoed_manifest_seats",
      "pull_release_after_echoed_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.text).toContain("ordinary noise");
    expectIdealScore(observation.score);
  });

  it("adds an optional echoed-seat receipt before the echo ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "let_opened_manifest_names_answer_once",
      "let_manifest_answers_keep_door_rhythm"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_manifest_intercom");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pause_for_echoed_boarding",
      "confirm_echoed_manifest_seats",
      "pull_release_after_echoed_manifest_goodbye"
    ]);

    state = choose(story, state, "confirm_echoed_manifest_seats");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.state.flags.confirmed_echoed_manifest_seats).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_checked_echoed_manifest_seats",
      "pull_release_after_checked_echoes"
    ]);

    state = choose(story, state, "confirm_checked_echoed_manifest_seats");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_seat_receipt");
    expect(observation.scene.text).toContain("Every echo is aboard");
    expect(observation.state.flags.confirmed_echoed_manifest_seats).toBe(true);
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_echoed_seat_receipt"
    ]);

    state = choose(story, state, "pull_release_after_echoed_seat_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets echoed passengers be checked before reaching the release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "board_with_echoed_manifest",
      "check_echoed_passengers_before_release",
      "reach_release_after_checked_echoes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "follow_echoes_back_to_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_to_echoed_manifest_intercom"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_checked_echoed_boarding"
    );

    state = choose(story, state, "pull_release_after_checked_echoed_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expectIdealScore(observation.score);
  });

  it("recovers echoed passenger boarding after a Mara sign-off train-car detour", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_sign_off_opened_manifest",
      "board_after_passenger_mara_signoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "follow_echoes_back_to_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_to_echoed_manifest_intercom"
    );

    state = choose(story, state, "follow_echoes_back_to_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.scene.text).toContain("waiting has turned into boarding");

    state = choose(story, state, "reach_release_with_echoed_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "follow_echoes_back_to_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_echoed_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "pull_release_with_manifest"
    );

    state = choose(story, state, "listen_to_echoed_manifest_intercom");
    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expectIdealScore(observation.score);
  });

  it("recovers echoed passenger boarding after hearing the train-car intercom first", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_sign_off_opened_manifest",
      "board_after_passenger_mara_signoff",
      "listen_to_echoed_manifest_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_manifest_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("pause_for_echoed_boarding");

    state = choose(story, state, "pause_for_echoed_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_to_echoed_manifest_from_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_echoed_passengers_before_release",
      "pull_release_after_echoed_boarding"
    ]);

    state = choose(story, state, "pull_release_after_echoed_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_checked_echoed_manifest_seats",
      "pull_release_after_checked_echoes"
    ]);

    state = choose(story, state, "pull_release_after_checked_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expectIdealScore(observation.score);
  });

  it("adds a one-time Mara handoff beat after opening the passenger manifest", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds[0]).toBe("watch_mara_open_manifest");

    state = choose(story, state, "watch_mara_open_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.scene.text).toContain("steadiness can be handed from name to name");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_during_mara_manifest_handoff",
      "board_after_mara_manifest_handoff",
      "listen_to_manifest_handoff_from_handoff",
      "ask_mara_signoff_after_manifest_handoff",
      "ask_mara_about_morning_after_manifest_handoff",
      "make_room_after_mara_manifest_handoff",
      "hold_threshold_after_mara_manifest_handoff",
      "finish_count_after_mara_manifest_handoff",
      "touch_mara_manifest_thumbprint",
      "continue_manifest_handoff_roll_call",
      "board_with_mara_answered_handoff",
      "return_from_mara_manifest_handoff"
    ]);

    state = choose(story, state, "return_from_mara_manifest_handoff");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds).not.toContain("watch_mara_open_manifest");
    expect(choiceIds).toContain("carry_mara_manifest_handoff_from_opened_doors");
    expect(choiceIds).toContain("board_with_opened_handoff_answers");
    expect(choiceIds).toContain("listen_to_passenger_answers");
    expect(choiceIds).toContain("board_after_releasing_passengers");
  });

  it("lets the opened manifest handoff continue into Mara's passenger sign-off", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "ask_mara_signoff_after_manifest_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mara_signoff");
    expect(observation.scene.text).toContain("You are not late. You were held.");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("gather_after_mara_signoff");

    state = choose(story, state, "gather_after_mara_signoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_gathered_boarding"
    );
  });

  it("promotes Mara's opened-door handoff directly from the manifest hub", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds[0]).toBe("watch_mara_open_manifest");
    expect(choiceIds[1]).toBe("carry_mara_handoff_as_doors_open");

    state = choose(story, state, "carry_mara_handoff_as_doors_open");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.scene.text).toContain("steadiness can be handed from name to name");
    expect(observation.scene.text).toContain(
      "asking for room as plainly as it asks for the release"
    );
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_during_mara_manifest_handoff",
      "board_after_mara_manifest_handoff",
      "listen_to_manifest_handoff_from_handoff",
      "ask_mara_signoff_after_manifest_handoff",
      "ask_mara_about_morning_after_manifest_handoff",
      "make_room_after_mara_manifest_handoff",
      "hold_threshold_after_mara_manifest_handoff",
      "finish_count_after_mara_manifest_handoff",
      "touch_mara_manifest_thumbprint",
      "continue_manifest_handoff_roll_call",
      "board_with_mara_answered_handoff",
      "return_from_mara_manifest_handoff"
    ]);

    state = choose(story, state, "board_after_mara_manifest_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff_intercom");
    expect(observation.scene.text).toContain("called every stamped door");
    expect(observation.scene.text).toContain("they still sound like people");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_goodbye",
      "confirm_manifest_handoff_doors"
    ]);

    state = choose(story, state, "pull_release_after_manifest_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is still mid-handoff");
    expectIdealScore(observation.score);
  });

  it("carries Mara's opened-door handoff from the manifest hub into its intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "return_from_mara_manifest_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_mara_manifest_handoff_from_opened_doors"
    );

    state = choose(story, state, "carry_mara_manifest_handoff_from_opened_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff_intercom");
    expect(observation.scene.text).toContain("called every stamped door");
    expect(observation.scene.text).toContain("they still sound like people");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_goodbye",
      "confirm_manifest_handoff_doors"
    ]);

    state = choose(story, state, "confirm_manifest_handoff_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_door_check");
    expect(observation.scene.text).toContain("count by doors instead of page numbers");
    expect(observation.scene.text).toContain("Every stamped door has a living hand on it");
    expect(observation.state.flags.confirmed_manifest_handoff_doors).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_door_check"
    ]);

    state = choose(story, state, "pull_release_after_manifest_handoff_door_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets passenger-platform players ask Mara to sign off before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_mara_to_sign_off_from_platform"
    );

    state = choose(story, state, "ask_mara_to_sign_off_from_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mara_signoff");
    expect(observation.scene.text).toContain("no one boards alone");
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "cross_after_passenger_mara_signoff"
    );

    state = choose(story, state, "cross_after_passenger_mara_signoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "ask_mara_to_sign_off_from_platform"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_third_car_with_passengers"
    );

    state = choose(story, state, "board_third_car_with_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release_with_manifest");

    state = choose(story, state, "pull_release_with_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("can release during Mara's opened-door handoff without the intercom detour", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_during_mara_manifest_handoff"
    );

    state = choose(story, state, "pull_release_during_mara_manifest_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is still mid-handoff");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the opened manifest handoff board into answered passengers from the hub", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "return_from_mara_manifest_handoff",
      "board_with_opened_handoff_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.scene.text).toContain("handoff instead of a duty");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    state = choose(story, state, "listen_to_answered_handoff_after_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_handoff_intercom",
      "confirm_answered_handoff_thresholds"
    ]);

    const intercomState = state;
    state = choose(story, state, "pull_release_after_answered_handoff_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, intercomState, "confirm_answered_handoff_thresholds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_check");
    expect(observation.scene.text).toContain("every answer has crossed into rain");
    expect(observation.state.flags.confirmed_answered_handoff_thresholds).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_answered_handoff"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_answered_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara's manifest handoff lead directly into the threshold beat", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "hold_threshold_after_mara_manifest_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_boarding");
    expect(observation.scene.text).toContain("stand at the third-car threshold");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.held_passenger_threshold).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_threshold_from_boarding",
      "confirm_threshold_clearance_from_boarding",
      "reach_release_after_threshold_boarding"
    ]);

    state = choose(story, state, "listen_to_threshold_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_threshold_intercom");
    expect(observation.scene.text).toContain("threshold you held");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_threshold_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara's manifest handoff continue into answered passenger boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "continue_manifest_handoff_roll_call",
      "board_after_passenger_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.scene.text).toContain("the opened passengers answer");
    expect(observation.scene.text).toContain("handoff instead of a duty");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    state = choose(story, state, "listen_to_answered_handoff_after_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("Mara began at the opened manifest");
  });

  it("keeps Mara's manifest handoff available after listening to passenger answers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "continue_manifest_handoff_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_mara_handoff_after_answers"
    );

    state = choose(story, state, "board_with_mara_handoff_after_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBeUndefined();
    expect(observation.scene.text).toContain("called every stamped door");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_goodbye",
      "confirm_manifest_handoff_doors"
    ]);

    state = choose(story, state, "pull_release_after_manifest_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara's manifest handoff board directly with answered passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "board_with_mara_answered_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.scene.text).toContain("handoff instead of a duty");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    state = choose(story, state, "listen_to_answered_handoff_after_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_intercom");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_handoff_intercom",
      "confirm_answered_handoff_thresholds"
    ]);

    state = choose(story, state, "pull_release_after_answered_handoff_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds an optional opened-manifest count before the passenger roll call", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds[0]).toBe("watch_mara_open_manifest");
    expect(choiceIds[1]).toBe("carry_mara_handoff_as_doors_open");
    expect(observation.choices[1]?.label).toBe("Carry Mara's opened-door handoff to the third car");
    expect(choiceIds[2]).toBe("ask_mara_to_sign_off_opened_manifest");
    expect(observation.choices[2]?.label).toBe(
      "Ask Mara to sign off before the opened passengers board"
    );
    expect(choiceIds[3]).toBe("listen_to_passenger_morning_chorus");
    expect(observation.choices[3]?.label).toBe(
      "Listen for what the opened passengers remember about morning"
    );
    expect(choiceIds[4]).toBe("review_open_manifest_count");
    expect(observation.choices[4]?.label).toBe(
      "Review the opened count so every passenger checks in"
    );
    expect(choiceIds[5]).toBe("board_with_completed_opened_count");
    expect(observation.choices[5]?.label).toBe(
      "Board after the opened passengers finish the count together"
    );
    expect(choiceIds[6]).toBe("board_with_opened_manifest_reviewed_count");
    expect(observation.choices[6]?.label).toBe(
      "Review Mara's opened count before carrying it to the speaker"
    );
    expect(choiceIds[7]).toBe("help_opened_passengers_gather");
    expect(observation.choices[7]?.label).toBe(
      "Help the opened passengers gather by helping one another board"
    );
    expect(choiceIds[8]).toBe("ask_conductor_punch_from_opened_manifest");
    expect(observation.choices[8]?.label).toBe(
      "Ask the old conductor to punch a clear path for the opened passengers"
    );
    expect(choiceIds[9]).toBe("check_lunch_tin_count_from_opened_manifest");
    expect(observation.choices[9]?.label).toBe(
      "Check the lunch-tin worker's passenger count before boarding"
    );
    expect(observation.choices[9]?.choiceGroup).toBe("Lunch tin / shift count");
    expect(choiceIds[10]).toBe("hold_opened_manifest_threshold");
    expect(observation.choices[10]?.label).toBe(
      "Hold the third-car threshold while Mara keeps the speaker open"
    );
    expect(choiceIds[11]).toBe("listen_to_opened_threshold_from_manifest");
    expect(observation.choices[11]?.label).toBe(
      "Let Mara talk you through holding the opened threshold"
    );
    expect(choiceIds[12]).toBe("notice_manifest_thumbprint_from_opened_doors");
    expect(observation.choices[12]?.label).toBe(
      "Notice Mara's torn thumbprint in the opened manifest"
    );
    expect(choiceIds[13]).toBe("carry_manifest_thumbprint_oath_from_opened_doors");
    expect(observation.choices[13]?.label).toBe(
      "Carry Mara's torn thumbprint oath straight to the third-car speaker"
    );
    expect(choiceIds[14]).toBe("return_opened_manifest_mitten");
    expect(observation.choices[14]?.label).toBe(
      "Return the opened manifest's lost mitten to the child"
    );
    expect(choiceIds.indexOf("review_open_manifest_count")).toBeLessThan(
      choiceIds.indexOf("help_opened_passengers_gather")
    );
    expect(choiceIds.indexOf("board_with_completed_opened_count")).toBeLessThan(
      choiceIds.indexOf("help_opened_passengers_gather")
    );
    expect(choiceIds.indexOf("board_with_opened_manifest_reviewed_count")).toBeLessThan(
      choiceIds.indexOf("help_opened_passengers_gather")
    );
    expect(choiceIds.indexOf("help_opened_passengers_gather")).toBeLessThan(
      choiceIds.indexOf("hold_opened_manifest_threshold")
    );
    expect(choiceIds.indexOf("ask_conductor_punch_from_opened_manifest")).toBeLessThan(
      choiceIds.indexOf("hold_opened_manifest_threshold")
    );
    expect(choiceIds.indexOf("check_lunch_tin_count_from_opened_manifest")).toBeLessThan(
      choiceIds.indexOf("hold_opened_manifest_threshold")
    );
    expect(choiceIds.indexOf("check_lunch_tin_count_from_opened_manifest")).toBeLessThan(
      choiceIds.indexOf("follow_lunch_tin_latch")
    );
    expect(choiceIds).toContain("study_opened_newspaper_transfer");
    expect(choiceIds).toContain("ask_conductor_punch_from_opened_manifest");
    expect(choiceIds).toContain("let_opened_passengers_finish_count");
    expect(choiceIds).toContain("listen_to_passenger_answers");
    expect(choiceIds).toContain("board_after_releasing_passengers");

    const openedManifestState = state;

    let directLunchTinState = choose(story, openedManifestState, "follow_lunch_tin_latch");
    observation = observe(story, directLunchTinState);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.set_lunch_tin_pace).toBe(true);
    expect(observation.score.awards.some((award) => award.id === "flag_set_lunch_tin_pace")).toBe(
      true
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_lunch_tin_intercom"
    );

    directLunchTinState = choose(
      story,
      directLunchTinState,
      "pull_release_after_lunch_tin_intercom"
    );
    observation = observe(story, directLunchTinState);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "check_lunch_tin_count_from_opened_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.scene.text).toContain("Nobody is only a number now");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.set_lunch_tin_pace).toBe(true);
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_lunch_tin_count_to_speaker",
      "turn_checked_lunch_tin_count_into_roll_call",
      "let_lunch_tin_worker_count_himself",
      "pull_release_after_checked_lunch_tin_count"
    ]);

    const checkedLunchTinState = state;

    let selfCountState = choose(story, checkedLunchTinState, "let_lunch_tin_worker_count_himself");
    observation = observe(story, selfCountState);

    expect(observation.scene.id).toBe("passenger_lunch_tin_self_count");
    expect(observation.scene.text).toContain("the person doing the counting");
    expect(observation.scene.text).toContain("has not disappeared inside the count");
    expect(observation.state.flags.counted_lunch_tin_worker_self).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_checked_lunch_tin_self_count"
    ]);

    selfCountState = choose(
      story,
      selfCountState,
      "pull_release_after_checked_lunch_tin_self_count"
    );
    observation = observe(story, selfCountState);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, checkedLunchTinState, "pull_release_after_checked_lunch_tin_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the lunch-tin worker's checked count");
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "study_opened_newspaper_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.scene.text).toContain("The blank transfer column is not blank anymore");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_conductor_to_punch_restored_transfer"
    );

    state = choose(story, openedManifestState, "call_lunch_tin_roster_from_opened_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster");
    expect(observation.scene.text).toContain("CLOCK OUT AFTER EVERYONE ELSE");
    expect(observation.scene.text).toContain("Dispatcher Vale");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_after_reading_lunch_tin_roster",
      "hear_roster_clock_out_roll_call",
      "confirm_lunch_tin_roster_proof_from_roster"
    ]);

    const openedManifestRosterState = state;

    state = choose(story, openedManifestRosterState, "confirm_lunch_tin_roster_proof_from_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_proof");
    expect(observation.state.flags.confirmed_lunch_tin_roster_proof).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_lunch_tin_roster"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, openedManifestRosterState, "hear_roster_clock_out_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.scene.text).toContain("The worker reads the roster");
    expect(observation.scene.text).toContain("counted him without keeping him");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_lunch_tin_roster_proof_before_release",
      "pull_release_after_lunch_tin_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_lunch_tin_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("lunch-tin worker's count");
    expect(observation.scene.text).toContain("row of clocked-out names");
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "ready_opened_manifest_for_mara");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_manifest_ready).toBe(true);
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_ready_manifest_after_opened_echoes"
    ]);

    state = choose(story, state, "confirm_ready_manifest_after_opened_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_ready_intercom");
    expect(observation.scene.text).toContain("Every kept name is aboard");
    expect(observation.scene.text).toContain("a passenger list instead of a sentence");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_manifest_ready).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_mara_finish_ready_manifest",
      "pull_release_with_ready_manifest"
    ]);

    const directReadyReleaseState = choose(story, state, "pull_release_with_ready_manifest");
    observation = observe(story, directReadyReleaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, state, "listen_to_mara_finish_ready_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_manifest_goodbye"
    );

    state = choose(story, openedManifestState, "review_open_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_count");
    expect(observation.scene.text).toContain("newspaper, lunch tin, child's mitten");
    expect(observation.scene.text).toContain("They need more than clearance");
    expect(observation.scene.text).toContain("checks whether everyone made it through");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_for_unanswered_manifest_row",
      "finish_reviewed_count_before_boarding",
      "board_with_reviewed_manifest_count",
      "listen_after_manifest_count",
      "follow_newspaper_transfer_after_manifest_count",
      "ask_conductor_after_manifest_count",
      "hear_conductor_count_after_manifest_count",
      "cross_after_manifest_count",
      "board_after_manifest_count"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "board_with_reviewed_manifest_count")
        ?.label
    ).toBe("Board with Mara's reviewed count already on the speaker");

    const countedState = state;

    state = choose(story, countedState, "finish_reviewed_count_before_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_manifest_intercom");
    expect(observation.scene.text).toContain("Mara brings the reviewed count");
    expect(observation.scene.text).toContain("counting one another home");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "let_passengers_finish_reviewed_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);

    state = choose(story, countedState, "listen_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("follow_newspaper_answer");
    expect(observation.choices.map((choice) => choice.id)).toContain("ask_conductor_from_answers");

    state = choose(story, countedState, "follow_newspaper_transfer_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.scene.text).toContain("The blank transfer column is not blank anymore");
    expect(observation.scene.text).toContain("checking the next stop instead of the last mistake");
    expect(observation.scene.text).toContain("proof they still get to arrive");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_conductor_to_punch_restored_transfer",
      "read_restored_transfer_into_roll_call",
      "carry_newspaper_transfer_to_third_car"
    ]);

    state = choose(story, state, "read_restored_transfer_into_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_roll_call");
    expect(observation.scene.text).toContain("a shared platform they can leave from");
    expect(observation.scene.text).toContain("not the place where the route ends");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);

    state = choose(story, state, "pull_release_after_newspaper_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain(
      "until the last passenger has found a street beyond the line"
    );
    expect(observation.scene.text).toContain("a schedule that can finally be kept");
    expectIdealScore(observation.score);

    state = choose(story, countedState, "hear_conductor_count_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count"
    ]);

    state = choose(story, state, "pull_release_after_conductor_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "ask_conductor_to_read_opened_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.scene.text).toContain("opened count folded against his punch");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count"
    ]);

    state = choose(story, state, "pull_release_after_conductor_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, countedState, "cross_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain("match_manifest_keepsakes");

    state = choose(story, countedState, "board_after_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened passengers finish the shared count directly from the manifest hub", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "let_opened_passengers_finish_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBeUndefined();
    expect(observation.state.flags.shared_count_release_ready).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_counted_chorus"
    ]);

    state = choose(story, state, "pull_release_after_counted_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened manifest players discover the passenger echo payoff after release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_opened_manifest_echoes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_listened_manifest_echoes",
      "board_with_listened_manifest_echoes",
      "follow_newspaper_fold_from_opened_echoes",
      "return_from_opened_manifest_echoes"
    ]);

    let checkedState = choose(story, state, "check_listened_manifest_echoes");
    observation = observe(story, checkedState);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_echoes_to_speaker",
      "reach_release_after_checked_echoes"
    ]);

    state = choose(story, state, "board_with_listened_manifest_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.scene.text).toContain("waiting has turned into boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);

    state = choose(story, state, "listen_to_echoed_manifest_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_manifest_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_echoed_manifest_seats",
      "pull_release_after_echoed_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("promotes opened door-echo listening near the top of opened manifest choices", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds.indexOf("pause_on_opened_door_echoes")).toBeLessThan(
      choiceIds.indexOf("board_with_passenger_morning_chorus")
    );

    state = choose(story, state, "pause_on_opened_door_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();

    state = choose(story, state, "board_with_listened_manifest_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);

    state = choose(story, state, "listen_to_echoed_manifest_from_boarding");
    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened manifest players listen to passenger echoes before boarding them", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_opened_manifest_echoes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_listened_manifest_echoes",
      "board_with_listened_manifest_echoes",
      "follow_newspaper_fold_from_opened_echoes",
      "return_from_opened_manifest_echoes"
    ]);

    const newspaperState = choose(story, state, "follow_newspaper_fold_from_opened_echoes");
    observation = observe(story, newspaperState);

    expect(observation.scene.id).toBe("passenger_newspaper_transfer");
    expect(observation.scene.text).toContain("The blank transfer column is not blank anymore");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_conductor_to_punch_restored_transfer",
      "read_restored_transfer_into_roll_call",
      "carry_newspaper_transfer_to_third_car"
    ]);

    observation = observe(
      story,
      choose(
        story,
        choose(story, newspaperState, "read_restored_transfer_into_roll_call"),
        "pull_release_after_newspaper_roll_call"
      )
    );

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const returnedState = choose(story, state, "return_from_opened_manifest_echoes");
    observation = observe(story, returnedState);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_after_listening_opened_manifest_echoes"
    );
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "follow_opened_manifest_echoes"
    );

    let returnedBoardingState = choose(
      story,
      returnedState,
      "board_after_listening_opened_manifest_echoes"
    );
    observation = observe(story, returnedBoardingState);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "check_echoed_passengers_before_release"
    );

    returnedBoardingState = choose(
      story,
      returnedBoardingState,
      "check_echoed_passengers_before_release"
    );
    returnedBoardingState = choose(story, returnedBoardingState, "carry_checked_echoes_to_speaker");
    returnedBoardingState = choose(
      story,
      returnedBoardingState,
      "pull_release_after_echoed_manifest_goodbye"
    );
    observation = observe(story, returnedBoardingState);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, state, "board_with_listened_manifest_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_boarding");
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "check_echoed_passengers_before_release"
    );

    state = choose(story, state, "check_echoed_passengers_before_release");
    state = choose(story, state, "carry_checked_echoes_to_speaker");
    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces opened door-echo listening directly from opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_with_opened_manifest_echoes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_listened_manifest_echoes",
      "board_with_listened_manifest_echoes",
      "follow_newspaper_fold_from_opened_echoes",
      "return_from_opened_manifest_echoes"
    ]);

    state = choose(story, state, "check_listened_manifest_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);

    state = choose(story, state, "carry_checked_echoes_to_speaker");
    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players check familiar door-echoes directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "check_opened_manifest_echoes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.scene.text).toContain("echoes are no longer clues");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBe(true);
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_echoes_to_speaker",
      "reach_release_after_checked_echoes"
    ]);

    state = choose(story, state, "carry_checked_echoes_to_speaker");
    state = choose(story, state, "pull_release_after_echoed_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("pays off a direct release after reviewing Mara's opened manifest count", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "board_after_manifest_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expect(observation.scene.text).toContain("someone else's proof");
    expectIdealScore(observation.score);
  });

  it("pays off the reviewed manifest count in the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "board_with_reviewed_manifest_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_manifest_intercom");
    expect(observation.scene.text).toContain("reviewed count");
    expect(observation.scene.text).toContain("newspaper, lunch tin");
    expect(observation.scene.text).toContain("counting one another home");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_passengers_finish_reviewed_count",
      "ask_who_reviewed_count_left_blank",
      "pull_release_before_reviewed_count_finishes",
      "pull_release_after_counted_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_counted_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expect(observation.scene.text).toContain("someone else's proof");
    expectIdealScore(observation.score);
  });

  it("lets the conductor's counted clear call hand back to Mara's reviewed speaker", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "hear_conductor_count_after_manifest_count",
      "hand_counted_clear_call_to_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_manifest_intercom");
    expect(observation.scene.text).toContain("Mara brings the reviewed count");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.checked_missing_passenger_count).toBe(true);
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_before_reviewed_count_finishes",
      "pull_release_after_counted_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_counted_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces the reviewed-count scene before the opened-manifest count reaches the speaker", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_with_opened_manifest_reviewed_count"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_count");
    expect(observation.scene.text).toContain("They need more than clearance");
    expect(observation.scene.text).toContain("checks whether everyone made it through");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "finish_reviewed_count_before_boarding"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_reviewed_manifest_count"
    );

    state = choose(story, state, "board_with_reviewed_manifest_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_manifest_intercom");
    expect(observation.scene.text).toContain("reviewed count");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_counted_manifest_goodbye"
    );

    state = choose(story, state, "pull_release_after_counted_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players board directly with the completed count", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_completed_opened_count"
    );

    const openedManifestState = state;

    state = choose(story, state, "board_with_completed_opened_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_counted_chorus",
      "pull_release_while_reviewed_count_holds"
    ]);

    state = choose(story, state, "pull_release_after_counted_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, openedManifestState, "board_with_completed_opened_count");
    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expectIdealScore(observation.score);
  });

  it("lets the reviewed count intercom pay off the reviewed-count ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "board_with_reviewed_manifest_count",
      "pull_release_before_reviewed_count_finishes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);

    state = choose(story, state, "pull_release_while_reviewed_count_holds");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_reviewed_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's reviewed count");
    expect(observation.scene.text).toContain("someone else's proof");
    expectIdealScore(observation.score);
  });

  it("lets Mara's manifest handoff lead directly to its third-car intercom", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "listen_to_manifest_handoff_from_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff_intercom");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBeUndefined();
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.scene.text).toContain("called every stamped door");
    expect(observation.scene.text).toContain("they still sound like people");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_goodbye",
      "confirm_manifest_handoff_doors"
    ]);

    state = choose(story, state, "pull_release_after_manifest_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("pays off Mara's manifest handoff before a direct passenger release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "return_from_mara_manifest_handoff",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBeUndefined();
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_mara_manifest_handoff_from_platform"
    );

    state = choose(story, state, "board_with_mara_manifest_handoff_from_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff_intercom");
    expect(observation.scene.text).toContain("called every stamped door");
    expect(observation.scene.text).toContain("they still sound like people");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_handoff_goodbye",
      "confirm_manifest_handoff_doors"
    ]);

    state = choose(story, state, "pull_release_after_manifest_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is still mid-handoff");
    expect(observation.scene.text).toContain("no longer a duty in one voice");
    expectIdealScore(observation.score);
  });

  it("pays off Mara's manifest thumbprint oath during the passenger handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "touch_mara_manifest_thumbprint"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_manifest_thumbprint_to_third_car",
      "board_after_manifest_thumbprint",
      "return_from_manifest_thumbprint"
    ]);

    const genericBoardingState = choose(story, state, "board_after_manifest_thumbprint");
    observation = observe(story, genericBoardingState);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_mara_manifest_thumbprint_intercom",
      "pull_release_with_manifest"
    ]);

    state = choose(story, state, "carry_manifest_thumbprint_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.scene.text).toContain("I thought that mark meant I had to be last");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_manifest_thumbprint_receipt",
      "pull_release_after_manifest_thumbprint_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's torn thumbprint lifts");
    expect(observation.scene.text).toContain("walks through with the crowd");
    expectIdealScore(observation.score);
  });

  it("lets manifest-thumbprint players confirm the oath reaches the opened passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "touch_mara_manifest_thumbprint",
      "carry_manifest_thumbprint_to_third_car",
      "confirm_manifest_thumbprint_receipt"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_receipt");
    expect(observation.scene.text).toContain("opened manifest answers in passenger order");
    expect(observation.scene.text).toContain("Received by the passengers");
    expect(observation.state.flags.confirmed_manifest_thumbprint_receipt).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_manifest_thumbprint_receipt"
    ]);

    state = choose(story, state, "pull_release_after_manifest_thumbprint_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's torn thumbprint lifts");
    expectIdealScore(observation.score);
  });

  it("lets thumbprint-first players recognize Mara's manifest oath during handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "read_manifest_after_thumbprint",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "recognize_mara_manifest_thumbprint_oath"
    );
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "touch_mara_manifest_thumbprint"
    );

    state = choose(story, state, "recognize_mara_manifest_thumbprint_oath");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("I thought that mark meant I had to be last");

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's torn thumbprint lifts");
    expectIdealScore(observation.score);
  });

  it("lets Mara's passenger sign-off surface the manifest thumbprint oath", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_sign_off_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mara_signoff");
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "notice_manifest_thumbprint_after_mara_signoff"
    );

    state = choose(story, state, "notice_manifest_thumbprint_after_mara_signoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint");
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_manifest_thumbprint_to_third_car"
    );

    state = choose(story, state, "carry_manifest_thumbprint_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("I thought that mark meant I had to be last");

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara's torn thumbprint lifts");
    expectIdealScore(observation.score);
  });

  it("lets Mara's opened-door handoff become a completed passenger count", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "finish_count_after_mara_manifest_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.scene.text).toContain("present finally means something again");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);

    state = choose(story, state, "pull_release_after_answered_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_counted_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets players recover Mara's thumbprint thread after returning to opened doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "return_from_mara_manifest_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "touch_manifest_thumbprint_from_opened_doors"
    );

    state = choose(story, state, "touch_manifest_thumbprint_from_opened_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint");
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);

    state = choose(story, state, "return_from_manifest_thumbprint");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_manifest_thumbprint_from_opened_doors"
    );

    state = choose(story, state, "carry_manifest_thumbprint_from_opened_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces Mara's manifest thumbprint directly from the opened doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "notice_manifest_thumbprint_from_opened_doors"
    );

    state = choose(story, state, "notice_manifest_thumbprint_from_opened_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint");
    expect(observation.scene.text).toContain("witness keeping the door open");
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_manifest_thumbprint_to_third_car"
    );

    state = choose(story, state, "carry_manifest_thumbprint_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("Let it mean I stayed long enough to leave");

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players carry Mara's thumbprint oath straight to the speaker", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_manifest_thumbprint_oath_from_opened_doors"
    );

    state = choose(story, state, "carry_manifest_thumbprint_oath_from_opened_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_thumbprint_intercom");
    expect(observation.state.flags.read_manifest_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.scene.text).toContain("Let it mean I stayed long enough to leave");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_manifest_thumbprint_receipt",
      "pull_release_after_manifest_thumbprint_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_manifest_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_thumbprint_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("walks through with the crowd");
    expectIdealScore(observation.score);
  });

  it("lets passenger answer listeners still help the released crowd gather", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "return_from_passenger_answers",
      "help_passengers_gather"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBeUndefined();
    expect(choiceIds).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "help_passengers_gather"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBeUndefined();
    expect(choiceIds).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);
  });

  it("lets answer listeners follow the lunch-tin count directly into the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "let_lunch_tin_worker_keep_count"
    );
    expect(
      observation.choices.find((choice) => choice.id === "let_lunch_tin_worker_keep_count")?.label
    ).toBe("Let the lunch-tin worker count the answered passengers aboard");

    state = choose(story, state, "let_lunch_tin_worker_keep_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_farewell");
    expect(observation.scene.text).toContain("packed for a double shift");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);

    state = choose(story, state, "return_from_passenger_farewell");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_boarding");
    expect(observation.scene.text).toContain("clicks the latch");
    expect(observation.scene.text).toContain("break room after the whistle");
    expect(observation.scene.text).toContain("count people without keeping them");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_lunch_tin_boarding",
      "let_lunch_tin_worker_count_himself_from_boarding",
      "check_lunch_tin_passengers_before_release",
      "read_lunch_tin_roster_from_boarding",
      "listen_to_lunch_tin_worker_from_boarding",
      "let_lunch_tin_count_become_roll_call"
    ]);

    const boardingState = state;

    state = choose(story, boardingState, "pull_release_after_lunch_tin_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.text).toContain("lunch-tin worker's count");
    expect(observation.scene.text).toContain("no longer a counter and no longer counted");
    expect(observation.scene.text).toContain("row of clocked-out names");
    expect(observation.scene.text).toContain("everyone got a break at last");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "let_lunch_tin_worker_count_himself_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_self_count");
    expect(observation.state.flags.checked_lunch_tin_passengers).toBeUndefined();
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.state.flags.counted_lunch_tin_worker_self).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_lunch_tin_self_count",
      "check_lunch_tin_passengers_after_self_count"
    ]);

    const selfCountFromBoardingState = state;

    state = choose(story, state, "pull_release_after_lunch_tin_self_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = selfCountFromBoardingState;
    state = choose(story, state, "check_lunch_tin_passengers_after_self_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);
    expect(observation.state.flags.counted_lunch_tin_worker_self).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_lunch_tin_count_to_speaker",
      "turn_checked_lunch_tin_count_into_roll_call",
      "pull_release_after_checked_lunch_tin_count"
    ]);

    state = choose(story, state, "pull_release_after_checked_lunch_tin_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "read_lunch_tin_roster_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster");
    expect(observation.scene.text).toContain("CLOCK OUT AFTER EVERYONE ELSE");
    expect(observation.scene.text).toContain("time card waiting for morning");
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_after_reading_lunch_tin_roster",
      "hear_roster_clock_out_roll_call",
      "confirm_lunch_tin_roster_proof_from_roster"
    ]);

    state = choose(story, state, "listen_after_reading_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.scene.text).toContain("Mara's badge is visible at the release");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_lunch_tin_passengers_from_intercom",
      "hear_final_lunch_tin_roll_call",
      "pull_release_after_roster_lunch_tin_intercom"
    ]);

    state = choose(story, state, "pull_release_after_roster_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the roster clocks everyone out");
    expect(observation.scene.text).toContain("one final line through his own overtime");
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "read_lunch_tin_roster_from_boarding");
    observation = observe(story, state);

    state = choose(story, state, "confirm_lunch_tin_roster_proof_from_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_proof");
    expect(observation.scene.text).toContain("All time cards closed");
    expect(observation.state.flags.confirmed_lunch_tin_roster_proof).toBe(true);

    state = choose(story, state, "pull_release_after_confirmed_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("each proof of return is already written");
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "listen_to_lunch_tin_worker_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.scene.text).toContain("the conductor has room to raise his punch");

    state = choose(story, state, "pull_release_after_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "check_lunch_tin_passengers_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.scene.text).toContain("Nobody is only a number now");
    expect(observation.scene.text).toContain("nobody is hidden behind the word passenger");
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_lunch_tin_count_to_speaker",
      "turn_checked_lunch_tin_count_into_roll_call",
      "let_lunch_tin_worker_count_himself",
      "pull_release_after_checked_lunch_tin_count"
    ]);

    const checkedLunchTinState = state;

    state = choose(story, checkedLunchTinState, "pull_release_after_checked_lunch_tin_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the lunch-tin worker's checked count");
    expectIdealScore(observation.score);

    state = checkedLunchTinState;
    state = choose(story, state, "carry_checked_lunch_tin_count_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_lunch_tin_roster",
      "hear_final_lunch_tin_roll_call",
      "pull_release_after_checked_lunch_tin_intercom"
    ]);

    state = choose(story, state, "pull_release_after_checked_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the lunch-tin worker's checked count");
    expect(observation.scene.text).toContain("no missed count left to keep");
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "let_lunch_tin_count_become_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.scene.text).toContain("The worker reads the roster");
    expect(observation.scene.text).toContain("draw one slow line through the overtime");
    expect(observation.scene.text).toContain("counted him without keeping him");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_lunch_tin_roster_proof_before_release",
      "pull_release_after_lunch_tin_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_lunch_tin_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("lunch-tin worker's count");
    expect(observation.scene.text).toContain("row of clocked-out names");
    expectIdealScore(observation.score);

    state = boardingState;
    state = choose(story, state, "listen_to_lunch_tin_worker_from_boarding");
    state = choose(story, state, "check_lunch_tin_passengers_from_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);

    state = choose(story, state, "turn_checked_lunch_tin_count_into_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);

    state = boardingState;
    state = choose(story, state, "listen_to_lunch_tin_worker_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(
      observation.choices.find((choice) => choice.id === "hear_final_lunch_tin_roll_call")?.label
    ).toBe("Let the lunch-tin worker read the roster as the final roll call");

    state = choose(story, state, "hear_final_lunch_tin_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.scene.text).toContain("The worker reads the roster");
    expect(observation.scene.text).toContain("time clock nobody has to punch again");
    expect(observation.scene.text).toContain("counted him without keeping him");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_lunch_tin_roster_proof_before_release",
      "pull_release_after_lunch_tin_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_lunch_tin_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("everyone got a break at last");
    expectIdealScore(observation.score);
  });

  it("adds an optional lunch-tin roster proof before the lunch-tin ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "let_lunch_tin_worker_keep_count",
      "return_from_passenger_farewell",
      "listen_to_lunch_tin_worker_from_boarding",
      "read_lunch_tin_roster"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster");
    expect(observation.scene.text).toContain("CLOCK OUT AFTER EVERYONE ELSE");
    expect(observation.scene.text).toContain("Dispatcher Vale");
    expect(observation.state.flags.read_lunch_tin_roster).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_after_reading_lunch_tin_roster",
      "hear_roster_clock_out_roll_call",
      "confirm_lunch_tin_roster_proof_from_roster"
    ]);

    state = choose(story, state, "hear_roster_clock_out_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.scene.text).toContain("like the end of a shift");
    expect(observation.scene.text).toContain("The tin latch shuts once");
    expect(observation.scene.text).toContain("counted him without keeping him");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_lunch_tin_roster_proof_before_release",
      "pull_release_after_lunch_tin_roll_call"
    ]);

    state = choose(story, state, "confirm_lunch_tin_roster_proof_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_proof");
    expect(observation.scene.text).toContain("All time cards closed");
    expect(observation.scene.text).toContain("the shift is finished");
    expect(observation.state.flags.confirmed_lunch_tin_roster_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_lunch_tin_roster"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the roster clocks everyone out");
    expectIdealScore(observation.score);
  });

  it("adds a lunch-tin roster roll call before the lunch-tin ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "let_lunch_tin_worker_keep_count",
      "return_from_passenger_farewell",
      "read_lunch_tin_roster_from_boarding",
      "hear_roster_clock_out_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roll_call");
    expect(observation.scene.text).toContain("like the end of a shift");
    expect(observation.scene.text).toContain("old conductor gives one clear punch");
    expect(observation.scene.text).toContain("counted him without keeping him");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "confirm_lunch_tin_roster_proof_before_release",
      "pull_release_after_lunch_tin_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_lunch_tin_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("lunch-tin worker's count");
    expect(observation.scene.text).toContain("everyone got a break at last");
    expectIdealScore(observation.score);
  });

  it("lets platform explorers ask the lunch-tin worker to set the boarding pace", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_lunch_tin_worker_to_set_pace"
    );

    state = choose(story, state, "ask_lunch_tin_worker_to_set_pace");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_farewell");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);

    state = choose(story, state, "return_from_passenger_farewell");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_boarding");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_lunch_tin_boarding",
      "let_lunch_tin_worker_count_himself_from_boarding",
      "check_lunch_tin_passengers_before_release",
      "read_lunch_tin_roster_from_boarding",
      "listen_to_lunch_tin_worker_from_boarding",
      "let_lunch_tin_count_become_roll_call"
    ]);

    state = choose(story, state, "listen_to_lunch_tin_worker_from_boarding");
    state = choose(story, state, "read_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster");

    state = choose(story, state, "confirm_lunch_tin_roster_proof_from_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_proof");
    expect(observation.scene.text).toContain("All time cards closed");

    state = choose(story, state, "pull_release_after_confirmed_lunch_tin_roster");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_roster_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("time card waits on the seat");
    expectIdealScore(observation.score);
  });

  it("lets manifest explorers follow the lunch-tin latch before crossing the platform", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "follow_lunch_tin_latch"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.set_lunch_tin_pace).toBe(true);

    state = choose(story, state, "pull_release_after_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets answer listeners ask the conductor to gather passengers by signal", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(choiceIds).toEqual([
      "follow_newspaper_answer",
      "gather_answered_passengers",
      "let_lunch_tin_worker_keep_count",
      "make_room_after_answered_names",
      "ask_conductor_punch_from_answers",
      "ask_conductor_from_answers",
      "return_from_passenger_answers",
      "carry_answered_names_to_intercom",
      "board_after_answered_passengers"
    ]);

    const answeredState = state;

    state = choose(story, answeredState, "make_room_after_answered_names");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_boarding");
    expect(observation.scene.text).toContain("ordinary space");
    expect(observation.state.flags.made_room_for_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_room_release_after_making_room",
      "listen_to_room_made_for_passengers",
      "ask_conductor_to_clear_room_made",
      "unfold_newspaper_bundle_after_making_room",
      "reach_release_after_making_room"
    ]);

    state = choose(story, state, "listen_to_room_made_for_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pass_room_release_after_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_room_release");
    expect(observation.state.flags.shared_release_reached).toBe(true);

    state = choose(story, state, "pull_shared_release_after_making_room");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, answeredState, "ask_conductor_punch_from_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_punch_memory");
    expect(observation.scene.text).toContain("Tonight I can punch clear instead");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_punch_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_punch_memory_to_third_car"
    ]);

    state = choose(story, state, "follow_punch_memory_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_intercom");
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_clear",
      "hear_final_conductor_roll_call",
      "ask_conductor_to_punch_transfer",
      "hold_for_conductor_roll_call_before_release"
    ]);

    state = choose(story, state, "hear_final_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    const conductorRollCallState = state;
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = choose(story, conductorRollCallState, "pull_release_after_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expectIdealScore(observation.score);

    state = choose(story, conductorRollCallState, "confirm_conductor_clearance_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_clearance_check");
    expect(observation.scene.text).toContain("one door at a time");
    expect(observation.scene.text).toContain("every open door");
    expect(observation.state.flags.confirmed_conductor_clearance).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_conductor_clearance"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_conductor_clearance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expectIdealScore(observation.score);

    state = choose(story, answeredState, "ask_conductor_from_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_signal");
    expect(observation.scene.text).toContain("Platform clear");
    expect(observation.scene.text).toContain("let another worker hold the line");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_signal",
      "inspect_conductor_punch_memory",
      "follow_conductor_signal_to_third_car"
    ]);

    const conductorSignalState = state;

    state = choose(story, conductorSignalState, "pull_release_on_conductor_signal");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, conductorSignalState, "inspect_conductor_punch_memory");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_punch_memory");
    expect(observation.scene.text).toContain("each star-shaped bite");
    expect(observation.scene.text).toContain("Tonight I can punch clear instead");
    expect(observation.state.flags.heard_conductor_punch_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_punch_memory_to_third_car"
    ]);

    state = choose(story, state, "follow_punch_memory_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_intercom");
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_clear",
      "hear_final_conductor_roll_call",
      "ask_conductor_to_punch_transfer",
      "hold_for_conductor_roll_call_before_release"
    ]);

    state = conductorSignalState;
    state = choose(story, state, "follow_conductor_signal_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.scene.text).toContain("not punching tickets");
    expect(observation.scene.text).toContain("clear for Mara");
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = choose(story, state, "pull_release_after_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expectIdealScore(observation.score);

    state = choose(story, conductorSignalState, "inspect_conductor_punch_memory");
    state = choose(story, state, "follow_punch_memory_to_third_car");
    const conductorIntercomState = state;
    observation = observe(story, conductorIntercomState);

    expect(observation.scene.id).toBe("passenger_conductor_intercom");
    expect(observation.scene.text).toContain("emergency release waits in your hand");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_clear",
      "hear_final_conductor_roll_call",
      "ask_conductor_to_punch_transfer",
      "hold_for_conductor_roll_call_before_release"
    ]);

    state = choose(story, conductorIntercomState, "pull_release_on_conductor_clear");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expect(observation.scene.text).toContain("another worker's voice");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, conductorIntercomState, "ask_conductor_to_punch_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer");
    expect(observation.scene.text).toContain("Valid for morning");
    expect(observation.scene.text).toContain("star-shaped hole");
    expect(observation.scene.text).toContain("already knows a stop beyond Warden Street");
    expect(observation.scene.text).toContain("instead of circling back");
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_punched_transfer_to_child",
      "press_punched_transfer_to_speaker",
      "pull_release_with_punched_transfer",
      "hear_transfer_conductor_roll_call",
      "hold_for_transfer_conductor_roll_call"
    ]);

    const conductorTransferState = state;

    state = choose(story, conductorTransferState, "pull_release_with_punched_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, conductorTransferState, "press_punched_transfer_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("The star hole lines up with Mara's voice");
    expect(observation.scene.text).toContain("the aisle becomes a transfer platform");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_transfer_proof",
      "check_punched_transfer_stops"
    ]);

    const transferProofState = state;

    state = choose(story, state, "pull_release_after_transfer_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, transferProofState, "check_punched_transfer_stops");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_stop_check");
    expect(observation.scene.text).toContain(
      "lets each passenger look through the star-shaped cut"
    );
    expect(observation.scene.text).toContain("Then every stop is witnessed");
    expect(observation.state.flags.confirmed_transfer_stops).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_transfer_stop_check"
    ]);

    state = choose(story, state, "pull_release_after_transfer_stop_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_stop_checked_true_ending");
    expect(observation.scene.text).toContain("answered every stop");
    expect(observation.scene.text).toContain("door that knows where it is going");
    expectIdealScore(observation.score);

    state = choose(story, conductorTransferState, "pass_punched_transfer_to_child");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.scene.text).toContain("walks it to the ceiling speaker");
    expect(observation.scene.text).toContain("proof light enough to pass hand to hand");
    expect(observation.scene.text).toContain("a connection they are allowed to make");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "press_transfer_to_speaker_grille",
      "pull_release_after_transfer_handoff",
      "check_handoff_transfer_stops"
    ]);

    const transferHandoffState = state;

    state = choose(story, state, "press_transfer_to_speaker_grille");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("The star hole lines up with Mara's voice");
    expect(observation.scene.text).toContain("Now it belongs to them too");
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_transfer_proof",
      "check_punched_transfer_stops"
    ]);

    state = choose(story, state, "pull_release_after_transfer_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, transferHandoffState, "check_handoff_transfer_stops");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_stop_check");
    expect(observation.scene.text).toContain("every stop is witnessed");
    expect(observation.state.flags.confirmed_transfer_stops).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_transfer_stop_check"
    ]);

    state = choose(story, state, "pull_release_after_transfer_stop_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_stop_checked_true_ending");
    expect(observation.scene.text).toContain("star-cut ticket");
    expect(observation.scene.text).toContain("rain-bright platform");
    expectIdealScore(observation.score);

    state = choose(story, transferHandoffState, "pull_release_after_transfer_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, conductorTransferState, "hear_transfer_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_transfer",
      "pass_punched_transfer_from_roll_call"
    ]);

    const transferRollCallState = state;

    state = choose(story, state, "pass_punched_transfer_from_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);

    state = choose(story, transferRollCallState, "pull_release_after_conductor_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("star-shaped hole");
    expect(observation.scene.text).toContain("whatever stop each passenger still meant to reach");
    expect(observation.scene.text).toContain("Morning has already accepted the change");
    expectIdealScore(observation.score);

    state = conductorTransferState;
    state = choose(story, state, "hold_for_transfer_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.scene.text).toContain("not punching tickets");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_transfer",
      "pass_punched_transfer_from_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_conductor_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, conductorIntercomState, "hear_final_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.scene.text).toContain("not punching tickets");
    expect(observation.scene.text).toContain("clear for Mara");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = choose(story, state, "pull_release_after_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expectIdealScore(observation.score);

    state = conductorIntercomState;
    state = choose(story, state, "hold_for_conductor_roll_call_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.scene.text).toContain("not punching tickets");
    expect(observation.scene.text).toContain("clear for Mara");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);

    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = choose(story, state, "pull_release_after_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.text).toContain("conductor's clear signal");
    expect(observation.scene.text).toContain("not counting tickets anymore");
    expect(observation.scene.text).toContain("another worker's voice");
    expectIdealScore(observation.score);

    state = choose(story, answeredState, "return_from_passenger_answers");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(choiceIds).toEqual([
      "ask_newspaper_woman_about_stop",
      "ask_newspaper_woman_to_read_transfer_column",
      "ask_lunch_tin_worker_to_set_pace",
      "ask_conductor_to_call_platform_clear",
      "return_lost_mitten",
      "match_manifest_keepsakes",
      "help_passengers_gather",
      "board_third_car_with_passengers"
    ]);
  });

  it("pays off the reviewed manifest count on the conductor route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "ask_conductor_after_manifest_count",
      "follow_counted_conductor_signal_to_third_car"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.scene.text).toContain("opened count folded against his punch");
    expect(observation.scene.text).toContain("the count has become a crowd");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count"
    ]);

    state = choose(story, state, "pull_release_after_conductor_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("conductor's counted clear call");
    expect(observation.scene.text).toContain("the count has already become a crowd");
    expectIdealScore(observation.score);

    state = initialState(story);
    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "review_open_manifest_count",
      "ask_conductor_after_manifest_count",
      "inspect_conductor_punch_memory",
      "follow_punch_memory_to_third_car"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    expect(observation.scene.id).toBe("passenger_conductor_intercom");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_counted_conductor_roll_call",
      "ask_conductor_to_punch_transfer",
      "hold_for_conductor_count_before_release"
    ]);

    const conductorIntercomState = state;

    state = choose(story, conductorIntercomState, "hold_for_conductor_count_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.scene.text).toContain("opened count folded against his punch");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count"
    ]);

    state = choose(story, conductorIntercomState, "ask_conductor_to_punch_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer");
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_counted_transfer_conductor_roll_call",
      "hold_for_transfer_conductor_count"
    ]);

    const countedConductorTransferState = state;

    state = choose(story, state, "hear_counted_transfer_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.scene.text).toContain("opened count folded against his punch");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count_transfer",
      "pass_counted_punched_transfer_to_mara"
    ]);

    const countedTransferRollCallState = state;

    let handoffState = choose(
      story,
      countedTransferRollCallState,
      "pass_counted_punched_transfer_to_mara"
    );
    observation = observe(story, handoffState);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.scene.text).toContain("proof light enough to pass hand to hand");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "press_transfer_to_speaker_grille",
      "pull_release_after_transfer_handoff",
      "check_handoff_transfer_stops"
    ]);

    handoffState = choose(story, handoffState, "press_transfer_to_speaker_grille");
    observation = observe(story, handoffState);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("throwing one small morning-shaped mark");
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);

    handoffState = choose(story, handoffState, "pull_release_after_transfer_proof");
    observation = observe(story, handoffState);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(
      story,
      countedTransferRollCallState,
      "pull_release_after_conductor_count_transfer"
    );
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_true_ending");
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);

    state = choose(story, countedConductorTransferState, "hold_for_transfer_conductor_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_count_roll_call");
    expect(observation.scene.text).toContain("the count has become a crowd");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hand_counted_clear_call_to_mara",
      "pull_release_after_conductor_count_transfer",
      "pass_counted_punched_transfer_to_mara"
    ]);
  });

  it("lets opened-manifest play find the conductor transfer proof directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "ask_conductor_to_punch_opened_transfer"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer");
    expect(observation.scene.text).toContain("star-shaped hole");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pass_punched_transfer_to_child",
      "press_punched_transfer_to_speaker",
      "pull_release_with_punched_transfer",
      "hear_transfer_conductor_roll_call",
      "hold_for_transfer_conductor_roll_call"
    ]);

    state = choose(story, state, "press_punched_transfer_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("one small morning-shaped mark");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);

    state = choose(story, state, "pull_release_after_transfer_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);
  });

  it("promotes the conductor punch memory from opened manifest play", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds.indexOf("ask_conductor_punch_from_opened_manifest")).toBeGreaterThan(
      choiceIds.indexOf("help_opened_passengers_gather")
    );
    expect(choiceIds.indexOf("ask_conductor_punch_from_opened_manifest")).toBeLessThan(
      choiceIds.indexOf("hold_opened_manifest_threshold")
    );

    state = choose(story, state, "ask_conductor_punch_from_opened_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_punch_memory");
    expect(observation.scene.text).toContain("Tonight I can punch clear instead");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_punch_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_punch_memory_to_third_car"
    ]);

    state = choose(story, state, "follow_punch_memory_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_intercom");
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_on_conductor_clear",
      "hear_final_conductor_roll_call",
      "ask_conductor_to_punch_transfer",
      "hold_for_conductor_roll_call_before_release"
    ]);

    const promotedConductorIntercomState = state;

    state = choose(story, state, "hear_final_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = choose(story, state, "pull_release_after_conductor_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_true_ending");
    expect(observation.scene.ending).toBe(true);

    state = promotedConductorIntercomState;
    state = choose(story, state, "ask_conductor_to_punch_transfer");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer");
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);

    state = choose(story, state, "pass_punched_transfer_to_child");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.scene.text).toContain("proof light enough to pass hand to hand");
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);

    state = choose(story, state, "pull_release_after_transfer_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest play pass the conductor transfer straight to Mara", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pass_opened_transfer_to_mara"
    );

    state = choose(story, state, "pass_opened_transfer_to_mara");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_handoff");
    expect(observation.scene.text).toContain("walks it to the ceiling speaker");
    expect(observation.scene.text).toContain("proof light enough to pass hand to hand");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "press_transfer_to_speaker_grille",
      "pull_release_after_transfer_handoff",
      "check_handoff_transfer_stops"
    ]);

    state = choose(story, state, "press_transfer_to_speaker_grille");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("one small morning-shaped mark");
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);

    state = choose(story, state, "pull_release_after_transfer_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest play press the conductor transfer proof directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(choiceIds.indexOf("press_opened_transfer_to_speaker")).toBeGreaterThan(
      choiceIds.indexOf("ask_conductor_to_read_opened_count")
    );
    expect(choiceIds.indexOf("press_opened_transfer_to_speaker")).toBeLessThan(
      choiceIds.indexOf("let_opened_passengers_finish_count")
    );

    state = choose(story, state, "press_opened_transfer_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_proof");
    expect(observation.scene.text).toContain("one small morning-shaped mark");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.punched_conductor_transfer).toBe(true);
    expect(observation.state.flags.punched_transfer_carried_forward).toBe(true);
    expect(observation.state.flags.pressed_transfer_to_speaker).toBe(true);

    state = choose(story, state, "pull_release_after_transfer_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_conductor_transfer_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("punched transfer");
    expectIdealScore(observation.score);
  });

  it("pays off answered passenger roll call before a direct manifest release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "board_after_answered_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding");
    expect(observation.scene.text).toContain("board by repeating themselves");
    expect(observation.scene.text).toContain("carrying their own names now");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_answered_passengers_before_release",
      "listen_to_answered_passengers_from_boarding",
      "pull_release_after_answered_boarding"
    ]);

    const checkedState = choose(story, state, "check_answered_passengers_before_release");
    observation = observe(story, checkedState);

    expect(observation.scene.id).toBe("passenger_answered_check");
    expect(observation.scene.text).toContain("Every answer has a body behind it");
    expect(observation.state.flags.checked_answered_passengers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_checked_answers_into_newspaper_roll_call",
      "carry_checked_answers_to_speaker",
      "pull_release_after_checked_answers"
    ]);

    let newspaperRollCallState = choose(
      story,
      checkedState,
      "read_checked_answers_into_newspaper_roll_call"
    );
    observation = observe(story, newspaperRollCallState);

    expect(observation.scene.id).toBe("passenger_newspaper_roll_call");
    expect(observation.scene.text).toContain("transfer column into a route everyone can answer");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.state.flags.studied_newspaper_transfer).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_newspaper_roll_call",
      "confirm_newspaper_stops_before_release"
    ]);

    newspaperRollCallState = choose(
      story,
      newspaperRollCallState,
      "pull_release_after_newspaper_roll_call"
    );
    observation = observe(story, newspaperRollCallState);

    expect(observation.scene.id).toBe("passenger_newspaper_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    let checkedRelease = choose(story, checkedState, "pull_release_after_checked_answers");
    observation = observe(story, checkedRelease);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    checkedRelease = choose(story, checkedState, "carry_checked_answers_to_speaker");
    observation = observe(story, checkedRelease);

    expect(observation.scene.id).toBe("passenger_answered_intercom");
    expect(observation.state.flags.checked_answered_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_intercom"
    ]);

    state = choose(story, state, "listen_to_answered_passengers_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_intercom");
    expect(observation.scene.text).toContain("The passengers who answered roll call");
    expect(observation.scene.text).toContain("without asking Mara to prove them twice");
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_intercom",
      "confirm_answered_passenger_receipt"
    ]);

    const answeredIntercomState = state;
    state = choose(story, state, "pull_release_after_answered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the answered passengers do not");
    expect(observation.scene.text).toContain("their own voices carry the last name");
    expectIdealScore(observation.score);

    state = choose(story, answeredIntercomState, "confirm_answered_passenger_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_receipt");
    expect(observation.scene.text).toContain("ordinary proof");
    expect(observation.scene.text).toContain("no blank place left");
    expect(observation.state.flags.confirmed_answered_passenger_receipt).toBe(true);
    expect(observation.state.flags.checked_answered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_receipt"
    ]);

    state = choose(story, state, "pull_release_after_answered_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets answered passengers carry their names directly into the intercom payoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "carry_answered_names_to_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_intercom");
    expect(observation.scene.text).toContain("The passengers who answered roll call");
    expect(observation.scene.text).toContain("Pull the release before the line");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_intercom",
      "confirm_answered_passenger_receipt"
    ]);

    state = choose(story, state, "pull_release_after_answered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets answered passengers release directly from their boarding beat", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "board_after_answered_passengers",
      "pull_release_after_answered_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("answered names can fade");
    expect(observation.scene.text).toContain("carry it into morning themselves");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players board directly with answered passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_answered_passengers"
    );

    state = choose(story, state, "board_with_answered_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding");
    expect(observation.scene.text).toContain("board by repeating themselves");
    expect(observation.scene.text).toContain("carrying their own names now");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_answered_passengers_before_release",
      "listen_to_answered_passengers_from_boarding",
      "pull_release_after_answered_boarding"
    ]);

    state = choose(story, state, "listen_to_answered_passengers_from_boarding");
    state = choose(story, state, "pull_release_after_answered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players release directly after boarding with answered passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_with_answered_passengers",
      "pull_release_after_answered_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("answered names can fade");
    expect(observation.scene.text).toContain("carry it into morning themselves");
    expectIdealScore(observation.score);
  });

  it("lets answer listeners gather passengers directly into a broad boarding beat", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "gather_answered_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.scene.text).toContain("passing steadiness from hand to hand");
    expect(observation.scene.text).toContain("every passenger helped the next one move");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);
    expect(
      observation.choices.find((choice) => choice.id === "pull_release_after_gathered_boarding")
        ?.label
    ).toBe("Pull the release once every passenger is ready");

    state = choose(story, state, "pull_release_after_gathered_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("passengers helping one another down");
    expect(observation.scene.text).toContain("No one crosses alone");
    expectIdealScore(observation.score);
  });

  it("keeps the lunch-tin pacing route available as its own explicit branch", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "let_lunch_tin_worker_keep_count",
      "return_from_passenger_farewell"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_boarding");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_lunch_tin_boarding",
      "let_lunch_tin_worker_count_himself_from_boarding",
      "check_lunch_tin_passengers_before_release",
      "read_lunch_tin_roster_from_boarding",
      "listen_to_lunch_tin_worker_from_boarding",
      "let_lunch_tin_count_become_roll_call"
    ]);
  });

  it("lets platform echo listeners check the lunch-tin count into its own release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "listen_to_manifest_doors_from_manifest",
      "return_from_passenger_echoes",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    const platformChoiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(platformChoiceIds).toContain("check_lunch_tin_echo_count_from_platform");
    expect(platformChoiceIds.indexOf("check_lunch_tin_echo_count_from_platform")).toBeLessThan(
      platformChoiceIds.indexOf("help_passengers_gather")
    );

    state = choose(story, state, "check_lunch_tin_echo_count_from_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.set_lunch_tin_pace).toBe(true);
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);
    expect(observation.state.flags.counted_lunch_tin_worker_self).toBe(true);
    expect(observation.state.flags.checked_lunch_tin_echo_count).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_echo_checked_lunch_tin_count",
      "carry_checked_lunch_tin_count_to_speaker",
      "turn_checked_lunch_tin_count_into_roll_call"
    ]);

    state = choose(story, state, "pull_release_after_echo_checked_lunch_tin_count");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the lunch-tin worker's checked count");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players check the lunch-tin count directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "check_lunch_tin_count_from_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_check");
    expect(observation.scene.text).toContain("nobody is hidden behind the word passenger");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.checked_lunch_tin_passengers).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_lunch_tin_count_to_speaker",
      "turn_checked_lunch_tin_count_into_roll_call",
      "let_lunch_tin_worker_count_himself",
      "pull_release_after_checked_lunch_tin_count"
    ]);

    state = choose(story, state, "carry_checked_lunch_tin_count_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_lunch_tin_roster",
      "hear_final_lunch_tin_roll_call",
      "pull_release_after_checked_lunch_tin_intercom"
    ]);

    state = choose(story, state, "pull_release_after_checked_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("after the lunch-tin worker's checked count");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players hear the lunch-tin count on the speaker directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_lunch_tin_latch_from_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_intercom");
    expect(observation.scene.text).toContain("His tin latch clicks once for each open door");
    expect(observation.scene.text).toContain("Let that be the last thing the line counts");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.steadied_lunch_tin_worker).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_lunch_tin_passengers_from_intercom",
      "read_lunch_tin_roster",
      "hear_final_lunch_tin_roll_call",
      "pull_release_after_lunch_tin_intercom"
    ]);

    state = choose(story, state, "pull_release_after_lunch_tin_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("acknowledges Mara's handoff when those passengers answer before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest",
      "return_from_mara_manifest_handoff",
      "listen_to_passenger_answers",
      "board_after_passenger_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.scene.text).toContain("The third car does not board in silence");
    expect(observation.scene.text).toContain("Mara's roll call has become a handoff");
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    state = choose(story, state, "listen_to_answered_handoff_after_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_intercom");
    expect(observation.scene.text).toContain("The third car fills with the rhythm Mara began");
    expect(observation.scene.text).toContain("They can answer for themselves now");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_answered_handoff_intercom",
      "confirm_answered_handoff_thresholds"
    ]);

    state = choose(story, state, "pull_release_after_answered_handoff_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara can finish the last name");
    expect(observation.scene.text).toContain("no longer carrying the manifest alone");
    expectIdealScore(observation.score);
  });

  it("adds an optional lost-mitten passenger beat without blocking boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    const passengerPlatformChoiceIds = observation.choices.map((choice) => choice.id);

    expect(passengerPlatformChoiceIds).toContain("make_room_for_passengers_in_third_car");
    expect(passengerPlatformChoiceIds).toContain("hold_third_car_threshold");
    expect(passengerPlatformChoiceIds.indexOf("board_third_car_with_passengers")).toBeLessThan(
      passengerPlatformChoiceIds.indexOf("hold_third_car_threshold")
    );
    expect(passengerPlatformChoiceIds.slice(0, 7)).toEqual([
      "ask_newspaper_woman_about_stop",
      "ask_newspaper_woman_to_read_transfer_column",
      "ask_lunch_tin_worker_to_set_pace",
      "return_lost_mitten",
      "match_manifest_keepsakes",
      "help_passengers_gather",
      "board_third_car_with_passengers"
    ]);

    state = choose(story, state, "return_lost_mitten");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_memory");
    expect(observation.scene.text).toContain("Then we will find it in the morning");
    expect(observation.scene.text).toContain("the returned cuff");
    expect(observation.scene.text).toContain("beginning to look after one another");
    expect(observation.state.flags.returned_lost_mitten).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "lead_mitten_child_to_third_car"
    ]);

    state = choose(story, state, "lead_mitten_child_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_intercom");
    expect(observation.scene.text).toContain("both mittens pressed against the frame");
    expect(observation.scene.text).toContain("one soft punch");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "tap_paired_mittens_for_missing_name",
      "hear_final_mitten_roll_call",
      "pull_release_after_mitten_child_intercom",
      "confirm_paired_mittens_from_intercom"
    ]);

    state = choose(story, state, "pull_release_after_mitten_child_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("clutching both mittens");
    expect(observation.scene.text).toContain("keep the doors open for everyone");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players return the lost mitten directly", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.scene.text).toContain("child's laugh beside a damp mitten print");
    const openedManifestChoiceIds = observation.choices.map((choice) => choice.id);
    expect(openedManifestChoiceIds).toContain("return_opened_manifest_mitten");
    expect(openedManifestChoiceIds.indexOf("listen_to_passenger_morning_chorus")).toBeLessThan(
      openedManifestChoiceIds.indexOf("return_opened_manifest_mitten")
    );
    expect(openedManifestChoiceIds.indexOf("review_open_manifest_count")).toBeLessThan(
      openedManifestChoiceIds.indexOf("return_opened_manifest_mitten")
    );
    expect(openedManifestChoiceIds.indexOf("board_with_completed_opened_count")).toBeLessThan(
      openedManifestChoiceIds.indexOf("return_opened_manifest_mitten")
    );
    expect(openedManifestChoiceIds.indexOf("return_opened_manifest_mitten")).toBeLessThan(
      openedManifestChoiceIds.indexOf("match_opened_manifest_keepsakes")
    );

    state = choose(story, state, "return_opened_manifest_mitten");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_memory");
    expect(observation.state.flags.returned_lost_mitten).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);

    state = choose(story, state, "lead_mitten_child_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_intercom");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "tap_paired_mittens_for_missing_name",
      "hear_final_mitten_roll_call",
      "pull_release_after_mitten_child_intercom",
      "confirm_paired_mittens_from_intercom"
    ]);

    state = choose(story, state, "pull_release_after_mitten_child_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets players match manifest keepsakes before the helped passenger ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_handoff");
    expect(observation.scene.text).toContain("warm lunch tin");
    expect(observation.scene.text).toContain("people finding their places");
    expect(observation.state.flags.matched_manifest_keepsakes).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_childs_mitten_from_keepsakes",
      "check_matched_keepsakes_before_boarding",
      "carry_matched_keepsakes_to_speaker",
      "lead_keepsake_passengers_to_third_car"
    ]);

    state = choose(story, state, "lead_keepsake_passengers_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_boarding");
    expect(observation.scene.text).toContain("fills by object before it fills by name");
    expect(observation.scene.text).toContain("the ordinary things answer");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_keepsakes_answer_from_boarding",
      "hear_keepsake_roll_call_from_boarding",
      "pull_release_after_keepsake_boarding"
    ]);

    state = choose(story, state, "pull_release_after_keepsake_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("matched keepsakes cross the");
    expect(observation.scene.text).toContain("lets the ordinary things answer back");
    expectIdealScore(observation.score);
  });

  it("lets matched keepsake players return the child's mitten before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "return_childs_mitten_from_keepsakes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_memory");
    expect(observation.scene.text).toContain("Then we will find it in the morning");
    expect(observation.state.flags.matched_manifest_keepsakes).toBe(true);
    expect(observation.state.flags.returned_lost_mitten).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);

    state = choose(story, state, "lead_mitten_child_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_intercom");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "pull_release_after_mitten_child_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets players check matched keepsakes before choosing the speaker or boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "check_matched_keepsakes_before_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_check");
    expect(observation.scene.text).toContain("ordinary proofs answer");
    expect(observation.scene.text).toContain("They are accounted for");
    expect(observation.state.flags.checked_matched_keepsakes).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_keepsakes_to_speaker",
      "lead_checked_keepsakes_to_third_car"
    ]);

    state = choose(story, state, "carry_checked_keepsakes_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_intercom");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "pull_release_after_keepsake_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("carries checked keepsakes into the boarding route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "check_matched_keepsakes_before_boarding",
      "lead_checked_keepsakes_to_third_car"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_boarding");
    expect(observation.state.flags.checked_matched_keepsakes).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_keepsakes_answer_from_boarding",
      "hear_keepsake_roll_call_from_boarding",
      "pull_release_after_keepsake_boarding"
    ]);

    state = choose(story, state, "pull_release_after_keepsake_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets matched keepsakes reach Mara's speaker directly from handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "carry_matched_keepsakes_to_speaker"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_intercom");
    expect(observation.scene.text).toContain("At the third-car speaker");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_final_keepsake_roll_call",
      "pull_release_after_keepsake_intercom"
    ]);

    state = choose(story, state, "hear_final_keepsake_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_roll_call");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
  });

  it("surfaces the matched-keepsake roll call directly from boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "lead_keepsake_passengers_to_third_car",
      "hear_keepsake_roll_call_from_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_roll_call");
    expect(observation.scene.text).toContain("matched keepsakes answer");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_keepsake_roll_call",
      "confirm_keepsake_owners_before_release"
    ]);

    state = choose(story, state, "pull_release_after_keepsake_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a keepsake-specific intercom beat before the keepsake ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "lead_keepsake_passengers_to_third_car",
      "listen_to_keepsakes_answer_from_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_intercom");
    expect(observation.scene.text).toContain("Hold on to what remembered you");
    expect(observation.scene.text).toContain("the line is listening");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_final_keepsake_roll_call",
      "pull_release_after_keepsake_intercom"
    ]);

    state = choose(story, state, "pull_release_after_keepsake_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("keeps the final roll call specific to matched-keepsake passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "match_manifest_keepsakes",
      "lead_keepsake_passengers_to_third_car",
      "listen_to_keepsakes_answer_from_boarding",
      "hear_final_keepsake_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_roll_call");
    expect(observation.scene.text).toContain("matched keepsakes answer");
    expect(observation.scene.text).toContain("every initial has a hand beneath it");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_keepsake_roll_call",
      "confirm_keepsake_owners_before_release"
    ]);

    const rollCallState = state;

    state = choose(story, rollCallState, "pull_release_after_keepsake_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, rollCallState, "confirm_keepsake_owners_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_owner_check");
    expect(observation.scene.text).toContain("All ordinary proof accounted for");
    expect(observation.state.flags.confirmed_keepsake_owners).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_keepsake_owners"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_keepsake_owners");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("carries the returned-mitten payoff through the final roll call", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "return_lost_mitten",
      "lead_mitten_child_to_third_car",
      "hear_final_mitten_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_epilogue");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_mitten_roll_call",
      "confirm_mitten_pair_before_release"
    ]);

    state = choose(story, state, "pull_release_after_mitten_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a mitten-specific intercom before the returned-mitten ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "return_lost_mitten",
      "lead_mitten_child_to_third_car"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_intercom");
    expect(observation.scene.text).toContain("both mittens pressed against the frame");
    expect(observation.scene.text).toContain("his own way of saying the door is still open");
    expect(observation.scene.text).toContain("the lunch-tin worker answers with his latch");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "tap_paired_mittens_for_missing_name",
      "hear_final_mitten_roll_call",
      "pull_release_after_mitten_child_intercom",
      "confirm_paired_mittens_from_intercom"
    ]);

    state = choose(story, state, "confirm_paired_mittens_from_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_pair_check");
    expect(observation.scene.text).toContain("both mittened palms");
    expect(observation.scene.text).toContain("Both hands accounted for");
    expect(observation.state.flags.confirmed_mitten_pair).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_mitten_pair"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_mitten_pair");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the returned mitten identify one more passenger before release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "return_lost_mitten",
      "lead_mitten_child_to_third_car",
      "tap_paired_mittens_for_missing_name"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_pair_memory");
    expect(observation.scene.text).toContain("somebody kept it warm");
    expect(observation.scene.text).toContain("another answers from the far door");
    expect(observation.scene.text).toContain("learned a second language");
    expect(observation.state.flags.heard_mitten_pair_memory).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_roll_call_after_paired_mittens",
      "pull_release_after_paired_mittens",
      "confirm_paired_mittens_after_memory"
    ]);

    const pairMemoryState = state;
    const pairCheckState = choose(story, pairMemoryState, "confirm_paired_mittens_after_memory");
    observation = observe(story, pairCheckState);

    expect(observation.scene.id).toBe("passenger_mitten_pair_check");
    expect(observation.state.flags.confirmed_mitten_pair).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_mitten_pair"
    ]);

    state = choose(story, pairMemoryState, "hear_roll_call_after_paired_mittens");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_epilogue");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_mitten_roll_call",
      "confirm_mitten_pair_before_release"
    ]);

    state = choose(story, state, "confirm_mitten_pair_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_pair_check");
    expect(observation.state.flags.confirmed_mitten_pair).toBe(true);

    state = choose(story, state, "pull_release_after_confirmed_mitten_pair");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a final gathered-passenger intercom beat before the helped ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "return_from_passenger_answers",
      "help_passengers_gather",
      "listen_to_gathered_passengers_from_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.scene.text).toContain("The passengers gather themselves");
    expect(observation.scene.text).toContain("making room for one another");
    expect(observation.scene.text).toContain("they can move together");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_intercom",
      "hear_final_passenger_roll_call",
      "pull_release_after_gathered_intercom"
    ]);

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("thanks each passenger by name");
    expect(observation.scene.text).toContain("No one crosses alone");
    expectIdealScore(observation.score);
  });

  it("lets the lunch-tin boarding count release directly without losing full score", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "let_lunch_tin_worker_keep_count",
      "return_from_passenger_farewell",
      "pull_release_after_lunch_tin_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_lunch_tin_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("keeps the broader gathered-passenger intercom reachable without the lunch-tin pace", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "return_from_passenger_answers",
      "help_passengers_gather",
      "listen_to_gathered_passengers_from_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.scene.text).toContain("the old conductor answers each number");
    expect(observation.scene.text).toContain("they can move together");
    expect(observation.state.flags.steadied_lunch_tin_worker).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_intercom",
      "hear_final_passenger_roll_call",
      "pull_release_after_gathered_intercom"
    ]);
  });

  it("lets gathered passengers share the release before the helped ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "return_from_passenger_answers",
      "help_passengers_gather",
      "check_shared_release_from_gathered_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_release");
    expect(observation.scene.text).toContain("refuse to make it one person's burden");
    expect(observation.scene.text).toContain("a chain of people making sure");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "hear_final_roll_call_after_shared_release",
      "pull_release_after_shared_gathered_check"
    ]);

    state = choose(story, state, "pull_release_after_shared_gathered_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("gives the optional final roll call its own true-ending payoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers",
      "return_from_passenger_answers",
      "help_passengers_gather",
      "listen_to_gathered_passengers_from_boarding",
      "hear_final_passenger_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_epilogue");
    expect(observation.scene.text).toContain("the passengers finish the roll call for her");
    expect(observation.scene.text).toContain("who belongs to the morning");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_final_roll_call",
      "confirm_roll_call_answers_before_release"
    ]);

    const rollCallState = state;

    state = choose(story, rollCallState, "pull_release_after_final_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("passengers' own roll call");
    expect(observation.scene.text).toContain("the manifest has become a chorus");
    expectIdealScore(observation.score);

    state = choose(story, rollCallState, "confirm_roll_call_answers_before_release");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_answer_check");
    expect(observation.scene.text).toContain("No name is allowed to hang alone");
    expect(observation.scene.text).toContain("Every answer has someone standing with it");
    expect(observation.state.flags.confirmed_roll_call_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_roll_call_answers"
    ]);

    state = choose(story, state, "pull_release_after_confirmed_roll_call_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_roll_call_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds an optional thumbprint memory without blocking Mara's ledger choices", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.scene.text).toContain("still full of doors");
    expect(observation.scene.text).toContain(
      "Clearing only Mara will send you straight to the third-car release"
    );
    expect(observation.scene.text).toContain("opening the manifest first may free more doors");
    expect(observation.objectives).toContain(
      "Choose whether to clear Mara now or open the kept-passenger manifest first."
    );
    expect(choiceIds).toContain("inspect_mara_thumbprint");
    expect(choiceIds).toContain("read_manifest_from_ledger");
    expect(choiceIds).toContain("mark_mara_clear_from_ledger");
    expect(
      observation.choices.find((choice) => choice.id === "read_manifest_from_ledger")?.label
    ).toBe("Open the kept-passenger manifest before choosing a larger rescue");
    expect(
      observation.choices.find((choice) => choice.id === "mark_mara_clear_from_ledger")?.label
    ).toBe("Clear only Mara now and board for the emergency release");

    state = choose(story, state, "inspect_mara_thumbprint");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint");
    expect(observation.scene.text).toContain("No one clears until everyone clears");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);

    state = choose(story, state, "return_from_mara_thumbprint");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(choiceIds).not.toContain("inspect_mara_thumbprint");
    expect(choiceIds).not.toContain("read_manifest_from_ledger");
    expect(choiceIds).toContain("read_manifest_after_thumbprint");
    expect(choiceIds).toContain("mark_mara_clear_from_ledger");

    state = choose(story, state, "mark_mara_clear_from_ledger");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_released");
    expect(observation.state.flags.freed_mara).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_mara_about_thumbprint_before_boarding"
    );
  });

  it("pays off Mara's thumbprint memory before the direct release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "inspect_badge_back",
      "return_from_badge_memory",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual(
      expect.arrayContaining([
        "pull_release",
        "listen_to_badge_proof_intercom",
        "wait_for_thumbprint_mara_at_far_door",
        "listen_to_mara_thumbprint_intercom"
      ])
    );
    expect(observation.choices.map((choice) => choice.id)).toHaveLength(4);
    expect(observation.choices[0]?.id).toBe("pull_release");
    expect(
      observation.choices.find((choice) => choice.id === "listen_to_mara_thumbprint_intercom")
        ?.label
    ).toBe("Listen as Mara remembers the torn thumbprint");

    state = choose(story, state, "listen_to_mara_thumbprint_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_intercom");
    expect(observation.scene.text).toContain("the torn thumbprint memory");
    expect(observation.scene.text).toContain("all doors, all at once");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_mara_to_carry_thumbprint_to_far_door",
      "pull_release_after_thumbprint_goodbye",
      "confirm_thumbprint_oath_receipt"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets thumbprint players confirm Mara's oath reaches every door", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "inspect_badge_back",
      "return_from_badge_memory",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "listen_to_mara_thumbprint_intercom",
      "confirm_thumbprint_oath_receipt"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_receipt");
    expect(observation.scene.text).toContain("torn-thumbprint oath");
    expect(observation.scene.text).toContain("witnessed, received, ready");
    expect(observation.state.flags.confirmed_mara_thumbprint_receipt).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_receipt"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_receipt");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets thumbprint readers recover the Mara handoff after direct boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "wait_for_thumbprint_mara_at_far_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_handoff_intercom");
    expect(observation.scene.text).toContain("same hand that tore the ledger");
    expect(observation.scene.text).toContain("witnessed the last door open");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_handoff",
      "carry_thumbprint_handoff_to_far_door"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets thumbprint readers ask Mara before boarding the third car", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_released");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "watch_mara_leave_booth",
      "ask_mara_for_last_dispatch",
      "ask_mara_about_thumbprint_before_boarding",
      "board_after_clearing_mara"
    ]);

    state = choose(story, state, "ask_mara_about_thumbprint_before_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_intercom");
    expect(observation.scene.text).toContain("the torn thumbprint memory");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_mara_to_carry_thumbprint_to_far_door",
      "pull_release_after_thumbprint_goodbye",
      "confirm_thumbprint_oath_receipt"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("preserves the thumbprint payoff after players answer the badge proof first", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "inspect_notice_back",
      "take_lantern_after_notice_back",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara",
      "listen_to_badge_proof_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_badge_proof_intercom");
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_about_thumbprint_after_badge_proof",
      "pull_release_after_badge_proof_goodbye",
      "confirm_badge_proof_receipt"
    ]);

    state = choose(story, state, "ask_about_thumbprint_after_badge_proof");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_intercom");
    expect(observation.scene.text).toContain("the torn thumbprint memory");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "ask_mara_to_carry_thumbprint_to_far_door",
      "pull_release_after_thumbprint_goodbye",
      "confirm_thumbprint_oath_receipt"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets thumbprint intercom players recover Mara's far-door handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "ask_mara_about_thumbprint_before_boarding",
      "ask_mara_to_carry_thumbprint_to_far_door"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_handoff_intercom");
    expect(observation.scene.text).toContain("same hand that tore the ledger");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_handoff",
      "carry_thumbprint_handoff_to_far_door"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("blocks mapless manifest clears and resumes at the ledger after map recovery", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "try_token_without_map",
      "continue_to_signal_booth_unprepared",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.state.inventory).not.toContain("map");
    expect(choiceIds).not.toContain("clear_manifest_and_mara_from_ledger");
    expect(choiceIds).not.toContain("mark_mara_clear_from_ledger");
    expect(choiceIds).toContain("return_for_marked_map");

    state = choose(story, state, "return_for_marked_map");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.state.inventory).toContain("map");
    expect(choiceIds).not.toContain("return_for_marked_map");
    expect(choiceIds).toContain("clear_manifest_and_mara_from_ledger");
  });

  it("pays off the kept-passenger manifest after Mara's final intercom beat", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "board_third_car_with_passengers",
      "listen_to_mara_manifest_intercom"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.scene.text).toContain("They remember the way out now");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_manifest_names_answer_once",
      "pull_release_after_manifest_goodbye"
    ]);

    const directReleaseState = choose(story, state, "pull_release_after_manifest_goodbye");
    observation = observe(story, directReleaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expectIdealScore(observation.score);

    state = choose(story, state, "let_manifest_names_answer_once");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_answers");
    expect(observation.scene.text).toContain("The lunch-tin worker clicks his clasp");
    expect(observation.state.flags.manifest_names_answered_once).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_manifest_answers_to_platform",
      "hand_manifest_answers_to_mara",
      "let_manifest_answers_keep_door_rhythm",
      "check_manifest_answers_against_echoes",
      "pull_release_after_manifest_answers"
    ]);

    state = choose(story, state, "pull_release_after_manifest_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expectIdealScore(observation.score);
  });

  it("keeps the non-manifest Mara intercom focused on Mara alone", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(choiceIds).toContain("listen_to_mara_intercom");
    expect(choiceIds).toContain("ask_mara_for_train_car_dispatch");
    expect(choiceIds).not.toContain("listen_to_mara_manifest_intercom");
    expect(choiceIds).not.toContain("listen_to_counted_manifest_intercom");
  });

  it("reveals the emergency release after clearing Mara even without the radio route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.knows_release).toBeUndefined();
    expect(observation.objectives).not.toContain(
      "Learn how to survive the driverless train before boarding it."
    );
    expect(observation.objectives).toContain(RELEASE_OBJECTIVE);
    expect(observation.score.score).toBeGreaterThan(0);
    expect(choiceIds).toContain("pull_release");

    state = choose(story, state, "pull_release");
    const finalObservation = observe(story, state);
    expect(finalObservation.scene.id).toBe("true_ending");
    expectIdealScore(finalObservation.score);
    expect(finalObservation.score.awards.map((award) => award.id)).not.toContain(
      "flag_read_mara_file"
    );
    expect(finalObservation.score.awards.map((award) => award.id)).toContain("flag_freed_mara");
  });

  it("warns players without the token before they board from the lit platform", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "board_before_clearing_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("ledger_warning");
    expect(choiceIds).toContain("return_for_signal_token");
    expect(choiceIds).toContain("board_without_clearing_mara");
  });

  it("lets fleeing players hear one final token reminder without blocking escape", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("escape_warning");
    expect(choiceIds).toContain("listen_at_stairwell");
    expect(choiceIds).toContain("look_back_from_escape_warning");
    expect(choiceIds.indexOf("return_to_lit_platform_from_escape_warning")).toBeLessThan(
      choiceIds.indexOf("look_back_from_escape_warning")
    );
    expect(choiceIds).toContain("confirm_flee_platform");

    state = choose(story, state, "listen_at_stairwell");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_stairwell_call");
    expect(observation.scene.text).toContain("behind the stopped clock");
    expect(observation.state.flags.heard_escape_call).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "look_back_after_stairwell_call",
      "return_from_stairwell_call",
      "leave_lit_platform_after_stairwell_call"
    ]);

    state = choose(story, state, "return_from_stairwell_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "take_token_return_to_lit_platform"
    ]);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );

    state = choose(story, state, "take_token_return_to_lit_platform");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("lit_platform");
    expect(choiceIds).toContain("try_token_without_map");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "listen_at_stairwell",
      "leave_lit_platform_after_stairwell_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_platform_glance");
    expect(observation.scene.ending).toBeFalsy();
    expect(observation.state.flags.looked_back_from_escape_warning).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_after_escape_glance",
      "leave_warned_after_escape_glance"
    ]);

    state = choose(story, state, "leave_warned_after_escape_glance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("warned_lit_escape_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("restoring light to Platform 13");
    expect(observation.scene.text).toContain(
      "one thing you refused to fetch from the stopped clock"
    );
    expect(observation.scene.text).toContain("a route you almost finished");
  });

  it("returns unlit stairwell listeners to Platform 13 after token recovery", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "retreat_to_stairs_from_platform",
      "listen_at_unlit_stairwell",
      "return_from_stairwell_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "take_token_return_to_dark_platform"
    ]);

    state = choose(story, state, "take_token_return_to_dark_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("platform");
    expect(observation.state.inventory).toContain("token");
    expect(observation.state.flags.found_token).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("inspect_gate_control");
  });

  it("adds a one-time platform glance before early escape", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "look_back_from_escape_warning"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_platform_glance");
    expect(observation.scene.text).toContain("Mara Vale's penciled badge number");
    expect(observation.scene.text).toContain("token slot");
    expect(observation.state.flags.looked_back_from_escape_warning).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_after_escape_glance",
      "return_after_escape_glance",
      "leave_after_escape_glance"
    ]);

    state = choose(story, state, "return_after_escape_glance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain("flee_platform");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "look_back_from_escape_warning",
      "leave_after_escape_glance"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "listen_at_stairwell",
      "look_back_after_stairwell_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_platform_glance");
    expect(observation.state.flags.heard_escape_call).toBe(true);
    expect(observation.state.flags.looked_back_from_escape_warning).toBe(true);
    expect(observation.state.flags.knows_badge_proof).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_after_escape_glance",
      "leave_warned_after_escape_glance"
    ]);

    state = choose(story, state, "leave_warned_after_escape_glance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("warned_lit_escape_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("restoring light to Platform 13");
    expect(observation.scene.text).toContain("a route you almost finished");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "listen_at_stairwell",
      "look_back_after_stairwell_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    state = choose(story, state, "return_after_escape_glance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain("flee_platform");
  });

  it("lets unlit-platform explorers retreat to the early escape warning", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "go_to_platform",
      "retreat_to_stairs_from_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("platform_escape_warning");
    expect(observation.scene.text).toContain("the locker parts");
    expect(observation.scene.text).toContain("the stopped clock");
    expect(choiceIds).toEqual([
      "return_to_platform_from_escape_warning",
      "listen_at_unlit_stairwell",
      "look_back_from_unlit_escape_warning",
      "confirm_unlit_flee_platform"
    ]);
    expect(observation.choices[0]?.label).toBe(
      "Return through the service-room door for the map, fuse, badge, and clock token"
    );

    state = choose(story, state, "return_to_platform_from_escape_warning");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.left_unprepared_platform).toBe(true);
    expect(observation.state.flags.returned_from_unlit_escape_warning).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("go_to_stopped_clock");
    expect(choiceIds).toContain("read_personnel_file");
    expect(choiceIds).not.toContain("return_to_tunnel");
    expect(choiceIds).not.toContain("go_to_platform");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "retreat_to_stairs_from_platform",
      "listen_at_unlit_stairwell"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_stairwell_call");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_from_stairwell_call",
      "leave_after_stairwell_call"
    ]);
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "look_back_after_stairwell_call"
    );

    state = choose(story, state, "leave_after_stairwell_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("warned_escape_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("unfinished route");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "retreat_to_stairs_from_platform",
      "confirm_unlit_flee_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("adds a one-time dark platform glance before early unlit escape", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "retreat_to_stairs_from_platform",
      "look_back_from_unlit_escape_warning"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("unlit_escape_platform_glance");
    expect(observation.scene.text).toContain("stopped clock");
    expect(observation.scene.text).toContain("empty token slot");
    expect(observation.state.flags.looked_back_from_unlit_escape_warning).toBe(true);
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_after_unlit_escape_glance",
      "return_after_unlit_escape_glance",
      "leave_after_unlit_escape_glance"
    ]);

    state = choose(story, state, "return_after_unlit_escape_glance");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.left_unprepared_platform).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("search_locker");
    expect(observation.choices.map((choice) => choice.id)).toContain("go_to_stopped_clock");
    expect(observation.choices.map((choice) => choice.id)).not.toContain("go_to_platform");

    state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "take_map",
      "go_to_platform",
      "retreat_to_stairs_from_platform",
      "look_back_from_unlit_escape_warning",
      "leave_after_unlit_escape_glance"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("routes ledger-warning players directly to the stopped clock for the token", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "board_before_clearing_ledger",
      "return_for_signal_token"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("clock");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual(["take_token"]);
  });

  it("returns token-recovery players to the lit platform instead of stale platform prose", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "board_before_clearing_ledger",
      "return_for_signal_token",
      "take_token",
      "follow_arrows_to_lit_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("use_token_slot");
  });

  it("returns service-room players to the lit platform after the fuse is installed", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "return_from_lit_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("return_to_lit_platform");
    expect(choiceIds).not.toContain("go_to_platform");

    state = choose(story, state, "return_to_lit_platform");
    expect(observe(story, state).scene.id).toBe("lit_platform");
  });

  it("does not keep offering the radio after players deliberately shut it off", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "open_service_door", "tune_radio", "shut_radio_off"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(observation.state.flags.radio_shut_off).toBe(true);
    expect(choiceIds).not.toContain("tune_radio");
    expect(choiceIds).toContain("search_locker");
    expect(choiceIds).toContain("read_personnel_file");
    expect(choiceIds).toContain("take_map");

    for (const choiceId of [
      "search_locker",
      "take_badge",
      "inspect_badge_back",
      "return_from_badge_memory"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.state.flags.knows_release).toBe(true);
    expect(choiceIds).not.toContain("tune_radio");
    expect(choiceIds).toContain("take_fuse");
  });

  it("focuses fully equipped service-room players on Platform 13", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(choiceIds).toEqual(["go_to_platform"]);
    expect(choiceIds).not.toContain("tune_radio");
    expect(choiceIds).not.toContain("read_personnel_file");
    expect(choiceIds).not.toContain("return_to_tunnel");
    expect(observation.objectives).not.toContain(
      "Learn how to survive the driverless train before boarding it."
    );
    expect(observation.objectives).toContain(
      "Restore power at Platform 13 and try the token slot."
    );
  });

  it("steers token carriers toward the signal booth from the lit platform", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "tune_radio",
      "note_radio_route",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("use_token_slot");
    expect(choiceIds).not.toContain("board_before_clearing_ledger");
    expect(choiceIds).not.toContain("flee_platform");
  });

  it("warns token carriers before they enter the signal booth without the map", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "try_token_without_map"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_map_warning");
    expect(observation.scene.text).toContain("without the marked map");
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(choiceIds).toEqual([
      "return_for_map_from_signal_warning",
      "continue_to_signal_booth_unprepared"
    ]);

    state = choose(story, state, "return_for_map_from_signal_warning");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_map_recovered");
    expect(observation.scene.text).toContain("Its pencil route ends at Platform 13");
    expect(observation.state.inventory).toContain("map");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "enter_signal_booth_after_map"
    ]);

    state = choose(story, state, "enter_signal_booth_after_map");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.state.inventory).toContain("map");
    expect(observation.choices.map((choice) => choice.id)).toContain("inspect_signal_ledger");
    expect(observation.choices.map((choice) => choice.id)).toContain("read_passenger_manifest");
  });

  it("lets prepared players trigger the missing-map warning from the service room", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("try_gate_ritual_without_map");

    state = choose(story, state, "try_gate_ritual_without_map");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_map_warning");
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.state.inventory).not.toContain("map");
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");

    state = choose(story, state, "return_for_map_from_signal_warning");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_map_recovered");
    expect(observation.state.inventory).toContain("map");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "enter_signal_booth_after_map"
    ]);
  });

  it("surfaces the missing-map warning directly from the gate control", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "inspect_gate_control"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("gate_control");
    expect(choiceIds).toContain("install_fuse_and_try_token_without_map");
    expect(choiceIds).not.toContain("install_fuse_from_gate_control");

    state = choose(story, state, "install_fuse_and_try_token_without_map");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_map_warning");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.state.flags.knows_platform).toBe(true);
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
  });

  it("still lets players install the gate-control fuse before finding the token", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "inspect_gate_control",
      "install_fuse_from_gate_control"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("lit_platform");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(observation.scene.text).toContain("booth is the next honest step");
    expect(choiceIds).toContain("return_from_lit_platform");
    expect(choiceIds).toContain("flee_platform");
    expect(observation.choices.find((choice) => choice.id === "flee_platform")?.label).toBe(
      "Leave before finding the stopped-clock token"
    );
  });

  it("replaces broad survival guidance after players read the signal ledger", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "try_token_without_map",
      "continue_to_signal_booth_unprepared",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.objectives).toContain("Recover the marked Platform 13 map before boarding.");
    expect(observation.objectives).toContain(
      "Use the signal booth to resolve Mara's ledger entry."
    );
    expect(observation.objectives).not.toContain(
      "Learn how to survive the driverless train before boarding it."
    );
  });

  it("focuses fully prepared lit-platform players on the signal booth", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("lit_platform");
    expect(choiceIds).toEqual(["use_token_slot"]);
    expect(choiceIds).not.toContain("return_from_lit_platform");
    expect(choiceIds).not.toContain("flee_platform");
  });

  it("keeps the escape ending available before the signal token is recovered", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    expect(observation.choices.map((choice) => choice.id)).toContain("flee_platform");
    expect(observation.scene.text).toContain("booth is the next honest step");
    expect(observation.choices.find((choice) => choice.id === "flee_platform")?.label).toBe(
      "Leave before finding the stopped-clock token"
    );

    state = choose(story, state, "flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_warning");
    expect(observation.scene.text).toContain("unfinished work");
    expect(observation.scene.text).toContain("signal key still waiting behind the stopped clock");
    expect(observation.state.flags.knows_token_location).toBe(true);
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_at_stairwell",
      "return_to_lit_platform_from_escape_warning",
      "look_back_from_escape_warning",
      "confirm_flee_platform"
    ]);
    expect(
      observation.choices.find(
        (choice) => choice.id === "return_to_lit_platform_from_escape_warning"
      )?.label
    ).toBe("Return through the service room toward the stopped clock");

    state = choose(story, state, "confirm_flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("lets wavering escape players return toward the stopped clock", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "flee_platform",
      "return_to_lit_platform_from_escape_warning"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);
    const choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("service_room");
    expect(choiceIds).toContain("go_to_stopped_clock");
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );

    state = choose(story, state, "go_to_stopped_clock");
    let recovered = observe(story, state);
    expect(recovered.scene.id).toBe("clock");
    expect(recovered.choices.map((choice) => choice.id)).toContain("take_token");

    state = choose(story, state, "take_token");
    recovered = observe(story, state);
    expect(recovered.state.inventory).toContain("token");
  });

  it("adds a one-time Platform 13 poster beat that reinforces Mara's badge", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "inspect_mara_posters"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_posters");
    expect(observation.scene.text).toContain("proof of service");
    expect(observation.state.flags.inspected_mara_posters).toBe(true);
    expect(observation.state.flags.met_mara).toBe(true);

    state = choose(story, state, "return_to_lit_platform_after_posters");
    observation = observe(story, state);

    const choiceIds = observation.choices.map((choice) => choice.id);
    expect(observation.scene.id).toBe("lit_platform");
    expect(choiceIds).not.toContain("inspect_mara_posters");
    expect(choiceIds).toContain("return_from_lit_platform");
    expect(choiceIds).toContain("flee_platform");
  });

  it("reveals why Mara's badge matters before clearing the ledger", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "search_locker",
      "take_badge",
      "take_fuse",
      "close_locker",
      "take_map",
      "go_to_platform",
      "install_fuse",
      "use_token_slot"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_booth");
    expect(choiceIds[0]).toBe("inspect_signal_ledger");
    expect(choiceIds).toContain("read_passenger_manifest");

    state = choose(story, state, "inspect_signal_ledger");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(observation.scene.text).toContain("more than another name");
    expect(observation.scene.text).toContain(
      "Clearing only Mara will send you straight to the third-car release"
    );
    expect(observation.state.flags.inspected_signal_ledger).toBe(true);
    expect(observation.objectives).toEqual([
      "Choose whether to clear Mara now or open the kept-passenger manifest first."
    ]);
    expect(choiceIds).toEqual([
      "inspect_mara_thumbprint",
      "read_manifest_from_ledger",
      "mark_mara_clear_from_ledger"
    ]);
  });

  it("adds an aftermath beat after clearing Mara's ledger entry", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_released");
    expect(observation.scene.text).toContain("I can hold the line steady");
    expect(observation.scene.text).toContain("one final dispatch");
    expect(observation.scene.text).toContain("walks the platform beside you");
    expect(observation.state.flags.freed_mara).toBe(true);
    expect(observation.objectives).toEqual([RELEASE_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "watch_mara_leave_booth",
      "ask_mara_for_last_dispatch",
      "answer_mara_before_boarding",
      "board_after_clearing_mara"
    ]);
    expect(observation.choices[0]?.label).toBe(
      "Walk with Mara to the third car before the release"
    );
    expect(
      observation.choices.find((choice) => choice.id === "ask_mara_for_last_dispatch")?.label
    ).toBe("Ask Mara for her final dispatch before boarding");

    const intercomState = choose(story, state, "answer_mara_before_boarding");
    observation = observe(story, intercomState);

    expect(observation.scene.id).toBe("mara_intercom");
    expect(observation.scene.text).toContain("no longer buried in static");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_mara_goodbye"
    ]);

    observation = observe(story, state);

    state = choose(story, state, "board_after_clearing_mara");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release");
  });

  it("adds an optional Mara handoff before the non-manifest release route", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff");
    expect(observation.scene.text).toContain("done being the last line");
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.objectives).toEqual([RELEASE_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual(["return_from_mara_handoff"]);

    state = choose(story, state, "return_from_mara_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_boarding");
    expect(observation.scene.text).toContain("Mara does not vanish back into the speaker");
    expect(observation.scene.text).toContain("here means beside you");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_mara_far_door_before_release",
      "listen_to_handoff_before_boarding",
      "board_after_mara_handoff"
    ]);

    state = choose(story, state, "board_after_mara_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release",
      "listen_to_mara_after_handoff"
    ]);
  });

  it("lets players verify Mara reaches the far door before the handoff release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "check_mara_far_door_before_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_check");
    expect(observation.scene.text).toContain("All right. I am here.");
    expect(observation.state.flags.checked_mara_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_handoff_to_speaker",
      "return_to_release_after_handoff_check"
    ]);

    state = choose(story, state, "carry_checked_handoff_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("preserves the torn-thumbprint payoff after checking Mara at the far door", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "inspect_mara_thumbprint",
      "return_from_mara_thumbprint",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "check_mara_far_door_before_release"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_check");
    expect(observation.state.flags.read_mara_thumbprint).toBe(true);
    expect(observation.state.flags.checked_mara_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_thumbprint_handoff_to_speaker",
      "return_to_release_after_handoff_check"
    ]);

    state = choose(story, state, "carry_checked_thumbprint_handoff_to_speaker");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_thumbprint_handoff_intercom");
    expect(observation.scene.text).toContain("same hand that tore the ledger");
    expect(observation.scene.text).toContain("witnessed the last door open");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_thumbprint_handoff",
      "carry_thumbprint_handoff_to_far_door"
    ]);

    state = choose(story, state, "pull_release_after_thumbprint_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a final intercom beat after Mara leaves the booth", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "board_after_mara_handoff"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.saw_mara_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release",
      "listen_to_mara_after_handoff"
    ]);

    state = choose(story, state, "listen_to_mara_after_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("crossing the platform instead of haunting it");
    expect(observation.scene.text).toContain("opening the last door from the other side");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_goodbye",
      "confirm_mara_handoff_last_door"
    ]);

    state = choose(story, state, "confirm_mara_handoff_last_door");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_door_check");
    expect(observation.scene.text).toContain("every door answers with morning rain");
    expect(observation.scene.text).toContain('"Clear," she says');
    expect(observation.state.flags.checked_mara_handoff).toBe(true);
    expect(observation.state.flags.confirmed_mara_handoff_doors).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_door_check"
    ]);

    state = choose(story, state, "pull_release_after_handoff_door_check");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Mara is not only a voice");
    expectIdealScore(observation.score);
  });

  it("surfaces Mara's handoff intercom before boarding when no stronger clue is known", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "watch_mara_leave_booth",
      "return_from_mara_handoff",
      "listen_to_handoff_before_boarding"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_intercom");
    expect(observation.scene.text).toContain("crossing the platform instead of haunting it");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_handoff_goodbye",
      "confirm_mara_handoff_last_door"
    ]);

    state = choose(story, state, "pull_release_after_handoff_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a manifest-specific platform beat after clearing Mara's ledger entry", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(choiceIds).toEqual(["clear_manifest_and_mara_from_ledger"]);

    state = choose(story, state, "clear_manifest_and_mara_from_ledger");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.scene.text).toContain("every tiny stamped door");
    expect(observation.state.flags.freed_mara).toBe(true);
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(choiceIds).toEqual([
      "watch_mara_open_manifest",
      "carry_mara_handoff_as_doors_open",
      "ask_mara_to_sign_off_opened_manifest",
      "listen_to_passenger_morning_chorus",
      "review_open_manifest_count",
      "board_with_completed_opened_count",
      "board_with_opened_manifest_reviewed_count",
      "help_opened_passengers_gather",
      "ask_conductor_punch_from_opened_manifest",
      "check_lunch_tin_count_from_opened_manifest",
      "hold_opened_manifest_threshold",
      "listen_to_opened_threshold_from_manifest",
      "notice_manifest_thumbprint_from_opened_doors",
      "carry_manifest_thumbprint_oath_from_opened_doors",
      "return_opened_manifest_mitten",
      "pull_release_for_opened_manifest",
      "pause_on_opened_door_echoes",
      "check_opened_manifest_echoes",
      "board_with_passenger_morning_chorus",
      "follow_lunch_tin_latch",
      "listen_to_lunch_tin_latch_from_opened_manifest",
      "study_opened_newspaper_transfer",
      "call_lunch_tin_roster_from_opened_manifest",
      "listen_to_opened_manifest_echoes",
      "follow_opened_manifest_echoes",
      "board_with_opened_manifest_echoes",
      "ready_opened_manifest_for_mara",
      "ask_conductor_to_read_opened_count",
      "ask_conductor_to_punch_opened_transfer",
      "pass_opened_transfer_to_mara",
      "press_opened_transfer_to_speaker",
      "let_opened_passengers_finish_count",
      "check_opened_manifest_blank_row",
      "match_opened_manifest_keepsakes",
      "check_opened_manifest_keepsakes",
      "ask_mara_to_read_opened_manifest",
      "listen_as_opened_passengers_gather",
      "make_room_from_opened_manifest",
      "pass_shared_release_from_opened_manifest",
      "listen_to_passenger_answers",
      "ask_mara_to_handoff_opened_roll_call",
      "let_opened_manifest_names_answer_once",
      "board_with_answered_passengers",
      "board_and_check_answered_passengers",
      "board_and_confirm_opened_manifest_ready",
      "board_after_releasing_passengers"
    ]);

    const directReleaseState = choose(story, state, "pull_release_for_opened_manifest");
    observation = observe(story, directReleaseState);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("the crowd leaves by making room for itself");
    expectIdealScore(observation.score);

    let countState = choose(story, state, "let_opened_passengers_finish_count");
    observation = observe(story, countState);

    expect(observation.scene.id).toBe("passenger_counted_chorus");
    expect(observation.scene.text).toContain("the count has become a chorus");
    expect(observation.state.flags.reviewed_open_manifest_count).toBe(true);
    expect(observation.state.flags.passengers_finished_reviewed_count).toBe(true);
    expect(observation.state.flags.reviewed_count_release_ready).toBeUndefined();
    expect(observation.state.flags.shared_count_release_ready).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_counted_chorus"
    ]);

    countState = choose(story, countState, "pull_release_after_counted_chorus");
    observation = observe(story, countState);

    expect(observation.scene.id).toBe("passenger_counted_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = choose(story, state, "listen_to_passenger_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.scene.text).toContain("present finally means something again");
    expect(observation.scene.text).toContain("Warden Street");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "follow_newspaper_answer",
      "gather_answered_passengers",
      "let_lunch_tin_worker_keep_count",
      "make_room_after_answered_names",
      "ask_conductor_punch_from_answers",
      "ask_conductor_from_answers",
      "return_from_passenger_answers",
      "carry_answered_names_to_intercom",
      "board_after_answered_passengers"
    ]);

    const answeredPassengersState = state;
    const newspaperState = choose(story, state, "follow_newspaper_answer");
    observation = observe(story, newspaperState);

    expect(observation.scene.id).toBe("passenger_newspaper_memory");
    expect(observation.state.flags.heard_newspaper_memory).toBe(true);
    expect(observation.scene.text).toContain("Warden Street, then morning transfer");
    expect(observation.scene.text).toContain("in more than one voice");

    const conductorRollCallState = choose(
      story,
      newspaperState,
      "ask_conductor_after_newspaper_memory"
    );
    observation = observe(story, conductorRollCallState);

    expect(observation.scene.id).toBe("passenger_conductor_roll_call");
    expect(observation.scene.text).toContain("The conductor walks the aisle one last time");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.conductor_cleared_platform).toBe(true);
    expect(observation.state.flags.heard_conductor_clearance).toBe(true);
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_conductor_roll_call",
      "confirm_conductor_clearance_before_release"
    ]);

    state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_and_check_answered_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_check");
    expect(observation.scene.text).toContain("Every answer has a body behind it");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.checked_answered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "read_checked_answers_into_newspaper_roll_call",
      "carry_checked_answers_to_speaker",
      "pull_release_after_checked_answers"
    ]);

    state = choose(story, state, "pull_release_after_checked_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    state = answeredPassengersState;
    state = choose(story, state, "board_after_answered_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_answered_passengers_before_release",
      "listen_to_answered_passengers_from_boarding",
      "pull_release_after_answered_boarding"
    ]);

    state = choose(story, state, "pull_release_after_answered_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.text).toContain("answered names can fade");
    expect(observation.scene.text).toContain("carry it into morning themselves");
    expectIdealScore(observation.score);

    state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_answers"
    ]) {
      state = choose(story, state, choiceId);
    }

    state = choose(story, state, "return_from_passenger_answers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain("help_passengers_gather");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_third_car_with_passengers"
    );

    state = choose(story, state, "board_third_car_with_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_passengers",
      "pull_release_with_manifest"
    ]);

    state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    state = choose(story, state, "board_after_releasing_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.scene.text).toContain("a paper sack darkened by rain");
    const manifestPlatformChoiceIds = observation.choices.map((choice) => choice.id);

    expect(manifestPlatformChoiceIds).toContain("make_room_for_passengers_in_third_car");
    expect(manifestPlatformChoiceIds).toContain("hold_third_car_threshold");
    expect(manifestPlatformChoiceIds.indexOf("board_third_car_with_passengers")).toBeLessThan(
      manifestPlatformChoiceIds.indexOf("hold_third_car_threshold")
    );
    expect(manifestPlatformChoiceIds.slice(0, 7)).toEqual([
      "ask_newspaper_woman_about_stop",
      "ask_newspaper_woman_to_read_transfer_column",
      "ask_lunch_tin_worker_to_set_pace",
      "return_lost_mitten",
      "match_manifest_keepsakes",
      "help_passengers_gather",
      "board_third_car_with_passengers"
    ]);

    state = choose(story, state, "help_passengers_gather");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.scene.text).toContain("passing steadiness from hand to hand");
    expect(observation.scene.text).toContain("every passenger helped the next one move");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);

    state = choose(story, state, "listen_to_gathered_passengers_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "pull_release_with_manifest"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "hear_final_passenger_roll_call"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_gathered_intercom"
    );

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("thanks each passenger by name");
    expect(observation.scene.text).toContain("passengers helping one another down");
    expectIdealScore(observation.score);
  });

  it("surfaces the gathered-passenger boarding route directly from the opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "help_opened_passengers_gather"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.scene.text).toContain("passing steadiness from hand to hand");
    expect(observation.scene.text).toContain("every passenger helped the next one move");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);

    const rollCallState = choose(story, state, "answer_final_roll_call_from_gathered_boarding");
    observation = observe(story, rollCallState);

    expect(observation.scene.id).toBe("passenger_roll_call_epilogue");
    expect(observation.scene.text).toContain("the passengers finish the roll call for her");
    expect(observation.state.flags.heard_final_roll_call).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_final_roll_call",
      "confirm_roll_call_answers_before_release"
    ]);

    const rollCallEnding = observe(
      story,
      choose(story, rollCallState, "pull_release_after_final_roll_call")
    );

    expect(rollCallEnding.scene.id).toBe("passenger_roll_call_true_ending");
    expect(rollCallEnding.scene.ending).toBe(true);
    expectIdealScore(rollCallEnding.score);

    const checkedRollCallState = choose(
      story,
      rollCallState,
      "confirm_roll_call_answers_before_release"
    );
    observation = observe(story, checkedRollCallState);

    expect(observation.scene.id).toBe("passenger_roll_call_answer_check");
    expect(observation.state.flags.confirmed_roll_call_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_roll_call_answers"
    ]);

    const checkedRollCallEnding = observe(
      story,
      choose(story, checkedRollCallState, "pull_release_after_confirmed_roll_call_answers")
    );

    expect(checkedRollCallEnding.scene.id).toBe("passenger_roll_call_true_ending");
    expect(checkedRollCallEnding.scene.ending).toBe(true);
    expectIdealScore(checkedRollCallEnding.score);

    state = choose(story, state, "listen_to_gathered_passengers_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_intercom",
      "hear_final_passenger_roll_call",
      "pull_release_after_gathered_intercom"
    ]);

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("No one crosses alone");
    expectIdealScore(observation.score);
  });

  it("lets players hear the gathered-passenger intercom directly from opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_as_opened_passengers_gather"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.scene.text).toContain("The passengers gather themselves");
    expect(observation.scene.text).toContain("they can move together");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_intercom",
      "hear_final_passenger_roll_call",
      "pull_release_after_gathered_intercom"
    ]);

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("No one crosses alone");
    expectIdealScore(observation.score);
  });

  it("lets Mara's passenger sign-off gather the platform into a shared boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "ask_mara_to_sign_off_from_platform"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mara_signoff");
    expect(observation.scene.text).toContain("no one boards alone");
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain("gather_after_mara_signoff");

    state = choose(story, state, "gather_after_mara_signoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.scene.text).toContain("passing steadiness from hand to hand");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);

    state = choose(story, state, "pull_release_after_gathered_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces matched keepsakes directly from the opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "match_opened_manifest_keepsakes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_handoff");
    expect(observation.scene.text).toContain("people finding their places");
    expect(observation.state.flags.matched_manifest_keepsakes).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_childs_mitten_from_keepsakes",
      "check_matched_keepsakes_before_boarding",
      "carry_matched_keepsakes_to_speaker",
      "lead_keepsake_passengers_to_third_car"
    ]);

    state = choose(story, state, "lead_keepsake_passengers_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_boarding");
    expect(observation.scene.text).toContain("fills by object before it fills by name");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "hear_keepsake_roll_call_from_boarding"
    );

    state = choose(story, state, "hear_keepsake_roll_call_from_boarding");
    state = choose(story, state, "pull_release_after_keepsake_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces the matched-keepsake check directly from the opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "check_opened_manifest_keepsakes"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_check");
    expect(observation.scene.text).toContain("ordinary proofs answer");
    expect(observation.scene.text).toContain("They are accounted for");
    expect(observation.state.flags.matched_manifest_keepsakes).toBe(true);
    expect(observation.state.flags.checked_matched_keepsakes).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_checked_keepsakes_to_speaker",
      "lead_checked_keepsakes_to_third_car"
    ]);

    state = choose(story, state, "lead_checked_keepsakes_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_boarding");
    expect(observation.scene.text).toContain("fills by object before it fills by name");

    state = choose(story, state, "pull_release_after_keepsake_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_keepsake_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces the returned-mitten route directly from the opened manifest doors", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "return_opened_manifest_mitten"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_memory");
    expect(observation.scene.text).toContain("Then we will find it in the morning");
    expect(observation.state.flags.returned_lost_mitten).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "lead_mitten_child_to_third_car"
    ]);

    state = choose(story, state, "lead_mitten_child_to_third_car");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_intercom");
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "pull_release_after_mitten_child_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mitten_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the opened manifest names answer directly before boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "let_opened_manifest_names_answer_once"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_answers");
    expect(observation.scene.text).toContain("a car full of people proving");
    expect(observation.state.flags.manifest_names_answered_once).toBe(true);
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "carry_manifest_answers_to_platform",
      "hand_manifest_answers_to_mara",
      "let_manifest_answers_keep_door_rhythm",
      "check_manifest_answers_against_echoes",
      "pull_release_after_manifest_answers"
    ]);

    const carriedState = choose(story, state, "carry_manifest_answers_to_platform");
    observation = observe(story, carriedState);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.scene.text).toContain("Warden Street");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_after_answered_passengers"
    );

    const boardedState = choose(story, carriedState, "board_after_answered_passengers");
    observation = observe(story, boardedState);

    expect(observation.scene.id).toBe("passenger_answered_boarding");
    expect(observation.scene.text).toContain("The answered passengers board");
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_after_answered_boarding"
    );

    observation = observe(
      story,
      choose(story, boardedState, "pull_release_after_answered_boarding")
    );

    expect(observation.scene.id).toBe("passenger_answered_boarding_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const handoffState = choose(story, state, "hand_manifest_answers_to_mara");
    observation = observe(story, handoffState);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.scene.text).toContain("handoff instead of a duty");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    observation = observe(
      story,
      choose(
        story,
        choose(story, handoffState, "listen_to_answered_handoff_after_roll_call"),
        "pull_release_after_answered_handoff_intercom"
      )
    );

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    observation = observe(
      story,
      choose(
        story,
        choose(story, state, "let_manifest_answers_keep_door_rhythm"),
        "pull_release_after_echoed_manifest_goodbye"
      )
    );

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const releaseState = choose(story, state, "pull_release_after_manifest_answers");
    observation = observe(story, releaseState);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expectIdealScore(observation.score);
  });

  it("lets Mara hand the opened manifest roll call directly to the passengers", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "inspect_signal_ledger",
      "read_manifest_from_ledger",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_handoff_opened_roll_call"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_roll_call");
    expect(observation.scene.text).toContain("handoff instead of a duty");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.state.flags.heard_answered_passengers).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBeUndefined();
    expect(observation.state.flags.heard_mara_goodbye).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "listen_to_answered_handoff_after_roll_call"
    ]);

    state = choose(story, state, "listen_to_answered_handoff_after_roll_call");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_intercom");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);

    state = choose(story, state, "pull_release_after_answered_handoff_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_answered_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players ask Mara for a direct third-car readout", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_read_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_intercom");
    expect(observation.scene.text).toContain("each name answers with a small ordinary sound");
    expect(observation.state.flags.heard_mara_goodbye).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBeUndefined();
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "let_manifest_names_answer_once",
      "pull_release_after_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("opened manifest is still answering");
    expectIdealScore(observation.score);
  });

  it("adds a one-time passenger morning chorus after opening the manifest", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_morning_chorus"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_chorus");
    expect(observation.scene.text).toContain("a kettle left on a stove");
    expect(observation.scene.text).toContain("somewhere to arrive");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "board_after_passenger_morning_chorus",
      "let_morning_chorus_answer_names",
      "let_mara_handoff_morning_names",
      "listen_for_echoes_inside_morning_chorus",
      "gather_after_passenger_morning_chorus",
      "cross_after_passenger_morning_chorus",
      "return_from_passenger_morning_chorus"
    ]);

    const answeredMorningState = choose(story, state, "let_morning_chorus_answer_names");
    observation = observe(story, answeredMorningState);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.scene.text).toContain("present finally means something again");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_answered_names_to_intercom"
    );

    const echoedMorningState = choose(story, state, "listen_for_echoes_inside_morning_chorus");
    observation = observe(story, echoedMorningState);

    expect(observation.scene.id).toBe("opened_manifest_echoes");
    expect(observation.scene.text).toContain("without the ink between");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);
    expect(observation.state.flags.echoed_manifest_boarded).toBeUndefined();

    let echoedBoardingState = choose(story, echoedMorningState, "check_listened_manifest_echoes");
    observation = observe(story, echoedBoardingState);

    expect(observation.scene.id).toBe("passenger_echoed_check");
    expect(observation.state.flags.checked_echoed_passengers).toBe(true);

    echoedBoardingState = choose(story, echoedBoardingState, "carry_checked_echoes_to_speaker");
    echoedBoardingState = choose(
      story,
      echoedBoardingState,
      "pull_release_after_echoed_manifest_goodbye"
    );
    observation = observe(story, echoedBoardingState);

    expect(observation.scene.id).toBe("passenger_echoed_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const returnedState = choose(story, state, "return_from_passenger_morning_chorus");
    observation = observe(story, returnedState);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_to_passenger_morning_chorus"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_morning_chorus_from_opened_manifest"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_after_releasing_passengers"
    );

    state = choose(story, state, "board_after_passenger_morning_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_intercom");
    expect(observation.state.flags.heard_passenger_morning_boarding).toBe(true);
    expect(observation.scene.text).toContain("the kettle before it boils dry");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_morning_chorus_boarding",
      "confirm_morning_stops_before_release"
    ]);

    state = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the morning chorus flow into Mara's manifest handoff", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_morning_chorus",
      "let_mara_handoff_morning_names"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.scene.text).toContain("steadiness can be handed from name to name");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "pull_release_during_mara_manifest_handoff"
    );

    state = choose(story, state, "pull_release_during_mara_manifest_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_manifest_handoff_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets the passenger morning chorus gather the third-car boarding", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_morning_chorus",
      "gather_after_passenger_morning_chorus"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_boarding");
    expect(observation.scene.text).toContain("passing steadiness from hand to hand");
    expect(observation.scene.text).toContain("every passenger helped the next one move");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "check_shared_release_from_gathered_boarding",
      "answer_final_roll_call_from_gathered_boarding",
      "listen_to_gathered_passengers_from_boarding",
      "pull_release_after_gathered_boarding"
    ]);

    state = choose(story, state, "pull_release_after_gathered_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("carries the passenger morning chorus from the opened manifest hub", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_morning_chorus",
      "return_from_passenger_morning_chorus",
      "carry_morning_chorus_from_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_intercom");
    expect(observation.scene.text).toContain("stops with real streets again");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.heard_passenger_morning_boarding).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_morning_chorus_boarding",
      "confirm_morning_stops_before_release"
    ]);

    state = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("pays off the passenger morning chorus before the release", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "listen_to_passenger_morning_chorus",
      "board_after_passenger_morning_chorus"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_intercom");
    expect(observation.scene.text).toContain("the kettle before it boils dry");
    expect(observation.scene.text).toContain("stops with real streets again");
    expect(observation.state.flags.heard_passenger_morning_boarding).toBe(true);
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_morning_chorus_boarding",
      "confirm_morning_stops_before_release"
    ]);

    const directState = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, directState);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    let confirmedState = choose(story, state, "confirm_morning_stops_before_release");
    observation = observe(story, confirmedState);

    expect(observation.scene.id).toBe("passenger_morning_stop_check");
    expect(observation.scene.text).toContain("Warden Street");
    expect(observation.scene.text).toContain("the sign answers");
    expect(observation.state.flags.confirmed_morning_stops).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_confirmed_morning_stops"
    ]);

    confirmedState = choose(story, confirmedState, "pull_release_after_confirmed_morning_stops");
    observation = observe(story, confirmedState);

    expect(observation.scene.id).toBe("passenger_morning_stop_checked_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.scene.text).toContain("Bellweather Yard");
    expect(observation.scene.text).toContain("the remembered stops answer in full");
    expectIdealScore(observation.score);
  });

  it("lets opened-manifest players board directly with the morning chorus", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_with_passenger_morning_chorus"
    );

    state = choose(story, state, "board_with_passenger_morning_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_intercom");
    expect(observation.scene.text).toContain("stops with real streets again");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.state.flags.heard_passenger_morning_boarding).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "pull_release_after_morning_chorus_boarding",
      "confirm_morning_stops_before_release"
    ]);

    state = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("lets Mara's opened-door handoff lead into the morning chorus", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "watch_mara_open_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("mara_manifest_handoff");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "ask_mara_about_morning_after_manifest_handoff"
    );

    state = choose(story, state, "ask_mara_about_morning_after_manifest_handoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_chorus");
    expect(observation.scene.text).toContain("a kettle left on a stove");
    expect(observation.state.flags.saw_mara_manifest_handoff).toBe(true);
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);

    state = choose(story, state, "board_after_passenger_morning_chorus");
    state = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("surfaces the morning chorus from the passenger platform", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_for_platform_morning_chorus"
    );

    state = choose(story, state, "listen_for_platform_morning_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_chorus");
    expect(observation.scene.text).toContain("a kettle left on a stove");
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "cross_after_passenger_morning_chorus"
    );

    state = choose(story, state, "cross_after_passenger_morning_chorus");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_for_platform_morning_chorus"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_third_car_with_passengers"
    );

    state = choose(story, state, "board_third_car_with_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "listen_to_morning_chorus_from_boarding"
    );

    state = choose(story, state, "listen_to_morning_chorus_from_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_morning_intercom");
    expect(observation.scene.text).toContain("stops with real streets again");
    expect(observation.state.flags.heard_passenger_morning_boarding).toBe(true);

    state = choose(story, state, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("adds a one-time Mara sign-off for the opened passenger manifest", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "take_map",
      "search_locker",
      "take_fuse",
      "take_badge",
      "close_locker",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "read_passenger_manifest",
      "return_to_signal_ledger_from_manifest",
      "clear_manifest_and_mara_from_ledger",
      "ask_mara_to_sign_off_opened_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_mara_signoff");
    expect(observation.scene.text).toContain("You are not late. You were held.");
    expect(observation.scene.text).toContain("no one boards alone");
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.objectives).toEqual([OPENED_MANIFEST_OBJECTIVE]);
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "notice_manifest_thumbprint_after_mara_signoff",
      "listen_to_answers_after_mara_signoff",
      "listen_for_morning_after_mara_signoff",
      "gather_after_mara_signoff",
      "return_from_passenger_mara_signoff",
      "cross_after_passenger_mara_signoff",
      "board_after_passenger_mara_signoff"
    ]);

    let morningState = choose(story, state, "listen_for_morning_after_mara_signoff");
    observation = observe(story, morningState);

    expect(observation.scene.id).toBe("passenger_morning_chorus");
    expect(observation.scene.text).toContain("somewhere to arrive");
    expect(observation.state.flags.heard_passenger_mara_signoff).toBe(true);
    expect(observation.state.flags.heard_passenger_morning_chorus).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "board_after_passenger_morning_chorus"
    );

    morningState = choose(story, morningState, "board_after_passenger_morning_chorus");
    morningState = choose(story, morningState, "pull_release_after_morning_chorus_boarding");
    observation = observe(story, morningState);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const answeredState = choose(story, state, "listen_to_answers_after_mara_signoff");
    observation = observe(story, answeredState);

    expect(observation.scene.id).toBe("passenger_answers");
    expect(observation.scene.text).toContain("present finally means something again");
    expect(observation.state.flags.heard_passenger_answers).toBe(true);
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_answered_names_to_intercom"
    );

    let answeredReleaseState = choose(story, answeredState, "carry_answered_names_to_intercom");
    observation = observe(story, answeredReleaseState);

    expect(observation.scene.id).toBe("passenger_answered_intercom");
    expect(observation.state.flags.heard_answered_passengers).toBe(true);

    answeredReleaseState = choose(
      story,
      answeredReleaseState,
      "pull_release_after_answered_intercom"
    );
    observation = observe(story, answeredReleaseState);

    expect(observation.scene.id).toBe("passenger_answered_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);

    const returnedState = choose(story, state, "return_from_passenger_mara_signoff");
    observation = observe(story, returnedState);

    expect(observation.scene.id).toBe("passengers_released");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "ask_mara_to_sign_off_opened_manifest"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain("listen_to_passenger_answers");

    state = choose(story, state, "board_after_passenger_mara_signoff");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain(
      "carry_mara_signoff_to_gathered_passengers"
    );
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release_with_manifest");

    state = choose(story, state, "carry_mara_signoff_to_gathered_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_gathered_intercom");
    expect(observation.scene.text).toContain("passengers gather themselves");
    expect(observation.state.flags.helped_passengers_gather).toBe(true);
    expect(observation.state.flags.heard_gathered_passengers).toBe(true);

    state = choose(story, state, "pull_release_after_gathered_intercom");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_helped_true_ending");
    expect(observation.scene.ending).toBe(true);
    expectIdealScore(observation.score);
  });

  it("keeps badge-less ledger states recoverable", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state: GameState = {
      ...initialState(story),
      currentScene: "signal_ledger",
      flags: {
        has_light: true,
        found_token: true,
        inspected_signal_ledger: true,
        platform_lit: true
      },
      inventory: ["fuse", "lantern", "map", "token"],
      history: []
    };

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_ledger");
    expect(choiceIds).toEqual(["return_for_mara_badge"]);

    for (const choiceId of [
      "return_for_mara_badge",
      "search_locker",
      "take_badge",
      "close_locker",
      "return_to_lit_platform",
      "use_token_slot",
      "reopen_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.state.flags.freed_mara).toBe(true);
    expect(choiceIds).toContain("pull_release");
  });

  it("keeps the locker open until players take both true-ending tools", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "open_service_door", "search_locker", "take_fuse"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).toContain("take_badge");
    expect(choiceIds).not.toContain("close_locker");

    state = choose(story, state, "take_badge");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).toEqual(["inspect_badge_back", "close_locker"]);
  });
});
