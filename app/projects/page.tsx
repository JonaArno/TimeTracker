
import { ProjectManager } from '@/components/ProjectManager'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function ProjectsPage() {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            <header className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-gray-500"><ChevronLeft /></Link>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Manage Projects</h1>
                </div>
                <ThemeToggle />
            </header>

            <main className="p-4">
                <ProjectManager />
            </main>

            <BottomNav />
        </div>
    )
}
