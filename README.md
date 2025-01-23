# Welcome

You can view the [demo](https://sploosh-ai-hockey-analytics.vercel.app/) on Vercel at [https://sploosh-ai-hockey-analytics.vercel.app/](https://sploosh-ai-hockey-analytics.vercel.app/)

## Background

This project was initially created on `Thu May 25 19:07:08 2023 -0700` to generate a shot chart using game data provided by the NHL. It was initially based on the previous NHL stats API [https://statsapi.web.nhl.com/api/v1](https://statsapi.web.nhl.com/api/v1), which was deprecated on `November 7th, 2023`.

This change completely broke my initial NHL shot chart implementation.

Work is underway to rewrite the NHL shot chart to accommodate the new endpoints and data structure, though no release date has been targeted as of this writing.

**IMPORTANT:** The NHL Edge API is publicly available; however, it is undocumented and subject to change. [@Zmalski](https://github.com/Zmalski) has created an excellent repo at [https://github.com/Zmalski/NHL-API-Reference](https://github.com/Zmalski/NHL-API-Reference) which is a fantastic guide for working with the NHL Edge API in your projects.

## Demo

This application is deployed on Vercel and can be accessed at <https://sploosh-ai-hockey-analytics.vercel.app/>

## Development

The application will be available at <http://localhost:3000> regardless of which method you choose.

## Version Control and Signed Commits

This project uses semantic versioning with automated version bumps and requires signed commits. When a PR is merged to main:

1. The version is automatically bumped based on the PR title:
   - `feat!:` → Major version (breaking changes)
   - `feat:` → Minor version (new features)
   - All others → Patch version (fixes, docs, etc.)

2. A new PR is automatically created with:
   - Updated version numbers in all package.json files
   - Automated testing and validation
   - GPG-signed commits from the GitHub Actions bot
   - Auto-merge once checks pass

## Signed Commits

All commits must be signed. This includes:
- Manual commits from contributors
- Automated commits from GitHub Actions

The project uses GPG keys for signing commits:
- Contributors should [set up GPG signing](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification) for their local environment
- GitHub Actions use an automated signing process with a dedicated GPG key

For more details on contributing, see [CONTRIBUTING.md](./.github/CONTRIBUTING.md).

### Option 1: Local Development

Install dependencies and start the development server:

```bash
# Navigate to the app
cd apps/sploosh-ai-hockey-analytics

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Option 2: Using Docker

If you prefer to use Docker, you can use these commands:

```bash
# Build and start the container
npm run docker:up

# Run in detached mode (optional)
npm run docker:up:detach

# Stop the container
npm run docker:down
```
### Testing GitHub Actions Locally

We recommend using [act](https://github.com/nektos/act) to test GitHub Actions workflows locally before pushing changes if you are developing on a Mac.

The application does not have to be running in Docker to test the workflows, but Docker Desktop must be running for the act tests to run and spin up the necessary containers.

#### Prerequisites for macOS
- Homebrew
- Docker Desktop (must be running)

#### Installation

```
# Install act using Homebrew
brew install act

# Verify installation
act --version  # Should show 0.2.71 or higher
```

Note: Docker Desktop must be running before using act to test workflows locally.

#### Expected Test Results

1. Semantic PR Check Tests:
   - All tests should complete successfully except the "invalid" test
   - The invalid PR format test should fail with a clear error message

2. Version Bump Tests:
   - These will show git authentication errors locally
   - Messages like "Permission denied (publickey)" are expected
   - These workflows can only be fully tested in GitHub Actions environment
   - Local tests still verify the workflow syntax and basic functionality

#### What Each Script Tests

1. `test:workflows`
   - Runs all workflow tests in sequence
   - Tests valid PR titles, invalid formats, and breaking changes
   - Tests version bumping functionality
   - Provides detailed feedback for each test

2. `test:workflows:semantic`
   - Tests PR title validation only
   - Validates against conventional commit format
   - Checks for proper semantic versioning prefixes

3. `test:workflows:version`
   - Tests version bump workflow
   - Verifies proper version incrementing
   - Checks synchronization between package.json files
   - Note: Git operations will fail locally due to expected missing credentials (these will be available in the GitHub Actions environment)
