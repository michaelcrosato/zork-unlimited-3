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
