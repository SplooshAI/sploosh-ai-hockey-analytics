#!/bin/bash

echo "🧪 Testing GitHub Actions workflows..."
echo ""

echo "📋 Testing Semantic PR Check workflow..."
echo ""

echo "1. Testing valid PR..."
act pull_request -e .github/test-pr-event.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "2. Testing invalid PR..."
act pull_request -e .github/test-pr-event-invalid.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "3. Testing breaking change PR..."
act pull_request -e .github/test-pr-event-breaking.json -W .github/workflows/semantic-pr-check.yml --container-architecture linux/amd64
echo ""

echo "🔄 Testing Version Bump workflow..."
act workflow_dispatch -W .github/workflows/version-bump.yml --container-architecture linux/amd64 