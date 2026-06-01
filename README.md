# Zork Unlimited 3

A minimal choose-your-own-adventure engine built so an LLM can inspect, play, validate, and revise the game.

## Current AI-Maintained Version Highlights

- MCP-first autonomous maintenance loop with report, prompt, verification,
  commit, and push automation.
- Haunted transit interactive-fiction story with 23 reachable scenes and 5
  endings.
- Deterministic 100-point score model exposed through observations, CLI, MCP,
  and playtest summaries.
- Score-guided goal self-play reaches the 100/100 true ending reliably; chaotic
  random self-play now discovers every scene in 250 runs but still rarely earns
  max score.

## Quickstart

```bash
npm install
npm test
npm run cyoa -- validate stories/demo.yaml
npm run cyoa -- start stories/demo.yaml --save saves/run.json
npm run cyoa -- scene --save saves/run.json --json
npm run cyoa -- choose take_lantern --save saves/run.json --json
npm run cyoa -- score --save saves/run.json --json
npm run cyoa -- transcript --save saves/run.json
npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy coverage --summary --json
npm run cyoa -- playtest stories/demo.yaml --runs 10 --strategy goal --summary --json
```

## AI Automation

The repo includes a repeatable autonomous-development loop. Each cycle validates
the game, runs automated playtests, actually plays a route through the MCP
server, writes a report, writes an agent prompt, and can hand that prompt to a
coding agent.

```bash
npm run health
npm run ai:cycle
npm run ai:loop
```

From bash, the simplest long-running command is:

```bash
./loop.sh
```

If `codex` is installed, `./loop.sh` automatically runs Codex non-interactively
each cycle. The default follows current Codex guidance by granting write access
to the repo workspace, while the outer loop handles commits and pushes after
verification:

```bash
codex exec --cd "$PWD" --sandbox workspace-write --ask-for-approval never -
```

Use `AI_CODEX_SANDBOX=danger-full-access` only for a trusted disposable
environment where Codex needs broader host access.

Use another agent by setting `AI_AGENT_CMD`. The command receives the generated
cycle prompt on stdin.

```bash
AI_AGENT_CMD='claude -p' ./loop.sh
AI_AGENT_CMD='gemini -p' ./loop.sh
```

Run without allowing an agent to edit the repo:

```bash
./loop.sh --evidence-only
```

- `health` is the required gate before commits.
- `ai:cycle` runs one evidence-gathering cycle and writes a report to `ai-runs/`.
- `ai:loop` repeats cycles indefinitely until interrupted. After the agent
  returns, it detects repo changes or unpushed commits, reruns `health`, plays
  the game through MCP, commits verified changes, and pushes to GitHub.
- `AI_LOOP_DELAY_MS` controls the delay between cycles.
- `AI_LOOP_MAX_CYCLES` limits the loop for dry runs.
- `AI_AGENT_TIMEOUT_MS` controls the per-agent timeout.
- `AI_LOOP_AUTO_COMMIT=0` disables the outer-loop commit step.
- `AI_LOOP_AUTO_PUSH=0` disables the outer-loop push step.
- `AI_LOOP_ALLOW_DIRTY_BASELINE=1` lets the loop commit even if the repo was
  dirty before the agent started. Leave this off for normal AFK runs.
- `CODEX_HOME=$PWD/.codex ./loop.sh` makes Codex load this repo's sample MCP
  server config.

See [`AGENTS.md`](./AGENTS.md) and [`AI_LOOP_STATE.md`](./AI_LOOP_STATE.md) for agent handoff instructions.
See [`IMPROVEMENT_LOG.md`](./IMPROVEMENT_LOG.md) for persistent self-play
metrics and maintainer feedback.

## MCP Server

Run the stdio MCP server from the project root:

```bash
npm run mcp
```

Agent/client config generally needs this command:

```json
{
  "command": "npm",
  "args": ["run", "mcp"],
  "cwd": "/home/michael_crosato/projects/zork-unlimited-3"
}
```

Available tools:

- `list_stories`
- `validate_story`
- `start_game`
- `get_scene`
- `choose_option`
- `get_state`
- `get_score`
- `get_transcript`
- `run_playtest`

## LLM Development Loop

1. Edit story data in `stories/*.yaml`.
2. Run `npm run cyoa -- validate stories/demo.yaml`.
3. Start or resume a save in `saves/*.json`.
4. Use `scene --json` to inspect legal choices.
5. Use `choose <choice_id>` to advance.
6. Read `transcript` output for playtest feedback.
7. Run `playtest` to sample paths automatically and inspect ending/scene coverage.

Observations include a derived `objectives` array. These are not stored in saves;
they are generated from the current flags and inventory so agents have lightweight
guidance without the story needing a separate quest log.

## Story Format

Each story is a graph of scenes. Choices can have conditions and effects.

```yaml
id: demo
title: Lantern in the Underpass
start: entrance
scenes:
  entrance:
    text: You stand at the mouth of a rain-dark underpass.
    choices:
      - id: take_lantern
        label: Take the brass lantern
        to: tunnel
        effects:
          addItem: lantern
          set:
            has_light: true
```
