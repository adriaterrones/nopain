"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Reserva = {
  id: string
  clinic_id: string
  patient_name: string | null
  status: string | null
  starts_at: string | null
  price_cents: number | null
  created_at: string
}

type Clinic = {
  id: string
  name: string
  location: string | null
}

export default function ClinicPanelPage() {
  const supabase = createClient()

  const [clinicId, setClinicId] = useState<string | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [range, setRange] = useState<"week" | "month" | "quarter" | "all">("month")

  // 🔹 Obtener clínica del usuario autenticado
  useEffect(() => {
    const fetchUserClinic = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return toast.error("No se ha detectado sesión activa.")

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, clinic_id")
        .eq("id", user.id)
        .single()

      if (!profile || profile.role !== "clinica") return
      setClinicId(profile.clinic_id)
    }

    fetchUserClinic()
  }, [supabase])

  // 🔹 Cargar datos y marcar completadas
  useEffect(() => {
    if (!clinicId) return
    const fetchData = async () => {
      setLoading(true)
      const { data: clinicData } = await supabase
        .from("clinics")
        .select("id, name, location")
        .eq("id", clinicId)
        .single()

      const { data: reservasData } = await supabase
        .from("reservas")
        .select("*")
        .eq("clinic_id", clinicId)

      const now = new Date()
      const updated = (reservasData ?? []).map((r) => {
        if (r.status === "accepted" && r.starts_at && new Date(r.starts_at) < now) {
          return { ...r, status: "completed" }
        }
        return r
      })

      const completedToUpdate = updated.filter(
        (r) =>
          r.status === "completed" &&
          reservasData?.some((old) => old.id === r.id && old.status !== "completed")
      )
      if (completedToUpdate.length > 0) {
        await supabase
          .from("reservas")
          .update({ status: "completed" })
          .in(
            "id",
            completedToUpdate.map((r) => r.id)
          )
      }

      setClinic(clinicData)
      setReservas(updated)
      setLoading(false)
    }
    fetchData()
  }, [clinicId, supabase])

  // 🔹 Guardar cambios
  const handleSaveClinic = async () => {
    if (!clinic) return
    setSaving(true)
    const { error } = await supabase
      .from("clinics")
      .update({ name: clinic.name, location: clinic.location })
      .eq("id", clinic.id)
    setSaving(false)
    if (error) toast.error("Error al guardar cambios")
    else {
      toast.success("✅ Clínica actualizada correctamente.")
      setEditing(false)
    }
  }

  // 🔹 Filtrar rango
  const filteredReservas = useMemo(() => {
    const now = new Date()
    let startDate: Date | null = null
    switch (range) {
      case "week":
        startDate = new Date()
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate = new Date()
        startDate.setMonth(now.getMonth() - 1)
        break
      case "quarter":
        startDate = new Date()
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate = null
    }
    return reservas.filter((r) => {
      if (!r.starts_at || !startDate) return true
      const start = new Date(r.starts_at)
      return start >= startDate
    })
  }, [reservas, range])

  // 🔹 Estadísticas
  const accepted = filteredReservas.filter((r) => r.status === "accepted").length
  const pending = filteredReservas.filter((r) => r.status === "pending").length
  const cancelled = filteredReservas.filter((r) => r.status === "cancelled").length
  const completed = filteredReservas.filter((r) => r.status === "completed").length
  const ingresos = filteredReservas
    .filter((r) => ["accepted", "completed"].includes(r.status ?? "") && r.price_cents)
    .reduce((sum, r) => sum + (r.price_cents ?? 0), 0)

  const pieData = [
    { name: "Completadas", value: completed },
    { name: "Aceptadas", value: accepted },
    { name: "Pendientes", value: pending },
    { name: "Canceladas", value: cancelled },
  ]

  // 🔹 Ingresos por día
  const ingresosPorDia = useMemo(() => {
    const mapa = new Map<string, number>()
    filteredReservas.forEach((r) => {
      if (["accepted", "completed"].includes(r.status ?? "") && r.starts_at) {
        const fecha = new Date(r.starts_at).toISOString().split("T")[0]
        mapa.set(fecha, (mapa.get(fecha) ?? 0) + (r.price_cents ? r.price_cents / 100 : 0))
      }
    })
    return Array.from(mapa.entries()).map(([fecha, total]) => ({ fecha, total }))
  }, [filteredReservas])

  const COLORS = ["#22C55E", "#3B82F6", "#FACC15", "#EF4444"]

  const colorFromName = (name: string) => {
    const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
    return `hsl(${hue}, 70%, 60%)`
  }

  const statusStyle = (status: string | null) => {
    switch (status) {
      case "completed":
        return "text-green-600 dark:text-green-400"
      case "accepted":
        return "text-blue-600 dark:text-blue-400"
      case "pending":
        return "text-yellow-600 dark:text-yellow-400"
      case "cancelled":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600"
    }
  }

  const statusIcon = (status: string | null) => {
    switch (status) {
      case "completed":
        return "✅"
      case "accepted":
        return "📅"
      case "pending":
        return "⏳"
      case "cancelled":
        return "❌"
      default:
        return "•"
    }
  }

  if (loading)
    return <p className="text-center p-8 text-muted-foreground">Cargando...</p>

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      {/* 🏥 Encabezado */}
      {clinic && (
        <Card className="p-6 shadow-md">
          <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center justify-center rounded-full text-white text-2xl font-bold w-14 h-14 shadow-md"
                style={{ background: colorFromName(clinic.name) }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                {clinic.name.charAt(0).toUpperCase()}
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold">{clinic.name}</CardTitle>
                <p className="text-muted-foreground text-sm">
                  📍 {clinic.location || "Ubicación no asignada"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setEditing((p) => !p)}
              className="mt-4 md:mt-0"
            >
              ✏️ {editing ? "Cancelar" : "Editar datos"}
            </Button>
          </CardHeader>

          <AnimatePresence>
            {editing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="space-y-4 mt-4">
                  <Input
                    value={clinic.name}
                    onChange={(e) =>
                      setClinic((prev) => (prev ? { ...prev, name: e.target.value } : null))
                    }
                  />
                  <Input
                    value={clinic.location ?? ""}
                    onChange={(e) =>
                      setClinic((prev) =>
                        prev ? { ...prev, location: e.target.value } : null
                      )
                    }
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleSaveClinic} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}

      {/* 📊 Dashboard */}
      <Card className="p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-col md:flex-row justify-between items-center">
          <CardTitle className="text-2xl font-bold">📊 Estadísticas</CardTitle>
          <Select
            value={range}
            onValueChange={(v: "week" | "month" | "quarter" | "all") => setRange(v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecciona rango" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
              <SelectItem value="quarter">Último trimestre</SelectItem>
              <SelectItem value="all">Todo</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap justify-center gap-6 text-center mb-6">
            <p>✅ <strong>{completed}</strong> completadas</p>
            <p>📅 <strong>{accepted}</strong> aceptadas</p>
            <p>⏳ <strong>{pending}</strong> pendientes</p>
            <p>❌ <strong>{cancelled}</strong> canceladas</p>
            <p>💶 <strong>{(ingresos / 100).toFixed(2)} €</strong></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pieData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 📈 Gráfico de ingresos */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4 text-center">
              📈 Evolución de ingresos
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ingresosPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(v: number) => `${v.toFixed(2)} €`} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 📅 Reservas recientes */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Reservas recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservas.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No hay reservas en este rango.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReservas.map((r) => (
                <Card key={r.id} className="border shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      {statusIcon(r.status)}{" "}
                      <span className={statusStyle(r.status)}>
                        {r.patient_name ?? "Paciente"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Estado:</strong>{" "}
                      <span className={statusStyle(r.status)}>{r.status}</span>
                    </p>
                    <p>
                      <strong>Inicio:</strong>{" "}
                      {r.starts_at
                        ? new Date(r.starts_at).toLocaleString("es-ES")
                        : "—"}
                    </p>
                    <p>
                      <strong>Precio:</strong>{" "}
                      {r.price_cents
                        ? (r.price_cents / 100).toFixed(2) + " €"
                        : "—"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
