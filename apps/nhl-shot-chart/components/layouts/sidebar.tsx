'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
// import { DatePicker } from '../ui/date-picker'
import { GamesList } from '../games/games-list'

export default function Sidebar() {
    const [date, setDate] = useState<Date>(new Date())

    return (
        <div className="w-64 h-screen bg-secondary p-4">
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