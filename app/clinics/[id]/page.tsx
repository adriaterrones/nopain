"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import ReservationForm from "./ReservationForm" // ✅ nuevo formulario
import { useToast } from "@/components/ui/use-toast"

type Reserva = {
  id: string
  created_at: string
  user_name: string
  date: string
  clinic_id: string
  user_email: string | null
  user_id: string | null
  time: string
  physio_id?: string | null
}

export default function ClinicDetailPage() {
  const { id } = useParams() as { id: string }
  const supabase = createClient()
  const { toast } = useToast()

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // 🕒 Horarios posibles
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "16:00", "16:30", "17:00", "17:30",
  ]

  // 📦 Cargar reservas de la clínica
  const fetchReservas = async () => {
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .eq("clinic_id", id)
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.error("Error cargando reservas:", error)
      setReservas([])
    } else {
      setReservas((data ?? []) as Reserva[])
    }
  }

  // 🔒 Cargar horas bloqueadas
  const fetchBookedTimes = async () => {
    if (!selectedDate) return
    const dateStr = selectedDate.toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("reservas")
      .select("time")
      .eq("clinic_id", id)
      .eq("date", dateStr)

    if (error) {
      console.error("Error cargando horas:", error)
      setBookedTimes([])
    } else {
      setBookedTimes((data ?? []).map((r: { time: string }) => r.time))
    }
  }

  useEffect(() => {
    if (id) fetchReservas()
  }, [id])

  useEffect(() => {
    if (selectedDate) fetchBookedTimes()
  }, [selectedDate])

  // 💾 Guardar reserva (temporal: demo manual)
  const handleReserve = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selecciona fecha y hora",
        description: "Por favor, elige un día y una hora disponibles.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const dateStr = selectedDate.toISOString().split("T")[0]

    const { error } = await supabase.from("reservas").insert([
      {
        clinic_id: id,
        user_name: "Paciente de prueba",
        date: dateStr,
        time: selectedTime,
      },
    ])

    if (error) {
      console.error("Error al guardar reserva:", error)
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la reserva.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Reserva confirmada",
        description: `Reserva creada para el ${dateStr} a las ${selectedTime}.`,
      })
      await fetchReservas()
      await fetchBookedTimes()
      setSelectedDate(undefined)
      setSelectedTime("")
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

      {/* Imagen o galería */}
      <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-12 flex items-center justify-center">
        <p className="text-gray-500">[Imagen o galería de la clínica]</p>
      </div>

      {/* 🔹 NUEVO FORMULARIO DE RESERVA */}
      <ReservationForm />

      {/* Horas disponibles (demo visual) */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-4 text-center">Reservas confirmadas</h2>

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
                  <tr key={r.id} className="border-t border-gray-200 dark:border-gray-700">
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
