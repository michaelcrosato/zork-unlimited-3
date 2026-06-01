import { describe, expect, it } from "vitest";
import { choose, initialState, observe } from "../src/engine.js";
import type { GameState } from "../src/schema.js";
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
    expect(finalObservation.state.inventory).toEqual(["badge", "fuse", "lantern", "map", "token"]);
    expect(finalObservation.state.flags.freed_mara).toBe(true);
    expect(finalObservation.score.score).toBe(finalObservation.score.maxScore);
  });

  it("warns before the forced-gate bad ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "follow_arrows"]) {
      state = choose(story, state, choiceId);
    }

    let warning = observe(story, state);
    expect(warning.choices.map((choice) => choice.label)).toContain(
      "Force the rusted gate without the fuse"
    );

    state = choose(story, state, "force_gate");

    warning = observe(story, state);
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
    expect(mapChoice?.label).toBe("Take the marked Platform 13 map Mara asked for");
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
      "return_to_tunnel",
      "inspect_clock",
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
    expect(choiceIds[0]).toBe("install_fuse_and_insert_token");
    expect(choiceIds).not.toContain("install_fuse_from_gate_control");
    expect(choiceIds).toContain("return_to_service_room_for_parts");

    state = choose(story, state, "install_fuse_and_insert_token");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.state.flags.platform_lit).toBe(true);
    expect(choiceIds).toContain("inspect_signal_ledger");
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
      "inspect_signal_ledger",
      "mark_mara_clear_from_ledger",
      "board_after_clearing_mara"
    ]) {
      state = choose(story, state, choiceId);
    }

    const choiceIds = observe(story, state).choices.map((choice) => choice.id);

    expect(choiceIds).toContain("pull_release");
    expect(choiceIds).toContain("listen_to_mara_intercom");
    expect(choiceIds).not.toContain("ride_with_map");
    expect(choiceIds).not.toContain("look_at_sign");
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
    expect(observation.score.score).toBe(observation.score.maxScore);
  });

  it("adds an optional kept-passenger manifest before Mara's ledger row", async () => {
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
    expect(observation.scene.text).toContain("Mara's door is the only one still shut");
    expect(observation.state.flags.read_passenger_manifest).toBe(true);

    state = choose(story, state, "return_to_signal_ledger_from_manifest");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.choices.map((choice) => choice.id)).not.toContain("read_passenger_manifest");
    expect(observation.choices.map((choice) => choice.id)).toContain("listen_to_manifest_doors");
    expect(observation.choices.map((choice) => choice.id)).toContain("inspect_signal_ledger");

    state = choose(story, state, "listen_to_manifest_doors");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_echoes");
    expect(observation.scene.text).toContain("asking whether the next stop has rain");
    expect(observation.state.flags.heard_passenger_echoes).toBe(true);

    state = choose(story, state, "return_from_passenger_echoes");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("signal_booth");
    expect(observation.choices.map((choice) => choice.id)).not.toContain(
      "listen_to_manifest_doors"
    );

    for (const choiceId of [
      "inspect_signal_ledger",
      "clear_manifest_and_mara_from_ledger",
      "board_after_releasing_passengers",
      "board_third_car_with_passengers",
      "pull_release_with_manifest"
    ]) {
      state = choose(story, state, choiceId);
    }

    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.text).toContain("a lost mitten");
    expect(observation.score.score).toBe(observation.score.maxScore);
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
      "inspect_signal_ledger",
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
      "pull_release_after_manifest_goodbye"
    ]);

    state = choose(story, state, "pull_release_after_manifest_goodbye");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_true_ending");
    expect(observation.scene.ending).toBe(true);
    expect(observation.score.score).toBe(observation.score.maxScore);
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
    expect(choiceIds).not.toContain("listen_to_mara_manifest_intercom");
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

    expect(observation.scene.id).toBe("service_room");
    expect(observation.choices.map((choice) => choice.id)).toContain("take_map");
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

    state = choose(story, state, "flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_warning");
    expect(observation.scene.text).toContain("unfinished work");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "return_to_lit_platform_from_escape_warning",
      "confirm_flee_platform"
    ]);

    state = choose(story, state, "confirm_flee_platform");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("escape_ending");
    expect(observation.scene.ending).toBe(true);
  });

  it("lets wavering escape players return to the lit platform", async () => {
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

    expect(observation.scene.id).toBe("lit_platform");
    expect(choiceIds).toContain("flee_platform");
    expect(choiceIds).toContain("return_from_lit_platform");
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
    expect(choiceIds).not.toContain("flee_platform");
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
    expect(observation.state.flags.inspected_signal_ledger).toBe(true);
    expect(choiceIds).toEqual(["mark_mara_clear_from_ledger"]);
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
    expect(observation.state.flags.freed_mara).toBe(true);
    expect(observation.objectives).toEqual(["Pull the emergency release in the third car."]);
    expect(observation.choices.map((choice) => choice.id)).toEqual(["board_after_clearing_mara"]);

    state = choose(story, state, "board_after_clearing_mara");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release");
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
      "return_to_signal_ledger_from_manifest",
      "inspect_signal_ledger"
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
    expect(observation.objectives).toEqual(["Pull the emergency release in the third car."]);
    expect(choiceIds).toEqual(["board_after_releasing_passengers"]);

    state = choose(story, state, "board_after_releasing_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("passenger_platform");
    expect(observation.scene.text).toContain("a paper sack darkened by rain");
    expect(observation.choices.map((choice) => choice.id)).toEqual([
      "board_third_car_with_passengers"
    ]);

    state = choose(story, state, "board_third_car_with_passengers");
    observation = observe(story, state);

    expect(observation.scene.id).toBe("train_car");
    expect(observation.choices.map((choice) => choice.id)).toContain("pull_release_with_manifest");
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
    expect(choiceIds).toEqual(["close_locker"]);
  });
});
