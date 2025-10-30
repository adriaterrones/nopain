"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { motion, AnimatePresence } from "framer-motion"

export default function ClinicPage() {
  const supabase = createClient()
  const { id } = useParams()
  const { toast } = useToast()

  const [clinic, setClinic] = useState<any>(null)
  const [physiotherapists, setPhysiotherapists] = useState<any[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [patientName, setPatientName] = useState("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [duration, setDuration] = useState<number>(30)
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)

  const availableTimes = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  ]

  // 🔹 Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id, name, location, created_at")
        .eq("id", id)
        .single()
      setClinic(clinicData)

      const { data: physioData } = await supabase
        .from("physiotherapists")
        .select("id, name, clinic_id")
        .eq("clinic_id", id)
      setPhysiotherapists(physioData || [])
    }
    if (id) fetchData()
  }, [id])

  // 🔹 Cargar horas ocupadas
  useEffect(() => {
    const fetchBooked = async () => {
      if (!selectedDate || !selectedPhysio) return
      const { data } = await supabase
        .from("reservas")
        .select("time")
        .eq("clinic_id", id)
        .eq("physio_id", selectedPhysio)
        .eq("date", selectedDate.toISOString().split("T")[0])
      setBookedTimes(data?.map((r) => r.time) || [])
    }
    fetchBooked()
  }, [selectedDate, selectedPhysio])

  // 🔹 Calcular hora final
  const calculateEndTime = (start: string, durationMinutes: number): string => {
    const [h, m] = start.split(":").map(Number)
    const totalMinutes = h * 60 + m + durationMinutes
    const endHour = Math.floor(totalMinutes / 60)
    const endMinute = totalMinutes % 60
    return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`
  }

  // 🔹 Comprobar disponibilidad según duración
  const isSlotAvailable = (start: string): boolean => {
    const startIndex = availableTimes.indexOf(start)
    const blocksNeeded = duration / 30
    if (startIndex + blocksNeeded > availableTimes.length) return false
    const nextBlocks = availableTimes.slice(startIndex, startIndex + blocksNeeded)
    return nextBlocks.every((t) => !bookedTimes.includes(t))
  }

  // 🔹 Crear reserva
  const handleReservation = async () => {
    if (!selectedPhysio || !selectedDate || !patientName || !selectedTime) {
      toast({ title: "Faltan datos", description: "Completa todos los campos." })
      return
    }

    if (!isSlotAvailable(selectedTime)) {
      toast({
        title: "Horario no disponible",
        description: "La franja seleccionada no está libre.",
      })
      return
    }

    const endTime = calculateEndTime(selectedTime, duration)
    const startsAt = `${selectedDate.toISOString().split("T")[0]}T${selectedTime}:00`
    const endsAt = `${selectedDate.toISOString().split("T")[0]}T${endTime}:00`

    const { error } = await supabase.from("reservas").insert([
      {
        clinic_id: id,
        physio_id: selectedPhysio,
        patient_name: patientName,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        starts_at: startsAt,
        ends_at: endsAt,
        status: "pending",
        currency: "EUR",
      },
    ])

    if (error) {
      console.error("Error al crear la reserva:", error)
      toast({ title: "Error al reservar", description: "No se pudo crear la reserva." })
    } else {
      const physioName =
        physiotherapists.find((p) => p.id === selectedPhysio)?.name || ""
      setConfirmedBooking({
        patient_name: patientName,
        physio_name: physioName,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        end_time: endTime,
        duration,
        status: "pending",
      })
      toast({
        title: "Reserva confirmada",
        description: "Tu cita se ha creado correctamente.",
      })
      setShowForm(false)
    }
  }

  // 🔹 Cancelar reserva
  const handleCancel = () => {
    setConfirmedBooking(null)
    toast({ title: "Reserva cancelada", description: "La cita se ha anulado." })
  }

  // 🔹 Color dinámico de las horas
  const getHourClass = (t: string) => {
    const isBooked = bookedTimes.includes(t)
    const available = isSlotAvailable(t)
    const isSelected = selectedTime === t
    if (isBooked || !available)
      return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed"
    if (isSelected)
      return "bg-green-600 text-white border-green-700 shadow-md scale-105"
    return "bg-white hover:bg-green-100 dark:hover:bg-green-900/20 border-green-200"
  }

  if (!clinic) return <p className="text-center mt-10">Cargando clínica...</p>

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Info clínica */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{clinic.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">📍 {clinic.location}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Creada el {new Date(clinic.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button onClick={() => setShowForm(!showForm)} className="w-full">
          {showForm ? "Cerrar formulario" : "Reservar cita"}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 shadow-md space-y-4">
              <h2 className="text-xl font-semibold mb-4">Formulario de reserva</h2>

              <div>
                <Label>Nombre</Label>
                <Input
                  placeholder="Tu nombre"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <Label>Fisioterapeuta</Label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedPhysio}
                  onChange={(e) => setSelectedPhysio(e.target.value)}
                >
                  <option value="">Selecciona un fisioterapeuta</option>
                  {physiotherapists.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Fecha</Label>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                />
              </div>

              <div>
                <Label>Hora</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {availableTimes.map((t) => (
                    <motion.button
                      key={t}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedTime(t)}
                      disabled={bookedTimes.includes(t) || !isSlotAvailable(t)}
                      className={`p-2 rounded-md text-sm border text-center transition-all duration-200 ${getHourClass(
                        t
                      )}`}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Duración</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[30, 60, 90, 120].map((d) => (
                    <motion.button
                      key={d}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDuration(d)}
                      className={`px-3 py-2 rounded-md text-sm border transition-all ${
                        duration === d
                          ? "bg-blue-600 text-white border-blue-700 shadow-md"
                          : "hover:bg-blue-100 dark:hover:bg-blue-900/20 border-blue-200"
                      }`}
                    >
                      {d === 30
                        ? "30 min"
                        : d === 60
                        ? "1 hora"
                        : d === 90
                        ? "1 h 30 min"
                        : "2 horas"}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Vista previa dinámica */}
              {selectedTime && selectedDate && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-300">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    <strong>Seleccionado:</strong> {selectedTime} —{" "}
                    {calculateEndTime(selectedTime, duration)} el{" "}
                    {selectedDate.toLocaleDateString()} ({duration} min)
                  </p>
                </div>
              )}

              <Button onClick={handleReservation} className="w-full mt-4">
                Confirmar reserva
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {confirmedBooking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="p-6 border-green-500 border shadow-md bg-green-50 dark:bg-green-900/20">
            <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300">
              ✅ Cita confirmada
            </h3>
            <p><strong>Paciente:</strong> {confirmedBooking.patient_name}</p>
            <p><strong>Fisioterapeuta:</strong> {confirmedBooking.physio_name}</p>
            <p><strong>Fecha:</strong> {confirmedBooking.date}</p>
            <p>
              <strong>Hora:</strong> {confirmedBooking.time} —{" "}
              {confirmedBooking.end_time}
            </p>
            <p><strong>Duración:</strong> {confirmedBooking.duration} min</p>
            <p><strong>Estado:</strong> {confirmedBooking.status}</p>

            <Button
              variant="outline"
              onClick={handleCancel}
              className="mt-4 border-red-500 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              Cancelar cita
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
