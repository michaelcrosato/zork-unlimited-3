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

The loop writes reports to `ai-runs/`, which is intentionally ignored.

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
