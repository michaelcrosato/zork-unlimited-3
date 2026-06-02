# Memory Handoff

Updated: 2026-06-02

## Current Repo State

- Repo: `/home/michael_crosato/projects/zork-unlimited-3`
- Remote: `origin https://github.com/michaelcrosato/zork-unlimited-3.git`
- Current branch: `main`
- Current commit: `de1e052a3e5d3fb097984142de227e8ce6aee133`
- `main` matches `origin/main`.
- Worktree was clean before this handoff file was created.
- Quality branch: `chore/repo-quality-overhaul`
- Quality branch commit: `b91e7bc8a71ec1a18c2ee8f07ae561a918fcf373`
- `chore/repo-quality-overhaul` is merged into `main`.

## What Happened Recently

- The repo quality pass was completed, pushed, merged to `main`, and pushed to GitHub.
- Merge commit on `main`: `de1e052 chore: merge repo quality overhaul`.
- Main quality commit: `b91e7bc chore: sync quality branch and extract ai loop metrics`.
- The stale `chore/repo-quality-overhaul` branch was synced with current `main` before merging, so its large diff was mostly branch catch-up plus a focused cleanup.
- Generated artifacts remain ignored: `saves/*.json`, `transcripts/*.md`, `ai-runs/*`, `OUTPUTLOG.md`.

## Most Important Code Changes

- Added `src/ai-loop-metrics.ts`.
  - Extracted restart detection, git porcelain parsing, exploratory route constants, and ideal-ending metrics out of `src/ai-loop.ts`.
  - `src/ai-loop.ts` still re-exports the same helper names for compatibility.
- Added `tests/ai-loop-metrics.test.ts`.
  - Covers missing summary behavior, path normalization, and restart-sensitive path detection.
- Preserved recent story/test changes around Mara badge proof:
  - `stories/demo.yaml` allows the badge-proof intercom choice alongside the thumbprint route.
  - `tests/story-paths.test.ts` now exercises `inspect_badge_back` and asserts `knows_badge_proof`.

## Verified Results

Commands that passed during the quality pass:

```bash
npm install
npm run format:check
npm run lint
npm test
npm run health
npm run ai:cycle
```

Final known `npm run health` result:

- Prettier: pass
- TypeScript: pass
- Vitest: 7 test files passed, 135 tests passed
- Story validation: `ok: true`, 115 scenes, 24 endings, 115 reachable, no warnings/errors
- Coverage playtest: 1085 runs, 994 ended, 0 unfinished, 91 frontier samples, 0 unvisited scenes, best score 100, max-score runs 951

## Manual MCP Play Notes

Played through MCP using `start_game`, repeated `choose_option`, and `get_transcript`.

Save path used:

```text
saves/repo-quality-overhaul-mcp.json
```

Route reached:

- Final scene: `true_ending`
- Score: `100/100`
- Objectives ended empty

Useful route choices:

```text
read_notice
take_lantern_after_notice
inspect_clock
take_token
open_service_door
read_personnel_file
keep_mara_file
take_map
tune_radio
note_radio_route
search_locker
take_fuse
take_badge
inspect_badge_back
return_from_badge_memory
close_locker
go_to_platform
install_fuse
use_token_slot
inspect_signal_ledger
mark_mara_clear_from_ledger
ask_mara_for_last_dispatch
board_after_last_dispatch
listen_to_last_dispatch_intercom
pull_release_after_last_dispatch_goodbye
```

Play feedback:

- Opening signposting is clear: notice introduces map, dispatcher, and release.
- Personnel file clearly connects badge, token, stopped clock, and Mara's ledger.
- Badge-back beat is discoverable immediately after taking Mara's badge.
- Midgame narrows cleanly once required items are collected.
- Mild intentional tension: after inspecting the ledger, the objective nudges toward the passenger manifest while "clear only Mara" remains legal.

## Quick Recovery Commands

```bash
cd /home/michael_crosato/projects/zork-unlimited-3
git status --short --branch
git log --oneline --decorate --graph -8
npm run health
npm run mcp
```

To verify the branch merge state:

```bash
git rev-parse main origin/main chore/repo-quality-overhaul origin/chore/repo-quality-overhaul
git merge-base --is-ancestor chore/repo-quality-overhaul main
```
