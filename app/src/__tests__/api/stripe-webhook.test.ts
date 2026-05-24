import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/stripe/webhook/route'
import { sendOrderTicket } from '@/lib/mailer'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/clinic-config', () => ({
  getClinicConfigFromDB: vi.fn().mockResolvedValue({}),
}))

vi.mock('@/lib/mailer', () => ({
  sendOrderTicket: vi.fn().mockResolvedValue(undefined),
}))

const mockConstructEvent = vi.hoisted(() => vi.fn())

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn().mockReturnValue({
    webhooks: { constructEvent: mockConstructEvent },
  }),
}))

// Cliente de transacción Prisma simulado (recibe el callback de $transaction)
const mockTx = vi.hoisted(() => ({
  order: { update: vi.fn().mockResolvedValue({}) },
  product: {
    findUnique: vi.fn().mockResolvedValue({ stockIlimitado: false }),
    update: vi.fn().mockResolvedValue({}),
  },
}))

const mockPrisma = vi.hoisted(() => ({
  stripeWebhookEvent: {
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
  },
  order: {
    findUnique: vi.fn(),
    update: vi.fn().mockResolvedValue({}),
    updateMany: vi.fn().mockResolvedValue({}),
  },
  $transaction: vi.fn().mockImplementation(
    async (cb: (tx: typeof mockTx) => Promise<void>) => cb(mockTx),
  ),
}))

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

function makeRequest(body: string, signature = 'valid-sig'): NextRequest {
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    body,
    headers: { 'stripe-signature': signature },
  })
}

function makeEvent(type: string, data: object, id = 'evt_test_001') {
  return { id, type, data: { object: data } }
}

const baseOrder = {
  id: 'order-1',
  status: 'pendiente_pago',
  compradorNombre: 'Ana García',
  compradorEmail: 'ana@example.com',
  shippingChoice: 'pickup',
  subtotal: 50000,
  costoEnvio: 0,
  total: 50000,
  ticketEnviadoAt: null,
  stripePaymentIntentId: 'pi_test_001',
  direccionCalle: null,
  direccionNumero: null,
  direccionColonia: null,
  direccionMunicipio: null,
  direccionEstado: null,
  direccionCP: null,
  items: [
    {
      productId: 'prod-1',
      nombreSnapshot: 'Irrigador nasal',
      cantidad: 2,
      precioUnitario: 25000,
      subtotal: 50000,
    },
  ],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('POST /api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue(null)
    mockPrisma.stripeWebhookEvent.create.mockResolvedValue({})
    mockPrisma.$transaction.mockImplementation(
      async (cb: (tx: typeof mockTx) => Promise<void>) => cb(mockTx),
    )
    mockTx.product.findUnique.mockResolvedValue({ stockIlimitado: false })
    mockTx.order.update.mockResolvedValue({})
    mockTx.product.update.mockResolvedValue({})
  })

  // ─── Validación de firma ──────────────────────────────────────────────────

  it('devuelve 400 cuando falta el header stripe-signature', async () => {
    const req = new NextRequest('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
      // sin header stripe-signature
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('devuelve 400 cuando la firma de Stripe es inválida', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('No signatures found matching the expected signature')
    })

    const res = await POST(makeRequest('{}', 'firma-mala'))
    expect(res.status).toBe(400)
  })

  // ─── Idempotencia ─────────────────────────────────────────────────────────

  it('devuelve { received:true, skipped:true } si el evento ya fue procesado', async () => {
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', {}))
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue({ id: 'evt_test_001' })

    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ received: true, skipped: true })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('no ejecuta la transacción dos veces si el mismo evento llega dos veces', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_1' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue(baseOrder)

    // Primera entrega
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue(null)
    await POST(makeRequest(JSON.stringify(pi)))

    // Segunda entrega — el evento ya está registrado en BD
    mockPrisma.stripeWebhookEvent.findUnique.mockResolvedValue({ id: 'evt_test_001' })
    await POST(makeRequest(JSON.stringify(pi)))

    expect(mockPrisma.$transaction).toHaveBeenCalledOnce()
  })

  // ─── payment_intent.succeeded ────────────────────────────────────────────

  it('marca la orden como pagada y decrementa stock', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_test_001' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue(baseOrder)

    const res = await POST(makeRequest(JSON.stringify(pi)))
    expect(res.status).toBe(200)
    expect(mockTx.order.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'pagado' }) }),
    )
    expect(mockTx.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: { decrement: 2 } } }),
    )
  })

  it('no modifica stock cuando el producto tiene stockIlimitado:true', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_001' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue(baseOrder)
    mockTx.product.findUnique.mockResolvedValue({ stockIlimitado: true })

    await POST(makeRequest(JSON.stringify(pi)))

    expect(mockTx.product.update).not.toHaveBeenCalled()
    expect(mockTx.order.update).toHaveBeenCalledOnce()
  })

  it('no hace nada cuando orderId está ausente en metadata', async () => {
    mockConstructEvent.mockReturnValue(
      makeEvent('payment_intent.succeeded', { metadata: {}, latest_charge: null }),
    )

    const res = await POST(makeRequest('{}'))
    expect(res.status).toBe(200)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('no hace nada cuando la orden no está en estado pendiente_pago', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_001' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue({ ...baseOrder, status: 'pagado' })

    await POST(makeRequest(JSON.stringify(pi)))
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it('envía email de ticket cuando la orden no tiene ticketEnviadoAt', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_001' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue({ ...baseOrder, ticketEnviadoAt: null })

    await POST(makeRequest(JSON.stringify(pi)))
    expect(vi.mocked(sendOrderTicket)).toHaveBeenCalledOnce()
  })

  it('no reenvía email si ticketEnviadoAt ya tiene valor', async () => {
    const pi = { metadata: { orderId: 'order-1' }, latest_charge: 'ch_001' }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.succeeded', pi))
    mockPrisma.order.findUnique.mockResolvedValue({
      ...baseOrder,
      ticketEnviadoAt: new Date(),
    })

    await POST(makeRequest(JSON.stringify(pi)))
    expect(vi.mocked(sendOrderTicket)).not.toHaveBeenCalled()
  })

  // ─── payment_intent.payment_failed ───────────────────────────────────────

  it('marca la orden como cancelado en payment_intent.payment_failed', async () => {
    const pi = { metadata: { orderId: 'order-1' } }
    mockConstructEvent.mockReturnValue(makeEvent('payment_intent.payment_failed', pi))

    const res = await POST(makeRequest(JSON.stringify(pi)))
    expect(res.status).toBe(200)
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'cancelado' } }),
    )
  })

  // ─── charge.refunded ─────────────────────────────────────────────────────

  it('marca la orden como reembolsado en charge.refunded', async () => {
    const charge = { payment_intent: 'pi_test_001' }
    mockConstructEvent.mockReturnValue(makeEvent('charge.refunded', charge))

    const res = await POST(makeRequest(JSON.stringify(charge)))
    expect(res.status).toBe(200)
    expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'reembolsado' } }),
    )
  })
})
