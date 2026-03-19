import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/types/ops"

const BASE = "/api/ops/tasks"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type FetchTasksParams = {
  ownerId?: string
  status?: string
  dueDateFrom?: string
  dueDateTo?: string
}

export async function fetchTasks(params?: FetchTasksParams): Promise<Task[]> {
  const qs = new URLSearchParams()
  if (params?.ownerId) qs.set("ownerId", params.ownerId)
  if (params?.status) qs.set("status", params.status)
  if (params?.dueDateFrom) qs.set("dueDateFrom", params.dueDateFrom)
  if (params?.dueDateTo) qs.set("dueDateTo", params.dueDateTo)
  const url = qs.size ? `${BASE}?${qs}` : BASE
  return handleResponse<Task[]>(await fetch(url))
}

export async function fetchTask(id: string): Promise<Task> {
  return handleResponse<Task>(await fetch(`${BASE}/${id}`))
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return handleResponse<Task>(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return handleResponse<Task>(
    await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteTask(id: string): Promise<void> {
  return handleResponse<void>(await fetch(`${BASE}/${id}`, { method: "DELETE" }))
}
