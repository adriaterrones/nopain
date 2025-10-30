"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

export default function ClinicPage() {
  const supabase = createClient()
  const { id } = useParams()
  const { toast } = useToast()

  const [clinic, setClinic] = useState<any>(null)
  const [physiotherapists, setPhysiotherapists] = useState<any[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [userName, setUserName] = useState("")
  const [time, setTime] = useState("")

  // 🔹 Cargar datos de la clínica
  useEffect(() => {
    const fetchClinic = async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .single()

      if (error) console.error(error)
      else setClinic(data)
    }
    fetchClinic()
  }, [id])

  // 🔹 Cargar fisioterapeutas asociados
  useEffect(() => {
    const fetchPhysiotherapists = async () => {
      const { data, error } = await supabase
        .from("physiotherapists")
        .select("*")
        .eq("clinic_id", id)

      if (error) console.error(error)
      else setPhysiotherapists(data)
    }
    fetchPhysiotherapists()
  }, [id])

  // 🔹 Crear reserva
  const handleReservation = async () => {
    if (!selectedPhysio || !selectedDate || !userName || !time) {
      toast({ title: "Faltan datos", description: "Completa todos los campos." })
      return
    }

    const { error } = await supabase.from("reservas").insert([
      {
        user_name: userName,
        clinic_id: id,
        date: selectedDate.toISOString(),
        time,
        physio_id: selectedPhysio,
      },
    ])

    if (error) {
      console.error(error)
      toast({
        title: "Error al reservar",
        description: "No se pudo crear la reserva.",
      })
    } else {
      toast({
        title: "Reserva confirmada",
        description: "Tu reserva se ha creado correctamente.",
      })
      setUserName("")
      setSelectedPhysio("")
      setSelectedDate(undefined)
      setTime("")
    }
  }

  if (!clinic) return <p className="text-center mt-10">Cargando clínica...</p>

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">{clinic.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{clinic.description}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            📍 {clinic.address}
          </p>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full">Reservar cita</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar en {clinic.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                placeholder="Tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
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
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <Button onClick={handleReservation} className="w-full">
              Confirmar reserva
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
