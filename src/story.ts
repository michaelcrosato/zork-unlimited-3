import { readFile } from "node:fs/promises";
import YAML from "yaml";
import { Story, StorySchema } from "./schema.js";

export async function loadStory(path: string): Promise<Story> {
  const raw = await readFile(path, "utf8");
  const parsed = YAML.parse(raw);
  return StorySchema.parse(parsed);
}
