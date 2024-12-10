'use client'
import { getVersionInfo } from '../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function Version() {
  const { version, gitHash, gitDate, nextJsVersion } = getVersionInfo()
  const searchParams = useSearchParams()
  const [formattedDate, setFormattedDate] = useState<string>('')
  
  useEffect(() => {
    if (!gitDate) return
    
    const timezone = searchParams.get('tz') || Intl.DateTimeFormat().resolvedOptions().timeZone
    const date = parseISO(gitDate)
    
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return 'th'
      switch (day % 10) {
        case 1: return 'st'
        case 2: return 'nd'
        case 3: return 'rd'
        default: return 'th'
      }
    }
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: timezone,
      timeZoneName: 'short'
    }).format(date)
      .replace(/(\d+),/, (_, d) => `${d}${getOrdinalSuffix(parseInt(d))},`)
      .replace(' at ', ' @ ')
    
    setFormattedDate(formatted)
  }, [gitDate, searchParams])
  
  return (
    <div className="text-xs text-muted-foreground">
      <span>Next.js {nextJsVersion}</span>
      <span className="mx-1">•</span>
      <span>v{version}</span>
      {gitHash && (
        <>
          <span className="mx-1">•</span>
          <span>{gitHash.substring(0, 7)}</span>
          <span className="mx-1">•</span>
          <span>{formattedDate}</span>
        </>
      )}
    </div>
  )
}