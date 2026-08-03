/**
 * Push notifications al staff vía ntfy autoalojado (https://ntfy.otorrinonet.com).
 * El Dr. Viveros se suscribe al topic desde la app ntfy con el usuario dr-viveros (solo lectura).
 * Complementa —no reemplaza— las notificaciones por correo en src/lib/mailer.ts.
 */

interface StaffPushOptions {
  title: string
  message: string
  /** Prioridad ntfy: 1 (min) a 5 (max/urgente). Default: 3 (default). */
  priority?: 1 | 2 | 3 | 4 | 5
  /** Emojis/tags cortos, ej. ['calendar', 'bell'] — ver https://docs.ntfy.sh/emojis/ */
  tags?: string[]
  /** URL a abrir al tocar la notificación, ej. deep-link al staff panel */
  click?: string
}

export async function sendStaffPush(options: StaffPushOptions): Promise<void> {
  const baseUrl = process.env.NTFY_BASE_URL
  const topic = process.env.NTFY_STAFF_TOPIC
  const token = process.env.NTFY_STAFF_TOKEN

  if (!baseUrl || !topic || !token) {
    console.warn('[ntfy] Variables de entorno no configuradas, se omite el push')
    return
  }

  try {
    const res = await fetch(`${baseUrl}/${topic}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: options.title,
        message: options.message,
        priority: options.priority ?? 3,
        tags: options.tags,
        click: options.click,
      }),
    })
    if (!res.ok) {
      console.error(`[ntfy] Error enviando push: ${res.status} ${await res.text()}`)
    }
  } catch (err) {
    console.error('[ntfy] Error enviando push:', err)
  }
}
