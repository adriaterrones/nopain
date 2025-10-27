"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const supabase = createClient()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [reservas, setReservas] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // ✅ Comprobar sesión actual
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        window.location.href = "/login"
      } else {
        setUser(data.user)
        fetchReservas()
      }
    }
    getUser()
  }, [])

  // ✅ Cargar reservas desde Supabase
  const fetchReservas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("reservas")
      .select("*")
      .order("fecha", { ascending: true })

    if (error) {
      toast({
        title: "Error al cargar reservas",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setReservas(data || [])
    }
    setLoading(false)
  }

  // ✅ Filtrado simple (nombre o fecha)
  const filtered = reservas.filter(
    (r) =>
      r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.fecha.includes(search)
  )

  // ✅ Eliminar reserva
  const deleteReserva = async (id: string) => {
    const { error } = await supabase.from("reservas").delete().eq("id", id)
    if (error) {
      toast({
        title: "❌ Error al eliminar",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({ title: "🗑️ Reserva eliminada correctamente" })
      fetchReservas()
    }
  }

  // ⏳ Si aún no se ha verificado el usuario
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <p className="text-gray-500">Verificando sesión...</p>
      </div>
    )
  }

  // ✅ Si el usuario está logueado
  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Encabezado original */}
      <section className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h1 className="text-4xl font-semibold mb-4 tracking-tight">
          Panel de usuario
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl">
          Bienvenido a tu espacio personal. Aquí podrás gestionar tus reservas,
          revisar tu historial de sesiones y actualizar tus datos de perfil.
        </p>
      </section>

      {/* Botón de cerrar sesión */}
      <div className="flex justify-center mb-10">
        <Button
          variant="outline"
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = "/"
          }}
        >
          Cerrar sesión
        </Button>
      </div>

      {/* Nueva sección: panel de reservas */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Reservas registradas
        </h2>

        {/* Buscador y botón */}
        <div className="flex justify-between items-center mb-6">
          <Input
            type="text"
            placeholder="Buscar por nombre o fecha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={fetchReservas} variant="outline">
            🔄 Actualizar
          </Button>
        </div>

        {/* Tabla de reservas */}
        {loading ? (
          <p className="text-center text-gray-500">Cargando reservas...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay reservas que coincidan.
          </p>
        ) : (
          <div className="overflow-hidden border rounded-xl dark:border-gray-800">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Clínica</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <td className="p-3">{r.nombre}</td>
                    <td className="p-3">{r.fecha}</td>
                    <td className="p-3">{r.clinic_id}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteReserva(r.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
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
