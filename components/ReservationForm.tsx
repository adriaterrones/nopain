"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export default function ReservationForm({ clinicId }: { clinicId: string }) {
  const supabase = createClient()
  const { toast } = useToast()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Franjas fijas de ejemplo (se podrán ajustar por clínica)
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30",
    "16:00", "16:30", "17:00", "17:30",
  ]

  useEffect(() => {
    if (selectedDate) fetchBookedTimes()
  }, [selectedDate])

  async function fetchBookedTimes() {
    const dayStr = selectedDate?.toISOString().split("T")[0]
    const { data, error } = await supabase
      .from("reservas")
      .select("time")
      .eq("clinic_id", clinicId)
      .eq("date", dayStr)

    if (error) console.error(error)
    else {
      const booked = data.map((r: any) => r.time)
      setBookedTimes(booked)
      setAvailableTimes(timeSlots.filter((t) => !booked.includes(t)))
    }
  }

  async function handleReserve() {
    if (!selectedDate || !selectedTime) return
    setLoading(true)

    const { error } = await supabase.from("reservas").insert([
      {
        clinic_id: clinicId,
        user_name: "Paciente",
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
      },
    ])

    setLoading(false)

    if (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Reserva confirmada",
        description: `${selectedDate.toLocaleDateString()} — ${selectedTime}`,
      })
      setSelectedDate(undefined)
      setSelectedTime("")
      fetchBookedTimes()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Selecciona un día</Label>
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          fromDate={new Date()}
        />
      </div>

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

      <Button
        className="w-full mt-4"
        disabled={!selectedDate || !selectedTime || loading}
        onClick={handleReserve}
      >
        {loading ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </div>
  )
}
