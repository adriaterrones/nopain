"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

export default function MyBookingsPage() {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const [bookings, setBookings] = useState<any[]>([])
  const [clinics, setClinics] = useState<any[]>([])
  const [physios, setPhysios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // 🧠 Obtener usuario autenticado
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
      }
    }
    fetchUser()
  }, [router, supabase])

  // 🔹 Cargar datos del usuario autenticado
  useEffect(() => {
    const fetchAll = async () => {
      if (!user) return

      try {
        // 1️⃣ Reservas del usuario logueado
        const { data: reservas, error: reservasError } = await supabase
          .from("reservas")
          .select(
            "id, date, time, ends_at, status, clinic_id, physio_id, user_name"
          )
          .eq("user_id", user.id)
          .order("date", { ascending: true })

        if (reservasError) throw reservasError

        // 2️⃣ Clínicas
        const { data: clinicsData, error: clinicsError } = await supabase
          .from("clinics")
          .select("id, name, location")
        if (clinicsError) throw clinicsError

        // 3️⃣ Fisios
        const { data: physioData, error: physioError } = await supabase
          .from("physiotherapists")
          .select("id, name, clinic_id")
        if (physioError) throw physioError

        // 4️⃣ Combinar datos manualmente
        const fullData = reservas.map((r) => ({
          ...r,
          clinic: clinicsData?.find((c) => c.id === r.clinic_id),
          physio: physioData?.find((p) => p.id === r.physio_id),
        }))

        setBookings(fullData)
        setClinics(clinicsData)
        setPhysios(physioData)
      } catch (err) {
        console.error("Error al obtener reservas:", err)
        toast({
          title: "Error",
          description: "No se pudieron cargar tus reservas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [user])

  // 🔹 Cancelar reserva
  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ status: "cancelled" })
      .eq("id", id)

    if (error) {
      toast({ title: "Error", description: "No se pudo cancelar la cita." })
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      )
      toast({
        title: "Cita cancelada",
        description: "Tu reserva ha sido anulada correctamente.",
      })
    }
  }

  // 🔹 Color por estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300"
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300"
      default:
        return "bg-gray-100 text-gray-600 border-gray-300"
    }
  }

  if (loading) {
    return <p className="text-center mt-10">Cargando tus reservas...</p>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            🗓️ Mis reservas
          </CardTitle>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {bookings.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-muted-foreground mt-10"
          >
            No tienes reservas activas.
          </motion.p>
        ) : (
          bookings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`border-l-4 ${
                  b.status === "pending"
                    ? "border-yellow-400"
                    : b.status === "confirmed"
                    ? "border-green-500"
                    : b.status === "cancelled"
                    ? "border-red-500"
                    : "border-blue-500"
                }`}
              >
                <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {b.clinic?.name || "Clínica"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      📍 {b.clinic?.location || "Ubicación desconocida"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      b.status
                    )}`}
                  >
                    {b.status.toUpperCase()}
                  </span>
                </CardHeader>

                <CardContent className="space-y-2">
                  <p>
                    <strong>Fisioterapeuta:</strong>{" "}
                    {b.physio?.name || "—"}
                  </p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {new Date(b.date).toLocaleDateString("es-ES")}
                  </p>
                  <p>
                    <strong>Hora:</strong> {b.time}{" "}
                    {b.ends_at
                      ? `— ${new Date(b.ends_at).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </p>

                  {(b.status === "pending" || b.status === "confirmed") && (
                    <Button
                      onClick={() => handleCancel(b.id)}
                      variant="outline"
                      className="mt-3 w-full sm:w-auto border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                    >
                      Cancelar cita
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
