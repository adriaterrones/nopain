"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Physiotherapist {
  id: string
  name: string
}

interface Reserva {
  id: string
  user_name: string
  date: string
  created_at: string
  clinic_id: string
  status?: string
  physiotherapists?: Physiotherapist | null
}

export default function ClinicPanelPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Cargar reservas con el nombre del fisioterapeuta
  const fetchReservas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reservas")
      .select(`
        id,
        user_name,
        date,
        created_at,
        clinic_id,
        status,
        physiotherapists (
          id,
          name
        )
      `)
      .order("date", { ascending: true })

    if (error) {
      console.error("Error cargando reservas:", error.message)
      toast({
        title: "❌ Error al cargar reservas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservas(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReservas()
  }, [])

  // ✅ Eliminar reserva
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

  // ✅ Cambiar estado de la reserva
  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      toast({
        title: "❌ Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      )
      toast({
        title: "✅ Estado actualizado",
        description: `La reserva ha sido marcada como "${newStatus}".`,
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(reserva.date).toLocaleString("es-ES")}
                </p>
                <p>
                  <strong>Creada el:</strong>{" "}
                  {new Date(reserva.created_at).toLocaleDateString("es-ES")}
                </p>
                <p>
                  <strong>Fisioterapeuta:</strong>{" "}
                  {reserva.physiotherapists?.name || "No asignado"}
                </p>
                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      reserva.status === "aceptada"
                        ? "bg-green-200 text-green-800"
                        : reserva.status === "cancelada"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {reserva.status || "pendiente"}
                  </span>
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(reserva.id, "aceptada")}
                  >
                    Aceptar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(reserva.id, "cancelada")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(reserva.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
