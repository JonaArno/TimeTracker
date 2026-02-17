"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeEntry, Task, Project } from '@/lib/types'
import { format, parseISO, differenceInSeconds, addDays, subDays, startOfDay, endOfDay } from 'date-fns'

import { EditEntryModal } from '@/components/EditEntryModal'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Pencil } from 'lucide-react'

export function TodaysEntries() {
    const [entries, setEntries] = useState<(TimeEntry & { task: Task & { project: Project } })[]>([])
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [editingEntry, setEditingEntry] = useState<(TimeEntry & { task: Task & { project: Project } }) | null>(null)

    useEffect(() => {
        fetchEntries()
    }, [selectedDate])

    async function fetchEntries() {
        const start = startOfDay(selectedDate).toISOString()
        const end = endOfDay(selectedDate).toISOString()

        // Supabase join query to get nested data
        const { data, error } = await supabase
            .from('time_entries')
            .select('*, task:tasks(*, project:projects(*))')
            .gte('start_time', start)
            .lte('start_time', end)
            .not('end_time', 'is', null) // Only show completed entries here
            .order('start_time', { ascending: false })

        if (data) {
            // @ts-ignore
            setEntries(data)
        }
    }

    const formatDuration = (start: string, end: string) => {
        const diff = differenceInSeconds(parseISO(end), parseISO(start))
        const h = Math.floor(diff / 3600)
        const m = Math.floor((diff % 3600) / 60)
        return `${h}h ${m}m`
    }

    const getTotalDuration = () => {
        const totalSeconds = entries.reduce((acc, entry) => {
            if (!entry.end_time) return acc;
            return acc + differenceInSeconds(parseISO(entry.end_time), parseISO(entry.start_time))
        }, 0)
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        return `${h}h ${m}m`
    }

    const navigateDate = (direction: 'prev' | 'next') => {
        setSelectedDate(current => direction === 'prev' ? subDays(current, 1) : addDays(current, 1))
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-3 rounded-lg border dark:border-zinc-800 shadow-sm">
                <button onClick={() => navigateDate('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                    <ChevronLeft size={20} />
                </button>

                <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                        <CalendarIcon size={16} className="text-gray-500" />
                        {format(selectedDate, 'EEEE, MMM d')}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">
                        Total: <span className="text-blue-600 dark:text-blue-400 font-bold">{getTotalDuration()}</span>
                    </p>
                </div>

                <button
                    onClick={() => navigateDate('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className="space-y-2">
                {entries.length === 0 && (
                    <p className="text-gray-500 italic text-sm text-center py-4">No completed entries for this day.</p>
                )}
                {entries.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center p-3 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded shadow-sm group">
                        <div className="flex-1">
                            <p className="font-medium text-sm">{entry.task?.name}</p>
                            <p className="text-xs text-gray-500">{entry.task?.project?.name}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                            <div>
                                <p className="font-mono font-bold text-sm text-gray-800 dark:text-gray-200">
                                    {entry.end_time && formatDuration(entry.start_time, entry.end_time)}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {format(parseISO(entry.start_time), 'HH:mm')} - {entry.end_time && format(parseISO(entry.end_time), 'HH:mm')}
                                </p>
                            </div>
                            <button
                                onClick={() => setEditingEntry(entry)}
                                className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingEntry && (
                <EditEntryModal
                    entry={editingEntry}
                    onClose={() => setEditingEntry(null)}
                    onUpdate={fetchEntries}
                />
            )}
        </div>
    )
}
