# Current State Architecture - Sploosh.AI Hockey Analytics

**Last Updated:** 2026-01-04  
**Version:** 2.2.6  
**Type:** Architecture Documentation  
**Status:** Living Document (Current State)

## Executive Summary

Sploosh.AI Hockey Analytics is a Next.js 16 application that provides real-time
NHL game visualization and analytics. The application fetches data from the
undocumented NHL EDGE API and presents it through interactive visualizations
including shot charts, game timelines, and hockey rink animations.

**Key Characteristics:**

- Client-side heavy with Next.js API routes as proxy layer
- Direct dependency on NHL EDGE API (no abstraction layer)
- React state management (no external state library)
- Component-based architecture with feature-focused organization
- Docker support for local development and production build verification
- Automated deployment to Vercel via GitHub Actions on PR/merge to main

## Technology Stack

### Core Framework

- **Next.js 16.0.7** - React framework with App Router
- **React 19.2.1** - UI library
- **TypeScript 5** - Type safety
- **Turbopack** - Build tool (development and production)

### UI & Styling

- **Tailwind CSS 3.4.1** - Utility-first CSS
- **shadcn/ui** - Component library (Radix UI primitives)
- **Framer Motion 12.12.1** - Animation library
- **Lucide React 0.468.0** - Icon library
- **Geist Font** - Typography (via next/font)

### Data & State

- **Native fetch API** - HTTP client
- **React hooks** - State management (useState, useEffect, useRef)
- **URL search params** - Route state management
- **date-fns 4.1.0** - Date manipulation
- **date-fns-tz 3.2.0** - Timezone handling

### Testing

- **Vitest 2.1.8** - Test runner
- **@testing-library/react 16.3.0** - Component testing
- **@testing-library/jest-dom 6.9.1** - DOM matchers
- **jsdom 25.0.1** - DOM environment

### Development & Build

- **ESLint 9** - Linting (--max-warnings=0)
- **PostCSS 8** - CSS processing
- **npm 11.7.0** - Package manager
- **Node.js >=24.0.0** - Runtime

### Deployment

- **Vercel** - Hosting platform
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **@vercel/analytics 1.4.1** - Analytics

## Project Structure

```text
sploosh-ai-hockey-analytics/
├── apps/
│   └── sploosh-ai-hockey-analytics/    # Main Next.js application
│       ├── app/                         # Next.js App Router
│       │   ├── api/nhl/                # API routes (proxy to NHL EDGE)
│       │   ├── demo/                   # Demo pages
│       │   ├── layout.tsx              # Root layout
│       │   └── page.tsx                # Home page (main game view)
│       ├── components/
│       │   ├── features/               # Feature-specific components
│       │   │   ├── game-header/       # Game header display
│       │   │   ├── game-timeline/     # Play-by-play timeline
│       │   │   ├── games/             # Game list and cards
│       │   │   ├── hockey-rink/       # Rink visualization
│       │   │   └── shot-chart/        # Shot chart visualization
│       │   ├── layouts/               # Layout components
│       │   │   ├── main-layout.tsx    # Main app layout
│       │   │   └── sidebar/           # Sidebar navigation
│       │   ├── shared/                # Shared utility components
│       │   └── ui/                    # shadcn/ui components
│       ├── hooks/                     # Custom React hooks
│       ├── lib/
│       │   ├── api/nhl-edge/         # NHL EDGE API integration
│       │   │   ├── endpoints.ts      # API endpoint definitions
│       │   │   ├── server/           # Server-side client
│       │   │   ├── services/         # Client-side services
│       │   │   └── types/            # TypeScript types
│       │   └── utils/                # Utility functions
│       ├── public/                   # Static assets
│       ├── scripts/                  # Build scripts
│       ├── types/                    # Global TypeScript types
│       └── __tests__/                # Test files
├── docker/                           # Docker configurations
│   └── sploosh-ai-hockey-analytics/
│       ├── development/              # Dev Docker setup
│       └── production/               # Prod Docker setup
├── docs/                             # Documentation
│   ├── architecture/                 # Architecture docs
│   ├── bugs/                         # Bug fix docs
│   ├── features/                     # Feature docs
│   └── planning/                     # Strategic planning
├── .github/
│   ├── workflows/                    # GitHub Actions
│   │   ├── main-merge.yml           # Version bump on merge
│   │   ├── pr-build-check.yml       # PR validation
│   │   ├── semantic-pr-check.yml    # PR title validation
│   │   └── cleanup_ghcr.yml         # Container cleanup
│   ├── docs/                         # GitHub-specific docs
│   └── scripts/                      # CI/CD scripts
└── package.json                      # Root package.json (scripts)
```

## Architecture Patterns

### 1. API Integration Architecture

#### Current Pattern: Direct Proxy

```text
Client (Browser)
    ↓ fetch('/api/nhl/...')
Next.js API Routes (/app/api/nhl/)
    ↓ fetchNHLEdge()
NHL EDGE API (https://api-web.nhle.com/v1)
```

**Components:**

- **API Routes** (`app/api/nhl/`):
  - `scores/route.ts` - Fetch games for a date
  - `play-by-play/route.ts` - Fetch play-by-play data
  - `game-center/route.ts` - Fetch game center data
  - Note: Client fetches play-by-play and game-center in parallel

- **Server Client** (`lib/api/nhl-edge/server/client.ts`):
  - `fetchNHLEdge<T>()` - Generic fetch wrapper
  - `ApiError` - Custom error class
  - Base URL: `https://api-web.nhle.com/v1`
  - Cache disabled (`cache: 'no-store'`)

- **Client Services** (`lib/api/nhl-edge/services/`):
  - `getScores(date)` - Client-side scores fetch
  - `getGameCenter(gameId)` - Client-side game center fetch

- **Endpoints** (`lib/api/nhl-edge/endpoints.ts`):

  ```typescript
  {
    scores: (date) => `/score/${date}`,
    playByPlay: (gameId) => `/gamecenter/${gameId}/play-by-play`,
    gameCenter: (gameId) => `/gamecenter/${gameId}/landing`
  }
  ```

**Key Characteristics:**

- ❌ No abstraction layer
- ❌ Direct coupling to NHL EDGE API structure
- ❌ No data persistence or caching
- ✅ Simple and straightforward
- ✅ Type-safe with TypeScript
- ⚠️ Vulnerable to NHL API changes

### 2. State Management

#### Pattern: React Hooks + URL State

**Local Component State:**

```typescript
// app/page.tsx
const [playByPlayData, setPlayByPlayData] = useState<NHLEdgePlayByPlay | null>(null)
const [gameCenterData, setGameCenterData] = useState<any | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
```

**URL State Management:**

```typescript
// Game selection updates URL
router.push(`?gameId=${gameId}`, { scroll: false })

// URL changes trigger data fetch
useEffect(() => {
  const gameIdParam = searchParams.get('gameId')
  if (gameIdParam) {
    fetchGameData(parseInt(gameIdParam, 10))
  }
}, [searchParams])
```

**Race Condition Prevention:**

```typescript
// Use refs to track current state
const selectedGameIdRef = useRef<number | null>(null)
const abortControllerRef = useRef<AbortController | null>(null)

// Cancel in-flight requests
if (abortControllerRef.current) {
  abortControllerRef.current.abort()
}

// Only update if still the selected game
if (selectedGameIdRef.current === gameId) {
  setPlayByPlayData(data)
}
```

**Key Characteristics:**

- ✅ Simple and predictable
- ✅ URL as source of truth for selected game
- ✅ Race condition handling with refs and AbortController
- ❌ No global state management
- ❌ Props drilling for shared state
- ❌ No state persistence (except URL)

### 3. Component Architecture

#### Pattern: Feature-Based Organization

**Component Hierarchy:**

```text
MainLayout
├── Sidebar
│   ├── DatePicker
│   ├── GamesList
│   │   └── GameCard (multiple)
│   └── Footer
└── Main Content
    ├── GameHeader
    ├── ShotChart
    ├── GameTimeline
    └── NHLEdgeHockeyRink
```

**Component Types:**

1. **Feature Components** (`components/features/`):
   - Self-contained feature modules
   - Own their data fetching logic
   - Example: `GamesList` fetches and manages game data

2. **Layout Components** (`components/layouts/`):
   - Structural components
   - Composition and spacing
   - Example: `MainLayout`, `Sidebar`

3. **UI Components** (`components/ui/`):
   - Reusable primitives from shadcn/ui
   - Radix UI + Tailwind styling
   - Example: `Button`, `Calendar`, `Popover`

4. **Shared Components** (`components/shared/`):
   - Cross-feature utilities
   - Common patterns

**Key Characteristics:**

- ✅ Clear separation of concerns
- ✅ Feature-based organization
- ✅ Reusable UI primitives
- ⚠️ Some components tightly coupled to NHL data structure
- ⚠️ Limited component documentation

### 4. Data Flow

**Typical Flow for Game Selection:**

1. User clicks game in sidebar (`GamesList`)
2. `onGameSelect(gameId)` callback fired
3. Parent (`page.tsx`) updates URL: `?gameId=123`
4. URL change triggers `useEffect`
5. `fetchGameData(gameId)` called
6. Parallel fetch to `/api/nhl/play-by-play` and `/api/nhl/game-center`
7. API routes proxy to NHL EDGE API
8. Data returned and state updated
9. Components re-render with new data

**Auto-Refresh Pattern (GamesList):**

```typescript
// Enable auto-refresh for live games
const shouldEnableAutoRefresh = (games) => {
  return games.some(g => g.gameState === 'LIVE' || g.gameState === 'CRIT')
}

// Refresh every 20 seconds
useEffect(() => {
  if (autoRefreshEnabled) {
    const interval = setInterval(() => {
      fetchGames()
    }, 20000)
    return () => clearInterval(interval)
  }
}, [autoRefreshEnabled])
```

### 5. Error Handling

**Current Approach:**

1. **API Route Level:**

   ```typescript
   try {
     const data = await fetchNHLEdge(endpoint)
     return NextResponse.json(data)
   } catch (error) {
     if (error instanceof ApiError) {
       return NextResponse.json(
         { error: error.message },
         { status: error.status }
       )
     }
     return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
   }
   ```

2. **Component Level:**

   ```typescript
   try {
     const response = await fetch('/api/nhl/...')
     const data = await response.json()
     setData(data)
   } catch (err) {
     setError('Failed to fetch game data')
     console.error(err)
   }
   ```

3. **Retry Logic (GamesList):**
   - Network errors trigger automatic retry
   - Max 3 retry attempts
   - 20-second delay between retries
   - Auto-refresh disabled after max retries

**Key Characteristics:**

- ✅ Graceful degradation
- ✅ User-facing error messages
- ✅ Retry logic for network errors
- ❌ No error tracking service (Sentry, etc.)
- ❌ No error boundaries
- ❌ Limited error recovery options

## Data Models

### NHL EDGE API Types

**Key Interfaces:**

```typescript
// Game from schedule/scores
interface NHLEdgeGame {
  id: number
  gameState: 'FUT' | 'PRE' | 'LIVE' | 'CRIT' | 'FINAL' | 'OFF'
  homeTeam: Team
  awayTeam: Team
  specialEvent?: SpecialEvent
  // ... additional fields
}

// Play-by-play data
interface NHLEdgePlayByPlay {
  plays: Play[]
  // ... additional fields
}

// Individual play
interface Play {
  eventId: number
  typeDescKey: string
  details: PlayDetails
  // ... additional fields
}
```

**Data Transformations:**

- Minimal transformation in current architecture
- Data passed through mostly as-is from NHL API
- Some enrichment (e.g., merging game center data with scores)

## Testing Strategy

### Current Testing State

**Test Infrastructure:**

- **Framework:** Vitest 2.1.8
- **Component Testing:** @testing-library/react 16.3.0
- **DOM Matchers:** @testing-library/jest-dom 6.9.1
- **Environment:** jsdom 25.0.1

**Existing Tests:**

- `__tests__/race-condition.test.tsx` - Tests for race condition fixes
- Test script: `npm test` (runs vitest)
- UI mode: `npm run test:ui`

**Coverage:**

- ⚠️ **Minimal test coverage** - Only race condition test
  exists
- ❌ No E2E tests
- ❌ No integration tests
- ❌ No component tests for features

**Test Execution:**

- Local: `npm test`
- CI/CD: Tests run on PR (via `pr-build-check.yml`)

## CI/CD Pipeline

### GitHub Actions Workflows

**1. Semantic PR Check** (`semantic-pr-check.yml`):

- Validates PR titles follow conventional commits
- Required prefixes: feat, fix, docs, style, refactor, perf, test,
  build, ci, chore, revert
- Blocks merge if title invalid

**2. PR Build Check** (`pr-build-check.yml`):

- Runs on all PRs
- Executes: lint, build, test
- Must pass before merge

**3. Main Merge** (`main-merge.yml`):

- Triggers on merge to main
- Bumps version based on PR title:
  - `feat!:` → Major version
  - `feat:` → Minor version
  - Others → Patch version
- Creates automated PR with version updates
- Auto-merges when checks pass

**4. GHCR Cleanup** (`cleanup_ghcr.yml`):

- Cleans up old container images
- Runs on schedule

### Deployment Platform

**Platform:** Vercel

**Configuration:**

- Framework: Next.js
- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`
- Node version: >=24.0.0

**Environment Variables:**

- Managed in Vercel dashboard
- No documented environment variables currently

**Docker Support:**

- Development: `npm run docker:up`
- Production: `npm run docker:prod:up`
- Standalone output mode enabled in `next.config.ts`

## Performance Characteristics

### Current Performance

**Strengths:**

- ✅ Turbopack for fast builds
- ✅ Next.js image optimization
- ✅ Standalone output for Docker
- ✅ Client-side caching via browser

**Weaknesses:**

- ❌ No server-side caching
- ❌ No CDN for API responses
- ❌ No request deduplication
- ❌ No data persistence
- ❌ Full page re-fetch on game selection

**Optimization Opportunities:**

- Implement request caching
- Add data persistence layer
- Optimize bundle size
- Implement code splitting
- Add service worker for offline support

## Security Considerations

### Current State

**Authentication:**

- ❌ No authentication system
- ❌ No user accounts
- ✅ Public read-only application

**API Security:**

- ✅ API routes act as proxy (hides NHL API from client)
- ❌ No rate limiting
- ❌ No request validation
- ❌ No API key management (NHL EDGE is public)

**Data Privacy:**

- ✅ No user data collected
- ✅ No cookies (except Vercel Analytics)
- ⚠️ Vercel Analytics enabled

**Dependencies:**

- ✅ Regular updates via Dependabot
- ⚠️ No automated vulnerability scanning documented

## Known Issues & Technical Debt

### Critical Issues (From Strategic Plan)

1. **Goalie Pulled Situations** - Appear as PPG/SHG incorrectly
2. **Game Reload Bug** - Clicking current game in URL doesn't reload
3. **Timeline SHG Bug** - Last SHG also shows as empty net goal
4. **0 SOG Display** - Game header shows nothing instead of 0

### Architectural Technical Debt

1. **No API Abstraction Layer**
   - Direct coupling to NHL EDGE API
   - Vulnerable to breaking changes
   - Difficult to add other leagues (PWHL, WHL)

2. **No Data Persistence**
   - No historical data
   - No offline support
   - No caching beyond browser

3. **No Testing Coverage**
   - Only one test file
   - No E2E tests
   - No integration tests

4. **No Error Tracking**
   - Console.error only
   - No centralized error monitoring
   - Difficult to diagnose production issues

5. **State Management**
   - Props drilling in some areas
   - No global state solution
   - Limited state persistence

6. **Component Documentation**
   - Minimal JSDoc comments
   - No Storybook or component docs
   - Unclear component contracts

## Dependencies & External Services

### Critical Dependencies

**NHL EDGE API:**

- **URL:** `https://api-web.nhle.com/v1`
- **Status:** Undocumented, subject to change
- **Authentication:** None (public)
- **Rate Limits:** Unknown
- **SLA:** None
- **Reference:** <https://github.com/Zmalski/NHL-API-Reference>

**Vercel:**

- **Hosting:** Production deployment
- **Analytics:** User tracking
- **Edge Network:** CDN and routing

**npm Registry:**

- **Dependencies:** All packages
- **Vulnerability:** Dependabot monitoring

### Service Dependencies

**Build Time:**

- npm registry
- GitHub (for CI/CD)

**Runtime:**

- NHL EDGE API (critical)
- Vercel Edge Network
- Browser APIs (fetch, localStorage)

## Future Architecture Considerations

### Planned Improvements (From Strategic Plan)

**Phase 1 (Weeks 1-3):**

- Testing infrastructure (Jest, React Testing Library, Playwright)
- Critical bug fixes
- Error tracking (Sentry)

**Phase 2 (Weeks 4-6):**

- Enhanced Vercel Analytics
- User feedback widget
- Performance monitoring

**Phase 3 (Weeks 7-9):**

- UX improvements
- Timezone selection
- QR code sharing

**Phase 4 (Weeks 10-12):**

- Admin panel
- User accounts (research)
- Mobile optimization
- Accessibility improvements

**Future (Q2+):**

- API abstraction layer
- Neo4j data persistence
- Multi-league support (PWHL, WHL)

### Architectural Evolution Path

**Short Term (Q1 2026):**

1. Add testing infrastructure
2. Implement error tracking
3. Add analytics and monitoring
4. Fix critical bugs

**Medium Term (Q2 2026):**

1. API abstraction layer
2. Data persistence (Neo4j)
3. Caching strategy
4. User authentication

**Long Term (Q3+ 2026):**

1. Multi-league support
2. Advanced analytics
3. Historical data analysis
4. Mobile app consideration

## Conclusion

Sploosh.AI Hockey Analytics is a well-structured Next.js application with a
clear component architecture and modern tech stack. The current architecture
prioritizes simplicity and rapid development over scalability and resilience.

**Key Strengths:**

- Modern Next.js 16 with App Router
- Type-safe TypeScript throughout
- Clean component organization
- Automated CI/CD with semantic versioning
- Docker support for development and production

**Key Weaknesses:**

- Direct coupling to NHL EDGE API
- Minimal test coverage
- No data persistence or caching
- Limited error handling and monitoring
- No abstraction for multi-league support

**Immediate Priorities:**

1. Establish testing infrastructure
2. Fix critical bugs
3. Add error tracking
4. Implement basic analytics

**Strategic Priorities:**

1. API abstraction layer
2. Data persistence
3. Caching and performance optimization
4. Multi-league architecture

This document serves as the current state of the system architecture and is
actively maintained as a living document. It reflects the architecture as of
January 4, 2026 and will be updated as the system evolves. Significant
architectural changes are documented as Architecture Decision Records (ADRs)
in the `/docs/architecture/` folder.
