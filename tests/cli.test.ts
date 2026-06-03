import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("cli", () => {
  it("rejects non-integer playtest runs", async () => {
    await expect(runCli(["playtest", "stories/demo.yaml", "--runs", "NaN"])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("--runs must be a positive integer")
    });
  });

  it("rejects missing option values", async () => {
    await expect(runCli(["start", "stories/demo.yaml", "--save", "--json"])).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining("Missing value for --save")
    });
  });

  it("runs a small JSON playtest with explicit positive integer options", async () => {
    const { stdout } = await runCli([
      "playtest",
      "stories/demo.yaml",
      "--runs",
      "1",
      "--max-steps",
      "3",
      "--summary",
      "--json"
    ]);

    expect(JSON.parse(stdout)).toMatchObject({
      runs: 1
    });
  });
});

function runCli(args: string[]) {
  return execFileAsync("node", ["--import", "tsx", "src/cli.ts", ...args], {
    cwd: process.cwd()
  });
}
