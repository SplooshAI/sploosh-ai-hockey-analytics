'use client'
import { format } from 'date-fns-tz'
import { RefreshCw } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

interface RefreshSettingsProps {
    isEnabled: boolean
    onToggle: (enabled: boolean) => void
    lastRefreshTime: Date | null
    defaultEnabled?: boolean
}

export function RefreshSettings({ isEnabled, onToggle, lastRefreshTime, defaultEnabled = false }: RefreshSettingsProps) {
    const searchParams = useSearchParams()
    const timeZone = searchParams.get('tz') || Intl.DateTimeFormat().resolvedOptions().timeZone
    const [countdown, setCountdown] = useState(20)
    const [refreshCount, setRefreshCount] = useState(0)
    const lastRefreshTimeRef = useRef<Date | null>(null)
    const initialEnableRef = useRef(true)
    const hasSetDefaultRef = useRef(false)

    // Enable auto-refresh by default only once when component mounts
    useEffect(() => {
        if (defaultEnabled && !hasSetDefaultRef.current) {
            hasSetDefaultRef.current = true
            onToggle(true)
        }
    }, [defaultEnabled, onToggle])

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (isEnabled) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        return 20
                    }
                    return prev - 1
                })
            }, 1000)
        } else {
            setCountdown(20)
            setRefreshCount(0)
            lastRefreshTimeRef.current = null
            initialEnableRef.current = true
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isEnabled])

    // Update countdown and increment counter when a real refresh occurs
    useEffect(() => {
        if (!isEnabled || !lastRefreshTime) return

        setCountdown(20)

        // Skip the first refresh after enabling
        if (initialEnableRef.current) {
            initialEnableRef.current = false
            lastRefreshTimeRef.current = lastRefreshTime
            return
        }

        // Only increment for new refresh times
        if (lastRefreshTime !== lastRefreshTimeRef.current) {
            setRefreshCount(prev => prev + 1)
            lastRefreshTimeRef.current = lastRefreshTime
        }
    }, [lastRefreshTime, isEnabled])

    const formattedRefreshCount = new Intl.NumberFormat().format(refreshCount)

    return (
        <div className="bg-background/50 rounded-md px-3 py-2 space-y-2">
            <div className="space-y-2">
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
                    <div className="flex items-center space-x-4 text-xs font-medium text-muted-foreground">
                        <span>Auto-refresh</span>
                        {isEnabled && (
                            <span className="font-mono tabular-nums">
                                {countdown}s
                            </span>
                        )}
                    </div>
                </div>

                {isEnabled && (
                    <div className="flex flex-col space-y-1 text-xs text-muted-foreground pl-7">
                        <span className="px-2 py-0.5 bg-muted rounded-full font-mono text-xs w-fit">
                            {formattedRefreshCount}×
                        </span>
                    </div>
                )}
            </div>

            {lastRefreshTime && (
                <div className="text-xs text-muted-foreground border-t border-border/50 pt-2">
                    Last updated @ {format(lastRefreshTime, 'h:mm:ss a zzz', { timeZone })}
                </div>
            )}
        </div>
    )
} 