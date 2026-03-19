"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getStatusColor } from "@/lib/mock-data"
import { useTasks } from "@/lib/ops/tasks/tasks.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { useWeeklySummary } from "@/lib/ops/weekly-summary/weekly-summary.queries"
import { Target, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

export function SemanaActual() {
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const weekStartStr = format(weekStart, "yyyy-MM-dd")
  const weekEndStr = format(weekEnd, "yyyy-MM-dd")

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const { data: tasks = [] } = useTasks({ dueDateFrom: weekStartStr, dueDateTo: weekEndStr })
  const { data: owners = [] } = useOwners()
  const { data: summary } = useWeeklySummary(weekStartStr, weekEndStr)

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  const tasksByDay = useMemo(
    () =>
      weekDays.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd")
        return tasks.filter((t) => t.dueDate === dayStr)
      }),
    [tasks, weekDays],
  )

  const weekRange = `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEnd, "d MMM yyyy", { locale: es })}`

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="size-4 text-primary" />
            Semana actual
          </CardTitle>
          <span className="text-xs text-muted-foreground capitalize">{weekRange}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Stats row */}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1 border-primary bg-primary/20 text-primary-foreground"
            >
              <CheckCircle2 className="size-3" />
              {summary?.accionesActivas ?? "—"} activas
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-accent bg-accent/20 text-accent-foreground"
            >
              <AlertTriangle className="size-3" />
              {summary?.bloqueos ?? "—"} bloqueos
            </Badge>
            <Badge
              variant="outline"
              className="gap-1 border-secondary bg-secondary/20 text-secondary-foreground"
            >
              <Clock className="size-3" />
              {summary?.pendientes ?? "—"} pendientes
            </Badge>
          </div>
        </div>

        {/* Mini weekly calendar */}
        <div className="overflow-x-auto">
          <div className="grid min-w-[540px] grid-cols-7 gap-px rounded-lg border border-border bg-border">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center bg-muted/50 px-1 py-1.5">
                <span className="text-[10px] font-medium capitalize text-muted-foreground">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {format(day, "d")}
                </span>
              </div>
            ))}

            {tasksByDay.map((dayTasks, i) => (
              <div
                key={weekDays[i].toISOString()}
                className="flex min-h-[72px] flex-col gap-1 bg-card p-1"
              >
                {dayTasks.length === 0 && (
                  <span className="mt-2 text-center text-[10px] text-muted-foreground/50">
                    —
                  </span>
                )}
                {dayTasks.map((t) => {
                  const owner = t.ownerId ? ownerById[t.ownerId] : undefined
                  return (
                    <div
                      key={t.id}
                      className={`rounded px-1.5 py-1 text-[10px] leading-tight ${getStatusColor(t.status)}`}
                    >
                      <div className="truncate font-medium">{t.title}</div>
                      {t.timeSlot && (
                        <span className="opacity-70">{t.timeSlot}</span>
                      )}
                      {owner && (
                        <span className="ml-1 opacity-60">{owner.avatar}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
