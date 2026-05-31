# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Make the CYOA engine and story capable of indefinite AI-assisted improvement
through repeatable planning, playtesting, validation, agent execution, and
commits.

## Last Completed Cycle

- Date: 2026-05-31
- Change: Expanded `src/ai-loop.ts` evidence gathering so every cycle records
  MCP tool verification, MCP `validate_story`, MCP random/coverage/goal
  playtest summaries, the fixed true-ending MCP route, and an adaptive
  exploratory MCP route.
- Evidence:
  - `npm run health` passed before the change.
  - Project-scoped Codex config loads with `CODEX_HOME=$PWD/.codex codex mcp list --json`.
  - Installed Codex CLI supports `codex exec -`, `--cd`, `--sandbox`, and
    `--ask-for-approval never`.
  - Installed Codex CLI MCP help does not expose a required-server setting, so
    the MCP server cannot be marked required in `.codex/config.toml` with this
    version.
- MCP notes:
  - Required tools verified: `list_stories`, `validate_story`, `start_game`,
    `get_scene`, `choose_option`, `get_state`, `get_transcript`,
    `run_playtest`.
  - Extra tool available: `get_score`.
  - True-ending route reaches `true_ending` at 100/100.
  - Exploratory route through Mara's voice reaches `lit_platform` at 55/100 and
    stalls because the token was not recovered, confirming token signposting is
    still the main design weakness.
- Remaining weakness: random play reaches `true_ending` rarely and max score
  even less often.
- Next task: improve token/signaling affordances for players who learn Mara's
  route from the dark-tunnel/dispatcher path before finding the clock token.
- Risks: do not make the true ending trivial; keep failure endings meaningful.

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
