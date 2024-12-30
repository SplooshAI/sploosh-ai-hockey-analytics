import { format } from 'date-fns-tz'
import { RefreshCw } from 'lucide-react'

interface RefreshSettingsProps {
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    lastRefreshTime: Date | null
}

export function RefreshSettings({ isEnabled, onToggle, lastRefreshTime }: RefreshSettingsProps) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    return (
        <div className="bg-background/50 rounded-md px-3 py-2 space-y-2">
            <div className="flex items-center space-x-3">
                <RefreshCw
                    className={`h-4 w-4 text-muted-foreground ${isEnabled ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '3s' }}
                />
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-xs font-medium text-muted-foreground">
                    Auto-refresh
                </span>
            </div>

            {lastRefreshTime && (
                <div className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                    Last updated @ {format(lastRefreshTime, 'h:mm:ss a zzz', { timeZone })}
                </div>
            )}
        </div>
    )
} 