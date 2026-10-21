'use client'

import { Info } from 'lucide-react'

/**
 * NHLAttribution - Displays required NHL copyright and trademark notices
 * 
 * This component provides proper attribution for NHL data and trademarks
 * as required when using NHL and NHL EDGE data.
 * 
 * @example
 * <NHLAttribution variant="sidebar" />
 * <NHLAttribution variant="footer" />
 */

interface NHLAttributionProps {
  /** Display variant - sidebar for compact view, footer for full view */
  variant?: 'sidebar' | 'footer'
}

export function NHLAttribution({ variant = 'footer' }: NHLAttributionProps) {
  const currentYear = new Date().getFullYear()
  
  if (variant === 'sidebar') {
    return (
      <div
        data-testid="nhl-attribution-card"
        className="overflow-hidden rounded-xl border border-border/60 bg-background/60 text-xs text-muted-foreground"
      >
        <div className="flex items-center gap-3 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-sm font-semibold text-foreground">NHL Data</span>
            <span className="block text-xs text-muted-foreground">Legal notices</span>
          </span>
        </div>
        <div className="space-y-1.5 border-t border-border/60 px-3 py-2.5 text-[11px] leading-snug">
          <p>
            NHL, the NHL Shield, and NHL EDGE are registered trademarks of the National Hockey League.
          </p>
          <p>
            NHL and NHL team marks are the property of the NHL and its teams.
          </p>
          <p className="font-medium text-foreground/80">
            © NHL {currentYear}. All Rights Reserved.
          </p>
        </div>
        <p className="border-t border-border/60 px-3 py-2.5 text-[10px] leading-snug text-muted-foreground/80">
          This application uses publicly available NHL data for informational and analytical purposes.
          We are not affiliated with or endorsed by the NHL.
        </p>
      </div>
    )
  }

  return (
    <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
      <div className="space-y-2">
        <p>
          <strong>NHL Trademarks:</strong> NHL, the NHL Shield, NHL EDGE, and the word mark and image 
          of the Stanley Cup are registered trademarks of the National Hockey League. NHL and NHL team 
          marks are the property of the NHL and its teams. © NHL {currentYear}. All Rights Reserved.
        </p>
        <p>
          <strong>Data Attribution:</strong> All statistics and data displayed in this application are 
          sourced from publicly available NHL and NHL EDGE APIs. NHL EDGE provides official puck and 
          player tracking statistics powered by advanced tracking technology.
        </p>
      </div>
      <div className="pt-2 border-t border-border/30">
        <p className="text-xs">
          <strong>Disclaimer:</strong> This application is an independent project and is not affiliated 
          with, endorsed by, or sponsored by the National Hockey League or any NHL team. All data is 
          used for informational, educational, and analytical purposes only. We do not claim ownership 
          of any NHL data, statistics, or intellectual property.
        </p>
      </div>
    </div>
  )
}
