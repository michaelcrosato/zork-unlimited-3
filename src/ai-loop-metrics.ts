import type { Story } from "./schema.js";

export const restartSensitivePaths = new Set([
  "package.json",
  "package-lock.json",
  "src/ai-loop-observations.ts",
  "src/ai-loop-metrics.ts",
  "src/ai-loop.ts"
]);
export const restartRequestedExitCode = 75;
export const exploratoryMaxSteps = 45;

export function requiresLoopRestart(changedPaths: string[]): boolean {
  return getRestartSensitiveChangedPaths(changedPaths).length > 0;
}

export function getRestartSensitiveChangedPaths(changedPaths: string[]): string[] {
  return changedPaths.filter((path) => restartSensitivePaths.has(path));
}

export function cycleSavePath(kind: "exploratory" | "mcp", cycle: number): string {
  return `saves/ai-loop-${kind}-cycle-${cycle}.json`;
}

export function parsePathLines(output: string): string[] {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parsePorcelainPaths(output: string): string[] {
  return output
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .flatMap((line) => {
      const path = line.slice(3);
      const renameSeparator = " -> ";
      if (path.includes(renameSeparator)) {
        const [from, to] = path.split(renameSeparator);
        return [from, to];
      }
      return [path];
    });
}

interface EndingFamily {
  label: string;
  endings: string[];
}

interface EndingGroup {
  label: string;
  families: EndingFamily[];
}

export function idealEndingRate(
  summary: { runs?: number; endings?: Record<string, number> } | undefined,
  story?: Story
): number {
  if (!summary?.runs) return 0;
  const idealEndings = getIdealEndingIds(summary, story).reduce(
    (total, endingId) => total + Number(summary.endings?.[endingId] ?? 0),
    0
  );
  return idealEndings / summary.runs;
}

export function formatIdealEndingBreakdown(
  summary: { endings?: Record<string, number> } | undefined,
  story?: Story
): string {
  return getIdealEndingGroups(summary, story)
    .map((group) => {
      const total = group.families.reduce(
        (sum, family) => sum + countEndings(summary, family.endings),
        0
      );
      const detail = group.families
        .map((family) => {
          const familyTotal = countEndings(summary, family.endings);
          const endingDetail = family.endings
            .map((endingId) => `${endingId}: ${Number(summary?.endings?.[endingId] ?? 0)}`)
            .join(", ");
          return `${family.label}: ${familyTotal} (${endingDetail})`;
        })
        .join(", ");
      return `${group.label}: ${total} (${detail})`;
    })
    .join("; ");
}

function getIdealEndingIds(
  summary: { endings?: Record<string, number> } | undefined,
  story?: Story
): string[] {
  if (story) {
    return Object.entries(story.scenes)
      .filter(([, scene]) => scene.endingType === "ideal")
      .map(([sceneId]) => sceneId);
  }
  return Object.keys(summary?.endings ?? {}).filter(
    (sceneId) => sceneId === "true_ending" || sceneId.endsWith("_true_ending")
  );
}

function getIdealEndingGroups(
  summary: { endings?: Record<string, number> } | undefined,
  story?: Story
): EndingGroup[] {
  const endings = getIdealEndingIds(summary, story);
  const groups = new Map<string, Map<string, string[]>>();

  for (const endingId of endings) {
    const scene = story?.scenes[endingId];
    const group = scene?.endingGroup ?? "Ideal";
    const family = scene?.endingFamily ?? "All";
    if (!groups.has(group)) groups.set(group, new Map());
    const families = groups.get(group)!;
    families.set(family, [...(families.get(family) ?? []), endingId]);
  }

  return [...groups.entries()].map(([label, families]) => ({
    label,
    families: [...families.entries()].map(([familyLabel, endingIds]) => ({
      label: familyLabel,
      endings: endingIds
    }))
  }));
}

function countEndings(
  summary: { endings?: Record<string, number> } | undefined,
  endingIds: string[]
): number {
  return endingIds.reduce((sum, endingId) => sum + Number(summary?.endings?.[endingId] ?? 0), 0);
}
