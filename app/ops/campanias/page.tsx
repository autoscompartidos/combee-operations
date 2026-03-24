"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OpsHeader } from "@/components/ops/ops-header"
import { AlertsStrip } from "@/components/ops/alerts-strip"
import { CampaniasSection } from "@/components/ops/campanias-section"
import {
  CreateTaskDialog,
  CreateCampaignDialog,
  CreateLeadDialog,
} from "@/components/ops/create-dialogs"

export default function CampaniasPage() {
  const [taskOpen, setTaskOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)

  return (
    <>
      <OpsHeader
        title="Campañas"
        onCreateTask={() => setTaskOpen(true)}
        onCreateCampaign={() => setCampaignOpen(true)}
        onCreateLead={() => setLeadOpen(true)}
      />
      <AlertsStrip />

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          <CampaniasSection />
        </div>
      </ScrollArea>

      <CreateTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <CreateCampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
      <CreateLeadDialog open={leadOpen} onOpenChange={setLeadOpen} />
    </>
  )
}
