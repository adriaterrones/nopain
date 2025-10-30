import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs" // Asegura compatibilidad con Stripe (no Edge runtime)

// ✅ Inicializamos Stripe con la clave secreta desde el .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  const supabase = createClient()

  try {
    const body = await req.json()
    const { clinicId, physioId, userName, date, time } = body

    // 🧩 1️⃣ Verificamos si la clínica permite pago presencial
    const { data: clinicData, error: clinicError } = await supabase
      .from("clinics")
      .select("allow_presential_payment")
      .eq("id", clinicId)
      .single()

    if (clinicError) {
      console.error("Error obteniendo clínica:", clinicError.message)
      return NextResponse.json(
        { error: "Error obteniendo la configuración de la clínica." },
        { status: 400 }
      )
    }

    // 💵 2️⃣ Si la clínica permite pago presencial → crear reserva directamente
    if (clinicData?.allow_presential_payment) {
      const { error: insertError } = await supabase.from("reservas").insert([
        {
          clinic_id: clinicId,
          physio_id: physioId,
          user_name: userName,
          date,
          time,
          payment_status: "presencial",
          status: "pendiente",
        },
      ])

      if (insertError) {
        console.error("Error al crear reserva presencial:", insertError.message)
        return NextResponse.json(
          { error: insertError.message },
          { status: 400 }
        )
      }

      // ✅ Devuelve confirmación directa
      return NextResponse.json({
        success: true,
        presential: true,
        message: "Reserva creada con pago presencial.",
      })
    }

    // 💳 3️⃣ Si requiere pago online → crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "Sesión de fisioterapia",
              description: `${date} — ${time}`,
            },
            unit_amount: 4000, // 💶 Precio en céntimos (40.00 €)
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clinics/${clinicId}`,
      metadata: {
        clinic_id: clinicId,
        physio_id: physioId,
        user_name: userName,
        date,
        time,
      },
    })

    // 🔗 Devolvemos la URL de Stripe para redirigir al cliente
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("❌ Error en /api/checkout:", err.message)
    return NextResponse.json(
      { error: err.message || "Error interno al crear la sesión de pago" },
      { status: 500 }
    )
  }
}
