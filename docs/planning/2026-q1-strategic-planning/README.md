# 2026 Q1 Strategic Planning - Sploosh.AI Hockey Analytics

## Overview

This document provides a comprehensive analysis of the outstanding items
from the Asana "Game Plan" section and proposes an overall strategy and
implementation plan for 2026.

**Created:** 2026-01-03  
**Branch:** `2026.01.03/strategic-planning-asana-game-plan`

## Current State Analysis

Based on the Asana export from 2026-01-03, we have:

- **23 items** in the Game Plan section (all incomplete)
- **34 completed items** in Archive 2025'Q4
- **3 items** in the Punt section
- **1 completed item** in Archive 2026'Q1

### Game Plan Items Breakdown

The 23 outstanding items can be categorized into the following themes:

#### 1. **Critical Bugs** (4 items)

- Fix bug where sometimes clicking the current game in the URL doesn't reload
  data as expected
- Fix bug where goalie pulled situations appear as PPG or SHG
- Fix bug in timeline UX where the last SHG was also an empty net goal
- Improve UX so game header display 0 SOG instead of nothing

#### 2. **UX/UI Improvements** (9 items)

- Improve UX to display the game header and shot chart plus details above the
  fold
- Improve UX by adding an ability to easily change the timezone for the app
- Improve markers on shot chart with custom graphics or artwork
- Improve UX when game data errors or fails to load in the sidebar
- Improve UX when game data errors or fails to load in the main page
- Improve timeline UX to display an image similar to the placeholder upcoming rink
- Consider improving sidebar UX to "shuffle" final games toward the bottom
- Add QR codes to share the home page as well as selected game and NHL Game
  Center links
- Add a hat or symbol to indicate hat trick(s) in a game

#### 3. **New Features** (3 items)

- Consider implementing a playlist-like feature to view all goal replays in
  succession
- Initial implementation of Vercel analytics and event tracking
- Add ability to retain and display cached data when network requests are
  unsuccessful

#### 4. **Strategic/Brainstorm Items** (4 items)

- Review, prioritize, and create a development plan that can be managed in the
  repo
- BRAINSTORM: How might you incorporate testing to cover the current state of
  the project?
- BRAINSTORM: Create a visualization showing home games for the selected day
- BRAINSTORM: How might you incorporate PWHL preseason and regular season data?
- BRAINSTORM: How might you incorporate WHL data into the hockey analytics app?

## Proposed Strategy

### Phase 1: Critical Fixes & Lightweight Testing (Q1 2026 - Weeks 1-3)

**Goal:** Fix critical bugs affecting current users and establish basic testing
foundation

**Priority Items:**

1. **Update Node.js Version Requirement** - Enforce Node.js v24.0.0+
   - Update `package.json` engines to require `"node": ">=24.0.0"`
   - Update any documentation referencing Node.js version requirements
   - Verify local environment is running Node.js v24.x

2. **Document Environment Variables** - Pull and document Vercel env vars
   - Add script to `package.json`: `"env:pull": "vercel env pull"`
   - Pull production, preview, and development environment variables
   - Document all environment variables in architecture documentation
   - Create `.env.example` file with all required variables (no values)

3. **Upgrade Next.js** - Upgrade to latest version before testing
   - Run `npm run upgrade:nextjs` to upgrade to Next.js 16.1.1+
   - Follow guide: <https://nextjs.org/docs/app/guides/upgrading/version-16>
   - Test application after upgrade
   - Update dependencies as needed

4. **Critical Bug Fixes** - Fix data integrity issues immediately
   - Fix goalie pulled situations appearing as PPG/SHG
   - Fix game reload bug when clicking current game in URL
   - Fix timeline SHG/empty net goal bug
   - Fix 0 SOG display issue
   - Replace magic number (20000ms) with named constant for auto-refresh delay

5. **Error Handling & Resilience**
   - Improve UX when game data errors or fails to load (sidebar)
   - Improve UX when game data errors or fails to load (main page)
   - Add ability to retain and display cached data when network requests fail
   - Integrate error tracking (Sentry or similar) for automatic error reporting
   - Implement request deduplication to prevent duplicate API calls

6. **Lightweight Testing Setup** - Basic foundation only
   - Set up Jest and React Testing Library
   - Create smoke tests for critical user paths
   - Add basic E2E tests for game loading and navigation
   - Set up CI/CD testing pipeline (run on PR)

**Success Metrics:**

- All critical bugs resolved and deployed
- Zero unhandled error states in production
- Error tracking capturing issues in real-time
- Basic test suite running in CI/CD (>30% coverage acceptable)

### Phase 2: Analytics & User Feedback (Q1 2026 - Weeks 4-6)

**Goal:** Understand how users interact with the app and provide easy feedback
mechanisms

**Priority Items:**

1. **Enhanced Vercel Analytics**
   - Implement custom event tracking for user interactions:
     - Game views (which games are most popular)
     - Feature usage (shot chart, timeline, replays)
     - Filter selections (periods, teams, event types)
     - Navigation patterns (sidebar usage, game switching)
   - Track performance metrics (page load, API response times)
   - Set up analytics dashboard views for key metrics
   - Add conversion funnels (landing → game selection → feature usage)

2. **User Feedback System**
   - Add in-app feedback widget (bug reports + feature requests)
   - Implement screenshot capture for bug reports
   - Create feedback submission API endpoint
   - Store feedback in simple database or service (e.g., Supabase, Airtable)
   - Add email notifications for new feedback submissions
   - Create basic feedback management view (admin only)

3. **Performance Monitoring**
   - Track API response times and failures
   - Monitor client-side performance (Core Web Vitals)
   - Set up alerts for degraded performance
   - Add performance metrics to analytics dashboard

**Success Metrics:**

- Custom analytics events tracking all major user interactions
- Feedback widget accessible from all pages
- At least 5 feedback submissions received and addressed
- Performance monitoring capturing 100% of page loads
- Clear visibility into most/least used features

### Phase 3: User Experience Enhancement (Q1 2026 - Weeks 7-9)

**Goal:** Improve usability and visual appeal based on user feedback and usage
data

**Priority Items:**

1. **Layout & Responsiveness**
   - Display game header and shot chart above the fold
   - Improve markers on shot chart with custom graphics

2. **User Convenience Features**
   - Add timezone selection capability
   - Add QR codes for sharing
   - Add hat trick indicators

3. **Timeline Improvements**
   - Display rink location images for events
   - Consider sidebar game shuffling for completed games

**Success Metrics:**

- Improved mobile usability scores
- Positive user feedback on visual improvements
- Increased sharing via QR codes

### Phase 4: Advanced Features (Q1 2026 - Weeks 10-12)

**Goal:** Add new capabilities based on user feedback and analytics insights

**Priority Items:**

1. **Enhanced Visualizations** (based on usage data)
   - Create visualization showing home games for selected day
   - Implement playlist-like feature for goal replays (if requested)
   - Add hat trick indicators
   - Improve markers on shot chart with custom graphics

2. **User Accounts & Admin Panel** (foundation)
   - Research authentication solutions (NextAuth.js, Clerk, Supabase Auth)
   - Design user account schema and permissions
   - Implement basic admin panel for:
     - Viewing feedback submissions
     - User analytics overview
     - Feature flag management (optional)
   - Add user registration/login flow (optional for now)

3. **Mobile & Accessibility Improvements**
   - Optimize for mobile viewing during live games
   - Improve touch targets and responsive layouts
   - Add accessibility features (WCAG 2.1 AA compliance)
   - Test with screen readers and keyboard navigation

**Success Metrics:**

- New visualizations deployed and tracked in analytics
- Admin panel accessible and functional
- Mobile usability score improved by 20%
- Accessibility audit passing with no critical issues

## Future Phases (Q2 2026 and Beyond)

### API Abstraction & Data Persistence

**Goal:** Decouple from NHL EDGE API and implement graph database for advanced
analytics

**Why Deferred:** While architecturally important, this work doesn't directly
impact current users. Once we have stable analytics and user feedback, we'll
have better data to inform the architecture design.

**Planned Work:**

- API abstraction layer with adapter pattern
- API security infrastructure:
  - Rate limiting for API endpoints
  - Request validation and sanitization
  - API key management system for authenticated services
  - Support for multiple authentication methods (API keys, OAuth, certificates)
- Neo4j graph database for data persistence
- Docker + Neo4j Aura setup
- Data ingestion pipeline
- Multi-league support foundation (PWHL, WHL)

**Triggers to Prioritize:**

- NHL EDGE API breaking changes
- Performance issues requiring caching layer
- User demand for historical data analysis
- Concrete plans to add PWHL/WHL support

## Implementation Approach

### Task Management

**This planning document is the source of truth** for all Q1 2026 work.

1. **Track Progress in This Document**
   - Update phase status as work completes
   - Document decisions and rationale inline
   - Track metrics and outcomes in `/docs/planning/`
   - Add notes about blockers or changes

2. **Branch Naming References Phases**
   - Use `$(date +%Y.%m.%d)` for automatic date prefix
   - Include phase and item for context
   - Example: `git checkout -b $(date +%Y.%m.%d)/phase1-fix-goalie-pulled-ppg`
   - Example: `git checkout -b $(date +%Y.%m.%d)/phase2-add-analytics-events`

3. **Weekly Progress Updates**
   - Review completed items
   - Adjust priorities based on learnings
   - Update timeline if needed
   - Document any scope changes

### Development Workflow

#### Branch and PR Strategy

**CRITICAL:** Each piece of work must be in a separate branch with its own PR.
This ensures:

- PRs are small, focused, and easy to review
- Changes are isolated and testable
- Rollbacks are simple if issues arise
- Code review is thorough and manageable
- CI/CD runs are fast and targeted

**Guidelines:**

1. **One Issue = One Branch = One PR**
   - Each work item gets its own branch
   - Branch naming: `$(date +%Y.%m.%d)/description`
   - Example: `git checkout -b $(date +%Y.%m.%d)/fix-goalie-pulled-ppg-bug`
   - The date command automatically generates the correct date prefix

2. **Keep PRs Focused**
   - Encourage bite-sized PRs that are easy to review
   - PRs can be larger if they represent a complete, cohesive unit of work
   - Use feature flags (environment variables) for incomplete features
   - Break up work logically, not arbitrarily by line count

3. **PR Requirements**
   - Descriptive title following semantic versioning (feat:, fix:, etc.)
   - Include test coverage demonstrating the change works
   - Screenshots for UI changes
   - Update relevant documentation
   - All tests must pass before merge

4. **Branch Lifecycle**
   - Create branch from latest main
   - Make focused changes
   - Run tests locally before pushing
   - Create PR and request review
   - Address feedback
   - Merge and delete branch
   - Never reuse branches

#### Testing Strategy

**Philosophy:** All code in main must be deployable with confidence. We currently
have NO testing infrastructure, so establishing this is critical.

**Test-Driven Approach:**

1. **For Bug Fixes**
   - Write a failing test that reproduces the bug
   - Fix the bug
   - Verify the test now passes
   - This proves the bug is fixed and prevents regression

2. **For New Features**
   - Write tests for the expected behavior
   - Implement the feature
   - Tests passing = feature is complete
   - Focus on tests that provide confidence without being brittle

**Testing Levels:**

- **Unit Tests** - Individual functions and components
- **Integration Tests** - Component interactions and data flow
- **E2E Tests** - Critical user paths and workflows

**Test Organization:**

- Keep `package.json` scripts simple
- `npm test` runs ALL tests (unit + integration + E2E)
- Tests should be fast and reliable
- Use descriptive test names that explain what's being verified

**Examples of Test Coverage Needed:**

- Special event decorations (Winter Classic, Stadium Series, Heritage Classic)
- Game header displays (0 SOG, hat tricks, etc.)
- Timeline events (goals, penalties, etc.)
- Shot chart rendering and interactions
- Error states and loading states
- Data transformation and validation

**Success Criteria:**

- Tests run in CI/CD on every PR
- Manual testing supplements automated tests
- Clear test failures indicate what broke
- Tests serve as documentation of expected behavior

#### Feature Flags

**Approach:** Use environment variables to manage feature flags

- Enable/disable features without code changes
- Test features in production before full rollout
- Gradual rollout of new capabilities
- Quick rollback if issues arise

**Implementation:**

- Define feature flags in `.env.local` (local dev)
- Configure in Vercel environment variables (production/preview)
- Access via `process.env.NEXT_PUBLIC_FEATURE_*` for client-side
- Access via `process.env.FEATURE_*` for server-side
- Document all feature flags in this planning folder

**Example:**

```typescript
const SHOW_ANALYTICS_WIDGET = 
  process.env.NEXT_PUBLIC_FEATURE_ANALYTICS_WIDGET === 'true';
```

#### Work Documentation

**Documentation Folder:** `/docs/` (root level)

For work that requires detailed documentation beyond what fits in this strategic
plan, create a dedicated document in the appropriate folder:

- **Bug fixes:** `/docs/bugs/YYYY-MM-DD-description.md`
- **Features:** `/docs/features/YYYY-MM-DD-description.md`
- **Architecture:** `/docs/architecture/YYYY-MM-DD-description.md`

Keep it simple - flat structure until we need to reorganize.

**Purpose:**

- Track implementation details and design decisions
- Document root cause analysis for bugs
- Explain rationale for architectural choices
- Provide context for future engineers (including ourselves)
- Keep strategic plan concise while preserving detailed information

**Template:** See `/docs/TEMPLATE.md` for a comprehensive template

**Linking:** Reference documentation from this strategic plan as work progresses

#### Code Documentation Standards

- Update README for user-facing changes
- Document API changes
- Maintain component documentation
- Add inline comments for complex logic
- Document feature flags and their purpose

## Next Steps

1. **Review and Finalize** - Confirm this strategy aligns with priorities
2. **Begin Phase 1** - Start with critical bug fixes
3. **Track Progress** - Update this document as work completes
4. **Weekly Check-ins** - Review progress and adjust phases as needed
5. **Iterate** - Use analytics and feedback to inform Phase 2-4 priorities

## Resources

- [Game Plan Items (JSON)](`@/Users/rob/repos/sploosh-ai-hockey-analytics/docs/planning/2026-q1-strategic-planning/game-plan-items.json`)
- [Full Asana Export](`@/Users/rob/repos/sploosh-ai-hockey-analytics/docs/planning/2026-q1-strategic-planning/20260103-asana-export-hockey-analytics.json`)
- [Project Repository](https://github.com/SplooshAI/sploosh-ai-hockey-analytics)

## Notes

- This is a living document and should be updated as priorities shift
- Phases are flexible and can be adjusted based on feedback and constraints
- Focus on delivering value incrementally rather than waiting for perfect solutions
