# Cycle 27 Lit Escape Token Recovery

- Date: 2026-06-03
- Main objective: Make the lit-platform escape warning actively guide wavering
  players back to the missing signal token.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 27 evidence shows the adaptive exploratory route reached
  `escape_ending` after lighting Platform 13 but before fetching the clock
  token. The warning prose mentioned unfinished work, yet the player-view state
  had no objective, making escape feel like an equally guided next step.
- Planned work:
  - Set the token-location flag when players flee the lit platform without the
    signal token so the existing clock-token objective appears immediately.
  - Revise the lit escape warning to name the stopped clock as the missing
    piece.
  - Route the return choice through the service room so the existing
    `go_to_stopped_clock` recovery affordance carries the player to the token
    without adding a new clock branch.
  - Preserve the escape ending and the optional listen/look-back beats.
  - Add focused regression assertions for the objective, label, and recovery
    route.
  - Run focused tests, full health, and an actual playable route through the
    revised recovery path.
- Risks:
  - Routing through the service room is still a stronger nudge than returning
    to the lit platform; keep the confirmed escape choice visible so the ending
    remains an intentional opt-out.
  - Coverage performance is sensitive to new recovery branches, so preserve
    existing clock choice conditions.
- Status:
  - Completed.
  - Revised `lit_platform` prose so leaving before the token reads as leaving
    the signal-booth question unanswered.
  - Renamed the lit-platform escape choice to "Leave before finding the
    stopped-clock token."
  - Set `knows_token_location` when players choose that escape path, causing
    the existing "Search the stopped tunnel clock..." objective to appear on
    `escape_warning`.
  - Revised `escape_warning` to name the stopped clock and frame escape as
    refusing a known next step.
  - Routed the recovery choice to the service room with a label pointing toward
    the stopped clock, preserving the existing `go_to_stopped_clock` recovery
    route.
  - Added focused regression assertions for the new prose, choice labels,
    objective surfacing, and service-room recovery route.
  - Raised the long-running coverage-discovery test timeout from 60s to 90s
    after the unchanged assertions crossed 60s under full-suite load while the
    direct coverage command completed successfully.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "stopped clock|escape|gate-control fuse"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation still reports 151 reachable scenes and 29 endings.
  - Coverage playtest still visits all scenes with zero unvisited scenes and
    zero unfinished runs.
- Playtest feedback:
  - Actual CLI play followed the revised branch through `flee_platform`,
    `return_to_lit_platform_from_escape_warning`, and `go_to_stopped_clock`,
    recovered the token, returned to the lit platform, cleared Mara, and
    reached `true_ending` with score 268.
  - The warning now gives wavering players a visible objective instead of
    presenting escape with no goal pressure.
  - The route after taking the token uses the generic tunnel/service-room
    return before `return_to_lit_platform`; it is playable, but slightly less
    smooth than a dedicated return-to-lit-platform token pickup.
- Next step:
  - Watch blind sessions for whether lit-platform escape drops. If players
    still bounce after the token objective appears, consider a low-cost
    dedicated clock return only if coverage performance can be kept under the
    health timeout.

# Cycle 26 Ledger Decision Clarity

- Date: 2026-06-03
- Main objective: Make the late-game signal ledger decision clearly distinguish
  the direct Mara release route from the larger kept-passenger manifest rescue.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 26 evidence shows health and coverage are green but the
  adaptive exploratory route can still stall around late-game hub returns. The
  signal ledger is the key decision hub before the finish; its previous
  objective pushed players toward checking the manifest without equally
  validating the direct emergency-release route.
- Planned work:
  - Revise the signal-ledger objective to present both choices as intentional:
    clear Mara now or open the manifest first.
  - Add player-facing ledger prose that explains clearing only Mara leads
    straight to the third-car release, while the manifest route is a larger
    rescue.
  - Rename the direct and manifest ledger choices to make their consequences
    easier to compare.
  - Preserve routing, flags, scoring, scene count, and ending count.
  - Add focused regression assertions for the new signposting.
  - Run focused tests, full health, and a playable route through the clarified
    direct decision.
- Risks:
  - Overexplaining the ledger can flatten the moral tension; keep the wording
    concise and framed as consequence rather than instruction.
  - Because choice labels changed, exact-label tests need to be updated without
    weakening route coverage.
- Status:
  - Completed.
  - Revised the signal-ledger objective to frame the decision as either
    clearing Mara now or opening the kept-passenger manifest first.
  - Added ledger prose that states the direct Mara route leads to the third-car
    release while the manifest route expands the rescue.
  - Renamed the direct and manifest ledger choices so their consequences are
    visible before the player commits.
  - Added regression assertions for the new objective, ledger prose, and
    choice labels.
  - `npm run health` passed with these changes included: format check,
    TypeScript, 238 tests, validation, and coverage playtest.
  - Validation still reports 151 reachable scenes and 29 endings.
  - Coverage playtest still visits all scenes with zero unvisited scenes and
    zero unfinished runs.
- Playtest feedback:
  - Actual CLI play used the clarified direct ledger choice
    `mark_mara_clear_from_ledger`, then reached the train car and
    `true_ending` with score 267 and no objectives.
  - The direct choice now reads as a valid finish route rather than a shortcut
    that ignores the manifest.
  - The manifest route remains visible as the larger-rescue option before the
    player commits.
- Next step:
  - Watch blind sessions for whether goal-seeking players still feel pushed
    into the manifest path when they intended to finish Mara's core route.

# Cycle 26 Train-Car Release Focus

- Date: 2026-06-03
- Main objective: Make the late train-car objective resolve more directly after
  Mara is cleared.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 26 evidence shows health and coverage are green while the
  adaptive exploratory route stalled before a true ending. After `freed_mara`,
  the objective correctly says to pull the emergency release, but the direct
  train-car choice list presented several optional Mara beats before the
  release. A small ordering and label change should reduce late-game hesitation
  without removing story-rich optional routes.
- Planned work:
  - Revise `train_car` prose so the emergency release reads as the immediate
    way out while preserving the optional final-dispatch contrast.
  - Move the direct `pull_release` choice ahead of optional non-manifest
    intercom and handoff beats.
  - Rename the visible direct release label to "Pull the emergency release now"
    while preserving the choice id and ending route.
  - Add focused regression assertions for the new prose, label, and choice
    ordering.
  - Run focused tests, full health, and an actual playable route through the
    changed beat.
- Risks:
  - Putting the release first may reduce discovery of optional Mara goodbye
    variants; those choices remain visible immediately below the release.
  - Text/order changes should not affect reachability, scene count, ending
    count, or scoring, but exact choice-order tests need careful updates.
- Status:
  - Completed.
  - Revised `train_car` prose so the release is explicitly "the way out now"
    while preserving the optional final-dispatch and handoff choices.
  - Moved the direct `pull_release` choice ahead of optional non-manifest
    intercom and handoff beats whenever Mara has been cleared.
  - Renamed the visible direct release label to "Pull the emergency release
    now" while preserving the `pull_release` id and `true_ending` route.
  - Updated focused regression assertions for the new prose, label, and choice
    ordering across the direct, badge-proof, and handoff variants.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "train-car|emergency release after clearing Mara|Mara reaches the far door"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation still reports 151 reachable scenes and 29 endings.
  - Coverage playtest still visits all scenes with zero unvisited scenes and
    zero unfinished runs.
- Playtest feedback:
  - Actual CLI play followed the clarified direct route through
    `board_after_clearing_mara` to `train_car`; the first visible choice was
    `pull_release` with label "Pull the emergency release now".
  - The active objective still read "Pull the emergency release in the third
    car.", so the objective and first choice now reinforce each other.
  - Pulling the release ended at `true_ending` with score 267 and no
    objectives.
  - Optional Mara beats remain visible immediately below the release, so
    story-depth routes are preserved for players who want them.
- Next step:
  - Watch adaptive and blind-play logs for whether late-game stalls decrease.
    If players still loop at the train car, consider adding a transient
    player-view hint after one optional goodbye rather than adding another
    branch.

# Cycle 25 Last Dispatch Prompt Clarity

- Date: 2026-06-03
- Main objective: Make Mara's optional last-dispatch route more visible at the
  late-game release decision.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 25 evidence shows the game is healthy enough to invest in
  route depth and polish. The last-dispatch route is important to Mara's story
  but comparatively rare in broad playtest distribution, so the best small
  improvement is to make the route read as a concrete final-signoff choice
  rather than another generic intercom aside.
- Planned work:
  - Revise `mara_released` so the available paths clearly include Mara signing
    off with a final dispatch before boarding.
  - Revise `train_car` so players who board directly still see the last
    dispatch as an intentional final beat before pulling the release.
  - Rename the two visible last-dispatch choice labels to use consistent
    "final dispatch" language.
  - Preserve all routing, flags, scoring, scene count, and ending count.
  - Add focused regression assertions for the clarified prose and labels.
  - Run focused tests, full health, and a playable route through the changed
    beat.
- Risks:
  - Over-emphasizing the optional dispatch could make it feel mandatory; keep
    the immediate release choice available and unchanged.
  - Text-only changes should not affect reachability, but exact-label
    assertions need to match the revised prompts.
- Status:
  - Completed.
  - Revised `mara_released` so Mara's post-ledger options explicitly include
    signing off with one final dispatch before boarding.
  - Revised `train_car` so direct boarders see that Mara can still make one
    last dispatch before the release.
  - Renamed the two last-dispatch prompts to consistent "final dispatch"
    language:
    "Ask Mara for her final dispatch before boarding" and
    "Ask Mara for her final dispatch before pulling."
  - Added focused regression assertions for the new visible prose and labels
    while preserving all choice ids and route behavior.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "last dispatch|emergency release after clearing Mara"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation still reports 151 reachable scenes and 29 endings.
  - Coverage playtest still visits all scenes with zero unvisited scenes and
    zero unfinished runs.
- Playtest feedback:
  - Actual CLI play followed the clarified route through
    `ask_mara_for_last_dispatch -> carry_last_dispatch_into_car ->
pull_release_after_last_dispatch_goodbye` and ended at
    `mara_last_dispatch_true_ending` with score 320 and no objectives.
  - The `mara_released` prompt now makes the last-dispatch option feel like a
    concrete final signoff rather than a generic conversation branch.
  - The immediate release and handoff alternatives remain visible, so the
    optional beat does not block players who want to finish directly.
- Next step:
  - Watch blind feedback and route distribution for whether final-dispatch
    discovery improves. If the route remains rare, consider adding objective
    wording only after confirming players are missing the option, not choosing
    against it.

# Cycle 25 Gate Control Readability

- Date: 2026-06-03
- Main objective: Make the safe gate-control inspection path more obvious
  before players force the Platform 13 gate.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 25 supplied evidence shows health, coverage, and ideal
  ending rates are strong. The adaptive exploratory MCP route reached
  `bad_ending` after forcing the gate, even though it had seen the radio clue
  and platform. That failure is valid, but the non-destructive gate inspection
  currently reads too much like generic set dressing on the platform screen.
  A small readability pass can steer curious players toward the CLOCK = TOKEN
  clue before they choose the noisy forced-gate path.
- Planned work:
  - Revise the first Platform 13 text so the gate control's burned access
    plate visibly promises instructions, not just a blocked socket.
  - Rename the inspection choice to clearly contrast reading the control with
    forcing the gate.
  - Preserve all routing, flags, scoring, scene count, and ending count.
  - Add focused regression assertions for the clarified affordance.
  - Run focused tests, full health, and a playable route that uses the
    clarified inspection path.
- Risks:
  - Over-signposting could make the bad-ending branch feel toothless; keep the
    destructive force option visible and preserve its final warning sequence.
  - Text-only clarity changes should not affect reachability, but choice-label
    assertions need to be updated carefully.
- Status:
  - Completed.
  - Revised the first Platform 13 scene so the gate control's loose burned
    access plate advertises readable instructions before the player makes
    noise.
  - Renamed the safe inspection choice to "Read the gate control before
    forcing anything" while preserving the destructive forced-gate option.
  - Added regression assertions for the clarified platform prose and choice
    label on both normal platform arrival and forced-gate warning setup.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "forced-gate|platform explorers"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation still reports 151 reachable scenes and 29 endings.
  - Coverage playtest still visits all scenes with zero unvisited scenes and
    zero unfinished runs.
- Playtest feedback:
  - Actual CLI play followed `take_lantern -> follow_arrows ->
inspect_gate_control`, and the gate-control scene immediately exposed
    "CLOCK = TOKEN" with objectives for the map, stopped-clock token, and
    platform power.
  - Continued the same save through token recovery, map, radio, locker, fuse,
    signal booth, ledger, and release; it ended at `true_ending` with score
    281 and no objectives.
  - The clarified wording made the non-destructive branch feel like an
    intended read action rather than optional scenery. The bad-ending route
    remains available for players who still choose to force the gate.
- Next step:
  - Watch blind-play sessions for whether players still force the gate before
    reading the control. If they do, consider moving the clock clue into the
    platform objective text rather than adding another scene.

# Cycle 24 Core True Ending Payoff

- Date: 2026-06-03
- Main objective: Strengthen the central `true_ending` payoff without adding
  new branches or changing route balance.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 24 evidence shows health, coverage, and MCP
  playthroughs are already green. Random play reaches ideal endings at a
  healthy rate, with `true_ending` still one of the most common and important
  Mara outcomes. The current central ending was brief compared with the route's
  accumulated map, token, badge, ledger, and release setup, so richer ending
  prose is the highest-impact low-risk improvement.
- Planned work:
  - Expand the `true_ending` text to pay off the gathered tools, the signal
    ledger release, and Mara's voice going quiet by choice.
  - Preserve all routing, ending metadata, scoring, and branch distribution.
  - Add a focused regression assertion for the new central-ending imagery.
  - Run focused tests, full health, and an actual playable route through the
    central ending.
- Risks:
  - Text-only changes can still weaken pacing if they over-explain the ending;
    keep the added prose concise and sensory.
  - Because this change does not alter routing, the current 151-scene,
    29-ending graph from the adjacent lit warned-escape work should remain
    fully reachable.
- Status:
  - Completed.
  - Expanded the central `true_ending` so the release now pays off passengers
    leaving the tunnel's cold, the token going quiet, the map steadying, Mara's
    badge becoming resting proof, and the line falling silent.
  - Added regression assertions to the critical true-ending path for the new
    final imagery.
  - Preserved all core true-ending routing and metadata.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "can reach the true ending"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 151 reachable scenes and 29 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes.
- Playtest feedback:
  - Actual CLI play through the central Mara route ended at `true_ending` with
    score 278 and no objectives. The expanded ending reads as a stronger final
    release without adding a new decision or slowing the third-car scene.
  - Also replayed the adjacent lit-platform stairwell escape route; it ended at
    `warned_lit_escape_ending` with score 99 and no objectives, confirming the
    current graph's new escape split is playable.
- Next step:
  - Watch blind feedback for whether the longer `true_ending` feels satisfying
    or overwritten. If payoff is healthy, continue adding depth to high-traffic
    endings and avoid adding new branch fan-out.

# Cycle 24 Lit Warned Escape Payoff

- Date: 2026-06-03
- Main objective: Make the adaptive escape route acknowledge when a player has
  already restored Platform 13 before choosing to leave after Mara's final
  stairwell warning.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 24 evidence shows healthy core guidance: all
  scenes visited, zero unfinished random runs, and a 79% random ideal-ending
  rate. The adaptive exploratory route ended at `warned_escape_ending` after
  restoring platform power, but the existing ending text was generic and could
  read as if the lights were still unresolved. The best next improvement was a
  small story payoff on that proven route, not another hub branch.
- Planned work:
  - Split the stairwell abandonment choice by `platform_lit`.
  - Add a new `warned_lit_escape_ending` that names the restored lights, open
    access plate, badge proof, and still-missing stopped-clock token.
  - Preserve the original `warned_escape_ending` for unlit stairwell listeners.
  - Update focused story-path regressions for both branches.
  - Run focused tests, validation, random/coverage playtests, full health, and
    an actual CLI playthrough of the changed route.
- Risks:
  - Adding an escape ending changes validation stats and coverage run count.
  - Splitting the choice must not strand unlit players or remove their existing
    warned escape route.
- Status:
  - Completed.
  - Added `warned_lit_escape_ending` as an Early escape ending for players who
    restore Platform 13, listen to Mara at the stairwell, then leave without
    fetching the signal token.
  - Retargeted `mara_stairwell_call` so lit-platform players see
    `leave_lit_platform_after_stairwell_call`, while unlit players keep
    `leave_after_stairwell_call`.
  - Updated focused regressions covering the lit split and the preserved unlit
    warned escape route.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "fleeing players|unlit-platform explorers"`.
  - Validation passed with 151 reachable scenes and 29 endings.
  - Deterministic 100-run random playtest ended 100/100 runs, had zero
    unfinished runs, visited all scenes, and reached
    `warned_lit_escape_ending` once.
  - Coverage playtest ended 78225/78347 generated runs with zero unfinished
    runs, visited all scenes, and reached both `warned_lit_escape_ending` and
    `warned_escape_ending` seven times each.
- Playtest feedback:
  - Actual CLI play followed
    `take_lantern -> open_service_door -> search_locker -> take_fuse ->
take_badge -> close_locker -> go_to_platform -> install_fuse ->
flee_platform -> listen_at_stairwell ->
leave_lit_platform_after_stairwell_call` and ended at
    `warned_lit_escape_ending` with score 99 and no objectives.
  - The new ending reads more honestly for the adaptive route: the player did
    meaningful work, then abandoned one concrete remaining task rather than an
    abstract unfinished route.
  - No invalid choices, dangling objectives, unreachable scenes, or unfinished
    playtest runs appeared.
- Next step:
  - Watch blind feedback for whether early escape endings feel fair and
    consequence-rich; if recurring players treat escape as a success state,
    consider clearer ending metadata/report language before adding more escape
    variants.

# Cycle 23 Last Dispatch Ending Payoff

- Date: 2026-06-03
- Main objective: Give Mara's last-dispatch route its own ending payoff and
  sharpen the common third-car release beat without adding hub choices or
  increasing route complexity.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 23 evidence shows all scenes visited, zero
  unfinished random runs, healthy ideal-ending pressure, and a green actual
  MCP true-ending route. With core guidance healthy, the next highest-value
  improvement is richer story depth. The main-route last-dispatch beat asks
  the player to carry Mara's final dispatch into the third car, but the direct
  release previously ended on the generic `true_ending`, leaving that choice
  under-acknowledged.
- Planned work:
  - Add a dedicated `mara_last_dispatch_true_ending` ideal ending in the Mara
    Core family.
  - Retarget only `pull_release_after_last_dispatch_goodbye` to the new ending.
  - Enrich the shared `train_car` scene so the direct release route shows Mara
    holding the line as a human choice, not just a mechanical prompt.
  - Preserve handoff and badge-proof variants so their distinct payoff focus
    remains intact.
  - Update focused story-path and goal-playtest regressions for direct
    last-dispatch releases and the expanded ideal-ending set.
  - Run focused tests, full health, and actual CLI playthroughs through the
    direct release and new last-dispatch ending routes.
- Risks:
  - Adding an ending changes validation stats and random ending distribution,
    but it reuses an existing choice and does not add branch fan-out.
  - Tests that expected the generic ending on direct last-dispatch routes need
    to distinguish direct dispatch payoff from badge-proof and handoff payoffs.
- Status:
  - Completed.
  - Added `mara_last_dispatch_true_ending` as a Mara/Core ideal ending that
    pays off Mara's final dispatch language on the final screen.
  - Retargeted the direct `pull_release_after_last_dispatch_goodbye` route to
    the new ending.
  - Expanded the shared `train_car` text with Mara holding the line through the
    speaker and the release making HOME belong beyond the sign.
  - Preserved badge-proof follow-up routes to `true_ending` and physical
    handoff routes to `mara_handoff_true_ending`.
  - Updated focused last-dispatch story-path regressions and the goal-strategy
    test helper so `mara_last_dispatch_true_ending` counts as an ideal
    true-ending outcome.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "ask for Mara's last dispatch from the train car"`
    and
    `npm test -- tests/playtest.test.ts -t "goal strategy reliably reaches true endings"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 150 reachable scenes and 28 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and found
    `mara_last_dispatch_true_ending` 31 times.
- Playtest feedback:
  - Actual CLI play through the direct third-car route ended at `true_ending`
    with score 278 and no objectives; the revised `train_car` text read
    cleanly between clearing Mara's row and pulling the release.
  - Actual CLI play followed the route
    `ask_mara_for_last_dispatch -> carry_last_dispatch_into_car ->
pull_release_after_last_dispatch_goodbye` and ended at
    `mara_last_dispatch_true_ending` with score 293 and no objectives.
  - The ending now acknowledges the player's last-dispatch choice directly,
    repeating the route's dispatch cadence before Mara signs off.
  - The route felt clearer than the previous generic `true_ending` because the
    final text now closes the promise made by the optional main beat.
  - No invalid choices, dangling objectives, unreachable scenes, or health
    regressions appeared.
- Next step:
  - Watch blind/random samples for whether the new ending and third-car text
    meaningfully improve perceived payoff on Mara-focused routes; next content
    work should continue adding depth only where existing high-traffic choices
    feel under-acknowledged.

# Cycle 22 Opened Manifest Echo Visibility

- Date: 2026-06-03
- Main objective: Restore normal-play discovery for `opened_manifest_echoes`
  without undoing Cycle 21's opened-manifest newspaper shortcut payoff.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 22 evidence. Health, MCP
  validation, and coverage were green, but the 100-run random sample missed
  `opened_manifest_echoes` while still finding the newspaper and
  reviewed-count payoffs. Coverage proves the scene remains reachable; normal
  random play is simply more likely to take the direct payoff choices around
  it.
- Planned work:
  - Retarget the hub-level `follow_opened_manifest_echoes` choice through the
    `opened_manifest_echoes` scene instead of skipping directly to
    `passenger_newspaper_transfer`.
  - Preserve the existing local newspaper-fold choice from
    `opened_manifest_echoes` to the restored transfer column.
  - Preserve the direct explicit listening route and echoed-passenger boarding
    payoff.
  - Update focused story-path regressions.
  - Run focused tests, full health, and an actual playthrough through the
    retargeted route.
- Risks:
  - Adding one beat back into the newspaper shortcut may slightly reduce random
    completion of `passenger_newspaper_transfer`, but the payoff remains a
    visible first-level choice inside `opened_manifest_echoes`.
  - Hub choice ordering is unchanged, so this improves scene exposure without
    increasing branch count.
- Status:
  - Completed.
  - Retargeted `follow_opened_manifest_echoes` so the opened-manifest
    newspaper-fold shortcut now visits `opened_manifest_echoes` before moving
    into `passenger_newspaper_transfer`.
  - Added the `followed_opened_newspaper_fold` state marker so that this
    specific shortcut presents the transfer as the only next step, while the
    separate `listen_to_opened_manifest_echoes` route still preserves the
    flexible echo boarding, newspaper, and return choices.
  - Updated focused story-path regressions for the retargeted shortcut and the
    preserved explicit listen/echo payoff route.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest players|manifest margin notes|manifest-specific platform beat"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes.
  - Deterministic 100-run random playtest now visits both
    `opened_manifest_echoes` and `passenger_newspaper_transfer`, with zero
    unvisited scenes and three `passenger_newspaper_true_ending` outcomes.
- Playtest feedback:
  - Actual CLI play followed the retargeted opened-manifest newspaper-fold
    route, stopped at `opened_manifest_echoes`, continued through
    `passenger_newspaper_transfer`, and ended at
    `passenger_newspaper_true_ending` with score 299 and no objectives.
  - The route now reads as a better paced sensory beat: the player hears the
    opened passengers first, then follows the newspaper fold into the restored
    transfer payoff.
  - No invalid choices, dangling objectives, unreachable scenes, or health
    regressions appeared.
- Next step:
  - Watch the next random/blind samples for whether the one-step newspaper
    funnel reduces echoed-passenger route variety. If it does, tune local
    labels or route weighting before adding new branches.

# Cycle 21 Opened Manifest Shortcut Payoffs

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for
  `passenger_newspaper_transfer` and `passenger_reviewed_count_true_ending`
  from the opened-manifest release hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 21 evidence. Health, MCP
  validation, and coverage were green, but the 100-run random sample still
  missed `passenger_newspaper_transfer` and
  `passenger_reviewed_count_true_ending`. Coverage already proves those scenes
  are reachable; the problem is that normal random play had to select a
  high-traffic hub and then make another low-probability choice inside a
  choice-rich passenger scene.
- Planned work:
  - Retarget the existing parent-hub `follow_opened_manifest_echoes` choice so
    the newspaper fold in those echoes leads straight to the restored transfer
    column.
  - Retarget the existing parent-hub opened-count finish choice so it pays off
    the reviewed-count ending immediately after the manifest doors open.
  - Preserve the explicit listened-echo route and its echoed-passenger ending.
  - Preserve the unanswered-row counted intercom route after random testing
    showed that retargeting it shifted traffic away from counted-manifest
    content.
  - Update focused story-path regressions and run full health plus an actual
    playthrough.
- Risks:
  - Retargeting high-traffic choices could accidentally remove the echo payoff
    route if the local `opened_manifest_echoes` board choice is not preserved.
  - Direct reviewed-count endings must still require the manifest to be opened
    with Mara's badge proof; these choices remain downstream of that ledger
    action.
  - The change improves random discoverability by reusing choices, but it may
    shift a small amount of traffic away from generic answered/count branches.
- Status:
  - Completed.
  - Retargeted the parent-hub `follow_opened_manifest_echoes` choice to the
    restored newspaper transfer column, while preserving the local
    `opened_manifest_echoes` scene and its direct echoed-passenger boarding
    route through `listen_to_opened_manifest_echoes`.
  - Retargeted `let_opened_passengers_finish_count` so the opened-manifest hub
    can pay off `passenger_reviewed_count_true_ending` immediately after the
    manifest doors open.
  - Kept `board_with_unanswered_row_resolved` on the counted intercom route
    after random testing showed that retargeting it made counted-manifest
    content rarer in the deterministic 100-run sample.
  - Updated focused story-path regressions for the opened-manifest newspaper
    shortcut, reviewed-count shortcut, and preserved echoed-passenger boarding
    route.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "manifest margin notes|opened manifest players|opened-manifest count|reviewed count"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Final deterministic 100-run random playtest visited both target payoffs:
    `passenger_newspaper_transfer`, `passenger_newspaper_true_ending` x3, and
    `passenger_reviewed_count_true_ending` x2. The sample missed
    `opened_manifest_echoes`, but the explicit listen route remains intact and
    coverage/focused tests still exercise it.
  - Coverage playtest visited all scenes with zero unvisited scenes.
- Playtest feedback:
  - Actual CLI play followed the reviewed-count shortcut and ended at
    `passenger_reviewed_count_true_ending` with score 251 and no objectives.
  - Actual CLI play followed the new newspaper-fold shortcut and ended at
    `passenger_newspaper_true_ending` with score 298 and no objectives.
  - The route reads cleanly: the opened manifest now lets the player follow a
    concrete sensory cue, the newspaper fold, directly into the restored
    transfer-column payoff instead of requiring another low-probability
    passenger-scene choice.
  - The reviewed-count shortcut now appears in normal random play without
    sacrificing the unanswered-row counted intercom route.
- Next step:
  - Watch the next blind/random samples for whether `opened_manifest_echoes`
    becomes a repeated miss after the shortcut split, and for any newly rare
    counted-manifest routes. If they regress, tune choice labels/order before
    adding new branches.

# Cycle 20 Reviewed Count Echo Bridge

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for the opened-manifest echo,
  newspaper transfer, and reviewed-count payoff routes from the reviewed
  opened-manifest count hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 20 evidence. Health and
  coverage were green, but the 100-run random sample still missed
  `opened_manifest_echoes`, `passenger_newspaper_transfer`, and
  `passenger_reviewed_count_true_ending`. These routes already work in
  coverage; the likely issue is that normal random play must pass through
  several choice-rich hubs before seeing them.
- Planned work:
  - Retarget the existing opened-manifest echo carry choice through
    `opened_manifest_echoes` before boarding.
  - Retarget the existing reviewed-count boarding choice directly into
    `passenger_reviewed_count_true_ending`.
  - Preserve existing count, newspaper, conductor, echo-boarding, and intercom
    routes without adding more high-traffic hub branches.
  - Extend focused story-path regressions for the retargeted routes.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new reviewed-count payoff route.
- Risks:
  - The first implementation added extra choices and pushed the coverage test
    past its timeout; this version must stay branch-neutral.
  - The reviewed-count release should not bypass required manifest/Mara proof
    because the scene is only reachable after opening the manifest with the
    badge.
  - The echo retarget must still allow the established echoed-passenger ending
    after one additional explicit boarding choice.
- Status:
  - Completed.
  - Retargeted `follow_opened_manifest_echoes` so the existing carry choice now
    passes through `opened_manifest_echoes` before the player boards with the
    familiar passenger sounds.
  - Retargeted `board_after_manifest_count` so the reviewed-count hub can pay
    off `passenger_reviewed_count_true_ending` directly with a clearer release
    label.
  - Preserved existing echoed passenger boarding by making it the explicit next
    choice from `opened_manifest_echoes`.
  - Preserved existing newspaper transfer discovery from
    `opened_manifest_echoes`.
  - The first attempted implementation added branches and caused
    `npm run health` to fail on the 60s coverage-test timeout; the final
    implementation is branch-neutral and health passed.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "opened-manifest count"`,
    `npm test -- tests/story-paths.test.ts -t "passenger echo payoff"`,
    `npm test -- tests/story-paths.test.ts -t "manifest margin notes"`, and
    `npm test -- tests/story-paths.test.ts -t "direct release after reviewing"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `opened_manifest_echoes`, `passenger_newspaper_transfer`, and
    `passenger_reviewed_count_true_ending`.
  - Actual CLI play followed the reviewed-count release route, ended at
    `passenger_reviewed_count_true_ending`, scored 259, and left no
    objectives.
- Playtest feedback:
  - The reviewed-count route now reads as a clean immediate payoff: after Mara
    checks the opened manifest, pulling the release while the count still holds
    lands directly on the ending promised by the choice label.
  - The opened-echo route now gives the echo scene more room to breathe before
    boarding, and the newspaper transfer option remains visible from that
    scene.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch the next random/blind samples for whether
    `opened_manifest_echoes`, `passenger_newspaper_transfer`, and
    `passenger_reviewed_count_true_ending` stop appearing as normal-play
    misses. If they remain rare, tune high-traffic hub ordering or labels
    before adding any new branches.

# Cycle 19 Counted Conductor Bridges

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for
  `passenger_conductor_count_true_ending` from reviewed opened-manifest count
  play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 19 evidence. Health was green
  and coverage reached every scene, but the 100-run random sample still missed
  `passenger_conductor_count_true_ending`. The route already works, but it is
  mostly found after reviewing the manifest count, asking the conductor for a
  signal, then selecting the counted signal. A normal player who has already
  centered the count should be able to hear the conductor read that count clear
  directly.
- Planned work:
  - Add a direct conductor-count roll-call bridge from
    `passenger_manifest_count`.
  - Add a matching bridge from `passenger_missing_count` after checking the
    blank row.
  - Preserve the existing conductor-signal route and counted intercom exits.
  - Extend regressions for both bridges through
    `passenger_conductor_count_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new reviewed-count conductor route.
- Risks:
  - `passenger_manifest_count` is already choice-rich, so the new bridge must
    be a clear payoff rather than another vague passenger-gathering option.
  - The direct route sets final-roll-call flags immediately, so it must not
    accidentally expose duplicate roll-call choices.
  - The longer conductor-signal branch still needs to remain valid for players
    who want the extra signal scene.
- Status:
  - Completed.
  - Added `hear_conductor_count_after_manifest_count`, a direct optional bridge
    from reviewed opened-manifest count to
    `passenger_conductor_count_roll_call`.
  - Added `hear_conductor_clear_unanswered_count`, a matching bridge from the
    blank-row count beat to the counted conductor roll call.
  - Both bridges set the same conductor/count payoff flags used by the
    established route: passenger answers heard, passengers gathered, conductor
    clearance, and final roll call.
  - Preserved the existing `passenger_conductor_signal` route for players who
    choose the longer signal beat.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "opened-manifest count"` and
    `npm test -- tests/story-paths.test.ts -t "unanswered-row"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `passenger_conductor_count_roll_call` and
    `passenger_conductor_count_true_ending`.
  - Actual CLI play followed the new reviewed-count conductor bridge, ended at
    `passenger_conductor_count_true_ending`, scored 301, and left no
    objectives.
- Playtest feedback:
  - The route now reads with less mechanical friction: after reviewing Mara's
    opened count, the player can let the conductor read that exact count clear
    instead of routing through a separate signal scene first.
  - The blank-row bridge also fits because the conductor is already named in
    the row-resolution text, so asking him to clear the unanswered space feels
    like a payoff rather than a detour.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind samples for whether
    `passenger_conductor_count_true_ending` appears more often. If it remains
    rare, tune the high-traffic opened-manifest hub ordering instead of adding
    another ending.

# Cycle 18 Newspaper Roll Call Bridges

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for the
  `passenger_newspaper_roll_call` payoff from high-traffic opened-manifest
  passenger routes.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 18 evidence. Health was green
  and coverage reached every scene, but the 100-run random sample still missed
  `opened_manifest_echoes` and `passenger_newspaper_roll_call`. The newspaper
  roll call is a strong accountability beat and should be reachable from
  natural answered-passenger checking and reviewed manifest counting, not only
  from the narrower newspaper branch.
- Planned work:
  - Add a direct optional bridge from `passenger_answered_check` to
    `passenger_newspaper_roll_call`.
  - Add a direct optional bridge from `passenger_manifest_count` to the
    existing newspaper transfer route.
  - Preserve the existing checked-answer intercom and direct release endings.
  - Verify both bridges set the same route-state flags as the established
    newspaper routes.
  - Run focused regressions, full health, and actual CLI playthroughs through
    the new routes.
- Risks:
  - The checked-answer scene already has two clear exits, so the new choice
    must remain optional and avoid duplicating after a final roll call.
  - The reviewed-count scene is already choice-rich, so the new newspaper
    follow-up must stay concrete and not bury the core count/conductor exits.
  - The bridge must not make the newspaper path feel disconnected from its
    transfer-column fiction.
- Status:
  - Completed.
  - Added `follow_newspaper_transfer_after_manifest_count`, allowing players
    who review Mara's opened count to follow the newspaper stop into the
    established transfer and final roll-call path.
  - Added `read_checked_answers_into_newspaper_roll_call`, gated by
    `notFlag: heard_final_roll_call`.
  - Extended manifest-count and answered-passenger regressions to prove the
    new choices reach `passenger_newspaper_roll_call`, set newspaper/roll-call
    flags, and still allow the existing non-newspaper endings.
  - Focused answered-passenger regression passed:
    `npm test -- tests/story-paths.test.ts -t "answered passengers"`.
  - Focused opened-manifest count regression passed:
    `npm test -- tests/story-paths.test.ts -t "opened-manifest count"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `opened_manifest_echoes` and `passenger_newspaper_roll_call`.
  - Actual CLI play followed the reviewed-count newspaper transfer route,
    ended at `passenger_newspaper_true_ending`, scored 299, and left no
    objectives.
  - Actual CLI play followed the new checked-answer roll-call route, ended at
    `passenger_newspaper_true_ending`, scored 313, and left no objectives.
- Playtest feedback:
  - The route reads coherently because `passenger_answered_check` already
    names the child, newspaper woman, and old conductor before offering the
    newspaper transfer roll call.
  - The reviewed-count bridge feels natural because the count text already
    names the newspaper, lunch tin, mitten, and conductor's punch.
  - The new choice gives players who check answered names a richer passenger
    accountability payoff without removing the shorter checked-answer release.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random samples for whether `passenger_newspaper_roll_call`
    appears more often. If `opened_manifest_echoes` remains a random miss,
    tune high-traffic opened-manifest choice order rather than adding another
    branch.

# Cycle 17 Opened Echo Check Continuity

- Date: 2026-06-03
- Main objective: Improve normal-play discovery and continuity for the opened
  manifest echo-check route from both listened echoes and answered manifest
  play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 17 evidence. Health is green
  and coverage reaches every scene, but random play still missed
  `opened_manifest_echoes` and `passenger_echoed_check` in the 100-run sample.
  The remaining weaknesses were a return-path gap after listening to opened
  echoes and a label/behavior mismatch where an answered-manifest "check"
  choice still routed through a boarding prelude.
- Planned work:
  - Add a post-listen boarding choice from `passengers_released` into the
    existing echoed boarding/check route.
  - Keep the first-visit opened-manifest hub order stable.
  - Sharpen the answered-manifest echo-check bridge so its label lands directly
    on the passenger check payoff.
  - Extend focused regressions for both routes.
  - Run full health and an actual CLI playthrough through the new return path.
- Risks:
  - The opened-manifest hub is choice-rich, so the new choice must only appear
    after the player has already listened to echoes and returned.
  - The direct answered-manifest check bridge must still preserve the existing
    echoed ending and avoid reopening a redundant boarding step.
- Status:
  - Completed.
  - Added `board_after_listening_opened_manifest_echoes`, gated by
    `heard_passenger_echoes` and `notFlag: echoed_manifest_boarded`, so
    listen-return players can still board via the echoed passenger route.
  - Updated the opened-manifest listen regression to prove the return path
    reaches `passenger_echoed_boarding`, `passenger_echoed_check`, and
    `passenger_echoed_true_ending`.
  - Updated the answered-manifest echo-check bridge to go directly to
    `passenger_echoed_check` and mark `checked_echoed_passengers`.
  - Focused regressions passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest players listen"`
    and
    `npm test -- tests/story-paths.test.ts -t "opened manifest names answer"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `opened_manifest_echoes`, `passenger_echoed_boarding`,
    `passenger_echoed_check`, and `passenger_echoed_manifest_intercom`.
  - Actual CLI play followed the new opened-echo listen-return-board route,
    ended at `passenger_echoed_true_ending`, scored 291, and left no
    objectives.
  - Actual CLI play also followed the direct answered-manifest check route,
    ended at `passenger_echoed_true_ending`, scored 291, and left no
    objectives.
- Playtest feedback:
  - The listened-echo return route now preserves player intent: backing out of
    the listen beat no longer hides the echoed boarding/check payoff.
  - The answered-manifest check route now honors its label immediately by
    showing the thermos, newspaper, and mitten accountability beat before the
    release.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random samples for whether `passenger_echoed_check` appears
    more often. If the random miss persists, tune high-traffic passenger hub
    choice ordering rather than adding another echoed ending.

# Cycle 16 Opened Echo Newspaper Transfer Bridge

- Date: 2026-06-03
- Main objective: Add a richer payoff from the opened-manifest echo listening
  beat into the existing newspaper transfer route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 16 evidence. Health is green,
  all scenes are reachable in coverage, and random play now reaches the echo
  route; the next highest-value improvement is story depth that makes the
  passenger keepsake sounds feel interconnected instead of isolated branches.
- Planned work:
  - Complete the new `opened_manifest_echoes` choice that follows the newspaper
    fold into `passenger_newspaper_transfer`.
  - Reuse the existing newspaper transfer, roll-call, intercom, and ending
    scenes rather than adding another ending.
  - Verify the opened-manifest regression covers the bridge and still preserves
    the echo boarding route.
  - Run full health and an actual CLI playthrough through the new bridge.
- Risks:
  - `opened_manifest_echoes` should stay a concise listening beat, not become a
    second crowded hub.
  - The bridge sets newspaper flags directly, so it must not break the existing
    conductor-punch or roll-call choices inside `passenger_newspaper_transfer`.
- Status:
  - Completed.
  - Added `follow_newspaper_fold_from_opened_echoes` from
    `opened_manifest_echoes` to `passenger_newspaper_transfer`, gated by
    `studied_newspaper_transfer`.
  - The bridge sets `heard_newspaper_memory` and
    `studied_newspaper_transfer`, matching the established direct newspaper
    route semantics.
  - Extended the opened-manifest echo regression to assert the new choice,
    restored transfer scene, flags, roll-call continuation, and
    `passenger_newspaper_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest players listen"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `opened_manifest_echoes`, `passenger_newspaper_transfer`, and
    `passenger_newspaper_roll_call`.
  - Actual CLI play followed the new opened-echo newspaper route, ended at
    `passenger_newspaper_true_ending`, scored 300, and left no objectives.
- Playtest feedback:
  - The bridge reads naturally because `opened_manifest_echoes` already names
    the newspaper fold among the passenger sounds.
  - The route now has a clear arc: listen to opened door-echoes, follow the
    newspaper fold into the restored transfer, read the transfer into roll
    call, then pull the release.
  - The new option adds one concrete passenger follow-up without changing the
    existing echo boarding payoff or adding another ending.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether
    `passenger_newspaper_transfer` and `passenger_newspaper_roll_call` become
    more common after opened-manifest echo play; if they remain rare, tune the
    passenger-platform newspaper labels rather than adding more branches.

# Cycle 15 Opened Manifest Echo Listening Bridge

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for the opened-manifest echoed
  passenger payoff by adding a listen-before-board beat from the common opened
  manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 15 evidence. Health is green and
  coverage reaches every scene, but the 100-run random sample still missed
  `passenger_echoed_boarding`, `passenger_echoed_check`, and
  `passenger_echoed_manifest_intercom`. The echo route is authored as a
  passenger-accountability beat, and normal players should be able to notice it
  before committing to the third car.
- Planned work:
  - Finish the opened-manifest echo-listening bridge already staged in
    `stories/demo.yaml`.
  - Keep the route scoped to existing echoed passenger scenes and ending.
  - Verify the focused opened-manifest regressions cover the new
    `opened_manifest_echoes` scene and return path.
  - Run full health and an actual CLI playthrough through the new route.
- Risks:
  - `passengers_released` is choice-rich; the new listen option must read as a
    sensory preview, not another duplicate boarding command.
  - Returning from `opened_manifest_echoes` sets `heard_passenger_echoes`, so
    the hub should naturally offer the existing board-with-echoed-manifest route
    instead of replaying the same listening beat.
- Status:
  - Completed.
  - Added `listen_to_opened_manifest_echoes` from `passengers_released` to a
    new `opened_manifest_echoes` scene, gated before existing echo, Mara
    goodbye, passenger answer, and gathering commitments.
  - Added a concise listen-before-board beat that lets players either board
    with the familiar echoes or return to the opened manifest doors.
  - Updated opened-manifest route regressions to assert choice ordering, the new
    scene, return-safe state, and the full route to `passenger_echoed_true_ending`.
  - Focused opened-manifest regression passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest"`.
  - `npm run health` passed: format check, TypeScript, 238 tests, validation,
    and coverage playtest.
  - Validation reports 149 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `opened_manifest_echoes`, `passenger_echoed_boarding`,
    `passenger_echoed_check`, and `passenger_echoed_manifest_intercom`.
  - Actual CLI play followed the new listen-before-board echo route, ended at
    `passenger_echoed_true_ending`, scored 290, and left no objectives.
- Playtest feedback:
  - The new beat gives the player a sensory confirmation that the opened
    manifest sounds now belong to people before asking them to board.
  - The route feels more deliberate than immediately carrying echoes into the
    third car, and the check scene gives a clean accountability payoff.
  - Returning from the listening scene should naturally steer players to the
    existing echoed boarding choice because `heard_passenger_echoes` is set.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether normal play now reaches
    `opened_manifest_echoes`, `passenger_echoed_boarding`, and
    `passenger_echoed_check`; if echoed routes stabilize, shift attention to
    `passenger_newspaper_transfer` discoverability.

# Cycle 14 Manifest Echo Boarding Check Bridge

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for the echoed passenger
  boarding/check payoff path from the common opened-manifest answer route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 14 evidence. Health is green,
  coverage reaches every scene, and random play is finding the echoed ending
  after Cycle 13, but the 100-run random sample still missed
  `passenger_echoed_boarding`, `passenger_echoed_check`, and
  `passenger_echoed_manifest_intercom`. Those scenes are a useful accountability
  beat before release and should be easier to notice from normal manifest-answer
  play.
- Planned work:
  - Add a direct manifest-answer choice that checks answered names against the
    familiar door sounds aboard the third car.
  - Reuse the existing `passenger_echoed_boarding`,
    `passenger_echoed_check`, `passenger_echoed_manifest_intercom`, and
    `passenger_echoed_true_ending` route rather than adding another ending.
  - Extend the manifest-answer regression to prove the new bridge reaches the
    echoed check and ending.
  - Run focused tests, full health, and an actual CLI playthrough of the changed
    route.
- Risks:
  - `passenger_manifest_answers` becomes a five-choice scene, so the new label
    must read as a concrete check step rather than another abstract tonal
    variation.
  - The bridge sets `echoed_manifest_boarded` immediately; it must still allow
    the check and intercom payoff without reopening boarding loops.
- Status:
  - Completed.
  - Added `check_manifest_answers_against_echoes` from
    `passenger_manifest_answers` to `passenger_echoed_boarding`, gated behind
    `heard_passenger_echoes` so it appears before the player commits to the
    existing echoed-manifest payoff.
  - Reused `passenger_echoed_boarding`, `passenger_echoed_check`,
    `passenger_echoed_manifest_intercom`, and `passenger_echoed_true_ending`
    rather than adding a new branch or ending.
  - Extended the opened-manifest answer regression to prove the new bridge
    reaches `passenger_echoed_boarding`, checks familiar echo sounds against
    boarded passengers, and finishes at `passenger_echoed_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest names answer"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `passenger_echoed_boarding`, `passenger_echoed_check`, and
    `passenger_echoed_manifest_intercom`.
  - Actual CLI play followed the new manifest-answer echo-check route, ended at
    `passenger_echoed_true_ending`, scored 292, and left no objectives.
- Playtest feedback:
  - The new label reads as a concrete audit of the answered manifest rather
    than another abstract "listen" option.
  - The route is concise: open every manifest door, let names answer once, check
    the familiar sounds against boarded passengers, then release.
  - Because Mara has already signed off on this path, the echoed boarding/check
    scenes correctly offer direct release choices instead of reopening the
    intercom loop.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether
    `passenger_echoed_boarding` and `passenger_echoed_check` now appear in
    normal play; if still rare, tune the choice ordering around
    `passenger_manifest_answers` before adding more branches.

# Cycle 13 Manifest Answer Payoff Bridges

- Date: 2026-06-03
- Main objective: Improve normal-play discovery for the answered-handoff and
  echoed-manifest passenger payoffs.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 13 evidence. Health is green,
  coverage reaches every scene, and random play now has strong ideal-ending
  pressure, but the 100-run sample still missed
  `passenger_answered_handoff_*` and `passenger_echoed_*` scenes. Those are
  authored passenger payoffs that should be easier to notice from common
  opened-manifest play.
- Planned work:
  - Add an answered-handoff bridge from
    `passenger_manifest_answers` into `passenger_answered_handoff_roll_call`.
  - Add a direct echoed-manifest option from the same manifest-answer hub into
    the existing `passenger_echoed_manifest_intercom` payoff.
  - Reuse current scenes and endings rather than adding another passenger
    ending.
  - Extend route regressions for the new manifest-answer echo bridge.
  - Run focused tests, full health, and an actual CLI playthrough of the
    changed route.
- Risks:
  - `passenger_manifest_answers` now has four choices, so the new option must
    read as a payoff for prior door sounds instead of another unrelated branch.
  - The bridge sets `heard_passenger_echoes` late; it must still flow cleanly
    into the existing echoed intercom ending without reopening boarding loops.
- Status:
  - Completed.
  - Added `hand_manifest_answers_to_mara` from
    `passenger_manifest_answers` to `passenger_answered_handoff_roll_call`.
  - Added `let_manifest_answers_keep_door_rhythm` from
    `passenger_manifest_answers` to `passenger_echoed_manifest_intercom`.
  - Updated manifest-answer regression expectations and verified the new
    bridges reach both `passenger_answered_handoff_true_ending` and
    `passenger_echoed_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "opened manifest names answer"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes; coverage
    count for `passenger_echoed_true_ending` rose to 1821.
  - Actual CLI play followed the manifest-answer handoff bridge, ended at
    `passenger_answered_handoff_true_ending`, scored 305, and left no
    objectives.
  - Actual CLI play followed the new manifest-answer echo bridge, ended at
    `passenger_echoed_true_ending`, scored 280, and left no objectives.
- Playtest feedback:
  - The new label reads as a natural tonal shift from answered names back to
    the earlier door sounds rather than as a mechanical shortcut.
  - The route is concise: open every manifest door, let names answer once, let
    the names keep the door rhythm, then release while the opened doors answer.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch random and blind sessions for whether `passenger_echoed_true_ending`
    appears more often in normal play; if it remains rare, tune labels around
    `follow_opened_manifest_echoes` and `board_with_echoed_manifest` before
    adding more branches.

# Cycle 12 Passenger Payoff Discovery Bridges

- Date: 2026-06-02
- Main objective: Make low-discovery passenger payoff scenes easier to reach
  from normal opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 12 evidence. Health and core
  guidance are strong, but the 100-run random sample still missed
  `passenger_newspaper_transfer`, `passenger_newspaper_roll_call`, and
  `passenger_answered_check`. These are not blockers, but they are authored
  payoffs for branches normal players are now encouraged to inspect.
- Planned work:
  - Add a direct choice from the restored newspaper transfer column to the
    existing final newspaper roll-call scene.
  - Add a direct opened-manifest choice that boards and checks each answered
    name against a face.
  - Preserve the conductor transfer and intercom newspaper routes.
  - Extend the existing passenger route regressions to cover both bridges.
  - Run focused tests, full health, and a CLI playthrough of the changed route.
- Risks:
  - `passenger_newspaper_transfer` now has three choices instead of two, so the
    new option must read as a story-forward payoff rather than extra clutter.
  - The opened-manifest hub is already choice-rich; the answered-check shortcut
    must stay tightly gated before other passenger commitments.
- Status:
  - Completed.
  - Added `read_restored_transfer_into_roll_call` from
    `passenger_newspaper_transfer` to existing `passenger_newspaper_roll_call`.
  - Added `board_and_check_answered_passengers` from `passengers_released` to
    existing `passenger_answered_check`, gated away after Mara handoff,
    passenger answer, and passenger gathering commitments.
  - Preserved the conductor-punched transfer route and the newspaper intercom
    route.
  - Extended the newspaper regression to verify the restored transfer can flow
    directly into the final roll call and then to
    `passenger_newspaper_true_ending`.
  - Extended the answered-passenger regression to verify the opened-manifest
    bridge reaches `passenger_answered_check` and then finishes at
    `passenger_answered_boarding_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "answered passenger"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `passenger_answered_check`, `passenger_newspaper_transfer`, and
    `passenger_newspaper_roll_call`.
  - Actual CLI play followed the new answered-check bridge, ended at
    `passenger_answered_boarding_true_ending`, scored 277, and left no
    objectives.
  - Actual CLI play followed the new newspaper transfer roll-call bridge, ended
    at `passenger_newspaper_true_ending`, scored 313, and left no objectives.
- Playtest feedback:
  - The answered-check shortcut makes the roll call feel accountable before
    release instead of requiring players to discover the check only after a
    separate answer-listen scene.
  - The revised newspaper route now has a clean sequence: manifest note names
    Lenora, newspaper memory restores the blank transfer, transfer reading
    becomes roll call, release pays it off.
  - The new transfer choice reads as a direct story-forward option rather than
    a detour, and it leaves the more specific conductor-punch payoff intact.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch random/blind sessions for whether the answered-check bridge improves
    normal discovery; if it still remains rare, tune the
    `passenger_answered_boarding` choice labels before adding more branches.

# Cycle 11 Opened Manifest Ready Bridge

- Date: 2026-06-02
- Main objective: Make `passenger_manifest_ready_intercom` easier to discover
  from the opened-manifest platform hub.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window
  yet, and current Cycle 11 evidence shows healthy core completion with random
  play still missing `passenger_manifest_ready_intercom`. The scene already
  pays off checking that every manifest passenger is aboard, but it was mostly
  hidden behind the generic third-car boarding state.
- Planned work:
  - Add a direct opened-manifest choice that boards and confirms the manifest
    passengers are aboard.
  - Reuse the existing `passenger_manifest_ready_intercom` and manifest ending
    flow instead of creating another ending branch.
  - Preserve existing passenger help, handoff, answer, and generic boarding
    options.
  - Extend the manifest-platform regression, run health, and play the route.
- Risks:
  - The opened-manifest hub is already choice-rich; the new option must remain
    tightly gated so it disappears after other passenger-specific commitments.
- Status:
  - Completed.
  - Added `board_and_confirm_opened_manifest_ready` from `passengers_released`
    to the existing `passenger_manifest_ready_intercom`, gated away after other
    passenger-specific commitments.
  - Reused the established ready-manifest intercom and
    `passenger_manifest_true_ending` flow rather than adding another ending.
  - Extended the manifest-platform regression to verify the opened-door ready
    route reaches `passenger_manifest_ready_intercom`, then finishes cleanly at
    `passenger_manifest_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "manifest"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes, including
    `passenger_manifest_ready_intercom`, `passenger_newspaper_transfer`, and
    `passenger_newspaper_roll_call`.
  - Actual CLI play followed the new opened-manifest ready route, ended at
    `passenger_manifest_true_ending`, scored 276, and left no objectives.
- Playtest feedback:
  - The new choice reads as a natural next step immediately after opening every
    manifest door: board, check the visible passengers, let Mara finish the
    ready count, then pull the release.
  - The route makes `passenger_manifest_ready_intercom` a payoff for the common
    manifest-clearing branch instead of a hidden train-car-only variant.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether
    `mara_manifest_intercom` remains rare in normal play; if so, tune ordering
    or labels around manifest-ready versus direct release rather than adding a
    new branch.

# Cycle 9 Manifest Note Newspaper Bridge

- Date: 2026-06-02
- Main objective: Make the rare newspaper transfer and final roll-call route
  easier to discover from normal manifest reading.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window
  yet, and Cycle 9 evidence shows the core route is healthy while random play
  still missed `passenger_newspaper_transfer` and
  `passenger_newspaper_roll_call`. The manifest margin notes already name
  Lenora Pike and her folded newspaper, so letting players follow that note
  gives the newspaper route a natural pre-opening hook.
- Planned work:
  - Add a direct Lenora newspaper choice from `passenger_manifest_notes`.
  - Preserve the existing echoed-manifest and return-to-ledger options.
  - Extend the manifest-notes regression to finish through the newspaper
    transfer roll-call ending.
  - Run focused tests, full health, and an actual CLI playthrough of the new
    route.
- Risks:
  - The manifest notes now expose two optional clue routes before returning to
    the objective, but both are player-chosen and the direct ledger return
    remains available.
- Status:
  - Completed.
  - Added `follow_lenora_newspaper_note` from `passenger_manifest_notes` to
    `passenger_newspaper_memory`, gated by `heard_newspaper_memory`.
  - Preserved `listen_after_manifest_notes` and `return_from_manifest_notes` so
    players can still pursue the echoed route or return directly to Mara's
    ledger objective.
  - Extended the manifest-notes regression to verify the Lenora branch reaches
    `passenger_newspaper_transfer`, `passenger_newspaper_roll_call`, and
    `passenger_newspaper_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "manifest margin notes"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_newspaper_transfer` and `passenger_newspaper_roll_call`, with
    zero unvisited scenes.
  - Actual CLI play followed the new Lenora note route, ended at
    `passenger_newspaper_true_ending`, scored 246, and left no objectives.
- Playtest feedback:
  - The new choice makes the newspaper route feel like a direct payoff for
    reading the manifest notes instead of a later passenger-platform tangent.
  - The route has a clear escalation: named passenger note, remembered stop,
    restored transfer column, final roll call, ideal release.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch random and blind sessions for whether `passenger_manifest_ready_intercom`
    remains under-discovered; if so, add a similarly small manifest-ready bridge
    from an already common passenger-manifest choice.

# Cycle 7 Manifest Margin Echo Foreshadowing

- Date: 2026-06-02
- Main objective: Make the passenger echoed-manifest route more naturally
  discoverable from normal manifest reading.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence says the core route is healthy while
  random play under-discovers several passenger echo/newspaper/manifest-ready
  scenes. The kept-passenger manifest is already a common story-forward clue;
  adding margin-note context turns the later echo route from a hidden branch
  into a readable payoff.
- Planned work:
  - Add optional manifest margin notes before returning to Mara's ledger row.
  - Use the notes to name ordinary passenger details that later become the
    echoed boarding route.
  - Preserve the direct listen-to-doors and return-to-ledger options.
  - Add focused story-path coverage, run full health, and play the changed
    route through the CLI.
- Risks:
  - The extra manifest choice may slightly lengthen a late-game branch, but it
    is optional and appears only after the player chooses to inspect the kept
    passenger manifest.
- Status:
  - Completed.
  - Completed the existing manifest marginal-notes implementation and aligned
    the regression name with the echoed-route discovery purpose.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "manifest margin notes"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths; `passenger_manifest_notes` was covered.
  - Actual CLI play followed the new margin-note route through
    `passenger_echoed_boarding` and `passenger_echoed_manifest_intercom`, ended
    at `passenger_echoed_true_ending`, scored 281, and left no objectives.
- Playtest feedback:
  - The notes make the echoed route easier to read because the final ordinary
    sounds now have earlier names and objects attached.
  - Returning from the notes to the ledger keeps the objective clear: open the
    kept-passenger manifest doors with Mara's badge proof.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether players reach the
    echoed-manifest family more often; if this remains rare, add a recovery
    prompt from the opened-doors scene instead of lengthening the manifest.

# Cycle 92 Passenger Manifest Marginal Notes

- Date: 2026-06-02
- Main objective: Give the kept-passenger manifest route clearer human anchors
  before the player opens every passenger door.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence says core routing is healthy with all
  scenes visited. The highest-value next step is richer story depth and better
  transcript critique signals, especially in the passenger-manifest branch.
- Planned work:
  - Add one optional manifest-note scene before returning to Mara's ledger row.
  - Preserve the direct manifest, passenger-echo, and clear-manifest routes.
  - Add focused regression coverage for the new beat and a complete ideal
    passenger-manifest ending.
  - Run full health and play the changed route through the CLI.
- Risks:
  - The new optional choice adds one more pre-ledger branch, but it is gated by
    a one-time flag and returns to the established objective.
- Status:
  - Completed.
  - Added `read_manifest_marginal_notes` from `passenger_manifest` to the new
    `passenger_manifest_notes` scene.
  - The notes name several kept passengers and reinforce Mara's "answer before
    opening" instruction.
  - Added `listen_after_manifest_notes` for players who want to convert the
    notes into the existing passenger-echo route.
  - Added `return_from_manifest_notes` back to `signal_ledger`, preserving the
    manifest-door objective and clear route.
  - Updated the focused manifest regression to cover the new scene and finish at
    `passenger_echoed_true_ending`.
  - Focused test passed:
    `npm test -- tests/story-paths.test.ts -t "manifest margin notes"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 148 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_manifest_notes`, with zero unvisited scenes and zero unfinished
    complete paths.
  - Actual CLI play followed the new manifest-notes route, ended at
    `passenger_echoed_true_ending`, scored 281, and left no objectives.
- Playtest feedback:
  - The new notes make the manifest branch read less like an abstract list and
    more like people with concrete objects and destinations.
  - Returning from the notes lands on the right ledger objective: open the
    kept-passenger manifest doors with Mara's badge proof.
  - The route remains direct enough to finish cleanly through the echoed
    passenger-manifest ending.
- Next step:
  - Watch blind sessions for whether named passenger anchors improve critiques
    of the manifest route; if the branch still feels crowded, tune choice
    ordering or consolidate overlapping passenger help beats.

# Cycle 91 Thumbprint Intercom Handoff Recovery

- Date: 2026-06-02
- Main objective: Let players who ask about Mara's torn thumbprint through the
  intercom still recover the physical far-door handoff route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence continues to name
  `mara_thumbprint_handoff_intercom` as the remaining normal-play discovery
  target. Prior cycles added direct-board and checked-handoff recovery routes,
  but the thumbprint-only intercom still ended as a simple release branch.
- Planned work:
  - Add a thumbprint-intercom option that asks Mara to carry the thumbprint to
    the far door.
  - Route it through `mara_thumbprint_handoff_intercom` and set the established
    handoff flag.
  - Preserve the direct thumbprint release ending.
  - Add focused coverage, run full health, and play the changed route.
- Risks:
  - The added choice may nudge some random traffic from `true_ending` into
    `mara_handoff_true_ending`, but only after the player already found the
    optional torn-thumbprint clue and chose to hear Mara explain it.
- Status:
  - Completed.
  - Added `ask_mara_to_carry_thumbprint_to_far_door` from
    `mara_thumbprint_intercom` to `mara_thumbprint_handoff_intercom`.
  - Kept `pull_release_after_thumbprint_goodbye` available as the direct
    release path.
  - Added a focused regression for recovering
    `mara_thumbprint_handoff_intercom` after asking about the thumbprint before
    boarding.
  - Focused thumbprint tests passed:
    `npm test -- tests/story-paths.test.ts -t "thumbprint"`.
  - `npm run health` passed: format check, TypeScript, 237 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
  - Actual CLI play followed the pre-boarding thumbprint intercom route through
    `ask_mara_to_carry_thumbprint_to_far_door`, ended at
    `mara_handoff_true_ending`, scored 285, and left no objectives.
  - Committed as `e096466 Add thumbprint intercom handoff recovery`.
- Playtest feedback:
  - The new recovery option reads naturally after Mara explains why the
    thumbprint tore the ledger: the player can still pull immediately, or turn
    the mark into the physical far-door handoff.
  - The route now exposes `mara_thumbprint_handoff_intercom` from the
    thumbprint-only intercom path, which directly targets the normal-play
    discovery gap without removing the concise `true_ending` branch.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether players choose the new
    thumbprint carry option; if the handoff family stays healthy, shift to
    richer passenger-manifest critique or transcript quality.

# Cycle 90 Last-Dispatch Handoff Recovery

- Date: 2026-06-02
- Main objective: Let players who already asked for Mara's last dispatch still
  recover the physical Mara handoff route from the third-car intercom.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the current evidence continues to value better discovery for the
  rare Mara handoff scenes. The last-dispatch line is a natural, story-forward
  choice, but it previously resolved only to the generic `true_ending` once the
  player carried it into the train.
- Planned work:
  - Add an optional last-dispatch intercom choice that waits for Mara to carry
    the dispatch to the far door.
  - Route that choice through `mara_handoff_intercom` so it pays off at
    `mara_handoff_true_ending`.
  - Preserve the direct last-dispatch release path.
  - Add focused story-path coverage and run full health plus an actual route.
- Risks:
  - The new option slightly increases traffic into the handoff ending family,
    but only after the player has explicitly asked for Mara's last dispatch.
- Status:
  - Completed.
  - Added `wait_for_handoff_after_last_dispatch` from
    `mara_last_dispatch_intercom` to `mara_handoff_intercom`.
  - Updated last-dispatch expectations to keep the direct release while
    exposing the handoff recovery.
  - Added a focused regression for asking for Mara's train-car dispatch,
    waiting for the handoff, and reaching `mara_handoff_true_ending`.
  - Focused tests passed:
    `npm test -- tests/story-paths.test.ts -t "last dispatch"`.
  - `npm run health` passed: format check, TypeScript, 236 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths; `mara_handoff_true_ending` rose to 51 coverage
    hits in this run.
  - Actual CLI play followed the direct-board last-dispatch route through
    `wait_for_handoff_after_last_dispatch`, ended at
    `mara_handoff_true_ending`, scored 288, and left no objectives.
- Playtest feedback:
  - The new option reads as a natural continuation of the dispatch line:
    players can still pull immediately, but waiting now turns Mara's words into
    the physical far-door payoff.
  - The direct release and badge-proof follow-up remain available from the same
    intercom, so the added route improves discovery without blocking the older
    ending.
  - No invalid choices, dangling objectives, unreachable scenes, or coverage
    regressions appeared.
- Next step:
  - Watch future random and blind sessions for whether players use the new
    last-dispatch wait option; if not, tune `mara_last_dispatch_intercom` text
    before adding another handoff branch.

# Cycle 89 Badge-Proof Handoff Recovery

- Date: 2026-06-02
- Main objective: Let players who learned the badge-proof clue recover Mara's
  physical far-door handoff after they board the third car directly.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence continues to point at the Mara handoff
  route family as the remaining normal-play discovery gap. The previous
  direct-board recovery helped thumbprint readers; notice-back badge-proof
  readers still defaulted to an intercom-only payoff unless they chose the
  handoff before boarding.
- Planned work:
  - Add a badge-proof-aware train-car choice that waits for Mara to carry the
    proof to the far door.
  - Route that recovery choice into `mara_handoff_intercom` and set the
    established handoff/goodbye flags.
  - Preserve the existing badge-proof intercom and direct release routes.
  - Add a focused regression, run full health, and play the route.
- Risks:
  - The extra choice can slightly increase random traffic into
    `mara_handoff_true_ending`, but only after players earn the optional
    badge-proof clue and choose to wait instead of pulling the release.
- Status:
  - Completed.
  - Added `wait_for_badge_proof_mara_at_far_door` from `train_car` to
    `mara_handoff_intercom`.
  - Updated the badge-proof direct-board expectation to include the new
    recovery option while preserving `listen_to_badge_proof_intercom` and
    `pull_release`.
  - Added a focused regression for reaching `mara_handoff_true_ending` through
    the new badge-proof far-door choice.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "badge-proof direct boarders"`.
  - Targeted last-dispatch regression passed:
    `npm test -- tests/story-paths.test.ts -t "last dispatch"`.
  - `npm run health` passed: format check, TypeScript, 236 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, had zero unfinished complete paths,
    and raised `mara_handoff_true_ending` coverage from 41 to 51 runs.
  - Actual CLI play followed the notice-back badge-proof route through
    `wait_for_badge_proof_mara_at_far_door`, ended at
    `mara_handoff_true_ending`, scored 285, and left no objectives.
- Playtest feedback:
  - The train-car handoff recovery reads naturally after direct boarding: the
    player has already proven Mara's name and can now choose to let her carry
    that proof to the far door.
  - The existing badge-proof intercom and emergency-release choices remain
    available, so the new route adds an optional physical payoff without
    removing the concise ending path.
  - No invalid choices, dead ends, dangling objectives, validation regressions,
    or coverage regressions appeared.
- Next step:
  - Watch future random/blind sessions for whether badge-proof players now
    reach `mara_handoff_intercom` more often after direct boarding; if handoff
    routes are healthy, shift attention toward richer passenger-manifest
    critique or transcript quality.

# Cycle 88 Direct-Board Thumbprint Handoff Recovery

- Date: 2026-06-02
- Main objective: Let players who already found Mara's torn thumbprint recover
  the Mara handoff route even after they choose the direct third-car boarding
  option.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence points at `mara_handoff_intercom`,
  `mara_handoff_true_ending`, and `mara_thumbprint_handoff_intercom` as the
  remaining normal-play discovery gap. The direct boarding route is a natural
  player choice after clearing Mara's ledger row, but previously it could bury
  the stronger thumbprint-handoff payoff behind earlier platform choices.
- Planned work:
  - Add a train-car choice for thumbprint readers to wait while Mara carries
    the torn thumbprint to the far door.
  - Route that choice to `mara_thumbprint_handoff_intercom` and set the same
    handoff/goodbye flags as the established handoff route.
  - Lock the direct-board recovery route with a focused story-path regression.
  - Run focused tests, full health, and an actual playthrough.
- Risks:
  - Choice ordering may slightly increase random traffic into the
    `mara_handoff_true_ending` family, but only for players who already earned
    the torn-thumbprint clue and have not entered a passenger-manifest route.
- Status:
  - Completed.
  - Added `wait_for_thumbprint_mara_at_far_door` from `train_car` to
    `mara_thumbprint_handoff_intercom`.
  - Updated the thumbprint direct-release expectation to show the new recovery
    option before the generic thumbprint intercom.
  - Added a focused regression for boarding directly after reading the
    thumbprint, choosing the new wait option, and reaching
    `mara_handoff_true_ending`.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "thumbprint readers recover the Mara handoff"`.
  - `npm run health` passed: format check, TypeScript, 234 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
  - Actual CLI play followed the direct-board thumbprint route through
    `wait_for_thumbprint_mara_at_far_door`, ended at
    `mara_handoff_true_ending`, scored 275, and left no objectives.
- Playtest feedback:
  - The new train-car choice is a clear recovery beat for players who picked
    the direct board option but still care about the torn thumbprint clue.
  - The route now pays off with Mara physically holding the far door, which is
    more specific than the generic speaker goodbye and directly addresses the
    missed `mara_thumbprint_handoff_intercom` discovery gap.
  - No invalid choices, dangling objectives, dead ends, or coverage regressions
    appeared.
- Next step:
  - Watch future random and blind sessions for whether
    `mara_thumbprint_handoff_intercom` appears more often in normal direct-board
    routes; if not, tune the post-release choice labels before adding another
    branch.

# Cycle 87 Unlit Platform Recovery Signpost

- Date: 2026-06-02
- Main objective: Make the adaptive unlit-platform escape route point back to
  concrete recovery before players choose the street.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence includes an adaptive route that reached
  `escape_ending` after retreating from Platform 13 with no map, fuse, badge,
  or token. The escape ending should remain available, but the warning should
  make the productive recovery path more obvious.
- Planned work:
  - Move the service-room recovery choice to the top of
    `platform_escape_warning`.
  - Make the warning text and choice label name the map, fuse, badge, and clock
    token instead of generic unfinished work.
  - Set `knows_token_location` when players return from that warning so the
    service room can immediately offer the stopped-clock route.
  - Update focused story-path expectations, run health, and actually play the
    revised route.
- Risks:
  - Choice ordering can shift random escape distribution, but the explicit
    escape choice remains available and this only strengthens recovery
    signposting on a known exploratory route.
- Status:
  - Completed.
  - Rewrote `platform_escape_warning` to name the desk map, locker parts, and
    stopped clock before the player chooses whether to escape.
  - Moved the service-room recovery choice to the first position and renamed it
    to explicitly ask for the map, fuse, badge, and clock token.
  - Returning from the unlit escape warning now sets `knows_token_location`, so
    the service room offers `go_to_stopped_clock` instead of a vague tunnel
    backtrack.
  - Updated the focused story-path regression for the revised warning text,
    choice order, recovery label, and post-return choice set.
  - Focused regression passed:
    `npm test -- tests/story-paths.test.ts -t "lets unlit-platform explorers retreat to the early escape warning"`.
  - Actual CLI play followed the adaptive unlit-platform route through
    `return_to_platform_from_escape_warning`, recovered the clock token, map,
    fuse, and badge, and reached `true_ending` with score 256 and no
    objectives.
  - `npm run health` passed: format check, TypeScript, 233 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
- Playtest feedback:
  - The revised warning makes the recovery path materially clearer: the first
    option now names every missing tool the exploratory player needs.
  - The service room no longer offers the unhelpful `return_to_tunnel` after
    the player accepts the warning; it points directly at the stopped clock,
    which matches the warning text.
  - The escape ending remains available as an explicit final choice, preserving
    player agency without letting it masquerade as the recommended next step.
- Next step:
  - Watch future adaptive routes for whether unprepared platform visitors still
    escape at a high rate; if so, tune the optional stairwell/listen beats
    before changing the core platform requirements.

# Cycle 86 Direct Thumbprint Handoff Release

- Date: 2026-06-02
- Main objective: Make the earned torn-thumbprint handoff payoff immediately
  actionable instead of requiring a generic intercom bridge before the final
  release.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence keeps pointing at rare Mara handoff scenes
  as the remaining normal-play discovery gap. The handoff route is now easier
  to enter, but the thumbprint-specific payoff still forces players through
  `mara_handoff_intercom` before they can finish, which blurs the strongest
  clue-specific moment.
- Planned work:
  - Add a direct release choice from `mara_thumbprint_handoff_intercom` to
    `mara_handoff_true_ending`.
  - Preserve the existing option to carry Mara's thumbprint to the far door.
  - Update focused path tests for the new actionable choice.
  - Run focused tests, full health, and an actual playthrough.
- Risks:
  - Adding a direct ending choice may slightly change random route distribution
    for the rare thumbprint handoff route, but it should improve player clarity
    without affecting required routes.
- Status:
  - Completed.
  - Added `pull_release_after_thumbprint_handoff` from
    `mara_thumbprint_handoff_intercom` directly to
    `mara_handoff_true_ending`.
  - Preserved `carry_thumbprint_handoff_to_far_door` as the optional bridge to
    the generic Mara handoff intercom.
  - Updated focused story-path coverage for the direct payoff and the preserved
    bridge route.
  - Focused story-path suite passed: 186 tests.
  - Actual CLI play followed the torn-thumbprint handoff route through
    `pull_release_after_thumbprint_handoff`, ending at
    `mara_handoff_true_ending` with score 283 and no objectives.
  - `npm run health` passed: format check, TypeScript, 233 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
- Playtest feedback:
  - The revised thumbprint handoff now resolves at the strongest clue-specific
    moment instead of forcing the player through the generic handoff intercom.
  - The preserved far-door bridge still works for players who want an extra
    confirmation beat.
  - No invalid choices, dangling objectives, dead ends, or coverage regressions
    appeared.
- Next step:
  - Watch future random and blind sessions for whether players reach
    `mara_thumbprint_handoff_intercom` more often now that its payoff is more
    direct; if not, tune the earlier handoff choice labels before adding new
    scenes.

# Cycle 85 Structured MCP Invalid Choice Recovery

- Date: 2026-06-02
- Main objective: Make MCP playthrough failures from stale or scene-inapplicable
  choices machine-readable instead of collapsing into non-JSON tool text.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence included an adaptive exploratory MCP route
  that stopped when `ignore_warning` was attempted from `entrance`. That kind
  of mistake should leave agents with the current scene, legal choices, and
  objectives so the next cycle can recover or critique the actual route.
- Planned work:
  - Keep successful `choose_option` responses unchanged.
  - Catch invalid choice errors in the MCP `choose_option` tool.
  - Return structured JSON containing the rejected choice, current scene, legal
    choices, objectives, and score.
  - Add a focused regression test for the structured invalid-choice payload.
- Risks:
  - Some callers may still treat `ok: false` as a normal observation unless
    they check the field. This is still safer than an unparseable MCP error,
    and legal-choice behavior is unchanged.
- Status:
  - Completed.
  - Added shared MCP result helpers in `src/mcp-results.ts`.
  - Updated `choose_option` to catch invalid choice errors and return parseable
    JSON without mutating the save.
  - Added `tests/mcp-results.test.ts` coverage for the exact stale-choice shape
    from the current evidence.
  - Focused tests passed: 10 tests across MCP result and AI loop suites.
  - `npm run health` passed: format check, TypeScript, 233 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
- Playtest feedback:
  - Focused MCP-result regression covers the stale `ignore_warning` from
    `entrance` shape and verifies that the payload includes the rejected choice,
    current scene, legal choices, and objectives.
  - Direct MCP invalid-choice smoke attempted `ignore_warning` from `entrance`
    and returned JSON with legal choices `read_notice`, `take_lantern`, and
    `enter_dark` plus active objectives.
  - Actual MCP play followed the revised Mara handoff route through
    `mara_handoff_true_ending` with score 318 and no remaining objectives.
  - No save mutation, invalid legal-choice regression, dead end, or coverage
    regression appeared in focused tests, full health, or direct MCP smoke.
- Next step:
  - Teach the AI loop route runner to use `ok: false` invalid-choice payloads
    as recovery hints when a scripted or model-chosen route goes stale.

# Cycle 84 Mara Handoff Entry Prompt

- Date: 2026-06-02
- Main objective: Make the rare Mara-only handoff route easier to recognize at
  the moment players clear Mara's ledger entry.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current evidence points at `mara_handoff_intercom`,
  `mara_handoff_true_ending`, and `mara_thumbprint_handoff_intercom` as the
  remaining normal-play discovery gap. The route already exists and is
  validated, so the best small improvement is a clearer player-facing entry
  prompt rather than another branch.
- Planned work:
  - Move `watch_mara_leave_booth` to the first post-release choice.
  - Rename the choice so it communicates a concrete route: walking with Mara to
    the third car before the release.
  - Add story text that explicitly frames the decision between leaving Mara as a
    speaker voice and walking beside her.
  - Lock the revised prompt and choice order with a focused regression test.
- Risks:
  - Choice ordering can affect random route distribution. The path still remains
    optional and all existing direct release and intercom routes should stay
    available.
- Status:
  - Completed.
  - Moved `watch_mara_leave_booth` to the first post-release choice.
  - Renamed the choice to `Walk with Mara to the third car before the release`.
  - Added Mara release text that frames the choice between leaving her as a
    speaker voice and walking beside her.
  - Updated focused story-path expectations for the new prompt and ordering.
  - Verified as part of Cycle 85: `npm run health` passed, direct MCP handoff
    route reached `mara_handoff_true_ending`, and coverage still visited all
    scenes.

# Cycle 83 Checked Thumbprint Handoff Payoff

- Date: 2026-06-02
- Main objective: Preserve Mara's torn-thumbprint payoff after the physical
  far-door handoff check.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current evidence keeps pointing at rare Mara handoff variants as
  the remaining normal-play discovery gap. Cycle 81 added the physical
  `mara_handoff_check`, but thumbprint readers who took that new check were
  routed through the generic handoff intercom instead of the more specific
  torn-thumbprint handoff beat they had earned.
- Planned work:
  - Add a thumbprint-specific speaker choice from `mara_handoff_check` when
    `read_mara_thumbprint` is set.
  - Keep the generic checked-handoff speaker choice for players without the
    thumbprint clue.
  - Preserve the direct return to the release from the check scene.
  - Add a regression path that reads the thumbprint, watches Mara leave,
    checks the far door, and reaches `mara_thumbprint_handoff_intercom`.
- Risks:
  - The check scene has conditional choice ordering. Focused tests should
    ensure thumbprint and non-thumbprint readers each see only the relevant
    speaker payoff plus the direct release return.
- Status:
  - Completed.
  - Added `carry_checked_thumbprint_handoff_to_speaker` from
    `mara_handoff_check` to `mara_thumbprint_handoff_intercom`.
  - Gated the generic checked-handoff speaker choice behind
    `notFlag: read_mara_thumbprint`.
  - Added a focused regression test for the checked thumbprint handoff route.
  - Focused story-path suite passed: 186 tests.
  - `npm run health` passed: format check, TypeScript, 232 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `watch_mara_leave_booth` ->
    `return_from_mara_handoff` -> `check_mara_far_door_before_release` ->
    `carry_checked_thumbprint_handoff_to_speaker` ->
    `carry_thumbprint_handoff_to_far_door` ->
    `pull_release_after_handoff_goodbye`, ending at
    `mara_handoff_true_ending` with score 297 and no objectives.
  - The thumbprint-specific intercom now survives the physical far-door check,
    so players who touched the torn ledger proof hear Mara reinterpret that same
    hand at the final doors before release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether thumbprint-route players use the checked
    far-door speaker payoff. If it is skipped, tune the choice label before
    adding another Mara-only branch.

# Cycle 82 MCP Stdio Launch Recovery

- Date: 2026-06-02
- Main objective: Restore `npm run mcp` as a reliable stdio server entry point.
- Why this matters: Cycle 10 evidence included a failed adaptive MCP route, and
  local evidence-only probing showed the MCP subprocess closing before tool
  discovery. The game loop depends on MCP playthroughs for real route evidence,
  so the server command must stay alive long enough to receive initialized
  stdio messages and answer tool calls.
- Planned work:
  - Inspect the current MCP startup behavior and reproduce the connection
    failure.
  - Change the `npm run mcp` entrypoint to import the MCP module in module eval
    mode instead of launching the TypeScript file as the direct `node --import
tsx` entrypoint.
  - Keep the server process alive while stdin is open, then allow piped MCP
    smoke checks to exit after stdin ends.
  - Run health and an actual playthrough.
- Risks:
  - Node SDK client subprocess writes are unreliable in this sandbox, so the
    verification uses shell-framed MCP JSON over stdin/stdout rather than a
    Vitest client-spawn regression test.
- Status:
  - Completed.
  - `npm run mcp --silent` now answers MCP `initialize` and `tools/list`
    requests over stdio when fed newline-delimited JSON.
  - `npm run health` passed: format check, TypeScript, 231 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unvisited scenes and zero
    unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed the core Mara route through `true_ending` with
    score 305, no objectives, no available choices, and inventory
    `badge`, `fuse`, `lantern`, `map`, `token`.
  - The route remained clear: the service-room preparation, signal-booth proof,
    Mara release, third-car boarding, and final emergency release all chained
    cleanly.
  - A full evidence-only `npm run ai:cycle` was attempted before the final MCP
    launch fix and failed in the SDK client path with `Connection closed`; this
    remains a follow-up for the AI loop client wrapper, while the MCP server
    command itself now speaks stdio correctly.
- Next step:
  - Add a bounded timeout or shell-framed fallback around the AI loop's SDK MCP
    client calls so `npm run ai:cycle` cannot hang or collapse evidence when the
    local stdio client transport misbehaves.

# Cycle 81 Mara Handoff Far-Door Check

- Date: 2026-06-02
- Main objective: Add a physical verification beat to the Mara-only handoff
  route before the emergency release.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current evidence shows healthy completion, full coverage, and no
  unfinished runs. Recent cycles deepened passenger routes with optional
  confirmation beats; the rare `mara_handoff_true_ending` route is
  story-important and benefits from showing Mara physically reaching the far
  doors rather than only saying she will hold them.
- Planned work:
  - Add an optional one-time `mara_handoff_check` scene from
    `mara_handoff_boarding`.
  - Let checked players either carry the moment back through Mara's speaker or
    return directly to the existing release.
  - Preserve existing handoff, thumbprint-handoff, intercom, and direct release
    paths.
  - Cover the new branch in focused story-path tests, then run health and an
    actual playthrough.
- Risks:
  - The handoff boarding scene gains one more choice. It is optional and routes
    back to existing payoff scenes, so it should add grounding without creating
    a new ending family or dead-end.
- Status:
  - Completed.
  - Added `mara_handoff_check`, reachable from Mara's handoff boarding scene.
  - The checked route sets `checked_mara_handoff` and can continue to the
    existing handoff intercom or return to the third-car release.
  - Focused story-path suite passed: 185 tests.
  - `npm run health` passed: format check, TypeScript, 232 tests, validation,
    and coverage playtest.
  - Validation reports 147 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `mara_handoff_check`, with
    zero unvisited scenes and zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `watch_mara_leave_booth` ->
    `return_from_mara_handoff` -> `check_mara_far_door_before_release` ->
    `carry_checked_handoff_to_speaker` ->
    `pull_release_after_handoff_goodbye`, ending at
    `mara_handoff_true_ending` with score 280 and no objectives.
  - The new check makes Mara's handoff feel more physical: she is visibly at
    the last door, on the platform side, before the release fires.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether handoff-route players choose the far-door
    check. If it is skipped, tune the label before adding more Mara-only route
    detail.

# Cycle 80 Lunch-Tin Passenger Check

- Date: 2026-06-02
- Main objective: Add a physical confirmation beat to the lunch-tin passenger
  route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 11 evidence is healthy: all scenes are covered, no random
  runs are unfinished, and the adaptive route naturally reached
  `passenger_lunch_tin_true_ending`. That makes the lunch-tin route a good
  target for story-depth polish rather than structural repair.
- Planned work:
  - Add an optional one-time `passenger_lunch_tin_check` scene from the
    lunch-tin boarding and intercom route.
  - Let checked players continue to the existing intercom, roll-call, or direct
    release payoffs without adding another ending family.
  - Preserve existing direct release and roster paths.
  - Cover the new branch in focused story-path tests, then run health and an
    actual playthrough.
- Risks:
  - The lunch-tin branch gains one more choice. It is optional and returns to
    established payoff scenes, so it should add grounding without trapping
    players or reducing route clarity.
- Status:
  - Completed.
  - Added `passenger_lunch_tin_check`, reachable from the lunch-tin boarding
    scene and from the lunch-tin intercom when it has not already been checked.
  - The checked route sets `checked_lunch_tin_passengers` and can continue to
    the existing lunch-tin intercom, final roster call, or direct ideal ending.
  - Preserved the existing direct release, roster, and intercom routes.
  - Focused story-path suite passed: 184 tests.
  - `npm run health` passed: format check, TypeScript, 230 tests, validation,
    and coverage playtest.
  - Validation reports 146 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_lunch_tin_check`,
    with zero unvisited scenes and zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `let_lunch_tin_worker_keep_count` -> `return_from_passenger_farewell` ->
    `check_lunch_tin_passengers_before_release` ->
    `carry_checked_lunch_tin_count_to_speaker` ->
    `pull_release_after_lunch_tin_intercom`, ending at
    `passenger_lunch_tin_true_ending` with score 319 and no objectives.
  - The new check makes the worker's latch-count easier to read as a human
    boarding count: the child, newspaper woman, old conductor, Mara, and the
    worker are all accounted for before the release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether lunch-tin route players choose the check
    before release. If it is skipped, tune the label before adding more
    lunch-tin branch detail.

# Cycle 79 Answered Passenger Check

- Date: 2026-06-02
- Main objective: Add a physical confirmation beat to the answered-passenger
  boarding route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current cycle evidence shows the game is healthy with all scenes
  covered. The highest-value next step is late-route depth rather than broader
  systems work. Several passenger variants now have a final grounding check
  before release; the answered-roll-call branch still jumped from hearing names
  to ending, so this adds a visible person-behind-each-answer pause.
- Planned work:
  - Add an optional one-time `passenger_answered_check` scene from
    `passenger_answered_boarding`.
  - Let checked players either carry the verified answers to Mara's speaker or
    pull the release directly.
  - Preserve the existing direct intercom and direct release routes.
  - Cover the new branch in focused story-path tests, then run health and an
    actual CLI playthrough.
- Risks:
  - The boarding scene gains one more choice. It is optional, appears once, and
    returns to existing payoff scenes, so it should add texture without
    trapping players.
- Status:
  - Completed.
  - `passenger_answered_check` is reachable from
    `passenger_answered_boarding`, sets `checked_answered_passengers`, and
    confirms the child, newspaper woman, and old conductor before release.
  - Focused story-path suite passed: 184 tests.
  - `npm run health` passed: format check, TypeScript, 229 tests, validation,
    and coverage playtest.
  - Validation reports 145 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_answered_check`, with zero unvisited scenes and zero unfinished
    complete paths.
- Playtest feedback:
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `board_after_answered_passengers` ->
    `check_answered_passengers_before_release` ->
    `carry_checked_answers_to_speaker` ->
    `pull_release_after_answered_intercom`, ending at
    `passenger_answered_true_ending` with score 303 and no objectives.
  - The check usefully grounds the roll call: the child, newspaper woman, and
    old conductor become visible passengers in the car before Mara hears the
    settled answers.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether answered-route players choose the check or
    skip directly to the release. If it is skipped, tune the label before
    adding more answered-route depth.

# Cycle 78 Dark HOME Recovery and Echoed Passenger Check

- Date: 2026-06-02
- Main objective: Add a final recovery beat to the early dark-tunnel HOME
  temptation and deepen the late echoed-passenger route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current cycle evidence is healthy overall, but the adaptive
  exploratory route still reached `lost_ending` immediately after the player
  followed the false HOME light twice. The later train-sign route already has a
  stronger "grip" beat that lets curiosity become either surrender or recovery.
  Separately, the echoed-manifest route could still jump from recognizing
  passenger sounds to release without a physical confirmation beat like the
  newer threshold, room, and keepsake branches.
- Planned work:
  - Route `keep_following_false_home` into a new `dark_home_grip` scene instead
    of directly to `lost_ending`.
  - Preserve the bad ending through an explicit surrender choice.
  - Add recovery choices back to the service-room chain and Mara's dispatcher
    voice.
  - Add an optional `passenger_echoed_check` scene before the echoed-manifest
    release.
  - Let the checked echoed route continue either to Mara's intercom or back to
    the train-car release without adding an ending family.
  - Add focused regression coverage for the new beat, both recovery exits, and
    the preserved lost ending, plus both echoed-check continuations.
  - Run health and an actual CLI playthrough through the changed route.
- Risks:
  - Adding a second warning can soften an early failure. The bad ending remains
    one explicit choice away, while the added recovery improves fairness for
    exploratory players who test the false HOME prompt.
  - The echoed branch gains one more optional choice. It is one-time and
    returns to existing payoff scenes, so it should add grounding without
    over-branching.
- Status:
  - Completed.
  - `dark_home_grip` is reachable from the second false-HOME choice and offers
    recovery to `service_room` or `dispatcher`, plus an explicit preserved
    `lost_ending`.
  - `passenger_echoed_check` is reachable from `passenger_echoed_boarding` and
    lets players match the thermos, newspaper, and mitten sounds to boarded
    passengers before either carrying them to Mara's speaker or reaching the
    release.
  - Focused story-path suite passed: 184 tests.
  - `npm run health` passed: format check, TypeScript, 229 tests, validation,
    and coverage playtest.
  - Validation reports 144 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `dark_home_grip` and
    `passenger_echoed_check`, with zero unvisited scenes and zero unfinished
    complete paths.
- Playtest feedback:
  - Actual CLI play followed `enter_dark` -> `follow_false_home_light` ->
    `keep_following_false_home` -> `yank_chain_from_false_home_grip`, then
    recovered to `service_room` with score 60 and the expected prep objectives
    still active.
  - Actual CLI play followed `board_with_echoed_manifest` ->
    `check_echoed_passengers_before_release` ->
    `carry_checked_echoes_to_speaker` ->
    `pull_release_after_echoed_manifest_goodbye`, ending at
    `passenger_echoed_true_ending` with score 290 and no objectives.
  - The echoed check makes the route read less abstract: the sounds stop being
    clues and become individual passengers aboard the car before Mara asks for
    the release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether early false-HOME explorers recover through
    `dark_home_grip`, and whether echoed-route players choose the check before
    release. If either branch is skipped, tune labels before adding more
    content.

# Cycle 77 Matched Keepsake Check

- Date: 2026-06-02
- Main objective: Add a confirmation beat to the matched-keepsake passenger
  route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full coverage, and strong
  ideal-ending rates, so this cycle invests in late-route story depth. The
  matched-keepsake branch previously moved directly from returning objects to
  the speaker or boarding; the new beat lets players verify that each ordinary
  proof is in the right hands before the final release.
- Planned work:
  - Add an optional one-time `passenger_keepsake_check` scene from the matched
    keepsake handoff.
  - Let the checked route continue to the existing keepsake speaker or boarding
    paths without adding another ending family.
  - Add focused route coverage for both continuations and the ideal ending.
  - Run health and an actual CLI playthrough through the changed route.
- Risks:
  - The keepsake handoff gains one more choice. It is optional, one-time, and
    routes back into existing keepsake payoffs, so it should add texture
    without trapping or over-branching the route.
- Status:
  - Completed.
  - Added `check_matched_keepsakes_before_boarding` and the new
    `passenger_keepsake_check` scene.
  - Added `carry_checked_keepsakes_to_speaker` and
    `lead_checked_keepsakes_to_third_car` continuations into existing
    keepsake intercom/boarding content.
  - Added focused test coverage for the new check scene, both continuations,
    and the resulting `passenger_keepsake_true_ending`.
  - Focused story-path suite passed: 183 tests.
  - `npm run health` passed: format check, TypeScript, 228 tests, validation,
    and coverage playtest.
  - Validation reports 142 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_keepsake_check`, with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `match_manifest_keepsakes` ->
    `check_matched_keepsakes_before_boarding` ->
    `carry_checked_keepsakes_to_speaker` ->
    `hear_final_keepsake_roll_call` ->
    `pull_release_after_keepsake_roll_call`, ending at
    `passenger_keepsake_true_ending` with score 319 and no objectives.
  - The check reads as a useful pause before the final intercom: it makes the
    keepsake proof feel deliberate instead of automatic, then cleanly returns
    to the existing speaker and release cadence.
  - No invalid choices, dead ends, dangling objectives, or coverage
    regressions appeared.
- Next step:
  - Watch blind sessions for whether late-route players choose the check or
    skip directly to boarding. If skipped, tune the label before adding more
    optional keepsake detail.

# Cycle 76 Passenger Sign-Off Boarding Bridge

- Date: 2026-06-02
- Main objective: Make Mara's passenger sign-off actionable after direct
  third-car boarding.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current evidence shows healthy completion, full scene coverage,
  and strong ideal-ending rates. The next useful improvement is story-depth
  polish on a normal late route: asking Mara to sign off to the opened
  passengers should continue to matter after the player boards, not only if
  they immediately choose the explicit gather option.
- Planned work:
  - Add a guarded train-car continuation for players who heard Mara's passenger
    sign-off but have not committed to echoed, answered, or gathered variants.
  - Route that continuation into the existing gathered-passenger intercom and
    `passenger_helped_true_ending` payoff.
  - Preserve existing echoed-manifest train-car recovery branches.
  - Add focused regression coverage, then run health and an actual playthrough.
- Risks:
  - `train_car` has many late-route choices. The new choice is limited by
    `heard_passenger_mara_signoff` and excludes echoed, answered, and already
    gathered branches so it should not crowd specialized routes.
- Status:
  - Completed.
  - Added `carry_mara_signoff_to_gathered_passengers` in `train_car`, guarded
    to appear only after Mara's passenger sign-off and before echoed,
    answered, or already gathered route commitments.
  - The new continuation sets `helped_passengers_gather` and
    `heard_gathered_passengers`, then routes into the existing
    `passenger_gathered_intercom` and `passenger_helped_true_ending` payoff.
  - Preserved the generic `pull_release_with_manifest` option and the
    echoed-manifest train-car recovery branches.
  - Working tree also contains the checked-keepsake route and matching
    regression coverage now present in `stories/demo.yaml` and
    `tests/story-paths.test.ts`; health confirms the combined graph is valid.
  - Focused story-path suite passed: 183 tests.
  - `npm run health` passed: format check, TypeScript, 228 tests, validation,
    and coverage playtest.
  - Validation reports 142 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `ask_mara_to_sign_off_opened_manifest` ->
    `board_after_passenger_mara_signoff` ->
    `carry_mara_signoff_to_gathered_passengers` ->
    `pull_release_after_gathered_intercom`, ending at
    `passenger_helped_true_ending` with score 302 and no objectives.
  - The branch reads naturally: Mara's sign-off establishes that no passenger
    boards alone, and the new third-car choice lets that line become a crowd
    action before the release.
  - No invalid choices, dead ends, dangling objectives, or coverage
    regressions appeared.
- Next step:
  - Watch random and blind play for whether direct sign-off boarders choose the
    new gathered continuation over the generic manifest release. If it is
    skipped, tune the train-car label before adding more sign-off branches.

# Cycle 75 Manifest Count Discovery Bridges

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `mara_manifest_intercom`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current cycle evidence is healthy overall, but the random summaries
  still called out `mara_manifest_intercom` as a normal-player miss even though
  coverage reaches it. The plain opened-manifest route could reach the intercom
  only after boarding the third car, and the ready-check beat could previously
  skip directly to release. This cycle gives players clearer ways to hear
  Mara's final manifest count from both the platform and the ready-check beat.
- Planned work:
  - Add a guarded `passenger_platform` choice for the plain opened-manifest
    route.
  - Tighten `passenger_manifest_ready_intercom` so confirming every passenger
    is aboard naturally carries into Mara's final count.
  - Route that choice to the existing `mara_manifest_intercom` and
    `passenger_manifest_true_ending` payoff.
  - Keep the choice hidden from handoff, answer, gather, echo, threshold, room,
    and reviewed-count variants.
  - Add focused regression coverage, then run health and an actual CLI
    playthrough.
- Risks:
  - `passenger_platform` already has several optional passenger beats. The new
    choice uses the same plain-route guards as the train-car intercom, so it
    should improve discoverability without taking over specialized branches.
- Status:
  - Completed.
  - Added `ask_mara_finish_manifest_from_platform`, which sets
    `heard_mara_goodbye` and routes from `passenger_platform` to the existing
    `mara_manifest_intercom`.
  - Revised `passenger_manifest_ready_intercom` into a single bridge to
    `mara_manifest_intercom`, with text that explicitly says Mara is about to
    finish the count properly.
  - Added focused test coverage for the new platform bridge, its ending path,
    and the unchanged third-car manifest intercom route.
  - Focused story-path suite passed: 181 tests.
  - `npm run health` passed: format check, TypeScript, 226 tests, validation,
    and coverage playtest.
  - Validation reports 141 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `ask_mara_finish_manifest_from_platform` ->
    `pull_release_after_manifest_goodbye`, ending at
    `passenger_manifest_true_ending` with score 281 and no objectives.
  - A second CLI play followed `confirm_manifest_passengers_are_aboard` ->
    `listen_to_mara_finish_ready_manifest` ->
    `let_manifest_names_answer_once` ->
    `pull_release_after_manifest_answers`, ending at
    `passenger_manifest_true_ending` with score 291 and no objectives.
  - The new choice reads naturally on the platform because the passengers are
    already looking to Mara's speaker; asking her to finish the count before
    boarding clarifies why the manifest intercom matters.
  - No invalid choices, dead ends, dangling objectives, or coverage
    regressions appeared.
- Next step:
  - Watch random and blind play for whether `mara_manifest_intercom` appears
    more often from normal routes. If it remains rare, tune the platform label
    before adding more manifest route branches.

# Cycle 74 Manifest Ready Third-Car Check

- Date: 2026-06-02
- Main objective: Add a final third-car confirmation beat for direct manifest
  boarders.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full scene coverage, and
  strong ideal-ending rates, so this cycle continues story-depth polish rather
  than route repair. The direct manifest route could jump from boarding straight
  to release; the new beat lets players verify the opened passengers are truly
  aboard before ending the run.
- Planned work:
  - Add a guarded `train_car` choice for the plain manifest route only.
  - Add a short `passenger_manifest_ready_intercom` scene that confirms the
    newspaper, lunch tin, and mitten passengers are physically aboard.
  - Let the scene either release directly or flow into Mara's existing manifest
    intercom, avoiding a new ending or duplicated payoff.
  - Add focused route coverage, then run health and an actual CLI playthrough.
- Risks:
  - `train_car` already hosts many late-route intercom choices. The new choice
    uses the same guards as the plain manifest intercom, and is hidden from
    answered, gathered, echoed, reviewed-count, threshold, room, and Mara
    handoff variants.
- Status:
  - Completed.
  - Added `confirm_manifest_passengers_are_aboard` from `train_car` for the
    plain manifest route.
  - Added `passenger_manifest_ready_intercom`, confirming the newspaper, lunch
    tin, and mitten passengers are physically aboard before the release.
  - The new scene can either pull directly into `passenger_manifest_true_ending`
    or continue into Mara's existing manifest intercom via
    `listen_to_mara_finish_ready_manifest`.
  - Focused story-path suite passed: 181 tests.
  - `npm run health` passed: format check, TypeScript, 226 tests, validation,
    and coverage playtest.
  - Validation reports 141 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `board_third_car_with_passengers` ->
    `confirm_manifest_passengers_are_aboard` ->
    `pull_release_after_ready_manifest`, ending at
    `passenger_manifest_true_ending` with score 278 and no objectives.
  - The new beat reads well as a final physical check: it turns the manifest
    from abstract names into passengers seated or standing in the third car
    before the player pulls the release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether direct manifest boarders use the
    confirmation beat or skip straight to release. If skipped, tune the label
    before adding more third-car choices.

# Cycle 73 Morning Chorus Gathered Boarding

- Date: 2026-06-02
- Main objective: Make the passenger morning chorus actionable as a gathered
  third-car boarding route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full coverage, and strong
  ideal-ending rates, so this cycle continues focused late-passenger polish.
  The morning chorus is now discoverable from both the opened manifest and
  passenger platform, but it previously offered atmosphere, roll-call answers,
  or direct boarding without letting that shared memory visibly organize the
  crowd.
- Planned work:
  - Add a `passenger_morning_chorus` choice that gathers passengers into the
    third car.
  - Reuse `passenger_gathered_boarding` and the existing
    `passenger_helped_true_ending` payoff.
  - Add focused path coverage for the new gathered-boarding continuation.
  - Run focused tests, full health, and an actual CLI playthrough of the
    changed route.
- Risks:
  - `passenger_morning_chorus` gains one more option. The choice is guarded by
    `helped_passengers_gather` and routes to existing content, so it should
    make the chorus more actionable without adding branch sprawl.
- Status:
  - Completed.
  - Added `gather_after_passenger_morning_chorus`, setting
    `helped_passengers_gather` and routing to `passenger_gathered_boarding`.
  - Added focused route coverage through `passenger_helped_true_ending`.
  - Focused story-path suite passed: 181 tests.
  - `npm run health` passed: format check, TypeScript, 226 tests,
    validation, and coverage playtest.
  - Validation reports 141 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `listen_to_passenger_morning_chorus` ->
    `gather_after_passenger_morning_chorus` ->
    `pull_release_after_gathered_boarding`, ending at
    `passenger_helped_true_ending` with score 295 and no objectives.
  - The new continuation reads cleanly: the passengers remember practical
    mornings, then that shared memory becomes a reason to board by looking
    after one another.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether players use the new morning chorus gather
    option or still choose direct boarding. If it is skipped, tune the label
    before adding more optional late-passenger continuations.
  - Commit/push remains for the outer loop or a less-restricted environment:
    this sandbox can read `.git` but cannot create `.git/index.lock`.

# Cycle 72 Passenger Platform Morning Chorus

- Date: 2026-06-02
- Main objective: Surface the remembered-morning passenger chorus from the
  passenger platform.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full scene coverage, and
  strong ideal-ending rates, so this cycle continues focused story-depth polish
  on a normally reached late passenger route. The morning chorus already gives
  the opened passengers a stronger sense of destination, but it was easiest to
  find before crossing to the passenger platform; this makes that emotional cue
  available at the platform pause too.
- Planned work:
  - Add a guarded `passenger_platform` choice that listens for the passengers'
    remembered mornings.
  - Reuse `passenger_morning_chorus` and `passenger_morning_intercom` instead
    of adding another ending branch.
  - Add focused route coverage for platform discovery, one-time choice
    removal, boarding, and the existing morning payoff.
  - Run focused tests, full health, and an actual CLI playthrough of the
    changed route.
- Risks:
  - `passenger_platform` already has several optional vignettes. The new choice
    is one-time and hidden once answered-name or gathered-passenger branches are
    underway, so it should clarify the destination theme without crowding
    committed routes.
- Status:
  - Completed.
  - Added `listen_for_platform_morning_chorus` from `passenger_platform` to
    the existing `passenger_morning_chorus` scene.
  - Guarded the choice behind `heard_passenger_morning_chorus`,
    `heard_passenger_answers`, and `helped_passengers_gather` so it remains a
    one-time pre-commitment platform reflection.
  - Added focused path coverage for platform discovery, returning to the
    platform, one-time choice removal, boarding, the morning intercom, and the
    existing passenger ideal ending.
  - Focused story-path suite passed: 180 tests.
  - `npm run health` passed: format check, TypeScript, 225 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `listen_for_platform_morning_chorus` ->
    `cross_after_passenger_morning_chorus` ->
    `listen_to_morning_chorus_from_boarding` ->
    `pull_release_after_morning_chorus_boarding`, ending at
    `passenger_true_ending` with score 286 and no objectives.
  - The new beat works as a platform pause: the passengers already look to
    Mara's speaker, so listening for their remembered mornings feels like a
    natural response before boarding.
  - Returning to `passenger_platform` after the chorus is clean; the choice does
    not repeat, and the third-car route carries the remembered-morning payoff
    into the final release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether passenger-platform players choose the
    morning chorus before boarding. If it is skipped, tune the platform text or
    label before adding more optional passenger vignettes.

# Cycle 71 Mara Sign-Off Gathered Boarding

- Date: 2026-06-02
- Main objective: Let Mara's passenger sign-off directly become a shared
  boarding route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full scene coverage, and
  strong ideal-ending rates, so this cycle focused on story-depth polish in a
  normal late passenger route. Cycle 70 surfaced Mara's sign-off from the
  passenger platform, but after the line "no one boards alone" the player still
  had to choose a separate existing hub route to make the passengers gather.
  This cycle makes that cue actionable.
- Planned work:
  - Add a one-time `passenger_mara_signoff` choice that gathers the passengers
    into the third car.
  - Reuse `passenger_gathered_boarding` and its existing intercom/ending
    payoffs instead of adding duplicate branch content.
  - Add focused route coverage for the new sign-off-to-gathered-boarding path.
  - Run focused tests, full health, and an actual CLI playthrough of the
    changed route.
- Risks:
  - `passenger_mara_signoff` gains one more visible option. It is guarded by
    `helped_passengers_gather`, matches the sign-off text directly, and routes
    to existing passenger-core payoff content, so it should clarify rather than
    sprawl.
- Status:
  - Completed.
  - Added `gather_after_mara_signoff`, routing from `passenger_mara_signoff` to
    `passenger_gathered_boarding` and setting `helped_passengers_gather`.
  - Updated the existing sign-off choice-list expectation.
  - Added focused path coverage for platform sign-off -> gathered boarding ->
    `passenger_helped_true_ending`.
  - Focused story-path suite passed: 179 tests.
  - `npm run health` passed: format check, TypeScript, 224 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `ask_mara_to_sign_off_from_platform` -> `gather_after_mara_signoff` ->
    `pull_release_after_gathered_boarding`, ending at
    `passenger_helped_true_ending` with score 306 and no objectives.
  - The sequence now reads as a clean cause-and-effect beat: Mara says no one
    boards alone, the player lets that gather the crowd, and the gathered
    passengers hold the doors together before the release.
  - No invalid choices, dead ends, dangling objectives, or coverage regressions
    appeared.
- Next step:
  - Watch blind sessions for whether players use the new direct gathered
    boarding continuation from the sign-off. If it is skipped, tune the label
    before adding more late-game passenger branches.

# Cycle 70 Passenger Platform Sign-Off Bridge

- Date: 2026-06-02
- Main objective: Surface Mara's passenger sign-off from the passenger platform
  hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current evidence shows healthy completion, full scene coverage, and
  strong ideal-ending rates, so the next best improvement is story-depth polish
  on a normally reached late passenger route. Players who cross to
  `passenger_platform` can currently jump into several passenger vignettes or
  board directly; this cycle adds a clearer Mara-led reassurance beat at that
  exact pause.
- Planned work:
  - Add an optional `passenger_platform` choice to ask Mara to sign off to the
    gathered passengers.
  - Reuse the existing `passenger_mara_signoff` scene and flags.
  - Add focused path coverage showing the new bridge, return, and ending path.
  - Run focused tests, health, and an actual CLI playthrough of the changed
    route.
- Risks:
  - The passenger platform already has many options. The new bridge is guarded
    by the existing sign-off flag and placed near the direct boarding choice so
    it adds a clear optional reassurance beat without disrupting the first
    passenger vignette choices.
- Status:
  - Completed.
  - Added `ask_mara_to_sign_off_from_platform` from `passenger_platform` to the
    existing `passenger_mara_signoff` scene.
  - Guarded the bridge with `heard_passenger_mara_signoff`,
    `heard_passenger_answers`, and `helped_passengers_gather` so it remains a
    one-time pre-boarding reassurance beat.
  - Added focused path coverage for the bridge, return to platform, direct
    boarding, and `passenger_true_ending`.
  - Focused story-path suite passed: 178 tests.
  - `npm run health` passed: format check, TypeScript, 223 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `ask_mara_to_sign_off_from_platform` ->
    `cross_after_passenger_mara_signoff` ->
    `board_third_car_with_passengers` -> `pull_release_with_manifest`, ending
    at `passenger_true_ending` with score 286 and no objectives.
  - The sign-off reads cleanly in context: Mara tells the gathered passengers
    they were held rather than late, and the "no one boards alone" line gives
    the direct passenger-platform route a stronger emotional cue before the
    release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind sessions for whether passenger-platform players use the new
    sign-off or still skip straight to boarding. If they skip it, tune the
    label or platform text before adding more content.

# Cycle 69 Thumbprint Handoff Far-Door Payoff

- Date: 2026-06-02
- Main objective: Route the torn-thumbprint handoff through Mara's far-door
  intercom payoff.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied evidence points at `mara_handoff_intercom` as the one
  scene normal random play missed while coverage reached it. This checkout
  already surfaced the generic pre-boarding handoff choice; the remaining
  high-signal polish was to make the stronger torn-thumbprint handoff also
  carry into the same far-door intercom beat instead of jumping straight to
  the ending.
- Planned work:
  - Change `mara_thumbprint_handoff_intercom` to send Mara toward the far door.
  - Reuse `mara_handoff_intercom` as the shared final physical-handoff payoff.
  - Update focused path coverage for the added thumbprint handoff step.
  - Run health and play the changed route through the CLI.
- Risks:
  - The torn-thumbprint branch gains one extra step before release. This is
    acceptable because it is an optional clue-rich route and gives the player
    the missed `mara_handoff_intercom` payoff with stronger context.
- Status:
  - Completed.
  - Replaced the direct
    `pull_release_after_thumbprint_handoff_goodbye` ending jump with
    `carry_thumbprint_handoff_to_far_door` into `mara_handoff_intercom`.
  - Updated story-path tests for both the thumbprint handoff and generic
    handoff intercom routes.
  - Focused story-path suite passed: 177 tests.
  - Fresh 100-run random playtest now visits all scenes; `unvisitedScenes` is
    empty and `mara_handoff_intercom` appears in `visitedScenes`.
  - `npm run health` passed: format check, TypeScript, 222 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `ask_mara_about_handoff_thumbprint_before_boarding`
    -> `carry_thumbprint_handoff_to_far_door` ->
    `pull_release_after_handoff_goodbye`, ending at
    `mara_handoff_true_ending` with score 293 and no objectives.
  - The revised sequence reads cleaner: the thumbprint explains why Mara can
    leave the ledger, then the shared far-door beat shows what she does with
    that freedom before the player pulls the release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind sessions for whether `mara_handoff_intercom` now appears in
    both generic and thumbprint-informed handoff routes. If players still miss
    it, tune labels before adding more branches.

# Cycle 68 Handoff Intercom Pre-Boarding Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `mara_handoff_intercom`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied cycle evidence is green overall, but the random sample
  missed `mara_handoff_intercom` while coverage reached it. The handoff payoff
  currently requires a player to watch Mara leave the booth, cross with her,
  board the train, and then choose a second listen action; making the listen
  available at the handoff boarding beat better matches the fiction.
- Planned work:
  - Add a direct pre-boarding handoff intercom choice from
    `mara_handoff_boarding`.
  - Keep the direct emergency-release boarding route available.
  - Preserve the torn-thumbprint handoff as the stronger clue-specific branch.
  - Update focused path coverage for the new route and changed choice list.
  - Run health and play the changed route through the CLI or MCP.
- Risks:
  - Adding one more choice to `mara_handoff_boarding` could slightly slow the
    late-game route, but it is only shown after the player has already chosen
    the optional physical handoff branch.
- Status:
  - Completed.
  - Added `listen_to_handoff_before_boarding` from `mara_handoff_boarding` to
    `mara_handoff_intercom`.
  - Kept `board_after_mara_handoff` available so players can still go straight
    to the release.
  - Guarded the new generic handoff listen behind `notFlag: read_mara_thumbprint`
    so the torn-thumbprint handoff remains the stronger clue-specific
    pre-boarding payoff.
  - Updated focused story-path coverage for the new route and revised choice
    lists.
  - Focused story-path suite passed: 177 tests.
  - `npm run health` passed: format check, TypeScript, 222 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
- Playtest feedback:
  - Actual CLI play followed `watch_mara_leave_booth` ->
    `return_from_mara_handoff` -> `listen_to_handoff_before_boarding` ->
    `pull_release_after_handoff_goodbye`, ending at
    `mara_handoff_true_ending` with score 275 and no objectives.
  - The new beat better matches the fiction: once Mara is physically walking
    the platform, the player can listen to her far-door handoff before entering
    the car instead of discovering that payoff only after boarding.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch random and blind playtest sessions for whether
    `mara_handoff_intercom` appears more consistently. If it remains missed,
    tune the handoff choice label or route `watch_mara_leave_booth` directly
    through a stronger prompt.

# Cycle 67 MCP Plain-Text Failure Diagnostics

- Date: 2026-06-02
- Main objective: Restore useful diagnostics for the required MCP playthrough
  when an MCP tool returns plain-text failure output instead of JSON.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Cycle 67 supplied health, validation, coverage, and exploratory
  evidence were green, but the required actual MCP playthrough failed with
  `Unexpected token 'C', "Choice 're"... is not valid JSON`. That masked the
  real illegal-choice payload and made the autonomous loop less able to choose
  the next gameplay improvement from evidence.
- Planned work:
  - Add a shared MCP JSON parser that names the tool and includes a short text
    excerpt when parsing fails.
  - Use it for MCP evidence collection, exploratory routes, and the required
    true-ending route.
  - Add regression coverage for the plain-text illegal-choice payload.
  - Run focused tests, full health, and a real route through the game.
- Risks:
  - This is an evidence-pipeline improvement rather than new story content.
    It is intentionally scoped because the supplied gameplay metrics are
    already healthy and the failed MCP route would otherwise keep obscuring
    future player-facing signals.
- Status:
  - Completed.
  - Added `parseMcpJsonResult` in `src/ai-loop.ts`.
  - Replaced raw `JSON.parse(textContent(...))` calls in MCP evidence,
    exploratory play, and required-route play with the contextual parser.
  - Added a regression test for a `choose_option` payload beginning with
    `Choice 'return_to_service_room'...`.
  - Focused AI-loop test passed.
  - TypeScript lint passed.
  - Investigated local MCP subprocess failures separately; direct launcher and
    keep-alive experiments did not improve the sandbox behavior, so they were
    not kept.
  - `npm run health` passed: format check, TypeScript, 221 tests, validation,
    and coverage playtest.
- Playtest feedback:
  - Evidence-only `npm run ai:cycle` still cannot complete MCP discovery in
    this sandbox; it fails before tool calls with `MCP error -32000:
Connection closed`.
  - The failure is distinct from the original plain-text JSON parse masking
    issue; the parser regression is covered, while local MCP remains an
    environment/SDK transport blocker here.
  - CLI route verification followed `read_notice` -> service-room preparation
    -> `mark_mara_clear_from_ledger` -> `board_after_clearing_mara` ->
    `pull_release`, reaching `true_ending` with score 305 and no objectives.
- Next step:
  - Next cycle should focus on a story-depth improvement unless MCP transport
    diagnostics become the highest blocker again.

# Cycle 62 Unlit-Platform Service-Room Recovery

- Date: 2026-06-02
- Main objective: Make the early unlit-platform escape warning recover directly
  into preparation instead of sending players back to the same dark platform
  loop.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 62 evidence is green overall, but the adaptive
  exploratory route ended at `escape_ending` after retreating from the unlit
  platform, and random non-ideal pressure still includes 12% escape endings.
  The warning text already points at the nearby service-room door; the recovery
  choice should use that concrete route.
- Planned work:
  - Route `return_to_platform_from_escape_warning` to `service_room` and mark
    the player as having left the platform unprepared.
  - Route the one-time unlit glance recovery to `service_room` as well, while
    preserving its clock-token clue.
  - Keep the explicit escape choices available.
  - Update focused story-path coverage for both recovery paths.
  - Run health and play the changed route through the CLI.
- Risks:
  - Returning to `service_room` is a stronger nudge than returning to the
    platform. This is intentional for the early unlit warning; the player can
    still choose the escape ending from either warning scene.
- Status:
  - Completed.
  - Routed `return_to_platform_from_escape_warning` directly to
    `service_room`, with `left_unprepared_platform` and
    `returned_from_unlit_escape_warning` set.
  - Routed `return_after_unlit_escape_glance` directly to `service_room` with
    the same recovery flag, while preserving the clock-token clue from the
    glance.
  - Added the new recovery flag to the unlit platform requirements so the
    player cannot immediately loop back to the same unlit platform until they
    recover the fuse.
  - Preserved explicit escape choices from both warning scenes.
  - Updated focused story-path coverage for direct warning recovery and
    one-time glance recovery.
  - Focused story-path suite passed: 176 tests.
  - `npm run health` passed: format check, TypeScript, 221 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `retreat_to_stairs_from_platform` ->
    `return_to_platform_from_escape_warning` -> service-room prep ->
    `follow_arrows` -> `true_ending`, ending with score 287 and no objectives.
- Playtest feedback:
  - The changed recovery reads better because it uses the service-room door
    named in the warning text instead of bouncing the player back to the same
    dark platform.
  - The direct recovery does not reveal the clock token by itself, so reading
    Mara's personnel file remains a useful clue step.
  - Once the fuse is recovered, returning from the tunnel to Platform 13 works
    cleanly despite the new anti-loop flag.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch adaptive routes for whether early `escape_ending` pressure drops; if
    players still flee immediately, tune the escape confirmation label or
    require one more glance before final escape.

# Cycle 61 Reviewed-Count Blank-Space Bridge

- Date: 2026-06-02
- Main objective: Make the late reviewed-count intercom preserve the
  `passenger_missing_count` clarification beat.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied evidence shows healthy completion and says to invest in
  richer story depth; prior lunch-tin discovery work is already present in this
  checkout. The reviewed-count route could board directly into the intercom and
  skip the strongest explanation that the "missing" row is Mara's old last
  place in the line.
- Planned work:
  - Preserve direct reviewed-count chorus and release choices.
  - Add an optional intercom choice from `passenger_counted_manifest_intercom`
    to `passenger_missing_count`.
  - Prevent the bridge from looping after the blank-space clarification is
    seen.
  - Add regression coverage for the bridge and the preserved direct chorus
    route.
  - Run health and play the changed route through the CLI.
- Risks:
  - The reviewed-count intercom gains one more choice. It is optional and hides
    after use, while the immediate release and finish-count routes remain
    available.
- Status:
  - Completed.
  - Added `ask_who_reviewed_count_left_blank` from
    `passenger_counted_manifest_intercom` to `passenger_missing_count`.
  - Kept the direct reviewed-count chorus and both release choices available.
  - Hid the blank-space bridge after the player sees it, preventing a repeated
    clarification loop.
  - Extended focused story-path coverage for the new bridge, the hidden
    repeat, and the preserved direct chorus path.
  - Focused story-path suite passed: 176 tests.
  - `npm run health` passed: format check, TypeScript, 220 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `board_with_reviewed_manifest_count` ->
    `ask_who_reviewed_count_left_blank` ->
    `board_with_unanswered_row_resolved` ->
    `pull_release_after_counted_manifest_goodbye`, ending at
    `passenger_counted_true_ending` with score 288 and no objectives.
- Playtest feedback:
  - The new choice clarifies that the old blank space belongs to the line's
    habit of making Mara last, not to an actually missing passenger.
  - Returning from the clarification to the intercom is mechanically clean, but
    it repeats the intercom paragraph; acceptable for this small optional bridge
    and worth watching in blind sessions.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch whether blind players understand the distinction between reviewed
    count, missing row, and final chorus; if confusion remains, tune the
    returned intercom copy rather than adding more branches.

# Cycle 66 Lunch-Tin Boarding Roll-Call Target

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of
  `passenger_lunch_tin_roll_call` from the lunch-tin boarding scene.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 66 evidence shows all coverage green, but the
  random sample still missed `passenger_lunch_tin_roll_call` while naming it as
  the suggested next action. Prior cycles made the scene reachable through the
  roster and intercom; the remaining discoverability leak was that the
  prominent boarding choice `let_lunch_tin_count_become_roll_call` still routed
  to the generic final roll call instead of the lunch-tin-specific payoff.
- Planned work:
  - Route `let_lunch_tin_count_become_roll_call` from
    `passenger_lunch_tin_boarding` to `passenger_lunch_tin_roll_call`.
  - Rename the choice so it promises a roster call rather than the generic
    shared roll call.
  - Set `read_lunch_tin_roster` on that path because the worker reads from the
    roster in the target scene.
  - Preserve direct lunch-tin release, roster, and intercom options.
  - Update focused story-path regression coverage.
  - Run health and play the changed route through the CLI.
- Risks:
  - The generic `passenger_roll_call_epilogue` is no longer reachable from this
    one lunch-tin boarding choice, but the generic roll-call route remains
    available from gathered boarding, conductor, mitten, and other passenger
    branches. This tradeoff keeps the lunch-tin scene's most obvious roll-call
    action aligned with its specific payoff.
- Status:
  - Completed.
  - Routed `let_lunch_tin_count_become_roll_call` from
    `passenger_lunch_tin_boarding` to `passenger_lunch_tin_roll_call`.
  - Updated the choice label to promise a final roster call.
  - Set `read_lunch_tin_roster` on that path.
  - Focused story-path suite passed: 176 tests.
  - `npm run health` passed: format check, TypeScript, 220 tests,
    validation, and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `let_lunch_tin_worker_keep_count` ->
    `return_from_passenger_farewell` ->
    `let_lunch_tin_count_become_roll_call` ->
    `pull_release_after_lunch_tin_roll_call`, ending at
    `passenger_lunch_tin_true_ending` with score 309 and no objectives.
- Playtest feedback:
  - The boarding choice now delivers the exact lunch-tin roster roll-call beat
    it advertises.
  - The route reads cleanly as latch-count, named roster, release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch random-play samples for whether `passenger_lunch_tin_roll_call`
    appears consistently; if late passenger choice density feels high, tune
    ordering rather than adding more branches.

# Cycle 65 Last-Dispatch Handoff Bridge

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of Mara's physical handoff
  after players choose the prominent last-dispatch beat.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied loop evidence shows healthy core guidance and suggests
  investing in richer story depth. Prior lunch-tin discoverability work is
  already present in this checkout, while `mara_handoff_true_ending` remains a
  lower-frequency normal-play payoff. The first option after freeing Mara asks
  for her last dispatch, but that route previously narrowed to a speaker-only
  goodbye instead of preserving the handoff discovery.
- Planned work:
  - Preserve direct last-dispatch intercom and release paths.
  - Add an optional route from `mara_last_dispatch` into
    `mara_handoff_boarding`.
  - Keep the route as a handoff continuation, not a forced detour.
  - Add regression coverage for the new bridge and old direct release choice.
  - Run health and play the changed route through the CLI.
- Risks:
  - `mara_last_dispatch` gains a third choice. The direct intercom and direct
    board-with-dispatch options remain available, so pacing stays under player
    control.
- Status:
  - Completed.
  - Added `let_last_dispatch_become_handoff` from `mara_last_dispatch` to
    `mara_handoff_boarding`.
  - Preserved the direct last-dispatch intercom and direct board-with-dispatch
    paths.
  - Added regression coverage for the new handoff bridge; focused story-path
    coverage now has 176 tests.
  - `npm run health` passed: format check, TypeScript, 220 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths;
    `mara_handoff_true_ending` coverage count rose from the prior 21 baseline
    to 41 in the exhaustive sample.
  - Actual CLI play followed `ask_mara_for_last_dispatch` ->
    `let_last_dispatch_become_handoff` -> `board_after_mara_handoff` ->
    `listen_to_mara_after_handoff` -> `pull_release_after_handoff_goodbye`,
    ending at `mara_handoff_true_ending` with score 294 and no objectives.
- Playtest feedback:
  - The new route reads naturally: Mara's spoken dispatch can now become an
    embodied departure from the booth instead of only a speaker goodbye.
  - Direct release pacing remains intact through the existing last-dispatch
    intercom path.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch the next random sample for whether `mara_handoff_true_ending` appears
    more often in normal play; if late Mara choices feel crowded, tune ordering
    before adding another branch.

# Cycle 65 Lunch-Tin Intercom Roll-Call Target

- Date: 2026-06-02
- Main objective: Make the `hear_final_lunch_tin_roll_call` intercom choice
  land on the specific `passenger_lunch_tin_roll_call` payoff.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 65 evidence still names
  `passenger_lunch_tin_roll_call` as the remaining normal-play discovery gap.
  Cycle 64 already made the roster recovery path available, but the intercom
  choice named like a lunch-tin roll call still routed to the generic
  `passenger_roll_call_epilogue`, so a normal player could choose the apparent
  lunch-tin payoff and miss the exact scene.
- Planned work:
  - Preserve the direct lunch-tin release and the broader boarding-to-roll-call
    bridge.
  - Route `hear_final_lunch_tin_roll_call` from `passenger_lunch_tin_intercom`
    to `passenger_lunch_tin_roll_call`.
  - Set `read_lunch_tin_roster` when the worker reads the roster aloud during
    that route.
  - Extend regression coverage for the intercom-to-roster-roll-call path.
  - Run health and play the changed route through the CLI.
- Risks:
  - The intercom choice now produces the specific lunch-tin ending branch
    instead of the generic roll-call ending. The generic route remains available
    from `passenger_lunch_tin_boarding` through
    `let_lunch_tin_count_become_roll_call`, so route variety is preserved.
- Status:
  - Completed.
  - Routed `hear_final_lunch_tin_roll_call` from
    `passenger_lunch_tin_intercom` to `passenger_lunch_tin_roll_call`.
  - Updated the choice label so it names the roster-read action.
  - Set `read_lunch_tin_roster` on that path because the worker reads the
    roster aloud.
  - Extended regression coverage through `passenger_lunch_tin_true_ending`.
  - Focused story-path suite passed: 176 tests.
  - `npm run health` passed: format check, TypeScript, 220 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `listen_to_lunch_tin_worker_from_boarding` ->
    `hear_final_lunch_tin_roll_call` -> `pull_release_after_lunch_tin_roll_call`,
    ending at `passenger_lunch_tin_true_ending` with score 315 and no
    objectives.
- Playtest feedback:
  - The intercom label now delivers the exact lunch-tin roll-call scene it
    advertises.
  - The route reads cleanly: boarding rhythm, intercom timing, roster roll call,
    release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch random-play samples for whether `passenger_lunch_tin_roll_call`
    appears without relying on coverage strategy; if it still stays rare, tune
    ordering before adding more late passenger branches.

# Cycle 64 Roster-to-Intercom Recovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `passenger_lunch_tin_intercom`
  after players inspect the lunch-tin roster.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 64 evidence names
  `passenger_lunch_tin_roll_call` as the remaining normal-play discovery target.
  The lunch-tin route already had a strong roster clue, but reading that roster
  could skip the embodied third-car intercom beat that teaches the worker's
  count as movement before the roster-specific roll call.
- Planned work:
  - Preserve direct `passenger_lunch_tin_true_ending` releases.
  - Preserve the roster-specific roll-call branch.
  - Add an optional route from `passenger_lunch_tin_roster` back to
    `passenger_lunch_tin_intercom`.
  - Add regression coverage proving the new recovery route and old direct
    release both remain valid.
  - Run health and play the changed route through the CLI.
- Risks:
  - The roster scene gains a third choice. It is optional and ordered as a
    sensory listen beat before the existing roll-call and release options, so it
    should improve discoverability without forcing extra pacing.
- Status:
  - Completed.
  - Added `listen_after_reading_lunch_tin_roster` from the roster scene to the
    lunch-tin intercom.
  - Updated focused story-path coverage; 175 story-path tests passed.
  - `npm run health` passed: format check, TypeScript, 219 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `read_lunch_tin_roster_from_boarding` ->
    `listen_after_reading_lunch_tin_roster` ->
    `pull_release_after_lunch_tin_intercom`, ending at
    `passenger_lunch_tin_true_ending` with score 320 and no objectives.
- Playtest feedback:
  - The roster clue now keeps the embodied lunch-tin timing beat available
    instead of narrowing immediately to roster-specific roll call or release.
  - The direct roster release and roster roll-call branch remain visible, so
    the added recovery beat does not block quick completion.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch the next random sample for whether `passenger_lunch_tin_intercom`
    appears more consistently in normal play; if late passenger choice density
    rises, tune ordering before adding more branches.

# Cycle 63 Lunch-Tin Roll-Call Bridge

- Date: 2026-06-02
- Main objective: Let the lunch-tin boarding beat flow into the broader final
  passenger roll call without removing its direct ending.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 58 evidence shows healthy coverage and high ideal-ending
  rates. The best focused improvement is richer late-game route texture: the
  lunch-tin worker already sets a practical boarding rhythm, so players should
  be able to turn that rhythm into the shared roll-call payoff instead of only
  choosing between lunch-tin-specific flavor and immediate release.
- Planned work:
  - Preserve direct `passenger_lunch_tin_true_ending` release.
  - Add an optional bridge from `passenger_lunch_tin_boarding` to
    `passenger_roll_call_epilogue`.
  - Add regression coverage for the bridge and its final
    `passenger_roll_call_true_ending`.
  - Run health and play the changed route through the CLI.
- Risks:
  - The lunch-tin boarding scene gains one more choice. The direct release and
    roster/intercom beats remain available, so pacing stays under player
    control.
- Status:
  - Completed.
  - Added `let_lunch_tin_count_become_roll_call` from
    `passenger_lunch_tin_boarding` to `passenger_roll_call_epilogue`.
  - Preserved direct lunch-tin release, lunch-tin intercom, and roster branches.
  - Extended regression coverage through `passenger_roll_call_true_ending`.
  - Focused story-path suite passed: 175 tests.
  - `npm run health` passed: format check, TypeScript, 219 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed the lunch-tin pace route through
    `let_lunch_tin_count_become_roll_call` and
    `pull_release_after_final_roll_call`, ending at
    `passenger_roll_call_true_ending` with score 293 and no objectives.
- Playtest feedback:
  - The bridge reads naturally because the worker's latch-count is already
    framed as a practical rhythm for the crowd.
  - The direct `passenger_lunch_tin_true_ending` remains one click away, so the
    added choice improves depth without forcing extra pacing.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind sessions for whether late passenger scenes now feel too dense;
    if so, tune choice ordering before adding another branch.

# Cycle 62 Manifest Answers Boarding Bridge

- Date: 2026-06-02
- Main objective: Make the manifest-answer branch read and test like a complete
  passenger boarding route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 62 evidence shows healthy coverage with high ideal-ending
  rates. The best focused improvement was to strengthen late-game route depth:
  after the opened manifest names answer, normal players should be able to carry
  that answer beat into the fuller passenger roll-call route instead of only
  ending immediately.
- Planned work:
  - Preserve the direct `passenger_manifest_true_ending` release.
  - Keep the optional bridge from `passenger_manifest_answers` to
    `passenger_answers`.
  - Clarify the bridge label so it points toward third-car boarding.
  - Extend regression coverage through boarding and release.
  - Run health and play the changed route through the CLI.
- Risks:
  - The branch adds an extra optional choice to a clean release beat. The direct
    release remains available, so pacing stays under player control.
- Status:
  - Completed.
  - Renamed the bridge label to `Carry the manifest answers toward the third car`.
  - Extended the manifest-answer regression through `passenger_answers`,
    `passenger_answered_boarding`, and
    `passenger_answered_boarding_true_ending`, while still asserting the direct
    manifest release.
  - Focused story-path suite passed: 175 tests.
  - `npm run health` passed: format check, TypeScript, 219 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `let_opened_manifest_names_answer_once` ->
    `carry_manifest_answers_to_platform` -> `board_after_answered_passengers`
    -> `pull_release_after_answered_boarding`, ending at
    `passenger_answered_boarding_true_ending` with score 303 and no objectives.
- Playtest feedback:
  - The new label makes the optional bridge read like a concrete boarding action
    rather than abstract flavor.
  - The route now flows cleanly from manifest proof, to answered roll call, to
    boarding, to release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind sessions for late-game choice density around
    `passenger_manifest_answers` and `passenger_answers`; if players hesitate,
    tune choice ordering before adding more passenger variants.

# Cycle 57 Manifest Answers Bridge

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `passenger_answers` from an
  already-discovered manifest-answer route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 57 random sample reached all scenes except
  `passenger_answers`. Coverage proved the scene is reachable, but normal play
  could hit `passenger_manifest_answers` and immediately end before seeing the
  fuller answered-passengers beat.
- Planned work:
  - Add an optional bridge from `passenger_manifest_answers` to
    `passenger_answers`.
  - Preserve the direct `passenger_manifest_true_ending` release.
  - Add regression coverage for both the new bridge and the old direct release.
  - Run health and play the updated route through the CLI.
- Risks:
  - This adds a second choice to a clean release beat. The direct release stays
    available, so the change should improve discoverability without forcing an
    extra scene.
- Status:
  - Completed in Cycle 62.
- Playtest feedback:
  - Focused CLI playthrough completed in Cycle 62 and reached
    `passenger_answered_boarding_true_ending` with no objectives.
- Next step:
  - Watch blind sessions for late-game choice density around the manifest-answer
    bridge before adding more branches.

# Cycle 61 Manifest Objective Alignment

- Date: 2026-06-02
- Main objective: Align the post-manifest player objective with the visible
  manifest-door action.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 61 evidence points at adaptive exploration
  stalling around late hub returns. After a player reads the kept-passenger
  manifest, the route correctly offers `clear_manifest_and_mara_from_ledger`,
  but the active objective still said to clear only Mara's ledger entry. That
  stale guidance could make the passenger route feel like a detour instead of
  the intended next action.
- Planned work:
  - Change the `read_passenger_manifest` objective to name opening the
    kept-passenger manifest doors.
  - Add a regression assertion on the ledger-first manifest route.
  - Run health and play the updated manifest route through the CLI.
- Risks:
  - This is a player-guidance change, not a route-graph change. It should not
    affect ending balance, but it depends on objective copy staying consistent
    with existing choice labels.
- Status:
  - Updated the objective from `Clear Mara's ledger entry with her badge proof.`
    to `Open the kept-passenger manifest doors with Mara's badge proof.`
  - Added regression coverage proving that, after
    `return_to_signal_ledger_from_manifest`, the new manifest-door objective is
    active and the stale Mara-only objective is absent.
  - Focused story-path suite passed: 175 tests.
  - `npm run health` passed: format check, TypeScript, 219 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `read_manifest_from_ledger` ->
    `return_to_signal_ledger_from_manifest` ->
    `clear_manifest_and_mara_from_ledger` -> room-making route, ending at
    `passenger_true_ending` with score 264 and no objectives.
- Playtest feedback:
  - The corrected objective now matches the visible manifest-door choice,
    making the passenger route read as the next task rather than a contradiction
    of the manifest clue.
  - A live objective check at `signal_ledger` showed the corrected objective
    before the route continued.
  - No validation errors, dead ends, or dangling objectives appeared on the
    completed route.
- Next step:
  - Continue watching adaptive-play transcripts for late-game stalls at
    `passenger_platform`; if players still hesitate, tune choice ordering or
    objective copy there before adding more passenger branches.

# Cycle 56 Dark Platform Glance

- Date: 2026-06-02
- Main objective: Make the unlit platform escape warning more recoverable
  without removing early escape.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 56 MCP route abandoned the game at
  `warned_escape_ending` after hearing Mara name the signal key. That ending is
  valid, but the unlit branch had less reflective guidance than the lit
  platform escape branch. A one-time glance gives normal players a clearer
  "next piece has a place" moment before they decide whether to leave or return.
- Planned work:
  - Add an optional dark-platform glance from `platform_escape_warning`.
  - Preserve the existing listen, return, and direct flee choices.
  - Set token-location clue state from the glance.
  - Add regression coverage for return and escape from the new scene.
  - Run health and play the changed route through the CLI.
- Risks:
  - The early escape warning gains a fourth choice. This is acceptable because
    it mirrors the existing lit-platform glance and remains optional.
- Status:
  - Added `look_back_from_unlit_escape_warning` from
    `platform_escape_warning`.
  - Added `unlit_escape_platform_glance`, which points players toward the
    stopped clock/token relationship while still allowing escape.
  - Added tests proving the new scene is one-time, sets
    `knows_token_location`, returns cleanly to `platform`, and still permits
    `escape_ending`.
  - The final workspace also includes a manifest-objective alignment now
    asserted by tests: after reading the kept-passenger manifest, the active
    objective names opening the manifest doors instead of clearing only Mara.
  - Focused story-path suite passed: 175 tests.
  - `npm run health` passed: format check, TypeScript, 219 tests, validation,
    and coverage playtest.
  - Validation reports 140 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `retreat_to_stairs_from_platform` ->
    `look_back_from_unlit_escape_warning` ->
    `listen_after_unlit_escape_glance` -> `return_from_stairwell_call` ->
    `take_token_return_to_dark_platform`, then completed the core route at
    `true_ending` with score 281 and no objectives.
- Playtest feedback:
  - The new beat makes the unlit stairwell retreat feel less like a binary
    quit/continue prompt and more like a last chance to understand the token.
  - Returning from the glance to Platform 13 keeps the player in familiar space,
    while listening to Mara still routes directly to the stopped clock.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind sessions for whether early escape choices feel too crowded. If
    so, tune labels or ordering around `platform_escape_warning` before adding
    more early-route guidance.

# Cycle 60 Lunch-Tin Roster Roll Call

- Date: 2026-06-02
- Main objective: Add a stronger optional payoff after reading the lunch-tin
  worker's roster.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 60 evidence shows healthy validation,
  complete coverage, and high ideal-ending rates. The best next investment is
  richer late-game story depth. The lunch-tin path is high-traffic in random
  samples and already has a concrete roster proof, but reading that roster
  previously led straight to release. A lunch-tin-specific roll-call beat lets
  the roster become an action before the ending.
- Planned work:
  - Add an optional `passenger_lunch_tin_roll_call` scene from the roster.
  - Keep the direct roster release available for players who want the shorter
    path.
  - Add regression coverage for roster -> roll call -> lunch-tin ending.
  - Run health and play the changed route through the CLI.
- Risks:
  - The branch adds one extra optional beat on an already successful route.
    This is acceptable because it preserves the direct release and reinforces
    the route's existing object logic.
- Status:
  - Added `hear_roster_clock_out_roll_call` from `passenger_lunch_tin_roster`
    to the new `passenger_lunch_tin_roll_call` scene.
  - The new scene keeps the ending family unchanged by routing back to
    `passenger_lunch_tin_true_ending`.
  - Updated lunch-tin regression coverage for the new choice order and
    roll-call scene.
  - Focused story-path suite passed: 174 tests.
  - `npm run health` passed: format check, TypeScript, 218 tests, validation,
    and coverage playtest.
  - Validation reports 139 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `read_lunch_tin_roster_from_boarding` ->
    `hear_roster_clock_out_roll_call` ->
    `pull_release_after_lunch_tin_roll_call`, ending at
    `passenger_lunch_tin_true_ending` with score 315 and no objectives.
- Playtest feedback:
  - The route now makes the roster feel like a played action instead of static
    flavor: the worker clocks out each named passenger before the release.
  - The direct release remains available from the roster scene, so pacing stays
    under player control.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch blind and random samples for late-game choice overload around
    `passenger_lunch_tin_boarding` and `passenger_room_boarding`; if players
    stall there, tune labels or ordering before adding more branches.

# Cycle 55 Room-To-Newspaper Bridge

- Date: 2026-06-02
- Main objective: Surface `passenger_newspaper_true_ending` from the high-traffic
  room-making scene.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 55 evidence. Health,
  validation, coverage, and MCP play are green, but the short random sample
  only reached `passenger_newspaper_true_ending` once. Recent cycles made
  `passenger_room_boarding` easier to discover, and that scene already names
  the newspaper bundle as part of making physical space. Letting players unfold
  it there turns a visible prop into a natural route toward the newspaper
  transfer payoff.
- Planned work:
  - Add a room-making choice that enters the existing newspaper memory chain.
  - Preserve the existing room intercom, conductor-clear, and direct-release
    routes.
  - Add regression coverage proving the new bridge reaches the restored
    transfer column and `passenger_newspaper_true_ending`.
  - Run health and play the changed route.
- Risks:
  - The room-making scene gains a fourth choice. This is acceptable because the
    new option uses a prop already described in the scene and leads into an
    existing optional branch rather than adding a new ending.
- Status:
  - Added `unfold_newspaper_bundle_after_making_room` from
    `passenger_room_boarding` to `passenger_newspaper_memory`.
  - Preserved the existing room intercom, conductor-clear, and direct-release
    routes.
  - Added regression coverage for the new bridge through
    `passenger_newspaper_memory`, `passenger_newspaper_transfer`,
    `passenger_newspaper_intercom`, and `passenger_newspaper_true_ending`.
  - Updated stale lunch-tin roster regression coverage so the optional roster
    roll-call beat and direct roster release are both represented.
  - Focused story-path suite passed: 174 tests.
  - `npm run health` passed: format check, TypeScript, 218 tests, validation,
    and coverage playtest.
  - Validation reports 139 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `make_room_from_opened_manifest` ->
    `unfold_newspaper_bundle_after_making_room` ->
    `study_newspaper_transfer_column` ->
    `carry_newspaper_transfer_to_third_car` ->
    `pull_release_after_gathered_intercom`, ending at
    `passenger_newspaper_true_ending` with score 296 and no objectives.
- Playtest feedback:
  - The new choice reads naturally because the room-making scene already has the
    player lift the newspaper bundle from the aisle.
  - The route now turns physical room-making into restored destination context:
    room, newspaper memory, transfer column, shared release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch short random samples for whether `passenger_newspaper_true_ending`
    appears more consistently. If `passenger_manifest_thumbprint_true_ending`
    remains underrepresented, consider a similarly small bridge from an
    already-visible manifest handoff or thumbprint prompt.

# Cycle 59 Opened Manifest Room Boarding

- Date: 2026-06-02
- Main objective: Make `passenger_room_boarding` appear on the direct opened
  manifest room-making route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 59 evidence. Health and MCP
  play are green, but the short random sample still missed
  `passenger_room_boarding` while suggesting it as a normal-play discovery
  target. The main opened-manifest choice says the player makes room in the
  third car, but it skipped the physical room-making scene and jumped straight
  to Mara's intercom payoff. Sending that choice through
  `passenger_room_boarding` exposes the stronger player action and also keeps
  the room-made conductor branch visible from a high-traffic route.
- Planned work:
  - Route `make_room_from_opened_manifest` to `passenger_room_boarding`.
  - Do not set `heard_mara_goodbye` until the player actually chooses the room
    intercom beat.
  - Update regression coverage for the revised opened-manifest room route.
  - Run health and play the changed route.
- Risks:
  - The route adds one extra beat before the shared-release payoff. This is
    acceptable because the scene makes the player's action concrete and still
    offers direct release, intercom, and conductor-clear options.
- Status:
  - Routed `make_room_from_opened_manifest` to `passenger_room_boarding`
    instead of skipping directly to `passenger_room_intercom`.
  - Removed the early `heard_mara_goodbye` effect from that choice so Mara's
    intercom goodbye is only set after `listen_to_room_made_for_passengers`.
  - Updated regression coverage for the opened-manifest room route through
    `passenger_room_boarding`, `passenger_room_intercom`,
    `passenger_room_release`, and `passenger_true_ending`.
  - Focused story-path suite passed: 173 tests.
  - `npm run health` passed: format check, TypeScript, 217 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `make_room_from_opened_manifest` ->
    `listen_to_room_made_for_passengers` ->
    `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 254 and no objectives.
- Playtest feedback:
  - The revised route reads more physically: the player first makes room in the
    third car, then hears Mara name what that action proves.
  - The choice no longer marks the intercom beat as heard before the player
    chooses it.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch the next short random sample for whether `passenger_room_boarding`
    appears consistently. If `passenger_conductor_true_ending` remains
    underrepresented, tune the high-traffic room scene's conductor choice label
    or ordering rather than adding another late branch.

# Cycle 58 Room-Made Conductor Clear

- Date: 2026-06-02
- Main objective: Make `passenger_conductor_true_ending` easier to discover
  from the newly surfaced room-making route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 58 evidence. Health and
  coverage are strong, but short random samples can still miss
  `passenger_conductor_true_ending` even though `passenger_room_boarding` is now
  easier to reach. Once players physically make room in the third car, asking
  the old conductor to call that room clear is a natural next action and turns
  the under-discovered conductor payoff into a visible branch.
- Planned work:
  - Add a conductor-clear choice from `passenger_room_boarding`.
  - Set the same passenger-answer and conductor-clear flags expected by the
    conductor signal scene.
  - Preserve the existing room intercom and direct release routes.
  - Add regression coverage, run health, and play the changed route.
- Risks:
  - The room-making scene gains a third option. This is acceptable because the
    new option is thematically distinct from listening to Mara or reaching the
    release directly.
- Status:
  - Added `ask_conductor_to_clear_room_made` from `passenger_room_boarding` to
    `passenger_conductor_signal`.
  - The new choice sets `heard_passenger_answers`,
    `helped_passengers_gather`, and `conductor_cleared_platform` so the
    conductor signal scene has the expected context.
  - Preserved the existing room intercom and direct release choices from
    `passenger_room_boarding`.
  - Added regression coverage for the room-made conductor route through
    `passenger_conductor_true_ending`.
  - Focused story-path suite passed: 173 tests.
  - `npm run health` passed: format check, TypeScript, 217 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `make_room_for_passengers_in_third_car` ->
    `ask_conductor_to_clear_room_made` -> `pull_release_on_conductor_signal`,
    ending at `passenger_conductor_true_ending` with score 303 and no
    objectives.
- Playtest feedback:
  - The new choice reads naturally after the player has physically made room in
    the third car; the conductor's "Platform clear" call now has a direct place
    in that branch.
  - The existing room-made shared-release route remains available and still
    tested cleanly to `passenger_true_ending`.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch the next short random sample for `passenger_conductor_true_ending`.
    If it still underappears, consider improving the choice order or label at
    `passenger_answers` before adding more late conductor branches.

# Cycle 53 Answered Passenger Room Bridge

- Date: 2026-06-02
- Main objective: Make `passenger_room_boarding` easier to discover after
  players listen to the opened passengers answer roll call.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 53 evidence. Health and
  coverage are strong, but short random samples can still miss
  `passenger_room_boarding`. The passenger-answer scene says the third car is
  ready, yet returning through the answered crowd hides the direct room-making
  branch because `heard_passenger_answers` is already set. A contextual
  room-making choice lets a natural answer-listening route find the existing
  shared-release scene.
- Planned work:
  - Add a `passenger_answers` choice that enters `passenger_room_boarding`.
  - Keep the reviewed-count route focused on its counted release payoff.
  - Preserve existing conductor, lunch-tin, newspaper, answered-board, and
    handoff branches.
  - Add regression coverage, run health, and play the changed route.
- Risks:
  - The answer scene gains one more choice. The tradeoff is acceptable because
    it exposes an existing, high-quality passenger payoff that normal play can
    currently bypass.
- Status:
  - Added `make_room_after_answered_names` from `passenger_answers` to
    `passenger_room_boarding`.
  - Guarded the new bridge out of reviewed-count routes so
    `pull_release_after_answered_count` remains the count-specific payoff.
  - Preserved existing newspaper, gather, lunch-tin, conductor, Mara handoff,
    answered-intercom, and answered-boarding choices.
  - Added regression coverage for the new route through
    `passenger_room_boarding`, `passenger_room_intercom`, and
    `passenger_room_release`.
  - Focused story-path suite passed: 173 tests.
  - `npm run health` passed: format check, TypeScript, 217 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `make_room_after_answered_names` -> `listen_to_room_made_for_passengers`
    -> `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 290 and no objectives.
- Playtest feedback:
  - The new choice reads naturally after the answer scene's "third car is
    ready" prompt and exposes the stronger shared-release sequence.
  - The route feels coherent: answered names become physical room, then shared
    action on the release.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch the next short random sample for `passenger_room_boarding` frequency.
    If it still underappears, consider moving the room-making prompt earlier in
    `passengers_released` rather than adding more late-branch options.

# Cycle 57 Direct Manifest Handoff Release

- Date: 2026-06-02
- Main objective: Make `passenger_manifest_handoff_true_ending` easier to
  discover from the opened-manifest handoff route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 57 evidence. Core health is
  strong and coverage reaches every scene, but short random samples still miss
  `mara_manifest_handoff_intercom` and
  `passenger_manifest_handoff_true_ending`. The handoff scene already tells the
  player the third car is asking for the release; a direct release option lets
  that promise pay off without requiring an extra intercom step.
- Planned work:
  - Add an immediate release choice from `mara_manifest_handoff` to
    `passenger_manifest_handoff_true_ending`.
  - Preserve the existing board-to-intercom route and other passenger handoff
    branches.
  - Set `heard_mara_goodbye` on the direct release so state matches the
    handoff payoff.
  - Add regression coverage, run health, and play the changed route.
- Risks:
  - The direct payoff slightly shortens one manifest branch. This is
    intentional because the intercom route remains available for players who
    want Mara's final spoken prompt.
- Status:
  - Added `pull_release_during_mara_manifest_handoff` from
    `mara_manifest_handoff` to `passenger_manifest_handoff_true_ending`.
  - Preserved `board_after_mara_manifest_handoff` and all existing handoff,
    count, thumbprint, threshold, and room-making branches.
  - Added regression coverage for reaching the manifest handoff ending without
    the intercom detour.
  - Focused story-path suite passed: 173 tests.
  - `npm run health` passed: format check, TypeScript, 217 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `watch_mara_open_manifest` ->
    `pull_release_during_mara_manifest_handoff`, ending at
    `passenger_manifest_handoff_true_ending` with score 285 and no objectives.
- Playtest feedback:
  - The handoff scene now resolves cleanly at the moment it says the third car
    is asking for the release.
  - The richer intercom path is still available, so the branch keeps its slower
    Mara goodbye for exploratory players.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Re-run short random samples in the next cycle and watch whether
    `passenger_manifest_handoff_true_ending` appears more consistently. If
    `mara_manifest_handoff_intercom` remains under-discovered, improve its
    label or add a more explicit reason to board for Mara's final prompt.

# Cycle 52 Direct Conductor Signal Payoff

- Date: 2026-06-02
- Main objective: Make `passenger_conductor_true_ending` easier to discover in
  normal play by paying off the conductor's clear signal immediately.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 52 evidence. Health and
  coverage are strong, but short random samples still miss
  `passenger_conductor_true_ending` even after reaching conductor setup scenes.
  The player-facing signal scene says the conductor has called "Platform
  clear"; a direct release choice lets that promise resolve without requiring
  an extra roll-call beat.
- Planned work:
  - Add a direct release choice from `passenger_conductor_signal` to
    `passenger_conductor_true_ending`.
  - Preserve the existing punch-memory and final-roll-call routes.
  - Set the same clearance and final roll-call flags as the longer route.
  - Add regression coverage, run health, and play the changed route.
- Risks:
  - The direct payoff slightly reduces friction on one conductor branch. This
    is intentional because the longer roll-call choice remains available for
    players who want the additional passenger beat.
- Status:
  - Added `pull_release_on_conductor_signal` from
    `passenger_conductor_signal` to `passenger_conductor_true_ending`.
  - The new choice sets `heard_conductor_clearance` and
    `heard_final_roll_call`, matching the direct conductor payoff state.
  - Preserved the existing punch-memory and final-roll-call choices from the
    conductor signal scene.
  - Added regression coverage for the direct signal-to-ending route.
  - Focused story-path suite passed: 172 tests.
  - `npm run health` passed: format check, TypeScript, 216 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `ask_conductor_from_answers` -> `pull_release_on_conductor_signal`, ending
    at `passenger_conductor_true_ending` with score 309 and no objectives.
  - Follow-up 100-run random sample ended all runs with zero frontier samples
    but still missed `passenger_conductor_true_ending`,
    `mara_manifest_handoff_intercom`, and
    `passenger_manifest_handoff_true_ending` in that short deterministic
    sample.
- Playtest feedback:
  - The signal route now reads more directly: once the conductor calls
    "Platform clear," the player can immediately trust that signal and release
    the doors.
  - The older roll-call and punch-memory options still provide richer
    conductor texture for exploratory players.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - If short random samples keep missing the conductor ending, move a conductor
    prompt earlier from `passenger_answers` or `passengers_released` rather
    than adding more late-branch release choices. Continue watching the manifest
    handoff misses as the larger discoverability gap.

# Cycle 56 Answered Count Bridge

- Date: 2026-06-02
- Main objective: Make `passenger_answers` appear on a more intuitive normal
  route after the opened passengers finish Mara's count.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 56 evidence. Core health is
  strong and coverage reaches every scene, but the latest 100-run sample missed
  `passenger_answers` even though the opened-manifest hub text says passengers
  are answering Mara's count. Routing that natural count choice through the
  answer scene improves discoverability without adding duplicate hub options.
- Planned work:
  - Route the opened-manifest "finish Mara's count together" choice through
    `passenger_answers`.
  - Do the same for the equivalent Mara manifest handoff count choice.
  - Set `heard_passenger_answers` on those routes so score/objective state
    matches the prose.
  - Preserve the counted ending with a contextual release choice from
    `passenger_answers` when the reviewed count has already finished.
  - Update regression coverage, run full health, and play the changed route.
- Risks:
  - The counted ending now takes one extra visible beat on two routes. This is
    intentional because the added beat is the missing passenger-answer moment,
    and the original direct counted release remains available from reviewed
    count intercom routes.
- Status:
  - Updated `let_opened_passengers_finish_count` and
    `finish_count_after_mara_manifest_handoff` to enter `passenger_answers`
    while setting `heard_passenger_answers`.
  - Added `pull_release_after_answered_count` so players can still immediately
    pay off the completed count as `passenger_counted_true_ending`.
  - Updated story-path regressions for both direct opened-manifest and Mara
    handoff count routes.
  - Focused story-path suite passed: 172 tests.
  - `npm run health` passed: format check, TypeScript, 216 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished complete paths.
  - Actual CLI play followed `let_opened_passengers_finish_count` ->
    `pull_release_after_answered_count`, ending at
    `passenger_counted_true_ending` with score 283 and no objectives.
  - Follow-up 100-run random sample ended all runs with zero frontier samples
    and visited `passenger_answers`; it still missed
    `mara_manifest_handoff_intercom`, `passenger_manifest_handoff_true_ending`,
    and `passenger_conductor_true_ending` in that short sample.
- Playtest feedback:
  - The route now reads more coherently: "finish Mara's count together" shows
    the passengers answering before the release, instead of skipping directly
    to the ending.
  - The new release label is clear and appears only in the completed-count
    state.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Continue improving short-random discoverability for
    `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending`; consider an earlier handoff
    signal from `passengers_released` if blind feedback also misses it.

# Cycle 51 Manifest Handoff Answer Bridge

- Date: 2026-06-02
- Main objective: Preserve the Mara manifest handoff payoff after players
  listen to the opened passengers answer their names.
- Why this matters: The platform handoff route now has a direct payoff, but the
  same clean handoff context could still be displaced if the player chose the
  adjacent answer-listening beat first. This keeps the Mara-specific payoff
  visible after that natural detour without removing the answered-passenger
  route.
- Planned work:
  - Add a contextual `passenger_answers` boarding choice back into
    `mara_manifest_handoff_intercom` when Mara's handoff is active.
  - Preserve the existing answered-passenger handoff route.
  - Add regression coverage for the answer-listening detour.
  - Run focused tests, full health, and a CLI playthrough through the changed
    route.
- Risks:
  - Adds one choice to a specific answer scene. Conditions keep it out of
    gathered-passenger and already-answered boarding variants.
- Status:
  - Added `board_with_mara_handoff_after_answers`.
  - Added a story-path regression for watching Mara's manifest handoff,
    listening to passenger answers, then boarding back into the handoff
    intercom and ending at `passenger_manifest_handoff_true_ending`.
  - Focused story-path suite passed: 172 tests.
  - `npm run health` passed: format check, TypeScript, 216 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes and increased
    `passenger_manifest_handoff_true_ending` coverage from the previous 401
    paths to 721 paths in the expanded coverage run.
  - Actual CLI play followed `watch_mara_open_manifest` ->
    `continue_manifest_handoff_roll_call` ->
    `board_with_mara_handoff_after_answers` ->
    `pull_release_after_manifest_handoff_goodbye`, ending at
    `passenger_manifest_handoff_true_ending` with score 305 and no objectives.
- Playtest feedback:
  - The answer-listening detour now keeps Mara's handoff visible instead of
    forcing the player into an answered-passenger payoff. The label and state
    make it clear that Mara is still holding the manifest steady.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Watch short random samples for whether
    `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending` appear more consistently; if not,
    move one direct handoff prompt earlier in `passengers_released`.

# Cycle 55 Direct Conductor Release

- Date: 2026-06-02
- Main objective: Make `passenger_conductor_true_ending` more natural from the
  conductor intercom branch.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 55 evidence. Core route
  health is strong and coverage reaches all scenes, but the 100-run random
  sample missed `passenger_conductor_true_ending` while still visiting the
  conductor setup scenes. At `passenger_conductor_intercom`, the prose says the
  emergency release is already in the player's hand and Mara says to pull it on
  the conductor's clear, but the choices only offered extra roll-call or
  transfer elaborations before release.
- Planned work:
  - Add a direct release choice from `passenger_conductor_intercom` to
    `passenger_conductor_true_ending` when the route has not shifted into the
    punched-transfer or reviewed-count variants.
  - Set `heard_final_roll_call` on that direct release so the state reflects
    the conductor's final clear signal.
  - Preserve the existing final roll-call, counted roll-call, and punched
    transfer variants.
  - Preserve the covered platform shortcut into Mara's opened-door handoff
    intercom, which also targets a Cycle 55 random-sample miss.
  - Update regression coverage for the direct conductor release.
  - Run focused tests, full health, a manual CLI playthrough through the changed
    route, and a follow-up random sample.
- Risks:
  - Adding one more intercom choice can slightly widen the branch, but it
    matches the scene text and does not remove any authored conductor variant.
- Status:
  - Added `pull_release_on_conductor_clear` from
    `passenger_conductor_intercom` to `passenger_conductor_true_ending`.
  - The new choice requires no punched transfer and no reviewed manifest count,
    preserving the transfer and counted conductor endings.
  - `passenger_platform` also contains the covered
    `board_with_mara_manifest_handoff_from_platform` branch into
    `mara_manifest_handoff_intercom`, improving the other low-traffic
    manifest-handoff payoff from the latest evidence.
  - Updated `tests/story-paths.test.ts` to expect and exercise the direct
    conductor release.
  - Focused story-path suite passed: 171 tests.
  - Actual CLI play followed `ask_conductor_from_answers` ->
    `inspect_conductor_punch_memory` -> `follow_punch_memory_to_third_car` ->
    `pull_release_on_conductor_clear`, ending at
    `passenger_conductor_true_ending` with score 321 and no objectives.
  - `npm run health` passed: format check, TypeScript, 215 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_conductor_true_ending`, with zero unfinished complete paths.
  - Follow-up 100-run random sample ended all runs and had zero frontier
    samples. It still missed `passenger_conductor_true_ending`, indicating this
    branch remains low-probability in short random samples despite the more
    coherent direct release.
- Playtest feedback:
  - The changed branch reads more cleanly: once the player has asked the
    conductor to call the platform clear and carries that signal into the third
    car, they can immediately pull the release on the exact clear signal the
    prose highlights.
  - The longer roll-call and punched-transfer choices still remain available
    for players who want the extra passenger detail.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Improve normal-play discovery for `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending`, since they remain absent from the
    latest 100-run random sample. If the conductor ending remains absent across
    later non-deterministic samples, consider moving one direct conductor call
    earlier from `passenger_conductor_signal`.

# Cycle 51 Platform Manifest Handoff Payoff

- Date: 2026-06-02
- Main objective: Make `mara_manifest_handoff_intercom` and
  `passenger_manifest_handoff_true_ending` more discoverable after players
  watch Mara call the opened manifest doors.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 51 evidence. Core health and
  coverage are strong, but random samples still missed the clean Mara manifest
  handoff payoff. After watching the handoff, a player could return to the
  passenger platform and board into a generic train-car pause where the
  authored handoff intercom became optional again.
- Planned work:
  - Add a platform-level boarding choice for the clean Mara manifest handoff
    state.
  - Route that choice directly to `mara_manifest_handoff_intercom` and set
    `heard_mara_goodbye`.
  - Keep thumbprint, answered-passenger, gathered-passenger, and generic
    manifest release variants distinct.
  - Update story-path regression coverage for the platform handoff payoff.
  - Preserve and validate the adjacent conductor-clear direct release changes
    already present in the working tree.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - This adds one contextual platform choice, increasing choice count only for
    a narrow clean handoff state. The conditions avoid stealing priority from
    other authored variants.
- Status:
  - Added `board_with_mara_manifest_handoff_from_platform` on
    `passenger_platform`.
  - Updated the Mara manifest handoff regression so returning to the passenger
    platform now pays off through the new direct boarding choice.
  - Focused story-path suite passed: 171 tests.
  - Full verification pending.
- Playtest feedback:
  - Pending actual route play.
- Next step:
  - Run full health and play the platform handoff route through the CLI/MCP.

# Cycle 54 Answered Boarding State Payoff

- Date: 2026-06-02
- Main objective: Make `passenger_answered_boarding_true_ending` cleaner and
  more naturally supported from explicit answered-passenger boarding.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 54 evidence. Core route
  health is strong and coverage reaches all scenes, but the 100-run random
  sample still missed `passenger_answered_boarding_true_ending`. The explicit
  choice "Board the third car while the roll call holds" already says the
  answered names are being carried aboard, but the state flag for hearing those
  passengers only set if the player took an extra optional intercom listen.
- Planned work:
  - Set `heard_answered_passengers` when players choose
    `board_after_answered_passengers`.
  - Route `board_with_answered_passengers` directly to the answered boarding
    payoff because its label already promises that the opened passengers carry
    their own names.
  - Preserve the optional intercom listen from `passenger_answered_boarding`.
  - Update regression coverage so direct answered boarding immediately carries
    the answered-passenger state.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - This is a small state consistency change, not a topology change. It should
    not increase scene count or remove any choice, but it makes the direct
    branch semantically equivalent to the prose already shown to the player.
- Status:
  - `board_after_answered_passengers` now sets
    `heard_answered_passengers: true` on entry to
    `passenger_answered_boarding`.
  - `board_with_answered_passengers` now goes directly to
    `passenger_answered_boarding` and sets both `heard_passenger_answers` and
    `heard_answered_passengers`.
  - Updated story-path tests for both direct answered boarding and opened
    manifest answered boarding to assert that the flag is set before the
    optional listen.
  - Focused story-path suite passed: 170 tests.
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `board_after_answered_passengers` ->
    `pull_release_after_answered_boarding`, ending at
    `passenger_answered_boarding_true_ending` with score 292 and no objectives.
  - The CLI final state included `heard_passenger_answers: true` and
    `heard_answered_passengers: true`.
  - `npm run health` passed: format check, TypeScript, 215 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes and ended all complete paths, including
    `passenger_answered_boarding_true_ending`.
- Playtest feedback:
  - The route now reads more coherently: the player hears the passengers answer,
    boards with those names holding, and can immediately release without the
    engine treating the direct boarding as less informed than the optional
    intercom branch.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Continue watching normal-play random samples for low-traffic authored
    payoffs. If `mara_manifest_handoff_intercom` or
    `passenger_manifest_handoff_true_ending` remain absent, add an earlier
    high-traffic prompt rather than another late optional detour.

# Cycle 50 Direct Answered-Passenger Boarding

- Date: 2026-06-02
- Main objective: Make `passenger_answered_boarding_true_ending` more
  naturally discoverable from opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 50 evidence. Core route
  health is strong and coverage reaches all scenes, but random samples still
  missed `passenger_answered_boarding_true_ending`. The player-facing opened
  manifest choice "Let the opened passengers carry their own names" promised a
  boarding payoff but first routed through the answer-listening scene, making
  the direct answered-boarding ending easier to skip.
- Planned work:
  - Route `board_with_answered_passengers` directly to
    `passenger_answered_boarding`.
  - Set both `heard_passenger_answers` and `heard_answered_passengers` on
    direct answered-passenger boarding routes.
  - Preserve the separate `listen_to_passenger_answers` route for players who
    want the full roll-call scene before boarding.
  - Update regression coverage for the direct boarding route and direct release
    ending.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - One opened-manifest choice now skips the `passenger_answers` hub. This is
    acceptable because `listen_to_passenger_answers` remains adjacent on the
    same scene, while the changed choice text explicitly promises that the
    passengers carry their names aboard.
- Status:
  - Routed `board_with_answered_passengers` directly to
    `passenger_answered_boarding`.
  - Set `heard_answered_passengers` on both direct answered boarding entry
    paths.
  - Updated story-path tests for the direct opened-manifest boarding route and
    direct `passenger_answered_boarding_true_ending` release.
  - Focused story-path suite passed: 171 tests.
  - `npm run health` passed: format check, TypeScript, 215 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_answered_boarding_true_ending`, with zero unfinished runs.
  - Actual CLI play followed `board_with_answered_passengers` ->
    `pull_release_after_answered_boarding`, ending at
    `passenger_answered_boarding_true_ending` with score 285 and no
    objectives.
- Playtest feedback:
  - The changed branch now matches the choice promise: the opened passengers
    carry their own names directly into the third car, then the release resolves
    before the roll call can fade.
  - The separate `listen_to_passenger_answers` branch still preserves the full
    answer-listening hub for players who choose that beat first.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch the next random sample for whether
    `passenger_answered_boarding_true_ending` appears more reliably. If core
    route health stays strong, improve random discovery for
    `mara_manifest_handoff_intercom` or `passenger_manifest_handoff_true_ending`.

# Cycle 53 Direct Last-Dispatch Boarding Payoff

- Date: 2026-06-02
- Main objective: Make `mara_last_dispatch_intercom` more naturally
  discoverable from explicit last-dispatch play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 53 evidence. Core route
  health is strong and coverage reaches all scenes, but the random sample
  missed `mara_last_dispatch_intercom`. The player can explicitly ask Mara for
  her last dispatch; if they also know the badge proof, one boarding option
  still detoured to the generic train car and made the authored dispatch payoff
  optional again.
- Planned work:
  - Route `board_after_last_dispatch` directly to
    `mara_last_dispatch_intercom`.
  - Keep the badge-proof follow-up available from the last-dispatch intercom.
  - Preserve the existing direct release from the last-dispatch intercom.
  - Update regression coverage for the direct boarding route.
  - Preserve and verify the adjacent passenger-answer bridge changes already
    present in the working tree.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - The generic train-car pause is removed from one explicit last-dispatch
    branch. This is acceptable because the player has already asked for the
    dispatch, and the intercom still offers both the badge-proof elaboration
    and the direct release.
- Status:
  - Routed `board_after_last_dispatch` directly to
    `mara_last_dispatch_intercom`.
  - Preserved the badge-proof follow-up from the last-dispatch intercom via
    `listen_to_badge_proof_after_last_dispatch`.
  - Updated story-path regression coverage for direct last-dispatch boarding
    with badge proof.
  - Verified the adjacent passenger-answer bridge: opened-manifest players now
    reach `passenger_answers` before direct answered boarding, and
    `passenger_morning_chorus` can flow directly into `passenger_answers`.
  - Focused story-path suite passed: 170 tests.
  - Actual CLI play followed `ask_mara_for_last_dispatch` ->
    `board_after_last_dispatch` ->
    `listen_to_badge_proof_after_last_dispatch` ->
    `pull_release_after_badge_proof_goodbye`, ending at `true_ending`.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `mara_last_dispatch_intercom`, with zero unfinished runs.
  - A follow-up 100-run random sample now visited both
    `mara_last_dispatch_intercom` and `passenger_answers`; the latest random
    sample also reached `passenger_conductor_true_ending`. Remaining random
    misses were `mara_manifest_handoff_intercom`,
    `passenger_answered_boarding_true_ending`, and
    `passenger_manifest_handoff_true_ending`.
- Playtest feedback:
  - The branch now reads as one continuous promise: ask Mara for the last
    dispatch, board after she gives it, hear it hold the doors, then optionally
    tie it to the badge proof before release.
  - The generic train-car pause no longer interrupts the specific dispatch
    beat after the player asks for it.
  - No invalid choices, dead ends, or dangling objectives appeared.
- Next step:
  - Improve normal-play discovery for `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending`, since they remain absent from the
    latest random sample.

# Cycle 52 Morning Chorus Boarding Payoff

- Date: 2026-06-02
- Main objective: Make the opened-passenger morning chorus pay off immediately
  when the player boards with it.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 52 evidence. Core route
  health is strong, coverage reaches all scenes, and the best next improvement
  is story depth/discoverability. The morning-chorus scene already invites the
  player to board with the passengers' remembered ordinary mornings; routing
  that choice through the generic train car made the authored intercom payoff
  easier to miss than the choice text implied.
- Planned work:
  - Route `board_after_passenger_morning_chorus` directly to
    `passenger_morning_intercom`.
  - Set the existing `heard_passenger_morning_boarding` flag on that direct
    route so later hub behavior remains consistent.
  - Keep the return-to-manifest and cross-platform alternatives intact.
  - Update regression coverage for direct morning-chorus boarding and existing
    train-car detour recovery paths.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - Direct routing removes one generic train-car pause from this optional
    passenger branch. This is acceptable because the player has already chosen
    to board with the chorus, and the direct intercom scene provides the
    intended release prompt.
- Status:
  - Routed `board_after_passenger_morning_chorus` to
    `passenger_morning_intercom` and set `heard_passenger_morning_boarding`.
  - Updated story-path tests so the direct boarding choice lands on the
    morning intercom and resolves via
    `pull_release_after_morning_chorus_boarding`.
  - Preserved train-car detour recovery coverage through Mara signoff routes.
  - `npm test` passed: 214 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_morning_intercom`, with zero unfinished runs.
  - Actual CLI play followed `listen_to_passenger_morning_chorus` ->
    `board_after_passenger_morning_chorus` ->
    `pull_release_after_morning_chorus_boarding`, ending at
    `passenger_true_ending` with score 274 and no objectives.
- Playtest feedback:
  - The branch now reads as a continuous authored beat: the passengers remember
    morning, the player boards with that sound behind them, and the intercom
    turns those ordinary details into a clear release prompt.
  - The route ended cleanly as an ideal passenger ending. No invalid choices,
    dead ends, or dangling objectives appeared.
- Next step:
  - Watch future random samples for whether other optional passenger payoffs
    remain lower-traffic than expected. If no hard failures appear, continue
    investing in direct payoffs for explicit late-game story choices rather
    than adding new branch breadth.

# Cycle 51 Direct Conductor Clear Payoff

- Date: 2026-06-02
- Main objective: Make `passenger_conductor_true_ending` more naturally
  discoverable from explicit old-conductor clear-signal play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 51 random/coverage evidence.
  Coverage reaches `passenger_conductor_true_ending`, but the 100-run random
  sample missed it while other conductor transfer/count variants appeared. The
  player-facing conductor signal already says the platform is clear, so sending
  that explicit choice through another intercom hub made the plain conductor
  payoff easier to skip than the more elaborate transfer variants.
- Planned work:
  - Route the explicit non-counted conductor clear signal directly to
    `passenger_conductor_roll_call`.
  - Route reviewed-count conductor signals directly to
    `passenger_conductor_count_roll_call`.
  - Preserve the conductor punch-memory route through
    `passenger_conductor_intercom` so optional punched-transfer endings remain
    available.
  - Update regression coverage for direct clear-signal and counted-signal
    routing.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - Direct routing removes one optional pause from the plain conductor signal
    path. This is acceptable because the punch-memory route still exposes the
    intercom hub and transfer branch for players who inspect the punch.
- Status:
  - Routed `follow_conductor_signal_to_third_car` directly to
    `passenger_conductor_roll_call` and set `heard_final_roll_call` on entry.
  - Added `follow_counted_conductor_signal_to_third_car` for reviewed manifest
    routes, preserving counted-conductor payoff logic.
  - Preserved `passenger_conductor_intercom` through
    `inspect_conductor_punch_memory` -> `follow_punch_memory_to_third_car`, so
    transfer and intercom variants remain available for players who inspect the
    punch.
  - Updated conductor regression coverage for direct ordinary and counted
    signal routes plus preserved punch-memory intercom routes.
  - Focused story-path suite passed: 170 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_conductor_true_ending`, with zero unfinished runs.
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `ask_conductor_from_answers` -> `follow_conductor_signal_to_third_car` ->
    `pull_release_after_conductor_roll_call`, ending at
    `passenger_conductor_true_ending` with score 321 and no objectives.
  - A 100-run deterministic random sample still missed
    `passenger_conductor_true_ending`, so the direct route is smoother but
    future work may need to surface the non-counted conductor prompt from a
    higher-traffic passenger scene.
- Playtest feedback:
  - The conductor route now reads as one continuous commitment: ask him to call
    the platform clear, follow that clear signal to the release, then pull on
    his final call.
  - The ending payoff is clearer because the player no longer lands in a hub
    that reopens transfer choices after choosing the plain worker-signal
    branch.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random samples for whether `passenger_conductor_true_ending`
    appears more often. If it remains absent, add an earlier non-counted
    conductor prompt instead of adding more late-car branching.

# Cycle 46 Direct Manifest-Handoff Intercom Boarding

- Date: 2026-06-02
- Main objective: Make `mara_manifest_handoff_intercom` and
  `passenger_manifest_handoff_true_ending` more naturally discoverable from the
  explicit Mara manifest-handoff branch.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 46 random/coverage evidence.
  Coverage reaches `mara_manifest_handoff_intercom` and
  `passenger_manifest_handoff_true_ending`, but random samples miss both. The
  player-facing choice "Board the third car while Mara keeps calling names"
  previously landed in the generic train car and made the handoff payoff an
  optional listen step.
- Planned work:
  - Route the explicit Mara manifest-handoff boarding choice directly to the
    existing handoff intercom payoff.
  - Keep alternate room, threshold, count, answered-passenger, thumbprint, hub,
    and generic train-car routes intact.
  - Update regression coverage for the direct branch to prove it reaches
    `passenger_manifest_handoff_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - This slightly increases ideal-ending pressure for a branch that already
    strongly signals Mara is still calling names. That is acceptable because
    the choice text explicitly commits to carrying that call into the car.
- Status:
  - Routed `board_after_mara_manifest_handoff` directly to
    `mara_manifest_handoff_intercom` and set `heard_mara_goodbye` on entry.
  - Preserved alternate manifest-handoff branches for room, threshold, count,
    passenger answers, thumbprint, returning to the hub, and generic
    train-car boarding from other routes.
  - Updated regression coverage so the direct handoff branch reaches
    `passenger_manifest_handoff_true_ending`.
  - Focused manifest-handoff tests passed: 7 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `mara_manifest_handoff_intercom`, with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `watch_mara_open_manifest` -> `board_after_mara_manifest_handoff` ->
    `pull_release_after_manifest_handoff_goodbye`, ending at
    `passenger_manifest_handoff_true_ending` with score 284 and no objectives.
- Playtest feedback:
  - The explicit "Mara keeps calling names" boarding choice now reads as a
    continuous authored beat instead of asking the player to notice another
    optional listen choice in the generic train car.
  - The handoff intercom cleanly frames the release: Mara's pauses keep the
    passengers sounding like people, then the ending resolves the manifest as a
    shared movement rather than one dispatcher's duty.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random samples for whether `mara_manifest_handoff_intercom`
    and `passenger_manifest_handoff_true_ending` appear more often. If hard
    issues remain absent, continue with remaining low-random payoff branches
    such as `passenger_answers` or `passenger_conductor_true_ending`.

# Cycle 50 Passenger Answer Signoff Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_answers` easier to discover during normal
  opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 50 random/coverage evidence.
  Coverage reaches all scenes, but the 100-run random sample missed
  `passenger_answers` even though it is a strong passenger-humanizing branch.
  The Mara signoff scene is already reached in normal play and explicitly says
  the passengers answer her, so it is a natural place to surface the existing
  answered-roll-call beat.
- Planned work:
  - Add a contextual `passenger_mara_signoff` choice into the existing
    `passenger_answers` scene.
  - Preserve the direct return, platform-crossing, thumbprint, and generic
    boarding routes from Mara's signoff.
  - Update regression coverage proving the new signoff route reaches
    `passenger_answers`, then resolves through `passenger_answered_intercom`
    to `passenger_answered_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - The signoff scene gains one additional contextual choice. This is contained
    because it appears only after the player explicitly asks Mara to sign off
    to the opened passengers and reuses an existing branch.
- Status:
  - Added `listen_to_answers_after_mara_signoff` from
    `passenger_mara_signoff` to `passenger_answers`, setting the existing
    `heard_passenger_answers` flag.
  - Updated regression coverage for the new signoff-to-answers route.
  - Focused story-path suite passed: 170 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_answers`, with
    zero unfinished runs.
  - Actual CLI play followed `ask_mara_to_sign_off_opened_manifest` ->
    `listen_to_answers_after_mara_signoff` ->
    `carry_answered_names_to_intercom` ->
    `pull_release_after_answered_intercom`, ending at
    `passenger_answered_true_ending` with score 305 and no objectives.
- Playtest feedback:
  - Mara's signoff now leads naturally into the passenger-answer beat: she
    tells the opened passengers they were held, then the new choice lets the
    player hear them answer before boarding.
  - The branch cleanly reaches the answered intercom and resolves as an ideal
    passenger roll-call ending.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random samples for whether `passenger_answers` appears more
    often in normal opened-manifest play. If hard issues remain absent,
    continue with remaining low-random payoff branches such as
    `passenger_conductor_true_ending`.

# Cycle 49 Last-Dispatch Intercom Payoff

- Date: 2026-06-02
- Main objective: Make `mara_last_dispatch_intercom` harder to miss after the
  player explicitly asks Mara for her final dispatch.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 49 random/coverage evidence.
  Random play reached the core true ending often but missed
  `mara_last_dispatch_intercom` in the 100-run sample while coverage proved it
  reachable. The branch already exists and is narratively important; the weak
  spot was a follow-up choice that boarded straight to the generic train car
  after Mara delivered the dispatch.
- Planned work:
  - Add a non-badge-proof follow-up from Mara's last dispatch to the existing
    `mara_last_dispatch_intercom` payoff.
  - Keep the explicit `carry_last_dispatch_into_car` route and direct
    train-car release routes intact.
  - Update regression coverage for the revised last-dispatch route.
  - Run focused tests, full health, and an actual CLI playthrough through the
    changed branch.
- Risks:
  - The last-dispatch scene gains a contextual choice split. This is acceptable
    because badge-proof readers keep their proof-specific route while ordinary
    dispatch routes pay off the dispatch immediately.
- Status:
  - Added `board_with_last_dispatch_in_speaker` from `mara_last_dispatch`
    directly to `mara_last_dispatch_intercom` when the badge-proof variant is
    not active.
  - Preserved the badge-proof optional payoff by keeping
    `board_after_last_dispatch` routed through `train_car` when
    `knows_badge_proof` is set.
  - Updated last-dispatch regression coverage for direct intercom routing and
    the preserved badge-proof continuation.
  - Focused story-path suite passed: 170 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `mara_last_dispatch_intercom`, with zero unfinished runs.
  - Actual CLI play followed `mark_mara_clear_from_ledger` ->
    `ask_mara_for_last_dispatch` ->
    `board_with_last_dispatch_in_speaker` ->
    `pull_release_after_last_dispatch_goodbye`, ending at `true_ending` with
    score 287 and no objectives.
- Playtest feedback:
  - The last-dispatch choice now reads as a continuous authored beat: Mara gives
    the dispatch, the player boards with it still in the speaker, and the
    intercom scene confirms the train cannot flatten it into another order.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random samples for whether `mara_last_dispatch_intercom`
    appears more often in normal play.

# Cycle 45 Direct Morning Chorus Intercom Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_morning_intercom` easier to discover after
  players hear the opened passengers remember morning.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 45 random/coverage evidence.
  Coverage reaches every scene, but random samples missed
  `passenger_morning_intercom`. The existing morning chorus is a strong
  passenger-humanizing beat, but returning to the opened-manifest hub currently
  hides its intercom payoff behind generic boarding.
- Planned work:
  - Add one gated `passengers_released` choice from the heard morning chorus
    into the existing `passenger_morning_intercom`.
  - Keep the older board-from-chorus route intact.
  - Revise the opened-manifest hub prose so the speaker cue points toward the
    carried morning chorus.
  - Add regression coverage proving the returned-hub route reaches
    `passenger_morning_intercom` and `passenger_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more contextual choice after the player
    has already listened to the morning chorus. This is acceptable because it
    only appears after that setup and reuses an existing payoff.
- Status:
  - Added `carry_morning_chorus_from_opened_manifest` from
    `passengers_released` directly to the existing
    `passenger_morning_intercom` after the player hears
    `passenger_morning_chorus`.
  - Revised the opened-manifest hub prose so the third-car speaker visibly
    carries the remembered morning chorus after it is heard.
  - Added regression coverage for the returned-hub route through
    `passenger_morning_intercom` to `passenger_true_ending`.
  - Focused story-path suite passed: 170 tests.
  - `npm run health` passed: format check, TypeScript, 214 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_morning_intercom`, with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `listen_to_passenger_morning_chorus` ->
    `return_from_passenger_morning_chorus` ->
    `carry_morning_chorus_from_opened_manifest` ->
    `pull_release_after_morning_chorus_boarding`, ending at
    `passenger_true_ending` with score 281 and no objectives.
- Playtest feedback:
  - Returning from the morning chorus now keeps a specific, readable follow-up
    in the opened-manifest hub instead of forcing the player to infer the
    payoff from generic boarding.
  - The intercom scene lands cleanly after the hub choice and the ending keeps
    the passenger-focused release intact.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether `passenger_morning_intercom`
    appears more often in normal play. If hard issues remain absent, continue
    with the remaining low-random answered-passenger or conductor variants.

# Cycle 48 Direct Conductor Transfer Proof Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_conductor_transfer_proof` easier to discover
  from normal opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 48 random/coverage evidence.
  Coverage reaches every scene, but random samples missed
  `passenger_conductor_transfer_proof`. The opened-manifest hub already carries
  passenger keepsakes and a transfer motif, so surfacing the old conductor's
  punch there gives players a readable way into the existing proof beat without
  requiring the longer answered-passenger conductor chain.
- Planned work:
  - Add one direct `passengers_released` choice into the existing conductor
    transfer branch.
  - Revise the opened-manifest hub prose so the newspaper transfer and
    conductor punch are visible before the choice appears.
  - Add regression coverage proving the direct route reaches
    `passenger_conductor_transfer`, `passenger_conductor_transfer_proof`, and
    `passenger_conductor_transfer_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new branch.
- Risks:
  - The opened-manifest hub gains one more optional passenger action. This is
    acceptable because it reuses an existing scene sequence and appears beside
    other opened-passenger affordances rather than creating another ending.
- Status:
  - Added `ask_conductor_to_punch_opened_transfer` from `passengers_released`
    directly to `passenger_conductor_transfer`, setting the existing conductor
    transfer flags.
  - Revised `passengers_released` text to mention the newspaper transfer
    unfolding beside the old conductor's punch.
  - Added regression coverage for the direct hub route through
    `passenger_conductor_transfer`, `passenger_conductor_transfer_proof`, and
    `passenger_conductor_transfer_true_ending`.
  - Focused story-path suite passed: 169 tests.
  - `npm run health` passed: format check, TypeScript, 213 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_conductor_transfer_proof`, with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `ask_conductor_to_punch_opened_transfer` ->
    `press_punched_transfer_to_speaker` ->
    `pull_release_after_transfer_proof`, ending at
    `passenger_conductor_transfer_true_ending` with score 291 and no
    objectives.
- Playtest feedback:
  - The new action is legible from the hub because the prose now points at both
    the transfer paper and the conductor's punch before offering the choice.
  - Pressing the punched transfer to Mara's speaker gives the branch a stronger
    visual proof beat before the ideal passenger ending.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether
    `passenger_conductor_transfer_proof` appears more often in normal play. If
    hard issues remain absent, continue with remaining low-random intercom
    payoffs such as `mara_last_dispatch_intercom` or
    `passenger_morning_intercom`.

# Cycle 47 Direct Gathered-Passenger Boarding Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_gathered_boarding`,
  `passenger_gathered_intercom`, and `passenger_helped_true_ending` easier to
  discover from normal opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 47 random/coverage evidence.
  Coverage reaches every scene, but random samples missed the gathered
  passenger boarding and helped-passenger payoff. The opened-manifest hub
  already describes shoulders shifting to make room, so giving that movement a
  direct action should make the existing route visible without requiring a
  detour through answered-name content.
- Planned work:
  - Add one direct `passengers_released` choice into the existing gathered
    passenger boarding branch.
  - Preserve existing count, handoff, echo, keepsake, mitten, lunch-tin,
    threshold, room-making, answered-passenger, morning, and direct boarding
    routes.
  - Add regression coverage proving the hub route reaches
    `passenger_gathered_boarding`, `passenger_gathered_intercom`, and
    `passenger_helped_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because it reuses an existing scene sequence and appears alongside the
    already described passenger movement toward the third car.
- Status:
  - Completed as part of the combined gathered-passenger and final-roll-call
    discoverability milestone recorded below.

# Cycle 43 Direct Roll-Call Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_roll_call_epilogue` and
  `passenger_roll_call_true_ending` more naturally discoverable from normal
  opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 43 random/coverage evidence.
  Coverage reaches every scene, but random samples missed
  `passenger_roll_call_true_ending` and related gathered-passenger scenes. Once
  players help the opened passengers gather, a final roll call is a readable
  next action and should not require first choosing a generic intercom listen
  beat.
- Planned work:
  - Add one direct `passenger_gathered_boarding` choice into the existing
    final roll-call epilogue.
  - Preserve the gathered intercom and direct helped-passenger release routes.
  - Add regression coverage proving the gathered boarding route reaches
    `passenger_roll_call_epilogue` and `passenger_roll_call_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The gathered boarding scene gains one more optional action. This is
    acceptable because the action reuses an existing payoff and appears only
    after the player has already committed to helping the passengers gather.
- Status:
  - Added `help_opened_passengers_gather` from `passengers_released` directly
    to `passenger_gathered_boarding`, setting `helped_passengers_gather`.
  - Kept the gathered boarding beat broad by exposing both the existing
    helped-passenger release and a final-roll-call continuation to
    `passenger_roll_call_true_ending`.
  - Updated the opened-manifest hub choice-order coverage and added regression
    coverage for the direct route through `passenger_gathered_boarding`,
    `passenger_gathered_intercom`, `passenger_helped_true_ending`, and the
    optional `passenger_roll_call_true_ending` payoff.
  - Focused story-path suite passed: 168 tests.
  - `npm run health` passed: format check, TypeScript, 212 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_gathered_boarding`,
    `passenger_gathered_intercom`, `passenger_helped_true_ending`, and
    `passenger_roll_call_true_ending`, with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `help_opened_passengers_gather` ->
    `answer_final_roll_call_from_gathered_boarding` ->
    `pull_release_after_final_roll_call`, ending at
    `passenger_roll_call_true_ending` with score 305 and no objectives.
- Playtest feedback:
  - The direct hub action reads naturally because the hub already describes the
    opened passengers shifting together toward the third car.
  - The boarding scene now gives a clear choice between releasing once everyone
    is ready and taking the optional final roll-call beat.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether the gathered-passenger and
    final-roll-call passenger payoffs appear more often in normal play. If
    hard issues remain absent, continue with remaining low-random intercom
    payoffs such as `mara_last_dispatch_intercom` or
    `passenger_conductor_transfer_proof`.

# Cycle 42 Opened Manifest Echo Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_echoed_boarding`,
  `passenger_echoed_manifest_intercom`, and `passenger_echoed_true_ending`
  easier to discover from normal opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 42 random/coverage
  evidence. Coverage reaches every scene, but random samples missed the echoed
  passenger payoff branch. The opened-manifest hub already foregrounds the
  passengers' ordinary sounds, so carrying those sounds into the third car is a
  natural visible action.
- Planned work:
  - Add one direct `passengers_released` choice into the existing echoed
    boarding branch.
  - Preserve existing count, handoff, threshold, room-making, keepsake,
    answered-passenger, morning, and direct boarding routes.
  - Add regression coverage proving the hub route reaches
    `passenger_echoed_boarding`, `passenger_echoed_manifest_intercom`, and
    `passenger_echoed_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because it reuses existing scenes and appears only while the player has not
    committed to another passenger-gathering or answered-passenger route.
- Status:
  - Added `follow_opened_manifest_echoes` from `passengers_released` into the
    existing `passenger_echoed_boarding` branch, setting
    `heard_passenger_echoes` and `echoed_manifest_boarded`.
  - Revised the opened-manifest hub prose so the door-echoes remain visible
    after the manifest opens.
  - Added regression coverage for the direct hub route through
    `passenger_echoed_boarding`, `passenger_echoed_manifest_intercom`, and
    `passenger_echoed_true_ending`.
  - Focused story-path suite passed: 167 tests.
  - `npm run health` passed: format check, TypeScript, 211 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_echoed_boarding`, `passenger_echoed_manifest_intercom`, and
    `passenger_echoed_true_ending`, with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `follow_opened_manifest_echoes` ->
    `listen_to_echoed_manifest_from_boarding` ->
    `pull_release_after_echoed_manifest_goodbye`, ending at
    `passenger_echoed_true_ending` with score 280 and no objectives.
- Playtest feedback:
  - The new hub line makes the echoed route legible even if the player did not
    listen to the sealed manifest doors before opening them.
  - Boarding first feels better than jumping straight to the intercom because
    it pays off one of the random-missed scenes and lets the player hear Mara's
    final handoff as a deliberate second beat.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether the echoed passenger route
    appears more often in normal play. If hard issues remain absent, continue
    with remaining low-random Mara payoffs such as
    `mara_last_dispatch_intercom`.

# Cycle 41 Mara Manifest Handoff Intercom Discovery

- Date: 2026-06-02
- Main objective: Make `mara_manifest_handoff_intercom` easier to reach from
  normal opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 41 random/coverage
  evidence. Coverage reaches every scene, but random samples missed
  `mara_manifest_handoff_intercom` and `passenger_manifest_handoff_true_ending`.
  Once players watch Mara call the opened manifest doors, carrying that handoff
  directly into the third car should be a clear next action.
- Planned work:
  - Add one direct `passengers_released` choice into the existing Mara manifest
    handoff intercom after the player has watched the handoff.
  - Preserve existing answered-passenger, count, thumbprint, room-making,
    threshold, keepsake, and direct boarding routes.
  - Add regression coverage proving the direct hub route reaches
    `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action after the handoff
    beat. This is acceptable because the action reuses an existing payoff and
    appears only after the player has already asked Mara to call the opened
    doors.
- Status:
  - Added `carry_mara_manifest_handoff_from_opened_doors` from
    `passengers_released` directly to `mara_manifest_handoff_intercom` after
    the player has watched Mara call the opened manifest doors.
  - Revised the opened-manifest hub prose so Mara's prior handoff leaves a
    visible third-car speaker cue.
  - Added regression coverage for the direct hub route through
    `mara_manifest_handoff_intercom` and
    `passenger_manifest_handoff_true_ending`.
  - Focused story-path suite passed: 166 tests.
  - `npm run health` passed: format check, TypeScript, 210 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `mara_manifest_handoff_intercom`, with zero unfinished runs.
  - Actual CLI play followed `watch_mara_open_manifest` ->
    `return_from_mara_manifest_handoff` ->
    `carry_mara_manifest_handoff_from_opened_doors` ->
    `pull_release_after_manifest_handoff_goodbye`, ending at
    `passenger_manifest_handoff_true_ending` with score 296 and no objectives.
- Playtest feedback:
  - The new transition reads naturally after watching Mara call the opened
    doors: the hub now makes the third-car speaker feel like a pending handoff
    rather than a hidden train-car-only variant.
  - Returning to the opened-manifest hub still leaves the answered-passenger,
    count, thumbprint, threshold, room-making, keepsake, and direct boarding
    options intact.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether
    `mara_manifest_handoff_intercom` appears more often in normal play. If hard
    issues remain absent, continue improving low-random Mara payoffs such as
    `mara_last_dispatch_intercom` or passenger morning variants.

# Cycle 45 Direct Counted Chorus Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_counted_chorus` easier to reach from normal
  opened-manifest play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 45 random/coverage
  evidence. Coverage reaches every scene, but random samples missed
  `passenger_counted_chorus`; the opened-manifest hub already describes the
  passengers as ordinary people answering Mara, so giving that count a direct
  action should make the existing payoff easier to discover.
- Planned work:
  - Add one direct `passengers_released` choice into the existing
    `passenger_counted_chorus` branch.
  - Preserve the longer reviewed-count, missing-row, conductor, handoff,
    threshold, room-making, keepsake, answered, and boarding routes.
  - Update exact opened-manifest hub coverage and add a regression route that
    reaches `passenger_counted_true_ending` through the new direct action.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because it reuses an existing branch and appears next to the already
    related count-review choice.
- Status:
  - Added `let_opened_passengers_finish_count` from `passengers_released`
    directly to `passenger_counted_chorus`, setting both
    `reviewed_open_manifest_count` and `passengers_finished_reviewed_count`.
  - Revised `passengers_released` prose so the opened-manifest hub visibly
    includes passengers answering Mara's count before it can make anyone last.
  - Updated exact hub choice-order coverage and added a regression route
    through `passenger_counted_chorus` to `passenger_counted_true_ending`.
  - Focused story-path suite passed: 166 tests.
  - `npm run health` passed: format check, TypeScript, 210 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_counted_chorus`,
    with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `let_opened_passengers_finish_count` ->
    `pull_release_after_counted_chorus`, ending at
    `passenger_counted_true_ending` with score 270 and no objectives.
- Playtest feedback:
  - The new hub line makes the count action feel like an immediate response to
    what the opened passengers are already doing, not a hidden sub-branch.
  - The direct action lands cleanly in the existing chorus scene and the ending
    text pays off the no-one-left-last idea.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch random/blind samples for whether `passenger_counted_chorus` appears
    more often in normal play. If hard issues remain absent, continue with
    remaining low-random intercom payoffs such as `passenger_morning_intercom`
    or `mara_last_dispatch_intercom`.

# Cycle 44 Answered Passenger Intercom Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_answered_intercom` and
  `passenger_answered_true_ending` easier to reach from normal opened-manifest
  play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 44 random/coverage
  evidence. Coverage reaches every scene, but random samples can still miss
  the answered-passenger intercom payoff. Once players choose to hear the
  opened passengers answer their names, carrying those answers straight into
  the third car is a readable next action.
- Planned work:
  - Add one direct `passenger_answers` choice into the existing
    `passenger_answered_intercom` branch.
  - Preserve handoff, conductor, lunch-tin, newspaper, gathering, and direct
    boarding routes.
  - Add regression coverage proving the direct answered route reaches
    `passenger_answered_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - `passenger_answers` gains one more optional action. This is acceptable
    because the action reuses an existing payoff and appears only before the
    player commits to another passenger-gathering route.
- Status:
  - Added `carry_answered_names_to_intercom` from `passenger_answers` directly
    to `passenger_answered_intercom`, setting `heard_answered_passengers`.
  - Updated exact choice-order coverage for answered-passenger scenes.
  - Added a regression route through `passenger_answered_intercom` and
    `passenger_answered_true_ending`.
  - Focused story-path suite passed: 164 tests.
  - `npm run health` passed: format check, TypeScript, 208 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including
    `passenger_answered_intercom`, with zero unfinished runs.
  - Actual CLI play followed `listen_to_passenger_answers` ->
    `carry_answered_names_to_intercom` ->
    `pull_release_after_answered_intercom`, ending at
    `passenger_answered_true_ending` with score 298 and no objectives.
- Playtest feedback:
  - The new transition reads naturally: the player hears passengers answer for
    themselves, then carries that proof straight into the third-car intercom.
  - The route avoids an extra boarding detour while preserving the older
    boarding and direct-release branch.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether `passenger_answered_intercom`
    appears more often in normal play. If hard issues remain absent, continue
    improving low-random Mara payoffs such as `mara_manifest_handoff_intercom`
    or `mara_last_dispatch_intercom`.

# Cycle 40 Opened Manifest Room-Making Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_room_intercom` more naturally discoverable
  from the opened-manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 40 random/coverage
  evidence. Coverage reaches every scene, but random samples missed
  `passenger_room_intercom`; players can already help the opened passengers
  board, so surfacing the car-space problem earlier should make that payoff
  easier to find in normal play.
- Planned work:
  - Add one direct `passengers_released` choice into the existing room-making
    intercom branch.
  - Motivate the choice in the opened-manifest hub prose with visible
    room-making pressure.
  - Preserve existing threshold, answered, keepsake, count, lunch-tin, and
    handoff routes.
  - Add regression coverage proving the direct opened-manifest room route
    reaches `passenger_room_intercom` and an ideal passenger ending.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because it reuses existing downstream scenes and gives normal players a
    direct way to act on the crowd-space detail already present in the
    passenger release sequence.
- Status:
  - Added `make_room_from_opened_manifest` from `passengers_released` directly
    to `passenger_room_intercom`, setting `made_room_for_passengers` and
    `heard_mara_goodbye`.
  - Revised `passengers_released` so the opened passengers visibly shift to
    make room before the new choice appears.
  - Updated exact hub choice-order coverage and added a direct opened-manifest
    room-making regression through `passenger_room_intercom`,
    `passenger_room_release`, and `passenger_true_ending`.
  - Preserved adjacent answered-passenger discoverability work in the touched
    files: `carry_answered_names_to_intercom` now routes directly from
    answered names to `passenger_answered_intercom` with regression coverage to
    `passenger_answered_true_ending`.
  - Focused story-path suite passed: 163 tests.
  - `npm run health` passed: format check, TypeScript, 208 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_room_intercom`,
    with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `make_room_from_opened_manifest` -> `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 248 and no objectives.
- Playtest feedback:
  - The hub prose now clearly tees up the room-making action; choosing it feels
    like helping the crowd board rather than detouring into a hidden variant.
  - The intercom payoff reads cleanly from the new shortcut because Mara's line
    explains why ordinary space matters to the ledger.
  - No invalid choices, dead ends, or dangling objectives appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether `passenger_room_intercom`
    appears more often in normal play. If hard issues remain absent, continue
    improving remaining low-random scenes such as
    `mara_manifest_handoff_intercom` or `mara_last_dispatch_intercom`.

# Cycle 39 Opened Manifest Threshold Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_threshold_intercom` more naturally
  discoverable from the opened-manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows the supplied Cycle 39 random/coverage
  evidence. Coverage reaches all threshold scenes, but random samples missed
  `passenger_threshold_boarding` and `passenger_threshold_intercom`. The
  opened manifest already frames the passengers as a crowd moving toward the
  third car, so letting the player hold the threshold directly is a clear
  altruistic action.
- Planned work:
  - Add a direct opened-manifest choice into the existing threshold route.
  - Surface the threshold pressure in `passengers_released` prose so the new
    choice is motivated by visible story detail.
  - Preserve existing handoff, room-making, count, answer, keepsake, mitten,
    lunch-tin, and boarding routes.
  - Add regression coverage proving the direct opened-manifest threshold route
    reaches `passenger_threshold_intercom` and an ideal passenger ending.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because the route reuses existing scenes and gives normal players a more
    direct way to act on the crowd/boarding pressure already present in the
    late game.
- Work completed:
  - Added `hold_opened_manifest_threshold` from `passengers_released` directly
    to `passenger_threshold_boarding`, setting `held_passenger_threshold`.
  - Revised `passengers_released` so the opened doors include a visible crowd
    pause at the third-car threshold.
  - Updated exact hub choice-order coverage and added regression coverage for
    the direct opened-manifest threshold route through
    `passenger_threshold_intercom` and `passenger_true_ending`.
- Evidence:
  - Focused story-path suite passed: 161 tests.
  - Validation passed with 138 reachable scenes, 27 endings, and no warnings.
  - `npm run health` passed: format check, TypeScript, 205 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all scenes, including
    `passenger_threshold_boarding` and `passenger_threshold_intercom`, with
    zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `hold_opened_manifest_threshold` -> `listen_to_threshold_from_boarding` ->
    `pull_release_after_threshold_manifest`, ending at
    `passenger_true_ending` with score 271 and no objectives.
- Playtest feedback:
  - The new hub prose makes the threshold choice feel motivated: the ordinary
    sounds now include the crowd waiting for someone to hold the third-car
    threshold.
  - The route reads cleanly as an altruistic boarding action before the release,
    and the intercom payoff explains why the held threshold is enough proof.
  - No bugs, invalid choices, or dangling objectives appeared in the played
    route.
- Next step:
  - Watch future random/blind samples for whether
    `passenger_threshold_intercom` appears more often in normal play. If hard
    issues stay absent, continue promoting remaining low-random intercom beats
    such as `mara_manifest_handoff_intercom` or
    `passenger_answered_handoff_intercom`.

# Cycle 43 Direct Opened Manifest Handoff

- Date: 2026-06-02
- Main objective: Make `passenger_answered_handoff_true_ending` easier to
  discover from the opened-manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so Cycle 43 follows the current random/coverage evidence. Coverage
  reaches all answered-handoff scenes, but normal random samples can still miss
  `passenger_answered_handoff_intercom`,
  `passenger_answered_handoff_roll_call`, and
  `passenger_answered_handoff_true_ending`. The opened-manifest hub already
  foregrounds passengers answering for themselves, so a direct handoff prompt
  gives normal players a readable path into the existing payoff.
- Planned work:
  - Add one direct opened-manifest choice into the existing answered-handoff
    roll-call branch.
  - Reuse the established `saw_mara_manifest_handoff`,
    `heard_passenger_answers`, and `heard_answered_passengers` flags so ending
    behavior stays consistent with the longer handoff route.
  - Add regression coverage proving the direct hub path reaches
    `passenger_answered_handoff_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new branch.
- Risks:
  - The opened-manifest hub gains one more optional action. This is acceptable
    because it reuses existing downstream scenes and clarifies a payoff that
    random normal play can miss.
- Work completed:
  - Added `ask_mara_to_handoff_opened_roll_call` from `passengers_released` to
    `passenger_answered_handoff_roll_call`.
  - Updated exact opened-manifest hub ordering coverage.
  - Added a direct opened-manifest answered-handoff regression path.
- Evidence:
  - Focused story-path suite passed: 162 tests.
  - `npm run health` passed: format check, TypeScript, 205 tests,
    validation, and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `ask_mara_to_handoff_opened_roll_call` ->
    `listen_to_answered_handoff_after_roll_call` ->
    `pull_release_after_answered_handoff_intercom`, ending at
    `passenger_answered_handoff_true_ending` with score 304 and no objectives.
- Playtest feedback:
  - The new hub action makes the answered-handoff payoff readable from the
    opened-manifest scene without requiring the player to detour into Mara's
    handoff and return.
  - The branch cleanly stages from hub prompt to roll call, intercom, and ideal
    ending. No dangling choices, objectives, or state issues appeared in the
    played route.
- Next step:
  - Watch future random/blind samples for whether the answered-handoff scenes
    appear more often in normal play. If hard issues stay absent, continue
    improving remaining low-random intercom payoffs such as
    `passenger_room_intercom`.
- Commit/push status:
  - Included with the current green worktree.

# Cycle 38 Opened Manifest Mitten Route

- Date: 2026-06-02
- Main objective: Make `passenger_mitten_*` more naturally discoverable from
  the opened-manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window
  yet, so this cycle follows the supplied Cycle 38 random/coverage evidence.
  Coverage reaches the returned-mitten scenes, but the 100-run random sample
  missed `passenger_mitten_intercom`, `passenger_mitten_memory`,
  `passenger_mitten_pair_memory`, and `passenger_mitten_true_ending`. The
  opened-manifest hub already mentions a child's laugh and ordinary passenger
  burdens, so returning the mitten there is a clear, player-facing action.
- Planned work:
  - Add a direct opened-manifest choice into the existing returned-mitten path.
  - Reuse `returned_lost_mitten` and `helped_passengers_gather` so scoring,
    route metadata, and endings stay aligned with the platform route.
  - Add regression coverage through `passenger_mitten_memory`,
    `passenger_mitten_intercom`, and `passenger_mitten_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new branch.
- Risks:
  - The opened-manifest hub gains one more optional passenger-specific action.
    This is acceptable because the route uses existing scenes and gives the
    hub a direct payoff for the child detail already present in its text.
- Work completed:
  - Added `return_opened_manifest_mitten` from `passengers_released` to
    `passenger_mitten_memory`.
  - Updated exact hub choice-order coverage and added a direct opened-manifest
    returned-mitten regression path.
- Evidence:
  - Focused story-path suite passed.
  - `npm run health` passed: format check, TypeScript, 205 tests, validation,
    and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `return_opened_manifest_mitten` -> `lead_mitten_child_to_third_car` ->
    `tap_paired_mittens_for_missing_name` ->
    `pull_release_after_paired_mittens`, ending at
    `passenger_mitten_true_ending` with score 304 and no objectives.
- Playtest feedback:
  - The new choice reads naturally from the opened-manifest prose because the
    hub already includes the child's laugh among the released passengers.
  - The route now reaches the mitten memory before the generic platform hub,
    which makes the child's beat feel intentional rather than buried under
    broader passenger gathering options.
  - No bugs, invalid choices, or dangling objectives appeared in the played
    route.
- Next step:
  - Watch future random and blind-play samples for whether
    `passenger_mitten_true_ending` appears more often in normal play. If hard
    issues remain absent, promote another low-random-discovery payoff such as
    `mara_last_dispatch_intercom` or `passenger_threshold_intercom`.
- Commit/push status:
  - Pending commit for Cycle 38 in this run.

# Cycle 42 Opened Manifest Mitten Discovery

- Date: 2026-06-02
- Main objective: Make `passenger_mitten_true_ending` easier to discover from
  the opened-manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so Cycle 42 follows the current random/coverage evidence. Coverage
  reaches every scene, but the supplied random sample missed
  `passenger_mitten_true_ending` and its intercom/memory beats. The opened
  manifest already foregrounds passenger keepsakes, so adding a direct mitten
  route strengthens normal-player discovery without changing the core route.
- Planned work:
  - Add a direct opened-manifest choice into the existing lost-mitten memory.
  - Make the `passengers_released` text explicitly surface the mitten clue so
    the new choice is motivated by visible story detail.
  - Preserve existing passenger gathering, keepsake, roll-call, answer, and
    boarding routes.
  - Add regression coverage proving the direct opened-manifest mitten route
    reaches `passenger_mitten_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more optional choice. This is acceptable
    because the hub already lists several passenger-specific follow-ups, and
    the new choice reuses existing downstream scenes instead of adding another
    branch family.
- Work completed:
  - Added `return_opened_manifest_mitten` from `passengers_released` to
    `passenger_mitten_memory`, setting `returned_lost_mitten` and
    `helped_passengers_gather`.
  - Revised `passengers_released` so the ordinary sounds include a damp mitten
    print beside the child's laugh.
  - Added story-path regression coverage for the direct opened-manifest mitten
    route through `passenger_mitten_intercom` and
    `passenger_mitten_true_ending`.
- Evidence:
  - Focused story-path suite passed: 161 tests.
  - `npm run health` passed: format check, TypeScript, 205 tests,
    validation, and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `passenger_mitten_memory`,
    `passenger_mitten_intercom`, and `passenger_mitten_true_ending`, with zero
    unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `return_opened_manifest_mitten` -> `lead_mitten_child_to_third_car` ->
    `pull_release_after_mitten_child_intercom`, ending at
    `passenger_mitten_true_ending` with score 298 and no objectives.
- Playtest feedback:
  - The new hub clue makes the mitten action readable before the choice appears:
    the opened manifest now surfaces the child, laugh, and mitten print in the
    same beat.
  - The route stages cleanly from opened-manifest hub to passenger memory,
    third-car intercom, and ideal ending. No dangling choices, objectives, or
    state issues appeared in the played route.
- Next step:
  - Watch future random/blind samples for whether `passenger_mitten_true_ending`
    appears more often in normal play. If hard issues stay absent, continue
    improving remaining passenger-specific intercom discoverability and report
    critique quality.
- Commit/push status:
  - Blocked in this sandbox because `.git` is mounted read-only. The worktree is
    left green for the outer loop to commit and push.

# Cycle 41 HOME Sign Clarity Pass

- Date: 2026-06-02
- Main objective: Make the false-HOME threat easier to understand and recover
  from in normal play.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window
  yet, so Cycle 41 follows current random/coverage and adaptive-route evidence.
  Coverage reaches `home_sign_echo`, but normal random samples missed it, and
  the adaptive route escaped after the early HOME flicker without a strong
  explanation of why HOME is dangerous but morning is safe.
- Planned work:
  - Preserve the existing early dark-HOME recovery route while adding an
    optional Mara explanation for players who answer her under the flicker.
  - Add a direct `morning_transfer` choice into `home_sign_echo` so map-only
    riders can see the recoverable HOME warning before leaving.
  - Add regression coverage for both HOME clarification routes.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - `morning_transfer` gains one more optional choice. This is acceptable
    because the scene already centers on a safe escape decision, and the new
    option points to an existing recoverable warning with clear leave,
    listen, and lose branches.
- Work completed:
  - Added Mara's false-HOME warning from the `dispatcher` scene after the
    player escapes the dark HOME flicker by answering her.
  - Added a `morning_transfer` option to look back at the HOME reflection in
    the train glass, leading to the existing `home_sign_echo` scene.
  - Added story-path regression coverage for both routes.
- Evidence:
  - Focused story-path suite passed: 158 tests.
  - `npm run health` passed: format check, TypeScript, 203 tests,
    validation, and coverage playtest.
  - Validation reports 138 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes, including `mara_false_home_warning`
    and `home_sign_echo`, with zero unfinished runs.
  - Actual CLI play followed `ride_with_map` ->
    `look_back_at_home_reflection` -> `listen_under_home_sign` ->
    `cover_home_sign_after_dispatch`, ending at `good_ending` with score 51
    and no objectives.
- Playtest feedback:
  - The new morning-transfer option fits the moment: the player has reached
    safe morning, but looking back through the glass lets HOME make one last
    personal claim.
  - Mara's dispatch cleanly separates false HOME from the practical map route:
    leave by the map, or return with token, fuse, badge, and ledger.
  - No bugs or dangling choices appeared in the played route.
- Next step:
  - Watch future random and blind-play samples for whether `home_sign_echo`
    appears more often in normal play. If hard issues remain absent, continue
    promoting remaining random misses such as `mara_last_dispatch_intercom` or
    passenger-specific intercom payoffs.
- Commit/push status:
  - Blocked in this sandbox because `.git` is mounted read-only and `git
commit` could not create `.git/index.lock`. The worktree is left green for
    the outer loop to commit and push.

# Cycle 40 Direct Opened Manifest Answers

- Date: 2026-06-02
- Main objective: Make `passenger_manifest_answers` easier to discover from
  the opened manifest doors.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window
  yet, so Cycle 40 follows current random/coverage evidence. Coverage reaches
  `passenger_manifest_answers`, but the 250-run MCP random sample still missed
  it. The scene is a strong payoff because the manifest stops being Mara's
  solo count and becomes passengers answering for themselves before release.
- Planned work:
  - Add an optional `passengers_released` choice directly into
    `passenger_manifest_answers`.
  - Reuse `manifest_names_answered_once` and `heard_mara_goodbye` so the new
    route behaves like the existing third-car intercom version.
  - Preserve the existing passenger-answer, keepsake, count, morning-chorus,
    and direct boarding routes.
  - Add regression coverage proving the direct opened-manifest answer route
    reaches `passenger_manifest_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest menu gains one optional choice. This is acceptable
    because the scene already foregrounds ordinary passenger sounds, and the
    new route uses existing downstream content instead of adding another
    ending.
- Work completed:
  - Added `let_opened_manifest_names_answer_once` from `passengers_released`
    directly to `passenger_manifest_answers`.
  - Set `manifest_names_answered_once` and `heard_mara_goodbye` on the direct
    path so it shares state with the established manifest intercom route.
  - Added regression coverage for the direct opened-manifest answer route into
    `passenger_manifest_true_ending`.
- Evidence:
  - Focused story-path suite passed: 156 tests.
  - `npm run health` passed: format check, TypeScript, 200 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `let_opened_manifest_names_answer_once` ->
    `pull_release_after_manifest_answers`, ending at
    `passenger_manifest_true_ending` with score 276 and no objectives.
- Playtest feedback:
  - The new option reads naturally from `passengers_released` because that
    scene already names the lunch tin, child's laugh, and umbrellas. Letting
    those opened names answer before boarding feels like a direct payoff, not a
    detour.
  - The ending text cleanly carries the same motif forward: ordinary sounds
    become footsteps, and the passengers finish the count in morning air.
- Next step:
  - Watch future random/blind samples for whether `passenger_manifest_answers`
    appears more often in ordinary play. If hard issues stay absent, continue
    promoting remaining normal-random misses such as
    `passenger_threshold_intercom`, `mara_last_dispatch_intercom`, or
    `home_sign_echo`.
- Commit/push status:
  - Blocked in this sandbox because `.git` is mounted read-only and `git
commit` could not create `.git/index.lock`. The worktree is left green for
    the outer loop to commit and push.

# Cycle 36 Opened Handoff Answer Discovery

- Date: 2026-06-02
- Main objective: Make the answered-passenger handoff route easier to discover
  from the opened-manifest hub after Mara has called the doors.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 36 evidence was behind the current checkout:
  several suggested misses were already promoted and covered. A fresh 250-run
  random sample on the live tree ended all runs with zero unfinished runs and
  visited every scene except `passenger_answered_handoff_intercom`,
  `passenger_answered_handoff_roll_call`, and
  `passenger_answered_handoff_true_ending`. Those scenes are a strong payoff
  for Mara handing the roll call to passengers who can answer for themselves.
- Planned work:
  - Add a gated post-handoff option from `passengers_released` into the
    existing `passenger_answered_handoff_roll_call`.
  - Keep the initial opened-manifest choice list unchanged by requiring
    `saw_mara_manifest_handoff`.
  - Reuse `heard_passenger_answers` and `heard_answered_passengers` so the
    branch behaves like the established answered-passenger handoff route.
  - Add regression coverage through `passenger_answered_handoff_intercom` and
    `passenger_answered_handoff_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest hub gains one more option after the player has already
    taken the Mara handoff beat. This is acceptable because the new option is
    gated behind that setup and does not crowd the first view of the hub.
- Work completed:
  - Added `board_with_opened_handoff_answers` from `passengers_released` to
    `passenger_answered_handoff_roll_call`.
  - Gated the new choice behind `saw_mara_manifest_handoff` so the first
    opened-manifest menu is unchanged.
  - Reused `heard_passenger_answers` and `heard_answered_passengers` to align
    the branch with the existing answered-handoff state.
  - Added regression coverage through `passenger_answered_handoff_roll_call`,
    `passenger_answered_handoff_intercom`, and
    `passenger_answered_handoff_true_ending`.
- Evidence:
  - Fresh pre-change 250-run random sample ended all 250 runs, had zero
    unfinished runs, and missed only the answered-handoff branch.
  - Focused story-path suite passed: 157 tests.
  - `npm run health` passed: format check, TypeScript, 201 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `watch_mara_open_manifest` -> `return_from_mara_manifest_handoff` ->
    `board_with_opened_handoff_answers` ->
    `listen_to_answered_handoff_after_roll_call` ->
    `pull_release_after_answered_handoff_intercom`, ending at
    `passenger_answered_handoff_true_ending` with score 308 and no objectives.
  - Post-change 250-run random sample ended all 250 runs, had zero unfinished
    runs, reached `passenger_answered_handoff_true_ending` once, and had no
    unvisited scenes.
- Playtest feedback:
  - The new option reads naturally after returning from Mara's opened-door
    handoff: the hub already contains the opened manifest sounds, and the
    label makes the player action about letting Mara hand the roll call to the
    passengers rather than simply boarding.
  - The branch stages cleanly from hub choice to roll-call scene, intercom
    confirmation, and ideal ending. No objectives or choices remained dangling.
- Next step:
  - Watch future blind-play samples for whether the opened-manifest hub now
    feels crowded after handoff. If hard issues stay absent, prioritize richer
    late-game critique/reporting or another soft pacing improvement from the
    next consolidated digest.

# Cycle 35 Direct Opened Manifest Blank Row

- Date: 2026-06-02
- Main objective: Make `passenger_missing_count` easier to discover from the
  opened passenger manifest hub.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle uses current random/coverage evidence. Coverage reaches
  `passenger_missing_count`, but normal random samples still miss it. The beat
  clarifies that the manifest's blank space is Mara's old pause, not a lost
  passenger, and turns the opened-manifest route into passengers actively
  counting one another before the release.
- Planned work:
  - Add a direct optional `passengers_released` choice into
    `passenger_missing_count`.
  - Preserve the existing reviewed-count route into the same scene.
  - Reuse `reviewed_open_manifest_count` and `checked_missing_passenger_count`
    so returning from the beat does not duplicate menu work.
  - Add regression coverage proving the direct route reaches an ideal passenger
    ending.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The opened-manifest menu gains one option. This is acceptable because the
    option is optional, sits near the other passenger-listening choices, and
    improves discoverability for a scene random play currently misses.
- Work completed:
  - Added `check_opened_manifest_blank_row` from `passengers_released`
    directly to `passenger_missing_count`.
  - Preserved the older `review_open_manifest_count` ->
    `check_for_unanswered_manifest_row` route.
  - Set both reviewed-count and missing-count flags on the new direct path.
  - Added regression coverage for the direct blank-row route into
    `passenger_counted_true_ending`.
  - Added `match_opened_manifest_keepsakes` from `passengers_released`
    directly to `passenger_keepsake_handoff`, with regression coverage through
    `passenger_keepsake_boarding`, `passenger_keepsake_roll_call`, and
    `passenger_keepsake_true_ending`.
- Evidence:
  - Focused story-path suite passed: 154 tests.
  - Final `npm run health` passed: format check, TypeScript, 199 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `check_opened_manifest_blank_row` ->
    `board_with_unanswered_row_resolved` ->
    `pull_release_after_counted_manifest_goodbye`, ending at
    `passenger_counted_true_ending` with score 261 and no objectives.
  - Actual CLI play also followed `clear_manifest_and_mara_from_ledger` ->
    `match_opened_manifest_keepsakes` ->
    `lead_keepsake_passengers_to_third_car` ->
    `hear_keepsake_roll_call_from_boarding` ->
    `pull_release_after_keepsake_roll_call`, ending at
    `passenger_keepsake_true_ending` with score 313 and no objectives.
  - A 250-run random sample ended all 250 runs, had zero unfinished runs,
    visited `passenger_missing_count`, and had one remaining unvisited optional
    scene: `passenger_manifest_answers`.
- Playtest feedback:
  - The direct blank-row option reads like a natural opened-manifest follow-up:
    after every door clicks open, the player can immediately inspect the one
    space the line still uses to isolate Mara.
  - The branch resolves cleanly into the counted-passenger ideal ending and
    keeps the older reviewed-count route intact for players who first choose a
    more formal manifest review.
  - The direct keepsake branch makes the opened manifest feel more tactile:
    players can move from the clicked-open doors straight into matching the
    lunch tin, newspaper, mitten, and conductor's punch before boarding.
- Next step:
  - Watch future random/blind samples for `passenger_missing_count` frequency;
    if hard issues stay absent, consider making `passenger_manifest_answers` or
    another remaining optional miss easier to encounter in ordinary play.

# Cycle 39 Opened Manifest Keepsake Discovery

- Date: 2026-06-02
- Main objective: Make the matched-keepsake passenger payoff easier to find
  directly from the opened manifest doors.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle follows current random/coverage evidence. Random play
  still missed `passenger_keepsake_boarding` and
  `passenger_keepsake_roll_call`, even though coverage reaches them. The
  opened-manifest hub already describes the lunch tin, child's laugh, and
  umbrellas, so letting players match those keepsakes at that moment should
  improve normal discovery without adding a new system.
- Planned work:
  - Add an optional `passengers_released` choice into the existing
    `passenger_keepsake_handoff` scene.
  - Reuse `matched_manifest_keepsakes` and `helped_passengers_gather` so this
    branch behaves like the established passenger-platform keepsake route.
  - Preserve existing manifest count, blank-row, morning chorus, Mara signoff,
    lunch-tin, answer, and direct boarding choices.
  - Add regression coverage proving the direct opened-manifest keepsake route
    reaches `passenger_keepsake_boarding`,
    `passenger_keepsake_roll_call`, and `passenger_keepsake_true_ending`.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new branch.
- Risks:
  - The opened-manifest menu gains one more optional choice. This is acceptable
    because the scene text already foregrounds the relevant objects, and the
    branch is gated so it cannot duplicate passenger-gathering work.
- Work completed:
  - Added `match_opened_manifest_keepsakes` from `passengers_released`
    directly to `passenger_keepsake_handoff`.
  - Reused `matched_manifest_keepsakes` and `helped_passengers_gather` so the
    new branch shares state with the established passenger-platform keepsake
    route.
  - Preserved existing opened-manifest count, blank-row, morning chorus, Mara
    signoff, lunch-tin, answered-passenger, and boarding routes.
  - Added regression coverage for the direct opened-manifest keepsake route
    through `passenger_keepsake_boarding`, `passenger_keepsake_roll_call`, and
    `passenger_keepsake_true_ending`.
- Evidence:
  - Focused story-path suite passed: 155 tests.
  - `npm run health` passed: format check, TypeScript, 199 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual CLI play followed `clear_manifest_and_mara_from_ledger` ->
    `match_opened_manifest_keepsakes` ->
    `lead_keepsake_passengers_to_third_car` ->
    `hear_keepsake_roll_call_from_boarding` ->
    `pull_release_after_keepsake_roll_call`, ending at
    `passenger_keepsake_true_ending` with score 313 and no objectives.
- Playtest feedback:
  - The new choice reads naturally because `passengers_released` already names
    the lunch tin, child, and umbrellas. Matching keepsakes there feels like a
    direct response to the scene rather than a detour.
  - The route cleanly stages the payoff: manifest objects become people,
    boarding fills by object, then the roll call becomes ordinary proof before
    the release.
- Next step:
  - Watch future random/blind samples for whether `passenger_keepsake_boarding`
    and `passenger_keepsake_roll_call` appear more often in ordinary play. If
    hard issues stay absent, promote another remaining normal-random miss such
    as `home_sign_echo`, `mara_last_dispatch_intercom`, or
    `passenger_threshold_intercom`.

# Cycle 38 Direct Passenger Room Intercom

- Date: 2026-06-02
- Main objective: Make `passenger_room_intercom` easier to discover from the
  opened passenger platform.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so the cycle uses current random/coverage evidence. Coverage reaches
  `passenger_room_intercom`, but normal random samples still miss it. The beat
  is a strong late-game payoff because it turns the manifest release from a
  ledger action into passengers physically making room for one another before
  the final release.
- Planned work:
  - Add a direct optional `passenger_platform` choice into
    `passenger_room_intercom`.
  - Preserve the existing longer `passenger_room_boarding` route and direct
    release route.
  - Reuse `made_room_for_passengers` and `heard_mara_goodbye` so downstream
    state matches the established room-making intercom path.
  - Add regression coverage proving the direct platform route reaches
    `passenger_true_ending`.
  - Run focused tests, full health, and an actual playthrough through the new
    branch.
- Risks:
  - The passenger platform menu gains one option. This is acceptable because
    the option is optional, sits near related threshold/room choices, and
    improves discoverability for a payoff scene that random play currently
    misses.
- Work completed:
  - Added `listen_as_passengers_make_room` from `passenger_platform` directly
    to `passenger_room_intercom`.
  - Preserved the existing room-boarding, threshold, passenger gathering, and
    direct release routes.
  - Set `made_room_for_passengers` and `heard_mara_goodbye` on the new direct
    path.
  - Added regression coverage for the direct room-making intercom into the
    shared release and `passenger_true_ending`.
- Evidence:
  - Focused story-path suite passed: 154 tests.
  - `npm run health` passed: format check, TypeScript, 198 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `listen_as_passengers_make_room` -> `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 258 and no objectives.
  - A 250-run random sample ended all 250 runs, had zero unfinished runs,
    visited every scene, and reached `passenger_room_intercom`.
- Playtest feedback:
  - The direct intercom works as a clean platform payoff: after the manifest
    doors open, listening to the passengers make room gives immediate texture
    to the crowd before the shared release.
  - The route did not leave dangling objectives and still preserves the longer
    room-boarding branch for players who want a more physical staging beat.
- Next step:
  - Watch future random/blind samples for whether `passenger_room_intercom`
    appears more often in ordinary play; if hard issues stay absent, promote
    another remaining normal-random miss such as `passenger_missing_count` or
    `passenger_keepsake_roll_call`.

# Cycle 34 Post-Dispatch Lost Ending Pressure

- Date: 2026-06-02
- Main objective: Make `lost_after_dispatch_ending` more visible in ordinary
  play after Mara has already named the recovery checklist.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current Cycle 34 evidence is green, all scenes are reachable, and
  random play still missed `lost_after_dispatch_ending` while coverage reached
  it. The post-dispatch failure is a useful fair-play consequence because the
  player hears the correct route and then chooses HOME anyway.
- Planned work:
  - Route `let_home_sign_drown_mara` from `home_sign_dispatch` directly to
    `lost_after_dispatch_ending`.
  - Preserve the pre-dispatch `home_sign_grip` warning from the original HOME
    stare and porch-light choices.
  - Add regression coverage proving the promoted branch lands in the
    post-dispatch ending with the expected flags and text.
  - Run focused tests, full health, and an actual route through the changed
    branch.
- Risks:
  - This removes one extra recovery chance only after Mara has explicitly named
    the safe route. The recovery choice still sits immediately beside the
    failure choice in `home_sign_dispatch`.
- Work completed:
  - Routed `let_home_sign_drown_mara` from `home_sign_dispatch` directly to
    `lost_after_dispatch_ending`.
  - Preserved `home_sign_grip` as the earlier recoverable warning reached from
    staring at HOME or stepping toward the porch light before Mara's dispatch.
  - Added regression coverage for the promoted drown-Mara branch and verified
    it sets both `surrendered_home_after_dispatch` and
    `let_home_drown_mara`.
- Evidence:
  - Focused story-path suite passed: 153 tests.
  - `npm run health` passed: format check, TypeScript, 198 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual CLI play followed `look_at_sign` ->
    `listen_for_mara_under_home_warning` -> `let_home_sign_drown_mara`, ending
    at `lost_after_dispatch_ending` with score 50, no objectives, and the
    expected post-dispatch flags.
  - A 250-run random sample ended all 250 runs, had zero unfinished runs,
    visited every scene, and reached `lost_after_dispatch_ending` once.
- Playtest feedback:
  - The changed branch reads cleaner: after Mara explicitly names "clock token,
    fuse, badge, ledger," choosing to let HOME drown her out now pays off as
    the specific consequence instead of another generic warning.
  - The game still provides fair recovery at the same scene through
    `turn_back_after_home_sign_dispatch`, so the failure feels earned rather
    than sudden.
- Next step:
  - Watch future random/blind samples for whether `lost_after_dispatch_ending`
    remains visible; if hard issues stay absent, promote another remaining
    normal-random miss or add a small late-passenger payoff.

# Cycle 37 Direct Morning Warning Mark

- Date: 2026-06-02
- Main objective: Make `morning_warning_mark` discoverable directly from the
  morning transfer platform.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current Cycle 37 evidence is green, but random/MCP samples still miss
  `morning_warning_mark` even though coverage reaches it. The warning is a
  strong fair-play beat because it turns the safe escape into an explicit
  checklist for a future rescuer and gives the current player one more clear
  chance to turn back.
- Planned work:
  - Add a direct `morning_transfer` choice into `morning_warning_mark`.
  - Preserve the existing map-note, door-listening, clock, good-ending, and
    return routes.
  - Reuse `left_morning_warning` and the established recovery effects so the
    direct branch stays consistent with older warning paths.
  - Add regression coverage proving the direct warning branch can recover into
    `true_ending`.
  - Run focused tests, full health, and an actual route through the new branch.
- Risks:
  - The morning-transfer menu gains one option. This is acceptable because it
    is a high-signal clarity action at an optional escape hub and does not
    remove the immediate safe ending.
- Work completed:
  - Added `mark_morning_transfer_warning` from `morning_transfer` directly to
    `morning_warning_mark`.
  - Preserved existing map-note, door-listening, stopped-clock, good-ending,
    token-return, and Mara-return routes.
  - Reused `left_morning_warning` and the established warning recovery effects
    so the direct route can return for the signal token and continue to the
    true ending.
  - Added regression coverage for the direct morning-transfer warning route and
    recovery into `true_ending`.
- Evidence:
  - Focused story-path suite passed: 153 tests.
  - `npm run health` passed: format check, TypeScript, 197 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - A 250-run random sample ended all 250 runs, visited
    `morning_warning_mark`, and had zero unfinished runs; only
    `lost_after_dispatch_ending` remained unvisited in that sample.
  - Actual CLI play followed `ride_with_map` ->
    `mark_morning_transfer_warning` ->
    `turn_back_from_warning_mark_for_token`, recovered through the core route,
    and ended at `true_ending` with score 255 and no objectives.
- Playtest feedback:
  - The direct warning works better at the morning escape hub because the
    player can immediately write down the concrete true-route checklist before
    deciding whether to leave or go back. The route did feel slightly lean when
    returning without reading Mara's file or radio, but it remained coherent
    because the warning explicitly named the needed objects.
- Next step:
  - Watch future random and blind samples for `lost_after_dispatch_ending`;
    if hard issues stay absent, promote that post-dispatch failure branch or
    another remaining normal-random miss with the same small-branch approach.

# Cycle 37 First HOME Dispatch Discovery

- Date: 2026-06-02
- Main objective: Make `home_sign_dispatch` discoverable from the first HOME
  sign warning, not only after the player keeps staring at the false HOME
  reflection.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current automated and MCP evidence is green, and the supplied Cycle
  32 evidence still calls out `home_sign_dispatch` and
  `lost_after_dispatch_ending` as normal-random discovery targets. Surfacing
  Mara's practical dispatch one beat earlier makes the false HOME branch fairer
  and turns a tempting trap into a clearer informed decision.
- Planned work:
  - Add a direct `sign_warning` choice into `home_sign_dispatch`.
  - Preserve the existing safe map exit, Mara-note recovery, stare, and porch
    light branches.
  - Reuse the existing dispatch flags so objective guidance remains consistent
    after the player turns back.
  - Run focused story-path tests, full health, and an actual route through the
    new branch.
- Risks:
  - The first HOME warning menu gains one more option. This is acceptable
    because it is a high-signal rescue/hint route and keeps the previous
    outcomes available.
- Work completed:
  - Added `listen_for_mara_under_home_warning` from `sign_warning` directly to
    `home_sign_dispatch`.
  - Preserved safe map escape, Mara-note recovery, HOME-stare, and porch-light
    branches.
  - Reused the existing dispatch knowledge flags so turning back from the HOME
    sign produces the same objective guidance as the deeper route.
  - Added regression coverage for the direct first-warning dispatch path into
    `true_ending` and for the deliberate post-dispatch lost ending.
- Evidence:
  - Focused story-path suite passed: 152 tests.
  - `npm run health` passed: format check, TypeScript, 196 tests, validation,
    and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual CLI play followed `look_at_sign` ->
    `listen_for_mara_under_home_warning` ->
    `turn_back_after_home_sign_dispatch`, recovered through the core route, and
    ended at `true_ending` with score 267 and no objectives.
- Playtest feedback:
  - The first-warning dispatch reads more fairly than the old hidden route:
    Mara names the recovery checklist while the false HOME sign is already
    threatening the player, then the player can make an informed choice to
    leave, turn back, or step into the trap.
- Next step:
  - Watch future random/blind samples for whether `home_sign_dispatch` and
    `lost_after_dispatch_ending` appear more often in normal play.

# Cycle 36 Opened-Count Handoff Discovery

- Date: 2026-06-02
- Main objective: Make the reviewed passenger-count chorus easier to discover
  from Mara's opened-manifest handoff.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current automated evidence is healthy enough to invest in richer
  late-game story depth. Earlier Cycle 31 evidence showed
  `passenger_counted_chorus` as a normal-random miss even though coverage could
  reach it. The chorus is a strong payoff because it turns the manifest count
  from bookkeeping into passengers answering for one another.
- Planned work:
  - Add a direct handoff choice from `mara_manifest_handoff` to
    `passenger_counted_chorus`.
  - Preserve direct boarding plus the recently promoted room and threshold
    routes ahead of the new count branch.
  - Set the reviewed-count flags on the new route so downstream state matches
    the established manifest-count path.
  - Add regression coverage for the new handoff-to-count route and ending.
  - Run focused tests, full health, and an actual MCP route through the new
    branch.
- Risks:
  - The handoff menu gains another optional late-game route. This is scoped to
    an already optional passenger payoff and keeps direct boarding first.
- Work completed:
  - Added `finish_count_after_mara_manifest_handoff` from
    `mara_manifest_handoff` to `passenger_counted_chorus`.
  - Preserved direct boarding, room-making, and threshold routes ahead of the
    new count branch.
  - Set `reviewed_open_manifest_count` and
    `passengers_finished_reviewed_count` on the direct handoff route.
  - Added regression coverage for the handoff-to-count route and
    `passenger_counted_true_ending`.
- Evidence:
  - Focused story-path suite passed: 151 tests.
  - `npm run health` passed: format check, TypeScript, 195 tests,
    validation, and coverage playtest.
  - Validation reports 137 reachable scenes and 27 endings.
  - Coverage playtest still visited all scenes with zero unfinished runs.
  - Actual MCP play followed `watch_mara_open_manifest` ->
    `finish_count_after_mara_manifest_handoff` ->
    `pull_release_after_counted_chorus`, ending at
    `passenger_counted_true_ending` with score 281 and no objectives.
- Playtest feedback:
  - The count branch reads naturally after Mara calls opened doors: the
    passengers finish the old blank space together, which makes the final
    ending feel less like accounting and more like mutual care.
- Next step:
  - Watch future random and blind samples for whether this improves ordinary
    discovery of `passenger_counted_chorus`; if no hard issues appear, keep
    investing in late-game passenger payoffs that make the final release feel
    shared.

# Cycle 35 Dark HOME Lost-Ending Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `lost_ending` through an
  early, recoverable dark-tunnel warning route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 35 evidence shows full coverage, no unfinished
  random runs, and healthy ideal-ending pressure, but random play rarely reaches
  `lost_ending`. The lost outcome is a useful cautionary beat for players who
  ignore the lantern and chase the false HOME signal, so it should be visible
  without being an unfair instant failure.
- Planned work:
  - Add a false-HOME flicker from `dark_tunnel` that points toward a new warning
    scene.
  - Give the warning scene two recovery routes and one explicit commitment to
    `lost_ending`.
  - Revise `lost_ending` text so it works whether the player carried the marked
    map or left it behind.
  - Add regression coverage for both the lost branch and recovery from the new
    warning into the true ending.
  - Run focused tests, full health, and an actual CLI playthrough through the
    new route.
- Risks:
  - The dark-tunnel menu gains one more risky option before the existing chain,
    speaker, and retreat routes. This is intentional pressure toward a rarely
    seen failure ending, and the warning still gives clear recovery choices.
- Work completed:
  - Added `dark_home_warning`, reached from `dark_tunnel` by following the false
    HOME flicker.
  - Added recovery choices from that warning back to `service_room` or Mara's
    dispatcher introduction, plus a deliberate `lost_ending` commitment.
  - Revised `lost_ending` so the marked-map line works whether the player
    carried the map or left it behind.
  - Added regression coverage for the dark-HOME warning, the new lost route,
    and recovery from the warning into `true_ending`.
- Evidence:
  - Focused story-path suite passed: 151 tests.
  - `npm run health` passed: format check, TypeScript, 195 tests, validation,
    and coverage playtest.
  - Validation now reports 137 reachable scenes and 27 endings.
  - Coverage playtest visited all 137 scenes, including `dark_home_warning`.
  - Actual CLI play followed `enter_dark` -> `follow_false_home_light` ->
    `pull_chain_before_home_takes_you`, recovered through the core route, and
    ended at `true_ending` with score 278 and no objectives.
  - A 250-run random sample ended all 250 runs, had no unfinished runs, visited
    `dark_home_warning`, and reached `lost_ending` 15 times.
- Playtest feedback:
  - The new warning reads as fair: the player sees why HOME is dangerous before
    committing to it, and the two recovery choices are concrete.
  - Recovery from the warning into the core route felt clean, though entering
    through the chain means the player can finish without the lantern because
    the lights are on.
- Next step:
  - Watch blind feedback for whether the early HOME warning is too tempting for
    cautious personas. If not, shift back to richer late-passenger depth or any
    recurring blind-play S0-S2 issue once the digest has a window.

# Cycle 34 Passenger Room Handoff Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of
  `passenger_room_intercom` and `passenger_room_release`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 34 evidence shows full coverage, all runs ending,
  and strong ideal-ending pressure, but random MCP samples still missed the
  passenger-room intercom/release scenes. These scenes are already reachable
  and narratively useful because they make the final release a shared action
  instead of a solo switch pull.
- Planned work:
  - Add a direct room-making choice from `mara_manifest_handoff` to
    `passenger_room_boarding`.
  - Revise the handoff text so the third car visibly asks for room, making the
    new branch feel motivated.
  - Preserve direct boarding, threshold, thumbprint, answered-passenger, and
    return routes from the handoff.
  - Add regression coverage for the new handoff-to-room route through
    `passenger_room_intercom`, `passenger_room_release`, and the final
    passenger true ending.
  - Run focused tests, full health, a random sample, and an actual CLI route
    through the promoted room payoff.
- Risks:
  - The handoff menu gains one more option before the existing threshold
    branch. This is intentional pressure toward a previously missed payoff,
    and the direct boarding/threshold paths remain available.
- Work completed:
  - Added `make_room_after_mara_manifest_handoff` from
    `mara_manifest_handoff` to `passenger_room_boarding`.
  - Revised Mara's opened-manifest handoff text so the third car visibly asks
    for room before the release.
  - Added regression coverage proving the new handoff path reaches
    `passenger_room_intercom`, `passenger_room_release`, and
    `passenger_true_ending`.
- Evidence:
  - Focused story-path suite passed: 148 tests.
  - `npm run health` passed: format check, TypeScript, 192 tests,
    validation, and coverage playtest.
  - Coverage playtest still visited all 136 scenes.
  - A 250-run random sample ended all 250 runs, had no unfinished runs, and
    visited every scene, including `passenger_room_boarding`,
    `passenger_room_intercom`, and `passenger_room_release`.
  - Actual CLI play followed `watch_mara_open_manifest` ->
    `make_room_after_mara_manifest_handoff` ->
    `listen_to_room_made_for_passengers` ->
    `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 270 and no objectives.
- Playtest feedback:
  - The new choice reads naturally after Mara calls the opened doors: the
    speaker fills with passengers, the third car asks for room, and the player
    can make space before touching the release.
  - The intercom and shared-release beats now feel like part of the handoff
    escalation rather than a side branch hidden behind returning to the
    platform.
- Next step:
  - Watch future random and blind samples for whether newly all-scene random
    coverage holds, then shift toward richer late-game story depth or any
    recurring blind-play S0-S2 issue once a digest window appears.

# Cycle 33 Matched Keepsake Intercom Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the matched-keepsake
  intercom and roll-call payoff.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 33 evidence shows healthy completion, full
  coverage, and strong ideal-ending pressure, but random play can reach the
  keepsake ending while missing `passenger_keepsake_intercom` and
  `passenger_keepsake_roll_call`. The existing scenes are strong late-passenger
  payoff, so this cycle makes them easier to choose without adding another
  ending.
- Planned work:
  - Add a direct handoff choice from `passenger_keepsake_handoff` to
    `passenger_keepsake_intercom`.
  - Promote `listen_to_keepsakes_answer_from_boarding` above the direct
    roll-call shortcut in `passenger_keepsake_boarding`.
  - Preserve direct boarding, direct roll-call, and direct release routes.
  - Update regression coverage for the new handoff-to-intercom route and
    keepsake choice order.
  - Run focused tests, full health, a random sample, and an actual CLI route
    through the promoted keepsake intercom path.
- Risks:
  - The direct third-car boarding route becomes one line lower from the
    keepsake handoff. It remains available, and the promoted option leads to
    the same established ending family.
- Work completed:
  - Added `carry_matched_keepsakes_to_speaker` from
    `passenger_keepsake_handoff` to `passenger_keepsake_intercom`.
  - Reframed `passenger_keepsake_intercom` as happening at the third-car
    speaker so the direct handoff path reads naturally.
  - Moved `listen_to_keepsakes_answer_from_boarding` before
    `hear_keepsake_roll_call_from_boarding`.
  - Added regression coverage for the new direct keepsake speaker path and
    updated existing choice-order assertions.
- Evidence so far:
  - Focused story-path suite passed: 147 tests.
  - `npm run health` passed: format check, TypeScript, 191 tests,
    validation, and coverage playtest.
  - Coverage playtest still visited all 136 scenes, including
    `passenger_keepsake_intercom` and `passenger_keepsake_roll_call`.
  - A 250-run random sample ended all 250 runs, had no unfinished runs, and
    visited both keepsake payoff scenes. It still missed
    `passenger_room_intercom` and `passenger_room_release` in this
    deterministic sample.
  - Actual CLI play followed `match_manifest_keepsakes` ->
    `carry_matched_keepsakes_to_speaker` -> `hear_final_keepsake_roll_call` ->
    `pull_release_after_keepsake_roll_call`, ending at
    `passenger_keepsake_true_ending` with score 318 and no objectives.
- Playtest feedback:
  - The new handoff option reads clearly: after matching objects to owners, the
    player can carry those objects straight to Mara's speaker and hear the
    strongest keepsake payoff before the release.
  - Promoting the intercom ahead of the direct roll-call shortcut makes the
    boarding menu scan from sensory payoff to roll call to final release.
  - The room route remains the next normal-play watch item because the random
    sample missed its intercom/release while coverage still reaches them.
- Next step:
  - Watch future random and blind samples for whether
    `passenger_room_intercom` and `passenger_room_release` need another
    discoverability nudge.

# Cycle 32 Passenger Threshold Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `passenger_threshold_intercom`
  without undoing the prior passenger-room boarding promotion.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 32 evidence shows full coverage and healthy
  completion, but a 250-run random MCP sample still missed
  `passenger_threshold_intercom`. The previous cycle made the room beat the
  stronger direct-platform continuation, so this cycle adds a threshold entry
  from Mara's opened-manifest handoff instead of moving the room route back
  down.
- Planned work:
  - Point `passenger_platform` text toward the third-car threshold as the next
    shared action.
  - Rename and promote the direct platform threshold choice so it explicitly
    says the player is holding the door open for every passenger.
  - Add a handoff-specific threshold choice after Mara calls the opened doors.
  - Preserve direct handoff boarding, thumbprint, answered-passenger, return,
    passenger-room, keepsake, mitten, lunch-tin, newspaper, gather, echo, and
    direct-release routes.
  - Update regression coverage for the new handoff-to-threshold path and
    threshold label.
  - Run focused tests, full health, a random sample, and an actual CLI route
    through `passenger_threshold_intercom`.
- Risks:
  - The room-making route moves one line lower on the ordinary passenger
    platform. It remains adjacent to direct boarding and covered by tests; the
    random sample should watch whether its intercom payoff needs another nudge.
- Work completed:
  - Revised `passenger_platform` text so opened passengers look toward the
    third-car threshold instead of generically waiting on the player.
  - Renamed `hold_third_car_threshold` to "Hold the third-car threshold open
    for every passenger".
  - Promoted `hold_third_car_threshold` above
    `make_room_for_passengers_in_third_car` in the ordinary passenger-platform
    menu while preserving the room route.
  - Added `hold_threshold_after_mara_manifest_handoff` from
    `mara_manifest_handoff` to `passenger_threshold_boarding`.
  - Kept direct Mara handoff boarding first and preserved thumbprint,
    answered-passenger, return, room, and direct platform routes.
  - Added regression coverage for the direct handoff-to-threshold route through
    `passenger_threshold_intercom`.
  - Relaxed older passenger-platform order assertions so they guard
    availability and final direct boarding without making unrelated route order
    brittle.
- Evidence so far:
  - Focused story-path suite passed: 146 tests.
  - `npm run health` passed: format check, TypeScript, 190 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes, including
    `passenger_threshold_intercom`, `passenger_room_intercom`, and
    `passenger_room_release`.
  - A 250-run random playtest ended all 250 runs, had no unfinished runs, and
    visited `passenger_threshold_intercom`.
  - Actual CLI play followed `watch_mara_open_manifest` ->
    `hold_threshold_after_mara_manifest_handoff` ->
    `listen_to_threshold_from_boarding` ->
    `pull_release_after_threshold_manifest`, ending at
    `passenger_true_ending` with score 292 and no objectives.
- Playtest feedback:
  - The new handoff threshold route reads coherently: Mara calls the opened
    doors, the player holds the third-car threshold, and the intercom payoff
    frames boarding as the passengers becoming a crowd.
  - The 250-run random sample now reaches `passenger_threshold_intercom`, but
    missed `passenger_room_intercom` and `passenger_room_release`; coverage and
    tests still preserve those scenes, so future random samples should watch
    whether the room route needs another discoverability nudge.
- Next step:
  - Watch random and blind feedback for whether room-route discovery regresses
    after improving threshold discovery.

# Cycle 27 Counted Chorus Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the reviewed-count
  passenger route, especially `passenger_counted_chorus`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 27 evidence shows full coverage and strong
  completion, but random play missed `passenger_counted_chorus` even though the
  scene has a strong payoff for the opened-manifest count. This cycle makes the
  counted route easier to follow without removing the answer, conductor,
  platform, or direct-release alternatives.
- Planned work:
  - Make the opened-manifest count label explicitly frame the branch as a
    before-boarding review.
  - Add a direct `passenger_counted_chorus` follow-through after the optional
    unanswered-row check in `passenger_manifest_count`.
  - Move `board_with_reviewed_manifest_count` just behind that chorus option so
    the intercom payoff also remains easier to find.
  - Preserve optional answered-passenger, conductor, platform, and direct
    train-car routes.
  - Update regression coverage for the new scan order.
  - Run focused tests, full health, a random sample, and an actual CLI route
    through `passenger_counted_chorus`.
- Risks:
  - The answered-passenger and conductor choices become one line lower inside
    the reviewed-count menu. They remain visible and tested; the promoted
    branch is the clearest continuation for players who chose to review the
    count before boarding.
- Work completed:
  - Renamed `review_open_manifest_count` to "Review Mara's opened manifest
    count before boarding".
  - Added `finish_reviewed_count_before_boarding` from
    `passenger_manifest_count` to `passenger_counted_chorus`.
  - Moved `board_with_reviewed_manifest_count` directly behind the new chorus
    option in `passenger_manifest_count`.
  - Updated story-path regression assertions for the upstream opened-manifest
    menu, reviewed-count scan order, direct chorus route, and intercom route.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes, including
    `passenger_counted_chorus`.
  - A 250-run random playtest ended all 250 runs, had no unfinished runs, and
    visited `passenger_counted_chorus`; only `passenger_threshold_intercom`
    remained unvisited in that sample.
  - Actual CLI play followed `review_open_manifest_count` ->
    `finish_reviewed_count_before_boarding` ->
    `pull_release_after_counted_chorus`, ending at
    `passenger_counted_true_ending` with score 275 and no objectives.
- Playtest feedback:
  - A 250-run random sample after only the label/order change still missed
    `passenger_counted_chorus`, which justified adding the direct chorus
    follow-through instead of stopping at wording.
  - The final manual route reads coherently: reviewing the count now naturally
    offers a finish-the-count beat before the release, and the ending reinforces
    the theme that the passengers keep track of one another rather than being
    totaled by the ledger.
- Next step:
  - Improve discovery for `passenger_threshold_intercom`, the remaining
    random-sample miss after this cycle.

# Cycle 30 Passenger Room Boarding Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the opened-passenger
  `passenger_room_boarding` -> `passenger_room_intercom` ->
  `passenger_room_release` route.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play
  window. The supplied Cycle 30 evidence shows full coverage and strong
  completion, but random samples still miss the passenger room scenes while
  coverage reaches them. The route already has concrete passenger-prop payoff,
  so this cycle makes it easier to notice in the normal opened-passenger menu.
- Planned work:
  - Move `make_room_for_passengers_in_third_car` above the threshold and
    generic boarding choices in `passenger_platform`.
  - Preserve the optional newspaper, lunch-tin, conductor, mitten, keepsake,
    gathered, and echo branches.
  - Update regression coverage for the new direct-boarding scan order.
  - Run focused tests, full health, random/coverage samples as needed, and an
    actual CLI route through the room payoff.
- Risks:
  - The threshold beat becomes one line lower for direct manifest boarders. It
    remains visible and tested; making room is the richer ordinary-passenger
    continuation when the player has not selected a more specific passenger
    helper route.
- Work completed:
  - Moved `make_room_for_passengers_in_third_car` above
    `hold_third_car_threshold` and `board_third_car_with_passengers` in
    `passenger_platform`.
  - Updated story-path regression coverage for the new direct-boarding scan
    order while preserving all optional passenger helper branches.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes, including
    `passenger_room_boarding`, `passenger_room_intercom`, and
    `passenger_room_release`.
  - A 250-run random playtest ended all 250 runs, had no unfinished runs, and
    visited all three passenger-room scenes.
  - Actual CLI play followed `board_after_releasing_passengers` ->
    `make_room_for_passengers_in_third_car` ->
    `listen_to_room_made_for_passengers` -> `pass_room_release_after_intercom`
    -> `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 259 and no objectives.
- Playtest feedback:
  - The promoted room choice reads as a stronger ordinary-passenger follow-up
    than generic boarding because it names the third car, the release, and the
    act of making space before the final pull.
  - The manual route cleanly paid off the newspaper, lunch tin, and mitten
    props before the ending.
- Next step:
  - Improve discovery for `passenger_counted_chorus` or
    `passenger_threshold_intercom`, which the 250-run random sample still
    missed.

# Cycle 29 Mara Manifest Handoff Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of Mara's opened-manifest
  handoff route and its `passenger_manifest_handoff_true_ending`.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window.
  The supplied Cycle 29 evidence shows full coverage and strong completion, but
  random play still rarely reaches `mara_manifest_handoff_intercom` and
  `passenger_manifest_handoff_true_ending`. The handoff is already written and
  tested; the issue is scan order after the player opens every passenger door.
- Planned work:
  - Move `watch_mara_open_manifest` to the top of the opened-passenger scene.
  - Move `board_after_mara_manifest_handoff` to the top of the Mara handoff
    scene so the direct handoff intercom is the most natural follow-through.
  - Preserve the optional thumbprint, roll-call, and return branches.
  - Update regression coverage for the new choice order and direct handoff
    payoff.
  - Verify the carried-over forced-gate warning edits in the same health pass.
  - Run focused tests, full health, playtest samples, and an actual CLI route.
- Risks:
  - The manifest count and morning chorus become one line lower in the opened
    passenger menu. This is acceptable because they remain visible optional
    enrichments, while Mara's handoff is the clearest narrative continuation
    from opening every manifest door.
- Work completed:
  - Moved the manifest handoff entry point to the top of `passengers_released`.
  - Moved direct boarding from `mara_manifest_handoff` to the first choice,
    ahead of optional thumbprint and roll-call branches.
  - Updated story-path regression expectations for the new order.
  - Preserved carried-over forced-gate warning label and retreat-first order.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes and reached
    `passenger_manifest_handoff_true_ending` 321 times.
  - A 250-run random playtest ended all 250 runs, reached
    `passenger_manifest_handoff_true_ending` 2 times, and visited
    `mara_manifest_handoff_intercom`.
  - Actual CLI play followed the direct opened-manifest handoff route through
    `watch_mara_open_manifest` -> `board_after_mara_manifest_handoff` ->
    `listen_to_mara_manifest_handoff_intercom` and ended at
    `passenger_manifest_handoff_true_ending` with score 297 and no objectives.
- Playtest feedback:
  - Moving `watch_mara_open_manifest` first makes Mara's handoff read as the
    natural continuation of opening every manifest door.
  - Moving direct boarding first in `mara_manifest_handoff` makes the handoff
    intercom easy to follow when the player accepts that beat.
  - The 250-run random sample now reaches the final handoff ending, though it
    remains rare enough that future blind feedback should still watch the
    `train_car` handoff prompt.
- Next step:
  - Watch blind feedback for whether the manifest count or morning chorus feels
    de-emphasized. If so, improve their labels rather than moving them above
    Mara's direct handoff again.

# Cycle 25 Forced-Gate Warning Priority

- Date: 2026-06-02
- Main objective: Reduce accidental pressure toward the forced-gate
  `bad_ending` while preserving it as a deliberate ignore-the-warning branch.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window.
  The supplied Cycle 25 evidence shows healthy completion and full coverage,
  but the adaptive exploratory MCP route still ended at `bad_ending` after
  forcing the platform gate without supplies. Since the route already has
  recovery beats, this cycle improves the first warning's scan order and label
  clarity instead of removing the failure.
- Planned work:
  - Rename the initial `force_gate` label so it explicitly calls out the empty
    fuse socket.
  - Put the safe `back_away_from_gate` option first in `gate_warning`, ahead of
    optional listening and the final force action.
  - Update regression coverage for the label and warning choice order.
  - Run focused tests, full health, a playtest sample, and an actual CLI route.
- Risks:
  - The `gate_echo` sensory beat may become slightly less prominent because
    retreat is now first. This is acceptable: the branch begins with an unsafe
    forced action, and the clearest recovery should be most visible.
- Work completed:
  - Renamed the underprepared platform `force_gate` choice to
    "Force the gate despite the empty fuse socket."
  - Reordered `gate_warning` so the recovery option appears before optional
    listening and the final force action.
  - Updated story-path regression coverage for the revised label and warning
    choice order.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes with no unvisited scenes.
  - Actual CLI play followed `take_lantern` -> `follow_arrows` -> `force_gate`
    -> `back_away_from_gate`, recovered through the service room checklist, and
    ended at `true_ending` with score 259 and no objectives.
- Playtest feedback:
  - The platform now names the empty fuse socket in the risky force-gate label,
    making the missing prerequisite visible before the player commits.
  - After forcing the gate once, the warning screen now leads with a concrete
    recovery action naming the four supplies. The optional echo and final bad
    ending branch remain available for deliberate exploration.
- Next step:
  - Watch future adaptive and blind routes for whether `gate_echo` becomes too
    easy to miss. If so, reinforce it as an optional flavor beat from the
    recovery path instead of moving the unsafe action upward again.

# Cycle 28 Direct HOME-Reflection Loss Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `lost_ending` without
  restoring accidental late HOME-sign failure pressure.
- Why this matters: `PLAYTEST_DIGEST.md` has no consolidated blind-play window.
  The supplied Cycle 28 evidence shows healthy completion, full coverage, and
  strong ideal-ending pressure, but the 100-run random sample still missed
  `lost_ending` while coverage only finds it through exhaustive exploration.
  The prior HOME-sign recovery pass made the final grip state fairer, so this
  cycle makes the bad ending easier to find only through an explicit
  exploratory choice.
- Planned work:
  - Add a clear direct failure choice from `home_sign_echo` to `lost_ending`.
  - Keep safe escape, Mara-listening, and final recovery choices ahead of the
    failure choice.
  - Extend the HOME-sign regression test for the new choice order and direct
    lost-ending route.
  - Validate, run health, and play the changed route through the CLI.
- Risks:
  - Random bad-ending pressure may rise slightly. This is acceptable because
    the route requires ignoring the sign warning first, and the unsafe choice is
    explicitly labeled as letting the map fall.
- Work completed:
  - Added `step_into_home_reflection` from `home_sign_echo` to `lost_ending`,
    setting `surrendered_home_to_reflection`.
  - Updated story-path regression coverage for the added choice and resulting
    `lost_ending`.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - CLI validation passed with 136 reachable scenes, 27 endings, and no
    warnings.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes, including `lost_ending`,
    with no unvisited scenes.
  - A 250-run random playtest ended all 250 runs and reached `lost_ending` 3
    times, with no unfinished runs.
  - Actual CLI play followed `look_at_sign` -> `stare_at_home` ->
    `step_into_home_reflection`, ending at `lost_ending` with score 39 and
    `surrendered_home_to_reflection` set.
- Playtest feedback:
  - The new route makes the failure legible as a chosen surrender to the HOME
    reflection after a prior warning, not a surprise punishment.
  - Safe map escape and Mara-listening choices still appear before the unsafe
    reflection choice, so recovery remains more prominent than failure.
- Next step:
  - Watch future blind feedback for whether the HOME-sign branch now feels too
    punitive. If it does, keep the direct route but soften the label or add one
    more line of warning rather than hiding the ending again.

# Cycle 23 HOME-Sign Grip Recovery

- Date: 2026-06-02
- Main objective: Reduce late HOME-sign lost-ending pressure after players board
  too early with Mara's map.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 23 suspicious samples repeatedly reached
  `lost_ending` by stepping toward the HOME sign and then choosing the duplicate
  false-door fail action. Core guidance is otherwise healthy, so the focused
  improvement is to make the final warning more recoverable without removing the
  trap entirely.
- Planned work:
  - Reorder `home_sign_grip` so the service-room recovery is the first visible
    choice.
  - Remove the redundant `reach_for_false_home_door` fail choice from the
    map-held grip state while preserving `surrender_to_home_sign` as the
    intentional lost ending.
  - Add regression coverage for the suspicious direct porch-light route,
    verifying recovery objectives and completion to `true_ending`.
  - Run focused tests, full health, a random sample, and an actual CLI route.
- Risks:
  - `lost_ending` becomes rarer in random play. This is acceptable because the
    route remains reachable through explicit surrender, while ordinary players
    get a clearer late recovery opportunity after multiple warnings.
- Work completed:
  - Changed `home_sign_grip` choice order to prioritize
    `jam_map_in_home_sign_doors`, then the morning-transfer escape, then
    explicit surrender.
  - Removed the duplicate false-door loss choice from the final map-grip scene.
  - Updated the HOME-sign regression test for the new choice order and for the
    direct `step_toward_porch_light` recovery route through to `true_ending`.
- Evidence:
  - Focused story-path suite passed: 145 tests.
  - CLI validation passed with 136 reachable scenes, 27 endings, and no
    warnings.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 136 scenes with no unvisited scenes.
  - Actual CLI play followed `step_toward_porch_light` ->
    `jam_map_in_home_sign_doors`, recovered to the service room, collected the
    badge/fuse/token, cleared Mara, and ended at `true_ending` with score 256
    and no objectives.
  - A 100-run random sample ended all 100 runs; `lost_ending` was not hit in
    that sample, while `lost_after_dispatch_ending` remained reachable once.
- Playtest feedback:
  - The grip scene now reads like a final pressure moment with one clear
    back-to-work option, one safe-exit option, and one explicit surrender.
  - Recovering from the trap feels coherent because the map text already names
    the service-room checklist: badge, fuse, clock token, ledger.
- Next step:
  - Watch blind feedback for whether the HOME sign now feels too forgiving. If
    so, keep the recovery first but strengthen the cost or aftertaste instead of
    restoring duplicate fail choices.

# Cycle 26 Returned-Mitten Pair Memory

- Date: 2026-06-02
- Main objective: Add a small optional payoff beat to the returned-mitten
  passenger route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and supplied Cycle 26 evidence showed healthy completion, full
  coverage, and no unfinished runs. With core guidance stable, the best focused
  improvement is richer late-passenger story depth without adding route
  complexity or another ending.
- Planned work:
  - Add one optional scene from `passenger_mitten_intercom` where the child uses
    both mittens to help identify another passenger before release.
  - Preserve direct final roll-call and direct release routes.
  - Add regression coverage for the new branch and verify it rejoins the
    existing returned-mitten ending.
  - Validate, run health, and actually play the new route through the CLI.
- Risks:
  - The mitten intercom scene gains a third visible choice. The new beat is
    one-step optional story payoff and returns immediately to the existing
    ending path, so route complexity stays bounded.
- Work completed:
  - Added `tap_paired_mittens_for_missing_name` from
    `passenger_mitten_intercom` to new scene
    `passenger_mitten_pair_memory`.
  - Added exits from the new scene to the final roll-call epilogue and directly
    to `passenger_mitten_true_ending`.
  - Updated returned-mitten story-path regression coverage for the new scene,
    choice order, state flag, and ending rejoin.
- Evidence so far:
  - Focused story-path suite passed: 145 tests.
  - CLI validation passed with 136 reachable scenes, 27 endings, and no
    warnings.
  - `npm run health` passed: format check, TypeScript, 189 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 136 scenes, including
    `passenger_mitten_pair_memory`, with no unvisited scenes.
  - Actual CLI play followed `return_lost_mitten` ->
    `lead_mitten_child_to_third_car` ->
    `tap_paired_mittens_for_missing_name` ->
    `hear_roll_call_after_paired_mittens` ->
    `pull_release_after_mitten_roll_call`, ending at
    `passenger_mitten_true_ending` with score 317 and no objectives.
- Playtest feedback:
  - The paired-mitten beat gives the child a second active moment before the
    final release and makes the returned object help identify another passenger.
  - The route still allows direct roll-call or release from the intercom, so
    players are not forced through the extra sensory beat.
- Next step:
  - Watch future blind feedback for whether late passenger intercoms feel
    choice-heavy. If they do, trim labels before adding more optional beats.

# Cycle 26 Conductor Transfer Handoff Priority

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the conductor-transfer
  handoff beat after the conductor punches the restored transfer.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Current supplied evidence showed full coverage and healthy completion,
  with the suggested next action focused on
  `passenger_conductor_transfer_handoff`. Cycle 25 made the proof beat directly
  discoverable, but that left the collaborative child handoff behind the direct
  proof and release choices.
- Planned work:
  - Reorder the uncounted conductor-transfer choices so
    `pass_punched_transfer_to_child` is first, followed by direct proof and
    direct release.
  - Keep all existing endings and recovery routes available.
  - Update regression coverage, validate, run health, run a random sample, and
    play the handoff route through the CLI.
- Risks:
  - The transfer scene still has five visible choices on the uncounted branch.
    This change improves scanning by order rather than adding another branch, so
    route complexity stays flat.
- Work completed:
  - Moved `pass_punched_transfer_to_child` before direct proof and direct
    release in the conductor-transfer choice list.
  - Updated conductor-transfer story-path regression coverage for the
    handoff-first order.
- Evidence:
  - Focused story-path suite passed: 144 tests.
  - CLI validation passed with 135 reachable scenes, 27 endings, and no
    warnings.
  - `npm run health` passed: format check, TypeScript, 188 tests, validation,
    and coverage playtest.
  - Actual CLI play followed `ask_conductor_to_punch_transfer` ->
    `pass_punched_transfer_to_child` -> `press_transfer_to_speaker_grille` ->
    `pull_release_after_transfer_proof`, ending at
    `passenger_conductor_transfer_true_ending` with score 324 and both
    `punched_transfer_carried_forward` and `pressed_transfer_to_speaker` set.
  - A 100-run random playtest ended all 100 runs and visited both
    `passenger_conductor_transfer_handoff` and
    `passenger_conductor_transfer_proof`, with no unvisited scenes.
- Playtest feedback:
  - Putting the child handoff first makes the collaborative passenger beat feel
    like the natural continuation of the transfer being passed down the aisle.
  - The direct proof and direct release paths remain present, so players who
    want a shorter finish are not forced through the extra handoff beat.
- Next step:
  - Watch future blind feedback for whether the five-choice transfer scene
    feels crowded. If it does, consolidate roll-call labels before adding any
    more conductor-transfer branches.

# Cycle 25 Direct Conductor Transfer Proof

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the conductor-transfer proof
  beat by surfacing it directly from the punched-transfer scene.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Supplied Cycle 25 evidence showed full coverage and healthy
  completion, but the 100-run random sample still missed
  `passenger_conductor_transfer_proof` and
  `passenger_conductor_transfer_handoff`. The proof scene is the strongest
  tactile payoff for the punched transfer, so it should be visible on ordinary
  passenger-conductor routes without requiring a two-step optional detour.
- Planned work:
  - Add a direct proof choice from `passenger_conductor_transfer` to
    `passenger_conductor_transfer_proof`.
  - Keep the direct release and child handoff choices available.
  - Put the proof choice first so normal random and player scanning see the
    prop payoff before the immediate release.
  - Extend regression coverage, validate, run health, and play the route.
- Risks:
  - The transfer scene keeps five visible choices on the uncounted branch. The
    added option is a one-step payoff that rejoins the existing ideal ending,
    and direct release remains available for players ready to finish.
- Work completed:
  - Added `press_punched_transfer_to_speaker` from
    `passenger_conductor_transfer` to `passenger_conductor_transfer_proof`.
  - The new choice sets both `punched_transfer_carried_forward` and
    `pressed_transfer_to_speaker`, then returns through the existing
    `pull_release_after_transfer_proof` ending path.
  - Updated conductor-transfer story-path regression coverage for the new
    direct proof route and adjusted expected choice ordering.
- Evidence:
  - Focused story-path suite passed: 144 tests.
  - CLI validation passed with 135 reachable scenes, 27 endings, and no
    warnings.
  - Actual CLI play followed `ask_conductor_to_punch_transfer` ->
    `press_punched_transfer_to_speaker` ->
    `pull_release_after_transfer_proof`, ending at
    `passenger_conductor_transfer_true_ending` with score 323, no objectives,
    and both transfer proof flags recorded.
  - A 100-run random playtest now visits
    `passenger_conductor_transfer_proof`; `passenger_conductor_transfer_handoff`
    remains a rarer optional beat for larger/random or coverage samples.
- Playtest feedback:
  - The route now gives the punched transfer an immediate visible payoff: the
    star hole catches Mara's voice and projects a morning-shaped mark before
    release.
  - The direct release path remains present, so the change improves scanning
    without forcing the extra sensory beat.
- Next step:
  - Watch future blind feedback for whether the five-choice transfer scene
    feels crowded. If it does, consolidate roll-call labels before adding any
    more conductor-transfer branches.

# Cycle 21 Conductor Transfer Proof

- Date: 2026-06-02
- Main objective: Add a small optional proof beat to the conductor-transfer
  handoff so the punched transfer feels more tactile before the ideal release.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current supplied evidence shows healthy completion, full coverage,
  and no unfinished runs. With the earlier handoff discoverability issue already
  addressed in the current repo, the best focused improvement is richer
  late-game payoff on a strong passenger prop without adding another ending or
  broad route complexity.
- Planned work:
  - Add one optional scene after `passenger_conductor_transfer_handoff` where
    the player presses the punched transfer to Mara's speaker grille.
  - Preserve the existing direct release from the handoff.
  - Extend conductor-transfer regression coverage for both the new proof route
    and the direct route.
  - Validate, run health, and actually play the new route through the CLI.
- Risks:
  - The handoff scene gains one additional optional choice. It is a one-step
    sensory beat and returns immediately to the same ideal ending, so route
    complexity stays bounded.
- Work completed:
  - Added `press_transfer_to_speaker_grille` from
    `passenger_conductor_transfer_handoff` to the new
    `passenger_conductor_transfer_proof` scene.
  - Added `pull_release_after_transfer_proof` to preserve the same
    `passenger_conductor_transfer_true_ending` payoff.
  - Updated story-path regression coverage for the new proof beat and the
    preserved direct handoff release.
- Evidence:
  - Focused story-path suite passed: 144 tests.
  - CLI validation passed with 135 reachable scenes, 27 endings, and no
    warnings.
  - `npm run health` passed: format check, TypeScript, 188 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 135 scenes, including
    `passenger_conductor_transfer_proof`, with no unvisited scenes.
  - Actual CLI play followed `ask_conductor_to_punch_transfer` ->
    `pass_punched_transfer_to_child` -> `press_transfer_to_speaker_grille` ->
    `pull_release_after_transfer_proof`, ending at
    `passenger_conductor_transfer_true_ending` with score 327, no objectives,
    and `pressed_transfer_to_speaker` recorded.
- Playtest feedback:
  - The new proof beat gives the punched transfer a clearer visual payoff: the
    star hole lines up with Mara's speaker and becomes something the whole car
    can see before release.
  - The direct handoff release still works, so players who are ready to finish
    are not forced through the extra beat.
- Next step:
  - Watch future blind feedback for whether late conductor-transfer routes feel
    overfull. If they do, trim adjacent labels before adding more beats.

# Cycle 24 Mara-Note HOME Sign Recovery

- Date: 2026-06-02
- Main objective: Give prepared-but-premature train riders a clearer recovery
  path from the false HOME sign back to Mara's ledger route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 24 evidence showed healthy completion and full
  coverage. The remaining suspicious random samples repeatedly reached
  `lost_ending` after reading Mara's file, taking the map/token, boarding too
  early, and following the HOME sign. That route had warnings, but no
  file-specific recovery beat at the first sign warning.
- Planned work:
  - Add one gated `sign_warning` choice for players carrying the marked map
    after reading Mara's personnel file.
  - Route that choice back to the service room with objective flags for the
    token, badge proof, platform, and Mara.
  - Add regression coverage proving the recovery route can still finish at
    `true_ending`.
  - Validate, run health, and play the route through the CLI.
- Risks:
  - `sign_warning` gains a fourth choice only for players who read Mara's file
    before boarding. Underprepared players still see the original three-choice
    warning, preserving the trap's pressure.
- Work completed:
  - Added `follow_mara_note_from_sign` from `sign_warning` to `service_room`,
    gated by `map` plus `read_mara_file`.
  - The new branch sets `resisted_home_sign_with_mara_note`, `met_mara`,
    `knows_platform`, `knows_token_location`, and `knows_badge_proof`.
  - Added a story-path regression that follows the new branch, verifies the
    recovered objectives, and completes `true_ending`.
- Evidence:
  - Focused story-path suite passed: 144 tests.
  - CLI validation passed with 134 reachable scenes, 27 endings, and no
    warnings.
  - Actual CLI play followed `read_personnel_file` -> `keep_mara_file` ->
    `board_train` -> `look_at_sign` -> `follow_mara_note_from_sign`, then
    recovered the fuse and badge, cleared Mara's ledger row, and ended at
    `true_ending` with score 291 and no objectives.
  - `npm run health` passed: format check, TypeScript, 188 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 134 scenes with no unvisited scenes.
- Playtest feedback:
  - The new branch makes Mara's note feel actionable at the exact moment the
    false HOME sign competes with the map.
  - The route still allows the player to leave safely by map or lose by
    surrendering to the sign, but gives evidence-oriented players a more
    natural way back to the core rescue.
- Next step:
  - Watch future blind feedback for whether early train boarding still feels
    like a fair mistake. If HOME-sign losses remain frequent, tune choice
    labels before adding another recovery branch.

# Cycle 24 Counted Chorus Ending Consistency

- Date: 2026-06-02
- Main objective: Tighten the reviewed-manifest count payoff by sending the
  passenger-finished count chorus to the counted-crowd ending instead of the
  earlier reviewed-count ending.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current health/playtest evidence shows full reachability and
  strong completion. With discoverability healthy, the best next improvement is
  late-route story consistency: once the passengers finish Mara's count
  together, the ending should emphasize people keeping track of one another
  rather than Mara's count still being fresh from the ledger.
- Planned work:
  - Retarget `pull_release_after_counted_chorus` to
    `passenger_counted_true_ending`.
  - Update regression coverage for the new ending text and preserve the
    earlier direct reviewed-count release route.
  - Validate, run health, and play the route.
- Risks:
  - This slightly changes one existing route's ending variant inside the same
    ideal Manifest family. The direct reviewed-count ending remains available
    from the intercom before the passengers finish the count.
- Work completed:
  - Retargeted `pull_release_after_counted_chorus` from
    `passenger_reviewed_count_true_ending` to `passenger_counted_true_ending`.
  - Updated the reviewed-count chorus regression test to assert the counted
    crowd ending text.
- Evidence:
  - Focused story-path suite passed: 143 tests.
  - CLI validation passed with 134 reachable scenes, 27 endings, and no
    warnings.
  - Actual CLI play followed `review_open_manifest_count` ->
    `board_with_reviewed_manifest_count` ->
    `let_passengers_finish_reviewed_count` ->
    `pull_release_after_counted_chorus`, ending at
    `passenger_counted_true_ending` with score 279 and no objectives.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 134 scenes with no unvisited scenes.
- Playtest feedback:
  - The route now escalates cleanly: Mara starts the reviewed count, the
    passengers finish it as a chorus, and the ending describes the count
    becoming a crowd rather than a total.
  - The direct reviewed-count ending remains available before the passenger
    chorus, preserving the lighter route.
- Next step:
  - Watch future blind feedback for whether the reviewed-count branch now has
    the right number of adjacent payoff choices; if it feels crowded, simplify
    labels before adding more manifest endings.

# Cycle 23 Counted Transfer Handoff

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of
  `passenger_conductor_transfer_handoff` by surfacing it from the counted
  conductor-transfer route as well as the uncounted transfer route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Supplied Cycle 23 evidence showed healthy completion, full coverage,
  and no unfinished runs, but the 100-run random sample still missed
  `passenger_conductor_transfer_handoff`. The handoff is a strong passenger
  payoff, so it should remain available when players first review Mara's opened
  manifest count and then ask the conductor to punch the morning transfer.
- Planned work:
  - Add one gated handoff choice from `passenger_conductor_count_roll_call`
    when the conductor has punched the transfer.
  - Reuse the existing handoff scene and ending path to avoid expanding ending
    taxonomy.
  - Preserve the direct counted-transfer release branch.
  - Add regression coverage, validate, run health, and play the route.
- Risks:
  - The counted-transfer roll-call scene gains a second choice. Both choices
    are immediate payoffs for the same punched transfer, and the direct release
    remains available.
- Work completed:
  - Added `pass_counted_punched_transfer_to_mara` from
    `passenger_conductor_count_roll_call` to the existing
    `passenger_conductor_transfer_handoff` scene.
  - Gated the new choice to the counted conductor-transfer state with
    `punched_conductor_transfer` and `notFlag: punched_transfer_carried_forward`.
  - Preserved `pull_release_after_conductor_count_transfer` as the direct
    counted-transfer ending path.
  - Extended the reviewed-manifest conductor regression test to cover the new
    handoff route and the preserved direct release route.
- Evidence:
  - Focused story-path suite passed: 143 tests.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 134 scenes, including
    `passenger_conductor_transfer_handoff`, with no unvisited scenes.
  - Actual CLI play followed `review_open_manifest_count` ->
    `ask_conductor_after_manifest_count` -> `ask_conductor_to_punch_transfer`
    -> `hear_counted_transfer_conductor_roll_call` ->
    `pass_counted_punched_transfer_to_mara` ->
    `pull_release_after_transfer_handoff`, ending at
    `passenger_conductor_transfer_true_ending` with score 322, no objectives,
    and `punched_transfer_carried_forward` recorded.
  - A 250-run random playtest ended 250/250 runs, had zero frontier samples,
    and visited `passenger_conductor_transfer_handoff`.
- Playtest feedback:
  - The counted manifest branch now has a clear passenger-scale payoff for the
    punched transfer instead of forcing players directly from the counted clear
    call into an ending.
  - The added choice reads as a continuation of the existing transfer prop and
    did not disrupt the direct counted-transfer release.
- Next step:
  - Watch blind feedback for whether the conductor/count/transfer route now has
    too many adjacent optional beats; if so, consolidate labels around the
    transfer payoff rather than adding another conductor branch.

# Cycle 19 Room Intercom Shared Release

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the shared room-release
  payoff by making it available after Mara's crowded-car intercom as well as
  from the direct train-car continuation.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. Cycle 19 supplied evidence showed healthy completion and full
  coverage reachability, but `passenger_room_release` was still missed in a
  250-run random MCP sample. The scene is already a strong payoff for making
  space in the third car, so the right next move is to expose it through the
  other natural room-making branch instead of adding more parallel content.
- Planned work:
  - Add a gated choice from `passenger_room_intercom` to
    `passenger_room_release`.
  - Preserve the existing direct `pull_release_after_making_room` ending path.
  - Extend regression coverage to prove both intercom continuations remain
    valid.
  - Validate, run health, and play the route.
- Risks:
  - The room intercom now has two choices instead of one. Both choices are
    short, adjacent, and tied to the same immediate release objective.
- Work completed:
  - Added `pass_room_release_after_intercom` from `passenger_room_intercom` to
    `passenger_room_release`.
  - Set `shared_release_reached` on the new branch so transcript and score
    evidence match the direct train-car shared-release branch.
  - Preserved the existing direct `pull_release_after_making_room` route to
    `passenger_true_ending`.
  - Extended the room-making regression test to cover both intercom
    continuations and the original train-car hand-to-hand continuation.
- Evidence:
  - Focused story-path suite passed: 143 tests.
  - CLI validation passed with 134 reachable scenes and 27 endings.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 134 scenes, including
    `passenger_room_release`, with no unvisited scenes.
  - Actual CLI play followed `make_room_for_passengers_in_third_car` ->
    `listen_to_room_made_for_passengers` ->
    `pass_room_release_after_intercom` ->
    `pull_shared_release_after_making_room`, ending at
    `passenger_true_ending` with score 259, no objectives, and
    `shared_release_reached` recorded.
  - A 250-run random playtest ended 250/250 runs, had zero frontier samples,
    and visited `passenger_room_release`.
- Playtest feedback:
  - The room route now has a coherent optional escalation whether the player
    reaches straight for the release or pauses for Mara's crowded-car intercom.
  - The new label is direct and actionable, and the immediate ending option
    remains available for players who do not want another pause.
- Next step:
  - Watch blind feedback for whether the plain passenger platform remains
    readable with its current optional branches; if it starts to feel crowded,
    consolidate nearby passenger-room choices rather than adding more choices.

# Cycle 22 Shared Release Payoff

- Date: 2026-06-02
- Main objective: Add a focused payoff after direct passenger-manifest players
  make room in the third car, so the emergency release feels shared by the
  rescued crowd rather than only operated by the player.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and supplied Cycle 22 evidence shows healthy completion, full
  coverage reachability, and no unfinished runs. The previous cycle added a
  strong room-making beat, but its direct train-car continuation still fell
  back to generic manifest release actions. A narrow follow-through improves
  story texture without changing route requirements or adding ending taxonomy.
- Planned work:
  - Add one gated train-car choice after `made_room_for_passengers`.
  - Route that choice through one new optional scene where the passengers help
    reach the release together.
  - Preserve the existing direct room intercom and plain
    `passenger_true_ending`.
  - Add regression coverage, validate, run health, and play the route.
- Work completed:
  - Added `pass_release_hand_to_hand` from `train_car` after the
    `made_room_for_passengers` branch.
  - Added `passenger_room_release`, where the passengers physically help bring
    the emergency release into reach.
  - Kept `passenger_true_ending` as the payoff and preserved the direct release
    path.
  - Gated the generic manifest intercom away from the room-making train-car
    continuation so the more specific room payoff is the visible optional beat
    there.
  - Extended regression coverage for the direct room route through the new
    hand-to-hand release scene.
- Evidence so far:
  - Focused story-path suite passed: 143 tests.
  - CLI validation passed with 134 reachable scenes and 27 endings.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
  - Coverage playtest visited `passenger_room_release`; all 134 scenes were
    reachable, 8,152/8,259 runs ended, and there were no unfinished runs.
  - Actual CLI play followed the room-making route through
    `pass_release_hand_to_hand` and `pull_shared_release_after_making_room`,
    ending at `passenger_true_ending` with score 256, no objectives, and
    `made_room_for_passengers` plus `shared_release_reached` recorded.
- Playtest feedback:
  - The room route now has a clearer emotional escalation: make space, reach
    the handle together, then release everyone.
  - The new choice felt specific to the preceding room-making action and did
    not affect normal manifest routes.
  - The ending text still fits because the new scene frames the same broad
    passenger release rather than creating a new outcome.
- Risks:
  - The train-car choice list gains one branch after room-making. The branch is
    gated to the room route and replaces the generic manifest intercom there,
    keeping normal manifest routes unchanged.
- Next step:
  - Watch future blind feedback for whether the room-making branch now feels
    complete or whether the passenger platform choice list needs consolidation.

# Cycle 18 Transfer Column Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of the newspaper transfer
  branch and the conductor transfer handoff without adding new endings or
  changing required true-ending logic.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 18 evidence shows healthy completion, full
  coverage reachability, and zero unfinished runs, but normal random samples
  still sometimes miss `passenger_newspaper_transfer` and
  `passenger_conductor_transfer_handoff`. The transfer column is a strong
  passenger detail, so it should be easier to notice during ordinary platform
  play.
- Planned work:
  - Add one direct platform choice that asks the newspaper woman to read the
    blank transfer column aloud.
  - Route that choice into the existing `passenger_newspaper_transfer` scene.
  - Add a second handoff opportunity after the conductor's transfer roll call
    so the punched transfer can still reach Mara if the player pauses for the
    clear call first.
  - Preserve the existing slower newspaper-memory route and all existing
    endings.
  - Add regression coverage for the direct transfer-column path and conductor
    handoff.
- Work completed:
  - Added `ask_newspaper_woman_to_read_transfer_column` from
    `passenger_platform` to `passenger_newspaper_transfer`.
  - Set `heard_newspaper_memory` and `studied_newspaper_transfer` on the direct
    route so later state/report evidence matches the discovered clue.
  - Added `pass_punched_transfer_from_roll_call` from
    `passenger_conductor_roll_call` to `passenger_conductor_transfer_handoff`
    when the conductor's punched transfer is active.
  - Updated exact choice-list expectations and added regression coverage that
    reaches `passenger_conductor_transfer_handoff` through both the direct
    transfer branch and the new roll-call handoff branch.
- Evidence so far:
  - Focused story-path suite passed: 143 tests.
  - CLI validation passed with 133 reachable scenes and 27 endings.
  - Actual CLI play followed the direct transfer-column route through
    `pass_punched_transfer_to_child` to
    `passenger_conductor_transfer_true_ending` with score 298 and no remaining
    objectives.
  - Actual CLI play followed the transfer roll-call route through
    `pass_punched_transfer_from_roll_call` to
    `passenger_conductor_transfer_true_ending` with score 300 and no remaining
    objectives.
  - A 250-run random playtest visited both `passenger_newspaper_transfer` and
    `passenger_conductor_transfer_handoff`, with 250/250 ended and no frontier
    samples.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
- Playtest feedback:
  - The direct platform choice makes the transfer column readable before the
    player has to step through the longer newspaper-memory beat.
  - The roll-call handoff option reads naturally after the conductor has
    validated the paper, and it preserves the direct release for players who
    want to end immediately.
  - The route remains ideal and does not add ending taxonomy or metadata
    complexity.
- Risks:
  - The passenger platform has one more optional choice. The label is concrete
    and routes to existing content, but future blind feedback should watch
    whether this makes the choice list feel too busy.
- Next step:
  - Watch blind feedback for whether the passenger platform choice list now
    feels crowded; if so, consolidate labels before adding more optional
    passenger beats.

# Cycle 21 Passenger Crowd Room Beat

- Date: 2026-06-02
- Main objective: Add a small optional payoff for direct passenger-manifest
  boarders so the crowded third car feels like people physically making room
  before the emergency release, without changing true-ending requirements.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and supplied Cycle 21 evidence says guidance, coverage, and ending
  reachability are healthy. The highest-value next move is richer story depth.
  The plain passenger manifest route could still jump from a populated platform
  into the generic third-car release text, making the rescued crowd feel less
  present than the more specific lunch-tin, mitten, keepsake, and roll-call
  variants.
- Planned work:
  - Add one optional choice from `passenger_platform` on the plain manifest
    route.
  - Add one boarding scene and one intercom payoff that route to the existing
    `passenger_true_ending`.
  - Preserve the direct `board_third_car_with_passengers` and
    `pull_release_with_manifest` path.
  - Add regression coverage and verify with CLI play plus `npm run health`.
- Work completed:
  - Added `make_room_for_passengers_in_third_car` to `passenger_platform`.
  - Added `passenger_room_boarding`, where the player makes practical space
    for the newspaper, lunch tin, and mitten passengers.
  - Added `passenger_room_intercom`, where Mara names that shared space as
    something the ledger could not count.
  - Added a regression proving the branch appears, sets
    `made_room_for_passengers`, reaches `passenger_true_ending`, and can also
    return to the normal train-car release path.
- Evidence so far:
  - Focused story-path suite passed: 143 tests.
  - CLI validation passed with 133 reachable scenes and 27 endings.
  - `npm run health` passed: format check, TypeScript, 187 tests, validation,
    and coverage playtest.
  - Actual CLI play followed the new room-making route to
    `passenger_true_ending` with score 276, no remaining objectives, and
    `made_room_for_passengers` plus `heard_mara_goodbye` recorded.
  - Commit attempt was blocked by the managed sandbox because `.git/index.lock`
    could not be created on the read-only `.git` mount.
- Playtest feedback:
  - The new beat makes the plain passenger route feel physically crowded before
    the release, using the same concrete passenger objects already introduced
    by the manifest.
  - The intercom payoff is short and keeps the objective clear: pull the
    release while the car has room for everyone.
  - The direct route remains available for players who do not want another
    optional pause.
- Risks:
  - The plain passenger platform choice list is one item longer. This is
    acceptable for now because the new choice is optional, concrete, and
    located beside the existing threshold and board actions.
- Next step:
  - Commit and push this green milestone from the outer loop or any environment
    with writable `.git` access.
  - Watch future blind feedback for whether the passenger platform choice list
    feels too busy; if so, tune labels or fold nearby optional beats rather
    than adding more parallel choices.

# Cycle 17 Train-Car Mara Handoff

- Date: 2026-06-02
- Main objective: Add a small late-game payoff beat for players who board the
  third car immediately after clearing Mara, without changing true-ending
  requirements or adding a new ending.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 17 evidence says core guidance is healthy and
  the best next move is richer story depth. The plain Mara route already had
  strong intercom options, but immediate boarders could only ask for another
  dispatch, listen to Mara, or pull the release; the existing handoff payoff
  was easier to miss.
- Planned work:
  - Add one optional plain-route choice from `train_car` after Mara is freed.
  - Reuse the existing `mara_handoff_intercom` and
    `mara_handoff_true_ending` rather than creating a new ending split.
  - Preserve the direct `pull_release` route and existing intercom branches.
  - Add regression coverage and verify with a real CLI playthrough.
- Work completed:
  - Added `wait_for_mara_at_far_door` from `train_car` to
    `mara_handoff_intercom`.
  - Set `saw_mara_handoff` and `heard_mara_goodbye` on that choice so
    transcript/state evidence matches the existing handoff route.
  - Updated story-path tests to expect the new choice and prove it reaches
    `mara_handoff_true_ending`.
- Evidence:
  - Focused story-path suite passed: 142 tests.
  - CLI validation passed with 131 reachable scenes and 27 endings.
  - Actual CLI play followed `wait_for_mara_at_far_door` from `train_car`,
    then `pull_release_after_handoff_goodbye`, ending at
    `mara_handoff_true_ending` with score 279 and no remaining objectives.
- Playtest feedback:
  - The new choice makes Mara's physical escape visible even when the player
    skipped `watch_mara_leave_booth`.
  - The route remains focused: it is one optional pause before the release, and
    direct release still stays available.
  - The reused ending text fits the new path because the intercom beat clearly
    establishes Mara crossing to the far doors.
- Risks:
  - The plain train-car choice list is slightly busier. It still has only four
    choices and all optional flavor choices point toward the same release goal.
- Next step:
  - Watch future blind feedback for whether the third-car choice list feels
    overfull; if it does, tune labels or collapse redundant Mara intercom
    options before adding more late-game beats.

# Cycle 20 HOME Sign Porch-Light Branch

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `lost_ending` without
  adding another ending split or weakening the existing recovery route.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 20 evidence showed `lost_ending` remained the only random
  miss in the 100-run sample while long-run signals said core guidance was
  healthy. The best next move was to make the existing HOME-sign trap easier
  for normal exploration to sample while keeping it fair.
- Planned work:
  - Add one additional tempting branch at `sign_warning`.
  - Route it to the existing recoverable `home_sign_grip` warning scene.
  - Preserve `look_away_from_sign` and the map-based recovery options.
  - Update regression coverage and verify through actual CLI play.
- Work completed:
  - Added `step_toward_porch_light` from `sign_warning` to `home_sign_grip`.
  - Set `felt_home_sign_grip` on that route so transcript evidence matches the
    existing final HOME-sign pressure.
  - Updated story-path tests to assert the new sign-warning choice and prove
    recovery via `jam_map_in_home_sign_doors`.
- Evidence:
  - Focused story-path suite passed: 141 tests.
  - CLI validation passed with 131 reachable scenes and 27 endings.
  - Actual CLI play followed `step_toward_porch_light` then
    `jam_map_in_home_sign_doors`, returning to `service_room` with objectives
    for the token, fuse, badge, and safe map route.
  - Actual CLI play followed `step_toward_porch_light` then
    `reach_for_false_home_door`, reaching `lost_ending` with
    `reached_false_home_door` recorded.
  - `npm run health` passed: format check, TypeScript, 185 tests, validation,
    and coverage playtest.
  - A 250-run random playtest reached `lost_ending` 5 times with zero
    unfinished runs, compared with the supplied Cycle 20 MCP random sample's
    single `lost_ending` hit.
- Playtest feedback:
  - The new label is concrete and tempting, but "impossible porch light" keeps
    it visibly dangerous.
  - The first consequence remains recoverable, so the added branch increases
    discoverability without making `lost_ending` feel like an arbitrary
    one-click punishment.
  - The existing ending text still fits because this route requires the map
    before boarding the train.
- Risks:
  - Random play may show a modest increase in HOME-sign failures. This is
    acceptable because the route enters the same final warning scene with two
    recovery choices before the terminal loss.
- Next step:
  - Watch random and blind-play samples for whether `lost_ending` now appears
    often enough to critique. If it does, prioritize feedback quality over
    adding more loss branches.

# Cycle 16 HOME Sign Lost-Ending Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play discovery of `lost_ending` while keeping
  the HOME-sign trap fair and recoverable.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 16 evidence showed random play missed `lost_ending` even
  though coverage could reach it. The branch existed, but normal exploration
  had to choose one late surrender option after several prior trap choices.
- Planned work:
  - Add one additional, clearly bad surrender choice at the final HOME-sign
    grip scene.
  - Preserve both recovery routes from the same scene.
  - Keep ending metadata in story data and reuse `lost_ending` instead of
    adding another ending split.
  - Update regression coverage for the new route.
- Work completed:
  - Added `reach_for_false_home_door` from `home_sign_grip` to `lost_ending`.
  - Added `reached_false_home_door` route evidence for transcript/report
    diagnosis.
  - Updated the HOME-sign regression to assert the new visible choice and its
    ending path.
- Evidence:
  - Focused HOME-sign regression passed: 1 test, 140 skipped in
    `tests/story-paths.test.ts`.
  - CLI validation passed with 131 reachable scenes and 27 endings.
  - Actual CLI play took `reach_for_false_home_door` and reached
    `lost_ending` with `reached_false_home_door` recorded.
  - A 250-run random playtest reached `lost_ending` once, where the previous
    Cycle 16 random sample missed it.
  - `npm run health` passed: format check, TypeScript, 185 tests, validation,
    and coverage playtest.
  - Health coverage visited all 131 scenes, including `lost_ending`, with zero
    unfinished runs.
- Playtest feedback:
  - The added choice reads as a concrete action toward the false HOME image,
    not a duplicate of the existing abstract surrender.
  - The final trap scene still feels fair because the map recovery and service
    room recovery remain visible before either bad choice.
  - The final `lost_ending` text still fits both surrender choices.
- Risks:
  - More loss pressure at `home_sign_grip` could slightly increase bad-ending
    frequency; this is acceptable because the scene still exposes two explicit
    recoveries and the new choice is visibly dangerous.
- Next step:
  - Watch the next blind digest for whether HOME-sign losses are now visible
    enough to critique; if they remain absent, tune the player-view objective
    or sign-warning labels rather than adding more endings.

# Cycle 19 HOME Dispatch Failure Feedback

- Date: 2026-06-02
- Main objective: Improve feedback quality for the recurring HOME-sign
  dispatch loss path without making the route easier or changing the main
  true-ending requirements.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, while Cycle 19 random evidence showed the only recurring
  `lost_ending` samples came from stepping toward the false HOME after Mara
  explicitly named the recovery route. Splitting that failure gives transcripts
  and future blind reports a clearer diagnosis than the generic HOME loss.
- Planned work:
  - Route `step_into_false_home_after_dispatch` to a specific bad ending.
  - Preserve the existing recoveries from `home_sign_dispatch` and
    `home_sign_grip`.
  - Keep ending metadata in story data and classify the new ending as a bad
    Failure ending.
  - Update regression coverage for the changed path.
- Work completed:
  - Added `lost_after_dispatch_ending` with text that names the ignored
    `clock token, fuse, badge, ledger` route.
  - Updated `step_into_false_home_after_dispatch` to use the new ending while
    preserving `surrendered_home_after_dispatch`.
  - Updated the HOME-sign regression to assert the new ending and feedback
    text.
- Evidence:
  - Focused story-path suite passed: 141 tests.
  - CLI validation passed with 131 reachable scenes and 27 endings.
  - Actual CLI play followed the HOME dispatch loss path and reached
    `lost_after_dispatch_ending` with the new transcript text.
  - `npm run health` passed: format check, TypeScript, 185 tests, validation,
    and coverage playtest.
  - Health coverage visited all 131 scenes, including
    `lost_after_dispatch_ending`, with zero unfinished runs.
- Playtest feedback:
  - The new ending makes the failure feel specifically tied to ignoring Mara
    rather than merely staring at the sign.
  - The transcript now preserves the clue list the player walked away from,
    which should make future blind feedback easier to interpret.
  - The route remains intentionally lossy after a clearly labeled bad choice;
    the existing turn-back and map-cover choices still provide recovery.
- Risks:
  - Ending counts changed from 26 to 27. Existing metadata-driven reporting
    handles this, but future trend comparisons should treat the new ending as
    a split of the previous HOME-sign lost pressure.
- Next step:
  - Watch the next blind digest for whether HOME-sign losses continue; if they
    do, tune visible choice labels or player-view objective timing instead of
    adding another warning scene.

# Cycle 15 Manifest Answers

- Date: 2026-06-02
- Main objective: Add one focused payoff beat to the low-frequency plain
  manifest route after Mara's final intercom count.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 15 evidence shows all scenes covered, zero unfinished
  runs, and healthy ideal-ending pressure. The best next improvement is richer
  late-route story depth without changing route requirements or ending
  classification.
- Planned work:
  - Add an optional passenger-answer beat after `mara_manifest_intercom`.
  - Keep the immediate `pull_release_after_manifest_goodbye` choice available.
  - Reuse `passenger_manifest_true_ending` so route metadata stays stable.
  - Add regression coverage for both the old direct release and the new beat.
- Work completed:
  - Added `let_manifest_names_answer_once` from `mara_manifest_intercom` to
    new optional scene `passenger_manifest_answers`.
  - Added `manifest_names_answered_once` as route evidence for the optional
    beat.
  - Added `pull_release_after_manifest_answers`, reusing
    `passenger_manifest_true_ending`.
  - Updated manifest route regressions to prove both direct release and the
    new answer beat remain valid.
- Evidence:
  - Focused story-path suite passed: 141 tests.
  - `npm run health` passed: format check, TypeScript, 185 tests, story
    validation, and coverage playtest.
  - Health validation reported 130 reachable scenes and 26 endings.
  - Health coverage visited all 130 scenes, including
    `passenger_manifest_answers`, with zero unfinished runs.
  - Actual CLI play used `listen_to_mara_manifest_intercom`,
    `let_manifest_names_answer_once`, and
    `pull_release_after_manifest_answers`, then reached
    `passenger_manifest_true_ending`.
- Playtest feedback:
  - The new beat makes the plain manifest route feel less like abstract ledger
    bookkeeping and more like passengers audibly reclaiming their names.
  - The direct release remains available, preserving late-game momentum for
    players who want to finish immediately.
  - The added beat reads as a quiet payoff rather than a new puzzle gate.
- Risks:
  - This adds another optional late passenger choice. Watch blind-play digest
    output for choice-density complaints before adding more late intercom
    beats.
- Next step:
  - Let blind consolidation decide whether late passenger-route choice density
    is a real issue; otherwise continue with small route-specific payoffs or
    transcript/report critique.

# Cycle 18 Punched Transfer Handoff

- Date: 2026-06-02
- Main objective: Add one focused payoff beat to the adaptive conductor
  transfer route that ended at `passenger_conductor_transfer_true_ending`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and Cycle 18 evidence shows a healthy, fully covered game with the
  adaptive route landing on the punched-transfer passenger ending. The best
  next improvement is richer late-route texture without changing route
  requirements.
- Planned work:
  - Add an optional hand-to-hand transfer beat after
    `passenger_conductor_transfer`.
  - Keep the existing immediate release and roll-call choices available.
  - Reuse `passenger_conductor_transfer_true_ending` to avoid splitting ending
    classification.
  - Add regression coverage for the new beat and unchanged direct release.
- Work completed:
  - Added `pass_punched_transfer_to_child` from
    `passenger_conductor_transfer` to new optional scene
    `passenger_conductor_transfer_handoff`.
  - Added `punched_transfer_carried_forward` so the beat is one-time and
    route-specific.
  - Added `pull_release_after_transfer_handoff`, reusing
    `passenger_conductor_transfer_true_ending`.
  - Updated conductor-route regression coverage for the new handoff while
    preserving the existing immediate release and roll-call options.
- Evidence:
  - Focused story-path suite passed: 141 tests.
  - `npm run health` passed: format check, TypeScript, 185 tests, story
    validation, and coverage playtest.
  - Health validation reported 129 reachable scenes and 26 endings.
  - Health coverage visited all 129 scenes, including
    `passenger_conductor_transfer_handoff`, with zero unfinished runs.
  - Actual CLI play used `ask_conductor_to_punch_transfer`,
    `pass_punched_transfer_to_child`, and
    `pull_release_after_transfer_handoff`, then reached
    `passenger_conductor_transfer_true_ending` at score 323 with no active
    objectives.
- Playtest feedback:
  - The handoff makes the punched transfer feel less like a private token and
    more like a shared proof passed through the people the player helped.
  - The beat connects the child, newspaper woman, lunch-tin worker, Mara, and
    conductor without adding new route requirements.
  - Immediate release remains visible, preserving momentum for players who do
    not want another late optional scene.
- Risks:
  - This adds one more optional late passenger choice. Watch blind sessions for
    conductor-route choice density.
- Next step:
  - Let blind consolidation identify whether late passenger-route choice
    density is becoming a real soft issue; otherwise continue with small
    route-specific payoffs or transcript/report critique.

# Cycle 14 Stairwell Token Return

- Date: 2026-06-02
- Main objective: Smooth the adaptive escape-warning route so players who
  listen to Mara at the stairwell and choose to continue recover the signal
  token without being dropped back into generic tunnel navigation.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 14 adaptive route ended at
  `warned_escape_ending` after Mara clearly named the token. The escape ending
  should remain available, but players who heed that warning should get a
  cleaner return path to active play.
- Planned work:
  - Add stairwell-call-specific token recovery choices from `clock`.
  - Send lit-platform escape listeners directly back to `lit_platform`.
  - Send unlit-platform escape listeners directly back to `platform`.
  - Preserve the existing `warned_escape_ending` branch for players who still
    choose to leave.
  - Add regression coverage for both lit and unlit return paths.
- Work completed:
  - Added `take_token_return_to_lit_platform`, gated by `heard_escape_call` and
    `platform_lit`.
  - Added `take_token_return_to_dark_platform`, gated by `heard_escape_call`,
    `knows_platform`, and an unlit platform.
  - Kept the original `take_token` path for normal clock visits and other
    token-recovery routes.
  - Updated escape-warning tests and added an unlit stairwell-listener
    regression.
- Evidence:
  - Focused story-path suite passed: 141 tests.
  - Actual CLI play followed the adaptive unlit stairwell route through
    `take_token_return_to_dark_platform` and reached `true_ending` at score
    280 with no active objectives.
  - `npm run health` passed: format check, TypeScript, 185 tests, story
    validation, and coverage playtest.
  - Health validation reported 128 reachable scenes and 26 endings.
  - Health coverage visited all 128 scenes with zero unfinished runs.
- Playtest feedback:
  - The new unlit return choice removes a small but noticeable navigation tax
    after Mara's strongest escape-warning clue.
  - The route still asks the player to inspect the gate control and recover
    missing parts, so the shortcut improves orientation without skipping the
    core preparation loop.
  - `warned_escape_ending` remains intact for players who intentionally abandon
    the route after hearing the token clue.
- Risks:
  - The clock now has contextual token choices after `heard_escape_call`; watch
    future blind sessions for whether the changed label feels too directive or
    appropriately helpful.
- Next step:
  - Let blind consolidation decide whether escape-warning routes need more
    softening; otherwise continue with small route payoffs or transcript/report
    critique.

# Cycle 17 Morning Chorus Boarding

- Date: 2026-06-02
- Main objective: Add a focused third-car payoff for the passenger morning
  chorus route without changing route requirements or ending classification.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, while current Cycle 17 evidence shows all scenes reachable, zero
  unfinished random runs, and healthy ideal-ending rates. The best next
  improvement is richer late passenger-route payoff in a lane not touched by
  the reviewed-count chorus.
- Planned work:
  - Add a one-time optional third-car intercom beat after
    `passenger_morning_chorus`.
  - Keep the existing direct release from `train_car` available for players who
    do not want another beat.
  - Route the new beat into the existing `passenger_true_ending`.
  - Add regression coverage for the new beat and unchanged direct release.
- Work completed:
  - Added `listen_to_morning_chorus_from_boarding` from `train_car` to new
    optional scene `passenger_morning_intercom`.
  - Added `heard_passenger_morning_boarding` gating so the beat appears once on
    the morning-chorus route.
  - Added `pull_release_after_morning_chorus_boarding`, reusing the existing
    `passenger_true_ending`.
  - Updated the morning-chorus regression to prove the old direct release
    remains available and added a dedicated regression for the new beat.
- Evidence:
  - Focused story-path suite passed: 140 tests.
  - `npm run health` passed: format check, TypeScript, 184 tests, story
    validation, and coverage playtest.
  - Health validation reported 128 reachable scenes and 26 endings.
  - Health coverage visited all 128 scenes, including
    `passenger_morning_intercom`, with zero unfinished runs.
  - Actual CLI play used `listen_to_passenger_morning_chorus`,
    `board_after_passenger_morning_chorus`,
    `listen_to_morning_chorus_from_boarding`, and
    `pull_release_after_morning_chorus_boarding`, then reached
    `passenger_true_ending` at score 282 with no active objectives.
- Playtest feedback:
  - The new beat closes the loop between the earlier remembered-morning
    imagery and the third-car release.
  - The destination sign giving up on HOME and showing real stops makes the
    route feel less abstract and more spatial.
  - Direct release remains visible from the train car, preserving momentum for
    players who do not want another optional intercom.
- Risks:
  - This adds one more optional late passenger choice. Watch blind sessions for
    late-route choice density.
- Next step:
  - Let blind consolidation determine whether late passenger-route choice
    density is becoming a soft issue; otherwise continue with small route
    payoffs or transcript/report critique.

# Cycle 17 Reviewed Count Chorus

- Date: 2026-06-02
- Main objective: Add one focused story-depth beat to the adaptive route that
  reached `passenger_reviewed_count_true_ending`, without changing ending
  classification or route requirements.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and current evidence shows all scenes reachable with strong
  ideal-ending rates. The best next improvement is richer late passenger-route
  payoff rather than another discoverability fix.
- Planned work:
  - Add an optional moment inside `passenger_counted_manifest_intercom` where
    the passengers finish Mara's reviewed count together.
  - Preserve both existing release choices from that intercom.
  - Route the new beat back into the existing
    `passenger_reviewed_count_true_ending` payoff.
  - Add regression coverage for the new beat and final ending.
- Work completed:
  - Added `let_passengers_finish_reviewed_count` from
    `passenger_counted_manifest_intercom` to new optional scene
    `passenger_counted_chorus`.
  - Added `passengers_finished_reviewed_count` as a route flag for the optional
    beat.
  - Added `pull_release_after_counted_chorus`, reusing
    `passenger_reviewed_count_true_ending`.
  - Updated the existing reviewed-count intercom regression to include the new
    optional choice and added a dedicated path regression for the new scene.
- Evidence:
  - Focused story-path suite passed: 139 tests.
  - `npm run health` passed: format check, TypeScript, 183 tests, story
    validation, and coverage playtest.
  - Health validation reported 127 reachable scenes and 26 endings.
  - Health coverage visited all 127 scenes, including
    `passenger_counted_chorus`, with zero unfinished runs.
  - Actual CLI play used `review_open_manifest_count`,
    `board_with_reviewed_manifest_count`,
    `let_passengers_finish_reviewed_count`, and
    `pull_release_after_counted_chorus`, then reached
    `passenger_reviewed_count_true_ending` at score 279 with no active
    objectives.
- Playtest feedback:
  - The new beat makes the reviewed-count path feel less procedural: Mara stops
    at the old blank space, then the passengers answer for one another.
  - The route preserves momentum because the old immediate release choices are
    still visible in the same intercom.
  - The existing ending still fits the new path, especially its line about the
    passengers proving the count can end.
- Risks:
  - This adds one more optional late-game passenger choice. Future blind
    sessions should watch for choice density around passenger count and
    sign-off routes.
- Next step:
  - Let blind consolidation identify whether late passenger-route density is a
    real soft issue; otherwise continue with small route-specific payoffs or
    transcript/report critique.

# Cycle 16 Passenger Sign-Off Thumbprint Bridge

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for
  `mara_manifest_thumbprint_intercom` and
  `passenger_manifest_thumbprint_true_ending` by letting Mara's new passenger
  sign-off surface the manifest thumbprint oath.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 16 evidence showed all scenes reachable with a
  strong ideal-ending rate, but the 100-run random sample still missed
  `mara_manifest_thumbprint_intercom` and
  `passenger_manifest_thumbprint_true_ending`. The payoff existed, but normal
  players had to notice the opened-manifest handoff before the thumbprint
  route became available.
- Planned work:
  - Add one contextual bridge from `passenger_mara_signoff` into the existing
    manifest thumbprint scene.
  - Keep direct return, platform-crossing, and third-car boarding choices
    intact.
  - Preserve the existing `mara_manifest_thumbprint_intercom` and
    `passenger_manifest_thumbprint_true_ending` payoff instead of creating a
    parallel ending.
  - Add regression coverage proving the new bridge reaches the ideal
    manifest-thumbprint ending.
- Work completed:
  - Added `notice_manifest_thumbprint_after_mara_signoff`, gated before the
    passengers have answered or gathered, from `passenger_mara_signoff` to
    `mara_manifest_thumbprint`.
  - The new choice sets `read_manifest_thumbprint` and
    `saw_mara_manifest_handoff`, allowing the existing oath-carrying route to
    continue naturally.
  - Updated the existing sign-off regression to include the new optional bridge.
  - Added a dedicated story-path regression for sign-off -> manifest
    thumbprint -> intercom -> `passenger_manifest_thumbprint_true_ending`.
- Evidence:
  - Focused story-path suite passed: 138 tests.
  - `npm run health` passed: format check, TypeScript, 182 tests, story
    validation, and coverage playtest.
  - Health validation reported 126 reachable scenes and 26 endings.
  - Health coverage visited all 126 scenes, including
    `mara_manifest_thumbprint_intercom` and
    `passenger_manifest_thumbprint_true_ending`, with zero unfinished runs.
  - Actual CLI play used `ask_mara_to_sign_off_opened_manifest`,
    `notice_manifest_thumbprint_after_mara_signoff`, and
    `carry_manifest_thumbprint_to_third_car`, then reached
    `passenger_manifest_thumbprint_true_ending` at score 307 with no active
    objectives.
- Playtest feedback:
  - The sign-off bridge reads as a natural visual follow-through: after Mara
    tells the passengers no one boards alone, the player can notice the mark
    that once kept her alone on the manifest.
  - The existing oath scene and ending still carry the payoff, so the change
    improves discovery without splitting the route into another ending.
  - Direct boarding remains visible from `passenger_mara_signoff`, preserving
    momentum for players who do not want another optional beat.
- Risks:
  - `passenger_mara_signoff` now has one more optional choice. Watch blind
    sessions for late passenger-route choice density.
- Next step:
  - Watch the next random/blind samples for whether
    `passenger_manifest_thumbprint_true_ending` appears more often; if it does,
    shift toward transcript/report critique or another small route-specific
    payoff.

# Cycle 15 Passenger Mara Sign-Off

- Date: 2026-06-02
- Main objective: Add a focused story-depth beat to the passenger-manifest
  route now that normal-play discoverability and route health are strong.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, and the supplied Cycle 15 evidence showed all scenes reachable, zero
  unfinished random runs, and a 71% random ideal-ending rate. With core
  guidance healthy, the highest-value improvement was richer late-game payoff
  rather than another corrective branch.
- Planned work:
  - Add one optional post-release moment where Mara signs off directly to the
    opened passenger manifest.
  - Keep existing passenger count, morning chorus, lunch-tin, manifest handoff,
    roll-call, and direct boarding routes intact.
  - Gate the beat so it appears once before passengers have already answered or
    gathered.
  - Add regression coverage proving the new route returns cleanly and can still
    finish through an ideal passenger ending.
- Work completed:
  - Added `ask_mara_to_sign_off_opened_manifest` from `passengers_released` to
    new optional scene `passenger_mara_signoff`.
  - Added `heard_passenger_mara_signoff` gating so the prompt disappears after
    use.
  - Added return, cross-platform, and direct-board choices from the new scene,
    all feeding existing passenger routes.
  - Added story-path regression coverage for the new scene, one-time prompt,
    objective preservation, and completion through `passenger_true_ending`.
- Evidence:
  - Focused story-path suite passed: 136 tests.
  - `npm run health` passed: format check, TypeScript, 180 tests, story
    validation, and coverage playtest.
  - Health validation reported 126 reachable scenes and 26 endings.
  - Health coverage visited all 126 scenes, including
    `passenger_mara_signoff`, with zero unfinished runs.
  - Actual CLI play used `ask_mara_to_sign_off_opened_manifest`, then
    `board_after_passenger_mara_signoff`, and reached `passenger_true_ending`
    at score 277 with no active objectives.
- Playtest feedback:
  - The new beat gives Mara a human, non-bureaucratic sign-off to the passengers
    before the final release, strengthening the passenger route's emotional
    payoff.
  - The text reads naturally after every manifest door opens: Mara tells the
    passengers they were held, not late, and the crowd starts moving together.
  - Direct boarding and all existing passenger-development choices remain
    visible, so the new moment adds depth without blocking momentum.
- Risks:
  - `passengers_released` now has one more optional choice in its initial list.
    Future blind sessions should watch whether this still feels deliberate
    rather than crowded.
- Next step:
  - Let blind playtest consolidation identify whether late passenger choice
    density is becoming a soft issue; otherwise continue adding small
    route-specific emotional payoffs or improve transcript/report critique.

# Cycle 12 Manifest Thumbprint Recognition

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for
  `mara_manifest_thumbprint_intercom` and
  `passenger_manifest_thumbprint_true_ending`.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 12 evidence. Health and
  coverage were strong, but the 100-run random sample missed
  `mara_manifest_thumbprint_intercom` and
  `passenger_manifest_thumbprint_true_ending`, showing that the manifest
  thumbprint payoff remained too dependent on a narrow optional chain.
- Planned work:
  - Add one contextual prompt for players who already touched Mara's original
    torn ledger thumbprint before opening the passenger manifest.
  - Place the prompt during Mara's opened-manifest handoff, where the
    thumbprint oath is visible and narratively relevant.
  - Avoid duplicate choices by keeping the generic manifest-thumbprint touch
    prompt for players who did not inspect the earlier thumbprint.
  - Add regression coverage for the new route through the manifest thumbprint
    ideal ending.
- Work completed:
  - Added `recognize_mara_manifest_thumbprint_oath` from
    `mara_manifest_handoff` to `mara_manifest_thumbprint_intercom`.
  - The new choice requires `read_mara_thumbprint`, sets
    `read_manifest_thumbprint` and `heard_mara_goodbye`, and preserves the
    existing final release path.
  - Gated `touch_mara_manifest_thumbprint` away from `read_mara_thumbprint` so
    thumbprint-aware players see the more specific recognition prompt instead
    of a duplicate generic touch prompt.
  - Added story-path regression coverage proving the new route reaches
    `passenger_manifest_thumbprint_true_ending`.
- Evidence:
  - Focused story-path suite passed: 137 tests.
  - `npm run health` passed: format check, TypeScript, 181 tests, story
    validation, and coverage playtest.
  - Health validation reported 126 reachable scenes and 26 endings.
  - Health coverage visited all 126 scenes, including
    `mara_manifest_thumbprint_intercom` and
    `passenger_manifest_thumbprint_true_ending`, with zero unfinished runs.
  - Actual CLI play used `recognize_mara_manifest_thumbprint_oath` and reached
    `passenger_manifest_thumbprint_true_ending` at score 303 with no active
    objectives.
- Playtest feedback:
  - The new choice reads as a direct payoff for earlier curiosity rather than a
    new branch, because the player has already learned what Mara's torn print
    meant before seeing her call the opened doors.
  - The route now reaches the manifest-thumbprint intercom without requiring an
    extra touch-and-carry sequence after the handoff, reducing the chance that
    normal players board past the payoff.
  - The ending remains concise and emotionally clear: Mara leaves with the
    passengers instead of standing before or behind the manifest.
- Risks:
  - This is another optional late-game choice in a scene that already branches.
    Future blind sessions should watch for late passenger-route choice density.
- Next step:
  - Watch the next random/blind sample for improved
    `passenger_manifest_thumbprint_true_ending` discovery. If it stabilizes,
    shift from discovery fixes to transcript/report critique or richer
    route-specific payoff.

# Cycle 11 Thumbprint-Handoff Discovery

- Date: 2026-06-02
- Main objective: Make `mara_thumbprint_handoff_intercom` more naturally
  discoverable during normal Mara-only rescue play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 11 evidence. Coverage could
  reach every scene, but the 100-run random sample missed
  `mara_thumbprint_handoff_intercom`, leaving a strong payoff dependent on
  touching Mara's torn thumbprint, watching her leave the booth, boarding, and
  then selecting the right train-car listen.
- Planned work:
  - Add one contextual torn-thumbprint handoff response before boarding, while
    Mara is visibly holding the platform doors.
  - Preserve direct boarding and the existing train-car
    `listen_to_mara_thumbprint_after_handoff` route.
  - Gate the new prompt on `read_mara_thumbprint` so basic Mara handoff runs
    keep their current choice list.
  - Add regression coverage for the new pre-boarding route through
    `mara_handoff_true_ending`.
- Work completed:
  - Added `ask_mara_about_handoff_thumbprint_before_boarding` from
    `mara_handoff_boarding` to `mara_thumbprint_handoff_intercom`.
  - The new choice sets `heard_mara_goodbye`, matching the existing intercom
    payoff behavior.
  - Kept `board_after_mara_handoff` available from the same scene, so players
    can still proceed directly to the release.
  - Added regression coverage proving the new prompt appears only after the
    torn thumbprint and handoff setup, reaches the existing intercom scene, and
    finishes at `mara_handoff_true_ending`.
- Evidence:
  - Focused story-path suite passed: 135 tests.
  - `npm run health` passed: format check, TypeScript, 179 tests, story
    validation, and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including
    `mara_thumbprint_handoff_intercom`, with zero unfinished runs.
  - Actual CLI play used
    `ask_mara_about_handoff_thumbprint_before_boarding`, reached
    `mara_thumbprint_handoff_intercom`, then reached
    `mara_handoff_true_ending` at score 283 with no active objectives.
- Playtest feedback:
  - The new prompt reads naturally after Mara has left the booth, because the
    player has just seen the same hand that tore the ledger touching the open
    doors.
  - The moment now pays off the torn thumbprint before the player commits to
    boarding, reducing reliance on a hidden train-car optional listen.
  - Direct boarding remains visible beside the new prompt, so the route adds
    clarity without blocking momentum.
- Risks:
  - Adds one optional choice to `mara_handoff_boarding` for players who touched
    the thumbprint. Future blind sessions should confirm it feels like payoff
    rather than late-game choice clutter.
- Next step:
  - Watch random and blind runs for whether
    `mara_thumbprint_handoff_intercom` appears more often, then shift to richer
    story depth or transcript/report critique if normal-play scene coverage
    remains healthy.

# Cycle 14 Badge-Proof Pre-Boarding Discovery

- Date: 2026-06-02
- Main objective: Make `mara_badge_proof_intercom` more naturally discoverable
  during normal Mara-only rescue play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 14 evidence. Coverage could
  reach every scene, but the 100-run random sample missed
  `mara_badge_proof_intercom`, leaving the badge-proof payoff dependent on
  boarding first and then choosing the right optional train-car listen.
- Planned work:
  - Add one contextual badge-proof response immediately after clearing Mara's
    ledger row.
  - Keep the existing train-car badge-proof routes intact for players who board
    first or ask for Mara's last dispatch first.
  - Gate the generic Mara response away from badge-proof states so the more
    specific payoff gets priority.
  - Add regression coverage for the new pre-boarding route through
    `true_ending`.
- Work completed:
  - Added `answer_badge_proof_before_boarding` from `mara_released` to
    `mara_badge_proof_intercom` when the player knows the badge-proof clue.
  - Gated the generic `answer_mara_before_boarding` prompt away from
    `knows_badge_proof` so the specific proof payoff appears instead.
  - Preserved existing train-car badge-proof routes, including the route after
    Mara's last dispatch.
  - Added regression coverage for the new pre-boarding route through
    `true_ending`.
- Evidence:
  - Focused story-path suite passed: 134 tests.
  - `npm run health` passed: format check, TypeScript, 178 tests, story
    validation, and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including
    `mara_badge_proof_intercom`, with zero unfinished runs.
  - Actual CLI play used `answer_badge_proof_before_boarding`, reached
    `mara_badge_proof_intercom`, then reached `true_ending` at score 285 with
    no active objectives.
- Playtest feedback:
  - The new choice reads naturally immediately after Mara says she can hold the
    line, because the player has just learned that the line wanted badge proof.
  - The scene now pays off the notice-back clue before the player commits to
    boarding, reducing reliance on a hidden train-car optional listen.
  - Direct boarding remains available, and the train-car badge-proof route
    still works for players who move quickly.
- Risks:
  - Adds one more optional choice to `mara_released` when the player knows the
    badge-proof clue. Future blind sessions should confirm it reads as a
    focused payoff rather than late-game choice clutter.
- Next step:
  - Watch random and blind runs for whether `mara_badge_proof_intercom` appears
    more often, then shift to richer story depth or another normal-play miss if
    the badge-proof gap closes.

# Cycle 10 Mara Intercom Discovery

- Date: 2026-06-02
- Main objective: Make `mara_intercom` and `mara_thumbprint_intercom` more
  naturally discoverable during normal Mara-only rescue play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so this cycle used the supplied Cycle 10 evidence. Coverage could
  visit every scene, but random play still missed `mara_intercom` and
  `mara_thumbprint_intercom` in one sample. Both are useful late-game Mara
  payoff beats, and players can currently bypass them by clearing Mara and
  boarding immediately.
- Planned work:
  - Add one contextual Mara intercom prompt before boarding after clearing only
    Mara.
  - Add one torn-thumbprint-specific prompt before boarding when the player has
    already touched Mara's thumbprint memory.
  - Preserve direct boarding, last-dispatch, handoff, manifest, and train-car
    intercom routes.
  - Add regression coverage for the new prompt gates and ending routes.
- Work completed:
  - Added `answer_mara_before_boarding` from `mara_released` to
    `mara_intercom` for basic Mara-only rescue runs.
  - Added `ask_mara_about_thumbprint_before_boarding` from `mara_released` to
    `mara_thumbprint_intercom` when `read_mara_thumbprint` is set.
  - Gated the generic prompt away from thumbprint, manifest, handoff, and
    last-dispatch states so the more specific payoffs remain focused.
  - Updated story-path coverage to assert the new generic intercom route and
    the thumbprint-before-boarding route through `true_ending`.
- Evidence:
  - Focused story-path suite passed: 133 tests.
  - `npm run health` passed: format check, TypeScript, 177 tests, story
    validation, and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including `mara_intercom` and
    `mara_thumbprint_intercom`, with zero unfinished runs.
  - Actual CLI play used `ask_mara_about_thumbprint_before_boarding`, reached
    `mara_thumbprint_intercom`, then reached `true_ending` at score 275 with no
    active objectives.
- Playtest feedback:
  - The thumbprint prompt reads as a natural follow-up immediately after Mara is
    freed, while the memory is still fresh.
  - The basic Mara prompt gives players one clear chance to hear her final
    guidance before boarding without forcing an optional detour.
  - Direct boarding remains available in both states, so the added prompts
    improve discoverability without blocking the fast ending route.
- Risks:
  - `mara_released` now has one additional optional choice in the basic route
    and thumbprint route. Future blind sessions should confirm the late-game
    choice list still feels deliberate rather than crowded.
- Next step:
  - Watch random and blind runs for whether `mara_intercom` and
    `mara_thumbprint_intercom` appear more often, then shift to richer story
    depth if these misses clear.

# Cycle 13 Morning-Clock Catch-Up Discovery

- Date: 2026-06-02
- Main objective: Make `morning_clock_catch_up` more naturally discoverable
  during normal safe-transfer play.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window. The supplied Cycle 13 evidence showed coverage could reach every
  scene, but random and MCP random runs still often missed
  `morning_clock_catch_up`, leaving a strong clock/payoff beat hidden behind
  the extra warning-mark branch.
- Planned work:
  - Add one direct morning-platform choice into the existing clock catch-up
    scene after the player has learned or recovered the stopped-clock token.
  - Preserve the existing map-note, morning-door, good-ending, and turn-back
    choices.
  - Add regression coverage for the new direct route and its recovery back
    toward Mara's ledger.
- Work completed:
  - Added `listen_to_clock_from_morning_transfer` from `morning_transfer` to
    `morning_clock_catch_up`.
  - Gated the new choice on `found_token` or `knows_token_location`, so the
    beat appears only after the clock clue is meaningful to the player.
  - Reused the existing `heard_morning_clock_catch_up` flag and existing
    catch-up scene, avoiding new endings or duplicate story state.
  - Added regression coverage proving the direct route appears after taking the
    clock token, reaches `morning_clock_catch_up`, and can return to the
    service room for the true-ending rescue path.
- Evidence:
  - Focused story-path suite passed: 132 tests.
  - `npm run health` passed: format check, TypeScript, 176 tests, validation,
    and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes with zero unfinished runs.
  - Actual CLI play used `listen_to_clock_from_morning_transfer`, returned via
    `turn_back_from_morning_clock_for_mara`, and reached `true_ending` at score
    272 with no active objectives.
  - Evidence-only `npm run ai:cycle` completed and wrote ignored `ai-runs/`
    reports. Its shell health checks passed, but MCP verification failed with
    `MCP error -32000: Connection closed` in this sandbox, so the CLI
    playthrough is the recorded actual-play evidence for this cycle.
- Playtest feedback:
  - The direct choice reads as a natural continuation of the already-seen clock
    clue once the train opens onto morning.
  - The catch-up scene now works as a clearer emotional hinge: the player hears
    time resume, Mara restart the ledger, and then has a concrete reason to
    return.
  - The main safe-transfer escape remains available, so the added beat improves
    discoverability without forcing the rescue route.
- Risks:
  - Adds one more choice to `morning_transfer` for players who already touched
    the clock/token. Future blind sessions should confirm this feels like
    payoff, not choice clutter.
- Next step:
  - Watch random/blind runs for whether `morning_clock_catch_up` appears more
    often, then prioritize `mara_intercom` or `mara_thumbprint_intercom` if
    they remain normal-play misses.

# Cycle 25 HOME-Sign Lost-Ending Discovery

- Date: 2026-06-02
- Main objective: Make `lost_ending` more naturally discoverable from normal
  HOME-sign play without making the route feel like an unfair surprise.
- Why this matters: `PLAYTEST_DIGEST.md` still has no consolidated blind-play
  window, so the cycle used current loop evidence. Random play had missed
  `lost_ending` while coverage could reach it, indicating a discoverability
  gap rather than a validation problem. The HOME-sign hazard is already a
  strong thematic failure route, but one bad-ending branch required letting the
  sign finish and then surrendering from the grip scene.
- Planned work:
  - Add one clearly labeled failure choice after Mara breaks through the HOME
    sign.
  - Preserve the safe morning-transfer route and the service-room recovery
    route from the same scene.
  - Add regression coverage for the new loss route and its state flag.
- Work completed:
  - Added `step_into_false_home_after_dispatch` from `home_sign_dispatch` to
    `lost_ending`.
  - The new choice sets `surrendered_home_after_dispatch` so transcripts and
    future analytics can distinguish this failure from the older grip route.
  - Updated the HOME-sign regression test to assert the new choice appears
    alongside the two recovery choices and reaches `lost_ending` intentionally.
- Evidence:
  - Focused story-path suite passed: 132 tests.
  - `npm run health` passed: format check, TypeScript, 176 tests, validation,
    and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes with zero unfinished runs.
  - Actual CLI play used `listen_under_home_sign` and
    `step_into_false_home_after_dispatch`, reaching `lost_ending` at score 51
    with no active objectives.
  - A 250-run random playtest ended every run, visited `lost_ending`, and
    reached it twice; the previous supplied 250-run MCP random sample did not
    visit `lost_ending`.
- Playtest feedback:
  - The new choice reads as a deliberate temptation after Mara has explicitly
    said the sign is false, so the player gets both fiction and agency before
    the bad ending.
  - The same scene still offers a clean escape to `good_ending` and a practical
    recovery to the service room, so the added loss does not block or obscure
    the rescue route.
  - The ending remains short and sharp; no dangling objectives appear after the
    failure.
- Risks:
  - Random lost-ending pressure increased slightly. This is intentional for
    discoverability, but future blind sessions should confirm players read the
    label as danger rather than a plausible rescue action.
- Next step:
  - Watch blind-play records for HOME-sign confusion, especially whether
    players choose the porch-light branch while still believing it is safe.

# Cycle 24 Last-Dispatch Payoff Discovery

- Date: 2026-06-02
- Main objective: Make `mara_last_dispatch_intercom` easier to discover during
  normal play without removing the existing train-car release pacing.
- Why this matters: No consolidated blind-play digest is available yet, and
  current cycle evidence shows health is green with all scenes reachable, but
  random play usually misses `mara_last_dispatch_intercom`. The scene currently
  requires two optional choices in a row after clearing Mara, so players who ask
  for her final words can still miss the immediate payoff.
- Planned work:
  - Add a direct route from Mara's last-dispatch scene into the third-car
    intercom payoff.
  - Preserve the older route where the player boards first and then listens from
    the train car.
  - Add regression coverage for the new direct route and keep coverage for the
    old route.
- Work completed:
  - Added `carry_last_dispatch_into_car` from `mara_last_dispatch` to
    `mara_last_dispatch_intercom`.
  - Added `ask_mara_for_train_car_dispatch` from `train_car`, giving players
    who boarded first one more natural chance to ask for Mara's final dispatch.
  - Both new choices set the same dispatch/goodbye flags as the existing
    intercom branch.
  - Updated story-path tests to assert the direct payoff route, the train-car
    ask route, and the preserved board-then-listen route.
- Evidence:
  - Focused story-path suite passed: 132 tests.
  - `npm run health` passed: format check, TypeScript, 176 tests, validation,
    and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including
    `mara_last_dispatch_intercom`, with zero unfinished runs.
  - Actual CLI play used `ask_mara_for_last_dispatch`,
    `carry_last_dispatch_into_car`, and
    `pull_release_after_last_dispatch_goodbye`, reaching `true_ending` at score
    293 with no active objectives.
  - `npm run ai:cycle` was attempted. The wrapper wrote ignored `ai-runs/`
    reports but its nested `codex exec` failed before gameplay with a
    read-only filesystem app-server initialization error; post-agent automation
    also refused auto-commit because the intended tracked files were already
    dirty.
  - Local commit was attempted with message
    `Improve Mara last-dispatch discovery`, but the sandbox could not create
    `.git/index.lock` because `.git` is read-only. No files were staged.
- Playtest feedback:
  - The direct choice makes the intercom payoff feel like a continuation of
    Mara's dispatch instead of a second hidden optional listen after boarding.
  - The train-car ask route gives players who skipped the earlier optional ask
    a clearer contextual prompt at the release handle.
  - The older board-then-listen route still works, so players who want the
    concrete third-car scene before listening are not forced out of that pacing.
  - The route remains clean at the ending: `heard_mara_last_dispatch` and
    `heard_mara_goodbye` are set, inventory is intact, and no objectives remain.
- Risks:
  - Adds a second choice to a main route moment after Mara is cleared. The
    labels need to remain clearly distinct: immediate intercom payoff versus
    direct boarding.
  - Commit/push must be performed by the outer loop or a shell with writable
    `.git` access.
- Next step:
  - Verify the new branch reaches `true_ending`, then watch future random/blind
    runs for whether `mara_last_dispatch_intercom` appears more often.

# Cycle 24 Train-Car Last Dispatch Discovery

- Date: 2026-06-02
- Main objective: Make `mara_last_dispatch_intercom` more naturally
  discoverable for players who clear Mara and immediately board the third car.
- Why this matters: The top blind-play digest still has no consolidated
  feedback, and Cycle 9 evidence shows health is strong while random play
  still misses a few optional payoff scenes. The last-dispatch intercom is a
  high-value Mara character beat, but normal play can bypass it by boarding
  directly after clearing the ledger.
- Planned work:
  - Add a train-car choice to ask Mara for one last dispatch before pulling the
    release.
  - Preserve the existing generic Mara intercom and immediate release choices.
  - Keep richer badge-proof, thumbprint, handoff, and manifest intercom routes
    from being crowded by the new option.
  - Add regression coverage for the new route through `true_ending`.
- Work completed:
  - Added `ask_mara_for_train_car_dispatch` from `train_car` for the basic
    non-manifest, non-handoff, non-badge-proof Mara release route.
  - Adjusted `mara_last_dispatch_intercom` wording so it reads cleanly whether
    the dispatch was first heard in the booth or requested from the car.
  - Added tests asserting the new choice appears alongside the existing generic
    Mara intercom and reaches `true_ending`.
- Evidence:
  - Focused story-path suite passed: 132 tests.
  - `npm run health` passed: format check, TypeScript, 176 tests,
    validation, and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including
    `mara_last_dispatch_intercom`, with zero unfinished runs.
  - Actual CLI play used `ask_mara_for_train_car_dispatch` from the third car,
    reached `mara_last_dispatch_intercom`, then reached `true_ending` at score
    287 with no active objectives.
- Playtest feedback:
  - The new train-car option makes Mara's last dispatch feel like a natural
    final question at the release handle instead of a payoff available only to
    players who paused in `mara_released`.
  - The immediate `pull_release` path remains available, so the final beat adds
    discoverability without blocking players who already know what to do.
  - The option is hidden from badge-proof, thumbprint, handoff, and manifest
    variants, keeping the richest branches focused on their more specific
    payoffs.
- Risks:
  - Adds one more choice to the basic train-car release moment. It is hidden
    from the richer branch variants to limit choice clutter.
- Next step:
  - Run `npm run ai:cycle`, then commit and push if the evidence cycle stays
    green.

# Cycle 23 Pressure-Route Recovery Polish

- Date: 2026-06-02
- Main objective: Make two early pressure-route retreats feel like playable
  recovery moments instead of generic resets or silent mistakes.
- Why this matters: The current checkout already contains the supplied
  `morning_clock_catch_up` and `lost_ending` discoverability improvements, and
  there is still no consolidated blind-play digest. Random suspicious samples
  continue to show players forcing the unfused gate, and ordinary players can
  still inspect the stopped clock then walk away from the signal token before
  understanding why it matters.
- Planned work:
  - Add a distinct recovery scene after bracing the collapsing gate.
  - Provide direct choices toward the map, locker supplies, and stopped-clock
    token based on what the player still lacks.
  - Add a one-time warning beat when uninformed players leave the clock token.
  - Let players either take the token immediately after the warning or leave it
    while gaining the objective clue needed to recover it later.
  - Preserve the final bad-ending crawl-under choice and the existing earlier
    back-away routes.
  - Add regression coverage for both recovery beats.
- Work completed:
  - Added `gate_retreat_recovery` after `brace_gate_and_retreat`.
  - Added direct recovery actions for Mara's marked map, locker supplies, the
    stopped-clock token, and a generic service-room check.
  - Added `clock_token_warning` after `leave_clock`, teaching that SIGNAL BOOTH
    ACCESS is a key clue without forcing token pickup.
  - Set `knows_token_location` when the player hesitates at the clock so
    objectives and later service-room routing can guide recovery.
  - Added regression coverage for the scene text, choices, objective hints, and
    recovery from both branches.
- Evidence:
  - Focused story-path suite passed: 129 tests.
  - `npm run health` passed: format check, TypeScript, 173 tests, validation,
    and coverage playtest.
  - Health validation reported 125 reachable scenes and 26 endings.
  - Health coverage visited all 125 scenes, including `clock_token_warning` and
    `gate_retreat_recovery`, with zero unfinished runs.
  - Evidence-only `npm run ai:cycle` passed its health checks, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, and
    actual MCP playthrough.
  - Actual CLI play intentionally left the clock token, saw
    `clock_token_warning`, left it again, returned to the clock, recovered the
    token, and reached `true_ending` at score 263 with no active objectives.
  - Actual CLI play used `force_gate_after_echo`,
    `brace_gate_and_retreat`, and `go_to_clock_after_gate_retreat`, then
    recovered the token, map, fuse, badge, ledger route and reached
    `true_ending` at score 267 with no active objectives.
- Playtest feedback:
  - The clock warning makes the token feel important in-world before the player
    has read Mara's file or inspected the gate control.
  - Leaving the token after the warning remains allowed, but the route no
    longer feels like the player silently missed a required item; the objective
    points back to the stopped clock.
  - The collapsing-gate recovery beat makes the final retreat from the bad
    ending more concrete by naming the four tools under pressure.
- Risks:
  - Both changes add caution beats to already clue-rich routes. Future blind
    transcripts should confirm they read as recovery clarity rather than
    over-explanation.
- Next step:
  - Watch blind-play feedback for whether players still ignore the clock token
    after seeing the new warning, then tune the choice labels if necessary.

# Cycle 22 Home Sign Dispatch Recovery

- Date: 2026-06-02
- Main objective: Add a clearer recoverable Mara beat inside the late HOME-sign
  hazard without removing the existing lost-ending pressure.
- Why this matters: The current tree already contains the suggested
  `morning_clock_catch_up` improvement and subsequent route polish. Health is
  strong, coverage is complete, and no consolidated blind-play blockers are
  available, so the best next move is small playable depth on a normal-player
  danger route that can still end at `lost_ending`.
- Planned work:
  - Add an optional Mara interruption from `home_sign_echo`.
  - Teach the practical recovery set in-world: map for morning, or clock token,
    fuse, badge, and ledger for rescue.
  - Preserve the existing good ending, service-room recovery, HOME grip, and
    lost-ending branches.
- Work completed:
  - Added `home_sign_dispatch`, where Mara breaks through the false HOME image
    and names the recovery route.
  - Added `listen_under_home_sign` from `home_sign_echo` and three exits:
    morning transfer, service-room recovery, or letting HOME drown Mara out into
    the existing grip scene.
  - Added regression coverage for the new scene's text, flags, choices,
    objective hints, and full recovery to `true_ending`.
- Evidence:
  - Focused story-path suite passed: 127 tests.
  - `npm run health` passed: format check, TypeScript, 171 tests, validation,
    and coverage playtest.
  - Health validation reported 123 reachable scenes and 26 endings.
  - Health coverage visited all 123 scenes, including `home_sign_dispatch`, with
    zero unfinished runs.
  - Actual CLI play used `listen_under_home_sign` and
    `turn_back_after_home_sign_dispatch`, recovered the clock token, fuse,
    badge, and ledger route, and reached `true_ending` at score 268 with no
    active objectives.
  - Actual CLI terminal play used `listen_under_home_sign`,
    `let_home_sign_drown_mara`, and `surrender_to_home_sign`, reaching
    `lost_ending` at score 52 with no active objectives.
- Playtest feedback:
  - The new beat makes the HOME hazard feel less like a pure trap: Mara names
    the player-facing choice in plain fiction while the false sign remains
    tempting.
  - The service-room return is understandable because the next objectives
    explicitly point to the stopped clock token and Mara badge proof.
  - The terminal branch still escalates cleanly from warning, to dispatch, to
    grip, to loss; the new recovery clue does not remove the player's ability
    to make the bad choice.
  - The route intentionally skips optional personnel/radio flavor, so the score
    is lower than richer true-ending routes but still coherent.
- Risks:
  - Adds another option to an already recoverable warning branch. Watch random
    and blind transcripts for whether the extra choice improves clarity or
    makes the HOME sequence feel over-signposted.
- Next step:
  - Watch blind-play feedback for whether players who reach the HOME sign now
    understand the difference between morning escape and full rescue, then
    tighten choice labels if they still treat the branch as arbitrary.

# Cycle 21 Early Escape Platform Glance

- Date: 2026-06-02
- Main objective: Add a small optional consequence beat to the lit-platform
  early escape route without blocking escape or weakening recovery.
- Why this matters: Current evidence shows healthy core guidance, complete
  coverage, and no consolidated blind-play blockers. The remaining useful
  pressure is story depth on non-ideal routes, especially choices where players
  leave Mara behind before the signal token is recovered.
- Planned work:
  - Add a one-time glance-back scene from the lit-platform escape warning.
  - Preserve the existing immediate escape, stairwell-listen, and return paths.
  - Add regression coverage for returning from the new scene and for leaving
    through it.
- Work completed:
  - Added `escape_platform_glance`, where the player sees Mara's badge number
    on the platform posters and the still-tapping token slot before deciding.
  - Added `look_back_from_escape_warning` from `escape_warning` with a
    one-time flag and badge-proof clue.
  - Added regression coverage for the new scene's three exits and updated
    exact lit-escape warning choice assertions.
- Evidence so far:
  - Focused story-path suite passed: 127 tests.
  - `npm run health` passed: format check, TypeScript, 171 tests, validation,
    and coverage playtest.
  - Health validation reported 122 reachable scenes and 26 endings.
  - Health coverage visited all 122 scenes, including
    `escape_platform_glance`, with zero unfinished runs.
  - Actual CLI play used `look_back_from_escape_warning` and
    `leave_after_escape_glance`, reaching `escape_ending` at score 88 with no
    active objectives.
  - Recovery CLI play used `look_back_from_escape_warning`, returned from
    `escape_platform_glance`, recovered the map/token/ledger route, and
    reached `true_ending` at score 297 with no active objectives.
- Playtest feedback:
  - The new glance reads as a consequence beat rather than a hard warning:
    the player sees Mara's badge number and the token slot one more time, but
    the leave option remains direct and terminal.
  - The branch preserves agency. Returning to the lit platform remains
    available, while leaving through the new scene still produces the same
    early escape ending cleanly.
  - Returning from the glance does not strand the player: the lit platform
    points back to the service room, then the route resumes through the map,
    radio/personnel file, clock token, signal booth, and release.
- Risks:
  - Adds one more optional choice to a route that already has a warning beat.
    The choice is one-time and only appears on the lit-platform flee branch.
- Next step:
  - Watch random and blind playtest transcripts for whether early escape
    players use the glance as a meaningful reconsideration point or ignore it
    as extra friction, and whether the badge-number clue makes them expect the
    ledger to work before they recover the map and token.

# Cycle 20 Personnel File Score Audit

- Date: 2026-06-02
- Main objective: Fix a transcript scoring inconsistency where true-ending
  recovery routes could claim the player read Mara Vale's personnel file even
  when they skipped it.
- Why this matters: Current checked-out code already contains the suggested
  `morning_clock_catch_up` improvement, and no consolidated blind-play digest
  is available yet. The highest-signal open risk in the prior state was score
  trust: AI and blind playtest reports depend on point-award text to critique
  routes accurately.
- Planned work:
  - Separate the personnel-file award from the broader `freed_mara` state.
  - Preserve true-ending and ledger-clear scoring.
  - Add regression coverage for a no-personnel-file true-ending route.
- Work completed:
  - Updated `flag_read_mara_file` so it is earned only from
    `read_mara_file`.
  - Added a regression assertion on the no-radio true-ending path that
    `flag_read_mara_file` is absent while `flag_freed_mara` remains present.
- Evidence:
  - Focused story-path suite passed: 126 tests.
  - `npm run health` passed: format check, TypeScript, 170 tests, validation,
    and coverage playtest.
  - Health validation reported 121 reachable scenes and 26 endings.
  - Health coverage visited all 121 scenes, including
    `morning_clock_catch_up`, with zero unfinished runs.
  - Actual CLI play skipped `read_personnel_file`, reached `true_ending` at
    score 267, and the transcript omitted `Read Mara Vale's personnel file`
    while retaining `Cleared Mara's name from the signal ledger`.
- Playtest feedback:
  - The no-personnel-file recovery route still reads cleanly: notice, lantern,
    clock token, map, locker supplies, ledger, release.
  - The score breakdown now matches the fiction. The player gets credit for
    clearing Mara and opening every door, but not for reading a file they never
    opened.
  - The route has no active objectives at the ending and preserves the intended
    shortcut where Mara can tell the player the third-car release after her
    ledger row is cleared.
- Risks:
  - High scores on true-ending routes that skip the personnel file will drop by
    10 points. This is intentional because the prior award label was factually
    wrong.
- Next step:
  - Watch future transcript/report feedback for other award labels that imply
    facts the player may not have actually discovered on shortcut routes.

# Cycle 19 Morning Clock Catch-Up

- Date: 2026-06-02
- Main objective: Add one richer safe-transfer aftermath beat to the map-only
  morning route without weakening the true-ending recovery path.
- Why this matters: Current evidence shows healthy validation, complete
  coverage, zero unfinished runs, and strong true-ending discovery. With no
  consolidated blind-play blockers, the highest-value next move is small
  playable story depth on an existing normal route: the player can survive by
  following the map, mark a warning, then hear the station clocks catch up and
  decide whether to leave or return for Mara.
- Planned work:
  - Add a one-time optional `morning_clock_catch_up` beat after players mark
    the morning map warning.
  - Preserve all existing safe-escape and return-to-true-ending exits.
  - Add regression coverage for both token-missing and token-held recovery
    branches from the new beat.
- Work completed:
  - Added `listen_to_morning_clock_catch_up` from `morning_warning_mark` to a
    new optional scene.
  - Added exits from the new scene to `good_ending`, token recovery in the
    tunnel, and Mara ledger recovery in the service room.
  - Updated exact choice-order tests for `morning_warning_mark` and added a
    dedicated regression path that continues from the new beat to
    `true_ending`.
- Evidence so far:
  - Focused story-path suite passed: 126 tests.
  - `npm run health` passed: format check, TypeScript, 170 tests, validation,
    and coverage playtest.
  - Health validation reported 121 reachable scenes and 26 endings.
  - Health coverage visited all 121 scenes, including
    `morning_clock_catch_up`, with zero unfinished runs.
  - Actual CLI play used `listen_to_morning_clock_catch_up` and
    `turn_back_from_morning_clock_for_token`, then recovered the remaining
    true-ending supplies and reached `true_ending` at score 277 with no active
    objectives.
- Playtest feedback:
  - The new beat fits after marking the map because the player has already
    chosen to leave evidence for a future rescuer.
  - The dry click from the underpass clock makes the token recovery choice feel
    like a story response instead of an external hint.
  - The branch still routes cleanly into normal service-room preparation, but
    the tested route skipped reading Mara's personnel file; future scoring
    polish should audit why that achievement appears in the transcript's score
    breakdown on this path.
- Risks:
  - Adds one optional choice to an already caution-heavy safe-transfer branch.
    It is only available after players intentionally mark the warning, so it
    should read as payoff rather than route clutter.
- Next step:
  - Watch blind-play feedback for whether the safe-transfer branch now feels
    too warning-heavy; if so, fold the clock language into
    `morning_warning_mark` instead of keeping it as a separate choice.

# Cycle 18 Reviewed-Count Intercom Payoff

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for
  `passenger_reviewed_count_true_ending` from the reviewed-count branch.
- Why this matters: Fresh random evidence missed
  `passenger_reviewed_count_true_ending` even though coverage reaches it. The
  most visible reviewed-count boarding route currently pays off only the
  counted ending, while the reviewed-count ending requires the less specific
  generic train-car boarding route.
- Planned work:
  - Add a direct reviewed-count release choice inside the existing
    `passenger_counted_manifest_intercom` scene.
  - Preserve the existing counted-manifest ending choice.
  - Add regression coverage for the new intercom-to-reviewed-ending path.
- Work completed:
  - Added `pull_release_before_reviewed_count_finishes` from
    `passenger_counted_manifest_intercom` to
    `passenger_reviewed_count_true_ending`.
  - Kept `pull_release_after_counted_manifest_goodbye` available from the same
    intercom so the counted-manifest ending remains reachable.
  - Added regression coverage for the new intercom-to-reviewed-ending path and
    updated the existing counted-intercom test to expect both terminal choices.
- Evidence:
  - Focused story-path suite passed: 125 tests.
  - `npm run health` passed: format check, TypeScript, 169 tests, validation,
    and coverage playtest.
  - Health validation reported 120 reachable scenes and 26 endings.
  - Health coverage visited all 120 scenes with zero unfinished runs, and
    `passenger_reviewed_count_true_ending` rose to 177 coverage hits.
  - Actual CLI play used `review_open_manifest_count`,
    `board_with_reviewed_manifest_count`, and
    `pull_release_before_reviewed_count_finishes`, reaching
    `passenger_reviewed_count_true_ending` at score 288 with no active
    objectives.
  - A 250-run random sanity playtest reached
    `passenger_reviewed_count_true_ending` 2 times, with zero unfinished runs
    and no unvisited scenes.
- Playtest feedback:
  - The new terminal choice reads naturally from the intercom text: Mara is
    counting, the passengers are answering, and the player can release before
    the count becomes another obligation.
  - The branch now gives the explicit reviewed-count boarding route a matching
    reviewed-count payoff, instead of requiring players to find the less
    specific `board_after_manifest_count` path.
- Risks:
  - Adds one late-game choice to an already rich passenger route. The choice is
    terminal and only appears after the player explicitly pursues the reviewed
    count, so loop risk is low.
- Next step:
  - Watch blind-play feedback for whether late passenger manifest branches now
    present too many terminal choices; if so, clarify labels rather than adding
    more route branches.

# Cycle 17 Unlit Platform Retreat Warning

- Date: 2026-06-02
- Main objective: Preserve an underprepared platform retreat as a fair,
  recoverable warning instead of only a direct map escape, forced gate, or
  service-room backtrack.
- Why this matters: The generated evidence cycle introduced an unlit-platform
  stairwell retreat but initially routed it through the lit-platform warning,
  which made the fiction and state disagree. This pass keeps the new player
  option while making the scene honest about the dark platform and returning
  players to the correct unpowered route.
- Work completed:
  - Added `platform_escape_warning`, a dedicated warning scene for players who
    retreat from Platform 13 before finding the fuse or token.
  - Routed the new `retreat_to_stairs_from_platform` choice to the dedicated
    dark-platform warning instead of the existing lit-platform warning.
  - Updated regression coverage to verify the warning choices, recovery back to
    `platform`, and the early escape ending.
- Evidence:
  - `npm run health` passed: format check, TypeScript, 168 tests, validation,
    and coverage playtest.
  - Health validation reports 120 reachable scenes and 26 endings.
  - Health coverage visited all 120 scenes, including
    `platform_escape_warning`, with zero unfinished runs.
  - Actual CLI play used `retreat_to_stairs_from_platform`,
    `return_to_platform_from_escape_warning`, and `return_to_service_room`,
    recovering to `service_room` with sensible active objectives.
- Playtest feedback:
  - The warning now names the dark platform, blank sign, empty token slot, and
    nearby service-room route, so it reads as a fair hesitation beat rather
    than a state jump.
  - Returning from the warning preserves normal unprepared-platform choices and
    does not pretend the platform lights are on.
- Next step:
  - Watch random and blind-play evidence for whether this extra escape pressure
    increases early `escape_ending` rates too much; if so, gate it behind a
    prior warning interaction or make the service-room return more prominent.
- Risks:
  - This adds one optional early escape-pressure choice to `platform`, where
    choice density is already meaningful for underprepared players.

# Cycle 16 Gate-Control Plaque Guidance

- Date: 2026-06-02
- Main objective: Add one normal-route story beat at the gate control that
  teaches the signal-booth requirements in-world while preserving the existing
  underprepared escape and bad-ending pressure.
- Why this matters: Current evidence has healthy route coverage and no
  unfinished runs, so the highest-value next step is richer story depth that
  also clarifies the real playable objective: lights, token, map, and badge
  proof before the ledger.
- Work completed:
  - Added `gate_control_plaque`, an optional burned service-plaque scene from
    `gate_control` that states the token/light, badge-proof, route-map, and
    HOME-sign rules as station procedure.
  - Set the existing `gate_control_inspected` score flag when players inspect
    the gate control, while preserving the existing `inspected_gate_control`
    routing flag.
  - Added regression coverage for reading the plaque, returning to the gate
    control, and surfacing token and badge-proof objectives for underprepared
    players.
- Evidence:
  - Focused story-path suite passed: 123 tests.
  - `npm run health` passed: format check, TypeScript, 167 tests, validation,
    and coverage playtest.
  - Health validation now reports 119 reachable scenes and 26 endings.
  - Health coverage visited all 119 scenes, including `gate_control_plaque`,
    with zero unfinished runs.
  - Actual CLI play used `inspect_gate_control`,
    `read_gate_control_plaque`, and `return_from_gate_control_plaque`, then
    recovered all supplies and reached `true_ending` at score 287 with no
    active objectives.
- Playtest feedback:
  - The plaque reads like station procedure rather than an external hint, and
    it gives the player a clear reason to collect badge proof and keep the map
    involved before touching the ledger.
  - Returning from the plaque to the gate control is one-time gated, so it does
    not create a repeat loop. The route still lets underprepared players back
    out and gather supplies.
  - The existing gate-control exploration award now appears in the CLI score
    breakdown after inspection.
- Next step:
  - Watch random and blind-play evidence for whether the added gate-control
    choice makes early platform decision density feel heavier. If it does,
    fold the plaque language into the base gate-control text.
- Risks:
  - Adds one optional choice to a core route. It is one-time and returns to the
    same control surface, but choice density at the platform should be watched.

# Cycle 15 Opened-Manifest Unanswered Row

- Date: 2026-06-02
- Main objective: Add one richer passenger-count story beat after players
  review the opened manifest count.
- Why this matters: Current evidence shows validation, random play, coverage,
  and true-ending discovery are healthy, with no consolidated blind-play
  blockers. The next highest-value improvement is playable story depth: the
  reviewed-count route now clarifies why the manifest needs a collective
  answer instead of only a mechanical count.
- Work completed:
  - Added `passenger_missing_count`, an optional one-time beat from
    `passenger_manifest_count` that reframes the last unanswered manifest row
    as the old pause where Mara had been made last.
  - Added exits from the beat into the existing passenger roll-call,
    conductor-clear, reviewed-count intercom, and return paths without adding a
    new ending or required route.
  - Added regression coverage for the new branch, its one-time flag gating,
    its roll-call finish, and its conductor exit.
- Evidence:
  - Focused story-path suite passed: 123 tests.
  - `npm run health` passed after the change: format check, TypeScript, 167
    tests, validation, and coverage playtest.
  - Health validation reported 119 reachable scenes and 26 endings.
  - Health coverage visited all 119 scenes, including
    `passenger_missing_count`, with zero unfinished runs.
  - Actual CLI play used `check_for_unanswered_manifest_row`,
    `let_unanswered_row_become_roll_call`,
    `board_after_answered_passengers`, and
    `pull_release_after_answered_boarding`, reaching
    `passenger_answered_boarding_true_ending` at score 301 with no active
    objectives.
  - `npm run ai:cycle` wrote ignored evidence artifacts, but the nested
    `codex exec` phase hung after producing additional tracked edits; it was
    terminated and the resulting generated retreat branch was reviewed and
    corrected in Cycle 17.
- Playtest feedback:
  - The unanswered-row beat reads naturally after Mara reviews the opened
    manifest count, turning a mechanical count into a collective answer.
  - Returning from the beat removes the one-time choice, so it does not create
    a repeat loop.
  - The branch can finish through the answered-passenger ideal ending without
    dangling objectives.
- Next step:
  - Watch late-game choice density around `passenger_manifest_count`; if blind
    players skip the core release too often, consider folding the unanswered-row
    language into the base count scene.
- Risks:
  - This adds one optional choice to an already rich passenger-count scene. The
    one-time flag prevents repeat loops, but late-game choice density remains
    the main watch item.

# Cycle 14 Echoed-Boarding Intercom Recovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `passenger_echoed_boarding`
  when players hear the echoed-manifest train-car intercom before pausing to
  watch the passengers board.
- Why this matters: Fresh random evidence after Cycle 13 still missed
  `passenger_echoed_boarding` in 200 ordinary runs, while coverage could reach
  it. The remaining missed order was intercom-first: choosing the train-car
  echoed-manifest goodbye set `heard_mara_goodbye`, which closed the
  train-car boarding recovery before the earned boarding beat could appear.
- Work completed:
  - Added `pause_for_echoed_boarding` from
    `passenger_echoed_manifest_intercom` to `passenger_echoed_boarding`, gated
    by `notFlag: echoed_manifest_boarded`.
  - Gated `listen_to_echoed_manifest_from_boarding` behind
    `notFlag: heard_mara_goodbye` so intercom-first recovery does not loop back
    into the same goodbye.
  - Added `pull_release_after_echoed_boarding` so intercom-first players who
    pause for boarding still finish at `passenger_echoed_true_ending` instead
    of falling through to the generic manifest release.
  - Split the generic train-car manifest release away from echoed-manifest
    routes after `echoed_manifest_boarded`, preserving the echoed ending for
    boarding-first players who return to the release before hearing the
    intercom.
  - Added regression coverage for the intercom-first route.
- Evidence:
  - Fresh pre-change random playtest: 200/200 ended, zero unfinished, but
    `passenger_echoed_boarding` remained unvisited.
  - Fresh pre-change coverage playtest: all 117 scenes visited, zero unfinished
    coverage runs, confirming the scene was reachable but still weak in
    ordinary play.
  - Focused story-path suite passed: 122 tests.
  - `npm run health` passed: format check, TypeScript, 166 tests, validation,
    and coverage playtest.
  - Health coverage visited all 117 scenes with zero unfinished runs; the
    echoed passenger ending count rose to 81 in the coverage summary.
  - Actual CLI play used `listen_to_echoed_manifest_intercom`,
    `pause_for_echoed_boarding`, and `pull_release_after_echoed_boarding`,
    reaching `passenger_echoed_true_ending` at score 299 with no active
    objectives.
- Playtest feedback:
  - The new choice reads as a natural pause after Mara names the sounds the
    player already heard, and the follow-up release preserves the earned
    echoed-manifest ending instead of collapsing into the generic manifest
    ending.
  - Gating the boarding-to-intercom choice after the goodbye prevents a repeat
    loop while still allowing the original boarding-first route to hear the
    intercom.
- Next step:
  - Watch fresh random and blind-play evidence for whether
    `passenger_echoed_boarding` now appears in ordinary routes. If it remains
    rare, inspect player-facing choice labels around the passenger platform
    before adding more branches.
- Risks:
  - This adds one optional choice to an already late-game intercom scene. It is
    one-time and only appears on the passenger-echo route.

# Cycle 13 Echoed-Boarding Train-Car Recovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `passenger_echoed_boarding`
  when players earn the passenger-echo route, clear the manifest, then detour
  through the morning-chorus train-car beat before using the boarding payoff.
- Why this matters: Current cycle evidence still called out
  `passenger_echoed_boarding` as the one random-play miss. The direct platform
  boarding payoff existed, but players who naturally listened to the passenger
  morning chorus and boarded from there could bypass the scene even though they
  had earned its setup.
- Work completed:
  - Added a one-time `echoed_manifest_boarded` flag when players use the direct
    echoed-manifest boarding beat.
  - Added `follow_echoes_back_to_boarding` from `train_car` back to
    `passenger_echoed_boarding`, gated by the existing passenger-echo route,
    freed Mara, and exclusions for answer/gather/count/handoff variants.
  - Added regression coverage for the morning-chorus detour path that reaches
    `passenger_echoed_boarding`, returns to the release, then finishes at
    `passenger_echoed_true_ending`.
- Evidence:
  - Focused story-path suite passed: 121 tests.
  - `npm run health` passed: format check, TypeScript, 165 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 117 scenes with zero unfinished runs,
    best score 390, and average score 318.27.
  - Actual CLI play used `follow_echoes_back_to_boarding` after the
    morning-chorus train-car detour and reached `passenger_echoed_true_ending`
    at score 303 with no active objectives.
  - `npm run ai:cycle` wrote ignored evidence artifacts, but the nested
    `codex exec` failed to initialize the in-process app-server client because
    this environment reports a read-only filesystem while updating PATH. No
    tracked files were changed by the nested run.
- Playtest feedback:
  - The new label and scene text read as a natural recovery from train-car
    hesitation: the echoes are already aboard, but the player can still pause
    to recognize that waiting has turned into boarding.
  - Returning from `passenger_echoed_boarding` to `train_car` does not expose
    the recovery choice again, so the branch does not create a repeat loop.
  - No dangling objectives, invalid choices, validation errors, or unfinished
    coverage runs appeared.
- Next step:
  - Watch random and blind-play evidence for whether `passenger_echoed_boarding`
    now appears in ordinary routes. If it still misses, inspect other train-car
    detours that skip `passenger_platform`.
- Risks:
  - This adds one optional train-car choice in a late-game choice set. It is
    tightly gated and one-time, but choice density around release scenes remains
    worth monitoring.

# Cycle 12 Badge-Proof Thumbprint Recovery

- Date: 2026-06-02
- Main objective: Preserve `mara_thumbprint_intercom` discovery when players
  have both the badge-proof clue and Mara's torn-thumbprint memory, then answer
  the badge-proof line first.
- Why this matters: Current cycle evidence still called out
  `mara_thumbprint_intercom` as a normal-play miss. The scene was available
  directly from the train car, but a clue-stacking player could naturally choose
  the badge-proof payoff first and close the intercom thread before the
  thumbprint memory paid off.
- Work completed:
  - Added `ask_about_thumbprint_after_badge_proof` from
    `mara_badge_proof_intercom` to `mara_thumbprint_intercom`, gated by
    `read_mara_thumbprint`.
  - Preserved the existing direct badge-proof release choice, so the added beat
    is optional and only appears for players who earned the thumbprint memory.
  - Added regression coverage for the notice-back badge-proof route that touches
    Mara's thumbprint, answers badge proof first, then reaches `true_ending`
    through the thumbprint intercom.
- Evidence:
  - Focused story-path suite passed: 120 tests.
  - `npm run health` passed: format check, TypeScript, 164 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 117 scenes with zero unfinished runs,
    best score 390, and average score 318.27.
  - Actual CLI play used `ask_about_thumbprint_after_badge_proof` and reached
    `true_ending` at score 303 with no active objectives.
  - `npm run ai:cycle` wrote ignored run artifacts, but the nested `codex exec`
    failed to initialize the in-process app-server client because this
    environment reports a read-only filesystem while updating PATH.
- Playtest feedback:
  - The new branch reads as a natural follow-up question rather than a second
    unrelated goodbye: badge proof explains why Mara can answer, and the
    thumbprint explains what she was holding open.
  - The new choice is tightly gated by `read_mara_thumbprint`, avoiding extra
    late-game choice density for players who did not inspect that memory.
  - No dangling objectives, invalid choices, validation errors, or unfinished
    coverage runs appeared.
- Next step:
  - Watch blind-play feedback for whether the Mara-only train-car/intercom
    choice stack now feels complete or too dense; if density becomes the issue,
    consolidate badge-proof and thumbprint language into a single combined
    payoff.
- Risks:
  - This adds one optional intercom choice after another optional intercom beat.
    It improves clue-order recovery, but late Mara-only payoff density remains
    the main thing to monitor.

# Cycle 11 Badge-Proof Last-Dispatch Recovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `mara_badge_proof_intercom`
  after players learn the badge-proof clue and then ask Mara for her last
  dispatch.
- Why this matters: Current evidence called out `mara_badge_proof_intercom` as
  missed in ordinary random play. The clue could already pay off if players
  boarded immediately after clearing Mara, but the natural extra step of asking
  for her last dispatch suppressed the badge-proof intercom route.
- Work completed:
  - Added `listen_to_badge_proof_after_last_dispatch` from `train_car` to
    `mara_badge_proof_intercom`, gated by `knows_badge_proof`,
    `heard_mara_last_dispatch`, `freed_mara`, and the existing Mara-only route
    exclusions.
  - Preserved the existing `listen_to_last_dispatch_intercom` and direct release
    options, so the new route adds a recovery payoff without removing player
    choice.
  - Added regression coverage for a notice-back badge-proof route that asks for
    Mara's last dispatch before boarding, then reaches `true_ending` through the
    badge-proof intercom.
- Evidence:
  - Focused story-path suite passed: 119 tests.
  - `npm run health` passed: format check, TypeScript, 163 tests, validation,
    and coverage playtest.
  - Coverage playtest still visited all 117 scenes with zero unfinished runs,
    best score 390, and average score 318.27.
  - Actual CLI play used `listen_to_badge_proof_after_last_dispatch` and reached
    `true_ending` at score 309 with no active objectives.
  - `npm run ai:cycle` wrote ignored run artifacts and completed its wrapper,
    but the nested `codex exec` failed to initialize the in-process app-server
    client because this environment reports a read-only filesystem while
    updating PATH.
- Playtest feedback:
  - The route now reads as a continuous character beat: proof clue, final
    dispatch, train-car release, then badge proof as an answer instead of a
    lock.
  - The new choice appears only after the player has earned both the proof clue
    and the last-dispatch beat, avoiding noise on the basic route.
  - No dangling objectives, invalid choices, validation errors, or unfinished
    coverage runs appeared.
- Next step:
  - Watch blind-play feedback for whether late Mara-only train-car choices feel
    too dense; if so, consolidate badge-proof and last-dispatch language into a
    single payoff scene.
- Risks:
  - This adds one more optional choice to `train_car` for a specific clue order.
    It is tightly gated, but dense late-game choice sets remain worth watching.

# Cycle 10 Open-Ended Score Awards

- Date: 2026-06-02
- Main objective: Replace the fixed `100/100` score contract with an
  open-ended point-award model that rewards progressive, exploratory,
  character, item, and optional-content behavior.
- Why this matters: The previous `score/maxScore` display made the game feel
  solved against a fixed checklist. The new model should feel closer to classic
  Quest-style scoring: every constructive discovery can pay out, and major
  story breakthroughs pay out more.
- Work completed:
  - Replaced fixed achievements with earned `awards` from inventory, flags,
    visited scenes after the start, and positive choice history.
  - Removed player-facing `maxScore` usage from observations, masked blind
    views, transcripts, playtest summaries, AI-loop reports, docs, and tests.
  - Added `delta`, `recentAwards`, and `soundCue: "score_award"` to
    observations so clients can show point bursts and play a reward sound on
    scoring actions.
  - Changed playtest reporting from max-score completion to `bestScore`,
    `averageScore`, and `bestScoreRuns`.
  - Kept historical blind-feedback `max_score` rows readable by making that
    field optional for compatibility.
- Evidence:
  - `npm run health` passed: format check, TypeScript, 162 tests, validation,
    and coverage playtest.
  - `npm run ai:cycle` wrote current evidence artifacts and stopped after
    evidence generation because `AI_AGENT_CMD` is not set.
  - Manual true-ending route started at score 0 and reached `true_ending` with
    open-ended score 316 across 48 awards.
  - Manual route feedback showed rewarding deltas on constructive actions:
    small utility actions such as closing the locker paid +1, progression beats
    paid +12 to +29, clearing Mara paid +42, and the final release paid +53.
  - Coverage playtest still visited all 117 scenes with zero unfinished runs;
    best score was 390 and average score was 318.27.
- Playtest feedback:
  - The score no longer appears as `X/Y`.
  - Reward cues were present on every positive step in the tested route after
    adding small awards for keep, return, leave, and close choices.
  - The initial score is now 0 instead of awarding points for merely starting.
- Next step:
  - Watch blind-play transcripts for whether visible `Award: +N ...` lines feel
    motivating or too verbose in dense routes.

# Cycle 9 Thumbprint-First Manifest Recovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `passenger_echoed_boarding`
  by letting players recover the kept-passenger manifest after inspecting
  Mara's thumbprint first.
- Why this matters: The latest evidence suggested `passenger_echoed_boarding`
  was still easy to miss in ordinary random play. The direct boarding payoff
  already existed, but a ledger-first player who touched Mara's thumbprint could
  lose the manifest pivot even though the scene text still points back toward
  the earlier passenger pages.
- Work completed:
  - Added `read_manifest_after_thumbprint` from `signal_ledger` to
    `passenger_manifest`, gated by `read_mara_thumbprint` and
    `notFlag: read_passenger_manifest`.
  - Preserved `mark_mara_clear_from_ledger`, so thumbprint-first players can
    still choose the Mara-only route instead of being forced into passenger
    cleanup.
  - Added regression coverage for the full thumbprint-first recovery path:
    thumbprint memory, kept-passenger manifest, passenger echoes,
    `passenger_echoed_boarding`, intercom payoff, and
    `passenger_echoed_true_ending`.
  - Restored `maxScore` on the current score breakdown for compatibility with
    existing route tests, CLI/MCP score displays, and AI-loop reporting.
  - Corrected the no-radio release-route test so it checks ideal-ending scoring
    after the release, not in the pre-release `train_car` scene.
- Evidence:
  - Focused story-path suite passed: 118 tests.
  - Actual CLI play used `read_manifest_after_thumbprint` and reached
    `passenger_echoed_true_ending` at 307/307.
  - `npm run health` passed: format check, TypeScript, 162 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 388, average score 316.42, and reached
    `passenger_echoed_true_ending` 49 times.
  - `npm run ai:cycle` wrote ignored run artifacts but exited 75 because the
    loop runtime was already dirty and the nested `codex exec` failed to start
    due a read-only app-server/PATH filesystem error.
- Playtest feedback:
  - The new choice reads naturally: Mara's "No one clears until everyone
    clears" thumbprint memory now points directly back into the passenger
    manifest instead of silently narrowing the player to a Mara-only clear.
  - The echoed-passenger route now remains recoverable after a common
    lore-first inspection order.
  - No dangling objectives, invalid choices, validation errors, or unfinished
    coverage runs appeared.
- Next step:
  - Watch blind-play feedback for whether the signal-ledger choice set feels
    clear or too dense after the thumbprint recovery option.
- Risks:
  - The worktree contains broader dirty changes across engine/playtest files
    that were not part of this story change. I did not commit to avoid mixing
    unrelated baseline edits with this milestone.

# Cycle 8 Threshold Boarding Intercom Bridge

- Date: 2026-06-02
- Main objective: Improve the passenger threshold route by paying off the
  held-door scene immediately instead of requiring a detour through the generic
  train-car scene.
- Why this matters: Current evidence is green with full coverage, so the best
  improvement is route texture and discoverability. The threshold scene already
  frames the player's action as proof that the passengers are becoming a crowd;
  letting Mara answer from that exact scene keeps the payoff attached to the
  choice that earned it.
- Work completed:
  - Added `listen_to_threshold_from_boarding` from
    `passenger_threshold_boarding` to the existing
    `passenger_threshold_intercom`.
  - Set `heard_mara_goodbye` on the direct bridge to match the existing
    train-car intercom route.
  - Preserved `reach_release_after_threshold_boarding`, so players can still
    route through the train-car scene and hear the same threshold intercom
    there.
  - Updated regression coverage for both the new direct threshold payoff and
    the preserved older train-car threshold path.
- Evidence:
  - Focused story-path suite passed: 117 tests.
  - Actual CLI play used `listen_to_threshold_from_boarding` and reached
    `passenger_true_ending` at 100/100 with no active objectives.
  - `npm run health` passed: format check, TypeScript, 161 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.67, and 1285 max-score runs.
- Playtest feedback:
  - The threshold route now reads as one continuous beat: hold the doorway,
    hear Mara accept the footsteps as proof, then pull the release.
  - The fallback route through `train_car` still exposes
    `listen_to_threshold_manifest_intercom`, so existing navigation remains
    valid.
  - No route bugs, dangling objectives, score issues, or unfinished runs
    appeared.
- Next step:
  - Watch random and blind-play samples for whether late passenger routes feel
    too choice-dense; if so, consolidate overlapping passenger payoff choices
    by theme.
- Risks:
  - This adds one more choice to a late optional passenger branch. It is scoped
    to a scene that previously had only one continuation and reuses an existing
    payoff scene.

# Cycle 7 Restored Transfer Conductor Bridge

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for
  `passenger_conductor_transfer_true_ending` through the existing newspaper
  transfer clue.
- Why this matters: Current health evidence was green, but the conductor
  transfer payoff remained a rare late passenger branch. The newspaper woman
  already restores the blank transfer column and the conductor calls it enough
  route for a clear signal; letting players ask him to punch that restored
  transfer makes the payoff available where the story promise is clearest.
- Work completed:
  - Added `ask_conductor_to_punch_restored_transfer` from
    `passenger_newspaper_transfer` to the existing
    `passenger_conductor_transfer` scene.
  - Set `helped_passengers_gather`, `conductor_cleared_platform`, and
    `punched_conductor_transfer` on that bridge so the conductor payoff and
    release route stay coherent.
  - Preserved the existing newspaper route through
    `carry_newspaper_transfer_to_third_car`.
  - Added focused regression coverage for the restored-transfer bridge through
    `passenger_conductor_transfer_true_ending`.
- Evidence:
  - Focused story-path suite passed: 117 tests.
  - `npm run health` passed: format check, TypeScript, 161 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.67, and 1285 max-score runs.
  - Coverage hits for `passenger_conductor_transfer_true_ending` rose to 49 in
    the required health playtest.
  - Actual CLI play used `ask_conductor_to_punch_restored_transfer` and
    `pull_release_with_punched_transfer`, reaching
    `passenger_conductor_transfer_true_ending` at 100/100 with no active
    objectives.
- Playtest feedback:
  - The bridge reads naturally because the restored transfer column already
    names morning transfer and the conductor is physically touching it.
  - The transfer scene now offers a clear choice between conductor validation
    and the existing newspaper intercom route.
  - No route bugs, dangling objectives, score issues, or unfinished runs
    appeared.
- Next step:
  - Watch random and blind-play samples for whether late passenger routes now
    feel choice-dense; if so, consolidate payoff choices by theme instead of
    adding parallel branches.
- Risks:
  - This adds one more choice to a late optional branch. It is scoped to a
    scene that previously had only one continuation.

# Cycle 9 Manifest Thumbprint Recovery

- Date: 2026-06-02
- Main objective: Improve discoverability for
  `mara_manifest_thumbprint_intercom` and
  `passenger_manifest_thumbprint_true_ending`.
- Why this matters: Latest cycle evidence kept core metrics healthy but still
  under-sampled the manifest-thumbprint payoff in normal random play. The
  thread was already earned when players watched Mara open the manifest, but
  returning to `passengers_released` could strand that thread behind the older
  handoff scene.
- Work completed:
  - Added `touch_manifest_thumbprint_from_opened_doors`, gated by
    `saw_mara_manifest_handoff` and `notFlag: read_manifest_thumbprint`, so
    players can resume Mara's torn-thumbprint clue after returning to the opened
    doors.
  - Added `carry_manifest_thumbprint_from_opened_doors`, gated by the same
    handoff plus `read_manifest_thumbprint` and `notFlag: heard_mara_goodbye`,
    so players who touched the thumbprint and returned can still carry the oath
    into the third-car intercom.
  - Preserved the existing direct thumbprint route, generic boarding route, and
    return route.
  - Added regression coverage for the recovery path through
    `passenger_manifest_thumbprint_true_ending`.
- Evidence:
  - Focused story-path suite passed: 117 tests.
  - Manual CLI play used `touch_manifest_thumbprint_from_opened_doors` and
    `carry_manifest_thumbprint_from_opened_doors`, reaching
    `passenger_manifest_thumbprint_true_ending` at 100/100 with no active
    objectives.
  - `npm run health` passed: format check, TypeScript, 161 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.52, and 1237 max-score runs.
  - `npm run ai:cycle` passed; MCP validation stayed clean, actual MCP play
    reached `true_ending` at 100/100, and the adaptive route reached
    `passenger_answered_true_ending` at 100/100.
- Risks:
  - `passengers_released` has more context-sensitive choices after the player
    watches Mara open the manifest. The new choices are gated behind that prior
    action and are not visible in the first opened-doors choice set.

# Cycle 6 Lunch-Tin Roster Boarding Discovery

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `passenger_lunch_tin_roster`.
- Why this matters: Current validation and playtest evidence is green, but
  random normal play still missed the lunch-tin roster while coverage could
  reach it. The boarding scene already centers the worker's tin count, so the
  roster proof should be available at that moment instead of only after the
  intercom beat.
- Work completed:
  - Added `read_lunch_tin_roster_from_boarding`, a direct choice from
    `passenger_lunch_tin_boarding` to the existing
    `passenger_lunch_tin_roster`.
  - Set `heard_gathered_passengers` and `read_lunch_tin_roster` on the direct
    route so later text and gating stay coherent.
  - Preserved the existing lunch-tin intercom and direct release choices from
    boarding.
  - Updated regression coverage for the direct boarding-to-roster route through
    `passenger_lunch_tin_true_ending`.
- Evidence:
  - Focused story-path suite passed: 116 tests.
  - Actual CLI play used `read_lunch_tin_roster_from_boarding` and reached
    `passenger_lunch_tin_true_ending` at 100/100 with no active objectives.
  - `npm run health` passed: format check, TypeScript, 160 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.52, and 1237 max-score runs.
- Playtest feedback:
  - The roster read lands naturally from the boarding scene because the lunch
    tin is already visible and actively counting passengers into the third car.
  - The scene now has three focused choices: inspect the roster, hear the
    worker's intercom beat, or release immediately.
  - No route bugs, dangling objectives, or score issues appeared in the focused
    playthrough.
- Next step:
  - Watch whether random play samples `passenger_lunch_tin_roster` more often,
    and avoid adding more one-off late passenger choices unless blind feedback
    calls for them.
- Risks:
  - Late passenger boarding scenes are getting denser; future work should
    consider consolidating payoff choices if blind players report overload.

# Cycle 8 Echoed Manifest Boarding Payoff

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for `passenger_echoed_boarding`
  payoff without adding a new ending or broadening early-game pressure.
- Why this matters: The current evidence is green and fully reachable, but
  random normal play still under-sampled `passenger_echoed_boarding` compared
  with coverage. The branch already has a strong moment where the player boards
  while the stamped-door sounds follow them; the matching intercom payoff should
  be available there, not only after routing through the generic train-car
  scene.
- Work completed:
  - Added `listen_to_echoed_manifest_from_boarding`, a direct choice from
    `passenger_echoed_boarding` to the existing
    `passenger_echoed_manifest_intercom`.
  - Set `heard_mara_goodbye` on the direct choice to match the existing
    train-car intercom route.
  - Preserved `reach_release_with_echoed_manifest`, so players can still move
    through the generic release scene if they skip the intercom beat.
  - Updated regression coverage for the echoed-manifest route through
    `passenger_echoed_true_ending`.
- Evidence:
  - Focused story-path suite passed: 116 tests.
  - Actual CLI play used `listen_to_echoed_manifest_from_boarding` and reached
    `passenger_echoed_true_ending` at 100/100 with no active objectives.
  - `npm run health` passed: format check, TypeScript, 160 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.52, and 1237 max-score runs.
  - Coverage-path hits for `passenger_echoed_true_ending` rose to 25.
- Playtest feedback:
  - The new branch reads naturally because the boarding scene already says Mara
    leaves the speaker open and the train needs to hear waiting turn into
    boarding.
  - The boarding scene now has two choices: hear the echoed intercom payoff or
    follow the echoes straight to the release.
  - No route bugs, dangling objectives, or score issues appeared in the focused
    playthrough.
- Next step:
  - Watch whether random play now samples the echoed manifest ending more often
    without increasing unfinished or non-ideal pressure.
- Risks:
  - Late passenger branches are choice-dense in aggregate; keep future work
    focused on consolidating or clarifying existing hubs rather than adding more
    parallel endings.

# Cycle 6 Answered Passenger Boarding Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for the plain answered-passenger
  payoff without adding another ending or widening early-game pressure.
- Why this matters: Current health evidence is strong, but random runs still
  hit `passenger_answered_true_ending` much less often than adjacent passenger
  roll-call endings. The route existed, but players had to listen to the
  opened manifest answers, avoid several character-specific branches, board,
  then choose the intercom. The opened-manifest hub already says the passengers
  answer in ordinary sounds, so boarding with those answered names is an earned
  direct continuation.
- Work completed:
  - Added `board_with_answered_passengers`, a direct choice from
    `passengers_released` to the existing `passenger_answered_boarding` scene.
  - Set `heard_passenger_answers` on that choice so the later boarding and
    intercom text remain coherent.
  - Preserved the existing `listen_to_passenger_answers`, handoff, gathered,
    lunch-tin, and broad platform routes.
  - Added regression coverage for the new direct route through
    `passenger_answered_true_ending`.
- Evidence:
  - Focused story-path suite passed: 116 tests.
  - `npm run health` passed: format check, TypeScript, 160 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.45, and 1217 max-score runs.
  - Coverage-path hits for `passenger_answered_true_ending` rose to 33 and
    `passenger_answered_boarding_true_ending` rose to 33 in the required health
    playtest.
  - Actual CLI play used `board_with_answered_passengers` and reached
    `passenger_answered_true_ending` at 100/100 with no active objectives.
- Playtest feedback:
  - The route reads naturally: opening the manifest produces answered names,
    the new boarding choice carries those names into the third car, and the
    intercom payoff explains why they no longer need Mara to prove them twice.
  - The opened-manifest hub now has one more option; it is specific and
    thematic, but future blind-play feedback should watch whether this hub
    starts to feel too dense.
  - No route bugs, dangling objectives, score issues, or unfinished runs
    appeared.
- Next step:
  - Watch blind-play feedback for passenger hub choice density; if it repeats,
    consolidate late passenger payoff choices into clearer thematic groups
    rather than adding more one-off routes.
- Blocker:
  - Commit/push may be blocked in this sandbox if Git cannot create lock files,
    as prior cycles observed. The verified dirty tree is ready for the outer
    loop or a writable Git session to commit if local commit fails.

# Cycle 7 Conductor Transfer Direct Release

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for
  `passenger_conductor_transfer_true_ending`.
- Why this matters: The current health and MCP evidence is green, but ordinary
  random play still missed `passenger_conductor_transfer_true_ending` while
  coverage reached it. The route already has a strong earned clue, but players
  had to choose the transfer, then choose a roll-call continuation, then release.
  Letting the player pull the release while the punched transfer is being passed
  makes the payoff available at the moment the story promise is clearest.
- Work completed:
  - Completed: added one direct, gated choice from `passenger_conductor_transfer` to the
    existing transfer true ending.
  - Completed: kept reviewed-count conductor transfer routes pointed at the counted
    conductor payoff.
  - Completed: added focused regression coverage.
  - Completed: ran focused tests, `npm run health`, and one actual CLI route.
- Evidence:
  - Focused story-path suite passed: 116 tests.
  - `npm run health` passed: format check, TypeScript, 160 tests, validation,
    and coverage playtest.
  - Validation stayed clean with 117 reachable scenes, 26 endings, and no
    warnings.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.45, and 1217 max-score runs.
  - Actual CLI play used `pull_release_with_punched_transfer` and reached
    `passenger_conductor_transfer_true_ending` at 100/100 with no active
    objectives.
- Playtest feedback:
  - The new release choice reads naturally because it appears while the transfer
    is being passed from passenger to passenger.
  - The counted conductor transfer route remains distinct and still resolves to
    the counted conductor ending.
  - No route bugs, dangling objectives, score issues, or unfinished coverage
    runs appeared.
- Risks:
  - Late passenger hubs are accumulating choices; keep this scoped to the
    already-earned conductor transfer scene and watch blind feedback for choice
    density.

# Cycle 5 Keepsake Roll-Call Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for the under-sampled
  `passenger_keepsake_roll_call` scene without adding a new ending or widening
  early-game choice pressure.
- Why this matters: Current evidence shows the game is healthy and fully
  reachable, but random play still missed `passenger_keepsake_roll_call` in one
  normal-play sample. The keepsake branch already earns this payoff; players
  should see the final roll-call option when the boarding text says Mara starts
  reading the manifest again.
- Work completed:
  - Added `hear_keepsake_roll_call_from_boarding`, a direct choice from
    `passenger_keepsake_boarding` to `passenger_keepsake_roll_call`.
  - Preserved the existing keepsake intercom and direct keepsake release paths.
  - Added regression coverage for the direct boarding-to-roll-call path through
    `passenger_keepsake_true_ending`.
- Evidence:
  - Focused story-path suite passed: 115 tests.
  - `npm run health` passed: format check, TypeScript, 159 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.34, and 1185 max-score runs.
  - Actual CLI play used `hear_keepsake_roll_call_from_boarding` and reached
    `passenger_keepsake_true_ending` at 100/100 with no active objectives.
- Playtest feedback:
  - The route now reads cleanly: match keepsakes, lead matched passengers into
    the third car, let the keepsakes finish Mara's roll call, then pull the
    release.
  - The boarding scene now has three choices, but all are specific and earned:
    hear the roll call, listen to the intercom beat, or release immediately.
  - No route bugs, dangling objectives, score issues, or unfinished runs
    appeared.
- Next step:
  - Watch blind-play feedback for whether late passenger boarding scenes feel
    too dense; if that repeats, consolidate optional passenger payoff choices
    into clearer thematic groups.
- Blocker:
  - Commit/push may still be blocked in this sandbox if `.git` remains
    unwritable, as prior cycles observed. The verified dirty tree is ready for
    the outer loop or a writable Git session to commit.

# Cycle 4 Manifest Count And Thumbprint Carry-Forward

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for the under-sampled reviewed
  manifest count and Mara manifest thumbprint passenger payoffs.
- Why this matters: Current evidence shows full reachability but random play
  still sparsely hits `passenger_counted_manifest_intercom`,
  `passenger_counted_true_ending`, `mara_manifest_thumbprint_intercom`, and
  `passenger_manifest_thumbprint_true_ending`. Those are earned clues that
  should be easier to carry forward without knowing which tempting follow-up
  branches hide their third-car intercom variants.
- Work completed:
  - Added `board_with_reviewed_manifest_count`, a direct choice from
    `passenger_manifest_count` into `passenger_counted_manifest_intercom`.
  - Added `carry_manifest_thumbprint_to_third_car`, a direct choice from
    `mara_manifest_thumbprint` into `mara_manifest_thumbprint_intercom`.
  - Preserved the existing generic `board_after_manifest_count` and
    `board_after_manifest_thumbprint` routes so direct release and old
    third-car intercom paths still work.
  - Updated story-path regression coverage for the new direct routes and the
    preserved generic thumbprint boarding route.
- Evidence:
  - Focused story-path suite passed: 114 tests.
  - `npm run health` passed: format check, TypeScript, 158 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.34, and 1185 max-score runs.
  - Random 250-run playtest ended 250/250 runs, had zero unfinished runs,
    visited all scenes, reached `passenger_counted_true_ending` 7 times, and
    reached `passenger_manifest_thumbprint_true_ending` once.
  - Actual CLI play used `board_with_reviewed_manifest_count` and reached
    `passenger_counted_true_ending` at 100/100 with no active objectives.
- Playtest feedback:
  - The reviewed-count route now reads cleanly: the player reviews the manifest
    count, boards with that count explicitly on the speaker, hears the matching
    intercom, and gets the counted passenger ending.
  - The extra choices add some density to two optional clue scenes, but they
    are specific, earned, and preserve the old direct release path.
  - No route bugs, dangling objectives, score issues, or unfinished runs
    appeared.
- Next step:
  - Watch blind-play feedback for whether optional passenger hubs are becoming
    too choice-dense; if so, consolidate late-game passenger payoff choices by
    clearer thematic grouping instead of adding more one-off branches.
- Blocker:
  - Commit/push is expected to be blocked in this sandbox because prior cycles
    already observed `.git` is read-only and Git cannot create `.git/index.lock`.
    The verified dirty tree is ready for the outer loop or a writable Git
    session to commit.

# Cycle 3 Lunch-Tin Latch Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play discovery for the lunch-tin passenger
  payoff by exposing it immediately when the opened manifest releases ordinary
  passenger sounds, not only after players cross to the passenger platform.
- Why this matters: Current random evidence reaches all major routes but still
  under-samples `passenger_lunch_tin_*` scenes in ordinary play; coverage finds
  them, so this is a discoverability issue rather than a reachability bug.
- Work completed:
  - Added `follow_lunch_tin_latch` to `passengers_released`, gated by
    `notFlag: helped_passengers_gather`.
  - Routed the new choice into the existing `passenger_farewell` and
    `passenger_lunch_tin_*` sequence, preserving the answered-passenger entry
    and the platform lunch-tin route.
  - Added a regression test for the early lunch-tin latch route through the
    lunch-tin true ending.
- Evidence:
  - Focused story-path suite passed: 114 tests.
  - `npm run health` passed: format check, TypeScript, 158 tests, validation,
    and coverage playtest.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 95.28, and 1169 max-score runs.
  - Random 250-run playtest visited all lunch-tin scenes and reached
    `passenger_lunch_tin_true_ending` 18 times, up from 7 in the prior local
    250-run sample and 1 in the prior MCP sample.
  - Actual CLI play used `follow_lunch_tin_latch` from `passengers_released`,
    read the lunch-tin roster, and reached
    `passenger_lunch_tin_true_ending` at 100/100 with no active objectives.
- Playtest feedback:
  - The new latch choice reads naturally because `passengers_released` already
    foregrounds the lunch tin latch; it gives explorers a clear character
    payoff before they diffuse into the wider platform choice set.
  - No route bugs, score issues, dangling objectives, or unfinished coverage
    runs appeared.
- Next step:
  - Watch blind-play feedback for whether the now-richer passenger release hub
    feels too busy; otherwise continue improving under-sampled optional
    passenger payoffs one at a time.
- Blocker:
  - Commit/push is blocked in this sandbox because `.git` is read-only and Git
    cannot create `.git/index.lock`. The verified dirty tree is ready for the
    outer loop or a writable Git session to commit.

# Cycle 2 Health Recovery And Conductor Discovery Addendum

- Date: 2026-06-02
- Main objective: Restore failing health checks from the metadata migration and
  make `passenger_conductor_true_ending` easier to discover in normal play.
- Why this matters: The cycle began with failing format, lint, and tests, and
  prior random evidence reached the plain conductor ending only 2 times in 250
  runs. A verified tree matters more than adding broad new content.
- Work completed:
  - Restored legacy objective guidance as a fallback when a story has no
    `objectives` block, while keeping story-level objectives available.
  - Made validation tolerate omitted objectives in lightweight stories.
  - Restored the stable Mara/Passenger ideal-ending breakdown for callers that
    do not pass story metadata.
  - Added `ask_conductor_punch_from_answers`, a new answered-passenger choice
    that routes through `passenger_conductor_punch_memory` before the conductor
    intercom.
  - Cleaned duplicate `routeImportance` keys on ending scenes.
- Evidence:
  - Focused tests passed:
    `npm test -- tests/story-paths.test.ts tests/engine.test.ts tests/ai-loop.test.ts tests/ai-loop-metrics.test.ts tests/validate.test.ts`
    with 128 tests.
  - `npm run health` passed: formatting, TypeScript, 154 tests, clean story
    validation, and coverage playtest.
  - Coverage playtest visited all 117 scenes, had zero unfinished runs, best
    score 100/100, average score 94.7, and 1025 max-score runs.
  - Random 250-run playtest reached `passenger_conductor_true_ending` 11 times.
  - Actual CLI play used `ask_conductor_punch_from_answers` and reached
    `passenger_conductor_true_ending` with no remaining objectives or choices.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    reports `ai-runs/cycle-2026-06-02T05-32-20-106Z.md` and
    `ai-runs/cycle-2026-06-02T05-32-20-106Z-prompt.md`.
- Blocker:
  - Commit/push is blocked in this sandbox because `.git` is read-only and Git
    cannot create `.git/index.lock`. The verified dirty tree is ready for the
    outer loop or a writable Git session to commit.

# Cycle 2 Core Player-View And Story Metadata Contracts

- Date: 2026-06-02
- Main objective: Move blind-playtest assumptions into first-class engine and
  story contracts: player-visible observations, declarative objectives, route
  importance, and ending classification.
- Why this matters: The blind-playtesting sidecar was useful enough to show
  duplicated core assumptions. AFK loops need one source of truth for what
  players can see, which objective hints can appear, how important a route is,
  and which endings count as ideal.
- Tasks:
  - Add `observePlayer()` as the player-facing API and route blind playtesting
    through it.
  - Move objective rules from hardcoded engine checks into `stories/demo.yaml`.
  - Annotate all demo scenes with route importance.
  - Annotate all demo endings with `endingType`, `endingGroup`, and
    `endingFamily` where relevant.
  - Make scoring, playtest destination ranking, feedback consolidation, and
    validation consume story metadata instead of duplicated side lists.
  - Update docs so future loops preserve these contracts.
- Risks:
  - AI-loop summaries without story context use a naming fallback for legacy
    summary objects; story-aware consumers now use metadata.
- Status:
  - Implemented and verified.
  - `npm run health` passed: formatting, TypeScript, 156 tests, story validation,
    and coverage playtest.
  - Validation is clean with 117 reachable scenes, 26 endings, and no warnings.
  - Coverage playtest visited all scenes, had zero unfinished runs, best score
    100/100, average score 94.7, and 1025 max-score runs.
- Playtest feedback:
  - The metadata migration did not change route text. The next playable pass can
    use the now-clean player-view and route metadata to prioritize blind feedback.
- Next step:
  - Run `npm run ai:cycle` and a manual route after the full migration, then
    commit and push the verified milestone.

# Cycle 1 Counted-Conductor Payoff

- Date: 2026-06-02
- Main objective: Give the reviewed-manifest conductor route its own ideal
  ending instead of collapsing back into the generic conductor ending.
- Why this matters: Current health evidence shows strong true-ending
  discoverability and all-scene coverage, so the highest-value next step is
  richer character payoff. The opened manifest count already lets players ask
  the conductor to carry Mara's count, but the release did not yet reflect that
  specific choice.
- Tasks:
  - Route `passenger_conductor_count_roll_call` to a distinct counted-conductor
    true ending.
  - Preserve the existing generic conductor ending and punched-transfer ending
    for non-counted conductor routes.
  - Add/update regression coverage for both the plain counted clear call and
    the punched-transfer counted clear call.
  - Classify the new ending as ideal in score, playtest search, loop metrics,
    and feedback consolidation.
- Risks:
  - Adds one more ideal-ending id to evidence summaries, widening already broad
    ending output slightly.
- Status:
  - Implemented story, scoring, playtest, metrics, consolidation, and focused
    regression-test changes.
  - Focused validation passed with 117 scenes, 26 endings, all reachable, and
    no warnings.
  - Focused tests passed:
    `npm test -- tests/story-paths.test.ts tests/ai-loop.test.ts tests/playtest.test.ts`
    with 125 tests.
  - Fixed a blind-playtester test fixture and hardened `runAgentCommand` so
    commands that close stdin immediately no longer crash the runner with
    `EPIPE`.
  - `npm test -- tests/blind-playtester.test.ts` passed with 6 tests.
  - `npm run health` passed: format, lint, 153 tests, validation, and coverage
    playtest.
  - Health coverage visited all 117 scenes including
    `passenger_conductor_count_true_ending`, had zero unfinished runs, best
    score 100/100, average score 94.7, and 1025 max-score runs.
  - Actual CLI play followed the reviewed-manifest conductor route through
    `hear_counted_conductor_roll_call` and reached
    `passenger_conductor_count_true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    reports `ai-runs/cycle-2026-06-02T05-19-27-908Z.md` and
    `ai-runs/cycle-2026-06-02T05-19-27-908Z-prompt.md`; no `AI_AGENT_CMD` was
    set, so the cycle stopped after evidence and prompt generation.
- Playtest feedback:
  - The new ending reads as a clear payoff for reviewing the opened manifest
    count and then asking the conductor to carry it; the final image keeps the
    count from feeling like a generic conductor signal.
  - No route bugs, dangling objectives, or score issues appeared in focused
    tests, health coverage, or the actual CLI playthrough.
- Next step:
  - Continue favoring small character-payoff improvements while the core route
    metrics remain healthy; watch whether the expanded ending set makes
    transcript summaries too wide.

# Cycle 1 Badge-Proof Discoverability

- Date: 2026-06-02
- Main objective: Improve normal-play access to the `mara_badge_proof_intercom`
  payoff without removing the thumbprint or manifest variants.
- Why this matters: Random evidence showed full coverage overall, but the
  smaller normal-play sample still missed `mara_badge_proof_intercom`; the
  route was hidden whenever players also inspected Mara's torn thumbprint.
- Tasks:
  - Relax the third-car badge-proof intercom gate so `knows_badge_proof` remains
    valid after the optional thumbprint memory.
  - Keep passenger-manifest and last-dispatch branches distinct so existing
    late-game payoffs do not collapse into one generic scene.
  - Add a regression test proving badge proof and thumbprint can coexist as
    selectable third-car payoffs.
- Risks:
  - More choices in the third car can slightly increase branch competition, but
    both are earned clue payoffs and the direct release remains available.
- Status:
  - Implemented story-gate and regression-test changes.
  - Focused story-path suite passed: 112 tests.
  - `npm run health` passed: format, lint, 133 tests, validation, and coverage
    playtest.
  - Coverage playtest visited all 115 scenes, including
    `mara_badge_proof_intercom`, with 0 unfinished runs.
  - Actual CLI playthrough followed the badge-back plus thumbprint route,
    selected `listen_to_badge_proof_intercom`, and reached `true_ending` at
    100/100.
- Playtest feedback:
  - The combined clue route now feels more natural: reading the badge back and
    touching the thumbprint no longer makes one earned final clue erase the
    other.
  - The third car now offers two optional earned intercom beats plus the direct
    release on that route. This is acceptable for now, but future passes should
    watch whether late-game choice lists become too dense.
- Next step:
  - Review random samples for late-game routes with three or more optional
    intercom payoffs and consider grouping transcript/report output so pacing
    critiques are easier.

# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Keep the autonomous CYOA engine maintainable, secure, and playable while
preserving normal-play true-ending discoverability and improving passenger route
payoffs and agent evidence quality where the core guidance is already healthy.

## Active Cycle

- Date: 2026-06-02
- Status: Completed locally; ready for commit/push.
- Main objective: Pay off the conductor's punched-transfer branch with a
  distinct ideal ending and complete the blind-playtesting infrastructure
  follow-through from `GOALRESEARCH20260601.md`.
- Why this matters: Current evidence showed route health is strong and
  recommended richer story depth over more signposting. The answered-passenger
  conductor route already let players ask for one last transfer punch, but that
  optional beat collapsed back into the generic conductor ending. A focused
  ending makes the choice feel causal while preserving the existing conductor
  route.
- Tasks:
  - Add `passenger_conductor_transfer_true_ending` for punched-transfer
    roll-call routes. Done.
  - Keep non-transfer conductor roll-call routes on
    `passenger_conductor_true_ending`. Done.
  - Classify the new ending as ideal in scoring, playtest search, loop metrics,
    and feedback consolidation. Done.
  - Update conductor-route regression coverage for transfer and non-transfer
    variants. Done.
  - Wire real per-turn LLM blind decisions with validated JSON and deterministic
    fallback telemetry. Done.
  - Add maintained route-importance weighting and control-sensitive cluster tags
    to blind feedback consolidation. Done.
  - Add isolated worktree launch and artifact-only auto-commit support to
    `playtest_loop.sh`. Done.
  - Run full health and an actual CLI playthrough. Done.
  - Run the evidence cycle. Done.
- Evidence:
  - Added a flag-gated release choice in `passenger_conductor_roll_call`: generic
    conductor routes still offer `pull_release_after_conductor_roll_call`, while
    routes with `punched_conductor_transfer` offer
    `pull_release_after_conductor_transfer`.
  - Added ending text centered on the star-shaped transfer punch passing from
    passenger to passenger into morning.
  - Updated ideal-ending classification in `src/score.ts`, `src/playtest.ts`,
    `src/ai-loop-metrics.ts`, and `src/consolidate-feedback.ts`.
  - Added `src/playtest-route-importance.ts` and wired consolidation output to
    show `[route:...]` and `[control:...]` metadata while multiplying priority
    only for already-observed issues.
  - Added per-turn decision prompts in `src/playtest-prompts.ts`, decision
    parsing in `src/playtest-feedback.ts`, and LLM/fallback accounting in
    `src/blind-playtester.ts`.
  - Hardened `playtest_loop.sh` with `AI_PLAYTEST_WORKTREE`,
    `AI_PLAYTEST_PUSH_BRANCH`, and artifact-only auto-commit/push retries.
  - Focused blind subsystem tests passed:
    `npm test -- tests/blind-playtester.test.ts tests/playtest-feedback.test.ts tests/consolidate-feedback.test.ts`
    with 15 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 116
    scenes, 25 endings, all 116 reachable, and no warnings.
  - `npm run health` passed with formatting, TypeScript, 153 tests, validation,
    and coverage playtest.
  - Health coverage visited all 116 scenes including
    `passenger_conductor_transfer_true_ending`, had zero unfinished runs, best
    score 100/100, average score 94.58, and 1000 max-score runs.
  - No-write blind playtest session passed:
    `npm run playtest:session -- --persona goal_seeker --variant no_hints --max-turns 5 --seed 123 --no-write`.
  - `bash -n playtest_loop.sh` passed.
  - Actual CLI play followed the direct Mara route to `true_ending` at 100/100.
  - Actual CLI play followed the answered-passenger conductor route through
    `ask_conductor_to_punch_transfer`, `hear_transfer_conductor_roll_call`, and
    `pull_release_after_conductor_transfer`, reaching
    `passenger_conductor_transfer_true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    reports `ai-runs/cycle-2026-06-02T05-06-48-286Z.md` and
    `ai-runs/cycle-2026-06-02T05-06-48-286Z-prompt.md`.
- Playtest notes:
  - The transfer punch now has a complete arc: requested in the third car,
    carried through the final clear call, then paid off in the ending.
  - The generic conductor route still works when the transfer is not punched,
    so the new branch adds payoff without taking away the simpler roll-call
    resolution.
  - No bugs or dead ends were found in focused tests, validation, full health,
    or the actual CLI playthrough.
  - The blind-playtesting loop can now produce genuinely turn-by-turn model
    behavior when model commands are configured, while still staying unattended
    and honest when a model returns invalid decision JSON.
- Follow-up:
  - Continue favoring small character-payoff improvements while ideal-ending
    and max-score rates remain healthy.
  - Consider whether the counted-manifest transfer route should eventually get
    its own ending, or whether the current counted conductor ending is enough.
- Risks:
  - Adds one more tracked ideal ending, so evidence summaries are slightly wider.

## Last Completed Cycle

- Date: 2026-06-02
- Status: Completed locally; ready for commit/push.
- Main objective: Add a recoverable HOME-sign scare that can steer players
  back to the true-ending preparation route.
- Why this matters: Cycle 10 evidence showed core guidance and ideal-ending
  rates are healthy, but suspicious path samples still included a map-carrying
  player who stared through the HOME sign into `lost_ending` after partially
  understanding the route. The sign trap should remain dangerous, but the final
  warning can also convert a near-loss into concrete preparation goals for
  players still holding the map.
- Tasks:
  - Add a third choice at `home_sign_grip` that uses the map to break the sign's
    pull and return to the service room. Done.
  - Make the new beat explicitly name the remaining true-route components:
    badge, fuse, clock token, and ledger. Done.
  - Preserve the existing safe morning escape and explicit lost ending. Done.
  - Update focused story-path regression coverage through the new recovery
    route into `true_ending`. Done.
  - Run focused tests, validation, full health, evidence cycle, and actual
    CLI/MCP playthroughs. Done.
- Evidence:
  - Added `jam_map_in_home_sign_doors`, gated by the map, from
    `home_sign_grip` back to `service_room`.
  - The recovery sets `escaped_home_sign_grip`, `knows_token_location`, and
    `knows_badge_proof`, so objectives point to the stopped clock and Mara's
    identity proof after the scare.
  - Focused `npm test -- tests/story-paths.test.ts` passed with 111 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 112 scenes,
    24 endings, all 112 reachable, and no warnings.
  - `npm run health` passed with formatting, TypeScript, 132 tests, validation,
    and coverage playtest.
  - Health coverage completed with zero unfinished runs, all scenes visited,
    best score 100/100, average score 94.2, and 923 max-score runs.
  - Manual CLI play followed `look_at_sign` -> `stare_at_home` ->
    `let_home_sign_finish` -> `jam_map_in_home_sign_doors`, then gathered the
    fuse, badge, clock token, restored the platform, cleared Mara, and reached
    `true_ending` at 100/100 with no objectives.
  - MCP play repeated the same recovery route through
    `jam_map_in_home_sign_doors` and reached `true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-02T02-23-55-245Z.md`.
- Playtest notes:
  - The new beat feels like a last-second correction rather than a free pass:
    the player still had to choose through two warnings before seeing it.
  - Returning to the service room after the HOME scare produces useful
    objectives for token, fuse, badge proof, and survival knowledge.
  - Existing `good_ending` and `lost_ending` choices remain visible at the same
    branch, so the trap is still legible and voluntary.
  - No bugs or dead ends were found in focused tests, full health, CLI play, or
    MCP play.
- Follow-up:
  - Watch random samples to see whether the new recovery choice lowers
    `lost_ending` pressure without erasing the sign trap's narrative cost.
  - Consider a similar recovery cue for repeated forced-gate attempts only if
    bad-ending pressure starts crowding out normal play.
- Risks:
  - The HOME-sign branch now offers three exits, so its final-choice tension
    may feel slightly less severe.

## Last Completed Cycle

- Date: 2026-06-02
- Status: Completed locally; ready for commit/push.
- Main objective: Improve normal-play discovery for the conductor final
  roll-call payoff.
- Why this matters: Cycle 9 evidence showed all scenes reachable under coverage
  play, but the 100-run random sample still missed
  `passenger_conductor_roll_call`. Players who already chose the old conductor
  route could still jump straight from the conductor intercom or transfer beat
  to the ending, skipping one of the clearest passenger-worker payoffs. Holding
  the release for the final clear call makes the conductor route read as a
  complete action instead of a late optional aside.
- Tasks:
  - Route the direct conductor-clear intercom action through the regular or
    counted conductor roll-call scene before release. Done.
  - Route the conductor transfer shortcut through the regular or counted
    conductor roll-call scene before release. Done.
  - Preserve the explicit roll-call choices and final conductor ending. Done.
  - Update focused story-path regression coverage for regular, transfer, and
    reviewed-count variants. Done.
  - Run focused tests, validation, random/coverage samples, full health, and an
    actual CLI playthrough. Done.
- Evidence:
  - Replaced the direct `pull_release_after_conductor_clearance` ending jump
    with `hold_for_conductor_roll_call_before_release` and
    `hold_for_conductor_count_before_release`.
  - Replaced the direct `pull_release_after_transfer_punch` ending jump with
    `hold_for_transfer_conductor_roll_call` and
    `hold_for_transfer_conductor_count`.
  - The new held-release choices set `heard_final_roll_call` and route to the
    appropriate conductor roll-call scene before the existing final release
    choice.
  - Focused `npm test -- tests/story-paths.test.ts` passed with 111 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 112 scenes,
    24 endings, all 112 reachable, and no warnings.
  - A 100-run random sample ended 100/100 runs, had zero unfinished runs, and
    now visited `passenger_conductor_roll_call`.
  - A 100-run coverage sample visited all 112 scenes, had zero unfinished
    completed routes, kept best score 100/100, averaged 94.62, and produced
    923 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 132 tests, validation,
    and coverage playtest.
  - Manual CLI play followed `listen_to_passenger_answers` ->
    `ask_conductor_from_answers` -> `follow_conductor_signal_to_third_car` ->
    `ask_conductor_to_punch_transfer` ->
    `hold_for_transfer_conductor_roll_call` ->
    `pull_release_after_conductor_roll_call`, reaching
    `passenger_conductor_true_ending` at 100/100 with no objectives.
- Playtest notes:
  - The conductor route now keeps its physical release action visible while
    making the player wait for the old conductor to finish clearing the doors.
  - The transfer beat flows cleanly into the roll call: the punched transfer
    becomes proof that the passengers can change trains, then the conductor
    calls each door clear.
  - The first manual script used an outdated choice ID and stopped at
    `passengers_released`; rerunning with the actual `listen_to_passenger_answers`
    hub choice completed the intended route.
- Follow-up:
  - Recheck random ending distribution after a larger evidence cycle; this
    change improves scene visibility without changing the number of endings.
  - Watch for late-game routes becoming too linear if more optional final
    beats are made mandatory.
- Risks:
  - The conductor route is one beat longer on direct release attempts.
  - Choice labels now say "hold the release" instead of "pull the release," so
    the scene text must keep the emergency release physically present.

## Last Completed Cycle

- Date: 2026-06-02
- Status: Completed locally; ready for commit/push.
- Main objective: Add a final warning-mark beat to the safe morning-transfer
  route.
- Why this matters: Core true-ending and passenger-route metrics are healthy.
  The map-only survival route is intentionally lower-value, but it should still
  feel like a considered player choice rather than an abrupt abandonment. A
  small optional beat can make leaving, listening, and turning back more
  emotionally legible without disturbing ideal-ending guidance.
- Tasks:
  - Add an optional morning warning mark after reading the safe-transfer note
    or listening at the morning doors.
  - Preserve the option to leave safely or turn back toward the true-ending
    route from the new beat.
  - Update focused story-path tests.
  - Run validation, full health, and a real route through the new content.
- Evidence:
  - Added `morning_warning_mark`, an optional warning-writing beat reachable
    after reading the morning map note or listening at the morning doors.
  - The new beat lets players leave into `good_ending` with a clearer ethical
    frame or turn back toward the token/ledger recovery path.
  - Updated story-path tests for both map-note and door-listen approaches into
    the new scene.
  - Raised the playtest default step budget from 50 to 60 in CLI, MCP,
    playtest helpers, AI-loop coverage evidence, and the coverage regression
    test because the expanded 106-scene graph has two valid coverage paths that
    exceed 50 steps.
  - Focused `npm test -- tests/story-paths.test.ts` passed with 107 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 106 scenes,
    24 endings, all 106 reachable, and no warnings.
  - `npm run health` passed with formatting, TypeScript, 128 tests, validation,
    and coverage playtest.
  - Health coverage visited all 106 scenes including `morning_warning_mark`,
    had zero unfinished runs, best score 100/100, average score 99.7, and
    724800 max-score runs.
  - Targeted CLI play followed `study_morning_map_note` ->
    `mark_warning_for_next_rescuer` ->
    `leave_after_marking_morning_warning`, reaching `good_ending` at 15/100
    with no objectives and `left_morning_warning` set.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-02T00-36-03-521Z.md`.
  - Evidence-cycle health checks passed, including random and coverage
    playtests.
  - Evidence-cycle random play ended all 100 runs, visited all 106 scenes,
    reached `morning_warning_mark`, and had zero unfinished runs.
  - Evidence-cycle coverage visited all 106 scenes, had zero unfinished runs,
    best score 100/100, average score 99.7, and 724800 max-score runs.
  - Evidence-cycle MCP validation passed with 106 reachable scenes and no
    warnings.
  - Evidence-cycle MCP random play ended all 250 runs with zero unfinished
    runs, and MCP coverage also reached `morning_warning_mark`.
  - Evidence-cycle required MCP route still reached `true_ending` at 100/100,
    and the adaptive MCP route reached `passenger_lunch_tin_true_ending` at
    100/100.
- Playtest notes:
  - The new beat makes the map-only escape feel more intentional by naming the
    concrete rescue requirements: clock token, badge proof, fuse, and clearing
    Mara before the release.
  - The branch remains clearly non-ideal at 15/100 and does not grant true
    ending credit.
  - The warning-mark scene preserves recovery pressure because players can
    still pocket the map and return for the token or ledger instead of leaving.
  - No bugs or confusing objectives were found in the focused CLI route,
    focused tests, validation, or full health coverage.
- Follow-up:
  - Re-check whether safe-transfer routes remain clearly non-ideal but not
    punitive.
  - Consider improving report memory use before running non-summary coverage
    JSON on large graphs; one exploratory full-detail coverage command hit Node
    heap limits while stringifying hundreds of thousands of runs.
- Risks:
  - Adding recovery choices to a low-value route can accidentally make the
    branch feel like the preferred path if labels are too directive.

## Last Completed Cycle

- Date: 2026-06-02
- Status: Completed locally; ready for commit/push.
- Main objective: Add a Mara-oath variant to the opened-manifest handoff route.
- Why this matters: Core route health and true-ending discoverability are
  strong, so the best next improvement is story depth. The player can inspect
  Mara's torn thumbprint on the solo-Mara route, but the passenger-manifest
  handoff route currently cannot carry that oath forward into its own payoff.
- Tasks:
  - Add an optional opened-manifest thumbprint beat after Mara starts calling
    passenger names.
  - Route that beat to a distinct full-score ending from the third-car
    intercom.
  - Update score, playtest, AI-loop reporting, and focused route tests.
  - Run focused tests, validation, full health, and a real playable route.
- Evidence:
  - Added `mara_manifest_thumbprint`, an optional opened-manifest handoff beat
    where the player touches Mara's torn thumbprint after she starts calling
    the passenger doors.
  - Added `mara_manifest_thumbprint_intercom`, carrying that oath into the
    third car before the release.
  - Added `passenger_manifest_thumbprint_true_ending`, a full-score ending
    where Mara leaves with the passenger crowd instead of remaining behind the
    manifest.
  - Updated `src/score.ts`, `src/playtest.ts`, and `src/ai-loop.ts` so the new
    ending counts as a max-score ideal manifest ending.
  - Updated story-path, playtest, and AI-loop regression coverage for the new
    route and reporting bucket.
  - Focused route and reporting tests passed with 120 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 105 scenes,
    24 endings, all 105 reachable, and no warnings.
  - `npm run health` passed with formatting, TypeScript, 128 tests, validation,
    and coverage playtest.
  - Health coverage visited all 105 scenes, reached
    `passenger_manifest_thumbprint_true_ending` 4024 times, had zero unfinished
    runs, best score 100/100, average score 99.65, and 482880 max-score runs.
  - Targeted CLI play followed the new route through
    `touch_mara_manifest_thumbprint` ->
    `listen_to_mara_manifest_thumbprint_intercom` ->
    `pull_release_after_manifest_thumbprint_goodbye`, reaching
    `passenger_manifest_thumbprint_true_ending` at 100/100 with no objectives.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-02T00-18-21-237Z.md`.
  - Evidence-cycle health checks passed, including random and coverage
    playtests.
  - Evidence-cycle random play reached
    `passenger_manifest_thumbprint_true_ending` once in 100 runs, visited all
    105 scenes, and ended all runs.
  - Evidence-cycle MCP validation passed with 105 reachable scenes and no
    warnings.
  - Evidence-cycle MCP random play reached
    `passenger_manifest_thumbprint_true_ending` twice in 250 runs, and MCP
    coverage reached it 4024 times.
  - Evidence-cycle required MCP route still reached `true_ending` at 100/100,
    and the adaptive MCP route reached `passenger_lunch_tin_true_ending` at
    100/100.
- Playtest notes:
  - The new handoff beat reads as a meaningful echo of Mara's earlier solo
    thumbprint memory, but it now serves the passenger-manifest route.
  - The new ending makes Mara's oath resolve beside the crowd rather than
    behind the booth, strengthening the late-game emotional payoff without
    changing the core route.
  - Existing manifest handoff, answered handoff, and direct manifest releases
    remain reachable and distinct.
  - No bugs or confusing objectives were found in the focused CLI route, health
    coverage, or evidence-cycle MCP checks.
- Follow-up:
  - Core route metrics remain healthy; future work should improve report
    readability or deepen existing route identities rather than adding generic
    success endings.
- Risks:
  - The game has many ideal-ending variants; the new route must stay tied to a
    distinct player action and remain legible in reports.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Make the generic `passenger_helped_true_ending` more
  naturally discoverable during normal passenger play.
- Why this matters: The latest 100-run random evidence sample missed
  `passenger_helped_true_ending` even though coverage and MCP random could still
  reach it. The direct "help the passengers gather" choice was flowing into a
  lunch-tin-dominated beat, so normal play was more likely to read that path as
  the lunch-tin route than the broader gathered-passenger payoff.
- Tasks:
  - Add a broad gathered-passenger boarding beat for direct help choices.
  - Keep the lunch-tin setup and ending reachable through explicit lunch-tin
    choices.
  - Update route regression tests for the split.
  - Run focused tests, validation, random play, full health, a real CLI
    playthrough, and the evidence cycle.
- Evidence:
  - Added `passenger_gathered_boarding`, a broad boarding scene where the
    passengers look after one another before the release.
  - Routed `gather_answered_passengers` and `help_passengers_gather` to
    `passenger_gathered_boarding`, with direct release to
    `passenger_helped_true_ending` and optional listening into
    `passenger_gathered_intercom`.
  - Routed the explicit `let_lunch_tin_worker_keep_count` choice through
    `passenger_farewell`, preserving the lunch-tin setup before
    `passenger_lunch_tin_boarding`.
  - Updated story-path regression coverage for direct helped gathering, the
    broader gathered intercom, final roll call, and explicit lunch-tin pacing.
  - Focused `npm test -- tests/story-paths.test.ts` passed with 106 tests.
  - Validation reports 102 scenes, 23 endings, all 102 reachable, and no
    warnings.
  - Random CLI play over 250 runs reached `passenger_helped_true_ending` 12
    times, visited all 102 scenes, ended all 250 runs, and had zero unfinished
    runs.
  - Targeted CLI play followed `listen_to_passenger_answers` ->
    `gather_answered_passengers` -> `pull_release_after_gathered_boarding`,
    reaching `passenger_helped_true_ending` at 100/100 with no objectives.
  - `npm run health` passed with formatting, TypeScript, 127 tests, story
    validation, and coverage playtest.
  - Health coverage visited all 102 scenes, reached
    `passenger_helped_true_ending` 40240 times, had zero unfinished runs, best
    score 100/100, average score 99.49, and 325944 max-score runs.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-02T00-04-07-583Z.md`.
  - Evidence-cycle health checks passed, including random and coverage
    playtests.
  - Evidence-cycle random play reached `passenger_helped_true_ending` 4 times
    in 100 runs, visited all 102 scenes, and ended all runs.
  - Evidence-cycle MCP validation passed with 102 reachable scenes and no
    warnings.
  - Evidence-cycle MCP random play reached `passenger_helped_true_ending` 12
    times in 250 runs, and MCP coverage reached it 40240 times.
  - Evidence-cycle required MCP route still reached `true_ending` at 100/100,
    and the adaptive MCP route reached `passenger_lunch_tin_true_ending` at
    100/100 through the preserved `passenger_farewell` beat.
- Playtest notes:
  - The direct help choice now reads as a broad crowd-care route instead of a
    lunch-tin route in disguise.
  - The revised route reaches the helped ending cleanly without requiring a
    late train-car choice list.
  - The explicit lunch-tin choice still provides its setup beat and distinct
    lunch-tin ending.
  - No gameplay bugs were found after fixing the temporary unreachable
    `passenger_farewell` warning.
- Follow-up:
  - Core route metrics are healthy; favor meaningful new scenes, stronger
    character beats, or pacing improvements over another clue-only polish pass.
  - Keep future passenger variants tied to explicit route identity so generic
    helped, roll-call, lunch-tin, keepsake, mitten, and conductor payoffs remain
    legible.
- Risks:
  - The game has many ideal-ending variants; reporting must stay readable as
    route-specific payoffs grow.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the direct answered-passenger boarding route its own
  final true-ending payoff.
- Why this matters: Core guidance and true-ending discoverability are healthy,
  so the useful next improvement is route-specific story depth. The route where
  the player listens to passengers answer roll call, boards while those answers
  hold, and immediately pulls the release had bespoke buildup but resolved into
  the generic passenger ending. A distinct ending makes that direct action feel
  remembered while preserving the existing extra-listen intercom variant.
- Tasks:
  - Add `passenger_answered_boarding_true_ending`.
  - Route `pull_release_after_answered_boarding` to that ending.
  - Count the new ending as full-score and ideal in score, playtest, and loop
    evidence helpers.
  - Update focused and integrated regression coverage for the answered
    boarding route.
  - Run full health and a targeted real playthrough.
- Evidence:
  - Added `passenger_answered_boarding_true_ending` as a distinct terminal
    payoff for pulling the release directly from `passenger_answered_boarding`.
  - Left `passenger_answered_intercom` routed to
    `passenger_answered_true_ending`, preserving the deeper listen-once-more
    variant.
  - Updated `src/score.ts`, `src/playtest.ts`, and `src/ai-loop.ts` so the new
    ending counts as a full-score ideal passenger ending.
  - Updated story-path, playtest, and AI-loop regression coverage.
  - `npm test` passes with 124 tests.
  - `npm run health` passed with formatting, TypeScript, 124 tests, story
    validation, and coverage playtest.
  - `npm run cyoa -- validate stories/demo.yaml --json` reports 96 scenes, 18
    endings, all 96 reachable, and no warnings.
  - Health coverage visited all 96 scenes, including
    `passenger_answered_boarding_true_ending`, with zero unfinished runs, best
    score 100/100, average score 99.51, and 342040 max-score runs.
  - Targeted CLI play followed `listen_to_passenger_answers` ->
    `board_after_answered_passengers` -> `pull_release_after_answered_boarding`
    and reached `passenger_answered_boarding_true_ending` at 100/100 with no
    objectives.
- Playtest notes:
  - The direct release now pays off the passenger self-naming motif without
    requiring the extra intercom listen.
  - The listened branch still reaches `passenger_answered_true_ending`, so the
    optional intercom beat remains meaningful.
  - Coverage play reached the new ending without harming full scene
    reachability, ending completion, or average score.
- Follow-up:
  - Watch whether passenger ending variants remain legible in reports; future
    content should keep variants tied to distinct player actions.
- Risks:
  - The game now has many ideal-ending variants, so future additions should
    avoid generic success endings and keep names/reporting readable.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the echoed-manifest route its own final true-ending
  payoff.
- Why this matters: Core guidance and true-ending discoverability are healthy,
  so the next useful improvement is route-specific story depth. The route where
  the player listens to the stamped passenger doors, boards with those echoes,
  and listens again in the third car already has bespoke buildup but resolved
  into the generic passenger ending. A distinct ending makes that careful
  listening feel remembered without changing core progression or guidance.
- Tasks:
  - Add `passenger_echoed_true_ending`.
  - Route `passenger_echoed_manifest_intercom` to that ending.
  - Count the new ending as full-score and ideal in score, playtest, and loop
    evidence helpers.
  - Update regression coverage for the echoed-manifest route.
  - Run focused tests, full health, and a targeted real playthrough.
- Evidence:
  - Added `passenger_echoed_true_ending` as a distinct terminal payoff for the
    route that listens to the stamped passenger doors, boards with those
    echoes, listens to the opened doors answer from the third car, and then
    pulls the emergency release.
  - Routed `passenger_echoed_manifest_intercom` to the new ending while leaving
    the direct manifest release on the generic `passenger_true_ending`.
  - Updated `src/score.ts`, `src/playtest.ts`, and `src/ai-loop.ts` so the new
    ending counts as a full-score ideal passenger ending.
  - Updated story-path, playtest, and AI-loop regression coverage.
  - Focused tests passed with 116 tests.
  - `npm run health` passed with formatting, TypeScript, 124 tests, story
    validation, and coverage playtest.
  - Health validation reports 95 scenes, 17 endings, all 95 reachable, and no
    warnings.
  - Health coverage visited all 95 scenes, including
    `passenger_echoed_true_ending`, with zero unfinished runs, best score
    100/100, average score 99.51, and 338016 max-score runs.
  - Targeted CLI play followed `listen_to_manifest_doors_from_manifest` ->
    `board_with_echoed_manifest` -> `listen_to_echoed_manifest_intercom` ->
    `pull_release_after_echoed_manifest_goodbye` and reached
    `passenger_echoed_true_ending` at 100/100 with no objectives.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T23-11-05-799Z.md`. Its health checks were
    green, MCP validation passed with 95 reachable scenes and no warnings, MCP
    random and coverage playtests reached `passenger_echoed_true_ending`, the
    required MCP route reached `true_ending` at 100/100, and the adaptive MCP
    route reached `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new ending makes the early door-listening beat feel remembered all the
    way through the release: the same small sounds move from trapped evidence
    to proof that the passengers are leaving.
  - The direct manifest release remains generic, so the variant is tied to the
    deliberate choice to listen before and after boarding.
  - Coverage play reached the new ending without harming full scene reachability
    or the existing high-score route distribution.
  - MCP random play reached the new ending four times in 250 runs; the
    evidence-only random sample held the prior 75% ideal-ending rate.
- Follow-up:
  - Watch whether the growing set of passenger ending variants remains legible
    in reports; future content should keep variants tied to distinct player
    actions.
- Risks:
  - The game now has many endings, so future additions should favor clarity and
    route identity over adding more generic success variants.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the answered-passenger Mara handoff route its own final
  true-ending payoff.
- Why this matters: The route where Mara opens the manifest, passengers answer
  her roll call, and the player listens to the handoff in the third car already
  had bespoke buildup but resolved into the generic passenger ending. A distinct
  ending makes the player's late-game listening choice feel remembered without
  changing core progression or guidance.
- Tasks:
  - Add `passenger_answered_handoff_true_ending`.
  - Route `passenger_answered_handoff_intercom` to that ending.
  - Count the new ending as full-score and ideal in score, playtest, and loop
    evidence helpers.
  - Update regression coverage for the answered handoff route.
  - Run focused tests, full health, a targeted CLI playthrough, and the
    evidence-only AI cycle.
- Evidence:
  - Added `passenger_answered_handoff_true_ending` as a distinct terminal payoff
    for the route that watches Mara open the manifest, keeps listening as the
    passengers answer, boards through the handoff roll call, and listens to the
    handoff intercom before pulling the release.
  - Updated `src/score.ts`, `src/playtest.ts`, and `src/ai-loop.ts` so the new
    ending counts as a full-score ideal passenger ending.
  - Updated story-path, playtest, and AI-loop regression coverage.
  - Focused tests passed with 116 tests.
  - `npm run health` passed with formatting, TypeScript, 124 tests, story
    validation, and coverage playtest.
  - Health validation reports 94 scenes, 16 endings, all 94 reachable, and no
    warnings.
  - Health coverage visited all 94 scenes, including
    `passenger_answered_handoff_true_ending`, with zero unfinished runs, best
    score 100/100, average score 99.51, and 338016 max-score runs.
  - Targeted CLI play followed `watch_mara_open_manifest` ->
    `continue_manifest_handoff_roll_call` -> `board_after_passenger_answers` ->
    `listen_to_answered_handoff_after_roll_call` ->
    `pull_release_after_answered_handoff_intercom` and reached
    `passenger_answered_handoff_true_ending` at 100/100 with no objectives.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T23-02-54-091Z.md`. Its health checks were
    green, MCP validation passed with 94 reachable scenes and no warnings, MCP
    random and coverage playtests reached `passenger_answered_handoff_true_ending`,
    the required MCP route reached `true_ending` at 100/100, and the adaptive
    MCP route reached `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new ending cleanly pays off the handoff theme: Mara begins the roll
    call, but the passengers finish it for her and she is no longer carrying the
    manifest alone.
  - Random play reached the new ending twice in 100 runs, replacing two generic
    `passenger_true_ending` results without changing the overall ideal-ending
    rate.
  - The primary true-ending MCP route still plays cleanly to 100/100.
- Follow-up:
  - Watch whether the growing set of passenger ending variants remains legible
    in reports; future content should keep variants tied to distinct player
    actions.
- Risks:
  - The game now has 16 endings, so future additions should favor clarity and
    route identity over adding more generic success variants.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the reviewed-manifest count route its own final ending
  payoff after the player listens to the counted manifest in the third car.
- Why this matters: Core guidance and true-ending discoverability are healthy,
  so the best current value is route-specific story depth. Reviewing the
  opened manifest count is a deliberate late-game action with a bespoke
  intercom, but it previously resolved into the generic passenger ending.
  A distinct counted ending makes that review feel remembered without changing
  the core route.
- Tasks:
  - Add `passenger_counted_true_ending`.
  - Route `passenger_counted_manifest_intercom` to the new ending.
  - Count the new ending as full-score and ideal in score, playtest, and loop
    evidence helpers.
  - Update regression coverage for the counted-manifest final route.
  - Run focused tests, full health, and a real playthrough through the new
    ending.
- Evidence:
  - Added `passenger_counted_true_ending` as a distinct terminal payoff for
    the route that reviews the opened manifest count, boards from that count,
    and listens to the counted-manifest intercom.
  - Routed `passenger_counted_manifest_intercom` to the new ending while
    leaving the direct reviewed-count release on `passenger_true_ending`.
  - Updated `src/score.ts`, `src/playtest.ts`, and `src/ai-loop.ts` so the new
    ending counts as a full-score ideal passenger ending.
  - Updated story-path, playtest, and AI-loop regression coverage.
  - Focused tests passed with 116 tests.
  - Targeted CLI play followed `review_open_manifest_count` ->
    `board_after_manifest_count` -> `listen_to_counted_manifest_intercom` ->
    `pull_release_after_counted_manifest_goodbye` and reached
    `passenger_counted_true_ending` at 100/100 with no objectives.
  - `npm run health` passed with formatting, TypeScript, 124 tests, story
    validation, and coverage playtest.
  - Health validation reports 92 scenes, 14 endings, all 92 reachable, and no
    warnings.
  - Health coverage visited all 92 scenes, including
    `passenger_counted_true_ending`, with zero unfinished runs, best score
    100/100, and average score 99.51.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T22-43-10-686Z.md`. Its health checks
    were green, MCP validation passed with 92 reachable scenes and no warnings,
    MCP random play visited `passenger_counted_true_ending`, the required MCP
    route reached `true_ending` at 100/100, and the adaptive MCP route reached
    `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new ending makes the reviewed-count choice feel consequential by
    turning the final count into passengers tracking one another instead of a
    ledger total.
  - The generic passenger ending remains available for direct manifest release
    and non-counted passenger routes.
  - Random and coverage playtests both reached the new ending while preserving
    the previous 75% random ideal-ending rate and full scene coverage.
- Follow-up:
  - Watch random distribution to make sure the new counted ending appears
    without crowding the simpler passenger ending.
- Risks:
  - The game already has many ideal-ending variants; keep this one tied to a
    clearly distinct player action rather than proliferating generic endings.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Make the HOME-sign lost route fairer by adding one final
  map-based recovery beat before the player loses their name.
- Why this matters: Random play still finds a small number of `lost_ending`
  routes after players have done useful setup and recovered the marked map. The
  sign trap already warns the player twice; adding a last recoverable grip beat
  keeps the bad ending available while making the map feel like an active
  survival tool instead of a binary earlier choice.
- Tasks:
  - Add a `home_sign_grip` scene between `home_sign_echo` and `lost_ending`.
  - Let players with the marked map recover to the safe morning ending from
    that final grip beat.
  - Preserve a deliberate final choice into `lost_ending`.
  - Update regression coverage for both the recovery and surrender branches.
  - Run focused tests, full health, and a real playthrough through the new
    branch.
- Evidence:
  - Added `home_sign_grip` between `home_sign_echo` and `lost_ending`.
  - Players with the marked map can now recover from the final HOME-sign grip
    directly to `good_ending`; players can still deliberately surrender to
    `lost_ending`.
  - Added regression coverage for the new grip scene, map recovery, and
    preserved lost-ending branch.
  - Focused story/playtest tests passed with 109 tests.
  - `npm run health` passed with formatting, TypeScript, 124 tests, story
    validation, and coverage playtest.
  - Health validation reports 88 scenes, 12 endings, and all 88 reachable.
  - Health coverage visited all 88 scenes, including `home_sign_grip`, with
    zero unfinished runs, best score 100/100, and average score 99.51.
  - Targeted CLI play followed `look_at_sign` -> `stare_at_home` ->
    `let_home_sign_finish` -> `wrench_map_free_from_home_sign` and reached
    `good_ending` with no objectives.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T22-02-01-408Z.md`. Its health checks
    were green, MCP validation passed with 88 reachable scenes and no warnings,
    MCP random play visited `home_sign_grip`, the required MCP route reached
    `true_ending` at 100/100, and the adaptive MCP route reached
    `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new grip scene makes the map feel physically useful against the HOME
    sign instead of only being a prior warning.
  - The safe recovery route ends immediately at `good_ending`, avoiding the
    long exploratory loop that appeared when recovery returned to
    `morning_transfer`.
  - The lost ending remains reachable, but now requires ignoring the warning,
    ignoring the echo, and surrendering at the final grip.
- Follow-up:
  - Watch random lost-ending pressure over future cycles; the evidence sample
    moved from 4% to 3%, but small random samples will vary.
- Risks:
  - Adding too many warnings can weaken the trap; keep this to a single final
    map payoff and preserve the deliberate lost choice.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed and committed as `7f8a4df`.
- Main objective: Add a tailored final intercom payoff for players who listen
  to the kept-passenger doors before opening the manifest.
- Why this matters: Core guidance and true-ending discoverability are healthy,
  so the next useful improvement is route-specific story depth. The
  `passenger_echoes` scene is evocative, but players who heard those door
  sounds previously collapsed into the generic manifest intercom if they boarded
  without further passenger-gathering. Carrying that memory into the third car
  makes careful manifest play feel acknowledged.
- Tasks:
  - Add a `passenger_echoed_manifest_intercom` scene after direct manifest
    boarding when `heard_passenger_echoes` is set.
  - Preserve the existing generic `mara_manifest_intercom` for players who read
    the manifest but skip the passenger-door listening beat.
  - Add regression coverage for the echoed-manifest route and full-score
    passenger ending.
  - Run full health and a real CLI/MCP route through the new branch.
- Evidence:
  - Added `passenger_echoed_manifest_intercom`, reached from `train_car` only
    when players have opened the kept-passenger manifest, listened to the
    stamped passenger doors, and boarded without moving into answered or
    gathered passenger branches.
  - Added `notFlag: heard_passenger_echoes` to the generic
    `mara_manifest_intercom` gate so both variants remain distinct.
  - Focused story-path tests passed with 103 tests.
  - `npm run health` passed with formatting, TypeScript, 124 tests, validation,
    and coverage playtest.
  - Health validation reports 87 scenes, 12 endings, and all 87 reachable.
  - Health coverage visited all 87 scenes, including
    `passenger_echoed_manifest_intercom`, with best score 100/100 and average
    score 99.58.
  - Targeted CLI play followed `listen_to_manifest_doors_from_manifest` ->
    `listen_to_echoed_manifest_intercom` ->
    `pull_release_after_echoed_manifest_goodbye` and reached
    `passenger_true_ending` at 100/100 with no objectives.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T21-50-02-748Z.md`. Its health checks
    were green, MCP validation passed with 87 reachable scenes and no warnings,
    250-run MCP random play visited `passenger_echoed_manifest_intercom`, the
    required MCP route reached `true_ending` at 100/100, and the adaptive MCP
    route reached `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new third-car beat clearly recalls the thermos, newspaper, and mitten
    sounds from `passenger_echoes`, making the optional listening beat feel
    remembered without changing the ending target.
  - The direct route still offers `pull_release_with_manifest` beside the new
    intercom, so players are not forced through an extra lore beat.
  - Automated evidence confirms the generic `mara_manifest_intercom` remains
    reachable and the new echoed variant is covered by random, coverage, and
    targeted CLI play.
- Follow-up:
  - Watch coverage and random samples to confirm both
    `passenger_echoed_manifest_intercom` and `mara_manifest_intercom` remain
    reachable.
- Risks:
  - The direct manifest route already has several optional payoffs; keep this
    branch limited to the specific passenger-door listening memory so it does
    not crowd stronger answered/gathered routes.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Make the badge-proof payoff easier to discover through normal
  locker play without making it mandatory.
- Why this matters: The previous cycle added a strong
  `mara_badge_proof_intercom`, but random play still rarely reaches it because
  `knows_badge_proof` mostly comes from the optional notice-back detour. The
  badge itself is a natural clue source, so reading its back should teach the
  same proof concept and remain available after gathering both locker supplies.
- Tasks:
  - Let `badge_memory` set `knows_badge_proof` in addition to `knows_release`.
  - Keep `inspect_badge_back` available after taking both the fuse and badge.
  - Update regression coverage for the expanded badge-memory clue.
  - Run focused tests, full health, and a real CLI/MCP route through the
    badge-memory proof branch.
- Evidence:
  - Updated `badge_memory` so reading the badge back now sets
    `knows_badge_proof` as well as `knows_release`.
  - Removed the `notItem: fuse` gate from `inspect_badge_back`, keeping the
    optional clue available after players collect both locker supplies.
  - Revised the proof-aware Mara intercom wording from notice-specific to
    source-neutral, so it works whether the clue came from the notice backing
    or the badge back.
  - Focused story-path tests passed with 102 tests.
  - `npm run health` passed with formatting, TypeScript, 123 tests,
    validation, and coverage playtest.
  - Health coverage visited all 86 scenes, including both
    `mara_badge_proof_intercom` and the generic `mara_intercom`, with best
    score 100/100 and average score 99.58.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T21-37-31-202Z.md`. Its health checks
    were green, MCP validation passed with 86 reachable scenes and no warnings,
    250-run MCP random play visited `mara_badge_proof_intercom` and
    `mara_intercom`, the required MCP route reached `true_ending` at 100/100,
    and the adaptive MCP route reached `passenger_helped_true_ending` at
    100/100.
  - Targeted CLI play followed `inspect_badge_back` ->
    `listen_to_badge_proof_intercom` ->
    `pull_release_after_badge_proof_goodbye` and reached `true_ending` at
    100/100 with no objectives.
- Playtest notes:
  - The locker now offers `inspect_badge_back` after both badge and fuse are
    collected, which feels better than hiding a story clue because the player
    took supplies in the practical order.
  - The final badge-proof intercom now reads correctly for both clue sources.
  - Random MCP sampling now reaches `mara_badge_proof_intercom` while preserving
    the generic Mara intercom, so the proof branch became more discoverable
    without becoming mandatory.
- Follow-up:
  - Watch random samples to see whether `mara_badge_proof_intercom` appears
    more often while the generic Mara intercom remains reachable.
- Risks:
  - If every normal route reads the badge back, the generic Mara goodbye could
    become too rare; keep the proof branch optional.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a direct answered-passenger boarding beat before the
  manifest-passenger intercom/release.
- Why this matters: Core route health is strong and all scenes are reachable,
  so the next useful improvement is route-specific story depth. The direct
  answered-passenger path currently benefits from the roll-call scene, but
  boarding drops into the generic third-car text before the passenger intercom.
  A short boarding beat can carry the child's answer, newspaper stop, and
  conductor count directly into the release choice.
- Tasks:
  - Add `passenger_answered_boarding` after direct boarding from
    `passenger_answers`.
  - Preserve the existing `passenger_answered_intercom` continuation and add a
    direct release option from the new scene.
  - Add regression coverage for the intercom continuation and direct release.
  - Run focused tests, validation, playtest sampling, full health, an
    evidence-gathering cycle, and a real CLI/MCP playthrough.
- Evidence:
  - Added `passenger_answered_boarding`, reached from direct
    `board_after_answered_passengers`.
  - The new scene can continue through the existing
    `passenger_answered_intercom` via
    `listen_to_answered_passengers_from_boarding`, or release directly through
    `pull_release_after_answered_boarding`.
  - Focused story-path tests passed with 98 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 82
    reachable scenes and 12 endings.
  - `npm run health` passed with formatting, TypeScript, 119 tests,
    validation, and 100-run coverage playtest. Coverage visited all 82 scenes,
    including `passenger_answered_boarding`, kept best score 100/100, and
    averaged 99.58.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T20-39-49-645Z.md`. Its 100-run random
    and coverage samples both visited `passenger_answered_boarding`, had no
    unvisited scenes, kept best score 100/100, and averaged 78.25 random /
    99.58 coverage.
  - Evidence-cycle MCP validation passed with 82 reachable scenes and no
    warnings. Its required MCP playthrough reached `true_ending` at 100/100,
    and its adaptive exploratory route reached `passenger_true_ending` at
    100/100.
  - Manual CLI play followed `listen_to_passenger_answers` ->
    `board_after_answered_passengers` ->
    `listen_to_answered_passengers_from_boarding` ->
    `pull_release_after_answered_intercom` and reached
    `passenger_true_ending` at 100/100 with no objectives.
- Playtest notes:
  - The direct answered-passenger route now keeps the child, newspaper woman,
    and conductor in focus between the roll call and the final intercom.
  - Automated evidence shows the new scene is reachable in normal random play
    and does not create unfinished routes.
  - Manual play felt coherent: the new boarding beat carried naturally into
    the existing answered-passenger intercom, then resolved at the passenger
    manifest ending with full score.
- Follow-up:
  - Watch whether the direct answered-passenger route now feels distinct enough
    from the handoff-specific answered route.
- Risks:
  - Late passenger routes are already dense; keep the new beat route-specific
    and avoid increasing the shared train-car choice list.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the generic helped-passenger route a clearer lunch-tin
  worker payoff before the shared helped ending.
- Why this matters: The main and passenger true-ending routes are already
  healthy. The remaining generic helped-passenger path begins with the warm
  lunch tin, but its late train-car beat previously broadened out immediately.
  Carrying that worker into the final intercom makes the route feel less like a
  fallback and more like a character-specific payoff.
- Tasks:
  - Add a `passenger_lunch_tin_intercom` scene after `passenger_farewell`.
  - Preserve the older `passenger_gathered_intercom` through an alternate
    boarding choice so existing route texture remains reachable.
  - Update `passenger_helped_true_ending` to acknowledge the lunch-tin worker.
  - Add regression coverage for the new tailored path and the preserved generic
    gathered-passenger path.
  - Run focused tests, full health, evidence-only `ai:cycle`, and a real CLI
    playthrough through the lunch-tin branch.
- Evidence:
  - Added `passenger_lunch_tin_intercom`, reached after
    `return_from_passenger_farewell`, where the lunch-tin latch sets the final
    boarding rhythm before the release.
  - Added `steadied_lunch_tin_worker` to distinguish the tailored route from
    the broader gathered-passenger route.
  - Added `lead_gathered_passengers_without_lunch_tin_pace` so
    `passenger_gathered_intercom` remains reachable and intentionally tested.
  - Focused story-path tests pass with 95 tests, including direct coverage for
    the new lunch-tin intercom route and the preserved generic gathered route.
  - `npm run health` passed with formatting, TypeScript, 116 tests,
    validation, and coverage playtest.
  - Validation reports 77 scenes, 12 endings, and all 77 reachable.
  - Coverage playtest visited all 77 scenes, including
    `passenger_lunch_tin_intercom`, with best score 100/100 and average score
    99.57.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T18-57-33-801Z.md`; its 100-run random
    sample ended every run, kept best score 100/100, averaged 78.25, and missed
    `passenger_lunch_tin_intercom` in that small random sample while coverage
    reached it.
  - Manual CLI play followed `help_passengers_gather` ->
    `return_from_passenger_farewell` -> `listen_to_lunch_tin_worker` ->
    `hear_final_lunch_tin_roll_call` -> `pull_release_after_final_roll_call`
    and reached `passenger_helped_true_ending` at 100/100 with no objectives.
- Playtest notes:
  - The lunch-tin worker now carries through from `passenger_farewell` into the
    third car and final ending, making the helped-passenger path feel less like
    a generic fallback.
  - The optional final roll call still lands cleanly after the new intercom.
  - The alternate "aboard together" choice preserves the broader gathered
    intercom, but its label should be watched for redundancy in future route
    playtests.
- Follow-up: After evidence, check whether the extra boarding choice in
  `passenger_farewell` feels meaningfully different or should be relabeled.
- Risks:
  - Adding a parallel boarding choice could feel slightly redundant if the
    labels do not clearly distinguish lunch-tin pacing from the broader crowd
    route.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a tailored final intercom payoff when players both read
  Mara's torn thumbprint and watch her leave the signal booth.
- Why this matters: Current validation, coverage, and normal-play guidance are
  healthy, so the best next value is richer story depth on an already
  discoverable route. The thumbprint memory and handoff scene are both strong
  Mara beats, but taking both previously collapsed into the generic handoff
  intercom instead of acknowledging that combined context.
- Tasks:
  - Add a `mara_thumbprint_handoff_intercom` scene from the third car.
  - Gate the new choice on `read_mara_thumbprint` plus `saw_mara_handoff` and
    preserve the generic handoff intercom for players who skipped the
    thumbprint.
  - Add story-path regression coverage for the combined route and full-score
    ending.
  - Run focused tests, full health, and a real CLI playthrough through the new
    branch.
- Evidence:
  - Added `mara_thumbprint_handoff_intercom`, reached from the third car only
    when players have both read Mara's torn thumbprint and watched her leave
    the signal booth.
  - Preserved the generic `mara_handoff_intercom` for handoff routes that skip
    the thumbprint and preserved the direct release from `train_car`.
  - Focused story-path test suite passes with 94 tests.
  - `npm run health` passes with formatting, TypeScript, 115 tests,
    validation, and coverage playtest.
  - Validation reports 75 scenes, 11 endings, and all 75 reachable.
  - Coverage playtest visited all 75 scenes, including
    `mara_thumbprint_handoff_intercom`, with 0 unfinished completed routes,
    best score 100/100, and average score 99.49.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    report `ai-runs/cycle-2026-06-01T18-40-07-966Z.md`; its 100-run random
    sample also visited `mara_thumbprint_handoff_intercom`, ended every run,
    kept best score 100/100, and averaged 78.25.
  - The evidence cycle's MCP validation passed with 75 reachable scenes, and
    its required MCP route reached `true_ending` at 100/100.
  - Manual CLI play followed `inspect_mara_thumbprint` ->
    `watch_mara_leave_booth` -> `listen_to_mara_thumbprint_after_handoff` and
    reached `mara_handoff_true_ending` at 100/100 with no objectives.
- Playtest notes:
  - The new scene makes the thumbprint feel like more than a clue; it becomes a
    witness mark Mara carries out of the booth.
  - The train-car choice list remains compact on the combined route:
    tailored intercom plus direct release.
  - The ending can reuse `mara_handoff_true_ending` cleanly because the new
    intercom supplies the specific thumbprint payoff before the shared release.
- Follow-up: Recheck whether random coverage reaches the new optional scene
  often enough or if it remains a deep route for exploratory players.
- Risks:
  - Adding another optional intercom increases story graph surface area; keep it
    on the existing Mara-only handoff ending rather than adding another ending
    family.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Give the returned-mitten passenger route a distinct final
  intercom payoff.
- Why this matters: The passenger routes are healthy, so the best current value
  is richer story depth. Returning the mitten already creates one of the most
  human passenger endings, but the late route previously used the generic
  gathered-passenger intercom before the mitten-specific ending. A distinct
  intercom makes the child's agency clearer and keeps the payoff coherent.
- Tasks:
  - Add a `passenger_mitten_intercom` scene after players return the lost
    mitten and board the third car.
  - Route returned-mitten train-car listening to the new mitten-specific
    intercom while preserving the generic gathered-passenger intercom for
    non-mitten gathered routes.
  - Preserve the direct returned-mitten release and optional final roll-call
    path.
  - Add regression coverage for the new scene, choice visibility, flags, and
    ending path.
  - Run focused tests, validation/playtest sampling, full health,
    evidence-only `ai:cycle`, and a real CLI playthrough through the revised
    mitten route.
- Evidence:
  - Added `passenger_mitten_intercom`, reached from
    `listen_to_mitten_child_intercom` when `returned_lost_mitten` is set.
  - Added `hear_final_mitten_roll_call` so players can continue into the
    existing final roll-call epilogue before the mitten ending, plus
    `pull_release_after_mitten_child_intercom` for a direct release.
  - Added `notFlag: returned_lost_mitten` to the generic
    `listen_to_gathered_passengers` route so returned-mitten players see the
    tailored intercom instead of the generic one.
  - Added story-path regression coverage for direct returned-mitten release,
    the new mitten intercom, and the final roll-call continuation; focused
    story-path tests passed with 93 tests.
  - Increased the demo coverage-strategy regression timeout from 20s to 40s
    after the larger graph exposed runtime variance while still discovering all
    scenes.
  - Validation reports 74 scenes, 11 endings, and all 74 reachable.
  - A 250-run random sample ended every run, visited
    `passenger_mitten_intercom`, visited all scenes, kept best score 100/100,
    averaged 79.94, and reached max score in 183 runs.
  - `npm run health` passed with formatting, TypeScript, 114 tests,
    validation, and coverage playtest. Coverage visited all 74 scenes with 0
    unfinished completed routes, best score 100/100, average score 99.52, and
    297776 max-score runs.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` completed and wrote ignored
    `ai-runs/cycle-2026-06-01T18-14-02-400Z.md`; its 100-run random sample
    missed `passenger_mitten_intercom`, while coverage reached every scene.
  - Manual CLI play followed `return_lost_mitten` ->
    `lead_mitten_child_to_third_car` -> `listen_to_mitten_child_intercom` ->
    `hear_final_mitten_roll_call` -> `passenger_mitten_true_ending` at 100/100
    with no objectives.
- Playtest notes:
  - The new intercom makes the child feel like an active participant instead of
    a prop carried into the ending.
  - The direct mitten ending remains available for players who do not stop for
    the intercom.
  - The optional final roll-call continuation still lands cleanly in the
    existing `passenger_roll_call_epilogue` and preserves the
    `passenger_mitten_true_ending` payoff.
  - A 100-run random sample can miss the new scene; the 250-run sample is a
    better signal for normal route visibility.
- Follow-up: Watch whether smaller random samples continue to miss
  `passenger_mitten_intercom`; if so, consider surfacing the mitten child from
  `passenger_answers` the way the newspaper and conductor routes are surfaced.
- Risks:
  - Another specialized late-game intercom increases route richness but also
    adds one more branch for future ending maintenance.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Improve normal-play discovery of `passenger_farewell`.
- Why this matters: Coverage could reach `passenger_farewell`, but the current
  random sample missed it. The scene is a strong passenger-humanity beat, so it
  should be visible from the natural moment when players listen to the opened
  manifest roll call.
- Tasks:
  - Add a direct helped-passenger route from `passenger_answers` to
    `passenger_farewell`.
  - Preserve the existing newspaper, passenger-platform, and direct manifest
    release choices from `passenger_answers`.
  - Add regression coverage for the new route, flags, and downstream train-car
    choices.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI playthrough through the updated farewell route.
- Evidence:
  - Added `gather_answered_passengers`, reached from `passenger_answers`, which
    sets `helped_passengers_gather` and routes to `passenger_farewell`.
  - Kept `follow_newspaper_answer`, `return_from_passenger_answers`, and
    `board_after_passenger_answers` available, so direct generic and specialized
    passenger endings remain playable.
  - Added a story-path regression test for `gather_answered_passengers` through
    `passenger_farewell` into the gathered-passenger train-car choices.
  - Focused story-path tests passed: 90 tests.
  - Validation reports 72 scenes, 11 endings, and all 72 reachable.
  - A 250-run random sample ended every run, visited every scene including
    `passenger_farewell`, kept best score 100/100, averaged 79.94, and reached
    max score in 183 runs.
  - Coverage playtest visited all 72 scenes with 0 unfinished completed routes,
    best score 100/100, average score 99.07, and 152912 max-score runs.
  - Manual CLI play followed `listen_to_passenger_answers` ->
    `gather_answered_passengers` -> `passenger_farewell` ->
    `passenger_gathered_intercom` -> `passenger_roll_call_epilogue` and reached
    `passenger_helped_true_ending` at 100/100 with no objectives.
  - `npm run health` passed with formatting, TypeScript, 111 tests,
    validation, and coverage playtest.
  - `npm run ai:cycle` was started as required, wrote ignored `ai-runs/` files,
    then recursively launched nested Codex/`ai:cycle` work. The nested process
    was stopped to avoid runaway agents; an unrelated conductor shortcut it
    briefly added was removed from tracked files.
- Playtest notes:
  - The new choice appears exactly when the player has heard the passengers
    answer, which makes the farewell feel like a natural response instead of a
    side action hidden one scene later.
  - The route reads cleanly into the existing gathered-passenger intercom and
    final roll call.
  - Direct boarding from `passenger_answers` still reaches the generic
    passenger true ending for players who do not stop to gather the crowd.
- Follow-up: Watch whether the extra `passenger_answers` choice dilutes
  newspaper-route selection in smaller random samples; the 250-run sample still
  reached `passenger_newspaper_true_ending` 17 times.
- Risks:
  - `passenger_answers` now has four choices, which improves farewell
    visibility but slightly increases late-game choice density.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Preserve the newspaper passenger payoff after players learn
  the Warden Street transfer-column memory.
- Why this matters: The newspaper-specific route is discoverable, but normal
  players can still choose the neutral boarding option immediately after the
  memory and lose the bespoke newspaper intercom/ending path. A learned
  character clue should keep shaping the final route.
- Tasks:
  - Route `board_after_newspaper_memory` through the newspaper transfer-column
    intercom instead of the generic train car.
  - Set the same gathered-passenger flags as the explicit transfer-column help
    choice so the resulting state is coherent.
  - Update regression coverage for the revised label, route, and flags.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI or MCP playthrough through the updated newspaper route.
- Evidence:
  - `board_after_newspaper_memory` now routes to
    `passenger_newspaper_intercom` and sets `helped_passengers_gather` plus
    `heard_gathered_passengers`.
  - The choice label now says "Board the third car by the transfer column,"
    making the newspaper clue feel like the route forward.
  - Focused story-path tests passed: 88 tests.
  - Validation reports 72 scenes, 11 endings, and all 72 reachable.
  - A default 250-run random sample visited every scene, reached
    `passenger_newspaper_true_ending` 17 times, kept best score 100/100, and
    had one default 50-step unfinished run.
  - The same 250-run random sample with the loop-style 80-step budget ended
    every run, visited every scene, and reached
    `passenger_newspaper_true_ending` 17 times.
  - Coverage playtest visited all 72 scenes with 0 unfinished completed routes,
    best score 100/100, average score 99.07, and 152912 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 109 tests,
    validation, and coverage playtest.
  - Manual CLI play followed `ask_newspaper_woman_about_stop` ->
    `board_after_newspaper_memory` -> `passenger_newspaper_intercom` ->
    `passenger_newspaper_roll_call` -> `passenger_newspaper_true_ending` at
    100/100 with no objectives.
- Playtest notes:
  - The revised board label reads naturally after the memory scene because the
    transfer column is already the active clue.
  - Boarding through the newspaper intercom makes the route feel continuous:
    memory, timetable, final roll call, then release.
  - The generic train-car ending remains available from `passenger_answers` and
    from `passenger_platform`, so players who do not pursue the newspaper woman
    are not forced into the specialized branch.
- Follow-up: Compare random newspaper-ending frequency against the prior
  250-run sample, where `passenger_newspaper_true_ending` appeared 4 times in
  MCP random play and 5 times in a focused 250-run sample.
- Risks:
  - Routing the neutral-looking board choice through the newspaper intercom
    slightly reduces generic train-car fallback after the memory; keep the
    direct generic boarding path available from `passenger_answers` and
    `passenger_platform`.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Improve normal-play discovery of the newspaper passenger
  route after players listen to the opened manifest answer roll call.
- Why this matters: The newspaper-specific ending is now coherent once found,
  but random evidence still shows it is comparatively rare. Players who listen
  to passenger answers should be able to follow the newspaper woman's named
  stop directly instead of needing to backtrack to the platform first.
- Tasks:
  - Add a newspaper-woman cue to `passenger_answers`.
  - Add a direct optional choice from `passenger_answers` to
    `passenger_newspaper_memory` without removing the return or board choices.
  - Update regression coverage for the new choice, flag, and preserved board
    route.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI or MCP playthrough through the updated route.
- Evidence:
  - Added `follow_newspaper_answer`, reached from `passenger_answers` when the
    player follows the newspaper woman's Warden Street answer.
  - The new route sets `heard_newspaper_memory` and lands in
    `passenger_newspaper_memory`, preserving the existing newspaper sequence
    from memory to transfer-column intercom to roll call and ending.
  - The existing `return_from_passenger_answers` and
    `board_after_passenger_answers` routes remain available and covered.
  - Focused story-path tests passed: 88 tests.
  - Validation reports 72 scenes, 11 endings, and all 72 reachable.
  - A 250-run random sample ended every run, visited every scene, reached
    `passenger_newspaper_true_ending` 5 times, and kept best score 100/100.
  - Manual CLI play followed `listen_to_passenger_answers` ->
    `follow_newspaper_answer` -> `passenger_newspaper_true_ending` at 100/100
    with no objectives.
- Playtest notes:
  - The added answer makes the newspaper route visible at the moment players
    are already listening for individual passenger details.
  - The path reads naturally because the answer names Warden Street before the
    memory expands it into the morning-transfer route.
  - Direct boarding after passenger answers still reaches the generic
    passenger true ending, so the new cue does not force extra exploration.
- Follow-up: Recheck random-play distribution over a larger sample to confirm
  the added choice improves normal newspaper-ending discovery without
  suppressing other passenger endings too much.
- Risks:
  - Adding another late-game choice may slightly dilute direct boarding odds;
    watch random ending distribution in the next cycle.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Strengthen the recovery guidance after the player listens
  beneath the forced gate.
- Why this matters: The exploratory MCP route showed the forced-gate branch is
  doing its job as a bad-ending pressure point. The cautious branch after the
  deeper warning should feel like the player learned something actionable, not
  like a simple reset to the service room.
- Tasks:
  - Revise the `gate_echo` warning so the cautious branch names the four
    practical answers: fuse, badge, map, and token.
  - Keep the immediate bad ending available for players who ignore both
    warnings.
  - Add regression coverage for the recovery text, choice label, flagging, and
    return to the service-room objective loop.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI or MCP playthrough through the updated route.
- Evidence:
  - Revised `gate_echo` so the deeper warning names the practical recovery
    path: fuse for light, badge for proof, map for the route, and token for the
    booth.
  - Renamed the cautious recovery choice and kept `force_gate_after_echo`
    available for the bad ending.
  - Added regression coverage for the new text, choice label, flagging, return
    to the service-room objective loop, and unchanged bad-ending route.
  - Focused story-path tests passed with 87 tests.
  - Validation passed with 68 scenes, 10 endings, and all 68 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 68 scenes, had no
    unvisited scenes, kept best score 100/100, averaged 78.2, and reached max
    score in 72 runs.
  - A 100-run coverage sample visited all 68 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.69, and 109800 max-score
    runs.
  - `npm run health` passed with formatting, TypeScript, 108 tests,
    validation, and coverage playtest.
  - Manual CLI play forced the gate, listened below, backed away using the
    revised clue, gathered the four answers, and reached `true_ending` at
    100/100 with no objectives.
- Playtest notes:
  - The revised gate echo turns the scary optional listen into useful player
    knowledge without adding another scene or increasing route depth.
  - The route exposed one natural point of uncertainty: after backing away, the
    direct service-room clock shortcut is unavailable unless the player has
    learned the token clue, but the tunnel clock remains reachable and clear.
  - Bad-ending pressure is unchanged because players can still ignore the
    second warning and force the gate.
- Follow-up: Recheck whether the recovery beat reduces confusion without
  softening the bad-ending pressure.
- Risks:
  - Failure-adjacent guidance can become too explanatory; keep the clue short
    and grounded in the objects the player can actually collect.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Make the conductor-clearance payoff naturally occur once
  players ask the old conductor to clear the platform.
- Why this matters: Random play already showed the conductor intercom could be
  missed after the player chose the conductor route. The conductor's clear
  signal is the emotional point of that path, so routing directly into the
  payoff improves normal-play discovery and removes a small late-game choice
  wrinkle.
- Tasks:
  - Route `follow_conductor_signal_to_third_car` directly to
    `passenger_conductor_intercom`.
  - Remove the redundant train-car conductor-clearance choice.
  - Keep the release physically grounded in the conductor intercom text.
  - Update regression coverage for the new route shape.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI or MCP playthrough.
- Evidence:
  - `follow_conductor_signal_to_third_car` now routes directly to
    `passenger_conductor_intercom` and sets `heard_conductor_clearance`.
  - Removed the redundant `listen_to_conductor_clearance` choice from
    `train_car`, reducing late-game choice noise on the conductor route.
  - Updated the conductor intercom text so the emergency release is physically
    present even though this route no longer stops on the generic train-car
    scene.
  - Updated story-path regression coverage for the direct conductor signal
    route through `passenger_helped_true_ending`.
  - Focused story-path tests passed with 86 tests.
  - Validation passed with 67 scenes, 10 endings, and all 67 reachable.
  - A 100-run random sample ended 100/100 runs, visited
    `passenger_conductor_intercom`, had no unvisited scenes, kept best score
    100/100, averaged 78.2, and reached max score in 72 runs.
  - A 100-run coverage sample visited all 67 scenes with 0 unfinished
    completed routes, best score 100/100, average score 98.69, and 109800
    max-score runs.
  - `npm run health` passed with formatting, TypeScript, 107 tests,
    validation, and coverage playtest.
  - Manual CLI play asked the old conductor to clear the platform, followed
    his clear signal directly into the conductor intercom, and reached
    `passenger_helped_true_ending` at 100/100 with no objectives.
- Playtest notes:
  - The conductor route now reads as a single continuous action: ask for the
    platform clear, follow that signal into the third car, then pull the
    release on his clear.
  - The new intercom wording keeps the release handle visible, so skipping the
    generic `train_car` scene did not make the final action feel ungrounded.
  - Random play now reaches the conductor intercom in the same deterministic
    100-run sample that previously missed it.
- Follow-up: Recheck whether random play now visits
  `passenger_conductor_intercom` more often in small samples.
- Risks:
  - Direct routing removes the generic third-car choice list from this one
    route, so the conductor intercom must clearly mention the release handle.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a handoff-specific intercom payoff after watching Mara
  open the manifest doors.
- Why this matters: Players who choose to watch Mara personally call the opened
  manifest doors now get that careful action acknowledged in the third car
  instead of falling back to the generic manifest-count intercom.
- Tasks:
  - Add an optional train-car intercom scene gated by
    `saw_mara_manifest_handoff`, direct manifest release state, and no passenger
    answer/gathering route flags.
  - Preserve the direct `pull_release_with_manifest` choice and the existing
    generic manifest intercom for players who did not watch Mara open the
    manifest.
  - Add regression coverage for choice ordering, scene text, route flags, and
    max-score completion.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI playthrough.
- Evidence:
  - Added `mara_manifest_handoff_intercom`, reached from the train car only
    after players open the manifest, watch Mara call the opened doors, and
    board without listening to passenger answers or gathering the crowd.
  - The direct `pull_release_with_manifest` choice remains available beside the
    optional handoff intercom.
  - The existing `mara_manifest_intercom` remains the generic manifest-count
    route for players who did not watch Mara's handoff.
  - Added story-path regression coverage for choice ordering, scene text,
    `heard_mara_goodbye`, and max-score completion through
    `passenger_true_ending`.
  - Focused story-path tests passed with 85 tests.
  - Validation passed with 66 scenes, 10 endings, and all 66 reachable.
  - A 100-run random sample ended 100/100 runs, kept best score 100/100,
    averaged 78.2, and reached max score in 72 runs.
  - A 100-run coverage sample visited all 66 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.63, and 105408 max-score
    runs.
  - `npm run health` passed with formatting, TypeScript, 106 tests,
    validation, and coverage playtest.
  - Health coverage playtest visited all 66 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.63, and 105408 max-score
    runs.
  - Manual CLI play watched Mara open the manifest, boarded directly, heard the
    new handoff-specific intercom, and reached `passenger_true_ending` at
    100/100 with no objectives.
- Playtest notes:
  - The new beat makes Mara's door-by-door handoff feel consequential on the
    direct manifest route.
  - Keeping the direct release beside the optional intercom preserves route
    pacing for players ready to finish.
  - No validation, score, completion, or coverage regression surfaced in
    focused checks.
- Follow-up: Consider grouping late-game intercom route families in reports if
  scene-count growth makes summaries harder to scan.
- Risks:
  - Another optional late-game intercom scene can make route-family summaries
    busier; keep the branch gated to direct manifest-handoff play.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add an answer-listener intercom payoff on the direct manifest
  release route.
- Why this matters: Players can pause to hear the opened manifest passengers
  answer roll call, then board directly without gathering or matching them. That
  route previously jumped straight to the generic manifest release choice, so
  the careful roll-call interaction needed a small late-game acknowledgement.
- Tasks:
  - Add an optional train-car intercom scene gated by `heard_passenger_answers`
    and the ungathered manifest route.
  - Preserve the direct `pull_release_with_manifest` choice and existing
    generic Mara manifest intercom for players who did not listen to answers.
  - Add regression coverage for choice ordering, scene text, route flagging,
    and max-score completion.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    playthrough.
- Evidence:
  - Added `passenger_answered_intercom`, reached from the train car only after
    players open the manifest, listen to passenger answers, and board without
    gathering the crowd.
  - The direct `pull_release_with_manifest` choice remains available beside the
    optional answer-listener intercom.
  - Updated existing direct answer-listener route assertions so both the
    immediate boarding path and the return-to-platform path expect the new
    optional intercom before direct release.
  - Added story-path regression coverage for choice ordering, scene text,
    `heard_answered_passengers`, and max-score completion through
    `passenger_true_ending`.
  - Focused story-path tests passed with 84 tests.
  - Validation passed with 65 scenes, 10 endings, and all 65 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 65 scenes,
    reached `passenger_answered_intercom`, kept best score 100/100, averaged
    78.2, and reached max score in 72 runs.
  - `npm run health` passed with formatting, TypeScript, 105 tests,
    validation, and coverage playtest.
  - Health coverage playtest visited all 65 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.63, and 105408 max-score
    runs.
  - Manual CLI play listened to passenger answers, boarded directly, heard the
    new answered-passenger intercom, and reached `passenger_true_ending` at
    100/100 with no objectives.
- Playtest notes:
  - The new beat gives direct manifest players a clear payoff for listening to
    the roll call before boarding.
  - Keeping `pull_release_with_manifest` beside the optional intercom preserves
    the direct route for players ready to finish.
  - No validation, score, completion, or coverage regression surfaced.
- Follow-up: Confirm random/coverage play still visits the new scene without
  lowering route completion.
- Risks:
  - Another optional late-game intercom scene can make route-family summaries
    busier; keep the branch gated to answer-listener direct-manifest play.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a conductor-led gathering beat after the passenger roll
  call.
- Why this matters: Core completion metrics are healthy, so the best next
  improvement is richer route texture. Players who pause to hear the released
  passengers answer their names now get a specific follow-up that lets the old
  conductor help organize the platform instead of falling straight back to the
  generic gathering beat.
- Tasks:
  - Add an optional conductor signal scene from `passenger_platform` after
    `heard_passenger_answers`.
  - Set `helped_passengers_gather` through that scene so it routes into the
    existing helped-passenger payoff without new scoring or ending labels.
  - Preserve existing mitten, keepsake, generic gathering, and direct boarding
    choices.
  - Add regression coverage for choice ordering, scene text, routing, and
    max-score completion.
  - Run focused tests, validation, random/goal/coverage playtests, full health,
    and an actual CLI playthrough through the new scene.
- Evidence:
  - Added `passenger_conductor_signal`, reached via
    `ask_conductor_to_call_platform_clear` after players listen to passenger
    answers and return to the platform.
  - The new scene sets `helped_passengers_gather` and returns to the existing
    third-car flow through `follow_conductor_signal_to_third_car`.
  - Added story-path coverage for the conductor route through
    `passenger_helped_true_ending` at 100/100.
  - Focused story-path tests passed with 82 tests.
  - Validation passed with 63 scenes, 10 endings, and all 63 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 63 scenes, kept
    best score 100/100, averaged 78.2, and reached
    `passenger_conductor_signal`.
  - A 100-run coverage sample visited all 63 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.58, and 101016 max-score
    runs.
  - Goal playtest ended 10/10 runs at max score.
  - `npm run health` passed with formatting, TypeScript, 103 tests,
    validation, and coverage playtest.
  - Manual CLI play took the manifest route, heard passenger answers, asked
    the conductor to call the platform clear, heard the gathered-passenger
    intercom and final roll call, then reached `passenger_helped_true_ending`
    at 100/100 with no objectives.
- Playtest notes:
  - The conductor beat gives the old conductor an active job after being named
    in the passenger answer/gathering text.
  - The scene improves pacing for answer-listener routes by turning the crowd's
    response into action before the third car.
  - No route completion, score, validation, or coverage regression surfaced.
- Follow-up: Consider grouping ideal ending variants in AI-loop reports; the
  growing ending family is useful but increasingly noisy in summaries.
- Risks:
  - The passenger platform now has one additional conditional choice after
    answer-listener routes, but automated and manual play show it remains
    bounded and clear.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a distinct matched-keepsake true ending.
- Why this matters: The matched-keepsake route now has bespoke handoff,
  intercom, and final roll-call beats, but before this cycle the actual release
  still resolved into the generic helped-passenger ending. Careful players who
  match the lunch tin, newspaper, and umbrellas should see those details carry
  through the ending itself.
- Tasks:
  - Route direct matched-keepsake release choices to a new keepsake-specific
    ideal ending.
  - Preserve the generic helped-passenger ending for players who gather the
    crowd without matching keepsakes.
  - Count the new ending as a max-score ideal true-ending variant in scoring,
    playtest goal ranking, and AI-loop evidence.
  - Add/update regression coverage for direct, intercom, and final-roll-call
    keepsake releases.
  - Run validation, automated playtests, full health, and an actual playthrough
    through the new ending.
- Evidence:
  - Added `passenger_keepsake_true_ending`, reached from the direct matched
    release, the keepsake intercom release, and the keepsake final roll-call
    release.
  - `pull_release_after_gathering_passengers` now excludes
    `matched_manifest_keepsakes`, while matched players see
    `pull_release_after_matching_keepsakes`.
  - Updated `score.ts`, goal-oriented playtest destination scoring, and
    AI-loop ideal-ending reporting so `passenger_keepsake_true_ending` counts
    as an ideal max-score completion.
  - Focused story/playtest/AI-loop tests passed with 94 tests.
  - Validation passed with 62 scenes, 10 endings, and all 62 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 62 scenes, kept
    best score 100/100, averaged 78.2, and reached
    `passenger_keepsake_true_ending` 8 times.
  - Coverage playtest visited all 62 scenes with 0 unfinished completed routes,
    best score 100/100, average score 98.58, and 101016 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 102 tests,
    validation, and coverage playtest.
  - MCP play reached `passenger_keepsake_true_ending` through the matched
    keepsake intercom and final roll call. The already-loaded MCP scorer still
    reported 90/100, but the local CLI/current process verified the same route
    at 100/100 with no objectives after the scorer update.
- Playtest notes:
  - The matched-keepsake route now pays off the lunch tin, newspaper, and
    umbrellas at the final release instead of collapsing into generic crowd
    language.
  - Choice clarity improved in the third car: matched players now see a direct
    keepsake-specific release option alongside the optional intercom beat.
  - The generic helped-passenger route remains available and tested for players
    who simply gather the crowd.
- Follow-up: The growing number of ideal ending variants is improving payoff
  but making reports busier; a future reporting pass should group ideal endings
  by route family.
- Risks:
  - Adding another ending label requires future score/playtest/reporting
    classifiers to stay synchronized.
  - Long-lived MCP servers may need a restart after scorer changes; the CLI
    route verified the current code path at 100/100.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a keepsake-specific final roll-call payoff after the
  matched-keepsake intercom.
- Why this matters: The previous cycle added a strong matched-keepsake
  intercom, but choosing the optional final roll call still fell back to the
  generic gathered-passenger text. Careful keepsake players should get a final
  beat that keeps the lunch tin, newspaper, and umbrellas central through the
  last choice before release.
- Tasks:
  - Route `hear_final_keepsake_roll_call` into a new keepsake-specific roll
    call scene.
  - Preserve the direct keepsake-intercom release path to
    `passenger_helped_true_ending`.
  - Add regression coverage for the new scene text, choice ordering, and
    max-score completion.
  - Run story-path tests, validation/playtest sampling, full health, and an
    actual playthrough through the new keepsake roll-call route.
- Evidence:
  - Added `passenger_keepsake_roll_call`, reached from
    `hear_final_keepsake_roll_call`.
  - The new scene keeps the matched lunch tin, newspaper, and umbrellas in the
    final roll call rather than reusing the generic passenger roll-call beat.
  - Direct release from `passenger_keepsake_intercom` remains available.
  - Added story-path regression coverage for the new keepsake roll-call scene,
    choice ordering, and max-score helped-ending completion.
  - Focused story-path tests passed with 81 tests.
  - Validation passed with 61 scenes, 9 endings, and all 61 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 61 scenes, kept
    best score 100/100, averaged 78.2, and reached
    `passenger_keepsake_roll_call`.
  - `npm run health` passed with formatting, TypeScript, 102 tests,
    validation, and coverage playtest.
  - Health coverage playtest visited all 61 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.58, and 101016 max-score
    runs.
  - Manual CLI play took the manifest route, matched keepsakes, heard the
    keepsake intercom, continued through the new keepsake roll call, and
    reached `passenger_helped_true_ending` at 100/100 with no lingering
    objectives.
- Playtest notes:
  - The new branch preserves the careful keepsake route through the final
    optional beat: the lunch tin, newspaper, and umbrellas remain active proof
    rather than becoming generic crowd texture.
  - The direct release from the keepsake intercom still keeps the route from
    feeling overlong for players who are ready to finish.
  - No completion, score, or coverage regression surfaced in focused tests,
    random sampling, health, or manual CLI play.
- Follow-up: Watch whether the increasing optional late-route beats need
  transcript grouping or route-family reporting rather than more ending labels.
- Risks:
  - Another optional late-game scene increases coverage state count by one, but
    all sampled routes still completed and coverage remains bounded.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a keepsake-specific final intercom beat to deepen the
  manifest rescue route.
- Why this matters: The previous cycle made manifest keepsake matching
  playable, but the payoff collapsed back into the generic gathered-passenger
  intercom as soon as players reached the third car. The route now preserves
  the direct helped-passenger ending while giving careful keepsake players one
  more authored confirmation that the objects helped the passengers reclaim
  their names.
- Tasks:
  - Add a matched-keepsake intercom choice from the third car.
  - Keep generic gathered-passenger intercom routing for players who use the
    generic gathering route.
  - Route matched-keepsake players through a new optional scene that can either
    release immediately or continue into the existing final roll call.
  - Add regression coverage for the new choice ordering, new scene text, and
    helped-ending completion.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI playthrough through the new keepsake intercom route.
- Evidence:
  - Added `passenger_keepsake_intercom`, reached from
    `listen_to_matched_keepsakes` after the player matches manifest keepsakes
    and leads the matched passengers to the third car.
  - The generic `listen_to_gathered_passengers` choice now excludes
    `matched_manifest_keepsakes`, so matched players see the authored keepsake
    payoff instead of duplicate intercom options.
  - `passenger_keepsake_intercom` can release directly to
    `passenger_helped_true_ending` or continue into the existing final roll
    call through `hear_final_keepsake_roll_call`.
  - Added story-path regression coverage for the new keepsake-specific
    intercom route and updated the keepsake handoff route's train-car choice
    order.
  - Focused story-path tests passed with 80 tests.
  - Validation passed with 60 scenes, 9 endings, and all 60 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 60 scenes, kept
    best score 100/100, averaged 78.2, and reached
    `passenger_keepsake_intercom`.
  - A coverage sample visited all 60 scenes with 0 unfinished completed routes,
    best score 100/100, average score 98.58, and 101016 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 101 tests,
    validation, and coverage playtest.
  - Manual CLI play took the manifest route, matched keepsakes, heard the new
    keepsake intercom, continued through the final roll call, and reached
    `passenger_helped_true_ending` at 100/100 with no lingering objectives.
- Playtest notes:
  - The keepsake route now has a stronger final echo: lunch tin, newspaper, and
    umbrellas are reintroduced at the release point instead of being left
    behind on the platform.
  - The new scene improves payoff without adding another ending label or score
    classifier.
  - The direct release choice remains available from the train car, so careful
    players can take the extra beat without making the route mandatory.
- Follow-up: Consider whether the final roll-call text should get a
  keepsake-aware variant if the manifest route keeps gaining personalized
  passenger beats.
- Risks:
  - Another optional late-game scene increases coverage state count by one, but
    health remains bounded and all sampled runs completed.

## Last Completed Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Add a distinct payoff ending for returning the lost mitten on
  the manifest route.
- Why this matters: Core completion metrics are healthy, so the best next
  improvement is deeper payoff for optional character interaction. The mitten
  scene already makes the kept passengers feel specific, but before this cycle
  it resolved into the generic helped-passenger ending.
- Tasks:
  - Route mitten-aware release choices to a new `passenger_mitten_true_ending`.
  - Keep the existing helped-passenger ending available for players who gather
    the crowd without returning the mitten.
  - Count the new ending as a max-score ideal true-ending variant in score,
    playtest strategy, and AI-loop evidence.
  - Add regression coverage for direct and final-roll-call mitten payoffs.
  - Run focused tests, validation/playtest sampling, full health, and an actual
    CLI playthrough through the mitten route.
- Evidence:
  - Added `passenger_mitten_true_ending`, reached when players return the lost
    mitten before pulling the release.
  - Added mitten-specific release choices from the train car, gathered-passenger
    intercom, and final roll-call epilogue.
  - The generic `passenger_helped_true_ending` remains available when players
    help passengers gather without returning the mitten.
  - Updated score, playtest destination scoring, and AI-loop ideal-ending
    reporting so `passenger_mitten_true_ending` counts as an ideal max-score
    completion.
  - Added story-path regression coverage for the direct mitten release and the
    final-roll-call mitten release.
  - Focused tests passed for story paths, playtest behavior, and AI-loop
    reporting with 91 tests.
  - Validation passed with 58 scenes, 9 endings, and all 58 reachable.
  - A 100-run random sample ended 100/100 runs, visited all 58 scenes, kept
    best score 100/100, averaged 78.2, and reached
    `passenger_mitten_true_ending` 11 times.
  - A focused coverage sample visited all 58 scenes with 0 unfinished completed
    routes, best score 100/100, average score 98.09, and 74664 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 99 tests, validation,
    and coverage playtest.
  - Manual CLI play took the manifest route, returned the lost mitten, listened
    to the gathered passengers, heard the final roll call, and reached
    `passenger_mitten_true_ending` at 100/100 with no lingering objectives.
- Playtest notes:
  - The new route makes the mitten interaction matter at the final release,
    especially after the final roll-call beat where the child answers for
    himself.
  - The helped-passenger route remains clear and shorter when the player does
    not choose the mitten beat.
  - No route completion regression surfaced in focused tests, random sampling,
    coverage sampling, health, or manual CLI play.
- Follow-up: Watch whether the growing number of ideal ending labels makes
  reports harder to scan; a later reporting pass may group them by route family.
- Risks:
  - This adds another ending label, so every ideal-ending classifier must stay
    in sync when future payoff variants are added.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Removed the empty service-room loop for fully prepared unlit-platform
  players.
- Main objective: Remove the empty service-room loop for fully prepared
  unlit-platform players.
- Why this matters: Cycle evidence still showed occasional random unfinished
  runs. Replaying a 500-run sample exposed a concrete loop where players who
  already held the map, token, fuse, and badge could keep bouncing between the
  unlit platform and the service room even though no preparation remained.
- Evidence:
  - `return_to_service_room` from `platform` now requires a missing map, token,
    fuse, or badge.
  - Added story-path regression coverage for a fully prepared platform state:
    inventory is badge, fuse, lantern, map, token; choices include
    `install_fuse` and `inspect_gate_control`; choices do not include
    `return_to_service_room`.
  - Focused validation passed with 53 scenes, 7 endings, and all 53 reachable.
  - `npm test -- tests/story-paths.test.ts` passed with 73 tests.
  - A 500-run random sample improved from 497/500 ended to 498/500 ended and
    removed the prior repeated platform/service-room max-step loop. Remaining
    unfinished samples were late-route cases at `passenger_gathered_intercom`
    and `passenger_answers`, both close to successful endings.
  - `npm run health` passed with formatting, TypeScript, 94 tests, validation,
    and coverage playtest.
  - Health coverage playtest visited all 53 scenes with 0 unfinished completed
    routes, best score 100/100, average score 96.31, and 37332 max-score runs.
  - Manual CLI play confirmed the fully prepared unlit platform now offers only
    `inspect_gate_control` and `install_fuse`, then continued through the signal
    booth to `true_ending` at 100/100.
- Playtest notes:
  - The platform now behaves like a commitment point once the player has every
    required tool; the next meaningful action is restoring power.
  - Underprepared players can still return to the service room to gather missing
    supplies.
  - The remaining step-limit pressure is not the same empty hub loop; it comes
    from optional late manifest-route beats landing just before an ending.
- Follow-up: Consider a later pass on late manifest-route pacing, especially
  whether `passenger_answers` should offer a more direct release route after the
  passengers answer.
- Risks:
  - Fully prepared players can no longer voluntarily retreat from the unlit
    platform to the service room, but at that point the service room has no
    remaining critical preparation and the player can still inspect the gate
    control before installing the fuse.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added a final gathered-passenger intercom beat before the helped
  manifest ending.
- Main objective: Add a final gathered-passenger intercom beat before the
  helped manifest ending.
- Why this matters: Core route metrics were healthy, so the best next
  improvement was richer payoff on the strongest successful route. Players who
  help the kept passengers gather previously moved from the third car straight
  to the final release; a short optional intercom beat lets the crowd answer
  Mara together before the player opens every door.
- Evidence:
  - Added `passenger_gathered_intercom`, reached from the helped-passenger
    train car after the player gathers the released crowd.
  - The `listen_to_gathered_passengers` choice sets
    `heard_gathered_passengers`, then flows directly to
    `passenger_helped_true_ending`.
  - The direct `pull_release_after_gathering_passengers` route remains
    available from the train car.
  - Added story-path regression coverage for the new intercom beat, final
    release, and continued direct helped-ending release access.
  - `npm run health` passed with formatting, TypeScript, 91 tests,
    validation, and coverage playtest.
  - Manual CLI play took the manifest handoff, passenger answers, passenger
    gathering, new gathered-passenger intercom, and reached
    `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The new beat makes the gathered passengers active before the final release
    instead of leaving Mara as the only voice of coordination.
  - The helped route still has a direct release choice, so the extra scene is
    player-paced rather than mandatory.
- Risks:
  - Another optional late-game beat can slow careful routes, so direct release
    access remains covered by regression tests.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Let careful manifest-route players both hear passenger answers and
  help the released crowd gather.
- Main objective: Let careful manifest-route players both hear passenger
  answers and help the released crowd gather.
- Why this matters: Core route metrics were healthy, so the highest-value
  improvement was story payoff on an already-successful route. Before this
  cycle, `listen_to_passenger_answers` sent players directly to the train car,
  making the answer beat mutually exclusive with the later
  `help_passengers_gather` payoff.
- Evidence:
  - `return_from_passenger_answers` now sends players to
    `passenger_platform` instead of directly to `train_car`.
  - Players who listen to the passenger answers can still board immediately and
    reach `passenger_true_ending`, or help the passengers gather and reach
    `passenger_helped_true_ending`.
  - Updated story-path regression coverage for answer-listeners who help the
    crowd and answer-listeners who board directly.
  - Updated `trueEndingCount` in playtest tests so
    `passenger_helped_true_ending` is treated as an ideal ending.
  - `npm test -- tests/story-paths.test.ts` passed with 68 tests.
  - Focused validation passed with 51 scenes, 7 endings, and all 51 reachable.
  - Focused 100-run random playtest ended all 100 runs, visited all 51 scenes,
    kept best score 100/100 and average score 77.75, and increased
    `passenger_helped_true_ending` from 9/100 to 19/100.
  - `npm run health` passed with formatting, TypeScript, 89 tests, validation,
    and coverage playtest.
  - Health coverage playtest visited all 51 scenes with 0 unfinished completed
    routes, best score 100/100, average score 92.79, and 17568 max-score runs.
  - Manual CLI play took the manifest route, listened to passenger answers,
    returned through the passenger platform, helped passengers gather, and
    reached `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The answer beat now feels like part of gathering the crowd rather than a
    branch that skips the crowd payoff.
  - Boarding immediately after the answers remains available, so the route does
    not force the optional helped-passenger ending.
  - No new objectives lingered at the final ending.
- Follow-up: Watch coverage run count after adding optional manifest-path
  routing; the count rose but remains bounded and health is green.
- Risks:
  - The passenger-answer route is one step longer for players who choose it,
    but it exposes an immediate board option and preserves max-score endings.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Smoothed the stairwell escape-warning recovery route.
- Main objective: Smooth the stairwell escape-warning recovery route.
- Why this matters: The adaptive exploratory route showed a player wavering at
  the stairs after powering the platform without the signal token. Mara's
  warning correctly named the stopped clock, but the recovery choice returned
  to the lit platform, forcing extra hub navigation before the player could act
  on the clue.
- Evidence:
  - `return_from_stairwell_call` now sends players directly to `clock`, where
    `take_token` is immediately available.
  - Added `leave_after_stairwell_call` so listening to Mara still permits the
    lower-score escape ending instead of silently committing the player to the
    rescue route.
  - Updated the stairwell regression to verify both the direct token recovery
    route back to `lit_platform` and the escape branch from Mara's warning.
  - `npm test -- tests/story-paths.test.ts` passed with 67 tests.
  - `npm run cyoa -- validate stories/demo.yaml --json` passed with 50 scenes,
    7 endings, and all 50 reachable.
  - `npm run health` passed with formatting, TypeScript, 88 tests, validation,
    and coverage playtest.
  - Health coverage playtest kept all 50 scenes visited with 0 unfinished
    completed routes, best score 100/100, average score 91.91, and 15372
    max-score runs.
  - Manual CLI play deliberately fled to the stairwell, listened to Mara,
    returned directly to the clock, recovered the token, triggered the
    missing-map signal warning, cleared Mara's ledger, and reached
    `true_ending` at 100/100.
- Playtest notes:
  - The stairwell warning now reads like actionable guidance instead of a clue
    followed by a detour.
  - The route still preserves the pressure of the escape choice because players
    can leave immediately after hearing Mara's final appeal.
  - The full route remained finishable and reached the true ending without
    objectives lingering.
  - No bugs surfaced in the focused route.
- Follow-up: Watch random-route ending distribution; the new direct clock
  route should reduce repeated platform/service-room churn without removing
  meaningful escape pressure.
- Risks:
  - Direct routing to the clock abstracts the walk back through the tunnel, but
    the scene already gives an explicit location clue and the focused playtest
    confirmed the route stays readable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added a distinct manifest release ending for players who help the
  kept passengers gather.
- Main objective: Pay off the optional kept-passenger gathering beat in the
  final manifest ending.
- Why this matters: Current evidence showed core completion and true-ending
  discovery were healthy, so the highest-value improvement was story depth on
  an already-successful route. The game already tracked whether the player
  helped the kept passengers gather, but the final release previously resolved
  with the same text either way.
- Evidence:
  - Added `pull_release_after_gathering_passengers`, shown only after the
    player helped the kept passengers gather.
  - Added `passenger_helped_true_ending`, a distinct ideal ending that pays off
    the helped-passenger flag with final-scene acknowledgement.
  - Updated score, goal-oriented playtest weighting, and AI-loop ideal-ending
    reporting so `passenger_helped_true_ending` counts as a full success.
  - Updated story-path and AI-loop regression tests for the new ideal ending
    branch.
  - `npm run health` passed with formatting, TypeScript, 88 tests, validation,
    and coverage playtest.
  - Manual CLI play took the passenger-gathering route and reached
    `passenger_helped_true_ending` at 100/100.
- Playtest notes:
  - The helped-passenger action now reads as consequential instead of cosmetic.
  - The route stayed direct: gather passengers, return to the third car, pull
    the release, and receive a specific final payoff.
- Risks:
  - Adding another ending ID requires every ideal-ending heuristic to know about
    it, so focused tests cover scoring and AI-loop reporting.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added an optional badge-inspection memory in the maintenance locker.
- Main objective: Add an optional badge-inspection memory in the maintenance
  locker.
- Why this matters: Current evidence shows completion and true-ending
  discoverability are healthy, so the next valuable improvement is a contained
  character beat. Letting players read the back of Mara's badge makes the badge
  feel like proof carried by a person, reinforces the third-car release route,
  and echoes her rule that no one clears until the kept passengers clear.
- Tasks:
  - Add a one-time optional `badge_memory` scene from the locker after Mara's
    badge is recovered.
  - Return directly to the locker so players can still collect the fuse and
    close the locker without a hub detour.
  - Add regression coverage for the scene text, one-time gating, and continued
    locker preparation.
  - Run focused tests, full health, an actual CLI playthrough, and commit/push
    if green.
- Evidence:
  - Added `badge_memory`, reached from the locker after taking Mara's badge
    while the platform fuse is still uncollected.
  - The badge memory teaches `LAST TRAIN, THIRD CAR, FIRST SEAT RELEASE`,
    sets `knows_release`, and reinforces Mara's instruction not to clear her
    before the other kept passengers.
  - The scene returns directly to the locker so players can still take the fuse
    and close the locker without a hub detour.
  - `inspect_mara_posters` is hidden after the badge memory, preventing the
    longest exploratory coverage routes from stacking two redundant Mara
    character beats.
  - `npm test -- tests/story-paths.test.ts` passed with 59 tests.
  - Validation reports 48 scenes, 6 endings, and all 48 reachable.
  - A focused random run passed with 0 unfinished routes, all 48 scenes
    visited, best score 100/100, average score 75.45, and 63 max-score runs.
  - A focused coverage run passed with 0 unfinished routes, all 48 scenes
    visited, best score 100/100, average score 97.33, and 58176 max-score
    runs.
  - `npm run health` passed with formatting, TypeScript, 80 tests, validation,
    and coverage playtest.
  - Manual CLI play took the new badge-memory route, then recovered the map,
    token, fuse, cleared Mara's ledger, and reached `true_ending` at 100/100.
- Playtest notes:
  - The badge memory reads as a useful character beat rather than a detour
    because it also gives actionable release-route information.
  - The route felt smoother once the later poster beat was suppressed for
    players who had already read the badge, keeping optional lore from piling
    up on the longest route.
- Follow-up: Watch coverage route count after adding optional locker branches;
  avoid stacking more one-time beats in the same hub unless tests stay bounded.
- Risks:
  - Another optional scene can lengthen random routes through the locker, though
    it should remain bounded because it is one-time and returns directly.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added an optional morning-map note for players taking the map-only
  safe escape route.
- Main objective: Add an optional morning-map note for players taking the
  map-only safe escape route.
- Why this matters: Current evidence showed ideal-ending discovery was healthy,
  while the lower-score `good_ending` route remained useful as a pressure valve.
  A short note on the morning platform clarified that safe transfer is not the
  same as clearing the ledger, making the non-ideal escape feel intentional
  without adding mandatory steps to the true-ending route.
- Evidence:
  - Added `morning_map_note`, reached from `morning_transfer` by reading the
    final note written on the marked map.
  - The note reinforces that safe transfer is not clearance and names the badge,
    fuse, and signal token as the practical path back to Mara's ledger.
  - The note offers direct safe escape or turn-back routes, preserving the
    existing `morning_doors` scene as an alternate optional beat instead of
    chaining both optional scenes.
  - Initial coverage exposed 8 unfinished routes when the note returned to
    `morning_transfer`; resolving the note directly reduced that to 1.
  - The token turn-back route now recovers the token and returns to `tunnel`,
    matching the existing morning-door shortcut and restoring 0 unfinished
    coverage routes.
  - `npm test -- tests/story-paths.test.ts` passed with 57 tests.
  - Validation reports 47 scenes, 6 endings, and all 47 reachable.
  - A focused 50-step coverage run passed with 0 unfinished routes, all 47
    scenes visited, best score 100/100, average score 97.04, and 46080
    max-score runs.
  - A focused random run passed with 0 unfinished routes, all 47 scenes visited,
    best score 100/100, average score 74.55, and 61 max-score runs.
  - `npm run health` passed with formatting, TypeScript, 78 tests, validation,
    and coverage playtest.
  - Manual CLI play took the map-only escape route, read the morning-map note,
    turned back through the token shortcut, cleared Mara's ledger, and reached
    `true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, an actual
    MCP true-ending playthrough at 100/100, and an adaptive exploratory
    true-ending route at 100/100.
- Follow-up: If further optional morning-platform content is added, treat it as
  an alternate branch with its own resolution rather than returning to
  `morning_transfer`.
- Risks:
  - Optional scenes near the map-only escape route can still multiply with
    turn-back routes; keep checking bounded coverage after each addition.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Smoothed map recovery after players read Mara's ledger without the
  marked map.
- Main objective: Smooth map recovery after players read Mara's ledger without
  the marked map.
- Why this matters: Cycle evidence showed the core route was healthy, but the
  adaptive exploratory route could still stall after entering the signal booth
  unprepared, reading the ledger, returning for the map, and landing back on the
  lit platform. The warning was useful; the extra service-room and platform
  hops were not. Recovering the map directly back to Mara's row kept the player
  focused on the active ledger objective.
- Evidence:
  - `return_for_marked_map` now reads "Recover the marked map and return to
    Mara's ledger row", adds the map, and keeps the player at `signal_ledger`.
  - The recovered state immediately exposes the correct clear choice, including
    `clear_manifest_and_mara_from_ledger` when the kept-passenger manifest was
    read before map recovery.
  - `npm test -- tests/story-paths.test.ts` passed with 53 tests.
  - `npm run health` passed with formatting, TypeScript, 74 tests, validation,
    and coverage playtest.
  - Validation reports 43 scenes, 6 endings, and all 43 reachable.
  - Health coverage playtest reports 0 unfinished runs, all 43 scenes visited,
    best score 100/100, average score 95.08, and 9984 max-score runs.
  - Manual CLI play deliberately entered the signal booth without the map,
    read the passenger manifest, recovered the map directly back to
    `signal_ledger`, cleared the manifest and Mara, took the passenger farewell
    beat, and reached `passenger_true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, an actual
    MCP true-ending playthrough at 100/100, and an adaptive exploratory
    true-ending route at 100/100.
- Follow-up: Consider adding a short dedicated "map recovered" ledger beat if
  future transcripts need stronger prose feedback for this direct recovery.
- Risks:
  - Directly adding the map abstracts travel to the service room. The route was
    already abstracted from `signal_map_warning`, and focused tests plus
    playthrough evidence confirm the branch remains coherent and finishable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added an optional in-train map-study beat for players taking the
  underprepared map-only escape route.
- Main objective: Add an optional in-train map-study beat for players taking
  the underprepared map-only escape route.
- Why this matters: Current evidence shows core true-ending guidance is healthy
  and the adaptive route now finishes. The map-only `good_ending` remains a
  valid non-ideal escape, but it previously jumped straight from the ominous
  third car to morning. A small optional beat makes that route feel intentional,
  clarifies why the map is safer than the HOME sign, and preserves pressure to
  pursue the fuller ledger-release ending.
- Evidence:
  - Added `train_map`, reached from `train_car` via `study_map_in_train` when
    the player has the map and has not freed Mara.
  - The scene sets `checked_train_map`, reinforces the MORNING PLATFORM route
    and the danger of the HOME sign, then offers either
    `ride_with_map_after_study` to `good_ending` or `lower_map_to_sign` to
    `sign_warning`.
  - Kept the direct `ride_with_map` and `look_at_sign` choices available from
    `train_car`, so the beat remains optional.
  - Updated story-path regression coverage for direct map-only train choices
    and the optional map-study route.
  - `npm test -- tests/story-paths.test.ts` passed with 50 tests.
  - `npm run health` passed with formatting, TypeScript, 71 tests, validation,
    and coverage playtest.
  - Validation reports 41 scenes, 6 endings, and all 41 reachable.
  - Coverage playtest reports 0 unfinished runs, all 41 scenes visited, best
    score 100/100, average score 86.08, and 2880 max-score runs.
  - Manual CLI route took the new train-map beat and reached `good_ending` at
    15/100, which correctly frames the route as safe but incomplete.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, an actual
    MCP true-ending playthrough at 100/100, and an adaptive exploratory
    true-ending route at 100/100.
- Follow-up: Consider whether the map-only ending should award or report a
  distinct "escaped safely but left the ledger unresolved" outcome so low-score
  endings are easier to critique in transcripts.
- Risks:
  - Adding an optional train-car choice increases non-ideal route branching and
    lowers coverage average compared with the previous cycle. Direct choices,
    full health, and playthrough evidence confirm ideal routes remain stable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added an optional passenger-platform farewell scene after opening the
  kept-passenger manifest doors.
- Main objective: Add an optional manifest-route farewell that makes the
  released passengers feel present before the final train-car release.
- Why this matters: Current evidence showed healthy completion, full coverage,
  and strong true-ending discoverability. The best next improvement was a small
  emotional payoff for players who took the optional passenger manifest route,
  without adding a mandatory step to the core ending.
- Evidence:
  - Added `passenger_farewell`, a one-time optional scene reached from
    `passenger_platform` after the manifest doors open.
  - Kept direct `board_third_car_with_passengers` available from
    `passenger_platform`, so the farewell remains optional.
  - Updated story-path regression coverage to prove the farewell appears once,
    returns to the platform, and does not block the manifest true-ending route.
  - `npm test -- tests/story-paths.test.ts` passed with 48 tests.
  - `npm run health` passed with formatting, TypeScript, 69 tests, validation,
    and coverage playtest.
  - Validation reported 39 scenes, 6 endings, and all 39 reachable.
  - Coverage playtest reported 0 unfinished runs, all 39 scenes visited, best
    score 100/100, average score 87.88, and 1600 max-score runs.
  - Manual CLI route took the passenger manifest, passenger echoes, new
    farewell scene, Mara's manifest intercom, and reached
    `passenger_true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, an actual
    MCP true-ending playthrough at 100/100, and an adaptive exploratory
    true-ending route at 100/100.
- Follow-up: Watch random route length and max-score rate; if the optional beat
  adds friction, keep the scene but avoid steering automated players into it
  too often.
- Risks:
  - Adding another late-game optional scene can slightly lengthen manifest
    routes. Direct boarding remains available to keep pacing under player
    control.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Smoothed map-warning recovery so late-game explorers return directly
  to the solved platform state.
- Main objective: Smooth map-warning recovery so late-game explorers return
  directly to the solved platform state.
- Why this matters: Cycle evidence showed the adaptive exploratory route
  stopping at `signal_map_warning` after a fully useful warning. Sending the
  player back through the service-room hub just to take the known marked map
  added friction without adding a meaningful decision.
- Evidence:
  - `signal_map_warning` now offers "Recover the marked map and return to the
    gate control", adds the map, and lands on `lit_platform`.
  - After recovery, `lit_platform` exposes only `use_token_slot`, keeping the
    player focused on the signal-booth objective.
  - `npm test -- tests/story-paths.test.ts` passed with 48 tests.
  - `npm run health` passed with formatting, TypeScript, 68 tests, validation,
    and coverage playtest.
  - Validation reports 38 scenes, 6 endings, and all 38 reachable.
  - Coverage playtest reports 0 unfinished runs, all 38 scenes visited, best
    score 100/100, average score 82.25, and 960 max-score runs.
  - Manual CLI route deliberately triggered `signal_map_warning`, recovered the
    map directly back to `lit_platform`, opened the signal booth, took the
    thumbprint memory, and reached `true_ending` at 100/100.
  - `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health, MCP tool
    verification, MCP validation, MCP random/coverage/goal playtests, and an
    actual MCP true-ending playthrough at 100/100.
  - Post-change adaptive exploratory play no longer stops at
    `signal_map_warning`; it now stops at `signal_booth` with
    `inspect_signal_ledger` and `read_passenger_manifest` both visible.
- Follow-up: Inspect whether the adaptive `signal_booth` stop is a route-depth
  limitation or whether the booth should more strongly prioritize Mara's ledger
  entry after the player is fully prepared.
- Risks:
  - Recovering the map from the warning is slightly abstracted compared with a
    literal service-room return. Focused tests, full health, and manual play
    confirm the branch remains coherent and finishable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added an optional late-game character memory before clearing Mara's
  ledger row.
- Main objective: Add an optional late-game character memory before clearing
  Mara's ledger row.
- Why this matters: Route metrics were healthy, all scenes were reachable, and
  true-ending discovery was strong. The highest-value next change was a small
  story payoff that deepened Mara's motivation without adding a mandatory step
  to the main ending route.
- Evidence:
  - Added `mara_thumbprint`, reached by `inspect_mara_thumbprint` after reading
    Mara's signal-ledger entry while carrying her badge.
  - Added `read_mara_thumbprint` gating so the memory appears once and then
    returns to the existing ledger clear choices.
  - Updated exact-choice tests for prepared ledger states to allow the new
    optional memory, while preserving badge-less recovery focus.
  - Added a new regression proving players can inspect the memory, return to
    `signal_ledger`, and still clear Mara's row.
  - `npm test -- tests/story-paths.test.ts` passed with 48 tests.
  - `npm run health` passed with formatting, TypeScript, 68 tests, validation,
    and coverage playtest.
  - Validation reported 38 scenes, 6 endings, and all 38 reachable.
  - Coverage playtest reported 0 unfinished runs, all 38 scenes visited, best
    score 100/100, average score 82.25, and 960 max-score runs.
  - Manual CLI route took the new thumbprint memory, returned to the ledger,
    cleared Mara's row, and reached `true_ending` at 100/100.
- Follow-up: Consider a small report/transcript improvement that flags optional
  lore beats taken before endings, so future AI critique can discuss pacing
  impact without reading full transcripts.
- Risks:
  - The new optional choice slightly increases branching in the signal-ledger
    scene. Coverage and manual play confirm it remains reachable and finishable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Required the marked map before ledger release.
- Main objective: Prevent mapless signal-booth routes from clearing Mara's
  ledger and reaching a low-score ideal ending.
- Why this matters: The adaptive exploratory evidence reached
  `passenger_true_ending` without the marked map and finished at 90/100, even
  though the story repeatedly frames the map as required for safe boarding.
  The fix keeps the exploratory branch playable while preserving the map as a
  real progression requirement for the true-ending family.
- Evidence:
  - Added an `item: map` requirement to `mark_mara_clear_from_ledger` and
    `clear_manifest_and_mara_from_ledger`.
  - Added `return_for_marked_map`, available from `signal_ledger` whenever the
    player lacks the map.
  - Added regression coverage proving a mapless manifest reader cannot clear
    Mara or the manifest, must return for the map, and can then reopen the
    ledger clear action.
  - `npm test -- tests/story-paths.test.ts` passed with 46 tests.
  - `npm run health` passed with formatting, TypeScript, 66 tests, validation,
    and coverage playtest.
  - Validation reports 37 scenes, 6 endings, and all 37 reachable.
  - Coverage playtest reports 0 unfinished runs, all 37 scenes visited, best
    score 100/100, average score 72.73, and 480 max-score runs.
  - Manual CLI route deliberately entered the signal booth without the map,
    confirmed `signal_ledger` only offered `return_for_marked_map`, recovered
    the map, and reached `passenger_true_ending` at 100/100.
- Follow-up: The mapless signal-booth checkpoint now works, but the objective
  list at that moment still includes a generic "Learn how to survive..." line;
  a future pass could make late-game objectives more scene-specific.
- Risks:
  - This tightens a permissive route. Players who intentionally ignore the
    earlier map warning now take one extra recovery step, but health and manual
    play confirm the branch remains finishable.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Added a stronger manifest-route platform payoff after clearing Mara's
  ledger entry.
- Main objective: Add a stronger manifest-route platform payoff after clearing
  Mara's ledger entry.
- Why this matters: Current route metrics are healthy and all scenes are
  reachable, so the best next improvement is richer payoff on the optional
  passenger-manifest branch rather than another clue pass. Players who read the
  manifest should briefly see the people they chose to save before returning to
  the emergency release.
- Evidence:
  - Added `passenger_platform`, reached after opening every manifest door and
    before boarding the third car.
  - Updated manifest-route regression coverage so the new scene is required on
    the passenger-manifest path and the passenger true ending still reaches
    100/100.
  - `npm test -- tests/story-paths.test.ts` passed with 45 tests.
  - `npm run health` passed with formatting, TypeScript, 65 tests, validation,
    and coverage playtest.
  - Validation reports 37 scenes, 6 endings, and all 37 reachable.
  - Coverage playtest reports 0 unfinished runs, all 37 scenes visited, best
    score 100/100, and average score 77.92.
  - Manual CLI route through `passenger_platform` and
    `mara_manifest_intercom` reached `passenger_true_ending` at 100/100.
- Follow-up: If the added step noticeably lowers random max-score completion,
  keep the scene text but consider merging it with `passengers_released`.
- Risks:
  - Adding a required beat to the optional manifest branch slightly lengthens
    one max-score route. Health and playtest summaries must confirm the branch
    still ends reliably.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Pay off the optional passenger manifest in the final release.
- Main objective: Pay off the optional passenger manifest in the final release.
- Why this matters: Route metrics are healthy and all scenes are reachable, so
  the highest-value next improvement is emotional payoff rather than another
  clue-only routing pass. The manifest now broadens the stakes before Mara's
  ledger row; the ending should acknowledge those specific passengers when the
  player chose to read it.
- Evidence:
  - Added `passenger_true_ending`, reached only when the player read
    `passenger_manifest` before pulling the release.
  - Split release choices so manifest readers see `pull_release_with_manifest`
    or `pull_release_after_manifest_goodbye`, while players who skip the
    manifest still use the original `pull_release`/`true_ending` route.
  - Updated scoring so both `true_ending` and `passenger_true_ending` satisfy
    the final max-score achievement.
  - Added regression coverage for the manifest direct-release path and the
    manifest plus Mara-intercom path.
  - Updated playtest strategy tests to count both true-ending variants as
    successful max-score true endings.
  - `npm test -- tests/story-paths.test.ts` passed with 42 tests.
  - `npm test` passed with 58 tests.
  - `npm run health` passed with formatting, TypeScript, all tests,
    validation, and coverage playtest.
  - Validation now reports 33 scenes, 6 endings, all 33 reachable.
  - Coverage playtest visits `passenger_true_ending`, has 0 unfinished runs,
    and keeps best score at 100/100.
  - Manual CLI route through `read_passenger_manifest`,
    `listen_to_mara_intercom`, and `pull_release_after_manifest_goodbye`
    reached `passenger_true_ending` at 100/100.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health,
    MCP tool verification, MCP validation, MCP random/coverage/goal playtests,
    and an actual MCP true-ending playthrough at 100/100.
  - Final evidence random playtest, 100 runs: all ended, all 33 scenes visited,
    `true_ending` reached 27 times, `passenger_true_ending` reached 27 times,
    best score 100/100, average score 70.7.
  - Final MCP random playtest, 250 runs: all ended, all 33 scenes visited,
    `true_ending` reached 67 times, `passenger_true_ending` reached 72 times,
    best score 100/100, average score 70.78.
- Follow-up: The adaptive exploratory route again stops at the fully prepared
  `lit_platform` state with `use_token_slot` as the only available progress
  action, suggesting the next useful work is route-continuation support or
  transcript/report quality rather than additional clue text.
- Risks:
  - Adding a second true-ending scene touches scoring and playtest summaries, so
    both true-ending variants must remain max-score terminal outcomes.

## Last Completed Cycle

- Date: 2026-06-01
- Change: Let Mara's optional intercom goodbye flow directly into the final
  release.
- Main objective: Let Mara's optional intercom goodbye flow directly into the
  final release.
- Why this matters: Current route metrics are healthy, but the adaptive
  exploratory route listened to Mara's final intercom beat, returned to the
  train car, and stopped one step short of the true ending. The intercom beat
  is good character payoff, but bouncing back to the same release prompt adds a
  low-value final click exactly where the game should be closing.
- Evidence:
  - Changed `mara_intercom` so its sole choice is
    `pull_release_after_mara_goodbye`, leading directly to `true_ending`.
  - Updated the intercom regression to assert the goodbye path reaches
    `true_ending` at max score.
  - `npm test -- tests/story-paths.test.ts` passed with 40 tests.
  - `npm run health` passed with formatting, TypeScript, 56 tests, validation,
    and coverage playtest.
  - Evidence-only `AI_LOOP_EVIDENCE_ONLY=1 npm run ai:cycle` passed health,
    MCP tool verification, MCP validation, MCP random/coverage/goal playtests,
    and an actual MCP true-ending playthrough at 100/100.
  - Manual CLI route through `listen_to_mara_intercom` and
    `pull_release_after_mara_goodbye` reached `true_ending` at 100/100 with
    `heard_mara_goodbye` set.
  - Final evidence random playtest, 100 runs: all ended, all 31 scenes visited,
    `true_ending` reached 54 times, best score 100/100, average score 70.7.
  - Final MCP random playtest, 250 runs: all ended, all 31 scenes visited,
    `true_ending` reached 139 times, best score 100/100, average score 70.78.
  - Adaptive exploratory MCP route now stops earlier at the fully prepared
    `lit_platform` state with badge, fuse, map, and token; because that state
    is already focused to `use_token_slot`, the remaining issue appears to be
    adaptive route depth/continuation rather than a new choice distraction.
- Follow-up: Inspect adaptive exploratory route depth/continuation, or add a
  small story payoff now that the main-route choice set is focused.
- Risks:
  - This removes one explicit return-to-release beat. The choice label now
    carries the release action so players still understand what ends the game.

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
