import type { Owner, Campaign, B2BLead, Task } from "@/lib/types/ops"
import type { UserProfile } from "@/lib/types/users"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function mapOwner(row: Row): Owner {
  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    color: row.color,
    createdAt: row.created_at,
  }
}

export function mapCampaign(row: Row): Campaign {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    ownerId: row.owner_id,
    priority: row.priority,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapB2BLead(row: Row): B2BLead {
  return {
    id: row.id,
    partnerName: row.partner_name,
    type: row.type,
    stage: row.stage,
    nextAction: row.next_action,
    nextActionDate: row.next_action_date,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapTask(row: Row): Task {
  return {
    id: row.id,
    title: row.title,
    area: row.area,
    status: row.status,
    ownerId: row.owner_id,
    dueDate: row.due_date,
    campaignId: row.campaign_id,
    b2bLeadId: row.b2b_lead_id,
    timeSlot: row.time_slot,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapUserProfile(row: Row): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    color: row.color,
    createdAt: row.created_at,
  }
}
