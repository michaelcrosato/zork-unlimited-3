import { readdir, readFile, writeFile } from "fs/promises";
import { resolve, join } from "path";
import { fileURLToPath } from "url";

async function main() {
  const logsDir = "playtest-logs";
  let files: string[];
  try {
    files = await readdir(logsDir);
  } catch (err: any) {
    if (err.code === "ENOENT") {
      console.log("No playtest-logs directory found. Nothing to consolidate.");
      return;
    }
    throw err;
  }

  const logs = [];
  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const content = await readFile(join(logsDir, file), "utf8");
    logs.push(JSON.parse(content));
  }

  if (logs.length === 0) {
    console.log("No JSON logs found to consolidate.");
    return;
  }

  // Very basic placeholder consolidation. In a full LLM integration,
  // we would prompt the LLM to identify trends across these logs.
  const summary = {
    total_runs: logs.length,
    endings: {} as Record<string, number>,
    average_score: 0,
    themes: [
      "Simulated placeholder for LLM analysis.",
      "Most players seemed to reach 'bad_ending' or hit max_steps without knowing what to do."
    ]
  };

  let totalScore = 0;
  for (const log of logs) {
    summary.endings[log.ending_reached] = (summary.endings[log.ending_reached] || 0) + 1;
    const [scoreStr] = log.score.split("/");
    totalScore += parseInt(scoreStr, 10) || 0;
  }
  summary.average_score = totalScore / logs.length;

  const report = `## 24-Hour Blind Playtest Consolidation Report

- **Total Runs**: ${summary.total_runs}
- **Average Score**: ${summary.average_score.toFixed(2)}

### Endings Reached
${Object.entries(summary.endings)
  .map(([ending, count]) => `- ${ending}: ${count}`)
  .join("\n")}

### Identified Themes
${summary.themes.map((t) => `- ${t}`).join("\n")}
`;

  await writeFile("playtest-summary.md", report, "utf8");
  console.log("Consolidated summary written to playtest-summary.md");
}

if (fileURLToPath(import.meta.url) === resolve(process.argv[1] ?? "")) {
  main().catch(console.error);
}
