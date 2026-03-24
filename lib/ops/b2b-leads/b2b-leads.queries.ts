"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchB2BLeads,
  fetchB2BLead,
  createB2BLead,
  updateB2BLead,
  deleteB2BLead,
  type FetchB2BLeadsParams,
} from "./b2b-leads.repository"
import type { CreateB2BLeadInput, UpdateB2BLeadInput } from "@/lib/types/ops"

export const b2bLeadKeys = {
  all: ["b2b-leads"] as const,
  list: (params?: FetchB2BLeadsParams) => ["b2b-leads", "list", params] as const,
  detail: (id: string) => ["b2b-leads", id] as const,
}

export function useB2BLeads(params?: FetchB2BLeadsParams) {
  return useQuery({
    queryKey: b2bLeadKeys.list(params),
    queryFn: () => fetchB2BLeads(params),
  })
}

export function useB2BLead(id: string) {
  return useQuery({
    queryKey: b2bLeadKeys.detail(id),
    queryFn: () => fetchB2BLead(id),
    enabled: Boolean(id),
  })
}

export function useCreateB2BLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateB2BLeadInput) => createB2BLead(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: b2bLeadKeys.all }),
  })
}

export function useUpdateB2BLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateB2BLeadInput }) =>
      updateB2BLead(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: b2bLeadKeys.all })
      qc.invalidateQueries({ queryKey: b2bLeadKeys.detail(id) })
    },
  })
}

export function useDeleteB2BLead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteB2BLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: b2bLeadKeys.all }),
  })
}
