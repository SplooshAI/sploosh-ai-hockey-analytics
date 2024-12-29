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
        <div className="w-64 h-screen bg-secondary flex flex-col">
            <div className="h-20 lg:h-auto p-4 border-b border-border/50 flex items-center">
                <button
                    onClick={onClose}
                    className="lg:hidden absolute top-4 right-4 p-1 rounded-md hover:bg-background/10"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-lg font-semibold w-full text-center lg:text-left">NHL Games</h2>

                <div className="hidden lg:flex items-center space-x-2 mt-4">
                    {/* DatePicker commented out for now */}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium">Today&apos;s Games</h3>
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