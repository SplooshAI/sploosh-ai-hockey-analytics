import { getVersionInfo } from '@/lib/version'

export function Version() {
  const { version, gitHash, gitDate, nextJsVersion } = getVersionInfo()
  
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
          <span>{gitDate}</span>
        </>
      )}
    </div>
  )
}