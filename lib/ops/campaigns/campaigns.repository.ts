import type { Campaign, CreateCampaignInput, UpdateCampaignInput } from "@/lib/types/ops"

const BASE = "/api/ops/campaigns"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchCampaigns(): Promise<Campaign[]> {
  return handleResponse<Campaign[]>(await fetch(BASE))
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  return handleResponse<Campaign>(await fetch(`${BASE}/${id}`))
}

export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  return handleResponse<Campaign>(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateCampaign(id: string, input: UpdateCampaignInput): Promise<Campaign> {
  return handleResponse<Campaign>(
    await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteCampaign(id: string): Promise<void> {
  return handleResponse<void>(await fetch(`${BASE}/${id}`, { method: "DELETE" }))
}
