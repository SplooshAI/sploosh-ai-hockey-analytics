'use client'

import { ReactNode, useState } from 'react'
import Sidebar from './sidebar'
import { Menu } from 'lucide-react'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="flex h-screen relative">
            {/* Mobile menu button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border"
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Sidebar */}
            <div className={`
                fixed inset-0 lg:relative
                transform transition-transform duration-200 ease-in-out
                lg:transform-none lg:opacity-100
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                z-40
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-auto p-4 lg:p-6">
                {/* Add padding for mobile menu button */}
                <div className="pt-12 lg:pt-0">
                    {children}
                </div>
            </main>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    )
} 