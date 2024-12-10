'use client'
import { getVersionInfo } from '../../lib/version'
import { parseISO } from 'date-fns'
import { useSearchParams } from 'next/navigation'

export function Version() {
  const { version, gitHash, gitDate, nextJsVersion } = getVersionInfo()
  const searchParams = useSearchParams()
  const timezone = searchParams.get('tz') || Intl.DateTimeFormat().resolvedOptions().timeZone
  
  const formatCommitDate = (dateString: string) => {
    const date = parseISO(dateString)
    return new Intl.DateTimeFormat('en-US', {
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
  }
  
  // // Debug timezone info
  // const debugTimezone = () => {
  //   return (
  //     <div className="text-xs">
  //       <div>Timezone: {timezone}</div>
  //       <div>Browser Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
  //       <div>Offset: {new Date().getTimezoneOffset() / -60}hrs</div>
  //       <div>System Date: {new Date().toString()}</div>
  //     </div>
  //   )
  // }
  
  return (
    <div className="text-xs text-muted-foreground">
      {/* {debugTimezone()} */}
      <span>Next.js {nextJsVersion}</span>
      <span className="mx-1">•</span>
      <span>v{version}</span>
      {gitHash && (
        <>
          <span className="mx-1">•</span>
          <span>{gitHash.substring(0, 7)}</span>
          <span className="mx-1">•</span>
          <span>{gitDate ? formatCommitDate(gitDate).replace(' at ', ' @ ') : ''}</span>
        </>
      )}
    </div>
  )
}