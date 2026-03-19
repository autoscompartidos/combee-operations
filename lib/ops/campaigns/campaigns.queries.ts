"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchCampaigns,
  fetchCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "./campaigns.repository"
import type { CreateCampaignInput, UpdateCampaignInput } from "@/lib/types/ops"

export const campaignKeys = {
  all: ["campaigns"] as const,
  detail: (id: string) => ["campaigns", id] as const,
}

export function useCampaigns() {
  return useQuery({ queryKey: campaignKeys.all, queryFn: fetchCampaigns })
}

export function useCampaign(id: string) {
  return useQuery({ queryKey: campaignKeys.detail(id), queryFn: () => fetchCampaign(id) })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCampaignInput) => createCampaign(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCampaignInput }) =>
      updateCampaign(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: campaignKeys.all })
      qc.invalidateQueries({ queryKey: campaignKeys.detail(id) })
    },
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  })
}
