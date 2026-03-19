import type { Owner, CreateOwnerInput, UpdateOwnerInput } from "@/lib/types/ops"

const BASE = "/api/ops/owners"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchOwners(): Promise<Owner[]> {
  return handleResponse<Owner[]>(await fetch(BASE))
}

export async function fetchOwner(id: string): Promise<Owner> {
  return handleResponse<Owner>(await fetch(`${BASE}/${id}`))
}

export async function createOwner(input: CreateOwnerInput): Promise<Owner> {
  return handleResponse<Owner>(
    await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function updateOwner(id: string, input: UpdateOwnerInput): Promise<Owner> {
  return handleResponse<Owner>(
    await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

export async function deleteOwner(id: string): Promise<void> {
  return handleResponse<void>(await fetch(`${BASE}/${id}`, { method: "DELETE" }))
}
