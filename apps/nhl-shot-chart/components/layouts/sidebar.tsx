'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, X } from 'lucide-react'
// import { DatePicker } from '../ui/date-picker'
import { GamesList } from '../games/games-list'

interface SidebarProps {
    onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
    const [date, setDate] = useState<Date>(new Date())

    return (
        <div className="w-64 h-screen bg-secondary flex flex-col">
            {/* Fixed header section */}
            <div className="h-20 lg:h-auto p-4 border-b border-border/50 flex items-center">
                {/* Close button for mobile */}
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-background/10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Simple centered title */}
                <h2 className="text-lg font-semibold w-full text-center lg:text-left">NHL Games</h2>

                <div className="hidden lg:flex items-center space-x-2 mt-4">
                    {/* <DatePicker
                        date={date}
                        onDateChange={setDate}
                    /> */}
                </div>
            </div>

            {/* Scrollable content section */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                    <h3 className="text-sm font-medium">Today's Games</h3>
                    <GamesList date={date} />
                </div>
            </div>
        </div>
    )
} 