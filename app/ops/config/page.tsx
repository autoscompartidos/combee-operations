"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useOwners } from "@/lib/ops/owners/owners.queries"

export default function ConfigPage() {
  const { data: owners = [], isLoading, isError, error } = useOwners()
  const errorMessage = error instanceof Error ? error.message : "No se pudo cargar el equipo"

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-primary" />
        <h1 className="text-lg font-semibold text-foreground">Configuracion</h1>
        <div className="ml-auto">
          <Button asChild variant="outline" size="sm">
            <Link href="/ops/config/perfil">Editar perfil</Link>
          </Button>
        </div>
      </div>

      {/* Team members */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Equipo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {isLoading && (
            <p className="text-xs text-muted-foreground">Cargando equipo...</p>
          )}
          {isError && (
            <p className="text-xs text-destructive">{errorMessage}</p>
          )}
          {owners.map((owner) => {
            const avatarBg = owner.color?.startsWith("#") ? owner.color : undefined
            const avatarClass = avatarBg ? "" : owner.color
            const avatarText =
              owner.avatar && owner.avatar.trim().length > 0
                ? owner.avatar
                : owner.name
                  ? owner.name.trim().slice(0, 1).toUpperCase()
                  : "?"

            return (
              <div
                key={owner.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2"
              >
                <div
                  className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${avatarClass}`}
                  style={avatarBg ? { backgroundColor: avatarBg } : undefined}
                >
                  {avatarText}
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {owner.name}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  Activo
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* General settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">General</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="org-name">Nombre de la organizacion</Label>
            <Input id="org-name" defaultValue="Combee Argentina" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="timezone">Zona horaria</Label>
            <Input id="timezone" defaultValue="America/Buenos_Aires (GMT-3)" disabled />
          </div>
          <Button className="w-fit">Guardar cambios</Button>
        </CardContent>
      </Card>
    </div>
  )
}
