import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database…')

  // ─── Services ──────────────────────────────────────────────────────────────
  await prisma.service.deleteMany()
  await prisma.service.create({
    data: { name: 'Consulta', durationMins: 30 },
  })

  // ─── Staff users ───────────────────────────────────────────────────────────
  // Las contraseñas se leen de variables de entorno. Si no están definidas se
  // usa un valor temporal y mustChangePassword=true fuerza el cambio al primer login.
  const fallback = 'Cambiar123!'
  const staffSeed = [
    {
      email: 'drviverosorl@gmail.com',
      name: 'Dr. Alejandro Viveros Domínguez',
      role: 'medico' as const,
      password: process.env.SEED_PASSWORD_MEDICO ?? fallback,
    },
    {
      email: 'carmen.salinas@viverosorl.com',
      name: 'Lic. Carmen Salinas Ruiz',
      role: 'recepcionista' as const,
      password: process.env.SEED_PASSWORD_RECEPCIONISTA ?? fallback,
    },
    {
      email: 'patricia.morales@viverosorl.com',
      name: 'Enf. Patricia Morales Díaz',
      role: 'enfermera' as const,
      password: process.env.SEED_PASSWORD_ENFERMERA ?? fallback,
    },
  ]

  for (const u of staffSeed) {
    const usingFallback = u.password === fallback
    const passwordHash = await bcrypt.hash(u.password, 12)
    await prisma.staffUser.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name, role: u.role, mustChangePassword: usingFallback },
      create: { email: u.email, name: u.name, role: u.role, passwordHash, mustChangePassword: usingFallback },
    })
    console.log(`  ✓ ${u.name} (${u.role})${usingFallback ? ' — ⚠️  contraseña temporal, debe cambiarse' : ''}`)
  }

  console.log('\nSeed completo.')
  if (!process.env.SEED_PASSWORD_MEDICO) {
    console.log('⚠️  Define SEED_PASSWORD_MEDICO, SEED_PASSWORD_RECEPCIONISTA y SEED_PASSWORD_ENFERMERA en .env para usar contraseñas reales.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
