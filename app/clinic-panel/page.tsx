"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ClinicPanelPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Cargar reservas desde Supabase
  const fetchReservas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reservas")
      .select("id, user_name, date, created_at, clinic_id")
      .order("date", { ascending: true })

    if (error) {
      console.error("Error cargando reservas:", error.message)
      toast({
        title: "❌ Error al cargar reservas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservas(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  // ✅ Eliminar reserva (opcional)
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reservas").delete().eq("id", id)
    if (error) {
      toast({
        title: "❌ Error al eliminar reserva",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "🗑️ Reserva eliminada",
        description: "La reserva se ha eliminado correctamente.",
      })
      setReservas((prev) => prev.filter((r) => r.id !== id))
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Panel de gestión de reservas
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p className="text-center text-gray-500">
          Todavía no hay reservas registradas.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map((reserva) => (
            <Card
              key={reserva.id}
              className="shadow-md border border-gray-200 dark:border-gray-700"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {reserva.user_name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(reserva.date).toLocaleString("es-ES")}
                </p>
                <p>
                  <strong>Creada el:</strong>{" "}
                  {new Date(reserva.created_at).toLocaleDateString("es-ES")}
                </p>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(reserva.id)}
                >
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
