
"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Client, Project } from '@/lib/types'
import { Plus, Folder, Briefcase, Trash2 } from 'lucide-react'

export function ProjectManager() {
    const [clients, setClients] = useState<Client[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)

    // Form states
    const [newClientName, setNewClientName] = useState('')
    const [newProjectName, setNewProjectName] = useState('')
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data: clientsData } = await supabase.from('clients').select('*').order('name')
        const { data: projectsData } = await supabase.from('projects').select('*').order('name')

        if (clientsData) setClients(clientsData)
        if (projectsData) setProjects(projectsData)
        setLoading(false)
    }

    async function addClient() {
        if (!newClientName.trim()) return
        const { data, error } = await supabase.from('clients').insert([{ name: newClientName }]).select()
        if (data) {
            setClients([...clients, data[0]])
            setNewClientName('')
        }
    }

    async function addProject(clientId: string) {
        if (!newProjectName.trim()) return
        const { data, error } = await supabase.from('projects').insert([{
            client_id: clientId,
            name: newProjectName
        }]).select()

        if (data) {
            setProjects([...projects, data[0]])
            setNewProjectName('')
            setSelectedClientId(null)
        }
    }

    async function deleteClient(id: string) {
        await supabase.from('clients').delete().eq('id', id)
        setClients(clients.filter(c => c.id !== id))
        setProjects(projects.filter(p => p.client_id !== id))
    }

    async function deleteProject(id: string) {
        await supabase.from('projects').delete().eq('id', id)
        setProjects(projects.filter(p => p.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New Client Name"
                    className="border p-2 rounded flex-1 dark:bg-zinc-800 dark:border-zinc-700"
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                />
                <button
                    onClick={addClient}
                    className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center gap-1"
                >
                    <Plus size={16} /> Client
                </button>
            </div>

            <div className="space-y-4">
                {clients.map(client => (
                    <div key={client.id} className="border rounded-lg p-4 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold flex items-center gap-2">
                                <Briefcase size={18} className="text-gray-500" />
                                {client.name}
                            </h3>
                            <button onClick={() => deleteClient(client.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="pl-6 space-y-2">
                            {projects.filter(p => p.client_id === client.id).map(project => (
                                <div key={project.id} className="flex justify-between items-center bg-gray-50 dark:bg-zinc-800 p-2 rounded">
                                    <span className="flex items-center gap-2">
                                        <Folder size={16} className="text-blue-500" />
                                        {project.name}
                                    </span>
                                    <button onClick={() => deleteProject(project.id)} className="text-red-400 hover:text-red-600">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}

                            {selectedClientId === client.id ? (
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        placeholder="Project Name"
                                        className="border p-1 rounded flex-1 text-sm dark:bg-zinc-700 dark:border-zinc-600"
                                        value={newProjectName}
                                        onChange={e => setNewProjectName(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => addProject(client.id)} className="bg-green-600 text-white px-2 rounded text-sm">Add</button>
                                    <button onClick={() => setSelectedClientId(null)} className="text-gray-500 px-2 text-sm">Cancel</button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedClientId(client.id)}
                                    className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 mt-2"
                                >
                                    <Plus size={14} /> Add Project
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {clients.length === 0 && !loading && (
                    <p className="text-center text-gray-500 mt-8">No clients found. Add one to get started.</p>
                )}
            </div>
        </div>
    )
}
