"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { getB2BStageColor, getB2BTypeShort, parseLocalDate } from "@/lib/mock-data"
import { B2B_STAGES } from "@/lib/mock-data"
import type { B2BLead, B2BStage, Owner } from "@/lib/types/ops"
import { useB2BLeads, useUpdateB2BLead } from "@/lib/ops/b2b-leads/b2b-leads.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import { cn } from "@/lib/utils"
import { Handshake, CalendarDays } from "lucide-react"
import { format, addDays, eachDayOfInterval } from "date-fns"
import { es } from "date-fns/locale"

type ItemsByStage = Record<B2BStage, string[]>

function buildItemsByStage(leads: B2BLead[]): ItemsByStage {
  const map: ItemsByStage = {
    Lead: [],
    Contactado: [],
    "Reunión": [],
    Piloto: [],
    Activo: [],
    Rechazado: [],
  }
  leads.forEach((l) => map[l.stage].push(l.id))
  return map
}

function findContainer(id: UniqueIdentifier, items: ItemsByStage): B2BStage | undefined {
  const s = String(id)
  if (B2B_STAGES.includes(s as B2BStage)) return s as B2BStage
  for (const stage of B2B_STAGES) {
    if (items[stage].includes(s)) return stage
  }
  return undefined
}

/** Aplica movimiento Kanban; `patchStage` es la nueva etapa solo si cambió de columna. */
function applyDragEnd(
  prev: ItemsByStage,
  activeIdStr: string,
  overIdStr: string,
): { next: ItemsByStage; patchStage: B2BStage | null } | null {
  const activeContainer = findContainer(activeIdStr, prev)
  const overContainer = findContainer(overIdStr, prev)
  if (!activeContainer || !overContainer) return null

  if (activeContainer === overContainer) {
    const items = prev[activeContainer]
    const oldIndex = items.indexOf(activeIdStr)
    if (oldIndex === -1) return null

    let newIndex: number
    if (B2B_STAGES.includes(overIdStr as B2BStage) && overIdStr === activeContainer) {
      newIndex = items.length - 1
    } else {
      newIndex = items.indexOf(overIdStr)
      if (newIndex === -1) return null
    }
    if (oldIndex === newIndex) return null
    return {
      next: {
        ...prev,
        [activeContainer]: arrayMove(items, oldIndex, newIndex),
      },
      patchStage: null,
    }
  }

  const activeItems = [...prev[activeContainer]]
  const overItems = [...prev[overContainer]]
  const oldIndex = activeItems.indexOf(activeIdStr)
  if (oldIndex === -1) return null
  const [removed] = activeItems.splice(oldIndex, 1)
  const isOverItem = prev[overContainer].includes(overIdStr)
  const newIndex = isOverItem ? overItems.indexOf(overIdStr) : overItems.length
  overItems.splice(newIndex, 0, removed)

  return {
    next: {
      ...prev,
      [activeContainer]: activeItems,
      [overContainer]: overItems,
    },
    patchStage: overContainer,
  }
}

function LeadCardContent({
  lead,
  owner,
  className,
}: {
  lead: B2BLead
  owner?: Owner
  className?: string
}) {
  const avatarBg = owner?.color?.startsWith("#") ? owner.color : undefined
  const avatarClass = avatarBg ? "" : owner?.color ?? ""
  return (
    <div className={cn("rounded-md border border-border bg-card p-2.5 shadow-sm", className)}>
      <p className="text-xs font-medium leading-tight text-foreground">{lead.partnerName}</p>
      <Badge variant="outline" className={`mt-1.5 text-[9px] ${getB2BStageColor(lead.stage)}`}>
        {getB2BTypeShort(lead.type)}
      </Badge>
      <p className="mt-1.5 text-[10px] leading-tight text-muted-foreground">{lead.nextAction}</p>
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
}

function SortableLeadCard({
  lead,
  owner,
}: {
  lead: B2BLead
  owner?: Owner
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "z-10")}>
      <div
        {...attributes}
        {...listeners}
        className="touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LeadCardContent lead={lead} owner={owner} className="cursor-grab active:cursor-grabbing" />
      </div>
    </div>
  )
}

function KanbanColumn({
  stage,
  itemIds,
  children,
}: {
  stage: B2BStage
  itemIds: string[]
  children: ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  return (
    <div
      className={cn(
        "flex w-[180px] shrink-0 flex-col rounded-lg border border-border bg-muted/30",
        isOver && "ring-2 ring-primary/50",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold text-foreground">{stage}</span>
        <Badge variant="secondary" className="size-5 justify-center p-0 text-[10px]">
          {itemIds.length}
        </Badge>
      </div>
      <div ref={setNodeRef} className="min-h-[120px]">
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 p-2">
            {children}
            {itemIds.length === 0 && (
              <p className="py-4 text-center text-[10px] text-muted-foreground">Sin leads</p>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export function B2BPipeline() {
  const { data: b2bLeads = [], isLoading } = useB2BLeads()
  const { data: owners = [] } = useOwners()
  const { mutateAsync: updateB2BLead } = useUpdateB2BLead()

  const ownerById = useMemo(
    () => Object.fromEntries(owners.map((o) => [o.id, o])),
    [owners],
  )

  const leadById = useMemo(() => Object.fromEntries(b2bLeads.map((l) => [l.id, l])), [b2bLeads])

  const itemsFromServer = useMemo(() => buildItemsByStage(b2bLeads), [b2bLeads])
  const [itemsByStage, setItemsByStage] = useState<ItemsByStage>(itemsFromServer)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setItemsByStage(itemsFromServer)
  }, [itemsFromServer])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const leadsWithListOrder = useMemo(() => {
    const out: B2BLead[] = []
    for (const stage of B2B_STAGES) {
      for (const id of itemsByStage[stage]) {
        const lead = leadById[id]
        if (lead) out.push({ ...lead, stage })
      }
    }
    return out
  }, [itemsByStage, leadById])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      if (!over) return

      const activeIdStr = String(active.id)
      const overIdStr = String(over.id)

      const result = applyDragEnd(itemsByStage, activeIdStr, overIdStr)
      if (!result) return

      setItemsByStage(result.next)

      if (!result.patchStage) return

      try {
        await updateB2BLead({ id: activeIdStr, input: { stage: result.patchStage } })
      } catch (err) {
        console.error("Error actualizando stage del lead:", err)
        setItemsByStage(buildItemsByStage(b2bLeads))
      }
    },
    [b2bLeads, itemsByStage, updateB2BLead],
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const today = new Date()
  const next14Days = eachDayOfInterval({ start: today, end: addDays(today, 13) })

  const upcomingActions = next14Days.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd")
    return {
      date: day,
      leads: leadsWithListOrder.filter((l) => l.nextActionDate === dateStr),
    }
  })

  const activeLead = activeId ? leadById[activeId] : undefined

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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-3">
              {B2B_STAGES.map((stage) => {
                const itemIds = itemsByStage[stage]
                return (
                  <KanbanColumn key={stage} stage={stage} itemIds={itemIds}>
                    {itemIds.map((id) => {
                      const lead = leadById[id]
                      if (!lead) return null
                      const owner = lead.user_id ? ownerById[lead.user_id] : undefined
                      return <SortableLeadCard key={id} lead={{ ...lead, stage }} owner={owner} />
                    })}
                  </KanbanColumn>
                )
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <DragOverlay dropAnimation={null}>
            {activeLead ? (
              <LeadCardContent
                lead={activeLead}
                owner={activeLead.user_id ? ownerById[activeLead.user_id] : undefined}
                className="cursor-grabbing shadow-md"
              />
            ) : null}
          </DragOverlay>
        </DndContext>

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
                    <span className="text-sm font-bold text-foreground">{format(date, "dd")}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    {dayLeads.map((lead) => {
                      const owner = lead.user_id ? ownerById[lead.user_id] : undefined
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
                          <span className="truncate text-xs text-foreground">{lead.partnerName}</span>
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
