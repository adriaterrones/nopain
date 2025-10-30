"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner" // ✅ Nuevo sistema de notificaciones Sonner

type Physiotherapist = {
  id: string
  name: string
  specialty: string | null
}

export default function ReservationForm({
  clinicId,
  onSuccess,
}: {
  clinicId: string
  onSuccess?: () => void
}) {
  const supabase = createClient()
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [patientName, setPatientName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [loading, setLoading] = useState(false)

  // 🔹 Cargar fisioterapeutas según la clínica
  useEffect(() => {
    const fetchPhysios = async () => {
      const { data, error } = await supabase
        .from("physiotherapists")
        .select("id, name, specialty")
        .eq("clinic_id", clinicId)

      if (error) toast.error("Error al cargar fisioterapeutas.")
      else setPhysiotherapists(data)
    }

    if (clinicId) fetchPhysios()
  }, [clinicId, supabase])

  // 🔹 Enviar reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPhysio || !patientName || !date || !time) {
      toast.error("Completa todos los campos antes de continuar.")
      return
    }

    setLoading(true)

    const { error } = await supabase.from("reservas").insert([
      {
        clinic_id: clinicId,
        physio_id: selectedPhysio,
        patient_name: patientName,
        date,
        time,
      },
    ])

    setLoading(false)

    if (error) {
      toast.error(`Error al crear la reserva: ${error.message}`)
    } else {
      toast.success("Reserva creada correctamente 🎉")
      setPatientName("")
      setDate("")
      setTime("")
      setSelectedPhysio("")
      if (onSuccess) onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Nombre del paciente</Label>
        <Input
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="Introduce tu nombre"
          required
        />
      </div>

      <div>
        <Label>Fisioterapeuta</Label>
        <select
          value={selectedPhysio}
          onChange={(e) => setSelectedPhysio(e.target.value)}
          className="w-full border rounded-md p-2 bg-background"
          required
        >
          <option value="">Selecciona un fisioterapeuta</option>
          {physiotherapists.length > 0 ? (
            physiotherapists.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.specialty ? `(${p.specialty})` : ""}
              </option>
            ))
          ) : (
            <option disabled value="">
              No hay fisioterapeutas disponibles
            </option>
          )}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Fecha</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div className="flex-1">
          <Label>Hora</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Reservar sesión"}
      </Button>
    </form>
  )
}
