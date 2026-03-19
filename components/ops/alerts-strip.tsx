"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import { useTasks } from "@/lib/ops/tasks/tasks.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { format } from "date-fns"

export function AlertsStrip() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { data: tasks = [] } = useTasks()
  const { data: owners = [] } = useOwners()

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  const todayIso = format(new Date(), "yyyy-MM-dd")

  const alerts = useMemo(
    () =>
      tasks
        .filter((t) => {
          if (t.status === "bloqueada") return true
          if (t.status !== "completada" && t.dueDate < todayIso) return true
          return false
        })
        .slice(0, 3),
    [tasks, todayIso],
  )

  if (!mounted || alerts.length === 0) return null

  return (
    <div className="flex items-center gap-2 border-b border-border bg-accent/20 px-4 py-2">
      <AlertTriangle className="size-4 shrink-0 text-accent" />
      <span className="text-xs font-medium text-accent-foreground">Alertas:</span>
      <div className="flex flex-wrap items-center gap-2">
        {alerts.map((alert) => {
          const owner = alert.ownerId ? ownerById[alert.ownerId] : undefined
          const isBlocked = alert.status === "bloqueada"
          return (
            <Badge
              key={alert.id}
              variant="outline"
              className={
                isBlocked
                  ? "border-accent bg-accent/20 text-accent-foreground"
                  : "border-primary bg-primary/20 text-primary-foreground"
              }
            >
              {isBlocked ? (
                <AlertTriangle className="mr-1 size-3" />
              ) : (
                <Clock className="mr-1 size-3" />
              )}
              <span className="max-w-[200px] truncate">{alert.title}</span>
              {owner && (
                <span className="ml-1 text-[10px] opacity-70">({owner.name})</span>
              )}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
