import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapTask } from "@/lib/supabase/mappers"
import { UpdateTaskSchema } from "@/lib/schemas/ops"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(mapTask(data))
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  const body: unknown = await request.json()
  const parsed = UpdateTaskSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const update: Record<string, unknown> = {}
  if (parsed.data.title !== undefined) update.title = parsed.data.title
  if (parsed.data.area !== undefined) update.area = parsed.data.area
  if (parsed.data.status !== undefined) update.status = parsed.data.status
  if (parsed.data.dueDate !== undefined) update.due_date = parsed.data.dueDate
  if (parsed.data.campaignId !== undefined) update.campaign_id = parsed.data.campaignId
  if (parsed.data.b2bLeadId !== undefined) update.b2b_lead_id = parsed.data.b2bLeadId
  if (parsed.data.timeSlot !== undefined) update.time_slot = parsed.data.timeSlot
  if(parsed.data.notes !== undefined) update.notes = parsed.data.notes
  if(parsed.data.user_id !== undefined) update.user_id = parsed.data.user_id

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapTask(data))
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.from("tasks").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new NextResponse(null, { status: 204 })
}
