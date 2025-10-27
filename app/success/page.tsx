"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  const params = useSearchParams()
  const sessionId = params.get("session_id")
  const supabase = createClient()

  useEffect(() => {
    async function saveReservation() {
      if (!sessionId) return

      // Recuperar metadata de Stripe
      const res = await fetch(`/api/stripe-session?session_id=${sessionId}`)
      const session = await res.json()

      if (session.metadata) {
        const { clinic_id, user_name, date, time } = session.metadata
        await supabase.from("reservas").insert([
          {
            clinic_id,
            user_name,
            date,
            time,
          },
        ])
      }
    }
    saveReservation()
  }, [sessionId])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500" />
      <h1 className="text-3xl font-bold">¡Pago completado!</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Tu reserva ha sido confirmada y registrada correctamente.
      </p>
      <Button onClick={() => (window.location.href = "/clinics")}>
        Volver a clínicas
      </Button>
    </div>
  )
}
