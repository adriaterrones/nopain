import { createServerClient } from "@supabase/ssr"
import { type NextRequest, type NextResponse } from "next/server"

export function createClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            res.cookies.set({
              name,
              value,
              ...options,
            })
          } catch {
            // En entornos Edge, puede no ser compatible, por eso hacemos un fallback
          }
        },
        remove(name: string, options: any) {
          try {
            res.cookies.set({
              name,
              value: "",
              ...options,
            })
          } catch {}
        },
      },
    }
  )
}
