'use client'
import { getVersionInfo } from '../../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { ExternalLink, Github } from 'lucide-react'

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
    <div className="text-xs text-muted-foreground space-y-2">
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View the repository on GitHub"
        title="View the repository on GitHub"
        className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background/60 p-3 transition-colors hover:border-primary/50 hover:bg-background"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Github className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="block text-sm font-semibold leading-snug text-foreground">
            Sploosh.AI Hockey Analytics
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
              v{version}
            </span>
            <span className="inline-flex items-center gap-1 transition-colors group-hover:text-primary">
              View on GitHub
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </span>
          </span>
        </span>
      </a>
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