import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, isToday, addDays, subDays } from 'date-fns'
import { formatDateWithOrdinal } from '@/lib/utils'

interface GamesDatePickerProps {
    date: Date
    onDateChange: (date: Date) => void
}

export function GamesDatePicker({ date, onDateChange }: GamesDatePickerProps) {
    const handlePreviousDay = () => {
        onDateChange(subDays(date, 1))
    }

    const handleNextDay = () => {
        onDateChange(addDays(date, 1))
    }

    const handleTodayClick = () => {
        onDateChange(new Date())
    }

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
                <div className="text-sm font-medium">
                    {format(date, 'EEEE')}
                </div>
                <div className="text-sm text-muted-foreground">
                    {formatDateWithOrdinal(date)}
                </div>
            </div>
        </div>
    )
} 