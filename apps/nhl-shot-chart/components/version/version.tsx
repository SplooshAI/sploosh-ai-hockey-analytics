import { getVersionInfo } from '../../lib/version'
import { format, parseISO } from 'date-fns'

export function Version() {
  const { version, gitHash, gitDate, nextJsVersion } = getVersionInfo()
  
  const formatCommitDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, "EEEE, MMMM do, yyyy '@' h:mm:ssaa zzz")
  }
  
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
          <span>{gitDate ? formatCommitDate(gitDate) : ''}</span>
        </>
      )}
    </div>
  )
}