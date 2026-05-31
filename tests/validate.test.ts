import { describe, expect, it } from "vitest";
import { Story } from "../src/schema.js";
import { validateStory } from "../src/validate.js";

describe("validateStory", () => {
  it("reports missing destinations", () => {
    const story: Story = {
      id: "broken",
      title: "Broken",
      start: "start",
      scenes: {
        start: {
          text: "Start",
          ending: false,
          choices: [{ id: "go", label: "Go", to: "missing" }]
        }
      }
    };

    const result = validateStory(story);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Choice 'start.go' points to missing scene 'missing'");
  });
});
