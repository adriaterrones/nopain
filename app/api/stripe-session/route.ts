import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-11",
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clinicId, userName, date, time } = body

    // Crear sesión de pago
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
            unit_amount: 4000, // 💶 40.00€
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/clinics/${clinicId}`,
      metadata: {
        clinic_id: clinicId,
        user_name: userName,
        date,
        time,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("❌ Stripe error:", err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
