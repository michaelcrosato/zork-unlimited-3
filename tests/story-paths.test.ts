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

    expect(observe(story, state).scene.id).toBe("gate_warning");

    state = choose(story, state, "back_away_from_gate");
    expect(observe(story, state).scene.id).toBe("service_room");
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
    expect(choiceIds).toContain("look_at_sign");
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
    expect(choiceIds).toContain("pull_release");

    state = choose(story, state, "pull_release");
    expect(observe(story, state).scene.id).toBe("true_ending");
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

  it("keeps the locker open until players see both true-ending tools", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "open_service_door", "search_locker", "take_fuse"]) {
      state = choose(story, state, choiceId);
    }

    let observation = observe(story, state);
    let choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).toContain("take_badge");
    expect(choiceIds).toContain("close_locker");

    state = choose(story, state, "take_badge");
    observation = observe(story, state);
    choiceIds = observation.choices.map((choice) => choice.id);

    expect(observation.scene.id).toBe("locker");
    expect(choiceIds).toEqual(["close_locker"]);
  });
});
