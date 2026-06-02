# Playtest Consolidator Contract

Every window (default 24h) `src/consolidate-feedback.ts` turns the noisy stream of per-session
records in `playtest-feedback/sessions.jsonl` into ONE actionable artifact, `PLAYTEST_DIGEST.md`,
that the coding agent reads at the start of each planning window.

## Pipeline (mechanical, deterministic)

1. Read every compact record with `ts` after the last watermark (`--all` ignores the watermark).
2. **Quant:** ending distribution, % reached an ending, true-ending rate, median turns, score
   stats, top stuck scenes, per-persona / per-model breakdown, parse-error rate.
3. **Dedupe** issues by `id`; per cluster track frequency, max severity, unique personas, unique
   models, scenes, best confidence, a sample evidence snippet.
4. **Rank** by
   `priority = severity_weight × frequency × unique_personas × confidence_weight × route_importance`
   (`S0=100 … S4=2`; confidence `high=1.5 med=1 low=0.6`; route weights are maintained in
   `src/playtest-route-importance.ts`).
5. **Promote** a cluster only if: any `S0`/`S1`; `S2` seen in ≥2 sessions; `S3` in ≥4; or it spans
   ≥2 personas. Everything else is parked under **Do not overreact** (score-smoothing).
6. Flag **cross-model agreement** (≥2 model families) as higher confidence.
7. Diff against the previous digest's `<!-- ids: … -->` marker → persisting / resolved.

## The LLM judge is optional and STRICTLY data-bound

If `AI_PLAYTEST_CONSOLIDATE_CMD` is set, the mechanically aggregated clusters (and only those) are
handed to a judge — **on a different model family than the coding agent**, and blind to which
model produced which record — to name themes and propose next-window priorities. It must not
invent issues absent from the data. If the judge is unavailable or its output doesn't parse, the
digest falls back to **data-derived** priorities. Never emit a fabricated or hardcoded theme.

## LLM-weakness control

Blind LLMs make minimal progress on interactive fiction without hints and hallucinate long-horizon
state (TextQuests, TALES). So a stuck/confusion cluster is a **game** fault only when the
mechanical `goal` solver reaches that region, or a `with_hints` run clears what `no_hints` runs
couldn't. Otherwise tag it "model-limitation / low-confidence" — never redesign the game around
the model's own weakness.

## Digest section layout (newest on top)

`meta` (sessions, models, personas, parse-errors) · `quant` line · **Ranked issues** (`[sev cat]
[freq/runs][personas][cross-model][route][control] id @scene — evidence (prio)`) · **Do not overreact** ·
**Working (preserve)** · **Persisting / resolved** · **Next-window priorities** (machine-readable
`yaml priorities:` block of `id` / `action` / `scenes` / `add_test`).

## How the coding agent uses it

Read only the top section. Fix recurring **S0–S2** first; ignore one-off **S3/S4** unless they
align with current work. When you fix a clustered issue, reproduce it from the issue's `repro`
choice path and add a regression test (`tests/story-paths.test.ts`).
