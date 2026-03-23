import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapB2BLead } from "@/lib/supabase/mappers"
import { UpdateB2BLeadSchema } from "@/lib/schemas/ops"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("b2b_leads").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(mapB2BLead(data))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body: unknown = await request.json()
  const parsed = UpdateB2BLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const update: Record<string, unknown> = {}
  if (parsed.data.partnerName !== undefined) update.partner_name = parsed.data.partnerName
  if (parsed.data.type !== undefined) update.type = parsed.data.type
  if (parsed.data.stage !== undefined) update.stage = parsed.data.stage
  if (parsed.data.nextAction !== undefined) update.next_action = parsed.data.nextAction
  if (parsed.data.nextActionDate !== undefined) update.next_action_date = parsed.data.nextActionDate
  if (parsed.data.user_id !== undefined) update.user_id = parsed.data.user_id

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("b2b_leads")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapB2BLead(data))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("b2b_leads").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
