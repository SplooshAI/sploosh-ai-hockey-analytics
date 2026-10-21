#!/usr/bin/env bash
#
# Publishes screenshots to the `pr-screenshots` branch and prints a Markdown
# before/after table that links each image by COMMIT SHA.
#
# Why a separate branch and a SHA: PR bodies and comments only render images
# from absolute URLs, a relative path does not resolve. Linking the branch name
# breaks when a branch is deleted. A SHA on a branch that is never deleted or
# merged stays valid forever, and the images never bloat `main`.
#
# Usage:
#   ./scripts/pr-screenshots/publish.sh <pr-number> <dir-with-pngs>
#
# Prints the Markdown to stdout (progress goes to stderr). Needs push access.
#
set -euo pipefail

PR="${1:-}" DIR="${2:-}"
[ -n "$PR" ] && [ -d "$DIR" ] || { echo "Usage: $0 <pr-number> <dir-with-pngs>" >&2; exit 1; }

REPO_ROOT="$(git rev-parse --show-toplevel)"
SLUG="$(git -C "$REPO_ROOT" remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
BRANCH="pr-screenshots"
# CI checks out a merge commit, so it passes the PR head SHA explicitly.
HEAD_SHA="${SHOT_SHA:-$(git -C "$REPO_ROOT" rev-parse --short HEAD)}"
DEST="pr-$PR/$HEAD_SHA"
TREE="$(mktemp -d)"
trap 'git -C "$REPO_ROOT" worktree remove --force "$TREE" 2>/dev/null || true; rm -rf "$TREE"' EXIT

for attempt in 1 2 3 4 5; do
  # The full ref matters: a bare name also matches any branch that merely ends
  # in it, such as 2026.10.21/pr-screenshots.
  if [ -n "$(git -C "$REPO_ROOT" ls-remote --heads origin "refs/heads/$BRANCH")" ]; then
    git -C "$REPO_ROOT" fetch -q origin "refs/heads/$BRANCH"
    git -C "$REPO_ROOT" worktree add --detach "$TREE" FETCH_HEAD >/dev/null
  else
    git -C "$REPO_ROOT" worktree add --detach "$TREE" HEAD >/dev/null
    git -C "$TREE" checkout -q --orphan "$BRANCH"
    git -C "$TREE" rm -rfq . 2>/dev/null || true
    printf '# PR screenshots\n\nImages for pull request comments, written by `scripts/pr-screenshots/publish.sh`.\nThis branch is never merged or deleted: PR comments link to its commits by SHA.\n' > "$TREE/README.md"
    git -C "$TREE" add README.md
  fi
  mkdir -p "$TREE/$DEST"
  cp "$DIR"/*.png "$TREE/$DEST/"
  git -C "$TREE" add "$DEST"
  git -C "$TREE" -c user.name="${GIT_AUTHOR_NAME:-$(git -C "$REPO_ROOT" config user.name)}" \
                 -c user.email="${GIT_AUTHOR_EMAIL:-$(git -C "$REPO_ROOT" config user.email)}" \
                 -c commit.gpgsign=false \
                 commit -q -m "Screenshots for PR #$PR at $HEAD_SHA"
  if git -C "$TREE" push -q origin "HEAD:refs/heads/$BRANCH" 2>/dev/null; then break; fi
  echo "push raced with another publish, retrying ($attempt)" >&2
  git -C "$REPO_ROOT" worktree remove --force "$TREE"; TREE="$(mktemp -d)"
  [ "$attempt" = 5 ] && { echo "Could not push $BRANCH" >&2; exit 1; }
done

PUB_SHA="$(git -C "$TREE" rev-parse HEAD)"
RAW="https://raw.githubusercontent.com/$SLUG/$PUB_SHA/$DEST"

# Every image must actually be reachable before the Markdown is used.
for f in "$DIR"/*.png; do
  url="$RAW/$(basename "$f")"
  for _ in 1 2 3 4 5 6; do
    [ "$(curl -s -o /dev/null -w '%{http_code}' "$url")" = 200 ] && continue 2
    sleep 2
  done
  echo "Image not reachable: $url" >&2; exit 1
done

echo "| Page | Before | After |"
echo "| --- | --- | --- |"
for f in "$DIR"/after-*.png; do
  name="$(basename "$f" .png)"; name="${name#after-}"
  echo "| \`$name\` | ![before $name]($RAW/before-$name.png) | ![after $name]($RAW/after-$name.png) |"
done
