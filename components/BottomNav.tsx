
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Folder, PieChart } from 'lucide-react'
import clsx from 'clsx'

export function BottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true
        if (path !== '/' && pathname.startsWith(path)) return true
        return false
    }

    return (
        <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 border-t dark:border-zinc-800 flex justify-around py-3 text-xs z-50">
            <Link
                href="/"
                className={clsx(
                    "flex flex-col items-center gap-1",
                    isActive('/') ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
            >
                <LayoutDashboard size={24} />
                <span>Track</span>
            </Link>

            <Link
                href="/projects"
                className={clsx(
                    "flex flex-col items-center gap-1",
                    isActive('/projects') ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
            >
                <Folder size={24} />
                <span>Projects</span>
            </Link>

            <Link
                href="/reports"
                className={clsx(
                    "flex flex-col items-center gap-1",
                    isActive('/reports') ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                )}
            >
                <PieChart size={24} />
                <span>Reports</span>
            </Link>
        </nav>
    )
}
