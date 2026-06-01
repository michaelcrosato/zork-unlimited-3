import { describe, expect, it } from "vitest";
import { choose, initialState, observe } from "../src/engine.js";
import { loadStory } from "../src/story.js";

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
      "mark_mara_clear",
      "pull_release"
    ];

    const finalState = path.reduce(
      (state, choiceId) => choose(story, state, choiceId),
      initialState(story)
    );
    const finalObservation = observe(story, finalState);

    expect(finalObservation.scene.id).toBe("true_ending");
    expect(finalObservation.scene.ending).toBe(true);
    expect(finalObservation.state.inventory).toEqual(["badge", "fuse", "lantern", "map", "token"]);
    expect(finalObservation.state.flags.freed_mara).toBe(true);
    expect(finalObservation.score.score).toBe(finalObservation.score.maxScore);
  });

  it("warns before the forced-gate bad ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows", "force_gate"]) {
      state = choose(story, state, choiceId);
    }

    const warning = observe(story, state);
    expect(warning.scene.id).toBe("gate_warning");
    expect(warning.scene.text).toContain("one last chance");
    expect(warning.choices.map((choice) => choice.label)).toContain(
      "Ignore the final warning and force the gate anyway"
    );
    expect(warning.choices.map((choice) => choice.id)).toContain("back_away_from_gate");

    state = choose(story, state, "back_away_from_gate");
    expect(observe(story, state).scene.id).toBe("service_room");
    expect(state.flags.backed_away_from_gate).toBe(true);
  });

  it("points underprepared platform explorers back to the marked map", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "open_service_door",
      "go_to_platform",
      "force_gate",
      "back_away_from_gate"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

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
    expect(choiceIds).toContain("ride_with_map");
    expect(choiceIds).toContain("look_at_sign");
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
    expect(observation.state.flags.knows_token_location).toBe(true);

    state = choose(story, state, "return_to_service_room_for_parts");
    observation = observe(story, state);

    const choiceIds = observation.choices.map((choice) => choice.id);
    expect(observation.scene.id).toBe("service_room");
    expect(observation.objectives).toContain(
      "Search the stopped tunnel clock for the signal booth token."
    );
    expect(choiceIds).toContain("take_map");
    expect(choiceIds).toContain("search_locker");
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

  it("lets players return from the service room to recover the token clue", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "return_to_tunnel"
    ]) {
      state = choose(story, state, choiceId);
    }

    const observation = observe(story, state);

    expect(observation.scene.id).toBe("tunnel");
    expect(observation.choices.map((choice) => choice.id)).toContain("inspect_clock");
  });

  it("makes the clock token the only clock action after Mara's file explains it", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "take_lantern",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
      "return_to_tunnel",
      "inspect_clock"
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

    state = choose(story, state, "look_away_from_sign");
    expect(observe(story, state).scene.id).toBe("good_ending");
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
      "mark_mara_clear"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("pull_release");
    expect(choiceIds).not.toContain("ride_with_map");
    expect(choiceIds).not.toContain("look_at_sign");
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
      "mark_mara_clear"
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
    expect(observation.objectives).toContain("Pull the emergency release in the third car.");
    expect(observation.score.score).toBe(observation.score.maxScore - 10);
    expect(choiceIds).toContain("pull_release");

    state = choose(story, state, "pull_release");
    const finalObservation = observe(story, state);
    expect(finalObservation.scene.id).toBe("true_ending");
    expect(finalObservation.score.score).toBe(finalObservation.score.maxScore);
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
    expect(choiceIds).toContain("use_token_slot");
    expect(choiceIds).toContain("inspect_mara_posters");
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

    state = choose(story, state, "flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);
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
  });

  it("focuses signal-booth choices on Mara when carrying her badge", async () => {
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

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toEqual(["mark_mara_clear"]);
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
    expect(choiceIds).toEqual(["close_locker"]);
  });
});
