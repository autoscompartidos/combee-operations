import { z } from "zod"

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TaskAreaSchema = z.enum(["Orgánico", "B2B", "Activación", "Difusión"])
export const TaskStatusSchema = z.enum(["pendiente", "en progreso", "bloqueada", "completada"])
export const CampaignStatusSchema = z.enum(["planificada", "activa", "finalizada"])
export const CampaignPrioritySchema = z.enum(["alta", "media", "baja"])
export const B2BStageSchema = z.enum(["Lead", "Contactado", "Reunión", "Piloto", "Activo", "Rechazado"])
export const B2BTypeSchema = z.enum([
  "Estación de servicio",
  "Productora",
  "Hostel",
  "Residencias",
  "Universidad",
  "Centro Estudiantil",
])

// ─── Owner ────────────────────────────────────────────────────────────────────

export const CreateOwnerSchema = z.object({
  name: z.string().min(1).max(100),
  avatar: z.string().min(1).max(10),
  color: z.string().min(1),
})

export const UpdateOwnerSchema = CreateOwnerSchema.partial()

// ─── Campaign ─────────────────────────────────────────────────────────────────

export const CreateCampaignSchema = z
  .object({
    name: z.string().min(1).max(200),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: CampaignStatusSchema,
    user_id: z.string().uuid().nullable(),
    priority: CampaignPrioritySchema,
    color: z.string().min(1),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be >= startDate",
    path: ["endDate"],
  })

export const UpdateCampaignSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    status: CampaignStatusSchema.optional(),
    ownerId: z.string().uuid().nullable().optional(),
    priority: CampaignPrioritySchema.optional(),
    color: z.string().min(1).optional(),
  })
  .refine(
    (d) => {
      if (d.startDate && d.endDate) return d.endDate >= d.startDate
      return true
    },
    { message: "endDate must be >= startDate", path: ["endDate"] },
  )

// ─── B2B Lead ─────────────────────────────────────────────────────────────────

export const CreateB2BLeadSchema = z.object({
  partnerName: z.string().min(1).max(200),
  type: B2BTypeSchema,
  stage: B2BStageSchema,
  nextAction: z.string().min(1),
  nextActionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  user_id: z.string().uuid().nullable(),
})

export const UpdateB2BLeadSchema = CreateB2BLeadSchema.partial()

// ─── Task ─────────────────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  user_id: z.string().uuid().nullable(),
  title: z.string().min(1).max(300),
  area: TaskAreaSchema,
  status: TaskStatusSchema,
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().nullable(),
  campaignId: z.string().uuid().nullable(),
  b2bLeadId: z.string().uuid().nullable(),
  timeSlot: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()
