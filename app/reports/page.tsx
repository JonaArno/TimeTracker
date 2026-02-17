
import { ReportGenerator } from '@/components/ReportGenerator'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BottomNav } from '@/components/BottomNav'

export default function ReportsPage() {
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">

            <header className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/" className="text-gray-500"><ChevronLeft /></Link>
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white">Reports</h1>
                </div>
                <Link href="/reports/visuals" className="text-blue-600 font-medium text-sm">
                    Visuals
                </Link>
            </header>

            <main className="p-4">
                <ReportGenerator />
            </main>

            <BottomNav />
        </div>
    )
}
