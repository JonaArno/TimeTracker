
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { startOfMonth, endOfMonth, parseISO, differenceInSeconds } from 'date-fns'

type ProjectSummary = {
    name: string
    clientName: string
    seconds: number
    color: string
}

export function MonthlyVisuals() {
    const [data, setData] = useState<ProjectSummary[]>([])
    const [loading, setLoading] = useState(false)

    // Use current month for simple demo, could make selectable
    const today = new Date()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const start = startOfMonth(today).toISOString()
        const end = endOfMonth(today).toISOString()

        const { data: entries, error } = await supabase
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

        if (entries) {
            const summary: Record<string, ProjectSummary> = {}

            entries.forEach(entry => {
                // @ts-ignore
                const projectName = entry.task?.project?.name || 'Unknown'
                // @ts-ignore
                const clientName = entry.task?.project?.client?.name || 'Unknown'
                // @ts-ignore
                const key = `${clientName} - ${projectName}`

                if (!summary[key]) {
                    summary[key] = {
                        name: projectName,
                        clientName: clientName,
                        seconds: 0,
                        color: generateColor(projectName)
                    }
                }

                if (entry.end_time) {
                    summary[key].seconds += differenceInSeconds(parseISO(entry.end_time), parseISO(entry.start_time))
                }
            })

            setData(Object.values(summary).sort((a, b) => b.seconds - a.seconds))
        }
        setLoading(false)
    }

    // Simple copy hash color generator
    const generateColor = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + "00000".substring(0, 6 - c.length) + c;
    }

    const maxSeconds = Math.max(...data.map(d => d.seconds), 1)

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Monthly Overview</h2>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ) : data.length === 0 ? (
                <p className="text-gray-500 italic">No data found for this month.</p>
            ) : (
                <div className="space-y-6">
                    {data.map(item => (
                        <div key={`${item.clientName}-${item.name}`}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {item.clientName} • {item.name}
                                </span>
                                <span className="font-bold">
                                    {(item.seconds / 3600).toFixed(1)}h
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-3 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${(item.seconds / maxSeconds) * 100}%`,
                                        backgroundColor: item.color
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
