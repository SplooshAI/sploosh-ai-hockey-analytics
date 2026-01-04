import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  variant?: 'error' | 'warning'
}

export function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry, 
  retryLabel = 'Retry',
  variant = 'error'
}: ErrorMessageProps) {
  const variantStyles = variant === 'error' 
    ? 'bg-destructive/10 border-destructive/20 text-destructive'
    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'

  return (
    <div className={`rounded-lg border p-4 ${variantStyles}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-sm mt-1 opacity-90">{message}</p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md bg-background/50 hover:bg-background/80 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
