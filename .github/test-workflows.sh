#!/bin/bash

echo "🧪 Testing GitHub Actions workflows..."
echo ""

echo "📋 Testing Semantic PR Check workflow..."
echo ""

echo "1. Testing major version bump (breaking change)..."
act pull_request -e .github/test-data/pr-events/major.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "2. Testing minor version bump (new feature)..."
act pull_request -e .github/test-data/pr-events/minor.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "3. Testing patch version bump (fix)..."
act pull_request -e .github/test-data/pr-events/patch.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "4. Testing invalid PR format..."
act pull_request -e .github/test-data/pr-events/invalid.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "🔄 Testing Version Bump workflow..."
echo ""

echo "Testing merge commit message parsing..."
PR_TITLE="fix: configure GitHub Actions bot identity" \
GITHUB_EVENT_NAME="pull_request" \
act workflow_dispatch -W .github/workflows/main-merge.yml
echo ""

echo "Testing version bump types with merge commits..."
echo "Testing major version bump from merge commit..."
PR_TITLE="feat!: breaking change test" \
GITHUB_EVENT_NAME="pull_request" \
act workflow_dispatch -W .github/workflows/main-merge.yml
echo ""

echo "Testing minor version bump from merge commit..."
# Create temporary merge commit event file
jq '.commits[0].message = "Merge pull request #123 from SplooshAI:feature/test\n\n" + (.pull_request.title)' \
  .github/test-data/pr-events/minor.json > .github/test-data/pr-events/minor-merge.json
act push -W .github/workflows/main-merge.yml --container-architecture linux/amd64 -e .github/test-data/pr-events/minor-merge.json
rm .github/test-data/pr-events/minor-merge.json
echo ""

echo "Testing patch version bump from merge commit..."
# Create temporary merge commit event file
jq '.commits[0].message = "Merge pull request #123 from SplooshAI:feature/test\n\n" + (.pull_request.title)' \
  .github/test-data/pr-events/patch.json > .github/test-data/pr-events/patch-merge.json
act push -W .github/workflows/main-merge.yml --container-architecture linux/amd64 -e .github/test-data/pr-events/patch-merge.json
rm .github/test-data/pr-events/patch-merge.json
echo "" 