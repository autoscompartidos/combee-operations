"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useOwners } from "@/lib/ops/owners/owners.queries";
import { useCreateTask } from "@/lib/ops/tasks/tasks.queries";
import { useCreateCampaign } from "@/lib/ops/campaigns/campaigns.queries";
import { useCreateB2BLead } from "@/lib/ops/b2b-leads/b2b-leads.queries";
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
      ownerId: null,
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
                name="ownerId"
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
      ownerId: null,
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
                name="ownerId"
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
