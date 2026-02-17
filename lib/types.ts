
export type Client = {
    id: string
    name: string
    created_at: string
}

export type Project = {
    id: string
    client_id: string
    name: string
    is_active: boolean
    created_at: string
}

export type Task = {
    id: string
    project_id: string
    name: string
    created_at: string
}

export type TimeEntry = {
    id: string
    task_id: string
    start_time: string
    end_time: string | null
    notes: string | null
    created_at: string
}
