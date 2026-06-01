import { describe, expect, it } from "vitest";
import {
  getRestartSensitiveChangedPaths,
  parsePorcelainPaths,
  requiresLoopRestart,
  restartRequestedExitCode
} from "../src/ai-loop.js";

describe("AI loop restart detection", () => {
  it("requires a restart when loop runtime files change", () => {
    expect(requiresLoopRestart(["stories/demo.yaml", "src/ai-loop.ts"])).toBe(true);
    expect(requiresLoopRestart(["package.json"])).toBe(true);
    expect(requiresLoopRestart(["package-lock.json"])).toBe(true);
  });

  it("reports only runtime-sensitive paths for restart messages", () => {
    expect(
      getRestartSensitiveChangedPaths(["README.md", "src/ai-loop.ts", "package-lock.json"])
    ).toEqual(["src/ai-loop.ts", "package-lock.json"]);
  });

  it("uses a stable restart-request exit code for loop.sh", () => {
    expect(restartRequestedExitCode).toBe(75);
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
});
