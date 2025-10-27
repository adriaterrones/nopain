import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createClient(req, res)

  // Obtener usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname

  // ✅ Rutas protegidas (solo con sesión)
  const protectedRoutes = ["/clinics", "/clinic-panel"]

  // Si no hay sesión y quiere acceder a una ruta protegida → redirigir a login
  if (!user && protectedRoutes.some((path) => pathname.startsWith(path))) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/login"
    return NextResponse.redirect(redirectUrl)
  }

  // Si hay sesión, obtener rol del usuario
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role || "paciente"

    // 🚫 Bloquear acceso de pacientes al panel de clínicas
    if (pathname.startsWith("/clinic-panel") && role !== "clinica") {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/clinics"
      return NextResponse.redirect(redirectUrl)
    }

    // 🚫 (Opcional) Bloquear acceso de clínicas al área pública si lo prefieres
    // if (pathname.startsWith("/clinics") && role === "clinica") {
    //   const redirectUrl = req.nextUrl.clone()
    //   redirectUrl.pathname = "/clinic-panel"
    //   return NextResponse.redirect(redirectUrl)
    // }
  }

  return res
}

// Indica a Next.js en qué rutas debe ejecutarse el middleware
export const config = {
  matcher: ["/clinics/:path*", "/clinic-panel/:path*"],
}
