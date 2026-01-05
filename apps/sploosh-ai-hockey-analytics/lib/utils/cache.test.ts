import { Cache } from './cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('Cache', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const testData = { id: 1, name: 'Test Game' }
      Cache.set('test-key', testData)
      
      const retrieved = Cache.get('test-key')
      expect(retrieved).toEqual(testData)
    })

    it('should return null for non-existent key', () => {
      const result = Cache.get('non-existent')
      expect(result).toBeNull()
    })

    it('should handle different data types', () => {
      Cache.set('string', 'test string')
      Cache.set('number', 42)
      Cache.set('boolean', true)
      Cache.set('array', [1, 2, 3])
      Cache.set('object', { nested: { value: 'test' } })

      expect(Cache.get('string')).toBe('test string')
      expect(Cache.get('number')).toBe(42)
      expect(Cache.get('boolean')).toBe(true)
      expect(Cache.get('array')).toEqual([1, 2, 3])
      expect(Cache.get('object')).toEqual({ nested: { value: 'test' } })
    })
  })

  describe('TTL (Time To Live)', () => {
    it('should expire data after TTL', () => {
      vi.useFakeTimers()
      
      const testData = { id: 1 }
      const ttl = 1000 // 1 second
      
      Cache.set('test-key', testData, ttl)
      
      // Should be available immediately
      expect(Cache.get('test-key')).toEqual(testData)
      
      // Advance time past TTL
      vi.advanceTimersByTime(ttl + 1)
      
      // Should be expired
      expect(Cache.get('test-key')).toBeNull()
      
      vi.useRealTimers()
    })

    it('should use default TTL when not specified', () => {
      vi.useFakeTimers()
      
      const testData = { id: 1 }
      Cache.set('test-key', testData)
      
      // Should be available after 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000)
      expect(Cache.get('test-key')).toEqual(testData)
      
      // Should be expired after 1 hour + 1ms
      vi.advanceTimersByTime(30 * 60 * 1000 + 1)
      expect(Cache.get('test-key')).toBeNull()
      
      vi.useRealTimers()
    })
  })

  describe('getStale', () => {
    it('should retrieve expired data with isStale flag', () => {
      vi.useFakeTimers()
      
      const testData = { id: 1 }
      const ttl = 1000
      
      Cache.set('test-key', testData, ttl)
      
      // Not stale initially
      const fresh = Cache.getStale('test-key')
      expect(fresh).toEqual({ data: testData, isStale: false })
      
      // Advance past TTL
      vi.advanceTimersByTime(ttl + 1)
      
      // Should still retrieve but marked as stale
      const stale = Cache.getStale('test-key')
      expect(stale).toEqual({ data: testData, isStale: true })
      
      vi.useRealTimers()
    })

    it('should return null for non-existent key', () => {
      const result = Cache.getStale('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('remove', () => {
    it('should remove cached item', () => {
      Cache.set('test-key', { id: 1 })
      expect(Cache.get('test-key')).not.toBeNull()
      
      Cache.remove('test-key')
      expect(Cache.get('test-key')).toBeNull()
    })

    it('should not throw error when removing non-existent key', () => {
      expect(() => Cache.remove('non-existent')).not.toThrow()
    })
  })

  describe('clear', () => {
    it('should clear all cache entries', () => {
      Cache.set('key1', { id: 1 })
      Cache.set('key2', { id: 2 })
      Cache.set('key3', { id: 3 })
      
      expect(Cache.get('key1')).not.toBeNull()
      expect(Cache.get('key2')).not.toBeNull()
      expect(Cache.get('key3')).not.toBeNull()
      
      Cache.clear()
      
      expect(Cache.get('key1')).toBeNull()
      expect(Cache.get('key2')).toBeNull()
      expect(Cache.get('key3')).toBeNull()
    })

    it('should only clear cache entries with prefix', () => {
      // Set cache entry
      Cache.set('test-key', { id: 1 })
      
      // Set non-cache entry directly in localStorage
      localStorage.setItem('other_key', 'other value')
      
      Cache.clear()
      
      expect(Cache.get('test-key')).toBeNull()
      expect(localStorage.getItem('other_key')).toBe('other value')
    })
  })

  describe('getAge', () => {
    it('should return age of cached item in milliseconds', () => {
      vi.useFakeTimers()
      
      Cache.set('test-key', { id: 1 })
      
      // Age should be 0 immediately
      expect(Cache.getAge('test-key')).toBe(0)
      
      // Advance time
      vi.advanceTimersByTime(5000)
      
      // Age should be 5000ms
      expect(Cache.getAge('test-key')).toBe(5000)
      
      vi.useRealTimers()
    })

    it('should return null for non-existent key', () => {
      expect(Cache.getAge('non-existent')).toBeNull()
    })
  })

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock localStorage to throw error
      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })
      
      // Should not throw, just warn
      expect(() => Cache.set('test-key', { id: 1 })).not.toThrow()
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      // Restore
      Storage.prototype.setItem = originalSetItem
      consoleWarnSpy.mockRestore()
    })

    it('should handle corrupted cache data', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Set corrupted data directly
      localStorage.setItem('sploosh_cache_test-key', 'invalid json')
      
      // Should return null and warn
      expect(Cache.get('test-key')).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      consoleWarnSpy.mockRestore()
    })
  })
})
