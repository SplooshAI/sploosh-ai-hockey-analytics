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
act push -e .github/test-data/pr-events/merge.json -W .github/workflows/main-merge.yml --container-architecture linux/amd64
echo ""

echo "Testing version bump types with merge commits..."
for type in major minor patch; do
  echo "Testing $type version bump from merge commit..."
  # Create temporary merge commit event file
  jq '.commits[0].message = "Merge pull request #123 from SplooshAI:feature/test\n\n" + (.pull_request.title)' \
    .github/test-data/pr-events/$type.json > .github/test-data/pr-events/$type-merge.json
  act push -W .github/workflows/main-merge.yml --container-architecture linux/amd64 -e .github/test-data/pr-events/$type-merge.json
  rm .github/test-data/pr-events/$type-merge.json
  echo ""
done 