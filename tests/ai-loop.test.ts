import { describe, expect, it } from "vitest";
import {
  agentAuthFailureExitCode,
  cycleSavePath,
  exploratoryMaxSteps,
  formatIdealEndingBreakdown,
  getRestartSensitiveChangedPaths,
  idealEndingRate,
  isAgentAuthenticationFailure,
  parseMcpJsonResult,
  runLocalExploratoryRouteForStory,
  parsePorcelainPaths,
  requiresLoopRestart,
  restartRequestedExitCode,
  shellQuote,
  shouldCommitCycleObservation
} from "../src/ai-loop.js";
import type { Story } from "../src/schema.js";

describe("AI loop restart detection", () => {
  it("requires a restart when loop runtime files change", () => {
    expect(requiresLoopRestart(["stories/demo.yaml", "src/ai-loop.ts"])).toBe(true);
    expect(requiresLoopRestart(["src/ai-loop-metrics.ts"])).toBe(true);
    expect(requiresLoopRestart(["package.json"])).toBe(true);
    expect(requiresLoopRestart(["package-lock.json"])).toBe(true);
  });

  it("reports only runtime-sensitive paths for restart messages", () => {
    expect(
      getRestartSensitiveChangedPaths(["README.md", "src/ai-loop.ts", "package-lock.json"])
    ).toEqual(["src/ai-loop.ts", "package-lock.json"]);
    expect(
      getRestartSensitiveChangedPaths(["src/ai-loop-metrics.ts", "stories/demo.yaml"])
    ).toEqual(["src/ai-loop-metrics.ts"]);
  });

  it("uses a stable restart-request exit code for loop.sh", () => {
    expect(restartRequestedExitCode).toBe(75);
  });

  it("uses a stable agent-auth failure exit code for loop.sh", () => {
    expect(agentAuthFailureExitCode).toBe(76);
  });

  it("commits cycle observations only after pushed agent cycles", () => {
    expect(shouldCommitCycleObservation("pushed", true)).toBe(true);
    expect(shouldCommitCycleObservation("committed", true)).toBe(false);
    expect(shouldCommitCycleObservation("failed", true)).toBe(false);
    expect(shouldCommitCycleObservation("pushed", false)).toBe(false);
  });

  it("quotes shell arguments for the active platform", () => {
    expect(shellQuote("AI loop cycle 1 autonomous improvement", "win32")).toBe(
      '"AI loop cycle 1 autonomous improvement"'
    );
    expect(shellQuote("6bd533592d96e4b7371228c3032098dd790b2427", "win32")).toBe(
      '"6bd533592d96e4b7371228c3032098dd790b2427"'
    );
    expect(shellQuote("AI loop cycle 1 autonomous improvement", "linux")).toBe(
      "'AI loop cycle 1 autonomous improvement'"
    );
  });

  it("does not require a restart for ordinary story, docs, or test changes", () => {
    expect(
      requiresLoopRestart(["README.md", "stories/demo.yaml", "tests/story-paths.test.ts"])
    ).toBe(false);
  });

  it("parses git porcelain paths including renames", () => {
    expect(
      parsePorcelainPaths(" M src/ai-loop.ts\n?? OUTPUTLOG.md\nR  old.md -> new.md\n")
    ).toEqual(["src/ai-loop.ts", "OUTPUTLOG.md", "old.md", "new.md"]);
  });

  it("counts true-ending variants as ideal endings in loop evidence", () => {
    const summary = {
      runs: 100,
      endings: {
        true_ending: 27,
        mara_handoff_true_ending: 10,
        passenger_true_ending: 22,
        passenger_answered_true_ending: 2,
        passenger_answered_boarding_true_ending: 1,
        passenger_counted_true_ending: 1,
        passenger_reviewed_count_true_ending: 1,
        passenger_manifest_true_ending: 1,
        passenger_manifest_handoff_true_ending: 1,
        passenger_manifest_thumbprint_true_ending: 1,
        passenger_answered_handoff_true_ending: 1,
        passenger_echoed_true_ending: 1,
        passenger_helped_true_ending: 5,
        passenger_roll_call_true_ending: 3,
        passenger_lunch_tin_true_ending: 4,
        passenger_conductor_true_ending: 6,
        passenger_conductor_count_true_ending: 1,
        passenger_keepsake_true_ending: 3,
        passenger_newspaper_true_ending: 2,
        passenger_mitten_true_ending: 4,
        good_ending: 16
      }
    };

    expect(idealEndingRate(summary)).toBe(0.97);
    expect(formatIdealEndingBreakdown(summary)).toContain("Ideal: 97");
    expect(formatIdealEndingBreakdown(summary)).toContain("true_ending: 27");
    expect(formatIdealEndingBreakdown(summary)).not.toContain("good_ending");
  });

  it("allows exploratory MCP routes enough steps for late-game detours", () => {
    expect(exploratoryMaxSteps).toBeGreaterThanOrEqual(45);
  });

  it("uses cycle-specific MCP save paths so evidence routes start cleanly", () => {
    expect(cycleSavePath("exploratory", 10)).toBe("saves/ai-loop-exploratory-cycle-10.json");
    expect(cycleSavePath("mcp", 10)).toBe("saves/ai-loop-mcp-cycle-10.json");
    expect(cycleSavePath("exploratory", 11)).not.toBe(cycleSavePath("exploratory", 10));
  });

  it("reports non-JSON MCP tool payloads with tool context", () => {
    expect(() =>
      parseMcpJsonResult(
        {
          content: [
            {
              type: "text",
              text: "Choice 'return_to_service_room' is not available in scene 'entrance'"
            }
          ]
        },
        "choose_option"
      )
    ).toThrow(/MCP tool 'choose_option' returned non-JSON text: .*Choice 'return_to_service_room'/);
  });

  it("recognizes non-retryable nested agent authentication failures", () => {
    expect(
      isAgentAuthenticationFailure(
        "ERROR: unexpected status 401 Unauthorized: Missing bearer or basic authentication in header"
      )
    ).toBe(true);
    expect(isAgentAuthenticationFailure("MCP error -32001: Request timed out")).toBe(false);
  });

  it("keeps adaptive exploratory evidence useful when the local fallback stops unfinished", () => {
    const story: Story = {
      id: "fallback-test",
      title: "Fallback Test",
      start: "hub",
      scenes: {
        hub: {
          text: "Hub",
          ending: false,
          routeImportance: "main",
          choices: [{ id: "wait", label: "Wait here", to: "hub" }]
        }
      }
    };

    const result = runLocalExploratoryRouteForStory(story, 41);

    expect(result.ok).toBe(false);
    expect(result.source).toBe("local-fallback");
    expect(result.finalScene).toBe("hub");
    expect(result.transcript).toContain("## Final State");
    expect(result.transcript).toContain("Available choices:");
    expect(result.transcript).toContain("Wait here (wait -> hub)");
  });
});
