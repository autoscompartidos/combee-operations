"use client"

import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export async function signInWithEmailPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) throw error
}

