# Sentry Error Tracking Setup

This document explains how to set up Sentry error tracking for the
Sploosh AI Hockey Analytics application.

## Prerequisites

- Sentry account (free tier available at <https://sentry.io>)
- Node.js and npm installed

## Setup Steps

### 1. Install Sentry SDK

```bash
cd apps/sploosh-ai-hockey-analytics
npm install @sentry/nextjs
```

### 2. Run Sentry Wizard

The wizard will automatically configure Sentry for your Next.js application:

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:

- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js` with Sentry configuration
- Add `.sentryclirc` for build-time source map uploads

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Sentry DSN (Data Source Name) - get this from your Sentry project settings
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/your-project-id

# Optional: Enable Sentry in development
NEXT_PUBLIC_SENTRY_ENABLED=false

# Sentry Auth Token (for source map uploads)
SENTRY_AUTH_TOKEN=your-auth-token

# Sentry Organization and Project
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### 4. Enable Sentry Integration

Uncomment the Sentry initialization code in:

- `lib/monitoring/sentry.ts`
- `app/layout.tsx` (add initSentry() call)
- `components/shared/error/error-boundary.tsx` (add captureException call)

### 5. Test Error Tracking

Create a test error to verify Sentry is working:

```typescript
import { captureException } from '@/lib/monitoring/sentry'

try {
  throw new Error('Test Sentry error')
} catch (error) {
  captureException(error as Error, { context: 'test' })
}
```

Check your Sentry dashboard to see if the error appears.

## Configuration Options

### Sample Rates

Adjust these in `lib/monitoring/sentry.ts`:

```typescript
tracesSampleRate: 0.1,        // 10% of transactions for performance monitoring
replaysSessionSampleRate: 0.1, // 10% of sessions for replay
replaysOnErrorSampleRate: 1.0, // 100% of error sessions for replay
```

### Ignored Errors

Add patterns to ignore specific errors:

```typescript
ignoreErrors: [
  'NetworkError',
  'Failed to fetch',
  'AbortError',
  // Add more patterns as needed
]
```

### Before Send Hook

Filter sensitive data before sending to Sentry:

```typescript
beforeSend(event) {
  // Remove sensitive information
  if (event.request?.url) {
    // Strip query parameters
    const url = new URL(event.request.url)
    url.search = ''
    event.request.url = url.toString()
  }
  return event
}
```

## Sentry Free Tier Limits

- **1 user**
- **5,000 errors per month**
- **10,000 performance units per month**
- **50 replays per month**
- **30 days data retention**

## Best Practices

1. **Don't log sensitive data** - Filter out API keys, tokens, personal information
2. **Set appropriate sample rates** - Don't send 100% of events in production
3. **Use breadcrumbs** - Add context to help debug issues
4. **Tag errors** - Add tags for easier filtering (e.g., environment, feature)
5. **Set user context** - Helps identify affected users (but respect privacy)
6. **Monitor quota** - Check Sentry dashboard regularly to avoid hitting limits

## Integration Points

Sentry is integrated at these points:

1. **ErrorBoundary** - Catches React component errors
2. **API error handling** - Captures failed API requests
3. **Manual captures** - Use `captureException()` for specific errors
4. **Performance monitoring** - Tracks page load times and API calls

## Troubleshooting

### Source maps not uploading

Check that `SENTRY_AUTH_TOKEN` is set and has the correct permissions.

### Errors not appearing in Sentry

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify Sentry is initialized (check browser console)
3. Check network tab for Sentry requests
4. Verify error isn't in `ignoreErrors` list

### Too many events

Adjust sample rates or add more patterns to `ignoreErrors`.

## Resources

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
