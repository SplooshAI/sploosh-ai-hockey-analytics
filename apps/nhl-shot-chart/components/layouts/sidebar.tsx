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
        <div className="w-64 h-screen bg-secondary p-4 relative">
            {/* Close button for mobile */}
            <button
                onClick={onClose}
                className="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-background/10"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">NHL Games</h2>

                <div className="flex items-center space-x-2">
                    {/* <DatePicker
                        date={date}
                        onDateChange={setDate}
                    /> */}
                </div>

                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Today's Games</h3>
                    <GamesList date={date} />
                </div>
            </div>
        </div>
    )
} 