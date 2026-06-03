import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { initialState } from "../src/engine.js";
import { readSave, writeSave } from "../src/save.js";
import { Story } from "../src/schema.js";

const story: Story = {
  id: "save-test",
  title: "Save Test",
  start: "start",
  scenes: {
    start: {
      text: "Start",
      ending: false,
      routeImportance: "main",
      choices: []
    }
  }
};

describe("save files", () => {
  it("round-trips a valid save file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "zork-save-"));
    const savePath = join(dir, "save.json");
    const state = initialState(story);

    await writeSave(savePath, "stories/demo.yaml", state);

    await expect(readSave(savePath)).resolves.toEqual({
      storyPath: "stories/demo.yaml",
      state
    });
  });

  it("rejects malformed JSON with save-file context", async () => {
    const dir = await mkdtemp(join(tmpdir(), "zork-save-"));
    const savePath = join(dir, "broken.json");
    await writeFile(savePath, "{", "utf8");

    await expect(readSave(savePath)).rejects.toThrow(`Invalid save file '${savePath}'`);
  });

  it("rejects save files with invalid state shape", async () => {
    const dir = await mkdtemp(join(tmpdir(), "zork-save-"));
    const savePath = join(dir, "invalid.json");
    await writeFile(
      savePath,
      JSON.stringify({
        storyPath: "stories/demo.yaml",
        state: {
          storyId: "save-test",
          currentScene: "start",
          flags: {},
          inventory: "lantern",
          history: []
        }
      }),
      "utf8"
    );

    await expect(readSave(savePath)).rejects.toThrow(`Invalid save file '${savePath}'`);
  });
});
