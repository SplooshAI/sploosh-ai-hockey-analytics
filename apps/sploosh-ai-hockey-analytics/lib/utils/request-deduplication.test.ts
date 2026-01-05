import { requestDeduplicator } from './request-deduplication'
import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('RequestDeduplicator', () => {
  beforeEach(() => {
    requestDeduplicator.clear()
    vi.clearAllMocks()
  })

  describe('dedupe', () => {
    it('should execute request function and return result', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'test' })
      
      const result = await requestDeduplicator.dedupe('test-key', mockFn)
      
      expect(result).toEqual({ data: 'test' })
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should return same promise for duplicate requests', async () => {
      let resolveCount = 0
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolveCount++
            resolve({ data: 'test', count: resolveCount })
          }, 100)
        })
      })
      
      // Make 3 simultaneous requests with same key
      const [result1, result2, result3] = await Promise.all([
        requestDeduplicator.dedupe('test-key', mockFn),
        requestDeduplicator.dedupe('test-key', mockFn),
        requestDeduplicator.dedupe('test-key', mockFn)
      ])
      
      // Should only call function once
      expect(mockFn).toHaveBeenCalledTimes(1)
      
      // All should get same result
      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
      expect(resolveCount).toBe(1)
    })

    it('should allow new request after previous completes', async () => {
      const mockFn = vi.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' })
      
      // First request
      const result1 = await requestDeduplicator.dedupe('test-key', mockFn)
      expect(result1).toEqual({ data: 'first' })
      
      // Second request (after first completes)
      const result2 = await requestDeduplicator.dedupe('test-key', mockFn)
      expect(result2).toEqual({ data: 'second' })
      
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle different keys independently', async () => {
      const mockFn1 = vi.fn().mockResolvedValue({ data: 'key1' })
      const mockFn2 = vi.fn().mockResolvedValue({ data: 'key2' })
      
      const [result1, result2] = await Promise.all([
        requestDeduplicator.dedupe('key1', mockFn1),
        requestDeduplicator.dedupe('key2', mockFn2)
      ])
      
      expect(result1).toEqual({ data: 'key1' })
      expect(result2).toEqual({ data: 'key2' })
      expect(mockFn1).toHaveBeenCalledTimes(1)
      expect(mockFn2).toHaveBeenCalledTimes(1)
    })
  })

  describe('error handling', () => {
    it('should propagate errors from request function', async () => {
      const mockError = new Error('Request failed')
      const mockFn = vi.fn().mockRejectedValue(mockError)
      
      await expect(
        requestDeduplicator.dedupe('test-key', mockFn)
      ).rejects.toThrow('Request failed')
    })

    it('should clean up after error', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({ data: 'success' })
      
      // First request fails
      await expect(
        requestDeduplicator.dedupe('test-key', mockFn)
      ).rejects.toThrow('First error')
      
      // Should allow retry after error
      const result = await requestDeduplicator.dedupe('test-key', mockFn)
      expect(result).toEqual({ data: 'success' })
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should propagate error to all waiting requests', async () => {
      const mockError = new Error('Request failed')
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(mockError), 100)
        })
      })
      
      // Make 3 simultaneous requests
      const promises = [
        requestDeduplicator.dedupe('test-key', mockFn),
        requestDeduplicator.dedupe('test-key', mockFn),
        requestDeduplicator.dedupe('test-key', mockFn)
      ]
      
      // All should reject with same error
      await expect(Promise.all(promises)).rejects.toThrow('Request failed')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('timeout handling', () => {
    it('should allow new request after timeout', async () => {
      vi.useFakeTimers()
      
      const mockFn = vi.fn()
        .mockResolvedValueOnce({ data: 'first' })
        .mockResolvedValueOnce({ data: 'second' })
      
      // Start first request
      const promise1 = requestDeduplicator.dedupe('test-key', mockFn)
      
      // Advance time past timeout (30 seconds)
      vi.advanceTimersByTime(31000)
      
      // Start second request (should not be deduped due to timeout)
      const promise2 = requestDeduplicator.dedupe('test-key', mockFn)
      
      await vi.runAllTimersAsync()
      
      const [result1, result2] = await Promise.all([promise1, promise2])
      
      expect(result1).toEqual({ data: 'first' })
      expect(result2).toEqual({ data: 'second' })
      expect(mockFn).toHaveBeenCalledTimes(2)
      
      vi.useRealTimers()
    })
  })

  describe('isPending', () => {
    it('should return true for pending request', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: 'test' }), 100)
        })
      })
      
      const promise = requestDeduplicator.dedupe('test-key', mockFn)
      
      expect(requestDeduplicator.isPending('test-key')).toBe(true)
      
      await promise
      
      expect(requestDeduplicator.isPending('test-key')).toBe(false)
    })

    it('should return false for non-existent key', () => {
      expect(requestDeduplicator.isPending('non-existent')).toBe(false)
    })

    it('should return false after timeout', () => {
      vi.useFakeTimers()
      
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: 'test' }), 100)
        })
      })
      
      requestDeduplicator.dedupe('test-key', mockFn)
      
      expect(requestDeduplicator.isPending('test-key')).toBe(true)
      
      // Advance past timeout
      vi.advanceTimersByTime(31000)
      
      expect(requestDeduplicator.isPending('test-key')).toBe(false)
      
      vi.useRealTimers()
    })
  })

  describe('clear', () => {
    it('should clear all pending requests', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: 'test' }), 100)
        })
      })
      
      requestDeduplicator.dedupe('key1', mockFn)
      requestDeduplicator.dedupe('key2', mockFn)
      
      expect(requestDeduplicator.isPending('key1')).toBe(true)
      expect(requestDeduplicator.isPending('key2')).toBe(true)
      
      requestDeduplicator.clear()
      
      expect(requestDeduplicator.isPending('key1')).toBe(false)
      expect(requestDeduplicator.isPending('key2')).toBe(false)
    })
  })

  describe('clearRequest', () => {
    it('should clear specific request', async () => {
      const mockFn = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: 'test' }), 100)
        })
      })
      
      requestDeduplicator.dedupe('key1', mockFn)
      requestDeduplicator.dedupe('key2', mockFn)
      
      expect(requestDeduplicator.isPending('key1')).toBe(true)
      expect(requestDeduplicator.isPending('key2')).toBe(true)
      
      requestDeduplicator.clearRequest('key1')
      
      expect(requestDeduplicator.isPending('key1')).toBe(false)
      expect(requestDeduplicator.isPending('key2')).toBe(true)
    })
  })
})
