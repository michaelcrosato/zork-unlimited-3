#!/usr/bin/env bash
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: ./playtest_loop.sh [--help]

Runs the parallel BLIND playtesting loop. Each iteration plays the game with a
rotating persona (and rotating model family, if configured) through the masked
interface, appends one structured record to playtest-feedback/sessions.jsonl,
and writes a verbose log to ai-runs/playtest/ (gitignored). Every window it
consolidates accrued feedback into PLAYTEST_DIGEST.md.

This loop is intentionally SEPARATE from the main dev loop (./loop.sh). Run it
in its own worktree/checkout (or container) on the same branch so the two never
race; it only ever writes its own files.

Environment:
  AI_PLAYTEST_CMDS         ';'-separated pool of agent commands across model
                           families (e.g. "claude -p;codex exec --sandbox read-only -;gemini -p").
                           Rotated per session. If unset, the built-in decider
                           plays and records honest quantitative-only feedback.
  AI_PLAYTEST_CONSOLIDATE_CMD  Agent command for the consolidation judge.
                           Use a DIFFERENT family than the coding agent.
  AI_PLAYTEST_PERSONAS     Space-separated personas to rotate. Default: all 7.
  AI_PLAYTEST_VARIANT      no_hints | with_hints | mix. Default: mix.
  AI_PLAYTEST_STORY        Story path. Default: stories/demo.yaml.
  AI_PLAYTEST_MAX_TURNS    Per-run turn cap. Default: 40.
  AI_PLAYTEST_DELAY_MS     Delay between sessions. Default: 10000.
  AI_PLAYTEST_WINDOW_HOURS Consolidation window. Default: 24.
  AI_PLAYTEST_AUTO_COMMIT  1 to commit+push the digest + sessions.jsonl after
                           each consolidation (rebase-retry). Default: 0.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "node_modules not found; running npm install first."
  npm install
fi

PERSONAS=(${AI_PLAYTEST_PERSONAS:-methodical_lore_reader goal_seeker risk_taker casual_clicker completionist story_first systems_skeptic})
IFS=';' read -r -a CMDS <<<"${AI_PLAYTEST_CMDS:-}"
STORY="${AI_PLAYTEST_STORY:-stories/demo.yaml}"
MAX_TURNS="${AI_PLAYTEST_MAX_TURNS:-40}"
DELAY_MS="${AI_PLAYTEST_DELAY_MS:-10000}"
WINDOW_HOURS="${AI_PLAYTEST_WINDOW_HOURS:-24}"
WINDOW_SECONDS=$((WINDOW_HOURS * 3600))
VARIANT_MODE="${AI_PLAYTEST_VARIANT:-mix}"

delay_s=$((DELAY_MS / 1000))
[[ "$delay_s" -lt 1 ]] && delay_s=1

mkdir -p ai-runs/playtest playtest-feedback
export AI_PLAYTEST_COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"

echo "Starting parallel blind playtesting loop."
echo "Personas: ${PERSONAS[*]}"
echo "Model pool: ${AI_PLAYTEST_CMDS:-<builtin decider>}"
echo "Consolidating every ${WINDOW_HOURS}h into PLAYTEST_DIGEST.md."
echo "Press Ctrl-C to stop."

last_consolidate=$(date +%s)
i=0

while true; do
  persona="${PERSONAS[$((i % ${#PERSONAS[@]}))]}"

  if [[ "${#CMDS[@]}" -gt 0 && -n "${CMDS[0]}" ]]; then
    export AI_PLAYTEST_CMD="${CMDS[$((i % ${#CMDS[@]}))]}"
  fi

  case "$VARIANT_MODE" in
    with_hints) variant="with_hints" ;;
    no_hints) variant="no_hints" ;;
    *) if [[ $((i % 4)) -eq 3 ]]; then variant="with_hints"; else variant="no_hints"; fi ;;
  esac

  echo "[session $i] persona=$persona variant=$variant cmd=${AI_PLAYTEST_CMD:-<builtin>}"
  set +e
  node --import tsx src/blind-playtester.ts \
    --persona "$persona" --variant "$variant" --story "$STORY" --max-turns "$MAX_TURNS"
  set -e

  now=$(date +%s)
  if [[ $((now - last_consolidate)) -ge "$WINDOW_SECONDS" ]]; then
    echo "[consolidate] window elapsed; building PLAYTEST_DIGEST.md"
    node --import tsx src/consolidate-feedback.ts || true
    last_consolidate=$now
    if [[ "${AI_PLAYTEST_AUTO_COMMIT:-0}" == "1" ]]; then
      git add PLAYTEST_DIGEST.md playtest-feedback/sessions.jsonl 2>/dev/null || true
      git commit -m "playtest: consolidate blind feedback digest" 2>/dev/null || true
      git pull --rebase origin "$(git rev-parse --abbrev-ref HEAD)" 2>/dev/null || true
      git push origin "$(git rev-parse --abbrev-ref HEAD)" 2>/dev/null || true
    fi
  fi

  i=$((i + 1))
  sleep "$delay_s"
done
