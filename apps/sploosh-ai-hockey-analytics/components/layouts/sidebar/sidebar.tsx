'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { GamesList } from '@/components/features/games/list/games-list'
import { Version } from '../../shared/version/version'
import { GamesDatePicker } from '@/components/features/games/date-picker/games-date-picker'

interface SidebarProps {
    onClose?: () => void
    onGameSelect?: (gameId: number) => void
}

export default function Sidebar({ onClose, onGameSelect }: SidebarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    return (
        <div className="w-64 h-[100dvh] flex flex-col bg-secondary">
            <div className="flex-none p-4 border-b border-border/50">
                <div className="relative flex items-center justify-center mb-4">
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute left-0 p-1 rounded-md hover:bg-background/10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <h2 className="text-lg font-semibold">NHL Games</h2>
                </div>

                <div className="relative z-10">
                    <GamesDatePicker
                        date={selectedDate}
                        onDateChange={setSelectedDate}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pb-safe">
                <div className="p-4">
                    <GamesList
                        date={selectedDate}
                        onGameSelect={onGameSelect}
                        onClose={onClose}
                    />
                    <div className="pt-4 mt-4 border-t border-border/50">
                        <Version />
                    </div>
                </div>
            </div>
        </div>
    )
} 