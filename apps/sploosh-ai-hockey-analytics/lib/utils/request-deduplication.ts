/**
 * Request deduplication utility to prevent duplicate API calls
 * Tracks in-flight requests and returns the same promise for duplicate requests
 */

type PendingRequest<T> = {
  promise: Promise<T>
  timestamp: number
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map()
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  /**
   * Execute a request with deduplication
   * If the same request is already in flight, return the existing promise
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already in flight
    const existing = this.pendingRequests.get(key)
    
    if (existing) {
      // Check if request hasn't timed out
      if (Date.now() - existing.timestamp < this.REQUEST_TIMEOUT) {
        return existing.promise
      } else {
        // Request timed out, remove it
        this.pendingRequests.delete(key)
      }
    }

    // Create new request
    const promise = requestFn()
      .then(result => {
        // Clean up on success
        this.pendingRequests.delete(key)
        return result
      })
      .catch(error => {
        // Clean up on error
        this.pendingRequests.delete(key)
        throw error
      })

    // Store the pending request
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear()
  }

  /**
   * Clear a specific request
   */
  clearRequest(key: string): void {
    this.pendingRequests.delete(key)
  }

  /**
   * Check if a request is pending
   */
  isPending(key: string): boolean {
    const existing = this.pendingRequests.get(key)
    if (!existing) return false
    
    // Check if not timed out
    return Date.now() - existing.timestamp < this.REQUEST_TIMEOUT
  }
}

// Export singleton instance
export const requestDeduplicator = new RequestDeduplicator()
