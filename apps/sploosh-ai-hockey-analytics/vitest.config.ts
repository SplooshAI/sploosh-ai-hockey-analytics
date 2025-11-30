/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  // Essential for Next.js compatibility
  optimizeDeps: {
    include: ['@testing-library/react', '@testing-library/jest-dom'],
  },
})
