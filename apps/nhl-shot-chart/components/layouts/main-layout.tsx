import { ReactNode } from 'react'
import Sidebar from './sidebar'

interface MainLayoutProps {
    children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-4">
                {children}
            </main>
        </div>
    )
} 