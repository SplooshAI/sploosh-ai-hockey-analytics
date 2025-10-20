'use client'

/**
 * SplooshCopyright - Displays Sploosh.AI copyright and platform information
 * 
 * This component provides copyright notice for the Sploosh.AI Hockey Analytics platform.
 * 
 * @example
 * <SplooshCopyright variant="sidebar" />
 * <SplooshCopyright variant="footer" />
 */

interface SplooshCopyrightProps {
  /** Display variant - sidebar for compact view, footer for full view */
  variant?: 'sidebar' | 'footer'
}

export function SplooshCopyright({ variant = 'footer' }: SplooshCopyrightProps) {
  const currentYear = new Date().getFullYear()
  
  if (variant === 'sidebar') {
    return (
      <div className="text-xs text-muted-foreground">
        <p className="font-medium">
          <a 
            href="https://www.sploosh.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Sploosh.AI
          </a>
          {' '}Hockey Analytics
        </p>
        <p className="mt-1">
          © {currentYear}{' '}
          <a 
            href="https://www.sploosh.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Sploosh.AI
          </a>
          . All rights reserved.
        </p>
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="font-medium">
            <a 
              href="https://www.sploosh.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Sploosh.AI
            </a>
            {' '}Hockey Analytics
          </p>
          <p className="text-xs mt-1">
            © {currentYear}{' '}
            <a 
              href="https://www.sploosh.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Sploosh.AI
            </a>
            . All rights reserved.
          </p>
        </div>
        <div className="text-xs">
          <p>
            Advanced hockey analytics and visualization platform
          </p>
        </div>
      </div>
    </div>
  )
}
