import XLSX from 'xlsx'
import pg from 'pg'
import { fileURLToPath } from 'url'
import path from 'path'
import { readFileSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Leer DATABASE_URL del .env
const envPath = path.resolve(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf8')
const dbUrlMatch = envContent.match(/^DATABASE_URL=(.+)$/m)
const DATABASE_URL = dbUrlMatch[1].trim().replace(/^["']|["']$/g, '')

const { Pool } = pg
const pool = new Pool({ connectionString: DATABASE_URL })

const XLSX_PATH = path.resolve(__dirname, '../docs/DIAGNOSTICOS_20240416.xlsx')

async function main() {
  console.log('Leyendo catálogo CIE-10…')
  const buf = readFileSync(XLSX_PATH)
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })

  // Encabezados en fila 0
  const [headers, ...data] = rows
  const idx = {
    key: headers.indexOf('CATALOG_KEY'),
    nombre: headers.indexOf('NOMBRE'),
    capitulo: headers.indexOf('CAPITULO'),
    nocar: headers.indexOf('NO. CARACTERES'),
  }

  // Solo códigos con 3-7 caracteres (excluir categorías de letras sueltas)
  const registros = data
    .filter(r => r[idx.key] && r[idx.nombre] && String(r[idx.key]).length >= 3)
    .map(r => ({
      codigo: String(r[idx.key]).trim(),
      descripcion: String(r[idx.nombre]).trim(),
      categoria: r[idx.capitulo] ? String(r[idx.capitulo]).trim() : null,
    }))

  console.log(`Total registros a importar: ${registros.length}`)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('DELETE FROM cie10_catalog')

    const BATCH = 500
    for (let i = 0; i < registros.length; i += BATCH) {
      const batch = registros.slice(i, i + BATCH)
      const values = batch.map((r, j) => {
        const base = j * 3
        return `($${base + 1}, $${base + 2}, $${base + 3})`
      }).join(',')
      const params = batch.flatMap(r => [r.codigo, r.descripcion, r.categoria])
      await client.query(
        `INSERT INTO cie10_catalog (codigo, descripcion, categoria) VALUES ${values} ON CONFLICT (codigo) DO UPDATE SET descripcion = EXCLUDED.descripcion, categoria = EXCLUDED.categoria`,
        params
      )
      if ((i / BATCH) % 10 === 0) process.stdout.write(`  ${i + batch.length}/${registros.length}\r`)
    }

    await client.query('COMMIT')
    console.log(`\nImportación completada: ${registros.length} diagnósticos cargados.`)
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch(e => { console.error(e); process.exit(1) })
