# Node.js v24 LTS Upgrade Guide

## Overview

This project has been upgraded to Node.js v24 LTS (Long-Term Support),
which will receive updates through April 2028.

## Changes Made

### Docker Images

- **Development Dockerfile**: Updated from `node:22-alpine` to `node:24-alpine`
- **Production Dockerfile**: Updated both builder and runner stages to `node:24-alpine`

### Dependencies

- **@types/node**: Updated from `^20` to `^24` in `apps/sploosh-ai-hockey-analytics/package.json`
- **package-lock.json**: Updated to reflect new Node.js type definitions

### Testing Results

✅ **Development Docker build**: Successful  
✅ **Production Docker build**: Successful  
✅ **Application startup**: Verified working in both environments

## Local Development Environment

### Current System Status

- Your local Node.js version: **v24.11.0 LTS** ✅
- Docker containers: **v24.11.0 LTS** ✅

### Upgrade Completed ✅

The local development environment has been successfully upgraded to
Node.js v24.11.0 LTS, matching the Docker container environment. This
ensures:

- Consistency across local development and Docker environments
- Access to the latest performance improvements
- Security updates through April 2028
- Full compatibility with all project dependencies

### How the Upgrade Was Done

#### Using nvm (Node Version Manager)

```bash
# Install Node.js v24 LTS
nvm install 24

# Set as default
nvm alias default 24

# Use it immediately
nvm use 24

# Verify installation
node --version  # Should show v24.x.x
```

#### Using Homebrew (macOS)

```bash
# Update Homebrew
brew update

# Upgrade Node.js
brew upgrade node

# Verify installation
node --version  # Should show v24.x.x
```

#### Direct Download

Download the installer from: <https://nodejs.org/en/download>

## Migration Notes from v22 to v24

### Breaking Changes

- **OpenSSL 3.5**: RSA/DSA/DH keys < 2048 bits and ECC keys < 224 bits are now prohibited
- **Stricter fetch() compliance**: More aligned with web standards
- **Stream/pipe errors**: Now throw instead of silent failures
- **Platform support**: No more 32-bit binaries for Windows or Linux armv7

### Compatibility

All project dependencies are compatible with Node.js v24:

- Next.js 16.0.0 ✅
- React 19.2.0 ✅
- All other dependencies verified ✅

### Deployment Platform Considerations

**Vercel Limitation**: As of November 2025, Vercel does not yet support
Node.js v24. The latest supported version is Node.js 22.x. To maintain
compatibility:

- `engines.node` is set to `>=22.0.0` (allows both v22 and v24)
- Vercel deployments use Node.js 22.x
- Local development uses Node.js v24.11.0 (via `.nvmrc`)
- Docker containers use Node.js v24 (`node:24-alpine`)
- GitHub Actions use Node.js v22

When Vercel adds Node.js v24 support, you can optionally update the
`engines` field to `>=24.0.0` if desired, though `>=22.0.0` will
continue to work.

### Reference

Full migration guide: <https://nodejs.org/en/blog/migrations/v22-to-v24>

## Testing Recommendations

While the Docker builds have been verified, comprehensive testing would benefit from:

- Unit tests for API endpoints
- Integration tests for data fetching
- E2E tests for critical user flows
- Performance benchmarks

*"Sure would be nice if we had tests to validate our application before
we went down this path, eh lol"* - Future enhancement opportunity! 😄

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting the Dockerfiles to `node:22-alpine`
2. Reverting `@types/node` to `^20`
3. Running `npm install` to update package-lock.json
4. Rebuilding Docker images

## Questions or Issues?

If you encounter any issues with the Node.js v24 upgrade, check:

1. The official migration guide linked above
2. Node.js v24 release notes
3. Project dependencies for compatibility warnings
