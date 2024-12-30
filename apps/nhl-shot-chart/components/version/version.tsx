'use client'
import { getVersionInfo } from '../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function VersionContent() {
  const { version, gitHash, gitDate, nextJsVersion, repoUrl } = getVersionInfo()
  const searchParams = useSearchParams()
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    if (!gitDate) return

    try {
      const timezone = searchParams.get('tz') || Intl.DateTimeFormat().resolvedOptions().timeZone
      const date = parseISO(gitDate)

      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', gitDate);
        return;
      }

      const formatted = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
        timeZoneName: 'short',
        hour12: true
      }).format(date)

      const [datePart, timePart] = formatted.split(', ')
      const [month, day, year] = datePart.split('/')
      const formattedString = `Released ${year}.${month}.${day} @ ${timePart}`

      setFormattedDate(formattedString)
    } catch (error) {
      console.error('Error formatting date:', error);
    }
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
            <a
              href={`${repoUrl}/commit/${gitHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {gitHash.substring(0, 7)}
            </a>
            <br />
            {formattedDate}
          </>
        )}
      </p>
    </div>
  )
}

export function Version() {
  return (
    <Suspense fallback={<div className="text-xs text-muted-foreground">Loading version info...</div>}>
      <VersionContent />
    </Suspense>
  )
}