
"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TimeEntry, Task, Project } from '@/lib/types'
import { format, parseISO } from 'date-fns'
import { X, Trash2, Save } from 'lucide-react'

type EditEntryModalProps = {
    entry: TimeEntry & { task: Task & { project: Project } }
    onClose: () => void
    onUpdate: () => void
}

export function EditEntryModal({ entry, onClose, onUpdate }: EditEntryModalProps) {
    const [startTime, setStartTime] = useState(format(parseISO(entry.start_time), "yyyy-MM-dd'T'HH:mm"))
    const [endTime, setEndTime] = useState(entry.end_time ? format(parseISO(entry.end_time), "yyyy-MM-dd'T'HH:mm") : '')
    const [notes, setNotes] = useState(entry.notes || '')
    const [loading, setLoading] = useState(false)

    async function handleSave() {
        setLoading(true)
        const { error } = await supabase
            .from('time_entries')
            .update({
                start_time: new Date(startTime).toISOString(),
                end_time: endTime ? new Date(endTime).toISOString() : null,
                notes: notes
            })
            .eq('id', entry.id)

        setLoading(false)
        if (!error) {
            onUpdate()
            onClose()
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this entry?')) return

        setLoading(true)
        const { error } = await supabase
            .from('time_entries')
            .delete()
            .eq('id', entry.id)

        setLoading(false)
        if (!error) {
            onUpdate()
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
                <div className="p-4 border-b dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Edit Entry</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{entry.task?.project?.name}</p>
                        <p className="font-semibold">{entry.task?.name}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
                            value={startTime}
                            onChange={e => setStartTime(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
                            value={endTime}
                            onChange={e => setEndTime(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes</label>
                        <textarea
                            className="w-full border p-2 rounded dark:bg-zinc-800 dark:border-zinc-700"
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Add notes..."
                        />
                    </div>
                </div>

                <div className="p-4 border-t dark:border-zinc-800 flex justify-between gap-3 bg-gray-50 dark:bg-zinc-800">
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-red-600 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <Trash2 size={20} />
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Save size={18} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
