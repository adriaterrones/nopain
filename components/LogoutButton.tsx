"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sesión cerrada",
        description: "Has salido correctamente de tu cuenta.",
      })
      router.push("/") // Te redirige al inicio
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
    >
      Cerrar sesión
    </Button>
  )
}
