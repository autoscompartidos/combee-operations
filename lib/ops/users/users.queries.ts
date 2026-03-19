"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
  type UpdateUserProfileInput,
} from "./users.repository"
import type { UserProfile } from "@/lib/types/users"

export const userKeys = {
  me: ["users", "me"] as const,
}

export function useCurrentUserProfile() {
  return useQuery<UserProfile>({
    queryKey: userKeys.me,
    queryFn: fetchCurrentUserProfile,
  })
}

export function useUpdateCurrentUserProfileMutation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateUserProfileInput) => updateCurrentUserProfile(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me })
    },
  })
}

