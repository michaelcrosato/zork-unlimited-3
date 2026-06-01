# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Keep the autonomous CYOA engine maintainable, secure, and playable while
preserving normal-play true-ending discoverability.

## Active Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Keep the late-game signal booth recoverable for unusual or
  imported states after the ledger has already been inspected.
- Outcome: Badge-less ledger states can now recover by returning to the service
  room, collecting Mara's badge, reopening the ledger row, and clearing her
  name without breaking the normal true-ending route.
- Evidence:
  - Added a regression covering a badge-less `signal_ledger` state: the player
    can return for Mara's badge, reopen the ledger row, clear Mara, and proceed
    to the emergency release.
  - `npm test -- tests/story-paths.test.ts` passed with 30 tests.
  - Validation passed: 26 scenes, 5 endings, 26 reachable, no warnings.
  - `npm run health` passed with formatting, TypeScript, 46 tests, validation,
    and coverage playtest.
  - Coverage playtest remained stable: 549 runs, 528 ended, 0 unfinished, 21
    frontier samples, all 26 scenes visited, and best score 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - MCP random playtest, 250 runs: all ended, all 26 scenes visited,
    `true_ending` reached 132 times, best score 100/100, average score 68.08.
- Follow-up: The adaptive exploratory route still intentionally reaches the
  forced-gate bad ending after ignoring the final warning; keep watching whether
  that branch feels fair or overrepresented in normal play.
- Risks:
  - This is a defensive recovery path; ordinary story constraints already steer
    most players into carrying the badge before they reach the signal booth.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Kept the post-poster lit-platform beat focused on helping Mara
  instead of offering an abrupt street escape after the player has just learned
  her ledger clue.
- Evidence:
  - Added regression coverage proving `flee_platform` is not offered after
    `inspect_mara_posters`, while the existing safety regression still proves
    the escape ending is available before the token is recovered.
  - `npm test -- tests/story-paths.test.ts` passed with 29 tests.
  - `npm run health` passed with formatting, TypeScript, 40 tests, validation,
    and coverage playtest.
  - Validation passed: 25 scenes, 5 endings, 25 reachable, no warnings.
  - Coverage playtest reported 548 runs, 528 ended, 0 unfinished, 20 frontier
    samples, all 25 scenes visited, `escape_ending` still reached 64 times, and
    best score 100/100.
  - Manual CLI route inspected Mara's posters, confirmed the lit platform
    offered only `return_from_lit_platform` afterward, then collected the map,
    radio clue, and token and reached `true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP playtests, and an actual MCP
    true-ending playthrough at 100/100.
- Follow-up: Watch whether escape-ending frequency remains healthy without
  distracting players who already saw the Mara proof-of-service clue.
- Risks:
  - This narrows one optional ending branch after the player reads an important
    true-ending clue; the earlier escape branch remains available.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Kept clue-informed players from walking straight into the
  unprepared Platform 13 gate trap after they already know Mara's route.
- Evidence:
  - Added regression coverage proving clue-informed service-room players who
    have read Mara's file and written down the radio route see `take_map` and
    `search_locker`, but not `go_to_platform`, until they collect the map.
  - Updated the existing underprepared-platform regression so it covers early
    exploration before Mara's route clues are known.
  - `npm test -- tests/story-paths.test.ts` passed with 29 tests.
  - `npm run health` passed with formatting, TypeScript, 40 tests, story
    validation, and coverage playtest.
  - Validation passed: 25 scenes, 5 endings, 25 reachable, no warnings.
  - Coverage playtest remained stable: 612 runs, 592 ended, 0 unfinished, 20
    frontier samples, all 25 scenes visited, best score 100/100.
  - Random playtest, 250 runs: all ended, all scenes visited, `true_ending`
    reached 121 times, `bad_ending` reached 43 times, best score 100/100,
    average score 65.86.
  - Manual CLI route confirmed the service room withheld `go_to_platform` after
    Mara's file and radio clue, then collected map/fuse/badge/token and reached
    `true_ending` at 100/100.
- Follow-up: Verify the early unprepared platform visit remains available before
  Mara's route clues are known, while the clue-informed service-room route
  points to preparation instead of the forced gate.
- Risks:
  - This narrows a route for players who learn the warnings first, but keeps the
    map-only branch, fuse path, and early platform exploration available.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Reduced empty mid-game platform loops after players discover Platform
  13 without supplies.
- Evidence:
  - Added regression coverage proving an unprepared platform return removes
    `go_to_platform`, keeps preparation choices available, and restores
    `go_to_platform` after taking the map.
  - `npm test -- tests/story-paths.test.ts` passed with 28 tests.
  - Validation passed: 25 scenes, 5 endings, 25 reachable, no warnings.
  - Random playtest, 250 runs: all ended, all scenes visited, `true_ending`
    reached 125 times, `bad_ending` dropped to 44, best score 100/100, average
    score 66.14.
  - `npm run health` passed with formatting, TypeScript, 39 tests, story
    validation, and coverage playtest.
  - Coverage playtest now reports 612 runs, 592 ended, 0 unfinished, 20 frontier
    samples, all 25 scenes visited, `true_ending` reached 144 times, and best
    score 100/100.
  - Manual CLI route intentionally visited Platform 13 unprepared, returned for
    supplies, then collected the map, radio route, fuse, badge, token, cleared
    Mara, and reached `true_ending` at 100/100.
- Follow-up: Watch coverage runtime because the new underprepared flag increases
  the number of distinct states the coverage strategy explores.
- Risks:
  - The loop-prevention flag deliberately focuses players who backed away from
    the empty platform. The map-only good/lost branch remains available after
    taking the map, and the fuse path remains available after taking the fuse.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made the early forced-gate bad-ending confirmation read as
  unmistakably final, without removing the alternate ending.
- Evidence:
  - Added regression coverage proving `gate_warning` keeps the recovery choice,
    includes the "one last chance" warning text, and labels the destructive
    confirmation as "Ignore the final warning and force the gate anyway".
  - `npm test -- tests/story-paths.test.ts` passed with 27 tests.
  - `npm run health` passed with 37 tests, validation clean, all 25 scenes
    reachable, and coverage playtest visiting every scene.
  - Manual CLI route forced the gate, backed away from the final warning,
    collected the map, radio route, fuse, badge, and token, restored the
    platform, cleared Mara, and reached `true_ending` at 100/100.
  - Evidence-only `npm run ai:cycle` passed health, MCP tool verification, MCP
    validation, MCP playtests, and an actual MCP true-ending playthrough at
    100/100.
  - Evidence cycle random playtest, 100 runs: 99 ended, all scenes visited,
    `true_ending` reached 49 times, `bad_ending` reached 17 times, best score
    100/100, average score 65.8.
  - Evidence cycle MCP random playtest, 250 runs: all ended, all scenes
    visited, `true_ending` reached 118 times, `bad_ending` reached 51 times,
    best score 100/100, average score 64.44.
  - Coverage playtest, 316 runs: all scenes visited, 296 ended, 20 unfinished
    frontier samples remain, `true_ending` reached 72 times, best score
    100/100, average score 53.61.
  - Adaptive exploratory MCP route still intentionally chose the final forced
    gate warning and reached `bad_ending`, confirming the alternate ending
    remains available.
- Follow-up: Inspect the remaining 20 coverage unfinished frontier samples and
  decide whether they are harmless budget exits or a remaining hub loop worth
  smoothing.
- Risks:
  - Content-only warning text cannot stop random strategies from choosing the
    bad ending; the goal is human-player clarity, not removing risk.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Stopped prepared players from boarding the unlit train when they
  already carry the platform fuse.
- Evidence:
  - Added regression coverage proving fuse carriers at the unlit platform see
    `install_fuse` and no longer see `board_train`.
  - Added regression coverage proving fully prepared players no longer see the
    stale "Use the marked map" objective at the unlit platform.
  - Added a safety regression proving map-only platform explorers can still
    board into the existing good/lost train branch.
  - `npm test -- tests/story-paths.test.ts` passes with 27 tests.
  - `npm run health` passes with 37 tests, validation clean, all 25 scenes
    reachable, and coverage playtest visiting every scene.
  - Random playtest, 250 runs: all scenes visited, 248 ended, `true_ending`
    reached 116 times, `lost_ending` dropped to 6, best score 100/100, average
    score 64.14.
  - Evidence-only `npm run ai:cycle` passed health, MCP tool verification, MCP
    validation, MCP playtests, and an actual MCP true-ending playthrough at
    100/100.
  - MCP random playtest, 250 runs: all ended, `true_ending` reached 118 times,
    `lost_ending` reached 6 times, best score 100/100, average score 64.44.
  - Coverage playtest, 316 runs: all scenes visited, 296 ended, 20 unfinished
    frontier samples remain, `true_ending` reached 72 times, best score 100/100,
    average score 53.61.
  - Manual CLI route confirmed a fully prepared unlit `platform` offers
    `inspect_gate_control`, `install_fuse`, and `return_to_service_room`, omits
    `board_train`, shows only the restore-power objective, then reaches
    `true_ending` at 100/100.
- Follow-up: The adaptive exploratory MCP route still takes an early bad ending
  by forcing the gate twice; inspect whether the second destructive confirmation
  should remain as-is or get stronger warning text.
- Risks:
  - This intentionally makes early train boarding less available after players
    find the fuse. The good and lost endings remain reachable through map-only
    boarding before the fuse is collected.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Reduced late-game distraction after players reach lit Platform 13 with
  the signal token and true-ending tools.
- Evidence:
  - Added regression coverage proving fully prepared `lit_platform` choice lists
    include `use_token_slot` and the one-time poster beat, but omit
    `return_from_lit_platform` and `flee_platform`.
  - Updated the token-carrier steering test to prove carrying the signal token
    removes the escape distraction.
  - Added a safety regression proving `flee_platform` still reaches
    `escape_ending` before the signal token is recovered.
  - `npm run health` passed with 34 tests, validation clean, all 25 scenes
    reachable, and coverage playtest visiting every scene.
  - Coverage playtest sample: 380 runs generated by coverage strategy, 360
    ended, 20 unfinished frontier samples, `true_ending` reached 72 times,
    best score 100/100, average score 53.
  - Random playtest, 250 runs: all scenes visited, 248 ended, `true_ending`
    reached 63 times, `escape_ending` dropped to 31, best score 100/100,
    average score 53.76.
  - Manual CLI route confirmed a fully prepared `lit_platform` offers only
    `use_token_slot` and `inspect_mara_posters`, then inspected the posters,
    cleared Mara's ledger, pulled the release, and reached `true_ending` at
    100/100.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Hid the generic tunnel return after players collect the map, signal
  token, platform fuse, and Mara's badge.
- Evidence:
  - Added a story-path regression test proving a fully equipped service-room
    state keeps `go_to_platform` available and removes `return_to_tunnel`.
  - `npm test -- tests/story-paths.test.ts` passed with 19 tests.
  - Validation passed: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: all scenes visited, 249/250 ended,
    `true_ending` reached 27 times, average score 47.14.
  - Coverage playtest, 170 runs: all scenes visited, 18 unfinished reporting
    samples remain, `true_ending` reached 20 times, average score 48.24.
  - `npm run health` passed with 27 tests and coverage playtest visiting all
    scenes.
  - Manual CLI route collected the map, token, fuse, and badge, confirmed the
    service room no longer offered `return_to_tunnel`, then reached
    `true_ending` at 90/100 while intentionally skipping the radio clue.

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
