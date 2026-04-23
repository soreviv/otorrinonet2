# OtorrinoNet — App (Next.js)

Aplicación Next.js 16 del proyecto OtorrinoNet. Consulta el README principal en la raíz del repositorio para documentación completa.

## Desarrollo rápido

```bash
npm install
cp .env.example .env   # configurar DATABASE_URL y JWT_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Servidor disponible en [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run db:migrate   # Aplicar migraciones Prisma
npm run db:seed      # Cargar datos iniciales
npm run db:studio    # Abrir Prisma Studio
```
