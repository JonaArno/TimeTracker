
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeEntry, Task, Project, Client } from '@/lib/types'
import { format, parseISO, differenceInSeconds, startOfMonth, endOfMonth, endOfDay } from 'date-fns'
import { Download, Filter } from 'lucide-react'

type EntryWithDetails = TimeEntry & {
    task: Task & {
        project: Project & {
            client: Client
        }
    }
}

export function ReportGenerator() {
    const [entries, setEntries] = useState<EntryWithDetails[]>([])
    const [loading, setLoading] = useState(false)

    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))

    useEffect(() => {
        fetchReport()
    }, []) // Initial load

    async function fetchReport() {
        setLoading(true)
        const start = new Date(startDate).toISOString()
        const end = endOfDay(new Date(endDate)).toISOString()

        const { data, error } = await supabase
            .from('time_entries')
            .select(`
        *,
        task:tasks (
          *,
          project:projects (
            *,
            client:clients (*)
          )
        )
      `)
            .gte('start_time', start)
            .lte('start_time', end)
            .not('end_time', 'is', null)
            .order('start_time', { ascending: false })

        if (data) {
            // @ts-ignore
            setEntries(data)
        }
        setLoading(false)
    }

    const getTotalHours = () => {
        const totalSeconds = entries.reduce((acc, entry) => {
            if (!entry.end_time) return acc;
            return acc + differenceInSeconds(parseISO(entry.end_time), parseISO(entry.start_time))
        }, 0)
        return (totalSeconds / 3600).toFixed(2)
    }

    const exportCSV = () => {
        const headers = ['Client', 'Project', 'Task', 'Start Time', 'End Time', 'Duration (Hours)', 'Notes']
        const rows = entries.map(entry => {
            const duration = entry.end_time
                ? (differenceInSeconds(parseISO(entry.end_time), parseISO(entry.start_time)) / 3600).toFixed(2)
                : '0.00'

            return [
                entry.task?.project?.client?.name || '',
                entry.task?.project?.name || '',
                entry.task?.name || '',
                format(parseISO(entry.start_time), 'yyyy-MM-dd HH:mm'),
                entry.end_time ? format(parseISO(entry.end_time), 'yyyy-MM-dd HH:mm') : '',
                duration,
                `"${entry.notes || ''}"` // Quote notes to handle commas
            ].join(',')
        })

        const csvContent = [headers.join(','), ...rows].join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `time_report_${startDate}_to_${endDate}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-sm border dark:border-zinc-800 space-y-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded mt-1 dark:bg-zinc-800 dark:border-zinc-700"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase">End Date</label>
                        <input
                            type="date"
                            className="w-full border p-2 rounded mt-1 dark:bg-zinc-800 dark:border-zinc-700"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={fetchReport}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                    >
                        <Filter size={20} />
                    </button>
                </div>

                <div className="flex justify-between items-center pt-4 border-t dark:border-zinc-800">
                    <div>
                        <p className="text-sm text-gray-500">Total Time</p>
                        <p className="text-2xl font-bold">{getTotalHours()} <span className="text-sm font-normal">hours</span></p>
                    </div>
                    <button
                        onClick={exportCSV}
                        disabled={entries.length === 0}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                {loading ? (
                    <p className="text-center py-8 text-gray-500">Loading...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No entries found for this period.</p>
                ) : (
                    entries.map(entry => (
                        <div key={entry.id} className="bg-white dark:bg-zinc-900 p-3 rounded border dark:border-zinc-800 text-sm">
                            <div className="flex justify-between font-medium">
                                <span>{entry.task?.project?.client?.name} • {entry.task?.project?.name}</span>
                                <span>{entry.end_time ? (differenceInSeconds(parseISO(entry.end_time), parseISO(entry.start_time)) / 3600).toFixed(2) : '-'}h</span>
                            </div>
                            <div className="flex justify-between text-gray-500 mt-1">
                                <span>{entry.task?.name}</span>
                                <span>{format(parseISO(entry.start_time), 'MMM d, HH:mm')}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
