import { cacheImage, getImageFromCache, removeImageFromCache, clearImageCache, getImageUrl } from './image-cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = vi.fn()

// Mock FileReader
class FileReaderMock {
  result: string | null = null
  onloadend: (() => void) | null = null
  onerror: (() => void) | null = null
  error: Error | null = null

  readAsDataURL(_blob: Blob) {
    // Simulate successful read with base64 data
    setTimeout(() => {
      this.result = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      if (this.onloadend) {
        this.onloadend()
      }
    }, 0)
  }
}

global.FileReader = FileReaderMock as any

describe('Image Cache', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('cacheImage', () => {
    it('should fetch and cache an image as base64', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/png' })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const result = await cacheImage('/test-image.png', 'test-key')

      expect(result).toContain('data:image/png;base64')
      expect(localStorageMock.getItem('sploosh_image_test-key')).toContain('data:image/png;base64')
    })

    it('should return cached image if already exists', async () => {
      const cachedData = 'data:image/png;base64,cached'
      localStorageMock.setItem('sploosh_image_test-key', cachedData)

      const result = await cacheImage('/test-image.png', 'test-key')

      expect(result).toBe(cachedData)
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle fetch errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const result = await cacheImage('/test-image.png', 'test-key')

      expect(result).toBeNull()
    })

    it('should handle non-ok responses', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      })

      const result = await cacheImage('/test-image.png', 'test-key')

      expect(result).toBeNull()
    })

    it('should return base64 even if localStorage fails', async () => {
      const mockBlob = new Blob(['fake image data'], { type: 'image/png' })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // Mock localStorage.setItem to throw
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError')
      })

      const result = await cacheImage('/test-image.png', 'test-key')

      expect(result).toContain('data:image/png;base64')
      
      // Restore
      localStorageMock.setItem = originalSetItem
    })
  })

  describe('getImageFromCache', () => {
    it('should retrieve cached image', () => {
      const cachedData = 'data:image/png;base64,test'
      localStorageMock.setItem('sploosh_image_test-key', cachedData)

      const result = getImageFromCache('test-key')

      expect(result).toBe(cachedData)
    })

    it('should return null for non-existent key', () => {
      const result = getImageFromCache('non-existent')

      expect(result).toBeNull()
    })

    it('should handle localStorage errors', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      // Mock localStorage.getItem to throw
      const originalGetItem = localStorageMock.getItem
      localStorageMock.getItem = vi.fn(() => {
        throw new Error('Storage error')
      })

      const result = getImageFromCache('test-key')

      expect(result).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalled()
      
      // Restore
      localStorageMock.getItem = originalGetItem
      consoleWarnSpy.mockRestore()
    })
  })

  describe('removeImageFromCache', () => {
    it('should remove cached image', () => {
      localStorageMock.setItem('sploosh_image_test-key', 'data:image/png;base64,test')

      removeImageFromCache('test-key')

      expect(localStorageMock.getItem('sploosh_image_test-key')).toBeNull()
    })

    it('should not throw when removing non-existent key', () => {
      expect(() => removeImageFromCache('non-existent')).not.toThrow()
    })
  })

  describe('clearImageCache', () => {
    it('should not throw when clearing cache', () => {
      localStorageMock.setItem('sploosh_image_key1', 'data1')
      localStorageMock.setItem('sploosh_image_key2', 'data2')

      expect(() => clearImageCache()).not.toThrow()
    })
  })

  describe('getImageUrl', () => {
    it('should return cached URL if available', () => {
      const cachedData = 'data:image/png;base64,cached'
      localStorageMock.setItem('sploosh_image_test-key', cachedData)

      const result = getImageUrl('/original.png', 'test-key')

      expect(result).toBe(cachedData)
    })

    it('should return original URL if not cached', () => {
      const result = getImageUrl('/original.png', 'test-key')

      expect(result).toBe('/original.png')
    })

    it('should trigger background caching when online', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })

      const mockBlob = new Blob(['fake image data'], { type: 'image/png' })
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      getImageUrl('/original.png', 'test-key')

      // Should have triggered cacheImage in background
      expect(global.fetch).toHaveBeenCalledWith('/original.png')
    })
  })
})
