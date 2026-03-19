import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data, error } = await supabase.auth.getUser()
  const isAuthed = !error && !!data.user

  if (!isAuthed) {
    // Para endpoints API protegidos, devolvemos 401 (evita romper fetch en cliente).
    if (url.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ["/ops", "/ops/:path*", "/api/ops/:path*"],
}

