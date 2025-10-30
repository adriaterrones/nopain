"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Physiotherapist {
  id: string
  name: string
}

interface Reserva {
  id: string
  user_name: string
  date: string
  created_at: string
  clinic_id: string
  status?: string
  physiotherapists?: Physiotherapist | null
  physio_id?: string | null
}

export default function ClinicPanelPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [reservas, setReservas] = useState<Reserva[]>([])
  const [physios, setPhysios] = useState<Physiotherapist[]>([])
  const [loading, setLoading] = useState(true)

  // 🔍 Filtros
  const [selectedPhysio, setSelectedPhysio] = useState<string>("")
  const [selectedStatus, setSelectedStatus] = useState<string>("")

  // ✅ Cargar fisioterapeutas
  const fetchPhysios = async () => {
    const { data, error } = await supabase
      .from("physiotherapists")
      .select("id, name")
      .order("name", { ascending: true })

    if (error) console.error("Error cargando fisios:", error.message)
    else setPhysios(data || [])
  }

  // ✅ Cargar reservas (con filtro)
  const fetchReservas = async (physioFilter?: string, statusFilter?: string) => {
    setLoading(true)

    let query = supabase
      .from("reservas")
      .select(`
        id,
        user_name,
        date,
        created_at,
        clinic_id,
        status,
        physio_id,
        physiotherapists (
          id,
          name
        )
      `)
      .order("date", { ascending: true })

    if (physioFilter) query = query.eq("physio_id", physioFilter)
    if (statusFilter) query = query.eq("status", statusFilter)

    const { data, error } = await query

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
    fetchPhysios()
    fetchReservas()
  }, [])

  useEffect(() => {
    fetchReservas(selectedPhysio, selectedStatus)
  }, [selectedPhysio, selectedStatus])

  // ✅ Estadísticas dinámicas
  const stats = useMemo(() => {
    const total = reservas.length
    const aceptadas = reservas.filter(r => r.status === "aceptada").length
    const canceladas = reservas.filter(r => r.status === "cancelada").length
    const pendientes = reservas.filter(r => !r.status || r.status === "pendiente").length

    const hoy = reservas.filter(r => {
      const fechaReserva = new Date(r.date)
      const hoy = new Date()
      return (
        fechaReserva.getDate() === hoy.getDate() &&
        fechaReserva.getMonth() === hoy.getMonth() &&
        fechaReserva.getFullYear() === hoy.getFullYear()
      )
    }).length

    return { total, aceptadas, canceladas, pendientes, hoy }
  }, [reservas])

  // ✅ Asignar fisioterapeuta
  const handleAssignPhysio = async (reservaId: string, physioId: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ physio_id: physioId })
      .eq("id", reservaId)

    if (error) {
      toast({
        title: "❌ Error al asignar fisioterapeuta",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Fisioterapeuta asignado",
        description: "La reserva ha sido actualizada correctamente.",
      })
      setReservas(prev =>
        prev.map(r =>
          r.id === reservaId ? { ...r, physio_id: physioId } : r
        )
      )
    }
  }

  // ✅ Cambiar estado de reserva
  const handleStatusChange = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("reservas")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      toast({
        title: "❌ Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservas(prev =>
        prev.map(r =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      )
      toast({
        title: "✅ Estado actualizado",
        description: `La reserva ha sido marcada como "${newStatus}".`,
      })
    }
  }

  // ✅ Eliminar reserva
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("reservas").delete().eq("id", id)
    if (error) {
      toast({
        title: "❌ Error al eliminar reserva",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "🗑️ Reserva eliminada",
        description: "La reserva se ha eliminado correctamente.",
      })
      setReservas(prev => prev.filter(r => r.id !== id))
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">Panel de gestión de reservas</h1>

      {/* 📊 ESTADÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="text-center bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Aceptadas</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.aceptadas}</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pendientes}</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-red-50 dark:bg-red-950">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Canceladas</p>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.canceladas}</p>
          </CardContent>
        </Card>
        <Card className="text-center bg-purple-50 dark:bg-purple-950">
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Hoy</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.hoy}</p>
          </CardContent>
        </Card>
      </div>

      {/* 🔍 FILTROS */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium">Filtrar por fisioterapeuta</label>
          <select
            className="w-full mt-1 rounded-md border p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            value={selectedPhysio}
            onChange={e => setSelectedPhysio(e.target.value)}
          >
            <option value="">Todos</option>
            {physios.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium">Filtrar por estado</label>
          <select
            className="w-full mt-1 rounded-md border p-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* 🧾 LISTADO DE RESERVAS */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando reservas...</p>
      ) : reservas.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron reservas.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservas.map(reserva => (
            <Card key={reserva.id} className="shadow-md border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">{reserva.user_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Fecha:</strong>{" "}
                  {new Date(reserva.date).toLocaleString("es-ES")}
                </p>
                <p>
                  <strong>Fisioterapeuta:</strong>{" "}
                  {reserva.physiotherapists?.name || "No asignado"}
                </p>

                <div>
                  <label className="text-xs font-medium">Asignar fisio:</label>
                  <select
                    className="w-full mt-1 rounded-md border p-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                    value={reserva.physio_id || ""}
                    onChange={e =>
                      handleAssignPhysio(reserva.id, e.target.value)
                    }
                  >
                    <option value="">-- Seleccionar --</option>
                    {physios.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p>
                  <strong>Estado:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      reserva.status === "aceptada"
                        ? "bg-green-200 text-green-800"
                        : reserva.status === "cancelada"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {reserva.status || "pendiente"}
                  </span>
                </p>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(reserva.id, "aceptada")}
                  >
                    Aceptar
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(reserva.id, "cancelada")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(reserva.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
