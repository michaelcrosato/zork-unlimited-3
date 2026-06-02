#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: ./playtest_loop.sh [--help]"
  echo ""
  echo "Runs the blind playtesting subagent loop in the background."
  echo "It continuously spawns agents to play the game via MCP and dumps feedback"
  echo "into the playtest-logs/ directory."
  echo ""
  echo "Environment:"
  echo "  PLAYTEST_DELAY_MS  Delay between consecutive blind playtests. Default: 10000."
  exit 0
fi

if [[ ! -d node_modules ]]; then
  echo "node_modules not found; running npm install first."
  npm install
fi

mkdir -p playtest-logs

echo "Starting autonomous blind playtesting loop."
echo "Logs will be written to playtest-logs/."
echo "Press Ctrl-C to stop."

while true; do
  set +e
  # We will execute the blind playtester node script here
  npx tsx src/blind-playtester.ts
  status=$?
  set -e

  delay_ms="${PLAYTEST_DELAY_MS:-10000}"
  delay_s=$((delay_ms / 1000))
  if [[ "$delay_s" -lt 1 ]]; then
    delay_s=1
  fi

  if [[ "$status" != "0" ]]; then
    echo "Playtester exited with status $status; retrying in ${delay_s}s."
  else
    echo "Playtest run completed; starting next in ${delay_s}s."
  fi

  sleep "$delay_s"
done
