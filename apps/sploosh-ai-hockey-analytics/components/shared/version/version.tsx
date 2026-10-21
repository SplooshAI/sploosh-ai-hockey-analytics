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
    <div
      data-testid="version-card"
      className="overflow-hidden rounded-xl border border-border/60 bg-background/60 text-xs text-muted-foreground"
    >
      <a
        href={repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View the repository on GitHub"
        title="View the repository on GitHub"
        className="group flex items-center gap-3 p-3 transition-colors hover:bg-primary/5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Github className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-sm font-semibold text-foreground">Sploosh.AI</span>
          <span className="block text-xs text-muted-foreground">Hockey Analytics</span>
        </span>
        <ExternalLink
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden="true"
        />
      </a>
      <div className="space-y-1.5 border-t border-border/60 px-3 py-2.5">
        <div className="space-y-1">
          <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
            v{version}
          </span>
          {formattedDate && <p className="text-[11px] leading-tight">{formattedDate}</p>}
        </div>
        <p className="text-balance text-[10px] leading-snug text-muted-foreground/80">
          © {currentYear} Sploosh.AI. All rights reserved.
        </p>
      </div>
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