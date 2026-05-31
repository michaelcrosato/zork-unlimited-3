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
      "search_locker",
      "take_badge",
      "go_to_platform",
      "install_fuse",
      "use_token_slot",
      "mark_mara_clear",
      "pull_release"
    ];

    const finalState = path.reduce((state, choiceId) => choose(story, state, choiceId), initialState(story));
    const finalObservation = observe(story, finalState);

    expect(finalObservation.scene.id).toBe("true_ending");
    expect(finalObservation.scene.ending).toBe(true);
    expect(finalObservation.state.inventory).toEqual(["badge", "fuse", "lantern", "map", "token"]);
    expect(finalObservation.state.flags.freed_mara).toBe(true);
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

  it("warns before the sign trap ending", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of ["take_lantern", "open_service_door", "take_map", "go_to_platform", "board_train", "look_at_sign"]) {
      state = choose(story, state, choiceId);
    }

    expect(observe(story, state).scene.id).toBe("sign_warning");

    state = choose(story, state, "look_away_from_sign");
    expect(observe(story, state).scene.id).toBe("good_ending");
  });
});
