
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Project, Task, TimeEntry } from '@/lib/types'
import { Play, Square, Plus, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'

export function TaskManager() {
    const [projects, setProjects] = useState<Project[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)

    // Task Creation
    const [newTaskName, setNewTaskName] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')

    // Timer Local State
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        fetchData()
        // Subscribe to realtime changes could go here
    }, [])

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (activeEntry) {
            interval = setInterval(() => {
                const start = new Date(activeEntry.start_time).getTime()
                const now = new Date().getTime()
                setElapsed(Math.floor((now - start) / 1000))
            }, 1000)
        } else {
            setElapsed(0)
        }
        return () => clearInterval(interval)
    }, [activeEntry])

    async function fetchData() {
        const { data: projectsData } = await supabase.from('projects').select('*').eq('is_active', true)
        const { data: tasksData } = await supabase.from('tasks').select('*')
        // Fetch active timer
        const { data: entriesData } = await supabase.from('time_entries')
            .select('*')
            .is('end_time', null)
            .limit(1)

        if (projectsData) {
            setProjects(projectsData)
            if (projectsData.length > 0) setSelectedProjectId(projectsData[0].id)
        }
        if (tasksData) setTasks(tasksData)
        if (entriesData && entriesData.length > 0) setActiveEntry(entriesData[0])
    }

    async function addTask() {
        if (!newTaskName.trim() || !selectedProjectId) return
        const { data } = await supabase.from('tasks').insert([{
            project_id: selectedProjectId,
            name: newTaskName
        }]).select()

        if (data) {
            setTasks([...tasks, data[0]])
            setNewTaskName('')
        }
    }

    async function startTimer(taskId: string) {
        // Stop current if any
        if (activeEntry) {
            await stopTimer()
        }

        const { data } = await supabase.from('time_entries').insert([{
            task_id: taskId,
            start_time: new Date().toISOString()
        }]).select()

        if (data) setActiveEntry(data[0])
    }

    async function stopTimer() {
        if (!activeEntry) return

        await supabase.from('time_entries').update({
            end_time: new Date().toISOString()
        }).eq('id', activeEntry.id)

        setActiveEntry(null)
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6">
            {/* Active Timer Banner */}
            {activeEntry && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded shadow-sm sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-300 font-bold uppercase tracking-wider">Running</p>
                            <h2 className="text-2xl font-mono font-bold">{formatTime(elapsed)}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {tasks.find(t => t.id === activeEntry.task_id)?.name}
                            </p>
                        </div>
                        <button
                            onClick={stopTimer}
                            className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 shadow-lg"
                        >
                            <Square fill="currentColor" size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add Task */}
            <div className="flex flex-col gap-2 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900">
                <h3 className="font-semibold text-sm text-gray-500">New Task</h3>
                <div className="flex gap-2">
                    <select
                        className="border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                    >
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="What are you working on?"
                        className="flex-1 border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                    />
                    <button onClick={addTask} disabled={!selectedProjectId} className="bg-zinc-800 dark:bg-zinc-700 text-white p-2 rounded">
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="space-y-2">
                <h3 className="font-semibold text-lg">Quick Start</h3>
                {tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border rounded hover:shadow-sm transition-shadow">
                        <div>
                            <p className="font-medium">{task.name}</p>
                            <p className="text-xs text-gray-500">
                                {projects.find(p => p.id === task.project_id)?.name}
                            </p>
                        </div>
                        {activeEntry?.task_id === task.id ? (
                            <button onClick={stopTimer} className="text-red-500 hover:text-red-700">
                                <Square fill="currentColor" size={20} />
                            </button>
                        ) : (
                            <button onClick={() => startTimer(task.id)} className="text-green-500 hover:text-green-700">
                                <Play fill="currentColor" size={24} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
