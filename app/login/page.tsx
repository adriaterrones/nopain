"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"paciente" | "clinica">("paciente")
  const [loading, setLoading] = useState(false)

  // 🧩 Registro de usuario nuevo
  async function handleSignUp() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      // Crear perfil con rol en la tabla profiles
      if (data.user) {
        await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: email.split("@")[0],
            role,
          },
        ])
      }

      toast({
        title: "✅ Cuenta creada",
        description: "Revisa tu correo para verificar tu cuenta.",
      })
    } catch (err: any) {
      toast({
        title: "❌ Error al registrarte",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 🧩 Inicio de sesión con redirección por rol
  async function handleLogin() {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Obtener el perfil y el rol del usuario
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user?.id)
        .single()

      if (profileError) throw profileError

      const userRole = profileData?.role || "paciente"

      toast({
        title: "✅ Sesión iniciada",
        description: `Bienvenido de nuevo (${userRole}).`,
      })

      // Redirigir según rol
      if (userRole === "clinica") {
        window.location.href = "/clinic-panel"
      } else {
        window.location.href = "/clinics"
      }
    } catch (err: any) {
      toast({
        title: "❌ Error al iniciar sesión",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Acceso a NoPain</h1>

      <div className="space-y-3">
        <Input
          placeholder="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Selección del rol */}
        <div className="flex gap-3 justify-center mt-2">
          <Button
            type="button"
            variant={role === "paciente" ? "default" : "outline"}
            onClick={() => setRole("paciente")}
          >
            Paciente
          </Button>
          <Button
            type="button"
            variant={role === "clinica" ? "default" : "outline"}
            onClick={() => setRole("clinica")}
          >
            Clínica
          </Button>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-2 mt-6">
          <Button onClick={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Iniciar sesión"}
          </Button>
          <Button onClick={handleSignUp} variant="secondary" disabled={loading}>
            {loading ? "Creando..." : "Crear cuenta"}
          </Button>
        </div>
      </div>
    </div>
  )
}
