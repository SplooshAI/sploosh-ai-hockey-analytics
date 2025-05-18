'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './sidebar/sidebar'
import { Menu } from 'lucide-react'

interface DemoLayoutProps {
  children: ReactNode
  onGameSelect?: (gameId: number) => void
  title?: string
}

export function DemoLayout({ children, onGameSelect, title }: DemoLayoutProps) {
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

      {/* Main content - full width with minimal padding */}
      <main className="flex-1 overflow-auto relative bg-background" id="demo-content">
        {title && (
          <div className="py-4 px-6 pl-16 lg:pl-6 bg-background/80 backdrop-blur-sm border-b flex items-center">
            <h1 className="text-2xl font-semibold truncate">{title}</h1>
          </div>
        )}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
