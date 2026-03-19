import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { WeeklySummary } from "@/lib/types/ops"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const weekStart = searchParams.get("weekStart")
  const weekEnd = searchParams.get("weekEnd")

  if (!weekStart || !weekEnd) {
    return NextResponse.json(
      { error: "weekStart and weekEnd query params are required (YYYY-MM-DD)" },
      { status: 400 },
    )
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.rpc("get_weekly_summary", {
    week_start: weekStart,
    week_end: weekEnd,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const summary: WeeklySummary = {
    accionesActivas: (data as Record<string, number>).acciones_activas ?? 0,
    bloqueos: (data as Record<string, number>).bloqueos ?? 0,
    pendientes: (data as Record<string, number>).pendientes ?? 0,
    completadas: (data as Record<string, number>).completadas ?? 0,
  }

  return NextResponse.json(summary)
}
