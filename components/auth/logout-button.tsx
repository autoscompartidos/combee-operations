"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2 } from "lucide-react"

import { signOutFromDashboard } from "@/lib/auth/sign-out"
import { Button } from "@/components/ui/button"

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onLogout() {
    setIsLoading(true)
    try {
      await signOutFromDashboard()
    } finally {
      setIsLoading(false)
      router.replace("/login")
      router.refresh()
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={className}
      onClick={onLogout}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      <span className="ml-2">{isLoading ? "Saliendo..." : "Salir"}</span>
    </Button>
  )
}

