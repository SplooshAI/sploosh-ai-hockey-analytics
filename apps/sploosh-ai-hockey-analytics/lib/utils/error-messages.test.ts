import { getFriendlyErrorMessage, getFriendlyErrorTitle } from './error-messages'

describe('getFriendlyErrorMessage', () => {
  it('should return friendly message for network errors', () => {
    const error = new TypeError('Failed to fetch')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("We're having trouble connecting to the NHL servers. Please check your internet connection and try again.")
  })

  it('should return friendly message for NetworkError', () => {
    const error = new Error('NetworkError when attempting to fetch resource')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("We're having trouble connecting to the NHL servers. Please check your internet connection and try again.")
  })

  it('should return friendly message for timeout errors', () => {
    const error = new Error('Request timed out')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("The request is taking longer than expected. The NHL servers might be busy. Please try again in a moment.")
  })

  it('should return friendly message for 404 errors', () => {
    const error = new Error('404 Not Found')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("We couldn't find that game. It might not exist or hasn't been played yet.")
  })

  it('should return friendly message for 500 errors', () => {
    const error = new Error('500 Internal Server Error')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("The NHL servers are experiencing issues. Please try again in a few minutes.")
  })

  it('should return friendly message for 503 errors', () => {
    const error = new Error('503 Service Unavailable')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("The NHL servers are temporarily unavailable. Please try again shortly.")
  })

  it('should return friendly message for rate limiting', () => {
    const error = new Error('429 Too Many Requests')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("We've made too many requests. Please wait a moment before trying again.")
  })

  it('should return friendly message for JSON parse errors', () => {
    const error = new Error('Unexpected token in JSON at position 0')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("We received unexpected data from the NHL servers. Please try again.")
  })

  it('should return friendly message for abort errors', () => {
    const error = new Error('Request aborted')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("Request was cancelled. Please try again if needed.")
  })

  it('should return generic friendly message for unknown errors', () => {
    const error = new Error('Some unknown error')
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("Something went wrong while loading the data. Please try again.")
  })

  it('should handle string errors', () => {
    const error = 'String error message'
    const message = getFriendlyErrorMessage(error)
    
    expect(message).toBe("Something went wrong while loading the data. Please try again.")
  })

  it('should handle non-Error objects', () => {
    const error = { message: 'Failed to fetch' }
    const message = getFriendlyErrorMessage(error)
    
    // Non-Error objects are converted to strings, which won't match specific error patterns
    expect(message).toBe("Something went wrong while loading the data. Please try again.")
  })
})

describe('getFriendlyErrorTitle', () => {
  it('should return "Connection Issue" for network errors', () => {
    const error = new TypeError('Failed to fetch')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Connection Issue')
  })

  it('should return "Connection Issue" for NetworkError', () => {
    const error = new Error('NetworkError')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Connection Issue')
  })

  it('should return "Game Not Found" for 404 errors', () => {
    const error = new Error('404 Not Found')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Game Not Found')
  })

  it('should return "Server Issue" for 500 errors', () => {
    const error = new Error('500 Internal Server Error')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Server Issue')
  })

  it('should return "Server Issue" for 503 errors', () => {
    const error = new Error('503 Service Unavailable')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Server Issue')
  })

  it('should return "Unable to Load Data" for unknown errors', () => {
    const error = new Error('Some unknown error')
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Unable to Load Data')
  })

  it('should handle string errors', () => {
    const error = 'String error'
    const title = getFriendlyErrorTitle(error)
    
    expect(title).toBe('Unable to Load Data')
  })
})
