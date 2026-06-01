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

## Cursor Cloud specific instructions

This repo is a **Node.js CLI + stdio MCP** project. There is no web dev server, database, or Docker stack.

### Runtime

- Use **Node.js 22+** and **npm** (`package-lock.json`; prefer `npm ci` when the lockfile is present).
- TypeScript runs via **tsx** (`node --import tsx`); there is no separate compile step for normal dev (`npm run build` / `lint` is `tsc --noEmit` only).

### Health gate and tests

- Pre-commit / CI gate: `npm run health` (Prettier check, typecheck, Vitest, story validate, 100-run coverage playtest on `stories/demo.yaml`). See `package.json` and `.github/workflows/ci.yml`.
- Unit tests only: `npm test`.

### Playing the game (CLI)

- Story file: `stories/demo.yaml`. Saves go under `saves/` (gitignored).
- Typical flow: `npm run cyoa -- start stories/demo.yaml --save saves/run.json`, then `scene` / `choose` / `transcript` with `--save saves/run.json`. Add `--json` for machine-readable output.
- The `ai-loop` and `npm run ai:cycle` spawn the MCP server themselves; you do not need a separate MCP daemon for those commands.

### MCP server

- Start with `npm run mcp` from the repo root (stdio transport only — **no TCP/HTTP port**).
- Clients attach via stdio (e.g. Cursor MCP config: `npm run mcp` with `cwd` set to the repo). Tools include `start_game`, `get_scene`, `choose_option`, `get_transcript`, `run_playtest`.
- Optional: `CODEX_HOME=$PWD/.codex` when using `./loop.sh` so Codex loads `.codex/config.toml`.

### Optional tooling

- `./loop.sh` / `npm run ai:loop` expect an external agent CLI (`codex`, `claude`, `gemini`) only when not using `--evidence-only`. Not required for `npm run health` or manual CYOA play.
