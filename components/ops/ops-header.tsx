"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus } from "lucide-react"

type OpsHeaderProps = {
  title: string
  onCreateTask: () => void
  onCreateCampaign: () => void
  onCreateLead: () => void
}

export function OpsHeader({
  title,
  onCreateTask,
  onCreateCampaign,
  onCreateLead,
}: OpsHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <h1 className="text-sm font-semibold text-foreground">{title}</h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Crear
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCreateTask}>Nueva tarea</DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateCampaign}>
            Nueva campana
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCreateLead}>
            Nuevo lead B2B
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
