import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapCampaign } from "@/lib/supabase/mappers"
import { UpdateCampaignSchema } from "@/lib/schemas/ops"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(mapCampaign(data))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body: unknown = await request.json()
  const parsed = UpdateCampaignSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const update: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) update.name = parsed.data.name
  if (parsed.data.startDate !== undefined) update.start_date = parsed.data.startDate
  if (parsed.data.endDate !== undefined) update.end_date = parsed.data.endDate
  if (parsed.data.status !== undefined) update.status = parsed.data.status
  if (parsed.data.priority !== undefined) update.priority = parsed.data.priority
  if (parsed.data.color !== undefined) update.color = parsed.data.color

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("campaigns")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapCampaign(data))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("campaigns").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
