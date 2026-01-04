/**
 * Games List - Magic Number Bug Fix Regression Test
 * 
 * Bug: Magic number 20000 was used directly in multiple places
 * Fix: Replaced with named constant AUTO_REFRESH_INTERVAL_MS
 * 
 * This test verifies the constant is defined and used consistently
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('GamesList - Magic Number Bug Fix', () => {
  const filePath = resolve(__dirname, './games-list.tsx')
  const fileContent = readFileSync(filePath, 'utf-8')

  it('should define AUTO_REFRESH_INTERVAL_MS constant', () => {
    expect(fileContent).toContain('const AUTO_REFRESH_INTERVAL_MS = 20000')
  })

  it('should use AUTO_REFRESH_INTERVAL_MS in setTimeout calls', () => {
    // Verify the constant is used (not the magic number)
    expect(fileContent).toContain('AUTO_REFRESH_INTERVAL_MS')
    
    // Count occurrences of the constant usage
    const constantUsages = (fileContent.match(/AUTO_REFRESH_INTERVAL_MS/g) || []).length
    expect(constantUsages).toBeGreaterThan(1) // Should be used multiple times
  })

  it('should NOT use magic number 20000 directly in setTimeout', () => {
    const lines = fileContent.split('\n')
    
    // Find setTimeout lines that use 20000 but are NOT the constant definition
    const badLines = lines.filter(line => 
      line.includes('setTimeout') && 
      line.includes('20000') &&
      !line.includes('const AUTO_REFRESH_INTERVAL_MS')
    )
    
    expect(badLines.length).toBe(0)
  })
})
