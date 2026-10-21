'use client'
import { getVersionInfo } from '../../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Github } from 'lucide-react'

function VersionContent() {
  const { version, gitDate, repoUrl } = getVersionInfo()
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
        <a
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View the repository on GitHub"
          title="View the repository on GitHub"
          className="inline-flex items-center gap-1.5 hover:text-primary hover:underline transition-colors"
        >
          <Github className="h-3.5 w-3.5" aria-hidden="true" />
          Sploosh.AI Hockey Analytics v{version}
        </a>
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