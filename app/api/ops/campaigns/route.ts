import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { mapCampaign } from "@/lib/supabase/mappers"
import { CreateCampaignSchema } from "@/lib/schemas/ops"

export async function GET() {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("start_date")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data.map(mapCampaign))
}

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const parsed = CreateCampaignSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      name: parsed.data.name,
      start_date: parsed.data.startDate,
      end_date: parsed.data.endDate,
      status: parsed.data.status,
      priority: parsed.data.priority,
      color: parsed.data.color,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(mapCampaign(data), { status: 201 })
}
