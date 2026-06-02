export const restartSensitivePaths = new Set([
  "package.json",
  "package-lock.json",
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

const idealEndingGroups = [
  {
    label: "Mara",
    families: [
      {
        label: "Core",
        endings: ["true_ending", "mara_handoff_true_ending"]
      }
    ]
  },
  {
    label: "Passengers",
    families: [
      {
        label: "Core",
        endings: [
          "passenger_true_ending",
          "passenger_helped_true_ending",
          "passenger_roll_call_true_ending",
          "passenger_lunch_tin_true_ending"
        ]
      },
      {
        label: "Manifest",
        endings: [
          "passenger_manifest_true_ending",
          "passenger_manifest_handoff_true_ending",
          "passenger_manifest_thumbprint_true_ending",
          "passenger_echoed_true_ending",
          "passenger_counted_true_ending",
          "passenger_reviewed_count_true_ending"
        ]
      },
      {
        label: "Roll call",
        endings: [
          "passenger_answered_true_ending",
          "passenger_answered_boarding_true_ending",
          "passenger_answered_handoff_true_ending",
          "passenger_conductor_true_ending",
          "passenger_conductor_transfer_true_ending"
        ]
      },
      {
        label: "Keepsakes",
        endings: [
          "passenger_keepsake_true_ending",
          "passenger_newspaper_true_ending",
          "passenger_mitten_true_ending"
        ]
      }
    ]
  }
];

const idealEndingIds = idealEndingGroups.flatMap((group) =>
  group.families.flatMap((family) => family.endings)
);

export function idealEndingRate(
  summary: { runs?: number; endings?: Record<string, number> } | undefined
): number {
  if (!summary?.runs) return 0;
  const idealEndings = idealEndingIds.reduce(
    (total, endingId) => total + Number(summary.endings?.[endingId] ?? 0),
    0
  );
  return idealEndings / summary.runs;
}

export function formatIdealEndingBreakdown(
  summary: { endings?: Record<string, number> } | undefined
): string {
  return idealEndingGroups
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

function countEndings(
  summary: { endings?: Record<string, number> } | undefined,
  endingIds: string[]
): number {
  return endingIds.reduce((sum, endingId) => sum + Number(summary?.endings?.[endingId] ?? 0), 0);
}
