
import { TaskManager } from '@/components/TaskManager'
import { TodaysEntries } from '@/components/TodaysEntries'
import { BottomNav } from '@/components/BottomNav'

export default function Home() {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
      <header className="bg-white dark:bg-zinc-900 p-4 shadow-sm border-b dark:border-zinc-800">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Time Tracker</h1>
      </header>

      <main className="p-4 space-y-8">
        <section>
          <TaskManager />
        </section>

        <section>
          <TodaysEntries />
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
