#!/usr/bin/env bash
# Classify a conventional-commit PR title for the semantic PR check and the version bump.
# Accepts an optional scope and breaking marker: type(scope)!: description
# Prints major, minor, or patch. Prints nothing and exits 1 for an invalid title.
set -euo pipefail

TITLE="${1:-}"
TITLE_RE='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([^)]+\))?(!)?:'

if [[ ! $TITLE =~ $TITLE_RE ]]; then
  exit 1
fi

if [[ -n ${BASH_REMATCH[3]} ]]; then
  echo major
elif [[ ${BASH_REMATCH[1]} == feat ]]; then
  echo minor
else
  echo patch
fi
