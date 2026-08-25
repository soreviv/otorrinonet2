import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/dal'
import { fetchAndCacheGoogleReviews } from '@/lib/google-places'

export async function POST() {
  try {
    const session = await verifySession()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { reviews, summary } = await fetchAndCacheGoogleReviews()
    return NextResponse.json({ ok: true, count: reviews.length, rating: summary.averageRating, total: summary.totalReviews })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error desconocido'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
