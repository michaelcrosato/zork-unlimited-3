# Playtesting Subagent & AI Loop Architecture (June 2026 Brainstorm)

## 1. Context: Frontier Capabilities in Mid-2026

Based on recent developments in the AI space as of June 2026, here is what we know about frontier models and their capabilities regarding autonomous agents and playtesting:

*   **Models:** GPT-5.5 Instant, Claude (latest iterations), and Gemini (latest iterations) are the leading frontier models. Open-source models are highly capable but generally lag behind state-of-the-art closed models by about 4 months in comprehensive benchmarks.
*   **Agentic Frameworks:** The concept of an "autonomous agent" has solidified. It's no longer just chat; it's a model given a goal and a tool surface (like our MCP server), running in a loop (Plan -> Execute -> Observe -> Replan). Frameworks heavily emphasize tool use, strict output formatting, and context management over long horizons.
*   **Playtesting Capabilities:** Research shows LLMs are excellent at acting as playtesters. While they might not perfectly mimic human intuition, their struggles (e.g., getting stuck on a puzzle or taking too many steps) heavily correlate with human difficulty. They can effectively measure difficulty curves and identify confusing narrative branches.

## 2. Playtesting Subagent Design

The goal is to spin up a subagent that "blind-plays" the game, having no access to `stories/*.yaml` or the source code, only the MCP interface.

### The Persona & Goal

*   **Role:** Blind Playtester. You know nothing about this game.
*   **Goal:** Explore the game naturally. Try to find interesting endings, uncover secrets, and understand the narrative.
*   **Rules of Engagement:**
    *   Do not look at the codebase.
    *   Use the MCP tools (`start_game`, `get_scene`, `choose_option`) to interact.
    *   When you hit an ending or get stuck, generate a structured feedback report.

### Feedback Instructions (LLM Shorthand)

The feedback must be dense and actionable for the coding agent. We will use a JSON structure embedded in markdown.

**Prompt for the Subagent:**
> "You have just finished a run. Summarize your experience for the lead developer agent. Use the following JSON schema. Be brutally concise. Focus on mechanical friction, narrative confusion, and pacing. Do not include praise. Use shorthand."

**Feedback Format (LLM Shorthand):**
```json
{
  "run_id": "short_hash",
  "ending_type": "true | good | bad | lost | max_steps",
  "score": 45,
  "friction_points": [
    {"scene": "service_room", "issue": "looped 3 times trying to find key, options unclear"},
    {"scene": "platform", "issue": "force_gate option felt like a trap, lacked warning"}
  ],
  "narrative_gaps": [
    "Found Mara's badge but don't know who Mara is yet."
  ],
  "suggestions": [
    "Add 'examine desk' option in service_room to hint at key location."
  ]
}
```

## 3. Loop Architecture: Main vs. Parallel

Currently, the AI loop (`loop.sh` -> `npm run ai:loop`) executes a cycle: validate, run automated dumb playtests (random/coverage/goal), run one MCP script, generate a report, and hand off to the coding agent.

Where should the *blind* LLM playtester live?

### Option A: Inside the Main AFK Loop
*   **How it works:** Before the coding agent gets the prompt, a subagent is spawned, plays the game 3-5 times, and appends its JSON feedback to the `ai-runs/` report.
*   **Pros:** The coding agent gets immediate, fresh feedback on the exact commit it's about to modify. Synchronous and easy to manage.
*   **Cons:** **Extremely slow.** LLM playtesting takes time (multiple API calls per step). Waiting for 5 blind runs will stall the main development loop significantly.

### Option B: Parallel Loop with 24-Hour Consolidation (Recommended)
*   **How it works:**
    1.  **Dev Loop (`loop.sh`):** Continues as is, focusing on building, testing, and relying on the fast, dumb automated playtests (`src/playtest.ts`) for immediate regression detection.
    2.  **Playtest Loop (`playtest_loop.sh`):** Runs continuously in the background on the latest committed `main` branch. It spins up blind agents, plays games, and dumps the JSON feedback into a `playtest-logs/` directory.
    3.  **Consolidation (Cron/Trigger):** Every 24 hours (or every X commits), a summarization script reads all recent JSON logs. It uses an LLM to identify recurring themes (e.g., "50% of agents got stuck in the service room", "Agents consistently misunderstand the fuse puzzle").
    4.  **Feedback Delivery:** The consolidated report is injected into the primary coding agent's `AI_AGENT_PROMPT.md` or as a new high-priority issue in `AI_LOOP_STATE.md`.

### Recommendation

**Go with Option B (Parallel Loop).**

Frontier models are smart but inference takes time. If we put the blind playtester in the critical path of the main loop, development velocity will plummet.

A parallel loop allows the playtester to accumulate statistically significant qualitative data (e.g., 50 runs overnight). The 24-hour consolidation turns noisy, individual agent complaints into clear, actionable development priorities for the coding agent's next planning window.

This matches the reality of human game development: developers build and run automated tests locally, while QA teams (or early access players) play the game asynchronously and submit bug reports that are triaged later.
