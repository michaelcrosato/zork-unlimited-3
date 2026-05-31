# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Make the CYOA engine and story capable of indefinite AI-assisted improvement
through repeatable planning, playtesting, validation, agent execution, and
commits.

## Last Completed Cycle

- Date: 2026-05-31
- Change: Improved token discoverability via personnel file, dispatcher warning, and platform description. Optimized objective text in `src/engine.ts`. Upgraded `src/ai-loop.ts` to perform dynamic story discovery (`list_stories`), strict validation check (`validate_story`), suspicious path sampling, repeatedly call `get_scene` for playthrough verification, and execute a cycle-adaptive exploratory route based on `seededRandom` choice history traversal. Added `.codex/config.toml` robust `cwd = "."` settings.
- Evidence:
  - Bounded smoke test successfully executed `CODEX_HOME="$PWD/.codex" AI_LOOP_MAX_CYCLES=1 ./loop.sh --once` completely green.
  - Prettier, lint, and all Vitest unit and CYOA validation and playtests passed flawlessly.
- MCP notes:
  - Required tools verified: `list_stories`, `validate_story`, `start_game`, `get_scene`, `choose_option`, `get_state`, `get_transcript`, `run_playtest`.
  - True-ending route reaches `true_ending` at 100/100.
  - Exploratory route dynamically explores non-happy paths (e.g. `bad_ending` at 5/100) adapting based on cycle seed and traversal history, avoiding stuck loops.
- Remaining weakness: random play reaches `true_ending` rarely but coverage play has 100% reachability.
- Next task: Expand narrative depth and add more horror/transit atmosphere while maintaining validation gates.
- Risks: Keep gameplay choices meaningful and avoid making the true ending trivial.

## Last Known Priorities

- Improve true-ending discoverability in normal play.
- Reduce unfinished random playtest runs.
- Keep MCP play as a required part of story/gameplay changes.

## Standard Cycle

1. Run `./loop.sh` for the full autonomous bash loop, or `./loop.sh --once` for one bounded pass.
2. Let the loop generate the newest report and prompt in `ai-runs/`.
3. If `AI_AGENT_CMD` is active, the loop passes that prompt to the coding agent on stdin.
4. Choose one small improvement from the evidence.
5. Implement and test it.
6. Run `npm run health`.
7. Actually play one route through MCP or CLI.
8. Let the outer loop rerun health, play through MCP, commit verified dirty changes, and push the branch to GitHub.

## Handoff Notes

- `npm run health` is the required pre-commit gate.
- `npm run ai:loop` repeats evidence-gathering and optional agent execution forever until interrupted.
- `AI_AGENT_CMD` controls which agent the loop invokes.
- `AI_LOOP_EVIDENCE_ONLY=1` disables agent execution while preserving reports and prompts.
- `AI_LOOP_AUTO_COMMIT=0` disables the outer commit step.
- `AI_LOOP_AUTO_PUSH=0` disables the outer push step.
- `AI_LOOP_ALLOW_DIRTY_BASELINE=1` allows auto-commit even when the worktree was dirty before the agent ran.
- `AI_CODEX_SANDBOX` controls the default Codex sandbox used by `loop.sh`; default is `workspace-write`.
- `CODEX_HOME=$PWD/.codex ./loop.sh` loads the repo-local Codex MCP configuration.
- This Codex CLI version does not expose a required-MCP-server option; keep
  explicit MCP verification in `src/ai-loop.ts`.
- Generated reports, saves, and transcripts are ignored by git.
