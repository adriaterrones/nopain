'use client'

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function ClinicsPage() {
  const clinics = [
    {
      id: 1,
      name: "FisioMotion Barcelona",
      specialty: "Rehabilitación y terapia deportiva",
      location: "Barcelona",
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1588776814546-0d9d5e3cce90?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 2,
      name: "Vital Recover Madrid",
      specialty: "Fisioterapia avanzada y pilates clínico",
      location: "Madrid",
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: 3,
      name: "Kinetic Balance Valencia",
      specialty: "Osteopatía y recuperación funcional",
      location: "Valencia",
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1606813902820-8b94cb52c4a4?auto=format&fit=crop&w=900&q=80",
    },
  ]

  const [search, setSearch] = useState("")
  const filteredClinics = clinics.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="min-h-[80vh] py-10 px-6">
      <motion.h1
        className="text-4xl font-bold mb-10 text-gray-900 dark:text-gray-100 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Clínicas disponibles
      </motion.h1>

      {/* BUSCADOR */}
      <div className="max-w-md mx-auto mb-12">
        <Input
          type="text"
          placeholder="Buscar clínica por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-base py-2"
        />
      </div>

      <Separator className="max-w-5xl mx-auto mb-12" />

      {/* TARJETAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredClinics.map((clinic, i) => (
          <motion.div
            key={clinic.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-xl transition-all border border-gray-200 dark:border-gray-800 group">
              <div className="relative overflow-hidden">
                <img
                  src={clinic.image}
                  alt={clinic.name}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {clinic.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-left space-y-1">
                <p className="text-gray-600 dark:text-gray-300">
                  {clinic.specialty}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📍 {clinic.location}
                </p>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-4">
                <span className="text-yellow-500 font-medium">
                  ⭐ {clinic.rating.toFixed(1)}
                </span>
                <Link href={`/clinics/${clinic.id}`}>
                  <Button size="sm" className="font-medium">
                    Ver detalles
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClinics.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-20 text-lg">
          No se han encontrado clínicas con ese nombre.
        </p>
      )}
    </section>
  )
}
