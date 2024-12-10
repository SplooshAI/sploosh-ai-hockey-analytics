import { getVersionInfo } from '@/lib/version'

export function Version() {
  const { version, gitHash } = getVersionInfo()
  
  return (
    <div className="text-xs text-muted-foreground">
      <span>v{version}</span>
      {gitHash && (
        <>
          <span className="mx-1">•</span>
          <span>{gitHash.substring(0, 7)}</span>
        </>
      )}
    </div>
  )
}