# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Keep the autonomous CYOA engine maintainable, secure, and playable while
preserving normal-play true-ending discoverability.

## Active Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Focus fully prepared lit-platform players on the signal
  booth.
- Why this matters: Current route metrics are healthy, and the latest handoff
  identifies late lit-platform focus as the next pressure point. Once the
  player has the map, token, fuse, and badge, optional poster lore competes
  with the high-signal signal-booth action even though the posters primarily
  teach a badge clue the player has already solved.
- Tasks:
  - Hide the one-time poster inspection once the player is fully equipped for
    the signal booth.
  - Preserve the poster beat for earlier underprepared lit-platform states.
  - Add/update regression coverage for the fully equipped lit-platform choice
    set.
  - Run focused tests, full health, and an actual playthrough.
- Evidence:
  - Updated `inspect_mara_posters` so it remains available only while the
    player is missing at least one of the map, token, or badge.
  - Updated the fully prepared lit-platform regression to require
    `use_token_slot` as the only visible choice.
  - `npm test -- tests/story-paths.test.ts` passed with 40 tests.
  - `npm run health` passed with formatting, TypeScript, 56 tests, validation,
    and coverage playtest.
  - Manual CLI route reached the fully prepared `lit_platform` state with
    badge, fuse, lantern, map, and token; the only visible choice was
    `use_token_slot`.
  - Manual CLI route then continued through the signal booth, cleared Mara's
    ledger row, and reached `true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health,
    MCP tool verification, MCP validation, MCP random/coverage/goal playtests,
    and an actual MCP true-ending playthrough at 100/100.
  - Final evidence random playtest, 100 runs: all ended, all 31 scenes visited,
    `true_ending` reached 54 times, best score 100/100, average score 70.7.
  - Final MCP random playtest, 250 runs: all ended, all 31 scenes visited,
    `true_ending` reached 139 times, best score 100/100, average score 70.78.
  - A normal `npm run ai:cycle` attempt also ran its nested agent, but its
    post-agent automation refused to auto-commit because this worktree was
    already dirty before that nested agent started.
- Follow-up: The adaptive exploratory route still stops at `lit_platform` after
  collecting badge, fuse, map, and token. Since the only visible choice there
  is now `use_token_slot`, the next cycle should inspect whether the adaptive
  route/reporting needs one more continuation step or whether a small story
  payoff is now higher value.
- Risks:
  - Narrowing a lore choice can reduce incidental exposure to Mara's poster
    beat if players collect all tools before restoring the platform. The beat
    remains reachable in earlier lit-platform states and covered by regression
    tests.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Removed the fully equipped gate-control bounce before platform power
  restoration.
- Main objective: Remove the fully equipped gate-control bounce before platform
  power restoration.
- Why this matters: The latest handoff noted that the adaptive exploratory
  route advanced past the old map stall, inspected the gate control, then
  landed back in the service room while already carrying the badge, fuse, map,
  and token. Once the player has the fuse and the gate-control access plate is
  open, routing them back through the hub before installing it adds a low-value
  extra step on the main route.
- Evidence:
  - Added `install_fuse_from_gate_control`, available from `gate_control` when
    the player has the fuse, routing directly to `lit_platform` and setting
    `platform_lit`.
  - Kept `return_to_service_room_for_parts` available so underprepared players
    still have the existing recovery route.
  - Added a regression that reaches the gate control with map, token, fuse, and
    badge, verifies the direct install choice is first, and confirms it unlocks
    the lit-platform token-slot path.
  - `npm test -- tests/story-paths.test.ts` passed with 40 tests.
  - `npm run health` passed with formatting, TypeScript, 56 tests, validation,
    and coverage playtest.
  - Manual CLI route used `install_fuse_from_gate_control`, then continued
    through the signal booth, Mara intercom beat, and `pull_release` to
    `true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health,
    MCP tool verification, MCP validation, MCP random/coverage/goal playtests,
    and an actual MCP true-ending playthrough at 100/100.
  - Final evidence random playtest, 100 runs: all ended, all 31 scenes visited,
    `true_ending` reached 54 times, best score 100/100, average score 70.7.
  - Final MCP random playtest, 250 runs: all ended, all 31 scenes visited,
    `true_ending` reached 139 times, best score 100/100, average score 70.78.
  - The adaptive route now uses the direct gate-control install and stops later
    at `lit_platform` with badge, fuse, map, token, `knows_release`, and
    `platform_lit`.
- Follow-up: The next pressure point is late lit-platform focus after all true
  ending tools are gathered; consider making `use_token_slot` the only
  high-signal action once the player has map, token, fuse, badge, and release
  knowledge.
- Risks:
  - Adding a second fuse-install route touched the critical true-ending path and
    needed to stay scored identically to the existing platform install action.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added a stronger character payoff after clearing Mara's signal ledger
  entry.
- Main objective: Add a stronger character payoff after clearing Mara's signal
  ledger entry.
- Why this matters: Current route metrics are healthy and the latest guidance
  changes keep normal players moving toward the true ending. The highest-value
  next step is a small story-depth improvement on the core successful route so
  the ledger action feels like freeing a person, not just flipping a puzzle
  flag.
- Evidence:
  - Added `mara_released`, a required aftermath scene after Mara's ledger entry
    is cleared.
  - Routed `mark_mara_clear_from_ledger` to `mara_released`, then back to the
    existing third-car finale through `board_after_clearing_mara`.
  - Updated the autonomous MCP true-ending route so evidence generation follows
    the new transition.
  - Added regression coverage for the new aftermath beat and updated affected
    true-ending path tests.
  - `npm test -- tests/story-paths.test.ts` passed with 38 tests.
  - `npm test -- tests/ai-loop.test.ts` passed with 5 tests.
  - `npm run health` passed with formatting, TypeScript, 54 tests, validation,
    and coverage playtest.
  - Manual CLI route through `mara_released`, Mara's intercom beat, and
    `pull_release` reached `true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health,
    MCP tool verification, MCP validation, MCP random/coverage/goal playtests,
    and an actual MCP true-ending playthrough at 100/100.
  - Final evidence random playtest, 100 runs: all ended, all 31 scenes visited,
    `true_ending` reached 56 times, best score 100/100, average score 71.3.
  - Final evidence coverage playtest: all 31 scenes visited, 0 unfinished,
    best score 100/100.
- Follow-up: Watch whether adding a mandatory beat slightly lowers random
  max-score completion by increasing route length; if so, keep the beat but
  revisit playtest step limits or goal strategy.
- Risks:
  - A new required scene touches the critical true-ending route. Tests and
    playthrough must confirm the route remains direct, scored correctly, and
    reachable within existing playtest limits.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made Mara's explicit map request affect platform routing.
- Main objective: Make Mara's explicit map request affect platform routing.
- Why this matters: Current evidence showed players can promise Mara they will
  find the map, walk to Platform 13 without any useful tool, and then force the
  rusted gate into the bad ending. Follow-up evidence showed the same promise
  could still be bypassed by taking only the fuse and badge, restoring the
  platform, and fleeing without the map. After a promise, the hub should
  reinforce Mara's specific map request before Platform 13 travel.
- Evidence:
  - Added `notFlag: promised_mara` to the no-tool `go_to_platform` allowance.
  - Added the same promise-aware gating to the tunnel `follow_arrows` route so
    players cannot bypass the service-room guidance without the map.
  - Tightened the promise gate after evidence showed fuse-only platform travel
    could still lead to `escape_ending` without honoring Mara's map request.
  - Updated objective generation so `promised_mara` surfaces the marked-map
    objective even before Platform 13 has been discovered.
  - Added a regression proving Mara-promising players see `take_map` and
    `search_locker`, do not see `go_to_platform`, then regain `go_to_platform`
    after taking the map.
  - Added regressions proving Mara-promising players cannot reach Platform 13
    from either the service room or tunnel with only the fuse and badge, then
    regain those routes after taking the map.
  - `npm test -- tests/story-paths.test.ts` passed with 36 tests.
  - `npm run health` passed with formatting, TypeScript, 52 tests, validation,
    and coverage playtest.
  - Manual CLI route promised Mara, collected fuse and badge first, confirmed
    the tunnel offered only `open_service_door` and `inspect_clock` plus the
    marked-map objective, then recovered the map and reached `true_ending` at
    100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - Final evidence random playtest, 100 runs: all ended, all 30 scenes visited,
    `true_ending` reached 56 times, best score 100/100, average score 71.3.
  - Final MCP random playtest, 250 runs: all ended, all 30 scenes visited,
    `true_ending` reached 142 times, best score 100/100, average score 71.08.
- Follow-up: The adaptive exploratory route now stops in the service room with
  badge, fuse, and token but no map. Next cycle should improve the service-room
  prompt or choice ordering for that exact "map is the last missing promise"
  state without reopening platform travel before the map.
- Risks:
  - This slightly narrows one route after contacting Mara. The deliberate
    forced-gate bad ending remains reachable through early platform exploration
    before the player promises to find the map.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made the lit-platform escape branch feel more deliberate and
  recoverable.
- Main objective: Make the lit-platform escape branch feel more deliberate and
  recoverable.
- Why this matters: The adaptive exploratory route can do meaningful setup,
  restore Platform 13, then immediately run to `escape_ending`. That branch is
  useful, but a brief hesitation beat should clarify that leaving is a conscious
  abandonment of Mara's unresolved thread rather than the next normal objective.
- Evidence:
  - Selected the lit-platform escape branch based on the latest adaptive
    exploratory route reaching `escape_ending` immediately after platform power
    was restored.
  - Added `escape_warning`, reached from `flee_platform`, with choices to return
    to the lit platform or confirm the escape.
  - Updated path coverage for the escape branch and added a recovery regression.
  - `npm test -- tests/story-paths.test.ts` passed with 34 tests.
  - `npm run health` passed with formatting, TypeScript, 50 tests, validation,
    and coverage playtest.
  - Validation passed: 30 scenes, 5 endings, 30 reachable, no warnings.
  - Coverage playtest remained stable: 697 runs, 672 ended, 0 unfinished, 25
    frontier samples, all 30 scenes visited, and best score 100/100.
  - Manual MCP route triggered `escape_warning`, returned to the lit platform,
    recovered the map and token, cleared Mara, listened to the intercom beat,
    and reached `true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - MCP random playtest, 250 runs: all ended, all 30 scenes visited,
    `true_ending` reached 138 times, best score 100/100, average score 69.28.
- Follow-up: The adaptive exploratory route now highlights the remaining
  `bad_ending` pattern: players can promise Mara they will find the map, leave
  without it, and force the gate after one final warning.
- Risks:
  - Adding one confirmation scene increases branch count and could slightly
    reduce direct access to `escape_ending`; the ending remains available one
    choice later.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made late-game signal-booth entry clearer when players have the token
  but not the marked map.
- Main objective: Make late-game signal-booth entry clearer when players have
  the token but not the marked map.
- Why this matters: The true-ending chain depends on clearing Mara's ledger
  entry, but the opening notice also warns not to board the empty train without
  the map. Players can currently open the booth with the token while missing
  the map and only see the score/objective gap indirectly. A short warning at
  the gate control should make the missing navigation tool feel intentional and
  recoverable.
- Evidence:
  - Added `signal_map_warning`, reached when players try the signal token
    without the marked map.
  - Updated the prepared signal-booth choice label to say the map is ready.
  - Added regression coverage proving the warning appears, reinforces the map
    objective, and routes back to the service room for recovery.
  - `npm run health` passed with formatting, TypeScript, 49 tests, validation,
    and coverage playtest.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
- Follow-up: The adaptive exploratory route still reaches `bad_ending` after
  ignoring multiple warnings and forcing the gate without the fuse. Consider
  nudging early platform explorers toward the service room or gate-control
  inspection after Mara explicitly asks for the map.
- Risks:
  - Adding a warning scene increases scene count and one optional branch. The
    prepared route should remain direct, and unprepared players should still be
    able to continue into the booth if they choose.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made the deliberate forced-gate failure read as risky before players
  enter its confirmation scene.
- Main objective: Make the deliberate forced-gate failure read as risky before
  players enter its confirmation scene.
- Why this matters: The adaptive exploratory route can still reach the bad
  ending by forcing the gate. That branch is useful, but the first choice should
  clearly say the player is trying it without the missing fuse so the failure
  feels earned rather than like a neutral inspection option.
- Evidence:
  - Changed the `force_gate` label to "Force the rusted gate without the fuse"
    so players see the missing-tool risk before the warning scene.
  - Updated the forced-gate regression to assert the risk-forward label appears
    on Platform 13, then still verifies the one-last-chance warning and recovery
    choice.
  - `npm test -- tests/story-paths.test.ts` passed with 32 tests.
  - Manual CLI route exercised the new label, entered `gate_warning`, backed
    away for supplies, collected the map, radio route, fuse, badge, and token,
    cleared Mara, listened to her intercom beat, and reached `true_ending` at
    100/100.
  - `npm run health` passed with formatting, TypeScript, 48 tests, validation,
    and coverage playtest.
  - Coverage playtest remained stable: 695 runs, 672 ended, 0 unfinished, 23
    frontier samples, all 28 scenes visited, and best score 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - MCP random playtest, 250 runs: all ended, all 28 scenes visited,
    `true_ending` reached 132 times, best score 100/100, average score 67.84.
  - Adaptive exploratory MCP route still reached `bad_ending` after choosing
    the clearer forced-gate label and then ignoring the final warning.
- Follow-up: The bad ending remains reachable and fairer, but automated
  exploratory play still selects it. Consider nudging early platform explorers
  toward `inspect_gate_control` before force-gate temptation if human playtests
  continue to over-sample the bad branch.
- Risks:
  - This is a copy-level guidance change; it should improve fairness without
    reducing branch coverage or removing the deliberate bad ending.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Made the early true-ending clue chain more discoverable by letting
  careful players inspect the back of the old transit notice.
- Main objective: Make the early true-ending clue chain more discoverable by
  letting careful players inspect the back of the old transit notice.
- Why this matters: The story later says Mara's badge number matches a blank
  line on the notice, but players could not inspect that side themselves. Adding
  the clue makes the badge and ledger requirement feel earned earlier instead
  of appearing only once the locker or personnel file explains it.
- Evidence:
  - Added `notice_back`, reached from `notice` by `inspect_notice_back`.
  - Added `knows_badge_proof` so the objective list can ask players to find
    proof of Mara Vale's identity after they discover the notice-back clue.
  - Added a regression proving the scene appears, sets the clue flag, surfaces
    the proof objective, and still lets players take the lantern.
  - `npm run format:check` passed.
  - `npm test -- tests/story-paths.test.ts` passed with 32 tests.
  - Validation passed: 28 scenes, 5 endings, 28 reachable, no warnings.
  - `npm run health` passed with formatting, TypeScript, 48 tests, validation,
    and coverage playtest.
  - Coverage playtest remained stable: 695 runs, 672 ended, 0 unfinished, 23
    frontier samples, all 28 scenes visited, and best score 100/100.
  - Manual CLI route inspected `notice_back`, collected the token, map, fuse,
    and badge, listened to Mara's final intercom beat, and reached
    `true_ending` at 100/100 with `knows_badge_proof: true`.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - MCP random playtest, 250 runs: all ended, all 28 scenes visited,
    `true_ending` reached 132 times, best score 100/100, average score 67.84.
- Follow-up: The adaptive exploratory route still reaches the deliberate
  forced-gate bad ending after ignoring the final warning. Consider whether the
  first `force_gate` label should say "without supplies" so curious players
  better understand the risk before the confirmation scene.
- Risks:
  - The first notice now has one additional optional choice. It should improve
    clue agency without blocking the fast route through the underpass.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added a small late-game story beat after Mara is cleared so the
  true-ending route has more emotional texture before the final release.
- Main objective: Add a small late-game story beat after Mara is cleared so the
  true-ending route has more emotional texture before the final release.
- Outcome: Clearing Mara now exposes a one-time intercom scene in the train car.
  Players can hear Mara frame the release as freeing over-counted passengers,
  then return to the emergency release without losing progress or score.
- Evidence:
  - Added `mara_intercom`, a one-time optional scene gated by `freed_mara` and
    `heard_mara_goodbye`.
  - Added regression coverage proving the intercom scene appears after Mara is
    cleared, returns to the train car, disappears afterward, and still allows
    `true_ending`.
  - `npm test -- tests/story-paths.test.ts` passed with 31 tests.
  - Validation passed: 27 scenes, 5 endings, 27 reachable, no warnings.
  - CLI playthrough exercised the new beat and reached `true_ending` at
    100/100 with `heard_mara_goodbye: true`.
  - `npm run health` passed with formatting, TypeScript, 47 tests, validation,
    and coverage playtest.
  - Coverage playtest remained stable: 694 runs, 672 ended, 0 unfinished, 22
    frontier samples, all 27 scenes visited, and best score 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP
    tool verification, MCP validation, MCP random/coverage/goal playtests, and
    an actual MCP true-ending playthrough at 100/100.
  - MCP random playtest, 250 runs: all ended, all 27 scenes visited,
    `true_ending` reached 132 times, best score 100/100, average score 68.08.
- Follow-up: The goal-oriented MCP route optimizes directly to `pull_release`
  and skips optional `mara_intercom`; decide whether goal playtests should
  sample one-time flavor beats when they are safe and score-neutral.
- Risks:
  - This adds an optional final choice at a moment where some players may prefer
    a clean ending action. It is one-time and leaves `pull_release` immediately
    available.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Kept the late-game signal booth recoverable for unusual or imported
  states after the ledger has already been inspected.
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
