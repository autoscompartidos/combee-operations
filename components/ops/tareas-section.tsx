"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStatusColor, parseLocalDate } from "@/lib/mock-data"
import type { TaskArea, TaskStatus } from "@/lib/types/ops"
import { useTasks } from "@/lib/ops/tasks/tasks.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { ListChecks, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
} from "date-fns"
import { es } from "date-fns/locale"

const AREAS: TaskArea[] = ["Orgánico", "B2B", "Activación", "Difusión"]
const STATUSES: TaskStatus[] = ["pendiente", "en progreso", "bloqueada", "completada"]

export function TareasSection({
  onCreateTask,
  onCreateCampaign,
  onCreateLead,
}: {
  onCreateTask: () => void
  onCreateCampaign: () => void
  onCreateLead: () => void
}) {
  const [filterArea, setFilterArea] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterOwner, setFilterOwner] = useState<string>("all")
  const [mounted, setMounted] = useState(false)
  const [calendarMode, setCalendarMode] = useState<"month" | "week">("month")
  const [currentDate, setCurrentDate] = useState(() => new Date())
  useEffect(() => setMounted(true), [])

  const { data: tasks = [], isLoading } = useTasks()
  const { data: owners = [] } = useOwners()

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterArea !== "all" && t.area !== filterArea) return false
      if (filterStatus !== "all" && t.status !== filterStatus) return false
      if (filterOwner !== "all" && t.ownerId !== filterOwner) return false
      return true
    })
  }, [tasks, filterArea, filterStatus, filterOwner])

  const isMonth = calendarMode === "month"
  const rangeStart = isMonth
    ? startOfMonth(currentDate)
    : startOfWeek(currentDate, { weekStartsOn: 1 })
  const rangeEnd = isMonth
    ? endOfMonth(currentDate)
    : endOfWeek(currentDate, { weekStartsOn: 1 })
  const calDays = eachDayOfInterval({ start: rangeStart, end: rangeEnd })
  const paddingDays = isMonth
    ? getDay(rangeStart) === 0
      ? 6
      : getDay(rangeStart) - 1
    : 0

  const navPrev = () => setCurrentDate((d) => (isMonth ? subMonths(d, 1) : subWeeks(d, 1)))
  const navNext = () => setCurrentDate((d) => (isMonth ? addMonths(d, 1) : addWeeks(d, 1)))

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ListChecks className="size-4 text-primary" />
            Tareas operacionales
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onCreateTask}>
              Nueva tarea
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateCampaign}>
              Nueva campaña
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateLead}>
              Nuevo lead B2B
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterArea} onValueChange={setFilterArea}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {AREAS.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterOwner} onValueChange={setFilterOwner}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Responsable" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {owners.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task list */}
        <div className="flex flex-col gap-1.5">
          {isLoading && (
            <p className="py-4 text-center text-xs text-muted-foreground">Cargando tareas...</p>
          )}
          {!isLoading && filteredTasks.length === 0 && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No hay tareas con estos filtros.
            </p>
          )}
          {filteredTasks.map((t) => {
            const owner = t.ownerId ? ownerById[t.ownerId] : undefined
            const avatarBg = owner?.color?.startsWith("#") ? owner.color : undefined
            const avatarClass = avatarBg ? "" : owner?.color ?? ""
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2"
              >
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${getStatusColor(t.status)}`}
                >
                  {t.status}
                </Badge>
                <span className="flex-1 truncate text-xs font-medium text-foreground">
                  {t.title}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {t.area}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {format(parseLocalDate(t.dueDate), "dd MMM", { locale: es })}
                </span>
                {owner && (
                  <div
                    className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${avatarClass}`}
                    style={avatarBg ? { backgroundColor: avatarBg } : undefined}
                    title={owner.name}
                  >
                    {owner.avatar}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Calendar for tasks */}
        {!mounted ? (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-border">
            <span className="text-xs text-muted-foreground">Cargando calendario...</span>
          </div>
        ) : (
          <div className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="size-7" onClick={navPrev}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[140px] text-center text-sm font-medium capitalize text-foreground">
                  {isMonth
                    ? format(currentDate, "MMMM yyyy", { locale: es })
                    : `${format(rangeStart, "dd MMM", { locale: es })} – ${format(rangeEnd, "dd MMM", { locale: es })}`}
                </span>
                <Button variant="ghost" size="icon" className="size-7" onClick={navNext}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant={isMonth ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => setCalendarMode("month")}
                >
                  Mes
                </Button>
                <Button
                  variant={!isMonth ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-[10px]"
                  onClick={() => setCalendarMode("week")}
                >
                  Semana
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px rounded bg-border">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div
                  key={d}
                  className="bg-muted/50 py-1 text-center text-[10px] font-medium text-muted-foreground"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: paddingDays }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-[48px] bg-card" />
              ))}
              {calDays.map((day) => {
                const dayTasks = filteredTasks.filter((t) =>
                  isSameDay(parseLocalDate(t.dueDate), day),
                )
                const todayStr = format(new Date(), "yyyy-MM-dd")
                const isToday = format(day, "yyyy-MM-dd") === todayStr

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex min-h-[48px] flex-col bg-card p-1 ${
                      isToday ? "ring-1 ring-primary ring-inset" : ""
                    }`}
                  >
                    <span
                      className={`mb-0.5 text-[10px] ${
                        !isSameMonth(day, currentDate) && isMonth
                          ? "text-muted-foreground/40"
                          : isToday
                            ? "font-bold text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`mb-0.5 truncate rounded-sm px-1 py-px text-[8px] font-medium ${getStatusColor(t.status)}`}
                      >
                        {t.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{dayTasks.length - 2} más
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
