"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { getCampaignStatusColor, getPriorityColor, parseLocalDate } from "@/lib/mock-data"
import { useCampaigns } from "@/lib/ops/campaigns/campaigns.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { Megaphone, ChevronLeft, ChevronRight } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isWithinInterval,
} from "date-fns"
import { es } from "date-fns/locale"

export function CampaniasSection() {
  const [mounted, setMounted] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  useEffect(() => setMounted(true), [])

  const { data: campaigns = [], isLoading } = useCampaigns()
  const { data: owners = [] } = useOwners()

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)
  const paddingDays = startDay === 0 ? 6 : startDay - 1

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="size-4 text-primary" />
          Campañas (Calendario Comercial)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Campaign table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs">Campaña</TableHead>
                <TableHead className="text-xs">Inicio</TableHead>
                <TableHead className="text-xs">Fin</TableHead>
                <TableHead className="text-xs">Estado</TableHead>
                <TableHead className="text-xs">Responsable</TableHead>
                <TableHead className="text-xs">Prioridad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-xs text-muted-foreground">
                    Cargando campañas...
                  </TableCell>
                </TableRow>
              )}
              {campaigns.map((c) => {
                const owner = c.ownerId ? ownerById[c.ownerId] : undefined
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs font-medium">{c.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(parseLocalDate(c.startDate), "dd MMM", { locale: es })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(parseLocalDate(c.endDate), "dd MMM", { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getCampaignStatusColor(c.status)}`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {owner && (
                        <div className="flex items-center gap-1.5">
                          {(() => {
                            const avatarBg = owner.color?.startsWith("#") ? owner.color : undefined
                            const avatarClass = avatarBg ? "" : owner.color

                            return (
                              <div
                                className={`flex size-5 items-center justify-center rounded-full text-[8px] font-bold ${avatarClass}`}
                                style={avatarBg ? { backgroundColor: avatarBg } : undefined}
                              >
                                {owner.avatar}
                              </div>
                            )
                          })()}
                          <span className="text-xs">{owner.name}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${getPriorityColor(c.priority)}`}>
                        {c.priority}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Month calendar with campaign event bars */}
        {!mounted ? (
          <div className="flex h-[320px] items-center justify-center rounded-lg border border-border">
            <span className="text-xs text-muted-foreground">Cargando calendario...</span>
          </div>
        ) : (
          <div className="rounded-lg border border-border p-3">
            <div className="mb-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-sm font-medium capitalize text-foreground">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight className="size-4" />
              </Button>
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
                <div key={`pad-${i}`} className="min-h-[52px] bg-card" />
              ))}
              {days.map((day) => {
                const dayCampaigns = campaigns.filter((c) =>
                  isWithinInterval(day, {
                    start: parseLocalDate(c.startDate),
                    end: parseLocalDate(c.endDate),
                  }),
                )
                const todayStr = format(new Date(), "yyyy-MM-dd")
                const isToday = format(day, "yyyy-MM-dd") === todayStr

                return (
                  <div
                    key={day.toISOString()}
                    className={`flex min-h-[52px] flex-col bg-card p-1 ${
                      isToday ? "ring-1 ring-primary ring-inset" : ""
                    }`}
                  >
                    <span
                      className={`mb-0.5 text-[10px] font-medium ${
                        !isSameMonth(day, currentMonth)
                          ? "text-muted-foreground/40"
                          : isToday
                            ? "font-bold text-primary"
                            : "text-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayCampaigns.map((c) => (
                      <div
                        key={c.id}
                        className={`mb-0.5 truncate rounded-sm px-1 py-px text-[8px] font-medium text-card ${c.color}`}
                      >
                        {c.name}
                      </div>
                    ))}
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
