# syntax=docker/dockerfile:1

# ==============================================================================
# Base stage: Node.js 20 Alpine con utilidades del sistema
# ==============================================================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# ==============================================================================
# Dependencies stage: Instalación limpia de paquetes y generación de Prisma
# ==============================================================================
FROM base AS deps
WORKDIR /app

# Copiar archivos de dependencias y schema de Prisma (para el script postinstall)
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Instalar todas las dependencias
RUN npm ci

# ==============================================================================
# Builder stage: Compilación de Next.js (output standalone)
# ==============================================================================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desactivar telemetría de Next.js durante la compilación
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Regenerar cliente Prisma y compilar la aplicación
RUN npx prisma generate
RUN npm run build

# ==============================================================================
# Runner stage: Imagen final de producción mínima y segura
# ==============================================================================
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=5000
ENV HOSTNAME="0.0.0.0"

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Crear usuario y grupo sin privilegios
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar assets estáticos públicos
COPY --from=builder /app/public ./public

# Crear directorio .next y ajustar permisos
RUN mkdir .next && chown nextjs:nodejs .next

# Copiar el servidor standalone y los assets generados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 5000

# Healthcheck básico
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/ || exit 1

CMD ["node", "server.js"]
