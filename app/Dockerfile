# syntax=docker/dockerfile:1

# ─── base ───────────────────────────────────────────────────────────────────
# libc6-compat es necesaria en Alpine para paquetes con binarios nativos
# (p. ej. sharp, usado por la optimización de imágenes de next/image).
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── deps ───────────────────────────────────────────────────────────────────
# Capa cacheable: solo se reinstala si cambian package*.json o el schema.
# El schema de Prisma debe estar presente porque "postinstall" corre
# `prisma generate` automáticamente al final de `npm ci`.
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ─── builder ────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# El cliente de Prisma (src/generated/prisma) va en .dockerignore, así que el
# "postinstall" de la etapa deps no alcanza a esta capa: se regenera aquí.
RUN npx prisma generate
RUN npm run build

# ─── dev ────────────────────────────────────────────────────────────────────
# Target usado por el perfil "dev" de docker-compose (hot reload con
# `next dev`, bind-mount del código fuente).
FROM deps AS dev
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─── runner ─────────────────────────────────────────────────────────────────
# Imagen final de producción: solo el output "standalone" de Next.js
# (server.js + el subconjunto de node_modules que realmente se usa).
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# El cliente de Prisma se genera en una ruta custom (src/generated/prisma, ver
# prisma/schema.prisma). El trace automático de Next suele detectarlo, pero se
# copia explícito como salvaguarda por si el adapter de pg trae assets no-JS.
COPY --from=builder --chown=nextjs:nodejs /app/src/generated/prisma ./src/generated/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
