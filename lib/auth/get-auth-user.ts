import { getSupabaseServerClient } from "@/lib/supabase/server"

export type AuthUser = {
  id: string
  email: string | null
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  }
}

