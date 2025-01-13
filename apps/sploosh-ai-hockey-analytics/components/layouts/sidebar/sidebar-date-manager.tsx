'use client'

import { useState, useEffect } from 'react'
import { startOfDay } from 'date-fns'
import { GamesDatePicker } from '@/components/features/games/date-picker/games-date-picker'
import { GamesList } from '@/components/features/games/list/games-list'

interface SidebarDateManagerProps {
    onClose?: () => void
    onGameSelect?: (gameId: number) => void
}

export function SidebarDateManager({ onClose, onGameSelect }: SidebarDateManagerProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    useEffect(() => {
        // Set initial date only on client side
        setSelectedDate(startOfDay(new Date()))
    }, [])

    if (!selectedDate) {
        return null // or a loading state
    }

    return (
        <>
            <GamesDatePicker
                date={selectedDate}
                onDateChange={setSelectedDate}
            />
            <div className="flex-1 min-h-0 overflow-y-auto pb-safe">
                <div className="p-4">
                    <GamesList
                        date={selectedDate}
                        onGameSelect={onGameSelect}
                        onClose={onClose}
                    />
                </div>
            </div>
        </>
    )
} 