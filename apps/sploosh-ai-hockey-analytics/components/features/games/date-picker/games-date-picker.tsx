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
    const currentYear = new Date().getFullYear()
    // First NHL game was played on December 19, 1917
    const firstNHLGame = new Date(1917, 11, 19) // Month is 0-indexed, so 11 = December

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
        setIsCalendarOpen(false)
    }

    const handleFirstGameClick = () => {
        // December 19, 1917 - First NHL game ever played
        onDateChange(new Date(1917, 11, 19))
        setIsCalendarOpen(false)
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
            <div className="flex items-center justify-center gap-2">
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
                    <PopoverContent className="w-fit p-0" align="center">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={handleCalendarSelect}
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1917}
                            toYear={currentYear + 2}
                            disabled={{ before: firstNHLGame }}
                            defaultMonth={date}
                        />
                        <div className="border-t border-border p-3 space-y-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleTodayClick}
                                className="w-full"
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleFirstGameClick}
                                className="w-full text-xs"
                            >
                                🏒 Start of the NHL
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

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