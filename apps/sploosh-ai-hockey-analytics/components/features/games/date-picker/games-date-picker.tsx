'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, format, isToday, subDays } from 'date-fns'
import { formatDateWithOrdinal } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

interface GamesDatePickerProps {
    date: Date
    onDateChange: (date: Date) => void
}

export function GamesDatePicker({ date, onDateChange }: GamesDatePickerProps) {
    const [mounted, setMounted] = useState(false)
    const debouncedDate = useDebounce(date, 300)
    const isNavigating = format(date, 'yyyy-MM-dd') !== format(debouncedDate, 'yyyy-MM-dd')

    useEffect(() => {
        setMounted(true)
    }, [])

    const handlePreviousDay = () => {
        onDateChange(subDays(date, 1))
    }

    const handleNextDay = () => {
        onDateChange(addDays(date, 1))
    }

    const handleTodayClick = () => {
        onDateChange(new Date())
    }

    if (!mounted) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="p-2 rounded-md w-8 h-8" />
                    <div className="text-xs px-2 py-1 rounded-md">Today</div>
                    <div className="p-2 rounded-md w-8 h-8" />
                </div>
                <div className="text-center">
                    <div className="text-sm font-medium h-5" />
                    <div className="text-sm text-muted-foreground h-5" />
                </div>
            </div>
        )
    }

    const dayName = format(date, 'EEEE')
    const formattedDate = formatDateWithOrdinal(date)

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <button
                    onClick={handlePreviousDay}
                    className="p-2 rounded-md hover:bg-background/10"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                    onClick={handleTodayClick}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${isToday(date)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-background/10'
                        }`}
                >
                    Today
                </button>

                <button
                    onClick={handleNextDay}
                    className="p-2 rounded-md hover:bg-background/10"
                    aria-label="Next day"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="text-center">
                <div className={`text-sm font-medium transition-opacity ${isNavigating ? 'opacity-50' : ''
                    }`}>
                    {dayName}
                </div>
                <div className={`text-sm text-muted-foreground transition-opacity ${isNavigating ? 'opacity-50' : ''
                    }`}>
                    {formattedDate}
                </div>
            </div>
        </div>
    )
} 