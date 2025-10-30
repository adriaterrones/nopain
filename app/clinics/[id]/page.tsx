"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import ReservationForm from "@/components/ReservationForm"

export default function ClinicDetailPage() {
  const supabase = createClient()
  const { id } = useParams()
  const { toast } = useToast()

  const [clinic, setClinic] = useState<any>(null)
  const [open, setOpen] = useState(false)

  // 🔹 Cargar datos de la clínica
  useEffect(() => {
    const fetchClinic = async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error cargando clínica:", error.message)
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la clínica.",
          variant: "destructive",
        })
      } else {
        setClinic(data)
      }
    }

    if (id) fetchClinic()
  }, [id, supabase, toast])

  if (!clinic)
    return <p className="p-6 text-center text-muted-foreground">Cargando clínica...</p>

  // 🔹 Render principal
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">{clinic.name}</h1>
      {clinic.location && <p className="text-gray-500 mb-6">{clinic.location}</p>}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Reservar sesión</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reserva una sesión</DialogTitle>
          </DialogHeader>

          {/* 🔹 Pasamos el clinicId correctamente */}
          <ReservationForm
            clinicId={id as string}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
