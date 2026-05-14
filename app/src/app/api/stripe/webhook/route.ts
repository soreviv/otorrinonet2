import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderTicket } from '@/lib/mailer'
import { getClinicConfigFromDB } from '@/lib/clinic-config'
import type Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    const rawBody = await req.text()
    event = getStripe().webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[stripe-webhook] signature verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency: ignorar eventos ya procesados
  const existing = await prisma.stripeWebhookEvent.findUnique({ where: { id: event.id } })
  if (existing) {
    return NextResponse.json({ received: true, skipped: true })
  }

  try {
    await handleEvent(event)
    await prisma.stripeWebhookEvent.create({
      data: { id: event.id, type: event.type }
    })
  } catch (err) {
    console.error(`[stripe-webhook] error handling ${event.type}`, err)
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata?.orderId
      if (!orderId) return

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true }
      })
      if (!order || order.status !== 'pendiente_pago') return

      // Transacción: marcar pagado + descontar stock
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: 'pagado',
            stripeChargeId: pi.latest_charge as string | null,
          }
        })

        for (const item of order.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stockIlimitado: true }
          })
          if (product && !product.stockIlimitado) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.cantidad } }
            })
          }
        }
      })

      // Email de ticket (fuera de la transacción)
      if (!order.ticketEnviadoAt) {
        try {
          const cfg = await getClinicConfigFromDB()
          await sendOrderTicket({
            order: {
              id: order.id,
              compradorNombre: order.compradorNombre,
              compradorEmail: order.compradorEmail,
              shippingChoice: order.shippingChoice === 'pickup' ? 'pickup' : 'domicilio',
              subtotal: order.subtotal,
              costoEnvio: order.costoEnvio,
              total: order.total,
              direccionCalle: order.direccionCalle,
              direccionNumero: order.direccionNumero,
              direccionColonia: order.direccionColonia,
              direccionMunicipio: order.direccionMunicipio,
              direccionEstado: order.direccionEstado,
              direccionCP: order.direccionCP,
            },
            items: order.items.map(i => ({
              nombreSnapshot: i.nombreSnapshot,
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
              subtotal: i.subtotal,
            })),
            cfg,
          })
          await prisma.order.update({
            where: { id: orderId },
            data: { ticketEnviadoAt: new Date() }
          })
        } catch (mailErr) {
          console.error('[stripe-webhook] email ticket error', mailErr)
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const orderId = pi.metadata?.orderId
      if (!orderId) return

      await prisma.order.updateMany({
        where: { id: orderId, status: 'pendiente_pago' },
        data: { status: 'cancelado' }
      })
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
      if (!piId) return

      await prisma.order.updateMany({
        where: { stripePaymentIntentId: piId },
        data: { status: 'reembolsado' }
      })
      break
    }

    default:
      break
  }
}
