#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage: ./loop.sh [--once] [--evidence-only] [--help]

Runs the autonomous CYOA development loop from bash.

Options:
  --once           Run one cycle and exit.
  --evidence-only  Generate reports/prompts without invoking an AI coding agent.
  --help           Show this help.

Environment:
  AI_AGENT_CMD          Command that receives the cycle prompt on stdin.
  AI_LOOP_DELAY_MS      Delay between cycles. Default: 300000.
  AI_LOOP_MAX_CYCLES    Stop after this many cycles.
  AI_AGENT_TIMEOUT_MS   Agent timeout. Default: 3600000. Set 0 to disable.
  AI_CODEX_SANDBOX      Codex sandbox. Default: workspace-write.
  AI_LOOP_AUTO_COMMIT   Commit verified agent changes. Default: 1.
  AI_LOOP_AUTO_PUSH     Push verified commits. Default: 1.
  AI_LOOP_ALLOW_DIRTY_BASELINE
                        Allow auto-commit from a dirty starting tree. Default: 0.

Examples:
  ./loop.sh
  ./loop.sh --once
  ./loop.sh --evidence-only
  AI_CODEX_SANDBOX=danger-full-access ./loop.sh
  AI_AGENT_CMD='claude -p' ./loop.sh
  AI_AGENT_CMD='gemini -p' ./loop.sh
EOF
}

RUN_ONCE=0
EVIDENCE_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --once)
      RUN_ONCE=1
      ;;
    --evidence-only)
      EVIDENCE_ONLY=1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ ! -d node_modules ]]; then
  echo "node_modules not found; running npm install first."
  npm install
fi

if [[ "$EVIDENCE_ONLY" == "1" ]]; then
  export AI_LOOP_EVIDENCE_ONLY=1
  unset AI_AGENT_CMD
elif [[ -z "${AI_AGENT_CMD:-}" ]]; then
  if command -v codex >/dev/null 2>&1; then
    CODEX_SANDBOX="${AI_CODEX_SANDBOX:-workspace-write}"
    export AI_AGENT_CMD="codex exec --cd \"$ROOT_DIR\" --sandbox \"$CODEX_SANDBOX\" --ask-for-approval never -"
  else
    export AI_LOOP_EVIDENCE_ONLY=1
    echo "No AI_AGENT_CMD set and codex was not found; running evidence-only."
  fi
fi

echo "Starting autonomous AI loop."
echo "Reports will be written to ai-runs/."
if [[ "${AI_LOOP_EVIDENCE_ONLY:-0}" == "1" ]]; then
  echo "Mode: evidence-only. Prompts will be generated but no agent will edit the repo."
else
  echo "Mode: agent. AI_AGENT_CMD=$AI_AGENT_CMD"
  echo "Post-agent automation: auto-commit=${AI_LOOP_AUTO_COMMIT:-1}, auto-push=${AI_LOOP_AUTO_PUSH:-1}"
fi
echo "Press Ctrl-C to stop."

if [[ "$RUN_ONCE" == "1" ]]; then
  exec npm run ai:cycle
else
  exec npm run ai:loop
fi
