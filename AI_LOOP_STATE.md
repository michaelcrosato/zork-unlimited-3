# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Keep the autonomous CYOA engine maintainable, secure, and playable while
preserving normal-play true-ending discoverability.

## Active Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Reduce late service-room wandering once players have assembled
  the map, signal token, platform fuse, and Mara's badge.
- Outcome: The service-room hub now hides the generic tunnel return after all
  four true-ending tools are collected, leaving Platform 13 as the clear forward
  route while preserving earlier tunnel recovery.
- Evidence:
  - Added a story-path regression test proving a fully equipped service-room
    state keeps `go_to_platform` available and removes `return_to_tunnel`.
  - `npm test -- tests/story-paths.test.ts` passes with 19 tests.
  - Validation passes: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: all scenes visited, 249/250 ended, `true_ending`
    reached 27 times, average score 47.14.
  - Coverage playtest, 170 runs: all scenes visited, 18 unfinished reporting
    samples remain, `true_ending` reached 20 times, average score 48.24.
  - `npm run health` passes with 27 tests and coverage playtest visiting all
    scenes.
  - Manual CLI route collected the map, token, fuse, and badge, confirmed the
    service room no longer offered `return_to_tunnel`, then reached
    `true_ending` at 90/100 while intentionally skipping the radio clue.
- Follow-up: The service-room route still offers optional radio/file inspection
  after the player is mechanically ready. Consider state-aware labels or scene
  variants that make those choices feel like deliberate lore/score pursuits
  rather than competing next-step commands.
- Risks:
  - Fully equipped players can no longer return to the clock from the service
    room, but they already have the token; future content that adds late tunnel
    interactions should relax or replace this requirement.

## Last Completed Cycle

- Date: 2026-06-01
- Change: After players force the rusted gate and choose to back away, the
  platform records that caution and no longer offers the same force-gate warning
  loop on later visits.
- Evidence:
  - Added a story-path regression test proving `force_gate` disappears after
    `back_away_from_gate`, while the warning still preserves the immediate
    `force_gate_anyway` bad-ending route.
  - `npm test -- tests/story-paths.test.ts` passed with 18 tests.
  - Validation passed: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: all scenes visited, unfinished dropped from 2 to
    1 in the deterministic sample, `bad_ending` dropped from 65 to 54,
    `true_ending` reached 32 times, average score rose to 47.88.
  - Coverage playtest, 170 runs: all scenes visited, 18 unfinished reporting
    samples remain, `true_ending` reached 20 times, average score 48.24.
  - `npm run health` passed with 26 tests and coverage playtest visiting all
    scenes.
  - Manual CLI route forced the gate, backed away, confirmed `force_gate` was
    removed from the next platform visit, then continued to `true_ending` at
    100/100.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Kept the maintenance locker open until players take both the platform
  fuse and Mara's badge, then return them to the service-room hub.
- Evidence:
  - Updated the locker regression test to prove `close_locker` is unavailable
    after taking only the fuse and available after both true-ending tools.
  - `npm test -- tests/story-paths.test.ts` passed with 17 tests.
  - Validation passed: 23 scenes, 5 endings, 23 reachable scenes.
  - `npm run health` passed with 25 tests and coverage playtest visiting all
    scenes; coverage still reported the known 18 unfinished runs.
  - Random playtest, 250 runs: all scenes visited, 2 unfinished,
    `true_ending` reached 31 times, average score 47.02.
  - Coverage playtest, 192 runs: all scenes visited, 18 unfinished,
    `true_ending` reached 20 times, average score 46.88.
  - Goal playtest, 10 runs: all 10 reached `true_ending` at 100/100.
  - Manual CLI route confirmed the locker choice list narrows to `take_badge`
    after `take_fuse`, then to `close_locker` after `take_badge`; a full route
    reached `true_ending` at 100/100.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Hid the HOME-sign trap from the train car once `freed_mara` is true,
  so players who found the token, lit Platform 13, used the signal booth, and
  cleared Mara now receive the emergency release as the decisive finale action.
- Evidence:
  - Updated the cleared-Mara train-car regression test to prove `look_at_sign`
    is absent after the ledger is cleared.
  - `npm test -- tests/story-paths.test.ts` passes with 17 tests.
  - Validation passes: 23 scenes, 5 endings, 23 reachable scenes.
  - `npm run health` passes with 25 tests and coverage playtest visiting all
    scenes; coverage still reports the known 18 unfinished runs.
  - Random playtest, 250 runs: all scenes visited, 1 unfinished,
    `true_ending` reached 19 times, average score 40.82.
  - Manual CLI route reached `train_car` after clearing Mara with only
    `pull_release` available, then reached `true_ending` at 100/100.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Hid the destructive `force_gate` choice whenever the player carries
  the fuse, preserving the bad ending for underprepared exploration while
  steering prepared players toward `install_fuse`.
- Evidence:
  - Added a story-path regression test proving `force_gate` is absent at the
    platform after the fuse is collected.
  - `npm test -- tests/story-paths.test.ts` passes with 15 tests.
  - Validation passes: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: `bad_ending` dropped to 78, `true_ending`
    reached 8 times, all scenes visited, 2 unfinished.
  - Coverage playtest, 288 runs: `bad_ending` dropped to 43, `true_ending`
    reached 14 times, average score rose to 50.02, all scenes visited, 18
    unfinished.
  - Manual MCP route verified the prepared platform choice list excludes
    `force_gate`, then recovered the token through the ledger warning and
    reached `true_ending` at 90/100 without the optional radio clue.

## Prior Completed Cycle

- Date: 2026-06-01
- Change: Routed `return_for_signal_token` from the ledger warning directly to
  the stopped clock instead of the broad tunnel hub, and set
  `knows_token_location` so the clock presents `take_token` as the only action.
- Evidence:
  - Added a story-path regression test for the directed ledger-warning recovery
    route.
  - `npm test -- tests/story-paths.test.ts` passed with 14 tests.
  - `npm run health` passed with 22 tests, validation, and coverage playtest.
  - Manual CLI route intentionally boarded before the signal booth, followed the
    new recovery choice to the clock, then reached `true_ending` at 100/100.
- Follow-up: The coverage strategy still reports 18 unfinished runs out of 288;
  the next pass should inspect whether those are harmless coverage-budget exits
  or remaining loops worth smoothing.

## Prior Completed Cycle

- Date: 2026-06-01
- Change: Made the true-ending release action discoverable after players clear
  Mara's ledger, even if they skipped the radio route note.
- Evidence:
  - `npm run health` passes with 20 tests.
  - Story validation passes: 23 scenes, 5 endings, 23 reachable scenes.
  - Coverage playtest visits all scenes and reaches `true_ending` 8 times,
    up from 4 in the prior evidence sample.
  - Random playtest, 250 runs: all scenes visited, `true_ending` reached 5
    times, best score 100/100.
  - MCP no-radio ledger route reaches `true_ending` after `mark_mara_clear`.
  - Current CLI no-radio ledger route shows only `Pull the emergency release in
the third car.` as the active objective in `train_car`, then reaches
    `true_ending`.
- Follow-up: True-ending discoverability is improved, but lesser endings still
  dominate random play. The next pass should reduce repetitive service-room and
  platform backtracking without deleting meaningful alternate endings.

## Prior Completed Cycle

- Date: 2026-06-01
- Change: Upgraded Vitest to remove the Vite/esbuild audit finding, optimized
  validation reference collection, updated docs and ignore rules, fixed the
  autonomous MCP true-ending route, and hid objectives after endings.
- Evidence:
  - `npm run health` passes with 19 tests.
  - `npm run ai:cycle` passes and performs MCP validation/play.
  - `npm audit --audit-level=moderate` reports 0 vulnerabilities.
  - CLI true-ending route reaches `true_ending` at 100/100 and ending
    observations now have no active objectives.
- MCP notes:
  - Required tools verified: `list_stories`, `validate_story`, `start_game`, `get_scene`, `choose_option`, `get_state`, `get_transcript`, `run_playtest`.
  - `src/ai-loop.ts` true-ending route now matches the current locker flow.
- Remaining weakness: Random play reaches `true_ending` more often than before
  but still rarely compared with `good_ending` and `bad_ending`.
- Next task: Improve midgame objective clarity after players learn Mara's release
  route so `pull_release` feels like the intended culmination, not an optional
  hidden action.
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
