# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Make the CYOA engine and story capable of indefinite AI-assisted improvement through repeatable planning, playtesting, validation, and commits.

## Last Known Priorities

- Improve true-ending discoverability in normal play.
- Reduce unfinished random playtest runs.
- Keep MCP play as a required part of story/gameplay changes.

## Standard Cycle

1. Run `npm run ai:cycle`.
2. Read the newest report in `ai-runs/`.
3. Choose one small improvement.
4. Implement and test it.
5. Run `npm run health`.
6. Play one route through MCP if the change affects player experience.
7. Commit and push.

## Handoff Notes

- `npm run health` is the required pre-commit gate.
- `npm run ai:loop` repeats evidence-gathering forever until interrupted.
- Generated reports, saves, and transcripts are ignored by git.
