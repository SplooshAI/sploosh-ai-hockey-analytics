'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { GamesList } from '../games/games-list'
import { Version } from '../version/version'

interface SidebarProps {
    onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
    const [date] = useState<Date>(new Date())

    return (
        <div className="w-64 h-[100dvh] flex flex-col bg-secondary">
            <div className="flex-none h-20 lg:h-auto p-4 border-b border-border/50">
                <div className="relative flex items-center justify-center h-full">
                    <button
                        onClick={onClose}
                        className="lg:hidden absolute left-0 p-1 rounded-md hover:bg-background/10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <h2 className="text-lg font-semibold">NHL Games</h2>
                </div>

                <div className="hidden lg:flex items-center space-x-2 mt-4">
                    {/* DatePicker commented out for now */}
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pb-safe">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center">
                            <h3 className="text-sm font-medium">Today&apos;s Games</h3>
                        </div>
                        <GamesList date={date} />
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50">
                        <Version />
                    </div>
                </div>
            </div>
        </div>
    )
} 