import type { UserProfile } from "@/lib/types/users"

const BASE = "/api/ops/users/me"

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export type UpdateUserProfileInput = {
  name: string
  color: string
}

export async function fetchCurrentUserProfile(): Promise<UserProfile> {
  return handleResponse<UserProfile>(await fetch(BASE))
}

export async function updateCurrentUserProfile(input: UpdateUserProfileInput) {
  return handleResponse<UserProfile>(
    await fetch(BASE, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )
}

