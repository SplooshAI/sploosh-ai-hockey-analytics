/**
 * Image caching utility for storing images in localStorage as base64
 * Allows offline access to images
 */

const IMAGE_CACHE_PREFIX = 'sploosh_image_'

/**
 * Convert an image URL to a base64 data URL and cache it
 */
export async function cacheImage(url: string, key: string): Promise<string | null> {
  try {
    // Check if already cached
    const cached = getImageFromCache(key)
    if (cached) {
      return cached
    }

    // Fetch the image
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Convert to blob
    const blob = await response.blob()
    
    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result as string
        
        // Store in localStorage
        try {
          localStorage.setItem(IMAGE_CACHE_PREFIX + key, base64data)
          resolve(base64data)
        } catch (error) {
          console.warn('Failed to cache image in localStorage:', error)
          resolve(base64data) // Return the data URL even if caching fails
        }
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error caching image:', error)
    return null
  }
}

/**
 * Get a cached image from localStorage
 */
export function getImageFromCache(key: string): string | null {
  try {
    return localStorage.getItem(IMAGE_CACHE_PREFIX + key)
  } catch (error) {
    console.warn('Failed to retrieve cached image:', error)
    return null
  }
}

/**
 * Remove a cached image from localStorage
 */
export function removeImageFromCache(key: string): void {
  try {
    localStorage.removeItem(IMAGE_CACHE_PREFIX + key)
  } catch (error) {
    console.warn('Failed to remove cached image:', error)
  }
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(IMAGE_CACHE_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Failed to clear image cache:', error)
  }
}

/**
 * Get image URL with fallback to cached version
 * Returns the original URL if online, or cached base64 if offline
 */
export function getImageUrl(originalUrl: string, cacheKey: string): string {
  // Try to get from cache first
  const cached = getImageFromCache(cacheKey)
  if (cached) {
    return cached
  }
  
  // Return original URL and cache it in the background
  if (typeof window !== 'undefined' && navigator.onLine) {
    cacheImage(originalUrl, cacheKey).catch(console.error)
  }
  
  return originalUrl
}
