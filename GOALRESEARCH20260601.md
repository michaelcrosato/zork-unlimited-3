# Blind-Playtesting Subsystem — Research & Decisions (staged, 2026-06-01)

A shareable snapshot of the research, decisions, and design behind the blind-playtesting
subsystem added to `zork-unlimited-3`. Captures _why_, not just _what_. Implementation lives in
`src/blind-playtester.ts`, `src/consolidate-feedback.ts`, `src/blind-facade.ts`,
`src/playtest-feedback.ts`, `src/playtest-prompts.ts`, `src/agent-runner.ts`, and `playtest_loop.sh`.
Contracts: `PLAYTEST_AGENT_PROMPT.md`, `PLAYTEST_CONSOLIDATOR_PROMPT.md`.

## Problem

The autonomous AFK loop already runs _mechanical_ playtests (random/coverage/goal) and the coding
agent's own _self-play_ — but the agent knows the code, story, solver routes, and intended endings.
Nothing experienced the game as a **fresh player with no prior knowledge**, and nothing produced
**qualitative** feedback (goal clarity, false affordances, unfair deaths, pacing, narrative
legibility) or a **consolidated, pattern-level** corpus to drive planning. The CLI may only review
feedback once a day, so single-run reactions are noise — we need aggregation.

## Frontier research (as of June 1, 2026)

- **Capability is not the bottleneck.** METR's 50%-task time horizon reached ~14.5h for frontier
  models (Feb 2026), doubling ~every 7 months; SWE-bench Verified climbed ~60%→near-100% in a year;
  OSWorld ~66%. The leverage is in a **blind interface + feedback aggregation/orchestration**.
- **LLMs are validated relative-difficulty testers.** LLM struggle correlates _strongly_ with human
  difficulty (arXiv 2410.02829, ACM HCI 2025), and LLM QA bots find more distinct crashes than
  baseline bots.
- **…but bounded.** LLMs make minimal interactive-fiction progress without hints, hallucinate
  long-horizon state, and complete _no_ IF gauntlet zero-shot (TextQuests, TALES). So a blind LLM
  getting stuck is ambiguous — real game fault vs. model weakness — and needs a control.
- **Subagents give fresh isolated context** (ideal for "blind"); **LLM-as-judge** works best with
  _different model families_ (avoids self-enhancement bias), structured rubrics, severity scales,
  and aggregation over many runs. Classic playtest method: observe behavior, capture stuck points,
  don't lead, tell testers to be ruthless. Ralph-style loops need budgets + a tangible per-window
  artifact.

Sources: METR Time Horizon 1.1 (metr.org), Stanford HAI AI Index 2026, arXiv 2410.02829, TextQuests
(arXiv 2507.23701), TALES (arXiv 2504.14128), arXiv 2601.05420 (noisy LLM-as-judge), arXiv 2603.22751
(observation leakage), Claude Code subagents docs.

## Decisions (locked with the owner)

1. **Two tiers.** The main loop keeps its single fast playthrough as a crash/bug smoke gate
   (unchanged). A **separate parallel loop** does the deep, brutally-honest blind testing and
   accumulates as much feedback as possible.
2. **Multi-family model rotation.** Playtesters rotate across model families (anything ~last 2
   years), cost-tiered (frontier for depth, cheaper for volume). The consolidation judge runs on a
   family **different from the coding agent**.
3. **24h consolidation** into one committed artifact (`PLAYTEST_DIGEST.md`) that sets the next
   planning window.
4. **Rotating personas** (cautious reader / goal-seeker / risk-taker / casual / completionist /
   story-first / systems-skeptic) for behavioral coverage.

## Design

- **Blindness is enforced by the interface, not just the prompt.** The engine's `observe()` leaks
  every choice's destination scene id, plus flags and the achievement model. `src/blind-facade.ts`
  masks all of that and presents only prose, numbered choice labels, and the visible score; the
  trusted orchestrator keeps the real ids privately. A `with_hints` variant optionally exposes the
  game's derived objectives as a control.
- **Real play, honest fallback.** `src/blind-playtester.ts` drives the engine in-process with a
  persona heuristic and hands the _masked_ transcript to an LLM (`AI_PLAYTEST_CMD`) for the
  brutally-honest interview. With no model configured it still emits an **honest** record
  (quantitative signal + flagged stuck/failure) — never fabricated qualitative text.
- **Structured, durable feedback.** Zod-validated records (`src/playtest-feedback.ts`) with a
  severity scale (S0–S4) and per-issue `repro` paths. Verbose logs → `ai-runs/playtest/`
  (gitignored); compact lines → `playtest-feedback/sessions.jsonl` (committed, durable across
  container reclaim); the digest → `PLAYTEST_DIGEST.md` (committed).
- **Honest consolidation.** `src/consolidate-feedback.ts` dedupes by issue id, ranks by
  `severity × frequency × unique_personas × confidence`, promotes only recurring/severe clusters
  (score-smoothing), flags cross-model agreement, diffs persisting/resolved, and derives priorities
  from the data. An optional LLM judge (different family) names themes but cannot invent issues.
- **LLM-weakness control.** A stuck/confusion cluster counts as a _game_ fault only if the
  mechanical `goal` solver reaches that region or `with_hints` clears what `no_hints` couldn't.

## Prior art reviewed — Jules's branch

`google-labs-jules[bot]` (`playtesting-subagent-plan-…`) made the same architecture call (parallel
loop + 24h consolidation) and a usable scaffold, but stubbed the substance: its "blind playtester"
picked **random** choices and wrote placeholder feedback; its consolidator emitted **hardcoded
themes that contradicted its own data**; it committed per-run logs while gitignoring the digest
(inverted); and it never masked the leaky observation. We cherry-picked the architecture call and
the loop/MCP scaffold and superseded the stubs with the real pipeline above.

## How to run

```bash
npm run playtest:session -- --persona risk_taker --variant no_hints   # one blind run
npm run playtest:consolidate -- --all                                 # build the digest
AI_PLAYTEST_CMDS="claude -p;gemini -p" ./playtest_loop.sh             # the parallel loop
```

The coding agent reads `PLAYTEST_DIGEST.md` (top section) at the start of each planning window
(see `AI_AGENT_PROMPT.md`).

## Implemented follow-through

- Real per-turn LLM decider is wired. When `AI_PLAYTEST_CMD` is configured, each turn uses the
  masked screen plus persona prompt and validates a JSON `{ "choice": number }`; invalid responses
  fall back to the deterministic persona heuristic and are counted in the feedback record.
- The parallel loop can launch itself inside an isolated detached worktree via
  `AI_PLAYTEST_WORKTREE=/path/to/worktree ./playtest_loop.sh`; `AI_PLAYTEST_AUTO_COMMIT=1` commits
  and pushes only `PLAYTEST_DIGEST.md` and `playtest-feedback/sessions.jsonl` after consolidation.
- Route-importance weighting is maintained in `src/playtest-route-importance.ts`; consolidation
  tags ranked issues with `route:main|supporting|optional` and gives main-path clusters a priority
  multiplier without fabricating issues.

## Remaining open items

- Run enough real multi-family blind sessions to produce the first non-empty `PLAYTEST_DIGEST.md`.
- Keep the maintained main/supporting path list current as the story grows.
