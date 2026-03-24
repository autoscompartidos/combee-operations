"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OpsHeader } from "@/components/ops/ops-header"
import { AlertsStrip } from "@/components/ops/alerts-strip"
import { B2BLeadEditForm } from "@/components/ops/b2b-lead-edit-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"
import {
  CreateTaskDialog,
  CreateCampaignDialog,
  CreateLeadDialog,
} from "@/components/ops/create-dialogs"

export default function B2BLeadDetailPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : ""

  const [taskOpen, setTaskOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)

  return (
    <>
      <OpsHeader
        title="Lead B2B"
        onCreateTask={() => setTaskOpen(true)}
        onCreateCampaign={() => setCampaignOpen(true)}
        onCreateLead={() => setLeadOpen(true)}
      />
      <AlertsStrip />

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-6">
          <Button variant="ghost" size="sm" className="w-fit gap-1 px-0" asChild>
            <Link href="/ops/b2b">
              <ArrowLeft className="size-4" />
              Volver a B2B
            </Link>
          </Button>
          {id ? <B2BLeadEditForm leadId={id} /> : (
            <p className="text-sm text-destructive">ID de lead inválido.</p>
          )}
        </div>
      </ScrollArea>

      <CreateTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <CreateCampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
      <CreateLeadDialog open={leadOpen} onOpenChange={setLeadOpen} />
    </>
  )
}
