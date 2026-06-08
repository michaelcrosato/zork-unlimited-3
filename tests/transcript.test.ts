import { describe, expect, it } from "vitest";
import { choose, initialState } from "../src/engine.js";
import { renderTranscript } from "../src/transcript.js";
import { loadStory } from "../src/story.js";

describe("transcript rendering", () => {
  it("adds a final-state audit for stalled or exploratory routes", async () => {
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

    const transcript = renderTranscript(story, state);

    expect(transcript).toContain("## Final State");
    expect(transcript).toContain("Scene: signal_booth (in progress)");
    expect(transcript).toMatch(/Score: \d+\n/);
    expect(transcript).not.toContain("Score: 55/100");
    expect(transcript).toContain("Point awards:");
    expect(transcript).toContain("- +10: Recovered the signal-booth token");
    expect(transcript).not.toContain("- missing:");
    expect(transcript).toContain("- Use the signal booth to resolve Mara's ledger entry.");
    expect(transcript).toContain(
      "- Read Mara's uncrossed ledger entry (inspect_signal_ledger -> signal_ledger)"
    );
    expect(transcript).toContain(
      "- Read the kept-passenger manifest (read_passenger_manifest -> passenger_manifest)"
    );
  });

  it("reports endings as complete with no remaining choices", async () => {
    const story = await loadStory("stories/demo.yaml");
    let state = initialState(story);

    for (const choiceId of [
      "read_notice",
      "take_lantern_after_notice",
      "inspect_clock",
      "take_token",
      "open_service_door",
      "read_personnel_file",
      "keep_mara_file",
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
    ]) {
      state = choose(story, state, choiceId);
    }

    const transcript = renderTranscript(story, state);

    expect(transcript).toContain("Scene: true_ending (ending)");
    expect(transcript).toMatch(/Score: \d+\n/);
    expect(transcript).not.toContain("Score: 100/100");
    expect(transcript).toContain("- +35: Opened every door with the emergency release");
    expect(transcript).not.toContain("- missing:");
    expect(transcript).toContain("Objectives:\n- none");
    expect(transcript).toContain("Available choices:\n- none");
  });

  it("groups long final-state choice lists for route critique", async () => {
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

    const transcript = renderTranscript(story, state);

    expect(transcript).toContain("Scene: passengers_released (in progress)");
    expect(transcript).toContain("Available choices:");
    expect(transcript).toContain(
      "Board / release:\n- Board now and make room around the emergency release"
    );
    expect(transcript).toContain("Finish Mara's handoff:\n- Watch Mara call the opened doors");
    expect(transcript).toContain("- Carry Mara's opened-door handoff to the third car");
    expect(transcript).toContain("Manifest count:\n- Review the opened count");
    expect(transcript).toContain("Counts / answers:");
    expect(transcript).toContain(
      "Lunch tin / shift count:\n- Check the lunch-tin worker's passenger count before boarding"
    );
    expect(transcript).toContain("- Board with the lunch-tin worker's count ready for the release");
    expect(transcript).toContain("Passenger gathering:");
    expect(transcript).toContain(
      "- Help the opened passengers gather by helping one another board"
    );
    expect(transcript).toContain("Door echoes / threshold:");
    expect(transcript).toContain("Morning / keepsakes:");
  });
});
