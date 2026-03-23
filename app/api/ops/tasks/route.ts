import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapTask } from "@/lib/supabase/mappers"
import { CreateTaskSchema } from "@/lib/schemas/ops"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const dueDateFrom = searchParams.get("dueDateFrom")
  const dueDateTo = searchParams.get("dueDateTo")

  const supabase = await getSupabaseServerClient()
  let query = supabase.from("tasks").select("*").order("due_date").order("time_slot")

  if (status) query = query.eq("status", status)
  if (dueDateFrom) query = query.gte("due_date", dueDateFrom)
  if (dueDateTo) query = query.lte("due_date", dueDateTo)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(mapTask))
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const parsed = CreateTaskSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: parsed.data.title,
      area: parsed.data.area,
      status: parsed.data.status,
      due_date: parsed.data.dueDate,
      campaign_id: parsed.data.campaignId,
      b2b_lead_id: parsed.data.b2bLeadId,
      time_slot: parsed.data.timeSlot,
      user_id: parsed.data.user_id,
      notes: parsed.data.notes,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapTask(data), { status: 201 })
}
