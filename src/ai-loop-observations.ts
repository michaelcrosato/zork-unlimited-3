import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";

export const defaultObservationPath = "ai-loop-observations/cycles.jsonl";

export interface CycleMetricSnapshot {
  trueEndingRate: number;
  unfinishedRuns: number;
  bestScore: number;
}

export interface CycleMetricDiff {
  trueEndingRate: "up" | "down" | "same" | "unknown";
  unfinishedRuns: "up" | "down" | "same" | "unknown";
  bestScore: "up" | "down" | "same" | "unknown";
  verdict: "improved" | "regressed" | "mixed" | "no change" | "unknown";
}

export interface CycleObservation {
  recordType: "cycle";
  schemaVersion: 1;
  cycle: number;
  timestamp: string;
  gitCommit: string;
  agentCommand?: string;
  mcpRoute: {
    ok: boolean;
    finalScene?: string;
    score?: number;
  };
  metrics: CycleMetricSnapshot;
  comparedToPrevious?: CycleMetricDiff;
  changedFiles: string[];
  committedHash?: string;
  postAgentStatus?: string;
}

export interface CycleObservationInput {
  cycle: number;
  timestamp?: string;
  gitCommit: string;
  agentCommand?: string;
  mcpRoute: CycleObservation["mcpRoute"];
  metrics: CycleMetricSnapshot;
  changedFiles?: string[];
  committedHash?: string;
  postAgentStatus?: string;
}

export async function appendCycleObservation(
  input: CycleObservationInput,
  path = defaultObservationPath
): Promise<CycleObservation> {
  const previous = await readLatestCycleObservation(path);
  const observation: CycleObservation = {
    recordType: "cycle",
    schemaVersion: 1,
    cycle: input.cycle,
    timestamp: input.timestamp ?? new Date().toISOString(),
    gitCommit: input.gitCommit,
    agentCommand: input.agentCommand,
    mcpRoute: input.mcpRoute,
    metrics: input.metrics,
    comparedToPrevious: previous
      ? compareMetricSnapshots(previous.metrics, input.metrics)
      : undefined,
    changedFiles: [...(input.changedFiles ?? [])].sort(),
    committedHash: input.committedHash,
    postAgentStatus: input.postAgentStatus
  };

  await mkdir(dirname(path), { recursive: true });
  await appendFile(path, `${JSON.stringify(observation)}\n`, "utf8");
  return observation;
}

export async function readCycleObservations(
  path = defaultObservationPath
): Promise<CycleObservation[]> {
  let raw = "";
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const observations: CycleObservation[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parsed = JSON.parse(trimmed) as { recordType?: string };
    if (parsed.recordType === "cycle") observations.push(parsed as CycleObservation);
  }
  return observations;
}

export async function readLatestCycleObservation(
  path = defaultObservationPath
): Promise<CycleObservation | undefined> {
  const observations = await readCycleObservations(path);
  return observations.at(-1);
}

export function compareMetricSnapshots(
  previous: CycleMetricSnapshot | undefined,
  current: CycleMetricSnapshot | undefined
): CycleMetricDiff {
  const trueEndingRate = compareHigherIsBetter(previous?.trueEndingRate, current?.trueEndingRate);
  const unfinishedRuns = compareLowerIsBetter(previous?.unfinishedRuns, current?.unfinishedRuns);
  const bestScore = compareHigherIsBetter(previous?.bestScore, current?.bestScore);
  const signals = [trueEndingRate, unfinishedRuns, bestScore];
  const up = signals.filter((signal) => signal === "up").length;
  const down = signals.filter((signal) => signal === "down").length;
  const unknown = signals.filter((signal) => signal === "unknown").length;

  return {
    trueEndingRate,
    unfinishedRuns,
    bestScore,
    verdict:
      unknown === signals.length
        ? "unknown"
        : up > 0 && down === 0
          ? "improved"
          : down > 0 && up === 0
            ? "regressed"
            : up > 0 && down > 0
              ? "mixed"
              : "no change"
  };
}

export async function renderMetricsReport(path = defaultObservationPath): Promise<string> {
  const observations = await readCycleObservations(path);
  if (observations.length === 0) {
    return "No cycle observations recorded yet.";
  }

  const current = observations.at(-1)!;
  const previous = observations.at(-2);
  const diff = previous
    ? compareMetricSnapshots(previous.metrics, current.metrics)
    : current.comparedToPrevious;

  return `AI Loop Metrics

Observation file: ${path}
Cycles recorded: ${observations.length}
Latest cycle: ${current.cycle}
Latest commit: ${current.committedHash ?? current.gitCommit}
Agent command: ${current.agentCommand ?? "none"}
MCP route: ${current.mcpRoute.ok ? "PASS" : "FAIL"} at ${
    current.mcpRoute.finalScene ?? "unknown"
  }, score ${current.mcpRoute.score ?? "unknown"}

Compared to previous cycle:
  true ending rate: ${diff?.trueEndingRate ?? "unknown"} (${formatPercent(
    previous?.metrics.trueEndingRate
  )} -> ${formatPercent(current.metrics.trueEndingRate)})
  unfinished runs: ${diff?.unfinishedRuns ?? "unknown"} (${formatNumber(
    previous?.metrics.unfinishedRuns
  )} -> ${formatNumber(current.metrics.unfinishedRuns)})
  best score: ${diff?.bestScore ?? "unknown"} (${formatNumber(previous?.metrics.bestScore)} -> ${formatNumber(
    current.metrics.bestScore
  )})
  changed files: ${current.changedFiles.length > 0 ? current.changedFiles.join(", ") : "none"}
  verdict: ${diff?.verdict ?? "unknown"}`;
}

function compareHigherIsBetter(
  previous: number | undefined,
  current: number | undefined
): CycleMetricDiff["trueEndingRate"] {
  if (previous === undefined || current === undefined) return "unknown";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}

function compareLowerIsBetter(
  previous: number | undefined,
  current: number | undefined
): CycleMetricDiff["unfinishedRuns"] {
  if (previous === undefined || current === undefined) return "unknown";
  if (current < previous) return "up";
  if (current > previous) return "down";
  return "same";
}

function formatPercent(value: number | undefined): string {
  return value === undefined ? "unknown" : `${Math.round(value * 1000) / 10}%`;
}

function formatNumber(value: number | undefined): string {
  return value === undefined ? "unknown" : String(value);
}

if (process.argv[1]?.endsWith("ai-loop-observations.ts")) {
  console.log(await renderMetricsReport(process.argv[2] ?? defaultObservationPath));
}
