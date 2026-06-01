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

  it("warns when nested requirements reference unknown items or flags", () => {
    const story: Story = {
      id: "references",
      title: "References",
      start: "start",
      scenes: {
        start: {
          text: "Start",
          ending: false,
          choices: [
            {
              id: "open",
              label: "Open",
              to: "end",
              requires: {
                all: [{ item: "missing_key" }, { flag: "missing_flag" }]
              }
            }
          ]
        },
        end: {
          text: "End",
          ending: true,
          choices: []
        }
      }
    };

    const result = validateStory(story);

    expect(result.ok).toBe(true);
    expect(result.warnings).toContain(
      "Choice 'start.open' requires item 'missing_key', but no choice adds it"
    );
    expect(result.warnings).toContain(
      "Choice 'start.open' requires flag 'missing_flag', but no choice sets it"
    );
  });
});
