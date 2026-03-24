"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskStatus } from "@/lib/types/ops";
import { useOwners } from "@/lib/ops/owners/owners.queries";
import {
  useCreateTask,
  useDeleteTask,
  useTask,
  useUpdateTask,
} from "@/lib/ops/tasks/tasks.queries";
import { useCampaigns, useCreateCampaign } from "@/lib/ops/campaigns/campaigns.queries";
import { useB2BLeads, useCreateB2BLead } from "@/lib/ops/b2b-leads/b2b-leads.queries";
import {
  CreateTaskSchema,
  CreateCampaignSchema,
  CreateB2BLeadSchema,
} from "@/lib/schemas/ops";

type DialogProps = { open: boolean; onOpenChange: (open: boolean) => void };

// ===== Nueva Tarea =====

type CreateTaskForm = z.infer<typeof CreateTaskSchema>;

export function CreateTaskDialog({ open, onOpenChange }: DialogProps) {
  const { data: owners = [] } = useOwners();
  const createTask = useCreateTask();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      status: "pendiente",
      user_id: undefined,
      campaignId: null,
      b2bLeadId: null,
      timeSlot: null,
    },
  });

  async function onSubmit(values: CreateTaskForm) {
    await createTask.mutateAsync(values);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva tarea</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Título</Label>
            <Input
              id="task-title"
              placeholder="Ej: Diseñar piezas para IG"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Área</Label>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Orgánico">Orgánico</SelectItem>
                      <SelectItem value="B2B">B2B</SelectItem>
                      <SelectItem value="Activación">Activación</SelectItem>
                      <SelectItem value="Difusión">Difusión</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.area && (
                <p className="text-xs text-destructive">
                  {errors.area.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Responsable</Label>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-notes">Notas</Label>
            <Textarea
              id="task-notes"
              placeholder="Agregá detalles, contexto o aclaraciones de la tarea"
              rows={4}
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-due">Fecha límite</Label>
            <Input id="task-due" type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-xs text-destructive">
                {errors.dueDate.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createTask.isPending}
            >
              {createTask.isPending ? "Creando..." : "Crear tarea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== Editar Tarea =====

// ===== Editar Tarea =====

type EditTaskForm = z.infer<typeof CreateTaskSchema>;

const UNASSIGNED = "__unassigned__";
const NONE_CAMPAIGN = "__none_campaign__";
const NONE_B2B = "__none_b2b__";

const TASK_STATUSES: TaskStatus[] = [
  "pendiente",
  "en progreso",
  "bloqueada",
  "completada",
];

export function EditTaskDialog({
  taskId,
  onOpenChange,
}: {
  taskId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = taskId !== null;
  const { data: task, isLoading, isError, error } = useTask(taskId);
  const { data: owners = [] } = useOwners();
  const { data: campaigns = [] } = useCampaigns();
  const { data: b2bLeads = [] } = useB2BLeads();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskForm>({
    resolver: zodResolver(CreateTaskSchema),
  });

  useEffect(() => {
    if (!task) return;
    reset({
      title: task.title,
      area: task.area,
      status: task.status,
      user_id: task.user_id,
      notes: task.notes ?? "",
      dueDate: task.dueDate,
      campaignId: task.campaignId,
      b2bLeadId: task.b2bLeadId,
      timeSlot: task.timeSlot,
    });
  }, [task, reset]);

  const watchedUserId = watch("user_id");
  const displayOwner = owners.find((o) => o.id === watchedUserId);

  async function onSubmit(values: EditTaskForm) {
    if (!taskId) return;
    setSaveError(null);
    const input = {
      ...values,
      notes: values.notes === "" ? null : values.notes,
    };
    try {
      await updateTask.mutateAsync({ id: taskId, input });
      onOpenChange(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "No se pudo guardar");
    }
  }

  async function onDeleteTask() {
    if (!taskId) return;
    setSaveError(null);
    setConfirmDeleteOpen(false);
    try {
      await deleteTask.mutateAsync(taskId);
      onOpenChange(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "No se pudo eliminar");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setSaveError(null);
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-3 border-b border-border pb-4">
          <DialogTitle className="sr-only">Editar tarea</DialogTitle>
          {isLoading && (
            <DialogTitle className="line-clamp-2 pr-6">Cargando…</DialogTitle>
          )}
          {isError && (
            <DialogTitle className="line-clamp-2 pr-6">No se pudo cargar</DialogTitle>
          )}
          {!isLoading && !isError && task && (
            <>
              <DialogTitle
                asChild
                className="field-sizing-content min-h-[3rem] w-full max-w-full resize-none border-0 bg-transparent p-0 pr-6 text-left text-lg leading-tight font-semibold shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <textarea id="edit-task-title" rows={2} {...register("title")} />
              </DialogTitle>
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </>
          )}
        </DialogHeader>

        {isLoading && (
          <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
        )}
        {isError && (
          <p className="py-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "No se pudo cargar la tarea"}
          </p>
        )}

        {!isLoading && !isError && task && (
          <>
            {displayOwner ? (
              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
                <div
                  className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${
                    displayOwner.color?.startsWith("#") ? "" : displayOwner.color
                  }`}
                  style={
                    displayOwner.color?.startsWith("#")
                      ? { backgroundColor: displayOwner.color }
                      : undefined
                  }
                >
                  {displayOwner.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Responsable</p>
                  <p className="truncate text-sm font-semibold">{displayOwner.name}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                Sin responsable asignado. Podés elegir uno más abajo.
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-4">
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Datos principales
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label>Área</Label>
                  <Controller
                    name="area"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Área" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Orgánico">Orgánico</SelectItem>
                          <SelectItem value="B2B">B2B</SelectItem>
                          <SelectItem value="Activación">Activación</SelectItem>
                          <SelectItem value="Difusión">Difusión</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.area && (
                    <p className="text-xs text-destructive">{errors.area.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Estado</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-xs text-destructive">{errors.status.message}</p>
                  )}
                </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Asignación y notas
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label>Responsable</Label>
                    <Controller
                      name="user_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? UNASSIGNED}
                          onValueChange={(v) =>
                            field.onChange(v === UNASSIGNED ? null : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Responsable" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={UNASSIGNED}>Sin asignar</SelectItem>
                            {owners.map((o) => (
                              <SelectItem key={o.id} value={o.id}>
                                {o.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-task-notes">Notas</Label>
                    <Textarea id="edit-task-notes" rows={4} {...register("notes")} />
                    {errors.notes && (
                      <p className="text-xs text-destructive">{errors.notes.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Fechas y vínculos
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-task-due">Fecha límite</Label>
                    <Input id="edit-task-due" type="date" {...register("dueDate")} />
                    {errors.dueDate && (
                      <p className="text-xs text-destructive">{errors.dueDate.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-task-time">Horario (opcional)</Label>
                    <Input
                      id="edit-task-time"
                      type="time"
                      {...register("timeSlot", {
                        setValueAs: (v) => (v === "" || v == null ? null : v),
                      })}
                    />
                    {errors.timeSlot && (
                      <p className="text-xs text-destructive">{errors.timeSlot.message}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Campaña vinculada</Label>
                    <Controller
                      name="campaignId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? NONE_CAMPAIGN}
                          onValueChange={(v) =>
                            field.onChange(v === NONE_CAMPAIGN ? null : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguna" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_CAMPAIGN}>Ninguna</SelectItem>
                            {campaigns.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Lead B2B vinculado</Label>
                    <Controller
                      name="b2bLeadId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? NONE_B2B}
                          onValueChange={(v) =>
                            field.onChange(v === NONE_B2B ? null : v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguno" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={NONE_B2B}>Ninguno</SelectItem>
                            {b2bLeads.map((l) => (
                              <SelectItem key={l.id} value={l.id}>
                                {l.partnerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-destructive">{saveError}</p>
              )}

              <DialogFooter className="flex items-center justify-between gap-2 border-t border-border pt-4 sm:justify-between">
                <AlertDialog
                  open={confirmDeleteOpen}
                  onOpenChange={setConfirmDeleteOpen}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={
                        isSubmitting || updateTask.isPending || deleteTask.isPending
                      }
                      size="icon"
                      aria-label="Eliminar tarea"
                      className="bg-red-300 hover:bg-red-600"
                      title="Eliminar tarea"
                    >
                      <Trash2
                        className={`size-4 ${
                          deleteTask.isPending ? "animate-pulse" : ""
                        }`}
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Eliminar esta tarea?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteTask.isPending}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onDeleteTask}
                        disabled={deleteTask.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteTask.isPending ? "Eliminando..." : "Eliminar"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={deleteTask.isPending}
                  >
                    Cerrar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || updateTask.isPending || deleteTask.isPending}
                  >
                    {updateTask.isPending ? "Guardando…" : "Guardar cambios"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Nueva Campaña =====

type CreateCampaignForm = z.infer<typeof CreateCampaignSchema>;

export function CreateCampaignDialog({ open, onOpenChange }: DialogProps) {
  const { data: owners = [] } = useOwners();
  const createCampaign = useCreateCampaign();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCampaignForm>({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: {
      status: "planificada",
      priority: "media",
      color: "bg-secondary",
      user_id: null,
    },
  });

  async function onSubmit(values: CreateCampaignForm) {
    await createCampaign.mutateAsync(values);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva campaña</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="camp-name">Nombre</Label>
            <Input
              id="camp-name"
              placeholder="Ej: Lollapalooza 2025"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-start">Inicio</Label>
              <Input id="camp-start" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="camp-end">Fin</Label>
              <Input id="camp-end" type="date" {...register("endDate")} />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Responsable</Label>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Prioridad</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createCampaign.isPending}
            >
              {createCampaign.isPending ? "Creando..." : "Crear campaña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== Nuevo Lead B2B =====

type CreateB2BLeadForm = z.infer<typeof CreateB2BLeadSchema>;

export function CreateLeadDialog({ open, onOpenChange }: DialogProps) {
  const { data: owners = [] } = useOwners();
  const createLead = useCreateB2BLead();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateB2BLeadForm>({
    resolver: zodResolver(CreateB2BLeadSchema),
    defaultValues: {
      stage: "Lead",
      nextAction: "",
      nextActionDate: null,
      user_id: null,
    },
  });

  async function onSubmit(values: CreateB2BLeadForm) {
    await createLead.mutateAsync(values);
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo lead B2B</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-name">Nombre del partner</Label>
            <Input
              id="lead-name"
              placeholder="Ej: YPF Zona Sur"
              {...register("partnerName")}
            />
            {errors.partnerName && (
              <p className="text-xs text-destructive">
                {errors.partnerName.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Estación de servicio">
                        Estación de servicio
                      </SelectItem>
                      <SelectItem value="Productora">Productora</SelectItem>
                      <SelectItem value="Hostel">Hostel</SelectItem>
                      <SelectItem value="Residencias">Residencias</SelectItem>
                      <SelectItem value="Universidad">Universidad</SelectItem>
                      <SelectItem value="Centro Estudiantil">
                        Centro Estudiantil
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Responsable</Label>
              <Controller
                name="user_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-action">Próxima acción</Label>
            <Input
              id="lead-action"
              placeholder="Ej: Enviar propuesta"
              {...register("nextAction")}
            />
            {errors.nextAction && (
              <p className="text-xs text-destructive">
                {errors.nextAction.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-action-date">Fecha próxima acción</Label>
            <Input
              id="lead-action-date"
              type="date"
              {...register("nextActionDate")}
              onChange={(e) => {
                const v = e.target.value;
                // react-hook-form needs null not empty string
                void v;
              }}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || createLead.isPending}
            >
              {createLead.isPending ? "Creando..." : "Crear lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
