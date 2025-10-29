"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface Availability {
  id: string
  physio_id: string
  weekday: string
  start_time: string
  end_time: string
}

interface Physiotherapist {
  id: string
  name: string
}

export default function AvailabilityPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [availability, setAvailability] = useState<Availability[]>([])
  const [physios, setPhysios] = useState<Physiotherapist[]>([])
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [weekday, setWeekday] = useState<string>("monday")
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("17:00")

  // ✅ Cargar fisioterapeutas
  const fetchPhysios = async () => {
    const { data, error } = await supabase
      .from("physiotherapists")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) console.error(error)
    else setPhysios(data || [])
  }

  // ✅ Cargar disponibilidad
  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("availability")
      .select("id, physio_id, weekday, start_time, end_time")

    if (error) console.error(error)
    else setAvailability(data || [])
  }

  useEffect(() => {
    fetchPhysios()
    fetchAvailability()
  }, [])

  // ✅ Crear nuevo horario
  const handleAdd = async () => {
    if (!selectedPhysio) {
      toast({
        title: "Selecciona un fisioterapeuta",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("availability").insert([
      {
        physio_id: selectedPhysio,
        weekday,
        start_time: startTime,
        end_time: endTime,
      },
    ])

    if (error) {
      toast({
        title: "❌ Error al crear horario",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "✅ Horario añadido correctamente" })
      fetchAvailability()
    }
  }

  // ✅ Eliminar horario
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("availability").delete().eq("id", id)
    if (error) {
      toast({
        title: "❌ Error al eliminar horario",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "🗑️ Horario eliminado" })
      fetchAvailability()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Gestión de horarios</h1>

      <div className="mb-6 space-y-3">
        <select
          className="w-full border rounded p-2 text-sm"
          value={selectedPhysio}
          onChange={(e) => setSelectedPhysio(e.target.value)}
        >
          <option value="">Seleccionar fisioterapeuta</option>
          {physios.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <select
            className="border rounded p-2 text-sm flex-1"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
          >
            <option value="monday">Lunes</option>
            <option value="tuesday">Martes</option>
            <option value="wednesday">Miércoles</option>
            <option value="thursday">Jueves</option>
            <option value="friday">Viernes</option>
            <option value="saturday">Sábado</option>
            <option value="sunday">Domingo</option>
          </select>

          <Input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <Button onClick={handleAdd}>Añadir</Button>
        </div>
      </div>

      {/* Lista de horarios */}
      <div className="grid gap-3">
        {availability.map((a) => (
          <Card key={a.id} className="flex justify-between items-center p-3">
            <div>
              <p className="font-medium">{a.weekday.toUpperCase()}</p>
              <p className="text-sm text-gray-600">
                {a.start_time} - {a.end_time}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(a.id)}
            >
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
