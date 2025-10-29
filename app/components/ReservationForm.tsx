"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Physiotherapist {
  id: string
  name: string
}

interface Availability {
  weekday: string
  start_time: string
  end_time: string
}

export default function ReservationForm({ clinicId }: { clinicId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [physios, setPhysios] = useState<Physiotherapist[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [loading, setLoading] = useState(false)

  // ✅ Cargar fisioterapeutas
  const fetchPhysios = async () => {
    const { data, error } = await supabase
      .from("physiotherapists")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) console.error(error)
    else setPhysios(data || [])
  }

  useEffect(() => {
    fetchPhysios()
  }, [])

  // ✅ Cargar horarios disponibles combinando availability + reservas
  const fetchAvailableTimes = async () => {
    if (!selectedDate || !selectedPhysio) return

    const weekdayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]
    const weekday = weekdayNames[new Date(selectedDate).getDay()]

    // 1️⃣ Obtener disponibilidad base
    const { data: availability } = await supabase
      .from("availability")
      .select("start_time, end_time")
      .eq("physio_id", selectedPhysio)
      .eq("weekday", weekday)

    if (!availability || availability.length === 0) {
      setAvailableTimes([])
      return
    }

    // 2️⃣ Generar intervalos de 30 min
    const start = availability[0].start_time
    const end = availability[0].end_time
    const slots: string[] = []
    let current = new Date(`1970-01-01T${start}:00`)
    const limit = new Date(`1970-01-01T${end}:00`)

    while (current < limit) {
      slots.push(current.toTimeString().slice(0, 5))
      current = new Date(current.getTime() + 30 * 60 * 1000)
    }

    // 3️⃣ Obtener reservas ya ocupadas
    const { data: reservas } = await supabase
      .from("reservas")
      .select("time")
      .eq("physio_id", selectedPhysio)
      .eq("date", selectedDate)

    const booked = reservas?.map((r: any) => r.time) || []

    // 4️⃣ Filtrar las horas libres
    const free = slots.filter((s) => !booked.includes(s))
    setAvailableTimes(free)
  }

  useEffect(() => {
    fetchAvailableTimes()
  }, [selectedDate, selectedPhysio])

  // ✅ Reservar (con pago flexible)
  const handleReserve = async () => {
    if (!selectedPhysio || !selectedDate || !selectedTime) {
      toast({
        title: "Completa todos los campos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicId,
          physioId: selectedPhysio,
          userName: "Paciente",
          date: selectedDate,
          time: selectedTime,
        }),
      })

      const data = await res.json()

      if (data.presential) {
        toast({
          title: "✅ Reserva creada correctamente",
          description: "Pago presencial en la clínica el día de tu sesión.",
        })
        setSelectedDate("")
        setSelectedTime("")
        setSelectedPhysio("")
      } else if (data.url) {
        window.location.href = data.url // 🔗 Redirige a Stripe
      } else {
        throw new Error(data.error || "Error al procesar la reserva.")
      }
    } catch (err: any) {
      toast({
        title: "❌ Error al crear reserva",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-semibold">Reservar cita</h3>

      <div>
        <label className="block text-sm font-medium">Fisioterapeuta</label>
        <select
          className="w-full border rounded p-2 text-sm"
          value={selectedPhysio}
          onChange={(e) => setSelectedPhysio(e.target.value)}
        >
          <option value="">Selecciona</option>
          {physios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {availableTimes.length > 0 ? (
        <div>
          <label className="block text-sm font-medium">Hora disponible</label>
          <select
            className="w-full border rounded p-2 text-sm"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="">Selecciona hora</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
      ) : (
        selectedPhysio &&
        selectedDate && (
          <p className="text-sm text-gray-500">
            No hay horarios disponibles para ese día.
          </p>
        )
      )}

      <Button
        onClick={handleReserve}
        className="w-full"
        disabled={loading}
      >
        {loading ? "Procesando..." : "Confirmar reserva"}
      </Button>
    </div>
  )
}
