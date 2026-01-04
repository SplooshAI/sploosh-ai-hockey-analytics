# Harvest Time Tracking - Quick Reference

This document provides one-line descriptions for Harvest time tracking entries
for Q1 2026 strategic planning work.

## Phase 1: Critical Fixes & Lightweight Testing (Weeks 1-3)

### Setup & Configuration

- **Test Script Cleanup**: Review and remove obsolete test:race-condition
  script from package.json
- **Node.js v24 Update**: Update Node.js requirement to v24.0.0+ in
  package.json and docs
- **Environment Variables**: Pull and document Vercel environment
  variables, create .env.example
- **Next.js Upgrade**: Upgrade Next.js to 16.1.1+ using @next/codemod upgrade tool

### Critical Bug Fixes

- **Goalie Pulled PPG Bug**: Fix goalie pulled situations incorrectly
  appearing as PPG/SHG
- **Game Reload Bug**: Fix bug where clicking current game in URL
  doesn't reload data
- **Timeline SHG Bug**: Fix timeline bug where last SHG also shows as
  empty net goal
- **0 SOG Display**: Fix game header to display 0 SOG instead of nothing
- **Auto-refresh Constant**: Replace magic number (20000ms) with named
  constant for auto-refresh delay

### Error Handling & Resilience

- **Sidebar Error UX**: Improve UX when game data errors or fails to load in sidebar
- **Main Page Error UX**: Improve UX when game data errors or fails to
  load in main page
- **Cached Data Retention**: Add ability to retain and display cached
  data when network requests fail
- **Error Tracking**: Integrate error tracking (Sentry) for automatic error reporting
- **Request Deduplication**: Implement request deduplication to prevent
  duplicate API calls

### Testing Setup

- **Jest Setup**: Set up Jest and React Testing Library for unit/component testing
- **Smoke Tests**: Create smoke tests for critical user paths
- **E2E Tests**: Add basic E2E tests for game loading and navigation
- **CI/CD Pipeline**: Set up CI/CD testing pipeline to run on PR

## Phase 2: Analytics & User Feedback (Weeks 4-6)

### Enhanced Analytics

- **Custom Event Tracking**: Implement custom event tracking for user
  interactions (game views, feature usage)
- **Performance Monitoring**: Add Core Web Vitals and performance
  monitoring
- **Analytics Dashboard**: Create analytics dashboard for tracking user
  behavior

### User Feedback

- **Feedback Widget**: Implement in-app feedback widget for bug reports
  and suggestions
- **Feedback Management**: Set up feedback collection and management system

## Phase 3: User Experience Enhancement (Weeks 7-9)

### Layout & Convenience

- **Above Fold Display**: Improve UX to display game header and shot
  chart above the fold
- **Timezone Selection**: Add ability to easily change timezone for the app
- **Shot Chart Markers**: Improve markers on shot chart with custom
  graphics/artwork
- **Sidebar Shuffle**: Improve sidebar UX to shuffle final games toward
  the bottom
- **QR Code Sharing**: Add QR codes to share home page and selected game
  links

### Timeline & Visualization

- **Timeline Placeholder**: Improve timeline UX to display image similar
  to placeholder upcoming rink
- **Hat Trick Indicator**: Add hat or symbol to indicate hat trick(s) in a game

## Phase 4: Advanced Features (Weeks 10-12)

### Visualizations

- **Playlist Feature**: Implement playlist-like feature to view all goal
  replays in succession
- **Additional Visualizations**: Add new visualization features

### Admin & Mobile

- **Admin Panel**: Create admin panel for user management and analytics
- **Mobile Optimization**: Optimize application for mobile devices
- **Accessibility**: Improve accessibility to meet WCAG 2.1 AA compliance

## Future Phases (Q2 2026+)

### API Abstraction

- **API Abstraction Layer**: Design and implement abstraction layer for
  NHL EDGE API
- **Multi-League Support**: Extend architecture to support PWHL, WHL,
  and other leagues

### API Security Infrastructure

- **Rate Limiting**: Implement rate limiting for API endpoints
- **Request Validation**: Add request validation and sanitization
- **API Key Management**: Build API key management system for authenticated
  services
- **Multi-Auth Support**: Support multiple authentication methods (API keys,
  OAuth, certificates)

### Data Persistence

- **Neo4j Integration**: Integrate Neo4j for data persistence and
  historical data
- **Docker/Aura Setup**: Set up Neo4j with Docker (local) and Neo4j Aura
  (cloud)

## Usage

Copy the relevant one-line description into your Harvest timer when
starting work on a specific task. This ensures consistent time tracking
across the project.

**Example:**

```text
Project: Sploosh.AI Hockey Analytics
Task: Phase 1 - Critical Bug Fixes
Notes: Fix goalie pulled situations incorrectly appearing as PPG/SHG
