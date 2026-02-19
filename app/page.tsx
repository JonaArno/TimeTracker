
"use client"

import { useState } from 'react'
import { TaskManager } from '@/components/TaskManager'
import { TodaysEntries } from '@/components/TodaysEntries'
import { BottomNav } from '@/components/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleEntryChange = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <header className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Time Tracker</h1>
        <ThemeToggle />
      </header>

      <main className="p-4 space-y-8">
        <section>
          <TaskManager onEntryChange={handleEntryChange} />
        </section>

        <section>
          <TodaysEntries refreshTrigger={refreshKey} />
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
