// ─── Enums (mirror DB enums) ─────────────────────────────────────────────────

export type TaskArea = "Orgánico" | "B2B" | "Activación" | "Difusión"
export type TaskStatus = "pendiente" | "en progreso" | "bloqueada" | "completada"
export type CampaignStatus = "planificada" | "activa" | "finalizada"
export type CampaignPriority = "alta" | "media" | "baja"
export type B2BStage = "Lead" | "Contactado" | "Reunión" | "Piloto" | "Activo" | "Rechazado"
export type B2BType =
  | "Estación de servicio"
  | "Productora"
  | "Hostel"
  | "Residencias"
  | "Universidad"
  | "Centro Estudiantil"

// ─── Domain types (match DB columns, camelCase) ───────────────────────────────

export type Owner = {
  id: string
  name: string
  avatar: string
  color: string
  createdAt: string
}

export type Campaign = {
  id: string
  name: string
  startDate: string
  endDate: string
  status: CampaignStatus
  user_id: string | null
  priority: CampaignPriority
  color: string
  createdAt: string
  updatedAt: string
}

export type B2BLead = {
  id: string
  partnerName: string
  type: B2BType
  stage: B2BStage
  nextAction: string
  nextActionDate: string | null
  user_id: string | null
  createdAt: string
  updatedAt: string
}

export type Task = {
  id: string
  title: string
  area: TaskArea
  status: TaskStatus
  dueDate: string
  notes: string | null
  user_id: string | null
  campaignId: string | null
  b2bLeadId: string | null
  timeSlot: string | null
  createdAt: string
  updatedAt: string
}

export type WeeklySummary = {
  accionesActivas: number
  bloqueos: number
  pendientes: number
  completadas: number
}

// ─── Input types for mutations ────────────────────────────────────────────────

export type CreateOwnerInput = Pick<Owner, "name" | "avatar" | "color">
export type UpdateOwnerInput = Partial<CreateOwnerInput>

export type CreateCampaignInput = Pick<
  Campaign,
  "name" | "startDate" | "endDate" | "status" | "user_id" | "priority" | "color"
>
export type UpdateCampaignInput = Partial<CreateCampaignInput>

export type CreateB2BLeadInput = Pick<
  B2BLead,
  "partnerName" | "type" | "stage" | "nextAction" | "nextActionDate" | "user_id"
>
export type UpdateB2BLeadInput = Partial<CreateB2BLeadInput>

export type CreateTaskInput = Pick<
  Task,
  "title" | "area" | "status" | "notes" | "user_id" | "dueDate" | "campaignId" | "b2bLeadId" | "timeSlot"
>
export type UpdateTaskInput = Partial<CreateTaskInput>
