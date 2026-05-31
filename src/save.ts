import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { GameState, SaveFile } from "./schema.js";

export async function writeSave(path: string, storyPath: string, state: GameState): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const save: SaveFile = { storyPath, state };
  await writeFile(path, `${JSON.stringify(save, null, 2)}\n`, "utf8");
}

export async function readSave(path: string): Promise<SaveFile> {
  return JSON.parse(await readFile(path, "utf8")) as SaveFile;
}
