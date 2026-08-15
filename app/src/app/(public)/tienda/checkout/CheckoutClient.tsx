'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCarrito } from '@/hooks/useCarrito'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { stripePromise } from '@/lib/stripe-client'
import { crearOrdenYPaymentIntent } from '@/app/actions/tienda'
import { ArrowLeft, Loader2, MapPin, Truck, AlertTriangle, ShoppingBag, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { DatosComprador } from '@/lib/schemas/tienda'

const INPUT_CLS =
  'w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all text-sm'

const LABEL_CLS = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5'

// ── Formulario de datos del comprador ──────────────────────────────────────────

interface DatosForm {
  nombre: string
  email: string
  telefono: string
  shippingChoice: 'pickup' | 'domicilio'
  calle: string
  numero: string
  colonia: string
  municipio: string
  estado: string
  cp: string
}

const EMPTY: DatosForm = {
  nombre: '', email: '', telefono: '',
  shippingChoice: 'pickup',
  calle: '', numero: '', colonia: '', municipio: '', estado: '', cp: '',
}

interface StepDatosProps {
  permiteEnvio: boolean
  onConfirm: (datos: DatosComprador) => Promise<void>
  loading: boolean
  error: string | null
}

function StepDatos({ permiteEnvio, onConfirm, loading, error }: StepDatosProps) {
  const [form, setForm] = useState<DatosForm>(EMPTY)

  const set = (k: keyof DatosForm, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const datos: DatosComprador = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono || undefined,
      shippingChoice: form.shippingChoice,
      ...(form.shippingChoice === 'domicilio'
        ? {
            direccion: {
              calle: form.calle,
              numero: form.numero,
              colonia: form.colonia,
              municipio: form.municipio,
              estado: form.estado,
              cp: form.cp,
            },
          }
        : {}),
    }
    await onConfirm(datos)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Datos personales */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Datos de contacto</h3>

        <div>
          <label className={LABEL_CLS}>Nombre completo *</label>
          <input
            type="text"
            className={INPUT_CLS}
            required
            minLength={2}
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            placeholder="Tu nombre completo"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>Correo electrónico *</label>
            <input
              type="email"
              className={INPUT_CLS}
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div>
            <label className={LABEL_CLS}>Teléfono</label>
            <input
              type="tel"
              className={INPUT_CLS}
              value={form.telefono}
              onChange={e => set('telefono', e.target.value)}
              placeholder="55 1234 5678 (opcional)"
            />
          </div>
        </div>
      </div>

      {/* Método de entrega */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Método de entrega</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pickup */}
          <button
            type="button"
            onClick={() => set('shippingChoice', 'pickup')}
            className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left ${
              form.shippingChoice === 'pickup'
                ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300'
            }`}
          >
            <MapPin className={`w-6 h-6 ${form.shippingChoice === 'pickup' ? 'text-sky-600' : 'text-slate-400'}`} />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Recoger en consultorio</p>
              <p className="text-xs text-slate-500 mt-1">Sin costo de envío</p>
              <p className="text-xs text-slate-400 mt-1">Torre Diamante, Piso 2, Consultorio 201</p>
            </div>
          </button>

          {/* Domicilio */}
          <button
            type="button"
            disabled={!permiteEnvio}
            onClick={() => permiteEnvio && set('shippingChoice', 'domicilio')}
            className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 transition-all text-left ${
              !permiteEnvio
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-700'
                : form.shippingChoice === 'domicilio'
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sky-300'
            }`}
          >
            <Truck className={`w-6 h-6 ${form.shippingChoice === 'domicilio' ? 'text-sky-600' : 'text-slate-400'}`} />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Envío a domicilio</p>
              <p className="text-xs text-slate-500 mt-1">$150.00 MXN</p>
              {!permiteEnvio && (
                <p className="text-xs text-amber-600 mt-1">No disponible para tu selección</p>
              )}
            </div>
          </button>
        </div>

        {/* Dirección — solo si domicilio */}
        {form.shippingChoice === 'domicilio' && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Dirección de envío</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className={LABEL_CLS}>Calle *</label>
                <input type="text" className={INPUT_CLS} required value={form.calle} onChange={e => set('calle', e.target.value)} placeholder="Av. Ejemplo" />
              </div>
              <div>
                <label className={LABEL_CLS}>Número *</label>
                <input type="text" className={INPUT_CLS} required value={form.numero} onChange={e => set('numero', e.target.value)} placeholder="123 Int. 4" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Colonia *</label>
                <input type="text" className={INPUT_CLS} required value={form.colonia} onChange={e => set('colonia', e.target.value)} placeholder="Col. Centro" />
              </div>
              <div>
                <label className={LABEL_CLS}>Municipio / Alcaldía *</label>
                <input type="text" className={INPUT_CLS} required value={form.municipio} onChange={e => set('municipio', e.target.value)} placeholder="Cuauhtémoc" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLS}>Estado *</label>
                <input type="text" className={INPUT_CLS} required value={form.estado} onChange={e => set('estado', e.target.value)} placeholder="Ciudad de México" />
              </div>
              <div>
                <label className={LABEL_CLS}>Código Postal *</label>
                <input type="text" className={INPUT_CLS} required pattern="\d{5}" maxLength={5} value={form.cp} onChange={e => set('cp', e.target.value)} placeholder="06600" />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-sky-200 dark:shadow-none active:scale-[0.98]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
        {loading ? 'Procesando...' : 'Continuar al pago seguro'}
      </button>
    </form>
  )
}

// ── Formulario de pago con Stripe ──────────────────────────────────────────────

function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tienda/confirmacion`,
      },
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Error al procesar el pago.')
      setSubmitting(false)
    }
    // Si no hay error, Stripe redirige solo a return_url
  }

  return (
    <form onSubmit={handlePay} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">Pago seguro</h3>
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
            defaultValues: { billingDetails: { address: { country: 'MX' } } },
          }}
        />
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full flex items-center justify-center gap-2 py-4 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-sky-200 dark:shadow-none active:scale-[0.98]"
      >
        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
        {submitting ? 'Procesando pago...' : 'Pagar ahora'}
      </button>

      <p className="text-center text-xs text-slate-400">
        Pago procesado de forma segura por{' '}
        <span className="font-bold text-slate-500">Stripe</span>. No almacenamos datos de tu tarjeta.
      </p>
    </form>
  )
}

// ── Shell principal ────────────────────────────────────────────────────────────

export function CheckoutClient() {
  const { items, subtotal, permiteEnvio, loading } = useCarrito()
  const router = useRouter()

  const [step, setStep] = useState<'datos' | 'pago'>('datos')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && items.length === 0) {
      router.replace('/tienda/carrito')
    }
  }, [loading, items.length, router])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount / 100)

  const handleDatosConfirm = async (datos: DatosComprador) => {
    setProcesando(true)
    setErrorGlobal(null)

    const result = await crearOrdenYPaymentIntent({
      items: items.map(i => ({ productId: i.productId, cantidad: i.cantidad })),
      datosComprador: datos,
    })

    if (!result.ok) {
      setErrorGlobal(result.error)
      setProcesando(false)
      return
    }

    setClientSecret(result.clientSecret)
    setOrderId(result.orderId)
    setStep('pago')
    setProcesando(false)
  }

  if (loading) {
    return (
      <div className="py-20 text-center animate-pulse text-slate-400">
        Cargando...
      </div>
    )
  }

  const costoEnvio = 15000 // siempre se muestra estimado; el server calcula el real

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
      {/* Columna principal */}
      <div className="lg:col-span-2">
        {step === 'datos' && (
          <StepDatos
            permiteEnvio={permiteEnvio}
            onConfirm={handleDatosConfirm}
            loading={procesando}
            error={errorGlobal}
          />
        )}

        {step === 'pago' && clientSecret && orderId && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              locale: 'es-419',
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#0284c7',
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                },
              },
            }}
          >
            <StripePaymentForm />
          </Elements>
        )}
      </div>

      {/* Resumen lateral */}
      <div className="lg:col-span-1 order-first lg:order-last">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm sticky top-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Tu pedido</h2>

          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700">
                  {item.imagen ? (
                    <Image src={item.imagen} alt={item.nombre} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.nombre}</p>
                  <p className="text-xs text-slate-500">Cant: {item.cantidad}</p>
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-slate-100 shrink-0">
                  {formatCurrency(item.precioUnitario * item.cantidad)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-500 italic">
              <span>Envío (domicilio)</span>
              <span>+ {formatCurrency(costoEnvio)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-black text-slate-900 dark:text-slate-100">Total</span>
              <span className="font-black text-sky-600 dark:text-sky-400">{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs text-slate-400 italic">El costo de envío se suma al seleccionar domicilio.</p>
          </div>

          <Link
            href="/tienda/carrito"
            className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-sky-600 transition-colors mt-6 font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Modificar carrito
          </Link>
        </div>
      </div>
    </div>
  )
}
