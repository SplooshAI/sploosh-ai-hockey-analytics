/**
 * Simple localStorage cache utility for game data
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

const CACHE_PREFIX = 'sploosh_cache_'
const DEFAULT_TTL = 1000 * 60 * 60 // 1 hour

export class Cache {
  /**
   * Store data in cache with optional TTL
   */
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      }
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  /**
   * Get data from cache if not expired
   */
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error)
      return null
    }
  }

  /**
   * Get data from cache even if expired (for offline fallback)
   */
  static getStale<T>(key: string): { data: T; isStale: boolean } | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry<T> = JSON.parse(item)
      const isStale = Date.now() > entry.expiresAt

      return { data: entry.data, isStale }
    } catch (error) {
      console.warn('Failed to retrieve stale cached data:', error)
      return null
    }
  }

  /**
   * Remove item from cache
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
    } catch (error) {
      console.warn('Failed to remove cached data:', error)
    }
  }

  /**
   * Clear all cache entries
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear cache:', error)
    }
  }

  /**
   * Get cache age in milliseconds
   */
  static getAge(key: string): number | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const entry: CacheEntry<unknown> = JSON.parse(item)
      const age = Date.now() - entry.timestamp
      return age < 0 ? 0 : age
    } catch (_error) {
      return null
    }
  }
}
