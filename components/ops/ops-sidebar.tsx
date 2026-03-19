"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Megaphone,
  Handshake,
  ListChecks,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LogoutButton } from "@/components/auth/logout-button"
import { useAuth } from "@/hooks/use-auth"

const navItems = [
  { label: "Ops", href: "/ops", icon: LayoutDashboard },
  { label: "Campañas", href: "/ops/campanias", icon: Megaphone },
  { label: "B2B", href: "/ops/b2b", icon: Handshake },
  { label: "Tareas", href: "/ops/tareas", icon: ListChecks },
  { label: "Configuración", href: "/ops/config", icon: Settings },
]

export function OpsSidebar() {
  const pathname = usePathname()
  const { data: profile, isLoading } = useAuth()

  const displayName = profile?.name ?? profile?.email ?? "Usuario"
  const initials = useMemo(() => {
    const src = displayName.trim()
    if (!src) return "U"
    const parts = src.split(/\s+/).filter(Boolean)
    const first = parts[0]?.[0] ?? "U"
    const second = parts[1]?.[0] ?? ""
    return (first + second).toUpperCase()
  }, [displayName])

  const avatarBg = profile?.color ?? "#78D2F0"

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Image src="/combee_logo.svg" alt="Combee" width={160} height={160} />
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/ops"
              ? pathname === "/ops"
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 rounded-md px-3 py-2">
          <div className="flex items-center gap-2">
            <div
              className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ backgroundColor: avatarBg }}
            >
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-sidebar-foreground">
                {isLoading ? "..." : displayName}
              </span>
              <span className="text-[10px] text-muted-foreground">Operaciones</span>
            </div>
          </div>

          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
