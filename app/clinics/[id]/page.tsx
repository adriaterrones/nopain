"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import ReservationForm from "@/components/ReservationForm"

export default function ClinicDetailPage() {
  const supabase = createClient()
  const { id } = useParams()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [reservas, setReservas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Cargar todas las reservas de la clínica
  const fetchReservas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reservas")
      .select("id, user_name, date, time, status")
      .eq("clinic_id", id)
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
    if (id) fetchReservas()
  }, [id])

  // 🔁 Recargar reservas tras cerrar el modal (por si se creó una nueva)
  const handleModalChange = (value: boolean) => {
    setOpen(value)
    if (!value) fetchReservas()
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Cabecera */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Clínica {id}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bienvenido a la ficha de la clínica. Aquí podrás reservar tu próxima
          sesión de fisioterapia con el profesional que prefieras.
        </p>
      </section>

      {/* Imagen / Galería */}
      <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-12 flex items-center justify-center">
        <p className="text-gray-500">[Imagen o galería de la clínica]</p>
      </div>

      {/* Botón y modal de reserva */}
      <Dialog open={open} onOpenChange={handleModalChange}>
        <DialogTrigger asChild>
          <Button size="lg" className="mx-auto block px-6 py-2 text-lg">
            Reservar sesión
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold mb-4">
              Reserva tu sesión
            </DialogTitle>
          </DialogHeader>

          {/* 🔽 Formulario de reserva */}
          <ReservationForm clinicId={id as string} />
        </DialogContent>
      </Dialog>

      {/* Listado de reservas existentes */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Reservas confirmadas
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Cargando reservas...</p>
        ) : reservas.length === 0 ? (
          <p className="text-center text-gray-500">
            Todavía no hay reservas registradas.
          </p>
        ) : (
          <div className="overflow-hidden border rounded-xl dark:border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-3">{r.user_name || "Paciente"}</td>
                    <td className="p-3">
                      {new Date(r.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="p-3">{r.time}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          r.status === "aceptada"
                            ? "bg-green-200 text-green-800"
                            : r.status === "cancelada"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {r.status || "pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
