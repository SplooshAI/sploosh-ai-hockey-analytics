'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './sidebar/sidebar'
import { Menu, ArrowUp } from 'lucide-react'
import { SITE } from "@/lib/constants"

interface MainLayoutProps {
    children: ReactNode
    onGameSelect?: (gameId: number) => void
}

export function MainLayout({ children, onGameSelect }: MainLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [hasMounted, setHasMounted] = useState(false)

    // Add handler to close sidebar
    const handleOverlayClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsSidebarOpen(false)
    }

    // Auto-open sidebar on mobile devices on first load
    useEffect(() => {
        if (!hasMounted) {
            const isMobile = window.innerWidth < 1024 // 1024px matches our lg breakpoint
            setIsSidebarOpen(isMobile)
            setHasMounted(true)
        }
    }, [hasMounted])

    return (
        <div className="flex h-[100dvh] relative">
            {/* Mobile menu button - aligned with header height */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed left-4 z-50 p-2 rounded-md bg-background border h-10 my-3"
                style={{ top: '0' }}
            >
                <Menu className="h-6 w-6" />
            </button>

            {/* Overlay - placed before sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={handleOverlayClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-0 lg:relative
                transform transition-transform duration-200 ease-in-out
                lg:transform-none lg:opacity-100
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                z-40 w-64
            `}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} onGameSelect={onGameSelect} />
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-auto relative" id="main-content">
                <div className="p-4 lg:p-6">
                    {children}
                </div>

                {/* Scroll to top button - now targets main content */}
                <button
                    onClick={() => {
                        document.getElementById('main-content')?.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }}
                    className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg flex items-center justify-center z-50"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </button>
            </main>
        </div>
    )
} 