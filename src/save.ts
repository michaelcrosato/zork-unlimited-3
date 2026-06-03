import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { z } from "zod";
import { GameState, SaveFile, SaveFileSchema } from "./schema.js";

export async function writeSave(path: string, storyPath: string, state: GameState): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const save: SaveFile = { storyPath, state };
  await writeFile(path, `${JSON.stringify(save, null, 2)}\n`, "utf8");
}

export async function readSave(path: string): Promise<SaveFile> {
  try {
    return SaveFileSchema.parse(JSON.parse(await readFile(path, "utf8")));
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof z.ZodError) {
      throw new Error(`Invalid save file '${path}': ${error.message}`);
    }
    throw error;
  }
}
