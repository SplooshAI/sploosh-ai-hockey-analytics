'use client'

import { ReactNode } from 'react'
import Sidebar from './sidebar/sidebar'

interface DemoLayoutProps {
  children: ReactNode
  onGameSelect?: (gameId: number) => void
  title?: string
}

export function DemoLayout({ children, onGameSelect, title }: DemoLayoutProps) {
  return (
    <div className="flex h-[100dvh] relative">
      {/* Sidebar - hidden by default but can be toggled via game selection */}
      <div className="hidden lg:block lg:relative lg:w-64">
        <Sidebar onGameSelect={onGameSelect} />
      </div>

      {/* Main content - full width with minimal padding */}
      <main className="flex-1 overflow-auto relative bg-background">
        {title && (
          <div className="py-4 px-6 bg-background/80 backdrop-blur-sm border-b">
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
