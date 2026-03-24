"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Building2,
  ChevronRight,
  List,
  Mail,
  MessageCircle,
  User2,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getB2BStageColor,
  getB2BTypeShort,
  parseLocalDate,
} from "@/lib/mock-data"
import { useB2BLeads } from "@/lib/ops/b2b-leads/b2b-leads.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"
import type { B2BLead, Owner } from "@/lib/types/ops"

const EMPTY_LEADS: B2BLead[] = []
const EMPTY_OWNERS: Owner[] = []

function whatsappHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 8) return null
  return `https://wa.me/${digits}`
}

function formatOptionalDate(value: string | null | undefined) {
  if (!value) return null

  try {
    return format(parseLocalDate(value), "d MMM", { locale: es })
  } catch {
    return null
  }
}

function getInitials(name: string | null | undefined) {
  if (!name?.trim()) return "?"
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

interface LeadRowProps {
  lead: B2BLead
  owner?: Owner
  onOpen: (id: string) => void
}

function LeadRow({ lead, owner, onOpen }: LeadRowProps) {
  const wa = whatsappHref(lead.contact_phone)
  const email = lead.contact_email?.trim() || null
  const nextActionDate = formatOptionalDate((lead as B2BLead & { nextActionDate?: string | null }).nextActionDate)
  const createdAt = formatOptionalDate(lead.createdAt)
  const avatarBg = owner?.color?.startsWith("#") ? owner.color : undefined
  const avatarClass = avatarBg ? "" : owner?.color ?? ""
  const contactName = lead.contact_name?.trim() || null
  const stage = (lead as B2BLead & { stage?: string }).stage

  return (
    <li className="px-3 py-2 sm:px-4">
      <div className="group rounded-2xl border border-border/70 bg-background transition-all hover:border-border hover:bg-muted/20 hover:shadow-sm">
        <div className="flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-center lg:gap-4">
          <button
            type="button"
            onClick={() => onOpen(lead.id)}
            className={cn(
              "flex min-w-0 flex-1 flex-col text-left",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-xl",
            )}
            aria-label={`Abrir lead ${lead.partnerName}`}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-4" />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground sm:text-[15px]">
                    {lead.partnerName}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-medium uppercase tracking-wide">
                      {getB2BTypeShort(lead.type)}
                    </span>

                    {stage && (
                      <Badge className={cn("h-5 rounded-md px-1.5 text-[10px] capitalize", getB2BStageColor(stage))}>
                        {stage}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
              {lead.nextAction ? (
                <div className="min-w-0 rounded-xl bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Próximo paso:</span>{" "}
                  <span className="truncate">{lead.nextAction}</span>
                  {nextActionDate ? (
                    <span className="ml-1 whitespace-nowrap">· {nextActionDate}</span>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-xl bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                  Sin próximo paso definido
                </div>
              )}

              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {contactName && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <User2 className="size-3.5 shrink-0" />
                    <span className="truncate">{contactName}</span>
                  </span>
                )}

                {createdAt && <span>Creado {createdAt}</span>}
              </div>
            </div>
          </button>

          <div className="flex flex-col gap-3 lg:w-auto lg:min-w-[270px] lg:max-w-[320px]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Owner
                </div>
                {owner ? (
                  <div className="mt-1 flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                        !avatarBg && avatarClass,
                      )}
                      style={avatarBg ? { backgroundColor: avatarBg } : undefined}
                      title={owner.name}
                    >
                      {owner.avatar || getInitials(owner.name)}
                    </div>
                    <span className="truncate text-sm font-medium text-foreground">
                      {owner.name}
                    </span>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-muted-foreground">
                    Sin asignar
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpen(lead.id)}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Abrir lead ${lead.partnerName}`}
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#25D366]/12 px-3 text-sm font-medium text-[#1ea952] transition-colors hover:bg-[#25D366]/18"
                  aria-label={`Abrir WhatsApp con ${lead.contact_phone}`}
                  title={lead.contact_phone ?? "WhatsApp"}
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </a>
              ) : (
                <div
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 text-sm text-muted-foreground"
                  title={
                    lead.contact_phone
                      ? `Teléfono sin formato válido para WhatsApp: ${lead.contact_phone}`
                      : "Sin teléfono"
                  }
                >
                  <MessageCircle className="size-4" />
                  WhatsApp
                </div>
              )}

              {email ? (
                <a
                  href={`mailto:${email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-muted px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/80"
                  aria-label={`Enviar email a ${email}`}
                  title={email}
                >
                  <Mail className="size-4" />
                  Email
                </a>
              ) : (
                <div
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-dashed border-border px-3 text-sm text-muted-foreground"
                  title="Sin email"
                >
                  <Mail className="size-4" />
                  Email
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}

export function B2BLeadsList() {
  const router = useRouter()
  const { data: leadsData, isLoading } = useB2BLeads()
  const { data: ownersData } = useOwners()

  const leads = leadsData ?? EMPTY_LEADS
  const owners = ownersData ?? EMPTY_OWNERS

  const ownerById = useMemo(() => {
    return Object.fromEntries(owners.map((owner) => [owner.id, owner]))
  }, [owners])

  const sortedLeads = useMemo(() => {
    return [...leads].sort((a, b) =>
      a.partnerName.localeCompare(b.partnerName, "es", {
        sensitivity: "base",
      }),
    )
  }, [leads])

  const openLead = (id: string) => {
    router.push(`/ops/b2b/${id}`)
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
            <List className="size-4 text-primary" />
          </div>

          <div className="flex items-center gap-2">
            <span>Leads B2B</span>
            {!isLoading && sortedLeads.length > 0 && (
              <Badge variant="secondary" className="rounded-md text-[10px]">
                {sortedLeads.length}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="px-0 pb-3 pt-0">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            Cargando leads…
          </div>
        ) : sortedLeads.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-muted-foreground">
            No hay leads todavía. Creá uno desde el header.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {sortedLeads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                owner={lead.user_id ? ownerById[lead.user_id] : undefined}
                onOpen={openLead}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}