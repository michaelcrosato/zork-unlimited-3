#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const defaultRunDir = "ai-runs/orchestrator";
const cycleReportPattern = /^cycle-.*\.md$/;
const minute = 60_000;
const hour = 60 * minute;

export interface WatchCadence {
  stage: string;
  delayMs: number;
}

export interface WatchSnapshot {
  now: Date;
  startedAt: Date;
  runDir: string;
  loopPid?: number;
  playtestPid?: number;
  loopAlive: boolean;
  playtestAlive: boolean;
  latestArtifact?: FileStamp;
  latestObservation?: string;
  loopLogTail: string;
  playtestLogTail: string;
}

export interface FileStamp {
  path: string;
  mtimeMs: number;
}

export interface Anomaly {
  severity: "hard" | "soft";
  reason: string;
}

export function monitorCadence(elapsedMs: number): WatchCadence {
  if (elapsedMs < 5 * minute) {
    return { stage: "first-5-minutes", delayMs: minute };
  }
  if (elapsedMs < 35 * minute) {
    return { stage: "next-30-minutes", delayMs: 5 * minute };
  }
  if (elapsedMs < hour) {
    return { stage: "to-60-minute-checkpoint", delayMs: 15 * minute };
  }
  if (elapsedMs < 24 * hour) {
    return { stage: "hourly-through-24-hours", delayMs: hour };
  }
  return { stage: "complete", delayMs: 0 };
}

export function classifyAnomalies(snapshot: WatchSnapshot): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const elapsedMs = snapshot.now.getTime() - snapshot.startedAt.getTime();

  if (snapshot.loopPid !== undefined && !snapshot.loopAlive) {
    anomalies.push({
      severity: "hard",
      reason: `main loop wrapper pid ${snapshot.loopPid} is dead`
    });
  }

  if (snapshot.playtestPid !== undefined && !snapshot.playtestAlive) {
    anomalies.push({
      severity: "hard",
      reason: `blind playtest wrapper pid ${snapshot.playtestPid} is dead`
    });
  }

  const latestArtifactAgeMs =
    snapshot.latestArtifact === undefined
      ? undefined
      : snapshot.now.getTime() - snapshot.latestArtifact.mtimeMs;
  const hasPostLaunchArtifact =
    snapshot.latestArtifact !== undefined &&
    snapshot.latestArtifact.mtimeMs >= snapshot.startedAt.getTime();
  if (elapsedMs >= 10 * minute && !hasPostLaunchArtifact) {
    anomalies.push({
      severity: "hard",
      reason: "no post-launch cycle report/prompt artifact appeared within 10 minutes"
    });
  } else if (latestArtifactAgeMs !== undefined && latestArtifactAgeMs > 2 * hour) {
    anomalies.push({
      severity: "soft",
      reason: "latest cycle artifact is older than 2 hours; check for stalled progress"
    });
  }

  const combinedLogs = `${snapshot.loopLogTail}\n${snapshot.playtestLogTail}`;
  const pushFailures = countMatches(combinedLogs, /git push failed|push attempt \d+ failed/gi);
  if (pushFailures >= 2) {
    anomalies.push({
      severity: "hard",
      reason: `repeated push failures detected (${pushFailures})`
    });
  }

  if (
    /agent authentication failure|status 76|401 Unauthorized|authentication (?:failed|required)/i.test(
      combinedLogs
    )
  ) {
    anomalies.push({ severity: "hard", reason: "agent authentication failure detected" });
  }

  if (/MCP play:\s*FAIL|mcpRoute":\{"ok":false|MCP route.*FAIL/i.test(combinedLogs)) {
    anomalies.push({ severity: "hard", reason: "MCP play failure detected in recent logs" });
  }

  if (/dirty baseline|refuses to auto-commit|refused to auto-commit/i.test(combinedLogs)) {
    anomalies.push({ severity: "hard", reason: "dirty-baseline auto-commit refusal detected" });
  }

  if (
    /AI agent command failed|Agent command exited \d+; refusing to commit|postAgentStatus":"failed/i.test(
      combinedLogs
    )
  ) {
    anomalies.push({ severity: "hard", reason: "agent command or post-agent automation failed" });
  }

  return anomalies;
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function readPid(path: string): number | undefined {
  try {
    const raw = readFileSync(path, "utf8").trim();
    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function processAlive(pid: number | undefined): boolean {
  if (pid === undefined) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function readTail(path: string, maxChars = 12_000): string {
  try {
    const text = readFileSync(path, "utf8");
    return text.slice(-maxChars);
  } catch {
    return "";
  }
}

function latestCycleArtifact(): FileStamp | undefined {
  if (!existsSync("ai-runs")) return undefined;
  const files = readdirSync("ai-runs", { withFileTypes: true })
    .filter((entry) => entry.isFile() && cycleReportPattern.test(entry.name))
    .map((entry) => {
      const path = join("ai-runs", entry.name);
      return { path, mtimeMs: statMtime(path) };
    })
    .filter((entry) => entry.mtimeMs > 0)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return files[0];
}

function statMtime(path: string): number {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function latestObservationLine(): string | undefined {
  const path = "ai-loop-observations/cycles.jsonl";
  try {
    const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
    return lines.at(-1);
  } catch {
    return undefined;
  }
}

function readStartedAt(runDir: string): Date {
  const raw = readTail(join(runDir, "launched-at.txt"), 200).trim();
  const parsed = raw ? new Date(raw) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function takeSnapshot(runDir: string): WatchSnapshot {
  const loopPid = readPid(join(runDir, "loop.pid"));
  const playtestPid = readPid(join(runDir, "playtest-loop.pid"));
  return {
    now: new Date(),
    startedAt: readStartedAt(runDir),
    runDir,
    loopPid,
    playtestPid,
    loopAlive: processAlive(loopPid),
    playtestAlive: processAlive(playtestPid),
    latestArtifact: latestCycleArtifact(),
    latestObservation: latestObservationLine(),
    loopLogTail: readTail(join(runDir, "loop.log")),
    playtestLogTail: readTail(join(runDir, "playtest-loop.log"))
  };
}

function renderSnapshot(snapshot: WatchSnapshot, anomalies: Anomaly[]): string {
  const elapsedMs = snapshot.now.getTime() - snapshot.startedAt.getTime();
  const cadence = monitorCadence(elapsedMs);
  const artifact =
    snapshot.latestArtifact === undefined
      ? "none"
      : `${snapshot.latestArtifact.path} (${formatAge(
          snapshot.now.getTime() - snapshot.latestArtifact.mtimeMs
        )} old${
          snapshot.latestArtifact.mtimeMs < snapshot.startedAt.getTime() ? ", pre-launch" : ""
        })`;
  const hard = anomalies.filter((item) => item.severity === "hard");
  const soft = anomalies.filter((item) => item.severity === "soft");
  const status = hard.length > 0 ? "ANOMALY" : soft.length > 0 ? "WATCH" : "OK";
  const reasons = anomalies.length > 0 ? anomalies.map((item) => item.reason).join("; ") : "none";
  return [
    `[${snapshot.now.toISOString()}] ${status}`,
    `stage=${cadence.stage}`,
    `next=${formatAge(cadence.delayMs)}`,
    `main=${snapshot.loopAlive ? "alive" : "dead"}`,
    `blind=${snapshot.playtestAlive ? "alive" : "dead"}`,
    `latestArtifact=${artifact}`,
    `anomalies=${reasons}`
  ].join(" | ");
}

function formatAge(ms: number): string {
  if (ms <= 0) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(name);
}

function option(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function killWatched(snapshot: WatchSnapshot): void {
  for (const pid of [snapshot.loopPid, snapshot.playtestPid]) {
    if (pid !== undefined && processAlive(pid)) {
      process.kill(pid, "SIGTERM");
    }
  }
}

async function main(): Promise<void> {
  const runDir = option("--run-dir", defaultRunDir);
  const once = hasFlag("--once");
  const killOnAnomaly = hasFlag("--kill-on-anomaly");

  while (true) {
    const snapshot = takeSnapshot(runDir);
    const anomalies = classifyAnomalies(snapshot);
    process.stdout.write(`${renderSnapshot(snapshot, anomalies)}\n`);

    if (killOnAnomaly && anomalies.some((item) => item.severity === "hard")) {
      killWatched(snapshot);
      process.exitCode = 2;
      return;
    }

    const elapsedMs = snapshot.now.getTime() - snapshot.startedAt.getTime();
    const cadence = monitorCadence(elapsedMs);
    if (once || cadence.delayMs === 0) return;
    await sleep(cadence.delayMs);
  }
}

if (process.argv[1]?.endsWith("orchestrator-watch.ts")) {
  await main();
}
