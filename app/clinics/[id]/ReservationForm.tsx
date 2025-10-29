"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

type Physio = {
  id: string
  name: string
}

export default function ReservationForm() {
  const params = useParams()
  const clinicId = Array.isArray(params.id) ? params.id[0] : params.id
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [time, setTime] = useState("")
  const [physios, setPhysios] = useState<Physio[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")

  // 🩺 Cargar fisioterapeutas de la clínica
  useEffect(() => {
    const fetchPhysios = async () => {
      if (!clinicId) return
      const { data, error } = await supabase
        .from("physiotherapists")
        .select("id, name")
        .eq("clinic_id", clinicId)
        .eq("active", true)

      if (error && Object.keys(error).length > 0) {
        console.error("❌ Error cargando fisioterapeutas:", error)
      } else {
        console.log("✅ Fisioterapeutas cargados:", data)
        setPhysios(data || [])
      }
    }

    fetchPhysios()
  }, [clinicId])

  // 💾 Crear reserva
  const handleReservation = async () => {
    if (!name || !email || !selectedDate || !time || !selectedPhysio) {
      window.alert("Por favor, completa todos los campos.")
      return
    }

    const { error } = await supabase.from("reservas").insert([
      {
        user_name: name,
        user_email: email,
        clinic_id: clinicId,
        date: selectedDate.toISOString(),
        time,
        physio_id: selectedPhysio,
      },
    ])

    if (error) {
      console.error("❌ Error al crear la reserva:", error)
      window.alert("No se ha podido crear la reserva.")
    } else {
      window.alert("✅ Reserva creada correctamente.")
      setOpen(false)
      setName("")
      setEmail("")
      setSelectedDate(undefined)
      setTime("")
      setSelectedPhysio("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-4 w-full">Reservar sesión</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md z-50 bg-background">
        <DialogHeader>
          <DialogTitle>Reserva tu sesión</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[80vh] overflow-y-auto">
          {/* Nombre */}
          <div>
            <Label>Tu nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>

          {/* Correo */}
          <div>
            <Label>Tu correo electrónico</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          {/* Selector de fisioterapeuta */}
          <div>
            <Label>Fisioterapeuta</Label>
            <Select value={selectedPhysio} onValueChange={setSelectedPhysio}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un fisioterapeuta" />
              </SelectTrigger>
              <SelectContent>
                {physios.length > 0 ? (
                  physios.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No hay fisioterapeutas disponibles
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Fecha */}
          <div>
            <Label>Fecha</Label>
            <div className="rounded-md border p-2 mt-1 bg-background">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>
          </div>

          {/* Hora */}
          <div>
            <Label>Hora</Label>
            <Input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ej. 16:30"
            />
          </div>

          {/* Botón de confirmación */}
          <Button className="w-full mt-2" onClick={handleReservation}>
            Confirmar reserva
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
