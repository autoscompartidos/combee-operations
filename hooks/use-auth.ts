"use client"

import { useQueryClient } from "@tanstack/react-query"

import { useCurrentUserProfile } from "@/lib/ops/users/users.queries"
import { signOutFromDashboard } from "@/lib/auth/sign-out"

export function useAuth() {
  const qc = useQueryClient()
  const currentUser = useCurrentUserProfile()

  async function signOut() {
    await signOutFromDashboard()
    // Limpiamos el cache para que toda la UI reaccione.
    qc.removeQueries({ queryKey: ["users", "me"] })
  }

  const authUser = currentUser.data
    ? { id: currentUser.data.id, email: currentUser.data.email }
    : null

  return {
    authUser,
    isAuthenticated: Boolean(currentUser.data),
    signOut,
    ...currentUser,
  }
}

