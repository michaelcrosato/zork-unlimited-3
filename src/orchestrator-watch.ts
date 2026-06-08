#!/usr/bin/env node
import { execFileSync } from "node:child_process";
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
  expectedPlaytestCommit?: string;
  expectedPlaytestCommitTimeMs?: number;
  latestPlaytestSession?: PlaytestSessionLike;
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

interface CycleObservationLike {
  timestamp?: string;
  mcpRoute?: {
    ok?: boolean;
  };
  postAgentStatus?: string;
}

interface PlaytestSessionLike {
  ts?: string;
  commit?: string;
  run_id?: string;
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

  const unexpectedMainLoopExitCount = countUnexpectedMainLoopExits(combinedLogs);
  if (unexpectedMainLoopExitCount >= 2) {
    anomalies.push({
      severity: "hard",
      reason: `repeated unexpected main loop exits detected (${unexpectedMainLoopExitCount})`
    });
  } else if (unexpectedMainLoopExitCount === 1) {
    anomalies.push({
      severity: "soft",
      reason: "one recovered unexpected main loop exit detected"
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

  const observation = parseLatestObservation(snapshot.latestObservation);
  const postLaunchObservation = isPostLaunchObservation(observation, snapshot.startedAt);
  if (postLaunchObservation?.mcpRoute?.ok === false) {
    anomalies.push({
      severity: "hard",
      reason: "latest cycle observation reports MCP route failure"
    });
  }
  if (postLaunchObservation?.postAgentStatus === "failed") {
    anomalies.push({
      severity: "hard",
      reason: "latest cycle observation reports failed post-agent automation"
    });
  }

  const postLaunchPlaytestSession = isPostLaunchPlaytestSession(
    snapshot.latestPlaytestSession,
    snapshot.startedAt
  );
  if (
    snapshot.expectedPlaytestCommit &&
    postLaunchPlaytestSession?.commit &&
    !sameCommitPrefix(postLaunchPlaytestSession.commit, snapshot.expectedPlaytestCommit)
  ) {
    const sessionTime = parseTime(postLaunchPlaytestSession.ts);
    const expectedTime = snapshot.expectedPlaytestCommitTimeMs ?? snapshot.startedAt.getTime();
    if (sessionTime === undefined || sessionTime >= expectedTime + 2 * minute) {
      anomalies.push({
        severity: "hard",
        reason: `blind playtest session ${postLaunchPlaytestSession.run_id ?? "unknown"} used stale commit ${postLaunchPlaytestSession.commit}; expected ${snapshot.expectedPlaytestCommit}`
      });
    }
  }

  return anomalies;
}

function isPostLaunchObservation(
  observation: CycleObservationLike | undefined,
  startedAt: Date
): CycleObservationLike | undefined {
  if (!observation) return undefined;
  if (!observation.timestamp) return observation;
  const parsed = new Date(observation.timestamp);
  if (Number.isNaN(parsed.getTime())) return observation;
  return parsed.getTime() >= startedAt.getTime() ? observation : undefined;
}

function parseLatestObservation(line: string | undefined): CycleObservationLike | undefined {
  if (!line) return undefined;
  try {
    return JSON.parse(line) as CycleObservationLike;
  } catch {
    return undefined;
  }
}

function isPostLaunchPlaytestSession(
  session: PlaytestSessionLike | undefined,
  startedAt: Date
): PlaytestSessionLike | undefined {
  if (!session) return undefined;
  if (!session.ts) return session;
  const parsed = new Date(session.ts);
  if (Number.isNaN(parsed.getTime())) return session;
  return parsed.getTime() >= startedAt.getTime() ? session : undefined;
}

function parseLatestPlaytestSession(line: string | undefined): PlaytestSessionLike | undefined {
  if (!line) return undefined;
  try {
    return JSON.parse(line) as PlaytestSessionLike;
  } catch {
    return undefined;
  }
}

function parseTime(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.getTime();
}

function sameCommitPrefix(left: string, right: string): boolean {
  const a = left.trim();
  const b = right.trim();
  if (!a || !b) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function countUnexpectedMainLoopExits(text: string): number {
  const expectedRestartStatus = 75;
  const normalStatus = 0;
  return [...text.matchAll(/main ai loop exited with status (-?\d+)/gi)]
    .map((match) => Number(match[1]))
    .filter(
      (status) =>
        Number.isInteger(status) && status !== normalStatus && status !== expectedRestartStatus
    ).length;
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

function latestPlaytestSessionLine(): string | undefined {
  const explicitPath = process.env.AI_PLAYTEST_FEEDBACK_FILE;
  const worktreePath = process.env.AI_PLAYTEST_WORKTREE;
  const path =
    explicitPath ?? (worktreePath ? join(worktreePath, "playtest-feedback", "sessions.jsonl") : "");
  if (!path) return undefined;
  try {
    const lines = readFileSync(path, "utf8").trim().split(/\r?\n/);
    return lines.at(-1);
  } catch {
    return undefined;
  }
}

function readGit(args: string[]): string | undefined {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return undefined;
  }
}

function expectedPlaytestCommitTimeMs(): number | undefined {
  const raw = readGit(["log", "-1", "--format=%ct"]);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed * 1000 : undefined;
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
    expectedPlaytestCommit: readGit(["rev-parse", "--short", "HEAD"]),
    expectedPlaytestCommitTimeMs: expectedPlaytestCommitTimeMs(),
    latestPlaytestSession: parseLatestPlaytestSession(latestPlaytestSessionLine()),
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
  const playtestSession = snapshot.latestPlaytestSession
    ? `${snapshot.latestPlaytestSession.commit ?? "unknown"}@${
        snapshot.latestPlaytestSession.ts ?? "unknown"
      }`
    : "none";
  return [
    `[${snapshot.now.toISOString()}] ${status}`,
    `stage=${cadence.stage}`,
    `next=${formatAge(cadence.delayMs)}`,
    `main=${snapshot.loopAlive ? "alive" : "dead"}`,
    `blind=${snapshot.playtestAlive ? "alive" : "dead"}`,
    `playtestSession=${playtestSession}`,
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
