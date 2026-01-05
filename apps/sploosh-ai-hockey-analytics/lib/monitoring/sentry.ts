/**
 * Sentry error tracking integration
 * 
 * To enable Sentry:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Add SENTRY_DSN to .env.local
 * 4. Uncomment the initialization code below
 */

// import * as Sentry from '@sentry/nextjs'

export function initSentry() {
  // Only initialize in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_SENTRY_ENABLED) {
    return
  }

  // Uncomment when Sentry is set up:
  /*
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // Adjust this value in production
    tracesSampleRate: 0.1,
    
    // Capture Replay for 10% of all sessions,
    // plus 100% of sessions with an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter out sensitive information
    beforeSend(event) {
      // Remove query parameters that might contain sensitive data
      if (event.request?.url) {
        try {
          const url = new URL(event.request.url)
          url.search = ''
          event.request.url = url.toString()
        } catch (e) {
          // Invalid URL, skip filtering
        }
      }
      return event
    },
    
    // Ignore certain errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      // Random plugins/extensions
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      // Network errors that are expected
      'NetworkError',
      'Failed to fetch',
      // Abort errors (user cancelled)
      'AbortError',
    ],
  })
  */
}

/**
 * Manually capture an exception
 */
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context)
  
  // Uncomment when Sentry is set up:
  /*
  Sentry.captureException(error, {
    extra: context
  })
  */
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level}]`, message)
  
  // Uncomment when Sentry is set up:
  /*
  Sentry.captureMessage(message, level)
  */
}

/**
 * Set user context for error tracking
 */
export function setUser(_user: { id: string; email?: string; username?: string }) {
  // Uncomment when Sentry is set up:
  /*
  Sentry.setUser(_user)
  */
}

/**
 * Clear user context
 */
export function clearUser() {
  // Uncomment when Sentry is set up:
  /*
  Sentry.setUser(null)
  */
}
