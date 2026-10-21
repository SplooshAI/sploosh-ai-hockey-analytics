#!/usr/bin/env bash
#
# Builds the app at two git refs, serves each one, and captures the pages in
# shots.json from both, so a PR shows a real before and after.
#
# Always builds from source and queries the live NHL API: never reuse an old
# build or a cached screenshot, because the point is to show what the code
# produces right now.
#
# Usage:
#   ./scripts/pr-screenshots/run.sh --base <ref> --head <ref> --out <dir>
#   e.g. ./scripts/pr-screenshots/run.sh --base origin/main --head HEAD --out screenshots
#
# Output: <dir>/before-<name>.png and <dir>/after-<name>.png for each shot.
#
set -euo pipefail

BASE="" HEAD_REF="" OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --base) BASE="$2"; shift 2 ;;
    --head) HEAD_REF="$2"; shift 2 ;;
    --out)  OUT="$2"; shift 2 ;;
    *) echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done
[ -n "$BASE" ] && [ -n "$HEAD_REF" ] && [ -n "$OUT" ] || { sed -n '2,/^set -euo/p' "$0" | sed '$d' | sed 's/^# \{0,1\}//' >&2; exit 1; }

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HERE="$REPO/scripts/pr-screenshots"
APP_REL="apps/sploosh-ai-hockey-analytics"
OUT="$(mkdir -p "$OUT" && cd "$OUT" && pwd)"
WORK="$(mktemp -d)"
SERVER_PID=""

cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  for w in "$WORK"/before "$WORK"/after; do
    [ -d "$w" ] && git -C "$REPO" worktree remove --force "$w" 2>/dev/null || true
  done
  rm -rf "$WORK"
}
trap cleanup EXIT

echo "==> Installing the capture tooling"
( cd "$HERE" && npm install --no-audit --no-fund --silent && npx --no-install playwright install chromium >/dev/null )

capture_ref() {
  local label="$1" ref="$2" port="$3"
  local tree="$WORK/$label"
  echo "==> [$label] $ref: building"
  git -C "$REPO" worktree add --detach "$tree" "$ref" >/dev/null
  local app="$tree/$APP_REL"
  ( cd "$app" && npm ci --no-audit --no-fund --silent && npm run build >"$WORK/$label-build.log" 2>&1 ) \
    || { echo "Build failed for $ref:" >&2; tail -30 "$WORK/$label-build.log" >&2; exit 1; }

  echo "==> [$label] serving on :$port"
  ( cd "$app" && exec npx --no-install next start -p "$port" ) >"$WORK/$label-server.log" 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 60); do
    curl -fsS -o /dev/null "http://localhost:$port/" 2>/dev/null && break
    sleep 1
  done
  curl -fsS -o /dev/null "http://localhost:$port/" || { echo "Server did not start:" >&2; tail -20 "$WORK/$label-server.log" >&2; exit 1; }

  echo "==> [$label] capturing"
  node "$HERE/capture.mjs" "http://localhost:$port" "$OUT" "$label"
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  SERVER_PID=""
}

capture_ref before "$BASE" 3100
capture_ref after "$HEAD_REF" 3101

echo "==> Screenshots in $OUT"
ls -1 "$OUT"/*.png
