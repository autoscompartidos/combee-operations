"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchTasks,
  fetchTask,
  createTask,
  updateTask,
  deleteTask,
  type FetchTasksParams,
} from "./tasks.repository"
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/types/ops"

export const taskKeys = {
  all: ["tasks"] as const,
  list: (params?: FetchTasksParams) => ["tasks", "list", params] as const,
  detail: (id: string) => ["tasks", id] as const,
}

export function useTasks(params?: FetchTasksParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
  })
}

export function useTask(id: string | null | undefined) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => fetchTask(id!),
    enabled: Boolean(id),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
