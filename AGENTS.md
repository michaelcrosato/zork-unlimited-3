# Agent Operating Contract

This repo is designed for autonomous AI development. Treat the game as playable software, not a static writing sample.

## Prime Directive

Continuously improve the game while keeping it playable. Every meaningful cycle must include:

1. Inspect current state.
2. Plan a small improvement.
3. Implement it.
4. Run health checks.
5. Actually play through the game via MCP or CLI.
6. Record feedback.
7. Commit and push a coherent milestone when green.

## Required Commands

Run before committing:

```bash
npm run health
```

Run one autonomous evidence-gathering cycle:

```bash
npm run ai:cycle
```

Run indefinitely until interrupted:

```bash
npm run ai:loop
```

The loop writes reports, prompts, and agent output logs to `ai-runs/`, which is
intentionally ignored. `./loop.sh` is the normal bash entry point. It auto-runs
`codex exec` when Codex is installed, or you can provide any compatible command.
The default Codex sandbox is `workspace-write`; use full access only in trusted
throwaway environments.

```bash
AI_AGENT_CMD='codex exec --cd "$PWD" --sandbox workspace-write -' ./loop.sh
AI_CODEX_SANDBOX=danger-full-access ./loop.sh
AI_AGENT_CMD='claude -p' ./loop.sh
AI_AGENT_CMD='gemini -p' ./loop.sh
./loop.sh --evidence-only
```

The agent command receives the cycle prompt on stdin. The prompt path and report
path are also available as `AI_PROMPT_FILE` and `AI_REPORT_FILE`.

After the agent returns, the outer loop is responsible for AFK completion:

1. Detect dirty files or unpushed commits.
2. Run `npm run health`.
3. Actually play the game through the MCP server.
4. Commit verified dirty changes.
5. Push the current branch to `origin`.
6. Restart itself when loop runtime files changed so the next cycle runs fresh
   code.

Set `AI_LOOP_AUTO_COMMIT=0` or `AI_LOOP_AUTO_PUSH=0` only when intentionally
dry-running the loop. Set `AI_LOOP_AUTO_RESTART=0` only when intentionally
debugging restart behavior. Start AFK runs from a clean worktree; the loop
refuses to auto-commit if files were already dirty before the agent started
unless `AI_LOOP_ALLOW_DIRTY_BASELINE=1` is explicitly set.

## MCP Play Requirement

When improving gameplay or story, do not rely only on automated playtest summaries. Start the MCP server and play at least one route as a real player:

```bash
npm run mcp
```

Use the tools:

- `start_game`
- `get_scene`
- `choose_option`
- `get_transcript`
- `run_playtest`

Write down what felt unclear, boring, unfair, or promising, then let that feedback steer the next change.

## Development Rules

- Keep story data in `stories/*.yaml`.
- Keep generated saves/transcripts out of commits.
- Prefer small, testable improvements over broad rewrites.
- Add or update tests when changing engine behavior, validation, playtest strategy, or critical story paths.
- If a playtest exposes a bug, write the failing behavior into a test when practical.
- Do not mark work done until `npm run health` passes.

## Current High-Value Improvement Areas

- Make `true_ending` more naturally discoverable during normal play.
- Reduce random unfinished playtest runs without removing meaningful backtracking.
- Improve transcript/report quality so AI agents can critique pacing more easily.
- Grow the story only when the validation and playtest tools can still explain coverage.

## Blind Playtesting

A parallel blind playtesting loop has been added. You can start it using:

```bash
./playtest_loop.sh
```

This runs `src/blind-playtester.ts` in the background, repeatedly blind-playing paths via MCP and dumping findings to `playtest-logs/`.
To aggregate these findings into a daily summary for review, run:

```bash
npx tsx src/consolidate-feedback.ts
```

This produces `playtest-summary.md` with high-level themes, acting as human-like QA feedback without slowing down your main development loop.
