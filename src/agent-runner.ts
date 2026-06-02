import { spawn } from "node:child_process";

/**
 * Reusable helper for spawning an external agent command (e.g. `claude -p`,
 * `codex exec`, `gemini -p`) and feeding it a prompt on stdin. Mirrors the
 * spawn pattern used by the main AFK loop in `src/ai-loop.ts` so both loops
 * share the same contract: command on a shell, prompt on stdin, combined
 * stdout/stderr captured, optional hard timeout.
 */
export interface AgentResult {
  command: string;
  exitCode: number;
  output: string;
  timedOut: boolean;
}

export interface RunAgentOptions {
  env?: Record<string, string>;
  timeoutMs?: number;
}

export function runAgentCommand(
  command: string,
  prompt: string,
  options: RunAgentOptions = {}
): Promise<AgentResult> {
  const timeoutMs = options.timeoutMs ?? 0;
  return new Promise((resolve) => {
    const child = spawn(command, {
      shell: true,
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...(options.env ?? {}) }
    });

    let settled = false;
    let output = "";
    const timeout =
      timeoutMs > 0
        ? setTimeout(() => {
            if (settled) return;
            settled = true;
            child.kill("SIGTERM");
            resolve({ command, exitCode: 124, output, timedOut: true });
          }, timeoutMs)
        : undefined;

    child.stdout?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr?.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stdin?.on("error", () => {
      // Some commands finish without reading stdin; keep the runner from
      // crashing on EPIPE while still collecting their output and exit code.
    });
    child.on("error", (error) => {
      output += `\n${error instanceof Error ? error.message : String(error)}`;
    });
    child.on("close", (exitCode) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      resolve({ command, exitCode: exitCode ?? 1, output, timedOut: false });
    });

    child.stdin?.write(prompt);
    child.stdin?.end();
  });
}
