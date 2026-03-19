"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchWeeklySummary } from "./weekly-summary.repository"

export const weeklySummaryKeys = {
  detail: (weekStart: string, weekEnd: string) =>
    ["weekly-summary", weekStart, weekEnd] as const,
}

export function useWeeklySummary(weekStart: string, weekEnd: string) {
  return useQuery({
    queryKey: weeklySummaryKeys.detail(weekStart, weekEnd),
    queryFn: () => fetchWeeklySummary(weekStart, weekEnd),
    enabled: Boolean(weekStart && weekEnd),
  })
}
