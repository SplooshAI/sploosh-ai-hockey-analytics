/// <reference types="vitest" />

// Vitest global types
declare global {
  const describe: (name: string, fn: () => void) => void
  const it: (name: string, fn: () => void) => void
  const test: (name: string, fn: () => void) => void
  const expect: (actual: any) => any
  const beforeEach: (fn: () => void) => void
  const afterEach: (fn: () => void) => void
  const beforeAll: (fn: () => void) => void
  const afterAll: (fn: () => void) => void
  const vi: {
    fn: () => any
    mock: (path: string, factory: () => any) => void
    clearAllMocks: () => void
  }
}

export {}
