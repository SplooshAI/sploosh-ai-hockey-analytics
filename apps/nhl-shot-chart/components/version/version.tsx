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
    const formattedString = `${year}.${month}.${day} @ ${timePart}`

    setFormattedDate(formattedString)
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
            {formattedDate}
          </>
        )}
      </p>
    </div>
  )
}