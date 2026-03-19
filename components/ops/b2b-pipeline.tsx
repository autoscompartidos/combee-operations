"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getB2BStageColor, getB2BTypeShort, parseLocalDate } from "@/lib/mock-data"
import { B2B_STAGES } from "@/lib/mock-data"
import type { B2BStage } from "@/lib/types/ops"
import { useB2BLeads } from "@/lib/ops/b2b-leads/b2b-leads.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { Handshake, CalendarDays } from "lucide-react"
import { format, addDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

export function B2BPipeline() {
  const { data: b2bLeads = [], isLoading } = useB2BLeads()
  const { data: owners = [] } = useOwners()

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  const leadsByStage = useMemo(() => {
    const map: Record<B2BStage, typeof b2bLeads> = {
      Lead: [],
      Contactado: [],
      "Reunión": [],
      Piloto: [],
      Activo: [],
      Rechazado: [],
    }
    b2bLeads.forEach((lead) => {
      map[lead.stage].push(lead)
    })
    return map
  }, [b2bLeads])

  const today = new Date()
  const next14Days = eachDayOfInterval({ start: today, end: addDays(today, 13) })

  const upcomingActions = next14Days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    return {
      date: day,
      leads: b2bLeads.filter((l) => l.nextActionDate === dateStr),
    }
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Handshake className="size-4 text-primary" />
          B2B Pipeline (Alianzas)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading && (
          <p className="py-4 text-center text-xs text-muted-foreground">Cargando pipeline...</p>
        )}

        {/* Kanban board */}
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-3">
            {B2B_STAGES.map((stage) => {
              const leads = leadsByStage[stage]
              return (
                <div
                  key={stage}
                  className="flex w-[180px] shrink-0 flex-col rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="text-xs font-semibold text-foreground">{stage}</span>
                    <Badge variant="secondary" className="size-5 justify-center p-0 text-[10px]">
                      {leads.length}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 p-2">
                    {leads.length === 0 && (
                      <p className="py-4 text-center text-[10px] text-muted-foreground">
                        Sin leads
                      </p>
                    )}
                    {leads.map((lead) => {
                      const owner = lead.ownerId ? ownerById[lead.ownerId] : undefined
                      const avatarBg = owner?.color?.startsWith("#") ? owner.color : undefined
                      const avatarClass = avatarBg ? "" : owner?.color ?? ""
                      return (
                        <div
                          key={lead.id}
                          className="rounded-md border border-border bg-card p-2.5 shadow-sm"
                        >
                          <p className="text-xs font-medium leading-tight text-foreground">
                            {lead.partnerName}
                          </p>
                          <Badge
                            variant="outline"
                            className={`mt-1.5 text-[9px] ${getB2BStageColor(lead.stage)}`}
                          >
                            {getB2BTypeShort(lead.type)}
                          </Badge>
                          <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">
                            {lead.nextAction}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              {lead.nextActionDate
                                ? format(parseLocalDate(lead.nextActionDate), "dd MMM", { locale: es })
                                : "—"}
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
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* 14-day agenda calendar */}
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Próximas acciones (14 días)
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {upcomingActions.map(({ date, leads: dayLeads }) => {
              if (dayLeads.length === 0) return null
              return (
                <div
                  key={date.toISOString()}
                  className="flex items-start gap-3 rounded-md bg-muted/30 px-3 py-2"
                >
                  <div className="flex w-14 shrink-0 flex-col items-center">
                    <span className="text-[10px] font-medium capitalize text-muted-foreground">
                      {format(date, "EEE", { locale: es })}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {format(date, "dd")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    {dayLeads.map((lead) => {
                      const owner = lead.ownerId ? ownerById[lead.ownerId] : undefined
                      const avatarBg = owner?.color?.startsWith("#") ? owner.color : undefined
                      const avatarClass = avatarBg ? "" : owner?.color ?? ""
                      return (
                        <div key={lead.id} className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`shrink-0 text-[9px] ${getB2BStageColor(lead.stage)}`}
                          >
                            {lead.stage}
                          </Badge>
                          <span className="truncate text-xs text-foreground">
                            {lead.partnerName}
                          </span>
                          <span className="truncate text-[10px] text-muted-foreground">
                            — {lead.nextAction}
                          </span>
                          {owner && (
                            <div
                              className={`ml-auto flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${avatarClass}`}
                              style={avatarBg ? { backgroundColor: avatarBg } : undefined}
                            >
                              {owner.avatar}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            {upcomingActions.every(({ leads }) => leads.length === 0) && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                Sin acciones en los próximos 14 días.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
