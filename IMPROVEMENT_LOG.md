# Improvement Log

Persistent self-feedback for the autonomous maintainer loop. Each entry records
what was tested, quantitative metrics, qualitative observations, and the next
highest-leverage improvement target.

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
