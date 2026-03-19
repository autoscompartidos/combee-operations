import type { WeeklySummary } from "@/lib/types/ops"

export async function fetchWeeklySummary(weekStart: string, weekEnd: string): Promise<WeeklySummary> {
  const qs = new URLSearchParams({ weekStart, weekEnd })
  const res = await fetch(`/api/ops/weekly-summary?${qs}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  return res.json() as Promise<WeeklySummary>
}
