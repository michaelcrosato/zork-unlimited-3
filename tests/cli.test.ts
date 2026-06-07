import { describe, expect, it } from "vitest";
import { runCliCommand } from "../src/cli.js";

const cliTestTimeoutMs = 20_000;

interface CliTestError extends Error {
  code: number;
  stdout: string;
  stderr: string;
}

describe("cli", () => {
  it(
    "rejects non-integer playtest runs",
    async () => {
      await expect(
        runCli(["playtest", "stories/demo.yaml", "--runs", "NaN"])
      ).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining("--runs must be a positive integer")
      });
    },
    cliTestTimeoutMs
  );

  it(
    "rejects missing option values",
    async () => {
      await expect(
        runCli(["start", "stories/demo.yaml", "--save", "--json"])
      ).rejects.toMatchObject({
        code: 1,
        stderr: expect.stringContaining("Missing value for --save")
      });
    },
    cliTestTimeoutMs
  );

  it(
    "runs a small JSON playtest with explicit positive integer options",
    async () => {
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
    },
    cliTestTimeoutMs
  );
});

function runCli(args: string[]) {
  return runCliInProcess(args);
}

async function runCliInProcess(args: string[]): Promise<{ stdout: string; stderr: string }> {
  let stdout = "";
  let stderr = "";
  const code = await runCliCommand(args, {
    stdout: (text) => {
      stdout += text;
    },
    stderr: (text) => {
      stderr += text;
    }
  });

  if (code !== 0) {
    const error = new Error(`Command failed: cyoa ${args.join(" ")}`) as CliTestError;
    error.code = code;
    error.stdout = stdout;
    error.stderr = stderr;
    throw error;
  }

  return { stdout, stderr };
}
