import { describe, expect, it } from "vitest";
import { initialState } from "../src/engine.js";
import { invalidChoiceResult } from "../src/mcp-results.js";
import type { Story } from "../src/schema.js";

const story: Story = {
  id: "mcp-result-test",
  title: "MCP Result Test",
  start: "entrance",
  objectives: [{ text: "Take the safe route.", requires: { notFlag: "safe" } }],
  scenes: {
    entrance: {
      text: "Entrance",
      ending: false,
      routeImportance: "main",
      choices: [{ id: "read_notice", label: "Read the notice", to: "notice" }]
    },
    notice: {
      text: "Notice",
      ending: false,
      routeImportance: "main",
      choices: [
        {
          id: "ignore_warning",
          label: "Ignore the warning",
          to: "lost",
          effects: { set: { safe: true } }
        }
      ]
    },
    lost: {
      text: "Lost",
      ending: true,
      routeImportance: "optional",
      choices: []
    }
  }
};

describe("MCP result helpers", () => {
  it("formats invalid choices as parseable JSON with current legal choices", () => {
    const result = invalidChoiceResult(
      story,
      initialState(story),
      "ignore_warning",
      new Error("Choice 'ignore_warning' is not available in scene 'entrance'")
    );

    const payload = JSON.parse(result.content[0].text);

    expect(payload.ok).toBe(false);
    expect(payload.rejectedChoice).toBe("ignore_warning");
    expect(payload.scene.id).toBe("entrance");
    expect(payload.error).toContain("not available");
    expect(payload.choices.map((choice: { id: string }) => choice.id)).toEqual(["read_notice"]);
    expect(payload.objectives).toEqual(["Take the safe route."]);
  });
});
