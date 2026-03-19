"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { signInWithEmailPassword } from "@/lib/auth/sign-in"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const LoginSchema = z.object({
  email: z.string().min(1, "Email requerido").email("Email inválido"),
  password: z.string().min(1, "Password requerida"),
})

type LoginValues = z.infer<typeof LoginSchema>

function toFriendlyAuthError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : null

  const msg = (message ?? "").toLowerCase()

  if (msg.includes("invalid login credentials")) return "Email o password incorrectos."
  if (msg.includes("email") && msg.includes("confirm")) return "Tu email no está confirmado."

  return message ?? "No se pudo iniciar sesión."
}

function getSafeNext(next: string | null) {
  // Evita open-redirect: solo permitimos rutas bajo `/ops`.
  if (!next) return "/ops"
  return next.startsWith("/ops") ? next : "/ops"
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next")

  const safeNext = useMemo(() => getSafeNext(next), [next])

  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginValues) {
    setAuthError(null)
    setIsSubmitting(true)
    try {
      await signInWithEmailPassword(values.email, values.password)
      router.replace(safeNext)
      router.refresh()
    } catch (error: unknown) {
      setAuthError(toFriendlyAuthError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center">
            <Image
              src="/combee_isologo.svg"
              alt="Combee"
              width={64}
              height={64}
              className="h-16 w-16"
              priority
            />
          </div>
        </CardHeader>

        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            {authError && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
                aria-invalid={form.formState.errors.email ? "true" : "false"}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
                aria-invalid={form.formState.errors.password ? "true" : "false"}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Entrando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

