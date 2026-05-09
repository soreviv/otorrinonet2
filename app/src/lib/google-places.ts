import { prisma } from '@/lib/prisma'
import type { GoogleReview, GoogleRatingSummary } from '@/lib/sitio-publico-types'
import { googleRatingSummary as staticSummary, googleReviews as staticReviews } from '@/lib/sitio-publico-data'

const PLACE_ID = 'ChIJ0R5OAqT5BIYR1jEuvyIO4M4'
const REVIEW_WRITE_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`

export { REVIEW_WRITE_URL }

interface PlacesApiReview {
  relativePublishTimeDescription?: string
  rating: number
  text?: { text: string; languageCode: string }
  authorAttribution: { displayName: string; photoUri?: string }
  publishTime?: string
  name: string
}

interface PlacesApiResponse {
  reviews?: PlacesApiReview[]
  rating?: number
  userRatingCount?: number
}

interface CachedData {
  reviews: GoogleReview[]
  rating: number
  userRatingCount: number
}

function mapReview(r: PlacesApiReview, idx: number): GoogleReview {
  const name = r.authorAttribution.displayName
  const parts = name.trim().split(/\s+/)
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()

  return {
    id: `google-${idx}`,
    authorName: name,
    authorInitials: initials,
    rating: Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5,
    text: r.text?.text ?? '',
    date: r.relativePublishTimeDescription ?? '',
    source: 'Google',
  }
}

export async function fetchAndCacheGoogleReviews(): Promise<{ reviews: GoogleReview[]; summary: GoogleRatingSummary }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY no configurada')

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${PLACE_ID}`,
    {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
        'Accept-Language': 'es-MX',
      },
      cache: 'no-store',
    },
  )

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Google Places API error ${res.status}: ${body}`)
  }

  const data: PlacesApiResponse = await res.json()
  const reviews = (data.reviews ?? []).map(mapReview)
  const cached: CachedData = {
    reviews,
    rating: data.rating ?? staticSummary.averageRating,
    userRatingCount: data.userRatingCount ?? staticSummary.totalReviews,
  }

  await prisma.clinicConfig.upsert({
    where: { id: 'singleton' },
    update: { googleReviewsJson: cached as object, googleReviewsCachedAt: new Date() },
    create: { id: 'singleton', googleReviewsJson: cached as object, googleReviewsCachedAt: new Date() },
  })

  return {
    reviews,
    summary: {
      averageRating: cached.rating,
      totalReviews: cached.userRatingCount,
      placeId: PLACE_ID,
      googleMapsUrl: staticSummary.googleMapsUrl,
    },
  }
}

export async function getCachedGoogleReviews(): Promise<{ reviews: GoogleReview[]; summary: GoogleRatingSummary }> {
  try {
    const cfg = await prisma.clinicConfig.findUnique({
      where: { id: 'singleton' },
      select: { googleReviewsJson: true, googleReviewsCachedAt: true },
    })

    if (cfg?.googleReviewsJson) {
      const cached = cfg.googleReviewsJson as unknown as CachedData
      if (cached.reviews?.length) {
        return {
          reviews: cached.reviews,
          summary: {
            averageRating: cached.rating ?? staticSummary.averageRating,
            totalReviews: cached.userRatingCount ?? staticSummary.totalReviews,
            placeId: PLACE_ID,
            googleMapsUrl: staticSummary.googleMapsUrl,
          },
        }
      }
    }
  } catch {
    // fall through to static
  }

  return { reviews: staticReviews, summary: staticSummary }
}
