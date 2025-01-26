# Testing Workflows

## Local Testing with `act`

When testing workflows locally using `act`:

1. Semantic PR checks will run completely
2. Version bump workflow will:
   - Skip GPG signing (requires GitHub environment)
   - Skip external action downloads
   - Test basic workflow structure and syntax

### Expected Test Results

1. Semantic PR Check Tests:
   - All tests should complete successfully except the "invalid" test
   - The invalid PR format test should fail with a clear error message

2. Version Bump Tests:
   - These will show git authentication errors locally
   - Messages like "authentication required" are expected
   - These workflows can only be fully tested in GitHub Actions environment
   - Local tests still verify the workflow syntax

his is normal because:
- GPG signing requires GitHub's environment
- External actions can't be downloaded during local testing
- GitHub authentication isn't available locally

### What's Being Tested

✅ Local Testing Verifies:
- Workflow syntax is valid
- PR title validation logic works
- Breaking change detection works
- Basic workflow structure

⏭️ Skipped in Local Testing:
- GitHub Actions bot commit signing
- External action execution
- GitHub authentication

These features are automatically tested when the PR is pushed to GitHub.

## GitHub Environment Testing

When these workflows run in GitHub Actions:
1. All authentication will work properly
2. GPG signing will be active
3. Commits will show as verified
4. External actions will execute normally

No local git configuration or GPG settings are affected during any testing.
