"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export async function signOutFromDashboard() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}

