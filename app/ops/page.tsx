"use client"

import { useState, useCallback } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { OpsHeader } from "@/components/ops/ops-header"
import { AlertsStrip } from "@/components/ops/alerts-strip"
import { SemanaActual } from "@/components/ops/semana-actual"
import { CampaniasSection } from "@/components/ops/campanias-section"
import { B2BPipeline } from "@/components/ops/b2b-pipeline"
import { TareasSection } from "@/components/ops/tareas-section"
import {
  CreateTaskDialog,
  CreateCampaignDialog,
  CreateLeadDialog,
} from "@/components/ops/create-dialogs"

const WEEKS = [
  "10 Mar – 16 Mar 2025",
  "17 Mar – 23 Mar 2025",
  "24 Mar – 30 Mar 2025",
  "31 Mar – 6 Abr 2025",
]

export default function OpsPage() {
  const [weekIndex, setWeekIndex] = useState(1)
  const [taskOpen, setTaskOpen] = useState(false)
  const [campaignOpen, setCampaignOpen] = useState(false)
  const [leadOpen, setLeadOpen] = useState(false)

  const handlePrev = useCallback(
    () => setWeekIndex((i) => Math.max(0, i - 1)),
    []
  )
  const handleNext = useCallback(
    () => setWeekIndex((i) => Math.min(WEEKS.length - 1, i + 1)),
    []
  )

  return (
    <>
      <OpsHeader
        weekLabel={WEEKS[weekIndex]}
        onPrev={handlePrev}
        onNext={handleNext}
        onCreateTask={() => setTaskOpen(true)}
        onCreateCampaign={() => setCampaignOpen(true)}
        onCreateLead={() => setLeadOpen(true)}
      />
      <AlertsStrip />

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {/* Section 1: Weekly overview */}
          <SemanaActual />

          {/* Section 2: Campaigns calendar */}
          <CampaniasSection />

          {/* Section 3: B2B Pipeline + Agenda */}
          <B2BPipeline />

          {/* Section 4: Tasks with filters + calendar */}
          <TareasSection
            onCreateTask={() => setTaskOpen(true)}
            onCreateCampaign={() => setCampaignOpen(true)}
            onCreateLead={() => setLeadOpen(true)}
          />
        </div>
      </ScrollArea>

      {/* Create dialogs */}
      <CreateTaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <CreateCampaignDialog open={campaignOpen} onOpenChange={setCampaignOpen} />
      <CreateLeadDialog open={leadOpen} onOpenChange={setLeadOpen} />
    </>
  )
}
