// ===== TYPES (re-exported from canonical source) =====

export type {
  Owner,
  TaskArea,
  TaskStatus,
  Task,
  CampaignStatus,
  CampaignPriority,
  Campaign,
  B2BStage,
  B2BType,
  B2BLead,
} from "@/lib/types/ops"

import type { TaskStatus, CampaignStatus, CampaignPriority, B2BStage, B2BType } from "@/lib/types/ops"

// ===== DISPLAY HELPERS =====

/** Parse an ISO date string (YYYY-MM-DD) as local midnight, avoiding UTC-shift hydration mismatches */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function getStatusColor(status: TaskStatus) {
  switch (status) {
    case "en progreso":
      return "bg-primary text-primary-foreground border-primary"
    case "pendiente":
      return "bg-secondary text-secondary-foreground border-secondary"
    case "bloqueada":
      return "bg-accent text-accent-foreground border-accent"
    case "completada":
      return "bg-muted text-muted-foreground border-muted"
  }
}

export function getCampaignStatusColor(status: CampaignStatus) {
  switch (status) {
    case "activa":
      return "bg-primary/20 text-primary-foreground border-primary"
    case "planificada":
      return "bg-secondary/20 text-secondary-foreground border-secondary"
    case "finalizada":
      return "bg-muted/20 text-muted-foreground border-muted"
  }
}

export function getPriorityColor(priority: CampaignPriority) {
  switch (priority) {
    case "alta":
      return "bg-accent/20 text-accent-foreground border-accent"
    case "media":
      return "bg-primary/20 text-primary-foreground border-primary"
    case "baja":
      return "bg-secondary/20 text-secondary-foreground border-secondary"
  }
}

export function getB2BStageColor(stage: B2BStage) {
  switch (stage) {
    case "Lead":
      return "bg-secondary/20 text-secondary-foreground"
    case "Contactado":
      return "bg-primary/20 text-primary-foreground"
    case "Reunión":
      return "bg-accent/20 text-accent-foreground"
    case "Piloto":
      return "bg-muted/20 text-muted-foreground"
    case "Activo":
      return "bg-primary/10 text-primary-foreground"
    case "Rechazado":
      return "bg-accent/20 text-accent-foreground"
  }
}

export function getB2BTypeShort(type: B2BType) {
  switch (type) {
    case "Estación de servicio":
      return "Estación"
    case "Centro Estudiantil":
      return "Centro Est."
    default:
      return type
  }
}

export const B2B_STAGES: B2BStage[] = [
  "Lead",
  "Contactado",
  "Reunión",
  "Piloto",
  "Activo",
  "Rechazado",
]

export const B2B_TYPES: B2BType[] = [
  "Estación de servicio",
  "Productora",
  "Hostel",
  "Residencias",
  "Universidad",
  "Centro Estudiantil",
]
