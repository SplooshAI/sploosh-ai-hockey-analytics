'use client'
import { getVersionInfo } from '../../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

function VersionContent() {
  const { version, gitHash, gitDate, repoUrl } = getVersionInfo()
  const searchParams = useSearchParams()
  const [formattedDate, setFormattedDate] = useState<string>('')
  const currentYear = new Date().getFullYear()
  const timezone = searchParams.get('tz') || Intl.DateTimeFormat().resolvedOptions().timeZone

  useEffect(() => {
    if (!gitDate) return

    try {
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
  }, [gitDate, timezone])

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p className="font-medium">
        Sploosh.AI Hockey Analytics v{version}
      </p>
      <p>
        © {currentYear} Sploosh.AI. All rights reserved.
      </p>
      {formattedDate && (
        <p>
          {formattedDate}
        </p>
      )}
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