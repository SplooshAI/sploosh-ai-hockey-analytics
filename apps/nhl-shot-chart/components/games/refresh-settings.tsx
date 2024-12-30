import { format } from 'date-fns-tz'

interface RefreshSettingsProps {
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    lastRefreshTime: Date | null
}

export function RefreshSettings({ isEnabled, onToggle, lastRefreshTime }: RefreshSettingsProps) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    return (
        <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-muted-foreground">Auto-refresh (20s)</span>
            </div>

            {lastRefreshTime && (
                <div className="text-muted-foreground">
                    Updated: {format(lastRefreshTime, 'h:mm:ss a zzz', { timeZone })}
                </div>
            )}
        </div>
    )
} 