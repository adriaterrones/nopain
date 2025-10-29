import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/utils/supabase/server"

// ⚠️ Configura esta variable en tu archivo .env.local
// STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  const supabase = createClient()
  const sig = req.headers.get("stripe-signature")

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err: any) {
    console.error("⚠️ Error verificando firma del webhook:", err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // ✅ Detectar evento de pago completado
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    // Datos enviados en metadata desde /api/checkout
    const clinic_id = session.metadata?.clinic_id
    const physio_id = session.metadata?.physio_id
    const user_name = session.metadata?.user_name
    const date = session.metadata?.date
    const time = session.metadata?.time

    try {
      // 🔽 Crear reserva en Supabase como pagada
      const { error } = await supabase.from("reservas").insert([
        {
          clinic_id,
          physio_id,
          user_name,
          date,
          time,
          payment_status: "pagado",
          status: "aceptada",
        },
      ])

      if (error) throw error

      console.log(`✅ Reserva registrada para ${user_name} (${date} ${time})`)
    } catch (error: any) {
      console.error("❌ Error al insertar reserva desde webhook:", error.message)
    }
  }

  return NextResponse.json({ received: true })
}
