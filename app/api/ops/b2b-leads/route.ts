import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapB2BLead } from "@/lib/supabase/mappers"
import { CreateB2BLeadSchema } from "@/lib/schemas/ops"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stage = searchParams.get("stage")

  const supabase = await getSupabaseServerClient()
  let query = supabase.from("b2b_leads").select("*").order("next_action_date")

  if (stage) query = query.eq("stage", stage)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(mapB2BLead))
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const parsed = CreateB2BLeadSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("b2b_leads")
    .insert({
      partner_name: parsed.data.partnerName,
      type: parsed.data.type,
      stage: parsed.data.stage,
      next_action: parsed.data.nextAction,  
      next_action_date: parsed.data.nextActionDate,
      contact_name: parsed.data.contact_name,
      contact_phone: parsed.data.contact_phone,
      contact_email: parsed.data.contact_email,
      user_id: parsed.data.user_id,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapB2BLead(data), { status: 201 })
}
