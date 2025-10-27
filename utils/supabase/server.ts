import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = cookieStore.get?.(name)
          return cookie?.value
        },
        set() {
          // Los setters no son necesarios en layout/server components
        },
        remove() {
          // Tampoco necesarios aquí
        },
      },
    }
  )
}
