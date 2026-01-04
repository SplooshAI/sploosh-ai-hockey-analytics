# Deployment Guide

This document provides detailed information about the deployment process
for the Sploosh AI Hockey Analytics application.

## Quick Reference - Available Scripts

All commands are run from the project root using npm:

| Command | Description |
| ------- | ----------- |
| `npm run docker:up` | **⭐ Start development Docker containers (recommended)** |
| `npm run docker:build` | Build and start development containers (no cache) |
| `npm run docker:prod:up` | Start production Docker containers |
| `npm run docker:prod:build` | Build and start production containers (no cache) |
| `npm run dev` | Start development server (without Docker) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run linter |
| `npm test` | Run all workflow tests |
| `npm run ghcr:build` | Build image for GitHub Container Registry |

**Recommended:** Use Docker for development (`npm run docker:up`) to
ensure environment consistency.

See the [Build and Deployment](#build-and-deployment) section for
complete command details.

## CI/CD Pipeline Overview

Our application uses GitHub Actions for continuous integration and
deployment. The main workflows are:

1. **semantic-pr-check.yml**: Validates PR titles follow semantic versioning format
2. **pr-build-check.yml**: Runs build checks on pull requests
3. **main-merge.yml**: Automatically bumps version and creates version
   bump PRs when changes are merged to main
4. **cleanup_ghcr.yml**: Cleans up old container images from GitHub Container Registry

## Semantic Versioning

The project follows semantic versioning (MAJOR.MINOR.PATCH):

- **Major version** (X.0.0): Breaking changes - triggered by PR titles
  starting with `feat!:`
- **Minor version** (0.X.0): New features - triggered by PR titles
  starting with `feat:`
- **Patch version** (0.0.X): Bug fixes and maintenance - triggered by PR
  titles starting with `fix:`, `docs:`, `style:`, `refactor:`, `perf:`,
  `test:`, `build:`, `ci:`, `chore:`, or `revert:`

## Version Bump Process

When a PR is merged to main:

1. The `main-merge.yml` workflow automatically determines the version
   bump type based on the PR title
2. A new branch is created with the version bump changes
3. A PR is automatically created with the version updates
4. Once checks pass, the version bump PR is automatically merged
5. The temporary branch is cleaned up

## PR Title Requirements

All PR titles must follow the semantic versioning format to pass CI checks:

- Must start with one of: `feat`, `fix`, `docs`, `style`, `refactor`,
  `perf`, `test`, `build`, `ci`, `chore`, `revert`
- Can include `!` for breaking changes (e.g., `feat!: breaking change`)
- Must be followed by a colon and description
- Examples:
  - `feat: add player statistics visualization`
  - `fix: correct animation timing issue`
  - `feat!: change API response format`

## Build and Deployment

The application is built using Next.js and can be deployed using various methods.

### Docker Development (Recommended)

**Docker is the preferred development environment** as it ensures
consistency across all development machines and matches the production
environment.

The project includes Docker configurations for both development and production:

#### Development Docker

```bash
# Start development containers
npm run docker:up

# Start in detached mode
npm run docker:up:detach

# Build and start (no cache)
npm run docker:build

# Stop and remove containers
npm run docker:down
```

#### Production Docker

```bash
# Start production containers
npm run docker:prod:up

# Start in detached mode
npm run docker:prod:up:detach

# Build and start (no cache)
npm run docker:prod:build

# Stop and remove containers
npm run docker:prod:down
```

### Local Development (Alternative)

If you need to run the application without Docker:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Upgrade Next.js to latest version
npm run upgrade:nextjs
```

**Note:** Docker is the recommended approach for development to ensure
environment consistency.

### GitHub Container Registry (GHCR)

For building and pushing images to GHCR:

```bash
# Build Docker image for GHCR
npm run ghcr:build

# Push to GHCR
npm run ghcr:push

# Test GHCR cleanup workflow
npm run ghcr:test
```

## Testing Workflows Locally

You can test GitHub Actions workflows locally using [act](https://github.com/nektos/act):

### Run All Workflow Tests

```bash
# Run all workflow tests
npm test
# or
npm run test:workflows
```

### Test Individual Workflows

#### Semantic PR Check

```bash
# Test with minor version bump
npm run test:workflows:semantic:minor

# Test with major version bump
npm run test:workflows:semantic:major

# Test with patch version bump
npm run test:workflows:semantic:patch

# Test with invalid PR title
npm run test:workflows:semantic:invalid
```

#### Version Bump and Merge

```bash
# Test version bump workflow
npm run test:workflows:version

# Test main merge workflow
npm run test:workflows:merge
```

#### GHCR Cleanup

```bash
# Test GHCR cleanup (dry run)
npm run test:workflows:ghcr

# Test with keep-versions strategy
npm run test:workflows:ghcr:keep-versions

# Test with keep-days strategy
npm run test:workflows:ghcr:keep-days

# Test actual cleanup
npm run test:workflows:ghcr:cleanup
```

## Vercel Integration

The project is configured to deploy preview builds to Vercel for each PR:

- Preview deployments are automatically created for each PR
- Vercel reports deployment status directly to GitHub as a native status check
- Preview URLs are available in the PR checks

### Why We Don't Manually Poll Vercel

The `semantic-pr-check.yml` workflow relies on GitHub's native Vercel
integration rather than manually polling for deployment status. This approach:

- **Eliminates complexity**: No custom polling logic or timeout handling
- **Improves reliability**: GitHub's status check system is battle-tested
- **Faster execution**: Workflow completes in seconds vs minutes of polling
- **Reduces maintenance**: Less code to maintain and debug
- **Leverages branch protection**: GitHub can require Vercel checks before
  merging

GitHub already handles Vercel status checks through its native integration,
making manual polling redundant. If Vercel fails, GitHub's branch protection
will prevent merging regardless of our workflow status.

## Troubleshooting

If you encounter issues during deployment:

1. **Build Failures**: Check the workflow logs in the GitHub Actions tab
2. **Version Bump Issues**: Ensure PR titles follow the semantic versioning format
3. **Vercel Deployment Issues**: Check the Vercel dashboard for deployment logs
4. **Docker Issues**: Verify Docker configurations and check container logs

## Best Practices

- **Use Docker for development** (`npm run docker:up`) to ensure environment consistency
- Always test changes locally before creating a PR
- Use descriptive PR titles that follow semantic versioning conventions
- Test workflows locally with `npm test` or individual workflow tests
- Monitor the GitHub Actions logs for any issues
- Keep dependencies up to date to avoid security vulnerabilities
- Use detached mode (`npm run docker:up:detach`) for background development
