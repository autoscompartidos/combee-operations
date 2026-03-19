import { OpsSidebar } from "@/components/ops/ops-sidebar"
import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/auth/get-auth-user"

export const metadata = {
  title: "Combee Ops — Dashboard de Operaciones",
  description: "Panel interno de operaciones de Combee Argentina",
}

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect("/login")

  return (
    <div className="flex h-screen">
      <OpsSidebar />
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
