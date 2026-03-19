import { NextResponse } from "next/server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapUserProfile } from "@/lib/supabase/mappers"
import { UpdateUserProfileSchema } from "@/lib/schemas/users"

function toErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  console.log(authData)
  if (authError || !authData.user) return toErrorResponse("Unauthorized", 401)

  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,avatar,color,created_at")
    .eq("id", authData.user.id)
    .maybeSingle()

  if (error) return toErrorResponse(error.message, 500)
  if (!data) return toErrorResponse("Not found", 404)

  return NextResponse.json(mapUserProfile(data))
}

export async function PATCH(request: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return toErrorResponse("Unauthorized", 401)

  const body: unknown = await request.json().catch(() => null)
  const parsed = UpdateUserProfileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      name: parsed.data.name,
      color: parsed.data.color,
    })
    .eq("id", authData.user.id)
    .select("id,name,email,avatar,color,created_at")
    .maybeSingle()

  if (error) return toErrorResponse(error.message, 500)
  if (!data) return toErrorResponse("Not found", 404)

  return NextResponse.json(mapUserProfile(data))
}

