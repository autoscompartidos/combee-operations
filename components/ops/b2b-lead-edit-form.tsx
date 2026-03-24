"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  B2BStageSchema,
  B2BTypeSchema,
  UpdateB2BLeadSchema,
} from "@/lib/schemas/ops"

import { B2B_STAGES, B2B_TYPES } from "@/lib/mock-data"
import {
  useB2BLead,
  useDeleteB2BLead,
  useUpdateB2BLead,
} from "@/lib/ops/b2b-leads/b2b-leads.queries"
import { useOwners } from "@/lib/ops/owners/owners.queries"

import type { Owner } from "@/lib/types/ops"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const NONE_OWNER = "__none__"
const EMPTY_OWNERS: Owner[] = []

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const EditB2BLeadFormSchema = UpdateB2BLeadSchema.extend({
  partnerName: z.string().trim().min(1, "Ingresá el nombre del partner").max(200),
  type: B2BTypeSchema,
  stage: B2BStageSchema,
  nextAction: z.string().trim().min(1, "Ingresá la próxima acción"),
  nextActionDate: z
    .string()
    .refine((value) => value === "" || ISO_DATE_REGEX.test(value), {
      message: "Fecha inválida",
    }),
  user_id: z.union([z.string().uuid(), z.literal(NONE_OWNER)]),
  contact_name: z.string().max(200),
  contact_phone: z.string().max(200),
  contact_email: z.union([z.literal(""), z.string().email("Email inválido").max(200)]),
})

type EditB2BLeadFormValues = z.infer<typeof EditB2BLeadFormSchema>

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function B2BLeadEditForm({ leadId }: { leadId: string }) {
  const router = useRouter()

  const { data: lead, isLoading, isError, error } = useB2BLead(leadId)
  const { data: ownersData } = useOwners()
  const owners = ownersData ?? EMPTY_OWNERS

  const updateLead = useUpdateB2BLead()
  const deleteLead = useDeleteB2BLead()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<EditB2BLeadFormValues>({
    resolver: zodResolver(EditB2BLeadFormSchema),
    defaultValues: {
      partnerName: "",
      type: "Productora",
      stage: "Lead",
      nextAction: "",
      nextActionDate: "",
      user_id: NONE_OWNER,
      contact_name: "",
      contact_phone: "",
      contact_email: "",
    },
  })

  useEffect(() => {
    if (!lead) return

    reset({
      partnerName: lead.partnerName ?? "",
      type: lead.type,
      stage: lead.stage,
      nextAction: lead.nextAction ?? "",
      nextActionDate: lead.nextActionDate ?? "",
      user_id: lead.user_id ?? NONE_OWNER,
      contact_name: lead.contact_name ?? "",
      contact_phone: lead.contact_phone ?? "",
      contact_email: lead.contact_email ?? "",
    })
  }, [lead, reset])

  async function onSubmit(values: EditB2BLeadFormValues) {
    await updateLead.mutateAsync({
      id: leadId,
      input: {
        partnerName: values.partnerName.trim(),
        type: values.type,
        stage: values.stage,
        nextAction: values.nextAction.trim(),
        nextActionDate: values.nextActionDate === "" ? null : values.nextActionDate,
        user_id: values.user_id === NONE_OWNER ? null : values.user_id,
        contact_name: emptyToNull(values.contact_name),
        contact_phone: emptyToNull(values.contact_phone),
        contact_email: emptyToNull(values.contact_email),
      },
    })

    reset(values)
  }

  async function handleDelete() {
    try {
      await deleteLead.mutateAsync(leadId)
      router.push("/ops/b2b")
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Cargando lead…
      </p>
    )
  }

  if (isError || !lead) {
    return (
      <p className="text-center text-sm text-destructive">
        {error instanceof Error ? error.message : "No se encontró el lead."}
      </p>
    )
  }

  return (
    <Card className="border-border/70">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Editar lead</CardTitle>
        <p className="text-sm text-muted-foreground">{lead.partnerName}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="partnerName">Nombre del partner</Label>
            <Input
              id="partnerName"
              {...register("partnerName")}
              placeholder="Ej. Universidad Siglo 21"
            />
            {errors.partnerName && (
              <p className="text-xs text-destructive">
                {errors.partnerName.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {B2B_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Etapa</Label>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {B2B_STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stage && (
                <p className="text-xs text-destructive">
                  {errors.stage.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div className="space-y-2">
              <Label htmlFor="nextAction">Próxima acción</Label>
              <Input
                id="nextAction"
                {...register("nextAction")}
                placeholder="Ej. Coordinar reunión con el partner"
              />
              {errors.nextAction && (
                <p className="text-xs text-destructive">
                  {errors.nextAction.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextActionDate">Fecha próxima acción</Label>
              <Input
                id="nextActionDate"
                type="date"
                {...register("nextActionDate")}
              />
              {errors.nextActionDate && (
                <p className="text-xs text-destructive">
                  {errors.nextActionDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Responsable</Label>
            <Controller
              name="user_id"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? NONE_OWNER}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar responsable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_OWNER}>Sin asignar</SelectItem>
                    {owners.map((owner) => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.user_id && (
              <p className="text-xs text-destructive">
                {errors.user_id.message}
              </p>
            )}
          </div>

          <div className="space-y-4 border-t border-border pt-5">
            <div>
              <p className="text-sm font-medium">Contacto</p>
              <p className="text-xs text-muted-foreground">
                Datos opcionales de la persona vinculada al lead.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contact_name">Nombre</Label>
                <Input
                  id="contact_name"
                  {...register("contact_name")}
                  placeholder="Nombre del contacto"
                />
                {errors.contact_name && (
                  <p className="text-xs text-destructive">
                    {errors.contact_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Teléfono</Label>
                <Input
                  id="contact_phone"
                  {...register("contact_phone")}
                  placeholder="+54 9 ..."
                />
                {errors.contact_phone && (
                  <p className="text-xs text-destructive">
                    {errors.contact_phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  {...register("contact_email")}
                  placeholder="mail@empresa.com"
                />
                {errors.contact_email && (
                  <p className="text-xs text-destructive">
                    {errors.contact_email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-5">
            <Button
              type="submit"
              disabled={
                isSubmitting || updateLead.isPending || deleteLead.isPending || !isDirty
              }
            >
              {updateLead.isPending ? "Guardando…" : "Guardar cambios"}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-red-500 text-white hover:bg-red-600"
                  disabled={deleteLead.isPending || updateLead.isPending}
                >
                  Eliminar lead
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar este lead?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borrará de forma permanente. Las tareas vinculadas pueden
                    quedar sin lead.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    type="button"
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => void handleDelete()}
                  >
                    {deleteLead.isPending ? "Eliminando…" : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}