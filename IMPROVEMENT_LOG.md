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
