import type { B2BLead, CreateB2BLeadInput, UpdateB2BLeadInput } from "@/lib/types/ops"

const BASE = "/api/ops/b2b-leads"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type FetchB2BLeadsParams = {
  stage?: string
  ownerId?: string
}

export async function fetchB2BLeads(params?: FetchB2BLeadsParams): Promise<B2BLead[]> {
  const qs = new URLSearchParams()
  if (params?.stage) qs.set("stage", params.stage)
  if (params?.ownerId) qs.set("ownerId", params.ownerId)
  const url = qs.size ? `${BASE}?${qs}` : BASE
  return handleResponse<B2BLead[]>(await fetch(url))
}

export async function fetchB2BLead(id: string): Promise<B2BLead> {
  return handleResponse<B2BLead>(await fetch(`${BASE}/${id}`))
}

export async function createB2BLead(input: CreateB2BLeadInput): Promise<B2BLead> {
  return handleResponse<B2BLead>(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateB2BLead(id: string, input: UpdateB2BLeadInput): Promise<B2BLead> {
  return handleResponse<B2BLead>(
    await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteB2BLead(id: string): Promise<void> {
  return handleResponse<void>(await fetch(`${BASE}/${id}`, { method: "DELETE" }))
}
