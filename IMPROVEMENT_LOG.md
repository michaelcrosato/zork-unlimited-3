# Improvement Log

Persistent self-feedback for the autonomous maintainer loop. Each entry records
what was tested, quantitative metrics, qualitative observations, and the next
highest-leverage improvement target.

## 2026-06-02 - Open-Ended Score Awards

### Current Plan

- Main objective: Replace fixed `100/100` scoring with open-ended point awards.
- Why this matters: Players should feel rewarded for useful progress,
  exploration, character beats, items, and optional content without seeing a
  fixed completion denominator.

### Work Completed

- Replaced fixed score achievements with earned score awards derived from
  inventory, flags, positive choice history, and scene exploration after the
  start.
- Removed live `maxScore` display and reporting from observations, transcripts,
  masked blind-play screens, playtest summaries, AI-loop reports, and docs.
- Added per-observation reward feedback: `delta`, `recentAwards`, and
  `soundCue: "score_award"`.
- Changed summary metrics to high-score evidence: `bestScore`,
  `averageScore`, and `bestScoreRuns`.

### Playtest Notes

- `npm run health` passed with 162 tests, clean validation, and full coverage
  playtest.
- `npm run ai:cycle` generated current evidence artifacts; no nested agent ran
  because `AI_AGENT_CMD` is unset.
- Manual true-ending route started at 0, reached `true_ending` at score 316,
  and produced reward cues for every constructive step tested.
- The final route felt better after adding small awards for keep, return,
  leave, and close choices; major beats remained meaningfully larger.

## 2026-06-02 - Core Player-View Metadata Contracts

### Current Plan

- Main objective: Move blind-playtest assumptions into engine/story contracts.
- Why this matters: Player visibility, objective hints, route priority, and
  ending classification were split across hardcoded helpers and sidecar lists.

### Work Completed

- Added `observePlayer()` for player-visible text, numbered choices, visible
  score, route importance, and optional objectives.
- Moved demo objective rules, route importance, and ending
  type/group/family metadata into `stories/demo.yaml`.
- Rewired scoring, playtest ranking, feedback consolidation, validation, and
  AI-loop metrics to consume story metadata.
- Updated docs and regression tests for the new contracts.

### Playtest Notes

- `npm run health` passed: formatting, TypeScript, 156 tests, clean story
  validation, and coverage playtest.
- `npm run ai:cycle` passed its evidence commands; MCP validation had no
  warnings, actual MCP play reached `true_ending` at 100/100, and the adaptive
  route reached `passenger_conductor_true_ending` at 100/100.
- `npm run playtest:session -- --persona goal_seeker --variant no_hints --max-turns 20 --no-write`
  exercised the player-view blind path without writing tracked feedback. The
  short smoke stopped at `service_room` at 65/100, which is acceptable for the
  20-turn cap.

## 2026-06-01 - Newspaper Route Label Clarity

### Current Plan

- Main objective: Make the newspaper passenger's help route more readable in
  normal play.
- Why this matters: The newspaper-specific intercom payoff was present, but the
  entry choice still sounded like generic crowd handling instead of using the
  remembered transfer column.
- Tasks:
  - Rename the newspaper-memory help choice to name the transfer-column tactic.
  - Add regression coverage for the specific label.
  - Verify the route through tests, health, and manual CLI play.
- Risks: Too much instruction in choice labels can feel mechanical, so keep the
  phrasing tied to a story object the player just discovered.

### Work Completed

- Changes made:
  - Renamed `help_passengers_after_newspaper_memory` to "Use the transfer
    column to gather passengers into the third car."
  - Added a story-path assertion for the new label.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - Clearer player-facing guidance into the newspaper-specific intercom payoff.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - Manual CLI route through `passenger_newspaper_memory`,
    `passenger_newspaper_intercom`, final roll call, and
    `passenger_helped_true_ending`
  - `npm run health`
- What worked:
  - Focused story-path tests passed with 88 tests.
  - Manual CLI play showed the new label before selection and reached
    `passenger_helped_true_ending` at 100/100.
  - Full health passed with formatting, TypeScript, 109 tests, validation, and
    coverage playtest.
  - Coverage playtest visited all 70 scenes, including
    `passenger_newspaper_intercom`.
- What felt bad/confusing:
  - No new player-facing confusion surfaced. The final roll-call choice still
    read clearly after the newspaper intercom.
- Bugs found:
  - None in the game. The manual script initially used the wrong final-roll-call
    choice id, and the displayed choice corrected the route.

### Next Iteration

- Highest-priority next task: Watch whether normal random samples still miss
  `passenger_newspaper_intercom`; if so, consider a small route-shape change
  rather than more label text.

## 2026-06-01 - Mara Handoff Ending

### Current Plan

- Main objective: Add a distinct payoff ending for the optional Mara handoff
  route without weakening normal completion.
- Why this matters: Core route metrics are healthy, so the best next
  improvement is richer character payoff. Players could already watch Mara
  step away from the booth, but the final ending did not acknowledge that
  choice.
- Tasks:
  - Route the handoff intercom release to a new ending.
  - Count the new ending as an ideal max-score completion.
  - Cover the new route with regression tests.
- Risks: Adding another ending label can skew ideal-ending reporting unless
  score, playtest strategy, and AI-loop summaries all recognize it.

### Work Completed

- Changes made:
  - Added `mara_handoff_true_ending`.
  - Routed `pull_release_after_handoff_goodbye` to the new ending.
  - Updated score, playtest destination scoring, and AI-loop ideal-ending
    reporting.
  - Added and updated story-path, playtest, and AI-loop tests.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/score.ts`
  - `src/playtest.ts`
  - `src/ai-loop.ts`
  - `tests/story-paths.test.ts`
  - `tests/playtest.test.ts`
  - `tests/ai-loop.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - A handoff-specific true ending where Mara physically holds the far doors
    open after leaving the booth.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts tests/playtest.test.ts
tests/ai-loop.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy random
--summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy coverage
--summary --json`
  - `npm run health`
  - Manual CLI route through Mara's handoff, final intercom, and
    `mara_handoff_true_ending`
- What worked:
  - Focused tests passed with 90 tests.
  - Full health passed with formatting, TypeScript, 98 tests, validation, and
    coverage playtest.
  - Validation reports 57 scenes, 8 endings, and all 57 reachable.
  - Random playtest ended 100/100 runs, visited all scenes, reached the new
    ending 7 times, and preserved 72 max-score runs.
  - Coverage playtest visited all scenes with best score 100/100, average score
    98.09, and 74664 max-score runs.
  - Manual CLI play reached `mara_handoff_true_ending` at 100/100 with no
    lingering objectives.
- What felt bad/confusing:
  - No new confusion surfaced. The handoff payoff is clearer, while the direct
    `true_ending` route remains available for players who skip the intercom.
- Bugs found:
  - Existing tests and ideal-ending helpers initially assumed the handoff
    intercom still ended at `true_ending`; those assumptions were updated.

### Next Iteration

- Highest-priority next task: Watch whether the increasing number of ideal
  ending labels makes reports harder to scan.
- Reason: The route quality improved, but summary readability can degrade as
  ending variants accumulate.
- Planned action:
  - Consider grouping ideal endings in reports while preserving individual
    ending counts.

## 2026-06-01 - Stairwell Clock Recovery

### Current Plan

- Main objective: Smooth the stairwell escape-warning recovery route.
- Why this matters: The adaptive exploratory route showed a player wavering at
  the stairs after powering the platform without the signal token. Mara's clue
  named the stopped clock, but the recovery path returned to the lit platform
  and made the player navigate extra hubs before acting on that clue.
- Tasks:
  - Route Mara's stairwell-call recovery directly to the stopped clock.
  - Keep the escape ending available after the player hears her warning.
  - Cover the revised branch with focused story-path tests.
- Risks: Direct clock routing abstracts travel back through the tunnel; focused
  playtesting needs to confirm the transition remains readable.

### Work Completed

- Changes made:
  - Changed `return_from_stairwell_call` to land on `clock`.
  - Added `leave_after_stairwell_call` as an immediate escape option from
    Mara's stairwell warning.
  - Updated story-path regression coverage for both token recovery and escape.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - A cleaner late-escape recovery branch that turns Mara's clock clue into
    immediate playable progress.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run health`
  - Manual CLI route through `mara_stairwell_call`, direct clock recovery,
    `signal_map_warning`, and `true_ending`
- What worked:
  - Focused story-path tests passed with 67 tests.
  - Full health passed with format check, TypeScript, 88 tests, validation, and
    coverage playtest.
  - Validation reports 50 scenes, 7 endings, and all 50 reachable.
  - Coverage playtest reports 0 unfinished completed routes, all scenes visited,
    best score 100/100, average score 91.91, and 15372 max-score runs.
  - The manual route reached `true_ending` at 100/100 after returning directly
    from Mara's warning to the clock.
- What felt bad/confusing:
  - No new confusion surfaced. The branch now has less backtracking while still
    preserving the decision to leave.
- Bugs found:
  - No gameplay bug found.

### Next Iteration

- Highest-priority next task: Watch whether random routes still spend too much
  time in late-game hub loops.
- Reason: The direct clock recovery removes one known detour, but random-route
  samples can reveal remaining repeated platform/service-room churn.
- Planned action:
  - Compare future suspicious path samples for repeated `lit_platform` and
    `service_room` returns before adding more story content.

## 2026-06-01 - Manifest Ledger Return

### Current Plan

- Main objective: Smooth the optional passenger-manifest branch so it returns
  directly to Mara's ledger row.
- Why this matters: The adaptive exploratory route stopped at
  `passenger_manifest` with a valid progress choice still available. The
  manifest branch should carry players into final ledger resolution instead of
  routing them back through the signal-booth hub.
- Tasks:
  - Offer the passenger-echo beat directly from `passenger_manifest`.
  - Return from the manifest and passenger echoes to `signal_ledger`.
  - Preserve mapless recovery and manifest true-ending coverage.
- Risks: Moving late-game returns out of `signal_booth` could make optional
  passenger echoes or mapless recovery unreachable if the tests miss a branch.

### Work Completed

- Changes made:
  - Added `listen_to_manifest_doors_from_manifest` to `passenger_manifest`.
  - Changed manifest and passenger-echo returns to land on `signal_ledger` and
    set `inspected_signal_ledger`.
  - Updated story-path regressions for direct manifest resolution, mapless
    recovery, objective text, and the passenger true-ending branch.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - A smoother late-game manifest route with one fewer hub bounce.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - Manual CLI route through `passenger_manifest`,
    `listen_to_manifest_doors_from_manifest`, and `passenger_true_ending`
- What worked:
  - Focused story-path tests passed with 48 tests.
  - Full health passed with 68 tests, validation, and coverage playtest.
  - Validation reports 38 scenes, 6 endings, and all 38 reachable.
  - Coverage playtest reports 0 unfinished runs, all scenes visited, best score
    100/100, average score 82.25, and 960 max-score runs.
  - The manual route reached `passenger_true_ending` at 100/100 after returning
    from the passenger echoes directly to Mara's ledger row.
  - Evidence-only `npm run ai:cycle` passed health, MCP verification, MCP
    validation, MCP random/coverage/goal playtests, and an actual MCP
    true-ending route at 100/100.
  - The adaptive exploratory route no longer stops at `passenger_manifest`; it
    now stops at `signal_booth` with the ledger and manifest choices visible.
- What felt bad/confusing:
  - The revised route reads more cleanly; the signal-booth menu no longer
    interrupts the manifest-to-ledger payoff.
- Bugs found:
  - No gameplay bug found.

### Next Iteration

- Highest-priority next task: Inspect whether the adaptive `signal_booth` stop
  reflects route-depth limits or a remaining choice-prioritization issue.
- Reason: The manifest branch now continues cleanly, and the next incomplete
  route has a compact final-state audit with visible legal progress choices.
- Planned action:
  - Compare adaptive route depth against the signal-booth choice ordering before
    making another story-routing change.

## 2026-06-01 - Transcript Final-State Audit

### Current Plan

- Main objective: Improve transcript/report clarity for stalled or exploratory
  routes.
- Why this matters: Current route metrics are healthy. When adaptive play stops
  before an ending, the transcript should expose the current objective and legal
  choices so future cycles can tell whether the route is actually blocked or
  simply unfinished.
- Tasks:
  - Add a compact final-state audit to transcript output.
  - Cover both an in-progress signal-booth route and a completed true-ending
    route.
  - Run full health and manually inspect generated CLI transcripts.
- Risks: Longer transcripts could bury useful information in report tails, so
  the audit needs to remain compact and placed at the end.

### Work Completed

- Changes made:
  - `renderTranscript` now appends final scene status, score, objectives,
    available choices, inventory, and flags.
  - Added transcript tests for a stalled `signal_booth` route and a completed
    `true_ending` route.
- Files/systems touched:
  - `src/transcript.ts`
  - `tests/transcript.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - Transcript final-state audit for MCP and CLI review workflows.

### Playtest Notes

- What was tested:
  - `npm test -- tests/transcript.test.ts`
  - `npm run health`
  - CLI route to `signal_booth` followed by transcript inspection
  - CLI route to `true_ending` followed by transcript inspection
- What worked:
  - Focused transcript tests passed with 2 tests.
  - Full health passed with 65 tests, validation, and coverage playtest.
  - Validation reports 36 scenes, 6 endings, and all 36 reachable.
  - Coverage playtest reports 0 unfinished runs, all scenes visited, and best
    score 100/100.
  - The signal-booth transcript ends with the active ledger objective and the
    two legal progress/lore choices.
  - The true-ending transcript ends with `Score: 100/100`, no objectives, and
    no available choices.
- What felt bad/confusing:
  - The signal-booth stall is now readable as an unfinished exploratory route,
    not a broken or hidden-progression state.
- Bugs found:
  - No gameplay bug found.

### Next Iteration

- Highest-priority next task: Use the clearer transcript tail in the next
  adaptive-route report before deciding whether to tune exploratory depth.
- Reason: Evidence quality is now better; the next cycle can make a more
  grounded call between route tuning and another story-depth improvement.
- Planned action:
  - Run the normal AI evidence cycle and inspect whether adaptive stops still
    lack actionable choices after the transcript audit.

## 2026-06-01 - Signal-Booth Manifest Beat

### Current Plan

- Main objective: Add an optional kept-passenger manifest scene in the signal
  booth.
- Why this matters: The latest evidence showed healthy route metrics and no
  unvisited scenes, so the best next improvement is richer story payoff on the
  successful path. The signal booth names Mara's ledger row, but it does not
  linger on the many people the true ending will release.
- Tasks:
  - Add a one-time optional manifest scene from `signal_booth`.
  - Keep the direct Mara-ledger action first.
  - Add regression coverage for the optional detour and true-ending recovery.
  - Run health and an actual route through the new scene.
- Risks: An extra choice in a critical late-game scene could lower random
  true-ending rate or distract automated players if the direct ledger path is
  not still clearly prioritized.

### Work Completed

- Changes made:
  - Added `passenger_manifest`, an optional lore scene that shows ordinary
    kept-passenger details and points back to Mara's still-shut door.
  - Added `read_passenger_manifest` from `signal_booth`, gated by a one-time
    flag.
  - Added `return_to_signal_ledger_from_manifest` so the detour returns to the
    existing signal-booth flow.
  - Added a regression proving the detour returns, disappears after reading,
    and still reaches `true_ending` at max score.
  - Updated the existing badge-proof test so the new optional signal-booth beat
    does not invalidate the direct ledger path.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - New optional late-game lore scene: `passenger_manifest`.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - Manual CLI route through `passenger_manifest`
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle`
- What worked:
  - Focused story-path tests pass with 41 tests.
  - Full health passes with formatting, TypeScript, 57 tests, validation, and
    coverage playtest.
  - Validation now reports 32 scenes, 5 endings, all 32 reachable.
  - Coverage playtest visits `passenger_manifest`, has 0 unfinished runs, and
    keeps best score at 100/100.
  - The direct `inspect_signal_ledger` action remains first in the signal booth.
  - The optional manifest sets `read_passenger_manifest`, returns to
    `signal_booth`, and does not reappear.
  - Manual CLI play through the manifest route reached `true_ending` at 100/100.
  - Evidence-only cycle passed health, MCP validation, MCP random/coverage/goal
    playtests, and an actual MCP true-ending playthrough at 100/100.
  - Random metrics stayed stable: 100/100 random runs ended, all 32 scenes were
    visited, `true_ending` reached 54 times, and average score remained 70.7.
- What felt bad/confusing:
  - The adaptive exploratory route still stops at fully prepared `lit_platform`
    with map, token, fuse, and badge. The choice list is already focused there,
    so this looks more like route-depth/continuation pressure than a content
    signposting bug.
- Bugs found:
  - One older test assumed `signal_booth` had exactly one choice. The assertion
    was too narrow for optional late-game story content and now checks that the
    ledger path remains first.

### Next Iteration

- Highest-priority next task: Decide whether to tune adaptive route continuation
  or add another focused story payoff.
- Reason: The change touches a late critical-path scene and must stay clear in
  direct play while preserving route metrics.
- Planned action:
  - Inspect whether the adaptive route needs a deeper step budget/continuation
    once it reaches a one-choice late-game state, or add another small story
    payoff that preserves focused route choices.

## 2026-06-01 - Last-Missing-Map Focus

### Current Plan

- Main objective: Remove the late-game service-room bounce when the marked map
  is the last missing preparation item.
- Why this matters: The adaptive exploratory route had already collected Mara's
  badge, the platform fuse, and the signal token, but kept returning to the
  tunnel instead of taking the map. That made the next objective technically
  visible but mechanically easy to ignore.
- Tasks:
  - Hide `return_to_tunnel` once the map is the only missing preparation item.
  - Preserve tunnel return while the token, fuse, or badge can still be found.
  - Add regression coverage for the adaptive stall state.
  - Run health and a real CLI route through the changed moment.
- Risks: Removing a backtrack could accidentally block token recovery if the
  condition is too broad.

### Work Completed

- Changes made:
  - `return_to_tunnel` now depends on missing token, fuse, or badge, not merely
    missing map.
  - Added regression coverage for the exact state with `promised_mara`,
    `knows_release`, `read_mara_file`, badge, fuse, and token.
  - Strengthened the existing missing-map test to ensure the stale tunnel
    return is absent.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scene; this is a route-focus polish pass for the service-room hub.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle`
  - Manual CLI route through the former adaptive stall and on to `true_ending`
- What worked:
  - Story-path tests pass with 39 tests.
  - Full health passes with formatting, TypeScript, 55 tests, validation, and
    coverage playtest.
  - Coverage playtest remains stable: 698 runs, 672 ended, 0 unfinished, all 31
    scenes visited, best score 100/100.
  - At the former stall, the service room now offered exactly `take_map`.
  - Continuing from that state reached `true_ending` at 100/100 after the Mara
    intercom beat.
  - Evidence-only cycle passed health, MCP validation, MCP
    random/coverage/goal playtests, and an actual MCP true-ending playthrough
    at 100/100.
  - The adaptive route now takes the map and reaches the gate-control clue
    before stopping back in the service room with all four tools.
- What felt bad/confusing:
  - The service-room prose is still generic when only the map is missing. The
    choice list is now clear, but a future content pass could add state-aware
    hub text if the engine gains support for it.
- Bugs found:
  - No new bug found. The old loop was a stale recovery option rather than a
    broken transition.

### Next Iteration

- Highest-priority next task: Smooth the fully equipped service-room handoff
  after the gate-control clue if repeated evidence keeps stopping there.
- Reason: The map stall is gone, but the adaptive route now pauses one step
  later with every required tool and `go_to_platform` as the obvious next move.
- Planned action:
  - Inspect the exact choice list in that state, then decide whether stronger
    choice text or adaptive playtest tuning is the right fix.

## 2026-06-01 - Long-Run Loop Hardening

### Current Plan

- Main objective: Keep the autonomous loop alive and useful during long AFK
  runs.
- Why this matters: The captured loop output showed that a stale MCP
  true-ending route could throw before the agent received a repair prompt. A
  two-week run needs both uptime recovery and enough report context to avoid
  repetitive low-impact changes.
- Tasks:
  - Preserve pre-agent evidence failures as actionable reports/prompts.
  - Retry unexpected `npm run ai:loop` exits from `loop.sh`.
  - Add long-run effectiveness signals to each cycle report.
  - Verify with health, evidence-only AI cycle, and a player-style route.
- Risks: Retrying should keep failures visible in `ai-runs/` instead of hiding
  persistent bugs.

### Work Completed

- Changes made:
  - `src/ai-loop.ts` now reports MCP/playthrough failures in the generated
    cycle instead of throwing before the agent prompt is written.
  - `loop.sh` retries unexpected loop exits with `AI_LOOP_RETRY_DELAY_MS` and
    supports `AI_LOOP_EXIT_ON_ERROR=1` for debugging.
  - Cycle reports now include true-ending rate, non-ideal ending pressure,
    max-score rate, coverage completeness, adaptive route status, and a primary
    long-run pressure recommendation.
  - Root `OUTPUTLOG.md` is ignored so pasted terminal transcripts do not create
    a dirty AFK baseline.
- Files/systems touched:
  - `src/ai-loop.ts`
  - `loop.sh`
  - `README.md`
  - `.gitignore`
  - `AI_LOOP_STATE.md`
- New content/features added:
  - Long-run effectiveness reporting for autonomous prioritization.

### Playtest Notes

- What was tested:
  - `npm run health`
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle`
  - Manual CLI true-ending route
- What worked:
  - Health passes with formatting, TypeScript, 53 tests, validation, and
    coverage playtest.
  - The latest evidence-only cycle wrote a report with the new effectiveness
    section and reached `true_ending` through the actual MCP playthrough.
  - Manual CLI play reached `true_ending` at 100/100.
- What felt bad/confusing:
  - The adaptive route can still stall at the service room after repeated hub
    returns, so future content work should focus on pacing and richer progress
    once core reachability remains healthy.
- Bugs found:
  - The original loop could terminate before giving the agent a fix prompt when
    pre-agent MCP evidence failed.

### Next Iteration

- Highest-priority next task: Use the new long-run pressure signal to choose
  larger design gains when route metrics are saturated.
- Reason: Current true-ending and coverage metrics are healthy enough that the
  game now benefits more from depth and pacing than from another clue-only pass.
- Planned action:
  - Add a new meaningful late-game beat or system only after preserving health,
    MCP play, and coverage explainability.

## 2026-06-01 - Promise-Aware Platform Routing

### Current Plan

- Main objective: Make Mara's explicit map request affect platform routing.
- Why this matters: The latest evidence showed players can promise Mara they
  will find the map, leave the service room without any useful platform tool,
  and force the rusted gate into the bad ending. Follow-up evidence showed a
  fuse-only platform route could still abandon the map promise through the
  escape ending. After the promise, the hub should make Mara's map request feel
  like the immediate commitment.
- Tasks:
  - Hide Platform 13 travel after `promise_to_help` until the map is recovered.
  - Preserve early no-tool platform exploration before Mara is contacted.
  - Add promise-specific regression coverage.
  - Run health and an actual route through the changed moment.
- Risks: This narrows one post-Mara route, so the forced-gate bad ending must
  remain reachable through early platform exploration.

### Work Completed

- Changes made:
  - Added `notFlag: promised_mara` to the no-tool `go_to_platform` allowance.
  - Added matching promise-aware gating to the tunnel `follow_arrows` route so
    players cannot bypass the service-room guidance without the map.
  - Tightened the promise gate after evidence showed a fuse-only route could
    still restore the platform and flee without the map.
  - Updated objective generation so Mara's promise surfaces the marked-map
    objective before Platform 13 is discovered.
  - Added a regression proving Mara-promising players stay in the service room
    until they recover the marked map.
  - Added a regression proving the tunnel arrows stay unavailable after the
    promise until the player recovers the marked map.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/engine.ts`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scene; this is a route-steering improvement that makes an existing
    character promise mechanically visible.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - Manual CLI route through the changed promise branch
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle`
- What worked:
  - Story-path tests pass with 36 tests.
  - Full health passes with formatting, TypeScript, 52 tests, validation, and
    coverage playtest.
  - Validation remains clean: 30 scenes, 5 endings, 30 reachable.
  - Coverage remains stable: 697 runs, 672 ended, 0 unfinished, 25 frontier
    samples, all scenes visited, best score 100/100.
  - Manual CLI play confirmed that after promising Mara and collecting only the
    fuse and badge, the tunnel offers `open_service_door` and `inspect_clock`,
    with no `follow_arrows`, and the objective list explicitly asks for the
    marked map.
  - Continuing that route after taking the map reached `true_ending` at
    100/100.
  - Evidence cycle passed health, MCP tool verification, MCP validation, MCP
    random/coverage/goal playtests, and an actual MCP true-ending playthrough
    at 100/100.
  - Final MCP random playtest ended all 250 runs, visited all scenes, reached
    `true_ending` 142 times, and kept best score at 100/100.
- What felt bad/confusing:
  - The adaptive exploratory route now stops in the service room with badge,
    fuse, and token but no map. The route is no longer falling into a bad or
    escape ending, but the next pass should make the map-last state feel more
    directed.
- Bugs found:
  - Initial promise gating only covered `go_to_platform`; evidence showed the
    player could bypass it via `return_to_tunnel` and `follow_arrows`, then via
    a fuse-only platform route. Both gaps are now covered by tests.

### Next Iteration

- Highest-priority next task: Improve the service-room handoff when the marked
  map is the last missing promise item.
- Reason: The adaptive route now correctly avoids premature Platform 13 travel,
  but it can idle between the service room and tunnel instead of taking the map.
- Planned action:
  - Consider a map-specific choice label or ordering rule for
    `promised_mara && !map` states, then verify it does not reduce ending
    reachability.

## 2026-06-01 - Post-Poster Route Focus

### Current Plan

- Main objective: Keep the post-poster lit-platform beat focused on helping
  Mara instead of offering an abrupt street escape after the player has just
  learned her ledger clue.
- Why this matters: The latest exploratory route reached `escape_ending` after
  finding the fuse, badge, radio clue, file clue, and poster clue. The escape is
  a useful alternate ending early, but after the proof-of-service clue it reads
  like a distracting quit option rather than a meaningful branch.
- Tasks:
  - Hide `flee_platform` after `inspect_mara_posters`.
  - Preserve the earlier escape ending before the token is recovered.
  - Add or update regression coverage for the focused post-poster choice list.
  - Run health, `ai:cycle`, and a manual route through the changed moment.
- Risks: Removing the duplicate late escape branch could make `escape_ending`
  too rare if no earlier lit-platform escape remains reachable.

### Work Completed

- Changes made:
  - Added `notFlag: inspected_mara_posters` to the `flee_platform` requirements.
  - Extended the poster-beat regression to prove the lit platform no longer
    offers `flee_platform` after the player reads the posters.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scene; this is route focus for an existing story beat.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle`
  - Manual CLI route that inspected posters, returned for missing tools, and
    reached the true ending
- What worked:
  - Story-path tests pass with 29 tests.
  - Full health passes with 40 tests, clean validation, and all 25 scenes
    reachable.
  - Coverage playtest reports 548 runs, 528 ended, 0 unfinished, 20 frontier
    samples, all scenes visited, `escape_ending` still reachable 64 times, and
    best score 100/100.
  - Evidence cycle MCP random playtest ended all 250 runs, visited every scene,
    reached `true_ending` 132 times, and still reached `escape_ending` 25 times.
  - Manual CLI play confirmed the changed lit-platform menu offered only
    `return_from_lit_platform` after the posters, then reached `true_ending` at
    100/100 after collecting the map, route clue, and token.
- What felt bad/confusing:
  - The post-poster return is now clear, but the label still says "before
    boarding" even when the immediate task is to find the token. A future pass
    could make that return label more context-specific if the rules support it.
- Bugs found:
  - None.

### Next Iteration

- Highest-priority next task: Improve the token-recovery handoff after players
  have map, fuse, and badge but still lack the signal token.
- Reason: The route works and the objective mentions the tunnel clock, but the
  service-room return remains generic in the exact state where token recovery is
  the only missing critical step.
- Planned action:
  - Inspect whether a token-specific service-room return choice can replace the
    generic tunnel return without creating unreachable scenes or excess state
    branches.

## 2026-06-01 - Clue-Informed Platform Steering

### Current Plan

- Main objective: Keep clue-informed players from walking straight into the
  unprepared Platform 13 gate trap after they already know Mara's route.
- Why this matters: The latest exploratory route read Mara's file and heard the
  radio route, then still went to the platform without map or fuse and chose the
  forced-gate bad ending. Once the player has enough information to prepare, the
  hub should emphasize preparation over a noisy failure.
- Tasks:
  - Hide `go_to_platform` after Mara's route clues until the player has the
    marked map or platform fuse.
  - Preserve early platform exploration before those clues are known.
  - Add regression coverage for the new service-room choice filtering.
  - Run health and play a full route through the changed moment.
- Risks: Narrowing the service-room menu could over-focus players, so the
  map-only branch, fuse path, and early unprepared exploration must stay
  reachable.

### Work Completed

- Changes made:
  - Updated the `go_to_platform` requirements so clue-informed players need the
    map or fuse before returning to the unlit platform.
  - Updated an older underprepared-platform regression to represent early
    exploration before Mara's route clues.
  - Added a regression proving the clue-informed service room hides
    `go_to_platform` until the map is collected.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scene; this is route steering and choice polish.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run health`
  - `node --import tsx src/cli.ts playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - Manual CLI route from Mara's file and radio clue through the true ending
- What worked:
  - Story-path tests pass with 29 tests.
  - Full health passes with 40 tests, clean validation, and all 25 scenes
    reachable.
  - Coverage remains stable: 612 runs, 592 ended, 0 unfinished, 20 frontier
    samples, all scenes visited, best score 100/100.
  - Random 250-run sample ended every run, visited every scene, and reached
    `true_ending` 121 times.
  - Manual CLI play confirmed the service room withheld `go_to_platform` after
    the file and radio clues, then restored it after taking the map and reached
    `true_ending` at 100/100.
- What felt bad/confusing:
  - The route still briefly allows `return_to_tunnel` after the player has map,
    fuse, and badge but lacks the token; that is useful for token recovery, but
    it depends on the objective text to make the clock destination obvious.
- Bugs found:
  - The first focused test run exposed that an older regression was using the
    now-invalid clue-informed route to reach the platform. The test was updated
    to cover early exploration instead.

### Next Iteration

- Highest-priority next task: Improve the token-recovery handoff after players
  have map, fuse, and badge but still lack the signal token.
- Reason: The current route works, but the player returns to the generic tunnel
  and must choose the clock from there; a more explicit handoff could reduce one
  more moment of late-game ambiguity.
- Planned action:
  - Inspect service-room objectives and tunnel choice labels for the
    fully-equipped-without-token state.
  - Prefer a small label/objective polish over adding new scenes.

## 2026-06-01 - Coverage Frontier Reporting

### Current Plan

- Main objective: Reclassify coverage-strategy frontier samples so reports stop
  presenting normal scene-discovery evidence as unfinished playthroughs.
- Why this matters: The current evidence showed 20 coverage "unfinished" runs,
  but inspection proved they were first-seen scene samples rather than stuck
  routes. Mislabeling them pushes future agents toward false loop fixes.
- Tasks:
  - Add explicit run statuses for endings, frontier samples, dead ends, and
    step-limit failures.
  - Keep genuine random/goal max-step failures counted as unfinished.
  - Update tests around playtest summary semantics.
  - Run health and play a real route before committing.
- Risks: Downstream report readers must use `frontierSamples` for coverage
  discovery samples instead of treating every non-ending sample as unfinished.

### Work Completed

- Changes made:
  - Added `status` to each playtest run.
  - Changed summary `unfinished` to count only `dead_end` and `max_steps`
    statuses.
  - Added `frontierSamples` to expose coverage first-seen scene samples
    directly.
- Files/systems touched:
  - `src/playtest.ts`
  - `tests/playtest.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - Clearer playtest reporting for autonomous development cycles.

### Playtest Notes

- What was tested:
  - `npm test -- tests/playtest.test.ts`
  - Coverage summary via `node --import tsx src/cli.ts playtest stories/demo.yaml --runs 100 --strategy coverage --summary --json`
  - `npm run health`
  - Manual CLI route through the gate-control clue, poster beat, signal booth,
    and true ending
- What worked:
  - Focused tests passed with 5 tests.
  - Full health passed with formatting, TypeScript, 38 tests, validation, and
    coverage playtest.
  - Coverage now reports 0 unfinished runs and 20 frontier samples while still
    visiting every scene and reaching all endings.
  - The clean CLI playthrough reached `true_ending` at 100/100.
- What felt bad/confusing:
  - No gameplay route issue in this pass; the problem was diagnostic clarity.
- Bugs found:
  - The previous summary conflated coverage frontier samples with genuinely
    unfinished playthroughs.

### Next Iteration

- Highest-priority next task: Use the cleaner reporting to identify any true
  random max-step runs, then improve the underlying route only if one remains.
- Reason: Future cycles can now separate real player-facing loops from coverage
  bookkeeping.
- Planned action:
  - Inspect random `status: "max_steps"` paths when they occur.
  - Prefer content steering only when a route is genuinely failing to conclude.

## 2026-06-01 - Gate Control Readability

### Current Plan

- Main objective: Improve early Platform 13 readability before players commit to
  forcing the gate or boarding underprepared.
- Why this matters: The evidence still showed abrupt low-score bad-ending routes
  from the unlit platform, and the true-ending sequence benefits from an
  earlier in-world explanation of the fuse, token, and ledger order.
- Tasks:
  - Add a one-time unlit-platform inspection beat for the gate control.
  - Make the beat point players back to the service room and stopped clock.
  - Cover the route with a focused story-path regression.
  - Run health and play through the new route.
- Risks: Adding another platform choice could increase menu clutter if it is not
  one-time and clearly directional.

### Work Completed

- Changes made:
  - Added `gate_control`, an optional inspection scene that explains the
    platform-light fuse, signal-booth token, and ledger-clearing sequence.
  - Updated objective generation so `knows_token_location` directly surfaces the
    stopped-clock token objective.
  - Added a regression test for the new early-platform guidance route.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/engine.ts`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - New reachable story scene: `gate_control`.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run health`
  - Manual CLI route through `gate_control` to `true_ending`
- What worked:
  - Validation reports 25 scenes, 5 endings, and 25 reachable scenes.
  - Health passes with 32 tests.
  - Coverage playtest visits every scene including `gate_control` and reaches
    `true_ending` 72 times in the health sample.
  - The manual CLI route reached `true_ending` at 100/100 after using the new
    clue to recover the stopped-clock token.
- What felt bad/confusing:
  - The coverage strategy still reports 20 unfinished frontier samples despite
    visiting all scenes.
- Bugs found:
  - The first test run exposed that `knows_token_location` did not by itself
    surface the token objective. Objective logic was corrected and retested.

### Next Iteration

- Highest-priority next task: Reclassify or explain coverage-strategy
  unfinished frontier samples.
- Reason: Health is green, but the summary still looks worse than actual
  playability because coverage exploration can stop at frontier states.
- Planned action:
  - Inspect `src/playtest.ts` unfinished accounting for coverage mode.
  - Add focused tests that distinguish budget/frontier stops from genuine stuck
    unfinished playthroughs.

## 2026-06-01 - Platform 13 Poster Beat

### Current Plan

- Main objective: Add a focused late-game story beat that clarifies Mara's badge
  and ledger stakes without blocking the true-ending route.
- Why this matters: Platform 13 already showed Mara's missing-person posters,
  but players could not inspect them. The badge-ledger connection depended
  mostly on earlier service-room clues, so the lit platform missed a chance to
  reinforce the final objective in-world.
- Tasks:
  - Add a one-time poster inspection scene from the lit platform.
  - Return cleanly to the gate control without creating a repeat loop.
  - Add regression coverage for the new beat.
  - Fix any playtest reporting issue exposed by the new route.
- Risks:
  - Adding optional late-game content can dilute route focus. The scene must be
    one-time and leave the signal-booth route available.

### Work Completed

- Changes made:
  - Added `mara_posters`, a short Platform 13 inspection scene that reframes
    Mara as "in transit" and explicitly ties her badge to proof of service.
  - Added `inspect_mara_posters` as a one-time lit-platform choice.
  - Fixed random and goal playtest reporting so endings reached on the final
    allowed step are counted as ended.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/playtest.ts`
  - `tests/story-paths.test.ts`
  - `tests/playtest.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - One new reachable story scene: `mara_posters`.
  - Two small playtest edge-case regressions.

### Playtest Notes

- What was tested:
  - `npm test -- tests/playtest.test.ts tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy random --summary --json`
  - `npm run health`
  - Manual CLI route through notice, token, map, radio, locker, lit platform,
    poster inspection, signal booth, ledger clear, and true ending.
- Quantitative metrics:
  - Focused tests: 25 passing.
  - Full health: format check, lint, 31 tests, validation, and coverage playtest
    pass.
  - Validation: 24 scenes, 5 endings, 24 reachable scenes.
  - Random playtest, 100 runs: 100 ended, 0 unfinished, all scenes visited,
    `true_ending` reached 14 times, average score 49.6, max-score runs 8.
  - Coverage playtest in health: 243 runs, 224 ended, 19 unfinished frontier
    reports, all scenes visited, `true_ending` reached 40 times, average score
    54.22, max-score runs 24.
  - Manual CLI route: inspected `mara_posters`, returned to `lit_platform`, then
    reached `true_ending` at 100/100.
- What worked:
  - The poster scene gives the platform a stronger Mara-focused beat before the
    signal booth.
  - The one-time flag prevents repeated poster inspection loops.
  - The playtest report no longer mislabels final-step endings as unfinished.
- What felt bad/confusing:
  - Coverage still reports non-ending frontier samples as unfinished, which is
    technically accurate for that strategy but easy to confuse with failed
    player runs.
- Bugs found:
  - Random playtest reporting marked a run as unfinished even though its final
    recorded scene was `escape_ending`. Observing the final state after the step
    budget fixed the false unfinished result.

### Next Iteration

- Highest-priority next task: Improve coverage report semantics for frontier
  samples.
- Reason: The remaining 19 unfinished coverage reports are useful exploration
  markers, but they read like failed playthroughs in cycle summaries.
- Planned action:
  - Separate coverage frontier observations from genuinely exhausted or
    no-choice unfinished runs, then update summaries/tests so AI agents can
    critique pacing without misreading coverage artifacts as playability bugs.

## 2026-06-01 - Fully Equipped Service-Room Launch

### Current Plan

- Main objective: Make the fully equipped service-room state a clear launch
  point for Platform 13.
- Why this matters: The previous pass removed the tunnel return, but ready
  players could still see optional clue actions as competing next steps even
  after collecting the map, token, fuse, and badge.
- Tasks:
  - Hide service-room radio/file clue actions once all four core tools are held.
  - Remove stale release-route objectives in that same ready state.
  - Keep max score available for no-radio true-ending routes.
  - Verify with regression tests, health, playtests, and a real CLI route.
- Risks:
  - This narrows optional lore access for fully equipped players. Earlier routes
    still expose those clues while they are useful for discovery.

### Work Completed

- Changes made:
  - Added item-gated requirements to `tune_radio` and `read_personnel_file` so
    they disappear only after the player holds the map, token, fuse, and badge.
  - Suppressed the "Learn how to survive the driverless train" objective in the
    fully equipped state, where the next real task is Platform 13.
  - Updated release-route scoring so clearing Mara also earns that achievement,
    preserving 100/100 true-ending routes that skip the radio.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/engine.ts`
  - `src/score.ts`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused pacing, objective, and scoring alignment
    pass.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts tests/playtest.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 10 --strategy goal --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run health`
  - Manual CLI route through notice, token, map, locker, focused service room,
    platform lighting, signal booth, ledger clear, and true ending.
- Quantitative metrics:
  - Focused tests: 21 passing.
  - Health: format check, lint, 27 tests, validation, and coverage playtest all
    pass.
  - Goal playtest, 10 runs: 10/10 ended at `true_ending`, average score 100,
    max-score runs 10.
  - Random playtest, 250 runs: 249 ended, 1 unfinished, all scenes visited,
    `true_ending` reached 27 times, average score 47.1, max-score runs 18.
  - Coverage playtest, 170 runs: 152 ended, 18 unfinished, all scenes visited,
    `true_ending` reached 20 times, average score 48.82, max-score runs 12.
  - Manual CLI route: fully equipped service room offered only
    `go_to_platform`, objectives pointed to power/token use, and the route
    reached `true_ending` at 100/100 while skipping radio and file.
- What worked:
  - The ready service-room state is now unambiguous.
  - No-radio true-ending routes remain valid max-score routes once Mara is
    cleared.
- What felt bad/confusing:
  - The service-room prose still mentions the radio and maps even when those
    choices are no longer available; this is acceptable but could be improved
    with state-aware scene text in a future content pass.
- Bugs found:
  - Initial health run exposed a score regression for goal playtests. Updating
    release-route scoring fixed it and restored 10/10 max-score goal runs.

### Next Iteration

- Highest-priority next task: Inspect the 18 unfinished coverage traces.
- Reason: Current player-facing route focus is improved, but coverage still
  reports the same unfinished frontier samples.
- Planned action:
  - Generate full coverage traces, group unfinished paths by final scene and
    repeated state, then either refine reporting or trim the strongest remaining
    loop.

## 2026-06-01 - Fully Equipped Service-Room Focus

### Current Plan

- Main objective: Reduce late service-room wandering once players have assembled
  the core true-ending tools.
- Why this matters: The current evidence still pointed to service-room,
  platform, and tunnel wandering after players had enough equipment to make
  progress. The generic tunnel return competed with the correct platform route
  even when the tunnel had no remaining required pickup.
- Tasks:
  - Hide `return_to_tunnel` from the service room after the player has the map,
    token, fuse, and badge.
  - Preserve earlier tunnel recovery for players still missing any of those
    tools.
  - Add regression coverage, run health, and manually play the focused route.
- Risks:
  - This narrows fully equipped navigation. Future late-game tunnel content
    should add a new explicit route or relax the requirement.

### Work Completed

- Changes made:
  - Added an item-based requirement to the service-room `return_to_tunnel`
    choice so it disappears once all four core tools are held.
  - Added a story-path regression test for the fully equipped service-room
    choice list.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused pacing and objective-surfacing change.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 170 --strategy coverage --summary --json`
  - `npm run health`
  - Manual CLI route through notice, token, map, locker, focused service room,
    platform lighting, signal booth, ledger clear, and true ending.
- Quantitative metrics:
  - Story-path tests: 19 passing.
  - Health: format check, lint, 27 tests, validation, and coverage playtest all
    pass.
  - Random playtest, 250 runs: 249 ended, 1 unfinished, all scenes visited,
    `true_ending` reached 27 times, average score 47.14.
  - Coverage playtest, 170 runs: 152 ended, 18 unfinished, all scenes visited,
    `true_ending` reached 20 times, average score 48.24.
  - Manual CLI route: the fully equipped service room offered `go_to_platform`
    but not `return_to_tunnel`, then reached `true_ending` at 90/100 while
    intentionally skipping the radio clue.
- What worked:
  - The service-room hub no longer invites a low-value return to the clock after
    the token has already been collected.
  - Earlier token and tool recovery routes remain available because the tunnel
    return only disappears when all four core tools are present.
- What felt bad/confusing:
  - The ready-state service room still offers optional radio and file actions,
    so a future pass could make those read as deliberate lore/score routes
    instead of equally urgent navigation choices.
- Bugs found:
  - No runtime bugs.

### Next Iteration

- Highest-priority next task: Improve ready-state service-room wording or
  choice labels.
- Reason: The main navigation loop is trimmed, but optional lore choices still
  compete visually with the platform route after the player has enough gear.
- Planned action:
  - Add state-aware labels or a small ready-state scene variant that frames the
    radio/file as optional before heading to Platform 13.

## 2026-06-01 - Locker Loop Trim

### Current Plan

- Main objective: Reduce low-value locker backtracking seen in exploratory
  playtests without removing any critical route.
- Why this matters: Suspicious paths repeatedly bounced between
  `service_room` and `locker` after taking only one locker item, delaying the
  useful badge/fuse pairing that supports the true-ending route.
- Tasks:
  - Keep the locker open until both the platform fuse and Mara's badge are
    collected.
  - Update story-path tests to lock in the tighter pickup flow.
  - Verify validation, health, automated playtests, and a real playthrough.
- Risks:
  - This slightly reduces optional backtracking in the locker, but both items
    are useful, score-bearing, and harmless for lesser endings.

### Work Completed

- Changes made:
  - Added fuse-and-badge requirements to `close_locker`.
  - Updated affected story-path routes and the locker regression expectation.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused pacing and choice-surfacing improvement.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 192 --strategy coverage --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 10 --strategy goal --summary --json`
  - `npm run health`
  - Manual CLI route through the updated locker sequence and on to
    `true_ending`.
- Quantitative metrics:
  - Story-path tests: 17 passing.
  - Health: format check, lint, 25 tests, validation, and coverage playtest all
    pass.
  - Random playtest, 250 runs: 248 ended, 2 unfinished, all scenes visited,
    `true_ending` reached 31 times, average score 47.02.
  - Coverage playtest, 192 runs: 174 ended, 18 unfinished, all scenes visited,
    `true_ending` reached 20 times, average score 46.88.
  - Goal playtest: 10/10 reached `true_ending` at 100/100.
  - Manual CLI route: after `take_fuse`, the locker offered only `take_badge`;
    after `take_badge`, it offered only `close_locker`; the full route reached
    `true_ending` at 100/100.
- What worked:
  - The locker no longer offers a low-information close/reopen loop while a
    critical item is still visible.
  - The service room no longer offers `search_locker` once both locker items are
    collected.
- What felt bad/confusing:
  - Coverage still reports the same 18 unfinished hub-expansion runs, so this
    pass improved a player-facing loop without solving the coverage artifact.
- Bugs found:
  - A direct Node route failed without the repo's `tsx` loader; rerunning with
    `node --import tsx` worked. No game runtime bugs were found.

### Next Iteration

- Highest-priority next task: Inspect unfinished coverage traces directly.
- Reason: The most visible locker churn is trimmed, but the coverage strategy
  still records 18 unfinished runs from broader hub traversal.
- Planned action:
  - Run coverage with full traces, cluster unfinished paths by final scene, and
    make one narrow route or playtest-reporting improvement based on the
    dominant trace.

## 2026-06-01 - Cleared Ledger Finale Focus

### Current Plan

- Main objective: Make the earned true-ending finale decisive after Mara's
  ledger entry has been cleared.
- Why this matters: Evidence showed a player could do the complete true-ending
  setup, clear Mara from the ledger, then still lose by choosing the HOME-sign
  trap in the train car.
- Tasks:
  - Hide the train-car HOME-sign trap once `freed_mara` is true.
  - Keep the sign warning and lesser endings reachable on underprepared routes.
  - Update regression coverage for the cleared-Mara finale.
  - Verify health, random play behavior, and a real playthrough.
- Risks:
  - The finale should not become automatic before the player has earned it, so
    this gate only applies after the ledger is cleared.

### Work Completed

- Changes made:
  - Added `notFlag: freed_mara` to the train-car `look_at_sign` choice.
  - Updated the cleared-Mara train-car test to expect only the release-focused
    finale, with no map escape or sign trap.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused choice-surfacing improvement.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run health`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - Manual CLI route through notice, token, map, radio, locker, fuse, signal
    booth, ledger clear, and emergency release.
- Quantitative metrics:
  - Story-path tests: 17 passing.
  - Health: format check, lint, 25 tests, validation, and coverage playtest all
    pass.
  - Coverage playtest from health: all scenes visited, `true_ending` reached
    10 times, 18 unfinished.
  - Random playtest, 250 runs: 249 ended, 1 unfinished, all scenes visited,
    `true_ending` reached 19 times, average score 40.82.
  - Manual CLI route: `train_car` offered only `pull_release` after clearing
    Mara, then reached `true_ending` at 100/100.
- What worked:
  - The true-ending setup now pays off cleanly instead of offering a late trap
    after Mara has already been cleared.
  - The sign warning, `lost_ending`, and `good_ending` remain reachable through
    routes where Mara has not been cleared.
- What felt bad/confusing:
  - The train-car prose still mentions the HOME sign even when the sign choice
    is hidden. It reads as pressure rather than a broken affordance, but scene
    variants would make this cleaner.
  - Coverage still reports 18 unfinished runs.
- Bugs found:
  - No runtime bugs.

### Next Iteration

- Highest-priority next task: Inspect unfinished coverage traces and remove one
  remaining repetitive hub loop.
- Reason: The finale distraction is fixed, but coverage still exits 18 runs by
  step budget rather than endings.
- Planned action:
  - Run coverage with full traces, identify the dominant unfinished route, and
    add a narrow state-aware requirement or route-shortening choice.

## 2026-06-01 - Lit Platform Return Clarity

### Current Plan

- Main objective: Remove stale platform prose and repeated fuse installation
  after Platform 13 has already been lit.
- Why this matters: Manual play exposed a recovery path where players lit the
  platform, boarded too early, followed the warning back to the clock, then
  returned to base `platform` text that still described an empty fuse socket.
- Tasks:
  - Route tunnel returns to `lit_platform` once `platform_lit` is true.
  - Route service-room returns to `lit_platform` once `platform_lit` is true.
  - Add regression tests for both return paths.
  - Verify health and a real playthrough through the corrected recovery route.
- Risks:
  - Alternate exploration must stay intact before the fuse is installed.

### Work Completed

- Changes made:
  - Added `follow_arrows_to_lit_platform` for post-light tunnel returns.
  - Hid base `follow_arrows` and `go_to_platform` once `platform_lit` is true.
  - Added `return_to_lit_platform` from the service room for already powered
    platform returns.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - Two state-aware navigation choices that keep prose and mechanics aligned.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy random --summary --json`
  - `npm run health`
  - Manual CLI route through early boarding, ledger warning, clock token
    recovery, lit-platform return, signal booth, and true ending.
- Quantitative metrics:
  - Story-path tests: 17 passing.
  - Health: format check, lint, 25 tests, validation, and coverage playtest all
    pass.
  - Random playtest, 100 runs: 100 ended, 0 unfinished, all scenes visited,
    `true_ending` reached 4 times, average score 40.85.
  - Coverage playtest from health: all scenes visited, `true_ending` reached
    10 times, 18 unfinished.
  - Manual CLI route: `true_ending`, 100/100.
- What worked:
  - After returning from the ledger warning to the clock, taking the token now
    exposes `follow_arrows_to_lit_platform` and skips the stale empty-fuse
    platform scene.
  - Returning from the lit platform to the service room now offers
    `return_to_lit_platform` rather than another base platform approach.
- What felt bad/confusing:
  - The tunnel prose is still generic after token recovery; the corrective
    choice label carries the state awareness. This is acceptable for a scoped
    pass but could be improved with richer scene variants later.
  - Coverage still reports 18 unfinished runs.
- Bugs found:
  - No runtime bugs; the previous stale-prose navigation issue is covered by
    regression tests.

### Next Iteration

- Highest-priority next task: Inspect unfinished coverage traces and remove one
  remaining repetitive hub loop.
- Reason: The platform return issue is fixed, but coverage still exits 18 runs
  by step budget rather than endings.
- Planned action:
  - Run coverage with included traces, identify the dominant unfinished path,
    and add a narrow state-aware choice or requirement to shorten that loop.

## 2026-06-01 - Prepared Gate Affordance

### Current Plan

- Main objective: Reduce prepared-player bad endings caused by forcing the gate
  after already finding the platform fuse.
- Why this matters: The latest suspicious random path showed players collecting
  useful true-ending tools, reaching the platform, then choosing the destructive
  gate action instead of using the obvious fuse socket. That made normal play
  feel unfairly noisy rather than meaningfully risky.
- Tasks:
  - Keep the forced-gate bad ending reachable for underprepared players.
  - Hide `force_gate` once the player carries the fuse.
  - Add regression coverage for the prepared platform choice list.
  - Verify validation, playtest metrics, health, and an actual MCP route.
- Risks:
  - Removing a visible option can make the scene feel less dangerous, so the bad
    ending should remain available before the fuse is found.

### Work Completed

- Changes made:
  - Added a `notItem: fuse` requirement to `force_gate`.
  - Added a story-path test proving prepared players see `install_fuse` and do
    not see `force_gate`.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused choice-surfacing improvement.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 288 --strategy coverage --summary --json`
  - Manual MCP route through fuse pickup, platform check, ledger warning,
    token recovery, signal booth, and true ending.
- Quantitative metrics:
  - Story-path tests: 15 passing.
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: 248 ended, 2 unfinished, all scenes visited,
    `bad_ending` 78, `true_ending` 8, average score 39.96.
  - Coverage playtest, 288 runs: 270 ended, 18 unfinished, all scenes visited,
    `bad_ending` 43, `true_ending` 14, average score 50.02.
- What worked:
  - At the platform with the fuse, MCP showed `install_fuse`, `board_train`, and
    `return_to_service_room`; `force_gate` was gone.
  - The bad ending remains reachable from the platform before the fuse is found.
  - Coverage bad endings dropped sharply while all scenes stayed reachable.
- What felt bad/confusing:
  - Returning from the clock after the platform has already been lit still lands
    on the base `platform` scene, whose prose says the fuse socket is empty.
    Reinstalling the fuse works mechanically, but the prose is stale.
  - Random play still produced 2 unfinished runs in the 250-run sample.
- Bugs found:
  - No runtime bugs; found one stale-prose/design issue for the next pass.

### Next Iteration

- Highest-priority next task: Add a state-aware return from the tunnel/platform
  after `platform_lit` is true.
- Reason: The manual MCP route exposed stale platform prose and a repeated
  `install_fuse` step after token recovery.
- Planned action:
  - Route `follow_arrows` or the post-token platform return to `lit_platform`
    when `platform_lit` is already set, with a regression test that avoids
    reinstalling the fuse.

## 2026-06-01 - Clock Token Follow-Through

### Current Plan

- Main objective: Reduce a normal-player miss where the player learns the signal
  token is hidden in the stopped clock, inspects the clock, then leaves without
  taking it.
- Why this matters: The true-ending path depends on the signal booth token.
  Evidence showed players could gather the right clue and still drift back into
  service-room/platform loops or force the gate.
- Tasks:
  - Mark the token location as known when Mara explicitly reveals it.
  - Prevent the "leave the clock alone" action after that clue is known.
  - Add regression coverage for the guided clock state.
  - Verify health and an actual route through the changed flow.
- Risks:
  - This removes one avoidant choice in a specific informed state, so alternate
    endings must remain reachable before the clue is known.

### Work Completed

- Changes made:
  - Added `knows_token_location` when players read Mara's personnel file or hear
    Mara's direct warning.
  - Gated `leave_clock` behind `notFlag: knows_token_location`, making
    `take_token` the only clock action after the player has the precise clue.
  - Added a story-path regression test for the file clue into clock inspection.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a focused affordance and clue-follow-through pass.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run health`
  - CLI route through Mara's file, clock token, signal booth, ledger clear, and
    emergency release.
- Quantitative metrics:
  - Story-path tests: 13 passing.
  - Health: format check, lint, 21 tests, validation, and coverage playtest all
    pass.
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Coverage playtest: all scenes visited, `true_ending` reached 8 times, best
    score 100/100.
  - Manual CLI route: `true_ending`, 100/100.
- What worked:
  - After reading Mara's file and inspecting the clock, the observation exposes
    only `take_token`, closing the easy-to-miss skip.
  - The guided file route reaches the signal booth and true ending cleanly.
  - Earlier uninformed clock visits can still leave the token behind, preserving
    a meaningful choice before the clue is learned.
- What felt bad/confusing:
  - Coverage playtest still reports 18 unfinished runs, so service-room/platform
    loops remain the next systemic target.
- Bugs found:
  - None in this pass.

### Next Iteration

- Highest-priority next task: Reduce repetitive service-room/platform
  backtracking in exploratory and coverage runs.
- Reason: Token follow-through is tighter now, but unfinished coverage runs
  still point to loops around utility scenes.
- Planned action:
  - Inspect unfinished run transcripts or playtest traces, then add one
    state-aware return choice or pruning rule that shortens repeated
    service-room, tunnel, locker, and platform cycling.

## 2026-06-01 - Release After Ledger Clear

### Current Plan

- Main objective: Make the true-ending release action discoverable once players
  have cleared Mara's ledger entry.
- Why this matters: The train-car prose says the emergency release is found, but
  the release choice was hidden unless the player had explicitly written down
  the radio route. Players who solved the token, badge, fuse, and ledger chain
  could still be pushed toward lesser endings.
- Tasks:
  - Let `freed_mara` expose the emergency release in the train car.
  - Remove stale "learn how to survive the train" objective after Mara is clear.
  - Add regression coverage for the no-radio ledger route.
  - Verify health, playtest summaries, MCP play, and current CLI play.
- Risks:
  - This makes `true_ending` easier to reach, so the remaining optional radio
    clue should still matter as score and foreshadowing.

### Work Completed

- Changes made:
  - Relaxed `pull_release` requirements from `knows_release + freed_mara` to
    `freed_mara`.
  - Updated objective generation so clearing Mara replaces the generic train
    survival objective with the concrete release instruction.
  - Added a focused story-path test that reaches `true_ending` after clearing
    Mara without tuning the radio.
- Files/systems touched:
  - `stories/demo.yaml`
  - `src/engine.ts`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
  - `IMPROVEMENT_LOG.md`
- New content/features added:
  - No new scenes; this is a late-game affordance and objective-clarity pass.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 262 --strategy coverage --summary --json`
  - `npm run health`
  - MCP route through the no-radio ledger clear into `true_ending`
  - Current CLI route through the same no-radio ledger clear into `true_ending`
- Quantitative metrics:
  - Health: format check, lint, 20 tests, validation, and coverage playtest all
    pass.
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Random playtest, 250 runs: 247 ended, 3 unfinished, all scenes visited,
    `true_ending` reached 5 times, best score 100/100, average score 37.9.
  - Coverage playtest: all scenes visited, `true_ending` reached 8 times, up
    from 4 in the prior evidence sample.
- What worked:
  - The solved ledger chain now naturally culminates in pulling the emergency
    release, even when the player skipped the radio note.
  - The train-car objective now points only at the release after Mara is cleared.
  - Alternate endings remain reachable.
- What felt bad/confusing:
  - Skipping the radio still costs the release-route score achievement, so the
    no-radio true ending lands at 90/100. This is acceptable for now because the
    route is successful but not fully informed.
  - Random play still heavily favors `bad_ending` and `good_ending`.
- Bugs found:
  - Current-code CLI verification caught a stale objective after the first pass;
    tightening the objective condition fixed it.

### Next Iteration

- Highest-priority next task: Reduce repetitive service-room and platform
  backtracking in random/exploratory routes.
- Reason: True-ending completion is less brittle now, but normal play still
  spends too many turns revisiting the same utility scenes before settling on
  lesser endings.
- Planned action:
  - Inspect suspicious random paths for loops around `service_room`, `tunnel`,
    `locker`, and `platform`.
  - Add one small state-aware affordance or route pruning change that keeps
    backtracking useful while reducing dead-feeling repeats.

## 2026-06-01 - Repo Quality Pass

### Current Plan

- Main objective: Stabilize and modernize the repo after the latest gameplay
  cycle without changing public CLI/MCP behavior.
- Why this matters: Baseline health was green, but `npm audit` reported a
  moderate Vite/esbuild chain through the older Vitest stack, and `ai:cycle`
  still used a stale locker route.
- Tasks:
  - Upgrade vulnerable dev dependencies with tests proving compatibility.
  - Simplify validation reference scanning.
  - Add focused tests for validator and ending-observation behavior.
  - Verify health, audit, autonomous evidence, and a real playthrough.

### Work Completed

- Changes made:
  - Upgraded Vitest from 2.x to 4.1.7 and refreshed `package-lock.json`.
  - Reused a single known item/flag catalog during story validation instead of
    rebuilding it for every conditional choice.
  - Cleared derived objectives from ending observations.
  - Updated the AI-loop MCP true-ending route for the persistent locker flow.
  - Ignored transient `.codex/tmp/` lock files.
  - Synced README scene count with validation output.
- Files/systems touched:
  - `package.json`
  - `package-lock.json`
  - `.gitignore`
  - `README.md`
  - `src/engine.ts`
  - `src/validate.ts`
  - `src/ai-loop.ts`
  - `tests/engine.test.ts`
  - `tests/validate.test.ts`

### Playtest Notes

- What was tested:
  - `npm test -- tests/engine.test.ts tests/validate.test.ts`
  - `npm run health`
  - `npm audit --audit-level=moderate`
  - `npm run ai:cycle`
  - CLI route through the current true-ending path
- Quantitative metrics:
  - Unit tests: 19 passing.
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Coverage playtest: all scenes visited, best score 100/100.
  - Audit: 0 moderate-or-higher vulnerabilities.
  - True route: `true_ending`, 100/100.
- What worked:
  - Vitest 4 is compatible with the existing suite on Node 22.
  - The autonomous MCP route now exercises the actual current locker flow.
  - Ending observations no longer show stale final objectives.
- What felt bad/confusing:
  - `ai:cycle` initially failed because the verifier route was stale; the failure
    was useful and is now covered by the cycle itself.

### Next Iteration

- Highest-priority next task: Improve midgame clarity around the release route
  after the player has the map, badge, and radio clue.
- Reason: Repo health is green, but random play still seldom reaches
  `true_ending` compared with lesser endings.

## 2026-06-01 - Cycle 1: Locker Discovery Flow

### Current Plan

- Main objective: Improve normal-play discovery of Mara's badge without adding
  a new puzzle gate.
- Why this matters: Random evidence showed players often searched the locker
  but still missed the full true-ending chain. The old item flow sent players
  back to the service room after taking one item, making the badge easy to skip
  after grabbing the fuse.
- Tasks:
  - Keep the locker scene open after taking the fuse or badge.
  - Add regression coverage that the remaining item stays visible.
  - Verify story validation, playtest reachability, and a real route to the
    true ending.
- Risks:
  - Keeping players in the locker too long could create a dead-feeling loop.
  - The change should not remove deliberate alternate endings.

### Work Completed

- Changes made:
  - Changed `take_fuse` and `take_badge` to remain in `locker`.
  - Players now leave the locker through `close_locker` after seeing both
    true-ending tools.
  - Updated critical path tests for the new interaction flow.
  - Added a focused test that verifies taking one locker item leaves the other
    visible.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `AI_LOOP_STATE.md`
- New content/features added:
  - No new scenes; this is a flow and affordance improvement.

### Playtest Notes

- What was tested:
  - `npm test -- tests/story-paths.test.ts`
  - `npm run format:check`
  - `npm run cyoa -- validate stories/demo.yaml --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 262 --strategy coverage --summary --json`
  - CLI route through the new locker flow into `true_ending`
- Quantitative metrics:
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Story-path tests: 11 passing.
  - Random playtest, 250 runs: 247 ended, 3 unfinished, all scenes visited,
    `true_ending` reached 4 times, best score 100/100, 3 max-score runs,
    average score 37.86/100.
  - Coverage playtest, 262 runs: all scenes visited, best score 100/100, 2
    max-score runs.
  - True route: `true_ending`, 100/100.
- What worked:
  - The locker now behaves more like a natural container: taking one object does
    not hide the other behind another search action.
  - Random play found max score and the true ending more often than the previous
    evidence sample.
  - Alternate endings remain reachable.
- What felt bad/confusing:
  - The locker text repeats after each pickup because story scenes are static.
    This is acceptable for now but could be polished later with state-aware text
    if the engine adds it.
  - Random play still favors `bad_ending` and `good_ending`, so midgame
    objective clarity remains the main weakness.
- Bugs found:
  - One test path still used the old repeated `search_locker` step; updating it
    caught and fixed the stale route assumption.

### Next Iteration

- Highest-priority next task: Improve midgame clarity around the release route
  after the player has the map, badge, and radio clue.
- Reason: Badge discovery is less missable now, but true-ending completion still
  depends on players connecting the booth ledger to the release action.
- Planned action:
  - Inspect transcripts where players reach `train_car` with partial knowledge.
  - Add a small clue or objective update that makes pulling the release feel like
    the natural final action after clearing Mara.

## 2026-06-01 - Cycle 1: Lit-Platform Ledger Warning

### Current Plan

- Main objective: Improve normal-play discovery of the true-ending requirements
  at the late platform fork.
- Why this matters: Evidence showed coverage and goal play can reach
  `true_ending`, but random play still rarely finds it.
- Tasks:
  - Add a clear in-world warning before boarding from the lit platform while
    Mara remains uncleared.
  - Steer players carrying the signal token toward the booth instead of offering
    premature boarding.
  - Preserve lesser endings for deliberate alternate choices.
  - Keep health, coverage, and a real playthrough green.
- Risks:
  - Too much steering could flatten the ending choice.
  - Too little steering would not improve player comprehension.

### Work Completed

- Changes made:
  - Added `ledger_warning`, a late warning scene that calls out Mara's uncleared
    ledger before boarding.
  - Updated `lit_platform` text to make the token slot more active.
  - Hid the premature boarding choice when the player already has the token.
  - Added a return route from the warning back to the tunnel for players missing
    the token.
  - Updated npm scripts from `tsx src/...` to `node --import tsx src/...` so
    health, CLI, MCP, and loop commands avoid sandbox-blocked `tsx` IPC sockets.
  - Added focused story-path tests for the warning and token-carrier behavior.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `package.json`
  - `AI_LOOP_STATE.md`
- New content/features added:
  - One new story scene: `ledger_warning`.

### Playtest Notes

- What was tested:
  - `npm run health`
  - Targeted story-path tests
  - CLI random and coverage playtests
  - CLI route through the new warning into `good_ending`
  - CLI route through `true_ending`
- Quantitative metrics:
  - Validation: 23 scenes, 5 endings, 23 reachable scenes.
  - Tests: 4 files, 16 tests passing.
  - Coverage playtest: all scenes visited, best score 100/100.
  - Random playtest, 250 runs: `ledger_warning` visited, `true_ending` still
    reached rarely, best score 90/100.
  - True route: `true_ending`, 100/100.
  - Warning route: `good_ending`, 55/100.
- What worked:
  - The new warning makes the unresolved ledger explicit without deleting the
    good ending.
  - Carrying the token now pushes attention toward the signal booth at the exact
    moment it matters.
  - Health now runs in this sandbox with the revised npm scripts.
- What felt bad/confusing:
  - Random play still seldom reaches `true_ending`; the remaining problem is
    probably earlier badge/identity discovery and route ordering, not just the
    late platform fork.
- Bugs found:
  - `tsx src/...` package scripts attempted to create IPC sockets under `/tmp`
    and failed with `EPERM` in this sandbox. Switching to `node --import tsx`
    fixed the command path.

### Next Iteration

- Highest-priority next task: Improve normal-play discovery of Mara's badge and
  the identity requirement before the player reaches the platform.
- Reason: The late fork is now clearer, but random play still rarely assembles
  the full true-ending chain.
- Planned action:
  - Inspect random suspicious paths that reach the platform without the badge.
  - Add one earlier clue or affordance that makes searching the locker and taking
    the badge feel necessary rather than completionist.

## 2026-05-31 16:12 PT - Iteration 0001: Baseline Scoring Instrumentation

### Current Plan

- Main objective: Establish measurable self-play progress toward max-score
  solvability before expanding the story.
- Why this matters: The maintainer goal requires tracking maximum score,
  puzzle-solvability percentage, and reliable self-play wins. The repo had
  endings and coverage metrics but no explicit score model exposed through MCP.
- Tasks:
  - Inspect repo structure, story graph, MCP tools, tests, and AFK loop scripts.
  - Run baseline health checks and playtests.
  - Add deterministic scoring to observations and playtest summaries.
  - Add MCP and CLI score inspection.
  - Verify the canonical true-ending route reaches max score.
- Risks:
  - A rigid score model can reward one exact route instead of puzzle mastery.
  - Random-play metrics can make a solvable game look worse than it is unless
    paired with goal-oriented play.

### Work Completed

- Changes made:
  - Added `src/score.ts` with a 100-point achievement rubric.
  - Added `score` to engine observations.
  - Added playtest summary metrics: `bestScore`, `averageScore`, `maxScore`,
    and `maxScoreRuns`.
  - Added MCP `get_score`.
  - Added CLI `cyoa score --save ...`.
  - Updated tests so coverage playtests must find max score and the true-ending
    critical path must score 100/100.
  - Updated README examples and MCP tool list.
- Files/systems touched:
  - `src/score.ts`
  - `src/engine.ts`
  - `src/playtest.ts`
  - `src/mcp.ts`
  - `src/cli.ts`
  - `tests/playtest.test.ts`
  - `tests/story-paths.test.ts`
  - `README.md`
- New content/features added:
  - Score achievements for light, map, token, Mara ledger resolution, release
    route, fuse, badge, platform power, freeing Mara, and the true ending.
  - MCP-visible score breakdown with earned achievements.

### Playtest Notes

- What was tested:
  - `npm run health`
  - `npm run ai:cycle`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --max-steps 80 --strategy random --summary --json`
  - `npm run cyoa -- playtest stories/demo.yaml --runs 250 --max-steps 80 --strategy coverage --summary --json`
  - MCP smoke test using `listTools`, `start_game`, repeated `choose_option`,
    and `get_score`.
- Quantitative metrics:
  - Story graph: 22 scenes, 5 endings, 22 reachable scenes.
  - Test suite: 4 files, 11 tests passing.
  - MCP tool count: 9 tools.
  - MCP true-ending score smoke test: 100/100, 10/10 achievements earned.
  - Random self-play, 250 runs, 80-step cap:
    - Ended: 250/250
    - Unfinished: 0
    - True ending reached: 0
    - Best score: 80/100
    - Average score: 35.34/100
    - Max-score runs: 0
    - Unvisited scenes: `true_ending`
  - Coverage self-play, 250 requested runs, 80-step cap:
    - Actual explored runs/states: 265
    - Ended: 248
    - Unfinished frontier states: 17
    - True ending reached: 4
    - Best score: 100/100
    - Average score: 45.47/100
    - Max-score runs: 2
    - Unvisited scenes: none
- What worked:
  - Health gate is green.
  - MCP playthrough reaches `true_ending`.
  - Coverage strategy can prove every scene is reachable and can discover max
    score.
  - Score instrumentation makes quality regressions visible in automated runs.
- What felt bad/confusing:
  - Random self-play never reaches the true ending across 250 runs despite full
    graph reachability.
  - The current game is a compact CYOA with Zork-like atmosphere, not yet a
    parser-driven Zork III-style world.
  - Coverage reports label nonterminal frontier states as unfinished; this is
    useful for exploration, but it needs clearer reporting in future logs.
- Bugs found:
  - Initial score rubric made one valid true-ending route score 90/100 because
    it treated an optional personnel-file clue as mandatory. Fixed by awarding
    the Mara ledger achievement when Mara is actually freed.

### Evaluation

- The iteration is a net win. It does not add new story depth yet, but it gives
  the autonomous maintainer a measurable target: drive self-play toward reliable
  max-score discovery without weakening the puzzle structure.
- Current success criteria status:
  - Reliable maximum score in self-play: not achieved. Goal-oriented coverage
    can hit 100/100; random self-play cannot.
  - Unlimited depth: not achieved. The content remains a fixed 22-scene graph.
  - Critical bugs: none found in the standard health gate or MCP true-ending
    route.
  - Self-documentation: first persistent log entry established.
  - AFK loop robustness: existing loop can generate reports/prompts and
    post-agent verification artifacts.

### Next Iteration

- Highest-priority next task: Improve true-ending discoverability and score
  reliability without turning the route into a single obvious corridor.
- Reason: The biggest measured gap is 0/250 random max-score or true-ending
  runs, while coverage proves the route is structurally reachable.
- Planned action:
  - Add a goal-oriented playtest strategy or heuristic solver that follows
    objectives and score deltas.
  - Use that solver to track max-score reliability separately from chaotic
    random exploration.
  - Then adjust story clues or choice affordances only where solver transcripts
    show genuine ambiguity.

## 2026-05-31 16:15 PT - Iteration 0002: Goal-Oriented Self-Play

### Current Plan

- Main objective: Add a self-play strategy that behaves like a score-seeking
  puzzle solver, not a chaotic random walker.
- Why this matters: Iteration 0001 showed coverage could prove max score, but
  random self-play reached 0 max-score runs out of 250. The maintainer loop
  needs a reliable puzzle-solving probe before story changes can be judged
  fairly.
- Tasks:
  - Add a `goal` playtest strategy.
  - Expose the strategy through CLI and MCP.
  - Test that it reaches the true ending and max score reliably.
  - Compare this against random and coverage baselines.
- Risks:
  - A hand-tuned heuristic can overfit the current story.
  - Solver success does not prove a human player will naturally understand the
    route.

### Work Completed

- Changes made:
  - Added `goal` to the playtest strategy type.
  - Implemented score-guided choice ranking using score deltas, new items,
    newly set flags, destination quality, and loop avoidance.
  - Updated CLI strategy validation and usage text.
  - Updated MCP `run_playtest` schema to accept `goal`.
  - Added a test requiring 10/10 goal runs to reach `true_ending` at max score.
  - Updated README highlights and quickstart.
- Files/systems touched:
  - `src/playtest.ts`
  - `src/cli.ts`
  - `src/mcp.ts`
  - `tests/playtest.test.ts`
  - `README.md`
- New content/features added:
  - A solver-like autonomous player suitable for future regression checks and
    puzzle-solvability metrics.

### Playtest Notes

- What was tested:
  - `npm run cyoa -- playtest stories/demo.yaml --runs 10 --max-steps 40 --strategy goal --summary --json`
  - `npm run health`
  - MCP `run_playtest` with `{ strategy: "goal", runs: 10, maxSteps: 40 }`
- Quantitative metrics:
  - Goal self-play, 10 runs, 40-step cap:
    - Ended: 10/10
    - Unfinished: 0
    - True ending reached: 10/10
    - Best score: 100/100
    - Average score: 100/100
    - Max-score runs: 10/10
  - Health gate:
    - Formatting: pass
    - TypeScript: pass
    - Tests: 4 files, 12 tests passing
    - Validation: 22 scenes, 5 endings, 22 reachable scenes
    - Coverage self-play: all scenes visited, best score 100/100
- What worked:
  - The new strategy consistently solves the existing puzzle arc.
  - MCP can invoke the same strategy, so AFK loops can compare random,
    coverage, and goal-oriented player behaviors.
  - Score metrics now make the difference between solvability and
    discoverability explicit.
- What felt bad/confusing:
  - The strategy reaches max score by aggressively following score/keyword
    affordances, which may mask subtle narrative ambiguity.
  - Goal runs do not visit optional failure/warning scenes; coverage remains
    necessary for edge-case exploration.
- Bugs found:
  - None in this iteration.

### Evaluation

- The iteration is a net win. The game now has three complementary self-play
  modes:
  - `random`: chaotic discoverability probe.
  - `coverage`: graph reachability and edge-case probe.
  - `goal`: puzzle-solvability and max-score probe.
- Current success criteria status:
  - Reliable maximum score in self-play: achieved for goal strategy, not for
    random strategy.
  - Unlimited depth: not achieved yet; still fixed graph content.
  - Critical bugs: none found.
  - Self-documentation: two persistent feedback entries.
  - AFK loop robustness: MCP can run the new strategy.

### Next Iteration

- Highest-priority next task: Improve human-facing discoverability of the true
  ending while preserving meaningful bad/good/lost endings.
- Reason: Goal self-play can solve the game, but random self-play still misses
  `true_ending`; the next content pass should make the Mara/token/release chain
  more naturally legible.
- Planned action:
  - Inspect goal transcripts and random misses.
  - Add or revise one clue, objective, or choice label that points players
    toward clearing Mara before taking the map escape.
  - Re-run random, goal, coverage, and MCP true-ending checks.

## 2026-05-31 16:18 PT - Iteration 0003: Post-Ledger Choice Focus

### Current Plan

- Main objective: Improve natural true-ending discoverability without removing
  meaningful failure endings.
- Why this matters: Goal self-play proves the puzzle can be solved, but random
  self-play previously missed `true_ending` entirely in 250 runs. The biggest
  content lever is reducing misleading late-game choices after the player has
  already collected the correct evidence.
- Tasks:
  - Identify late-game branches that compete with the solved Mara/release route.
  - Hide the generic map escape after Mara is cleared.
  - Hide the "leave the ledger untouched" branch when the player is carrying
    Mara's badge.
  - Add regression tests for both choice-focus moments.
  - Re-run random, goal, coverage, health, and MCP playtests.
- Risks:
  - Over-focusing choices can make the game feel less interactive.
  - Random-play improvement may be small if the dominant issue is reaching the
    signal booth at all.

### Work Completed

- Changes made:
  - `ride_with_map` now requires the player not to have freed Mara, so the
    train car emphasizes the emergency release after the ledger is resolved.
  - `leave_ledger` now requires not carrying Mara's badge, so the signal booth
    focuses the player on clearing her name when they have the proof.
  - Added tests for the signal-booth and train-car focused-choice states.
  - Updated README highlights with the new random-discovery result.
- Files/systems touched:
  - `stories/demo.yaml`
  - `tests/story-paths.test.ts`
  - `README.md`
- New content/features added:
  - No new scenes; this was a late-game affordance and pacing pass.

### Playtest Notes

- What was tested:
  - `npm run health`
  - CLI random playtest: 250 runs, 80-step cap
  - CLI random playtest: 1000 runs, 80-step cap
  - CLI goal playtest: 10 runs, 40-step cap
  - MCP `run_playtest` for both `goal` and `random`
- Quantitative metrics:
  - Health gate:
    - Formatting: pass
    - TypeScript: pass
    - Tests: 4 files, 14 tests passing
    - Validation: 22 scenes, 5 endings, 22 reachable scenes
    - Coverage self-play: all scenes visited, best score 100/100
  - Random self-play, 250 runs:
    - Ended: 250/250
    - True ending reached: 1/250
    - Best score: 90/100
    - Average score: 35.44/100
    - Max-score runs: 0
    - Unvisited scenes: none
  - Random self-play, 1000 runs:
    - Ended: 1000/1000
    - True ending reached: 5/1000
    - Best score: 100/100
    - Max-score runs: 3/1000
  - Goal self-play, 10 runs:
    - Ended: 10/10
    - True ending reached: 10/10
    - Average score: 100/100
    - Max-score runs: 10/10
- What worked:
  - The random strategy now reaches every scene in 250 runs instead of missing
    `true_ending`.
  - Goal strategy remains stable at 10/10 max-score true endings.
  - The focused-choice changes are narratively defensible: if the player holds
    Mara's badge at the ledger, clearing her name is the natural action; if Mara
    is freed, the emergency release is the climax.
- What felt bad/confusing:
  - Random max-score reliability is still extremely low: 3/1000.
  - The average random score barely moved, implying early/midgame route
    discovery needs more help than late-game focus alone can provide.
- Bugs found:
  - A first version of the signal-booth regression test attempted to use the
    token slot before installing the fuse. The test path was corrected.

### Evaluation

- The iteration is a net win but not enough. It improved scene discovery and
  allowed random play to hit `true_ending`, but it did not materially improve
  average score.
- Current success criteria status:
  - Reliable maximum score in self-play: achieved for goal strategy; random is
    still very weak.
  - Unlimited depth: not achieved yet.
  - Critical bugs: none found after the corrected health gate.
  - Self-documentation: three persistent feedback entries.
  - AFK loop robustness: MCP can run the measured strategies.

### Next Iteration

- Highest-priority next task: Add objective-aware transcript analysis or a
  guided random strategy that uses visible objectives rather than story-specific
  choice-id keywords.
- Reason: Late-game affordances helped only slightly. The maintainer needs a
  more general way to evaluate whether visible objectives guide play.
- Planned action:
  - Add a strategy that ranks choices by objective progress and score delta
    without hard-coded choice-id bonuses.
  - Compare it against random and goal.
  - Use the resulting transcripts to decide whether to revise clues or expand
    the map.

## 2026-06-03 - Save Validation Hardening

### Changes

- Added Zod validation for save-file structure before returning persisted game state.
- Added regression tests for valid save round trips, malformed JSON, and invalid state shape.
- Updated Vitest from 4.1.7 to 4.1.8 within the existing major line.
- Documented npm's `esbuild` install-script approval warning in the README setup notes.

### Playtest Notes

- What was tested:
  - `npm run health`
  - `npm run ai:cycle`
  - Manual CLI route from `entrance` to `true_ending`
- Quantitative metrics:
  - Tests: 14 files, 244 tests passing
  - Validation: 151 scenes, 29 endings, 151 reachable scenes
  - Coverage self-play: 78,343 effective runs, 0 unfinished, all scenes visited
  - Manual route: reached `true_ending` with score 306
- What worked:
  - Objective prompts narrowed cleanly as route requirements were satisfied.
  - The badge, personnel-file, clock, gate-control, and ledger clues strongly
    signposted the true-ending path.
  - Invalid CLI choice ids failed without corrupting the save.
- What felt bad/confusing:
  - CLI-only play remains easy to mistype because similar nearby actions use
    precise internal ids. This does not affect player-view choice indices, but
    it is developer-tool friction during manual smoke tests.
- Bugs found:
  - Save loading trusted raw JSON shape before this pass; malformed or invalid
    saves now fail with explicit save-file context.

### Evaluation

- The iteration is a narrow robustness win with no gameplay contract changes.
- Health, autonomous evidence generation, and a real playthrough are green.

### Next Iteration

- Consider a CLI convenience mode for choosing by visible numeric index when
  manually smoke-testing routes outside MCP/player-view tooling.

## 2026-06-06 - Repository Audit Stabilization

### Changes

- Hardened the CLI subprocess tests with explicit child-process and Vitest
  timeouts so `npm run health` does not depend on the default 5-second test
  budget on slower mounted filesystems.
- Ran one autonomous evidence cycle and recorded the resulting observation.

### Playtest Notes

- What was tested:
  - `npm run health`
  - `npm run ai:cycle`
  - Manual CLI route from `entrance` to `passenger_echoed_true_ending`
- Quantitative metrics:
  - Tests: 15 files, 275 tests passing
  - Validation: 155 scenes, 31 endings, 155 reachable scenes
  - Coverage self-play: 135,115 effective runs, 0 unfinished, all scenes visited
  - Manual route: reached `passenger_echoed_true_ending` with score 360
- What worked:
  - Objectives narrowed cleanly after collecting the lantern, token, map, fuse,
    badge, and ledger proof.
  - The notice, badge back, gate control, and ledger all fairly signposted the
    ideal passenger route.
  - The final passenger-echo route recovered cleanly after an optional
    confirmation beat.
- What felt bad/confusing:
  - `passengers_released` presents a very large choice list. The direct route is
    still findable, but the density briefly slows the late-game climax.
  - The label "Pull the release while the familiar echoes answer" led to a
    confirmation scene before the actual ending, which felt slightly more
    indirect than the wording implied.
- Bugs found:
  - `npm run health` could fail spuriously when `tests/cli.test.ts` subprocess
    cases exceeded Vitest's default timeout during the full chained gate.

### Evaluation

- Repository health and evidence generation are green after the CLI test
  stabilization.
- Gameplay remained playable through a real route to an ideal ending.

### Next Iteration

- Consider condensing or ranking the `passengers_released` choice surface so the
  direct emergency-release path stays visually prominent after the larger rescue
  opens.

## 2026-06-07 - Repository Audit Verification

### Changes

- Re-ran the repository audit from a clean `main` baseline and confirmed
  `origin/main` was already integrated.
- Verified dependencies with `npm ci` and `npm ls --all`; no required
  dependency or vulnerability issues were found.
- Ran the required autonomous evidence cycle and recorded the new cycle
  observation.

### Playtest Notes

- What was tested:
  - `npm run format`
  - `npm ci`
  - `npm run build`
  - `npm run lint`
  - `npm test`
  - `npm run health`
  - `npm run ai:cycle`
  - Manual MCP route from `entrance` to
    `passenger_conductor_transfer_true_ending`
- Quantitative metrics:
  - Tests: 15 files, 279 tests passing
  - Validation: 160 scenes, 31 endings, 160 reachable scenes
  - Coverage self-play: 172 effective runs, 0 unfinished, all scenes visited
  - AI cycle: true-ending rate 0.78, 0 unfinished runs, best score 399
  - Manual route: reached `passenger_conductor_transfer_true_ending` with score
    289 and no remaining objectives
- What worked:
  - The notice, clock, service-room, badge, gate-control, and manifest clues
    formed a readable chain to an ideal passenger ending.
  - Objectives narrowed correctly as route-critical items were collected.
  - The MCP route used only visible legal choices and ended without save or
    transcript errors.
- What felt bad/confusing:
  - Late passenger-route scenes are coherent but text-heavy; the route is
    playable, but the pacing slows once the manifest branches into individual
    passenger memories.
- Bugs found:
  - None during this audit pass.

### Evaluation

- Repository health is green after clean dependency installation, formatting,
  build, lint, tests, validation, coverage playtest, AI-cycle evidence, and a
  manual MCP route.

### Next Iteration

- Continue improving true-ending discoverability while keeping the passenger
  branch's late-game choice surface easy to scan.

## 2026-06-08 - Codex MCP Startup Recovery

### Changes

- Installed locked npm dependencies in the local checkout so `node --import tsx`
  can launch the TypeScript MCP server.
- Pinned the repo-local Codex MCP server `cwd` to
  `/home/micha/dev/zork-unlimited-3` instead of `.` so client startup resolves
  `tsx` and `src/mcp.ts` from the intended project root.

### Playtest Notes

- What was tested:
  - Direct stdio `initialize` and `tools/list` probe through
    `node --import tsx src/mcp.ts`
  - `npm run health`
  - `npm run ai:cycle`
  - Manual sequential MCP route using `start_game`, `get_scene`,
    `choose_option`, `get_score`, and `get_transcript`
- Quantitative metrics:
  - Tests: 15 files, 279 tests passing
  - Validation: 164 scenes, 31 endings, 164 reachable scenes
  - Coverage self-play: 176 effective runs, 0 unfinished, all scenes visited
  - AI cycle MCP route: reached `true_ending` with score 305
  - Manual MCP route: reached `true_ending` with score 305 and no remaining
    objectives
- What worked:
  - The patched config starts the MCP server from the same root as the passing
    repo-local stdio probe.
  - MCP tool discovery returned all expected tools, including `start_game`,
    `choose_option`, `get_score`, `get_transcript`, and `run_playtest`.
  - The Mara true-ending route stayed clear from notice to clock, service room,
    signal ledger, release, boarding, and final emergency handle.
- What felt bad/confusing:
  - Raw JSON-RPC `tools/call` messages sent as one pipe can be processed out of
    order by the server, so route probes should use the SDK client or another
    sequential caller.
- Bugs found:
  - Codex MCP startup was brittle when `cwd = "."` was not resolved to the repo
    root; pinning the absolute cwd removes that ambiguity for this checkout.

### Evaluation

- MCP startup and actual tool calls are green in this checkout after dependency
  installation and the config fix.

### Next Iteration

- Keep using SDK-backed MCP route probes for real playthrough evidence instead
  of raw batched stdio messages.

## 2026-06-08 - VP Pop-Quiz Loop Reminder

### Changes

- Added an audience-calibration section to the autonomous agent contract so loop
  agents treat each cycle like a pop quiz for a VP-level manager who is not
  tech-savvy.
- Added the same reminder to generated AI-loop feedback, including failure
  reports, so the instruction appears in fresh cycle reports and prompts.

### Playtest Notes

- What was tested:
  - `npm run health`
  - `npm run ai:cycle`
  - Generated prompt/report grep for the VP pop-quiz reminder
- Quantitative metrics:
  - Tests: 15 files, 279 tests passing
  - Validation: 164 scenes, 31 endings, 164 reachable scenes
  - Coverage self-play: 176 effective runs, 0 unfinished, all scenes visited
  - AI cycle MCP route: reached `true_ending` with score 305
- What worked:
  - The generated prompt now includes both the durable audience reminder and the
    per-cycle feedback reminder.
  - The reminder asks agents to lead with player/operator impact, proof, and the
    next trusted decision.
- What felt bad/confusing:
  - None during this prompt-only pass.
- Bugs found:
  - None.

### Evaluation

- The loop is now explicitly reminded to produce non-technical, VP-readable
  handoffs without weakening its internal technical rigor.

### Next Iteration

- Keep future loop summaries short enough for a non-technical operator to scan
  while still naming the evidence that proves the change.

## 2026-06-08 - Staged Orchestrator Monitor

### Changes

- Added `npm run orchestrator:watch`, a read-only monitor for the AFK
  development and blind-playtest wrappers.
- Encoded the requested staged cadence: every 60 seconds for the first 5
  minutes, every 5 minutes for the next 30 minutes, every 15 minutes until the
  60-minute checkpoint, then hourly through 24 hours.
- Added anomaly checks for wrapper death, missing cycle artifacts after launch,
  stale artifacts, repeated push failures, auth failures, MCP play failures, and
  dirty-baseline refusals.

### Playtest Notes

- What was tested:
  - `npm run lint`
  - `npm test -- tests/orchestrator-watch.test.ts`
  - `npm run orchestrator:watch -- --once`
  - `npm run health`
- Quantitative metrics:
  - Tests: 16 files, 283 tests passing
  - Validation: 164 scenes, 31 endings, 164 reachable scenes
  - Coverage self-play: 176 effective runs, 0 unfinished, all scenes visited
- What worked:
  - The monitor reported dead main and blind wrapper PIDs as a hard anomaly in a
    single VP-readable status line.
  - A detached `setsid` launch survived the shell tool where the plain `nohup`
    PID did not, so relaunches should use `setsid`.
- What felt bad/confusing:
  - Plain background `nohup ... &` looked launched but the stored wrapper PID
    died immediately in this environment.
- Bugs found:
  - The orchestrator previously had no reusable way to enforce the requested
    staged monitoring cadence or detect wrapper death.

### Evaluation

- The AFK run now has a reusable monitor command that matches the requested
  operations cadence and gives a clear signal when the loop should be paused
  and fixed.

### Next Iteration

- Relaunch the loops with the detached `setsid` pattern, then restart monitoring
  from the 60-second cadence.

## 2026-06-08 - Noninteractive Codex Launch Correction

### Changes

- Corrected the default `loop.sh` Codex command so `--ask-for-approval never`
  is passed as a top-level Codex flag before `exec`.
- Kept `--search` enabled in the default nested Codex command so loop agents can
  use current web context when their tasks warrant it.
- Extended `orchestrator:watch` to flag failed AI agent commands and failed
  post-agent automation as hard anomalies.

### Playtest Notes

- What was tested:
  - `codex --search --ask-for-approval never exec --help`
  - `npm test -- tests/orchestrator-watch.test.ts`
  - `npm run health`
- Quantitative metrics:
  - Tests: 16 files, 285 tests passing
  - Validation: 164 scenes, 31 endings, 164 reachable scenes
  - Coverage self-play: 176 effective runs, 0 unfinished, all scenes visited
- What worked:
  - The corrected Codex command parses successfully.
  - The monitor now catches `AI agent command failed` log lines as hard
    anomalies.
- What felt bad/confusing:
  - The earlier launch put `--ask-for-approval` after `exec`, which Codex
    rejected as an unexpected exec argument.
- Bugs found:
  - The monitor did not initially classify agent command failures as hard
    anomalies.

### Evaluation

- The loop launch command now matches noninteractive Codex flag placement and
  the monitor can catch the same failure if it recurs.

### Next Iteration

- Relaunch from a clean tree and restart the staged monitoring schedule.

## 2026-06-08 - Observation-Backed Monitor Recovery

### Changes

- Extended `orchestrator:watch` to parse the latest
  `ai-loop-observations/cycles.jsonl` row and flag `mcpRoute.ok: false` or
  `postAgentStatus: failed` as hard anomalies.
- Took ownership of the interrupted loop's dirty cycle output after the MCP
  route anomaly, verified it locally, and prepared it for a normal commit.

### Playtest Notes

- What was tested:
  - `npm test -- tests/orchestrator-watch.test.ts`
  - `npm run health`
  - Direct SDK-backed MCP route to `true_ending`
  - CLI route through `mara_last_dispatch_receipt`
- Quantitative metrics:
  - Tests: 16 files, 287 tests passing
  - Validation: 166 scenes, 31 endings, 166 reachable scenes
  - Coverage self-play: 178 effective runs, 0 unfinished, all scenes visited
  - Direct MCP route: reached `true_ending` with score 305
  - Dispatch receipt route: reached `mara_last_dispatch_true_ending` with score
    294 and `confirmed_last_dispatch_receipt`
- What worked:
  - The monitor now catches hard failures that are only visible in cycle
    observation rows.
  - The recovered story beat gives Mara's final dispatch a small receipt proof
    before release without removing the direct release route.
- What felt bad/confusing:
  - The previous monitor checked logs and wrapper state but missed an
    observation-only MCP failure.
- Bugs found:
  - Observation-backed MCP route failures were invisible to the monitor.

### Evaluation

- The monitor now covers process health, artifact freshness, log failures, and
  latest observation failures.

### Next Iteration

- Commit the recovered changes, relaunch from a clean tree, and restart the
  staged monitor schedule again.
