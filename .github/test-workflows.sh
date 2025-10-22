#!/bin/bash

# Function to clean up any orphaned act containers
cleanup_act_containers() {
  echo "🧹 Cleaning up any orphaned act containers..."
  orphaned_containers=$(docker ps --filter "name=act-" -q)
  if [ -n "$orphaned_containers" ]; then
    echo "Found orphaned containers: $orphaned_containers"
    docker stop $orphaned_containers
    docker rm $orphaned_containers
    echo "Containers removed successfully"
  else
    echo "No orphaned containers found"
  fi
}

# Ensure cleanup happens on script exit
trap cleanup_act_containers EXIT

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
act push -e .github/test-data/pr-events/merge.json -W .github/workflows/main-merge.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token" -s GPG_PRIVATE_KEY="test-key" -s GPG_PASSPHRASE="test-passphrase"
echo ""

# Add test for our new GPG signing functionality
echo "Testing GPG signing with GitHub Actions bot..."
act push -e .github/test-data/pr-events/merge-bot-signed.json -W .github/workflows/main-merge.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token" -s GPG_PRIVATE_KEY="test-key" -s GPG_PASSPHRASE="test-passphrase"
echo "" 

# Test GHCR cleanup workflow
echo "🧹 Testing GHCR Cleanup workflow..."
echo ""

echo "1. Testing default dry run mode..."
act workflow_dispatch -e .github/test-data/ghcr/dry-run.json -W .github/workflows/cleanup_ghcr.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
echo ""

echo "2. Testing custom keep_versions parameter..."
act workflow_dispatch -e .github/test-data/ghcr/keep-versions.json -W .github/workflows/cleanup_ghcr.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
echo ""

echo "3. Testing custom keep_days parameter..."
act workflow_dispatch -e .github/test-data/ghcr/keep-days.json -W .github/workflows/cleanup_ghcr.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
echo ""

echo "4. Testing actual cleanup (non-dry run)..."
echo "⚠️  This test would perform actual deletions if run against a real repository."
act workflow_dispatch -e .github/test-data/ghcr/actual-cleanup.json -W .github/workflows/cleanup_ghcr.yml --container-architecture linux/amd64 -s GITHUB_TOKEN="test-token"
echo ""

# Test Secrets Verification workflow
echo "🔐 Testing Secrets Verification workflow..."
echo ""

echo "Testing secrets workflow template (no secrets configured)..."
act workflow_dispatch -W .github/workflows/test_secrets.yml
echo ""