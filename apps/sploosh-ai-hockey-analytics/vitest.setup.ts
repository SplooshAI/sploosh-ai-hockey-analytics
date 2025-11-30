import '@testing-library/jest-dom'

// Suppress console errors and warnings during tests to clean up output
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    // Suppress specific known errors that don't affect test functionality
    if (
      typeof args[0] === 'string' && 
      (
        args[0].includes('Error formatting date:') ||
        args[0].includes('Failed to fetch games:')
      )
    ) {
      return
    }
    originalError.call(console, ...args)
  }
  
  console.warn = (..._args) => {
    // Suppress warnings during tests
    return
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}))

// Mock fetch API
global.fetch = vi.fn()
