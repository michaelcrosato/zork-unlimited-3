# AI Loop State

This file is the handoff point for future autonomous agents.

## Current Objective

Keep the autonomous CYOA engine maintainable, secure, and playable while
preserving normal-play true-ending discoverability.

## Active Cycle

- Date: 2026-06-01
- Status: Completed locally; ready for commit/push.
- Main objective: Preserve the newspaper passenger route through optional final
  exploration.
- Why this matters: Random play can reach the newspaper-specific route, but an
  exploratory player who listens to the final roll call from
  `passenger_newspaper_intercom` was routed back into the generic
  helped-passenger ending. Keeping that curiosity on-theme should make the
  route feel more coherent and slightly improve normal discovery of
  `passenger_newspaper_true_ending`.
- Tasks:
  - Add a newspaper-specific final roll-call beat after
    `passenger_newspaper_intercom`.
  - Route that optional beat into `passenger_newspaper_true_ending`.
  - Update regression coverage for the new scene, label, ending route, and full
    score.
  - Run focused tests, full health, and an actual CLI or MCP playthrough
    through the updated route.
- Evidence:
  - Added `passenger_newspaper_roll_call`, reached from
    `passenger_newspaper_intercom` when the player chooses the optional final
    roll-call beat.
  - Routed the newspaper roll-call release to
    `passenger_newspaper_true_ending`, preserving the transfer-column motif
    for exploratory players instead of falling back to the generic helped
    passenger ending.
  - Updated story-path regression coverage for the new choice label, scene
    text, final release choice, ending, and 100/100 score.
  - Focused story-path tests passed: 88 tests.
  - `npm run health` passed with formatting, TypeScript, 109 tests,
    validation, and coverage playtest.
  - Validation reports 72 scenes, 11 endings, and all 72 reachable.
  - Coverage playtest visited every scene, including
    `passenger_newspaper_roll_call`, with no unvisited scenes, best score
    100/100, average score 99.21, and 184464 max-score runs.
  - Coverage ending pressure for `passenger_newspaper_true_ending` increased
    from 8784 to 17568 paths because the optional roll-call route now preserves
    the newspaper ending.
  - A 250-run random sample ended every run, visited every scene, reached
    `passenger_newspaper_true_ending` 4 times, and kept best score 100/100.
  - Manual CLI play reached `passenger_newspaper_true_ending` through
    `hear_final_newspaper_roll_call` at 100/100 with no objectives.
- Playtest notes:
  - The newspaper route now reads as a coherent sequence: memory, timetable,
    final roll call, and ending all center on the transfer column.
  - Listening to the optional roll call feels like deeper engagement with the
    newspaper route, not a detour away from it.
  - No story, scoring, validation, objective, formatting, or test regressions
    appeared.
- Follow-up: Compare random-play ending distribution after the change to see
  whether `passenger_newspaper_true_ending` appears more reliably.
- Risks:
  - Adding another scene increases coverage breadth; keep the beat short and
    route-specific so it does not make the late game sprawl.

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
