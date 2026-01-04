/**
 * Converts technical error messages into user-friendly messages
 */
export function getFriendlyErrorMessage(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  // Network errors
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return "We're having trouble connecting to the NHL servers. Please check your internet connection and try again."
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return "The request is taking longer than expected. The NHL servers might be busy. Please try again in a moment."
  }
  
  // 404 errors
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return "We couldn't find that game. It might not exist or hasn't been played yet."
  }
  
  // 500 errors
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    return "The NHL servers are experiencing issues. Please try again in a few minutes."
  }
  
  // 503 errors
  if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    return "The NHL servers are temporarily unavailable. Please try again shortly."
  }
  
  // Rate limiting
  if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests')) {
    return "We've made too many requests. Please wait a moment before trying again."
  }
  
  // Parse errors
  if (errorMessage.includes('JSON') || errorMessage.includes('parse')) {
    return "We received unexpected data from the NHL servers. Please try again."
  }
  
  // Abort errors (user cancelled)
  if (errorMessage.includes('abort') || errorMessage.includes('cancelled')) {
    return "Request was cancelled. Please try again if needed."
  }
  
  // Generic fallback
  return "Something went wrong while loading the data. Please try again."
}

/**
 * Get a friendly title for an error
 */
export function getFriendlyErrorTitle(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error)
  
  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return "Connection Issue"
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return "Game Not Found"
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('503')) {
    return "Server Issue"
  }
  
  return "Unable to Load Data"
}
