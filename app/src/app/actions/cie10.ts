'use server'

import { prisma } from '@/lib/prisma'

export interface Cie10Result {
  codigo: string
  descripcion: string
  categoria: string | null
}

export async function searchCie10(query: string): Promise<Cie10Result[]> {
  if (!query || query.trim().length < 2) return []

  const q = query.trim()

  const results = await prisma.cie10.findMany({
    where: {
      OR: [
        { codigo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 50,
    orderBy: [{ codigo: 'asc' }],
  })

  return results
}
