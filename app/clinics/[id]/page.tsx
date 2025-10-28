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
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

type Reserva = {
  id: string
  created_at: string
  user_name: string
  date: string            // YYYY-MM-DD
  clinic_id: string
  user_email: string | null
  user_id: string | null
  time: string            // "HH:MM"
}

export default function ClinicDetailPage() {
  const supabase = createClient()
  const { id } = useParams() as { id: string }
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Horarios disponibles
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "16:00", "16:30", "17:00", "17:30",
  ]

  // Cargar todas las reservas de la clínica
  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("clinic_id", id)
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.error("Error cargando reservas:", error.message)
      setReservas([])
      return
    }
    setReservas((data ?? []) as Reserva[])
  }

  // Cargar horas ocupadas del día seleccionado
  const fetchBookedTimes = async () => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("reservas")
      .select("time")
      .eq("clinic_id", id)
      .eq("date", dateStr)

    if (error) {
      console.error("Error cargando horas ocupadas:", error.message)
      setBookedTimes([])
      return
    }
    const booked = (data ?? []).map((r: { time: string }) => r.time)
    setBookedTimes(booked)
  }

  useEffect(() => {
    if (id) fetchReservas()
  }, [id])

  useEffect(() => {
    if (selectedDate) fetchBookedTimes()
  }, [selectedDate])

  // Guardar reserva en Supabase (sin auth por ahora)
  const handleReserve = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "⚠️ Selecciona fecha y hora",
        description: "Por favor, elige un día y una hora disponibles.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const dateStr = selectedDate.toISOString().split("T")[0]
    const clinicIdNumber = Number(id)

    // 🧩 Bloque de depuración con logs detallados
    const { data, error } = await supabase.from("reservas").insert([
      {
        clinic_id: isNaN(clinicIdNumber) ? id : clinicIdNumber,
        user_name: "Paciente de prueba",
        date: dateStr,
        time: selectedTime,
        user_email: null,
        user_id: null,
      },
    ])

    console.log("📦 Data insert:", data)
    console.log("❗ Error detail:", error)

    if (error) {
      console.error("Error al guardar reserva:", error)
      toast({
        title: "❌ Error al guardar",
        description: error.message || "No se pudo guardar la reserva. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Reserva confirmada",
        description: `Reserva creada para el ${dateStr} a las ${selectedTime}.`,
      })
      setOpen(false)
      setSelectedDate(undefined)
      setSelectedTime("")
      await fetchReservas()
      await fetchBookedTimes()
    }

    setLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Cabecera */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Clínica {id}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bienvenido a la ficha de la clínica. Aquí podrás reservar tu próxima sesión de fisioterapia.
        </p>
      </section>

      {/* Imagen / Galería */}
      <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-12 flex items-center justify-center">
        <p className="text-gray-500">[Imagen o galería de la clínica]</p>
      </div>

      {/* Botón de reserva */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="mx-auto block px-6 py-2 text-lg">
            Reservar sesión
          </Button>
        </DialogTrigger>

        {/* Modal de reserva */}
        <DialogContent className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-semibold mb-4">
              Selecciona fecha y hora
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Selector de día */}
            <div>
              <Label>Selecciona un día</Label>
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                className="mt-2 border rounded-lg p-2"
              />
            </div>

            {/* Selector de hora */}
            {selectedDate && (
              <div>
                <Label>Selecciona hora</Label>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {timeSlots.map((t) => (
                    <Button
                      key={t}
                      variant={t === selectedTime ? "default" : "outline"}
                      onClick={() => setSelectedTime(t)}
                      disabled={bookedTimes.includes(t)}
                    >
                      {t}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de reserva */}
            <Button
              className="w-full mt-4"
              disabled={!selectedDate || !selectedTime || loading}
              onClick={handleReserve}
            >
              {loading ? "Guardando..." : "Confirmar reserva"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listado de reservas existentes */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Reservas confirmadas
        </h2>

        {reservas.length === 0 ? (
          <p className="text-gray-500 text-center">Todavía no hay reservas.</p>
        ) : (
          <div className="overflow-hidden border rounded-xl dark:border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Hora</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-3">{r.user_name}</td>
                    <td className="p-3">
                      {new Date(r.date).toLocaleDateString("es-ES")}
                    </td>
                    <td className="p-3">{r.time}</td>
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
