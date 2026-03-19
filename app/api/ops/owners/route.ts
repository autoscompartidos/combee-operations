import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapOwner } from "@/lib/supabase/mappers"
import { CreateOwnerSchema } from "@/lib/schemas/ops"
import { CombeeUserColorPalette } from "@/lib/schemas/users"

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return NextResponse.json({ data: [] }, { status: 401 })

  const { data, error } = await supabase
    .from("users")
    .select("id,name,avatar,color,created_at")
    .order("name")

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = Array.isArray(data) ? data : []
  if (rows.length > 0) return NextResponse.json(rows.map(mapOwner))

  // Si por RLS el usuario solo puede ver su propia fila y aún no existe profile,
  // creamos un registro mínimo para que "Equipo" se pueda poblar.
  const email = authData.user.email ?? null
  const inferredName = email ? email.split("@")[0] : null
  const defaultColor = CombeeUserColorPalette[0]

  const { error: upsertError } = await supabase.from("users").upsert({
    id: authData.user.id,
    email,
    name: inferredName,
    avatar: null,
    color: defaultColor,
  })

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  const { data: dataAfter, error: errorAfter } = await supabase
    .from("users")
    .select("id,name,avatar,color,created_at")
    .order("name")

  if (errorAfter) return NextResponse.json({ error: errorAfter.message }, { status: 500 })
  const rowsAfter = Array.isArray(dataAfter) ? dataAfter : []
  return NextResponse.json(rowsAfter.map(mapOwner))
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const parsed = CreateOwnerSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("users")
    .insert({
      name: parsed.data.name,
      avatar: parsed.data.avatar,
      color: parsed.data.color,
    })
    .select("id,name,avatar,color,created_at")
    .single()
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapOwner(data), { status: 201 })
}
