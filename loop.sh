#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found; running npm install first."
  npm install
fi

echo "Starting autonomous AI loop."
echo "Reports will be written to ai-runs/."
echo "Press Ctrl-C to stop."

exec npm run ai:loop
