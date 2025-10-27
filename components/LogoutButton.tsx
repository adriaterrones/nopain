"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="text-sm font-medium"
    >
      Cerrar sesión
    </Button>
  )
}
