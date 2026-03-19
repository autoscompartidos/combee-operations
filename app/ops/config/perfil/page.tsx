"use client"

import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { CombeeUserColorPalette, UpdateUserProfileSchema } from "@/lib/schemas/users"
import { useCurrentUserProfile, useUpdateCurrentUserProfileMutation } from "@/lib/ops/users/users.queries"

const FormSchema = UpdateUserProfileSchema
type FormValues = z.infer<typeof FormSchema>

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return "No se pudo guardar el perfil."
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="size-4 rounded-full border border-border"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm">{label}</span>
    </span>
  )
}

function ColorLabel(color: string) {
  // Nombres cortos para UX.
  switch (color) {
    case "#78D2F0":
      return "Azul";
    case "#0F3C41":
      return "Teal";
    case "#E6CD37":
      return "Amarillo";
    case "#327364":
      return "Verde";
    case "#DCFAB9":
      return "Menta";
    case "#69B9CD":
      return "Celeste";
    default:
      return color
  }
}

export default function PerfilPage() {
  const profileQuery = useCurrentUserProfile()
  const updateMutation = useUpdateCurrentUserProfileMutation()

  const initialDefaults = useMemo<FormValues>(
    () => ({
      name: "",
      color: CombeeUserColorPalette[0],
    }),
    [],
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialDefaults,
  })

  useEffect(() => {
    const p = profileQuery.data
    if (!p) return
    form.reset({
      name: p.name ?? "",
      color: (p.color ?? CombeeUserColorPalette[0]) as FormValues["color"],
    })
  }, [profileQuery.data, form])

  async function onSubmit(values: FormValues) {
    await updateMutation.mutateAsync({ name: values.name, color: values.color })
  }

  const selectedColor = form.watch("color")

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <div
          className="size-8 rounded-lg border border-border"
          style={{ backgroundColor: selectedColor }}
          aria-hidden
        />
        <h1 className="text-lg font-semibold text-foreground">Perfil</h1>
      </div>

      {(profileQuery.isLoading || !profileQuery.data) && (
        <p className="text-xs text-muted-foreground">Cargando perfil...</p>
      )}

      {profileQuery.error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Ocurrió un problema cargando tu perfil.</AlertDescription>
        </Alert>
      )}

      {profileQuery.data && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Editar información</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {updateMutation.isSuccess && (
              <Alert>
                <AlertTitle>Guardado</AlertTitle>
                <AlertDescription>Tu perfil se actualizó correctamente.</AlertDescription>
              </Alert>
            )}

            {updateMutation.isError && (
              <Alert variant="destructive">
                <AlertTitle>Error al guardar</AlertTitle>
                <AlertDescription>{getErrorMessage(updateMutation.error)}</AlertDescription>
              </Alert>
            )}

            <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileQuery.data.email ?? ""} disabled />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => <Input id="name" {...field} />}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Color</Label>

                <Controller
                  name="color"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar color" />
                      </SelectTrigger>
                      <SelectContent>
                        {CombeeUserColorPalette.map((c) => (
                          <SelectItem key={c} value={c}>
                            <Swatch color={c} label={ColorLabel(c)} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.color && (
                  <p className="text-xs text-destructive">{form.formState.errors.color.message}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

