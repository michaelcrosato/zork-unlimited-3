# Improvement Log

Persistent self-feedback for the autonomous maintainer loop. Each entry records
what was tested, quantitative metrics, qualitative observations, and the next
highest-leverage improvement target.

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
