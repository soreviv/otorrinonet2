---
name: tienda
description: Convenciones de la tienda en línea de OtorrinoNet (carrito, stock, Stripe, checkout) — úsalo al tocar `src/app/actions/tienda.ts`, `tienda-admin.ts`, el webhook de Stripe, o `useCarrito`.
---

## Tienda en línea

- Carrito en `localStorage` via `useCarrito` — no en BD ni cookies.
- Stock se decrementa **solo** en webhook `payment_intent.succeeded`.
- Idempotencia: `StripeWebhookEvent` con PK = `event.id` de Stripe.
- Imágenes en `/public/assets/tienda/` — upload via API `/api/tienda/upload-imagen`.
- Variables de entorno requeridas: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `TIENDA_COSTO_ENVIO_CENTAVOS`.
