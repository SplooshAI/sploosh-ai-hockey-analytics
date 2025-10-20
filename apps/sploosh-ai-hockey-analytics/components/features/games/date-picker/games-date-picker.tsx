'use client'

import { ChevronLeft, ChevronRight, CalendarIcon, Loader2 } from 'lucide-react'
import { addDays, format, isToday, subDays, startOfDay } from 'date-fns'
import { formatDateWithOrdinal } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface GamesDatePickerProps {
    date: Date
    onDateChange: (date: Date) => void
    isLoading?: boolean
}

export function GamesDatePicker({ date, onDateChange, isLoading = false }: GamesDatePickerProps) {
    const [mounted, setMounted] = useState(false)
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
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

    const handleCalendarSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            onDateChange(startOfDay(selectedDate))
            setIsCalendarOpen(false)
        }
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
            <div className="flex items-center justify-between gap-1">
                <button
                    onClick={handlePreviousDay}
                    className="p-2 rounded-md hover:bg-background/10"
                    aria-label="Previous day"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 p-0"
                            aria-label="Open calendar"
                        >
                            <CalendarIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleCalendarSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

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
                <div className="flex items-center justify-center gap-2">
                    <div className={`text-sm font-medium transition-opacity ${isNavigating || isLoading ? 'opacity-50' : ''
                        }`}>
                        {dayName}
                    </div>
                    {isLoading && (
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                    )}
                </div>
                <div className={`text-sm text-muted-foreground transition-opacity ${isNavigating || isLoading ? 'opacity-50' : ''
                    }`}>
                    {formattedDate}
                </div>
            </div>
        </div>
    )
} 