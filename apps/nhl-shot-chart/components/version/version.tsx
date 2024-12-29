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
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    }).format(date)

    setFormattedDate(formatted)
  }, [gitDate, searchParams])

  return (
    <div className="text-xs text-muted-foreground">
      <p>

        Next.js {nextJsVersion}
        <span className="mx-1">•</span>
        v{version}
        <span className="mx-1">•</span>
        {gitHash && (
          <>
            {gitHash.substring(0, 7)}
            <br />
            Rev. {formattedDate}
          </>
        )}
      </p>
    </div>
  )
}