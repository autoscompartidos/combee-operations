import { redirect } from "next/navigation"

import { getAuthUser } from "@/lib/auth/get-auth-user"
import { LoginForm } from "../../components/auth/login-form"

export default async function LoginPage() {
  const user = await getAuthUser()
  if (user) redirect("/ops")

  return <LoginForm />
}

