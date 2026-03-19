"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchOwners,
  fetchOwner,
  createOwner,
  updateOwner,
  deleteOwner,
} from "./owners.repository"
import type { CreateOwnerInput, UpdateOwnerInput } from "@/lib/types/ops"

export const ownerKeys = {
  all: ["owners"] as const,
  detail: (id: string) => ["owners", id] as const,
}

export function useOwners() {
  return useQuery({ queryKey: ownerKeys.all, queryFn: fetchOwners })
}

export function useOwner(id: string) {
  return useQuery({ queryKey: ownerKeys.detail(id), queryFn: () => fetchOwner(id) })
}

export function useCreateOwner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOwnerInput) => createOwner(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ownerKeys.all }),
  })
}

export function useUpdateOwner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOwnerInput }) => updateOwner(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ownerKeys.all })
      qc.invalidateQueries({ queryKey: ownerKeys.detail(id) })
    },
  })
}

export function useDeleteOwner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteOwner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ownerKeys.all }),
  })
}
