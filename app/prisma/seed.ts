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
  const services = [
    { name: 'Consulta General ORL', description: 'Evaluación de oídos, nariz y garganta', durationMins: 30 },
    { name: 'Consulta de Seguimiento', description: 'Revisión de tratamiento en curso', durationMins: 20 },
    { name: 'Audiometría', description: 'Evaluación de la audición', durationMins: 45 },
    { name: 'Endoscopía Nasal', description: 'Revisión endoscópica de fosas nasales', durationMins: 30 },
    { name: 'Cirugía de Oído', description: 'Procedimiento quirúrgico en oído', durationMins: 90 },
    { name: 'Rinoplastia Funcional', description: 'Corrección funcional de tabique', durationMins: 120 },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name }, // workaround: use name as lookup
      update: {},
      create: service,
    })
  }

  // ─── Staff users ───────────────────────────────────────────────────────────
  const staffSeed = [
    {
      email: 'drviverosorl@gmail.com',
      name: 'Dr. Alejandro Viveros Domínguez',
      role: 'medico' as const,
      // CAMBIA ESTA CONTRASEÑA antes de usar en producción
      password: 'Cambiar123!',
    },
    {
      email: 'carmen.salinas@viverosorl.com',
      name: 'Lic. Carmen Salinas Ruiz',
      role: 'recepcionista' as const,
      password: 'Cambiar123!',
    },
    {
      email: 'patricia.morales@viverosorl.com',
      name: 'Enf. Patricia Morales Díaz',
      role: 'enfermera' as const,
      password: 'Cambiar123!',
    },
  ]

  for (const u of staffSeed) {
    const passwordHash = await bcrypt.hash(u.password, 12)
    await prisma.staffUser.upsert({
      where: { email: u.email },
      update: { passwordHash, name: u.name, role: u.role },
      create: { email: u.email, name: u.name, role: u.role, passwordHash },
    })
    console.log(`  ✓ ${u.name} (${u.role})`)
  }

  console.log('\nSeed completo.')
  console.log('⚠️  Cambia las contraseñas antes de usar en producción.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
