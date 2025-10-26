"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "../../../utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function ClinicDetailPage() {
  const supabase = createClient()
  const { id } = useParams()
  const { toast } = useToast()

  const [nombre, setNombre] = useState("")
  const [fecha, setFecha] = useState("")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from("reservas")
      .insert([{ nombre, fecha, clinic_id: id }])

    setLoading(false)

    if (error) {
      toast({
        title: "❌ Error al crear la reserva",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "✅ Reserva creada correctamente",
        description: `${nombre} - ${fecha}`,
      })
      setNombre("")
      setFecha("")
      setOpen(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Cabecera */}
      <section className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Clínica {id}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bienvenido a la ficha de la clínica. Aquí podrás reservar tu próxima sesión de fisioterapia.
        </p>
      </section>

      {/* Imagen / Galería */}
      <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-12 flex items-center justify-center">
        <p className="text-gray-500">[Imagen o galería de la clínica]</p>
      </div>

      {/* Botón de reserva */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="mx-auto block px-6 py-2 text-lg">
            Reservar sesión
          </Button>
        </DialogTrigger>

        {/* Modal en pantalla completa con fondo oscuro */}
        <DialogContent
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          hideClose
        >
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-semibold mb-4">
                Reservar sesión
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <Button type="submit" disabled={loading}>
                  {loading ? "Reservando..." : "Confirmar reserva"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
