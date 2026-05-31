# Zork Unlimited 3

A minimal choose-your-own-adventure engine built so an LLM can inspect, play, validate, and revise the game.

## Quickstart

```bash
npm install
npm test
npm run cyoa -- validate stories/demo.yaml
npm run cyoa -- start stories/demo.yaml --save saves/run.json
npm run cyoa -- scene --save saves/run.json --json
npm run cyoa -- choose take_lantern --save saves/run.json --json
npm run cyoa -- transcript --save saves/run.json
npm run cyoa -- playtest stories/demo.yaml --runs 100 --strategy coverage --summary --json
```

## AI Automation

The repo includes a repeatable autonomous-development loop:

```bash
npm run health
npm run ai:cycle
npm run ai:loop
```

From bash, the simplest long-running command is:

```bash
./loop.sh
```

- `health` is the required gate before commits.
- `ai:cycle` runs one evidence-gathering cycle and writes a report to `ai-runs/`.
- `ai:loop` repeats cycles indefinitely until interrupted.

See [`AGENTS.md`](./AGENTS.md) and [`AI_LOOP_STATE.md`](./AI_LOOP_STATE.md) for agent handoff instructions.

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
