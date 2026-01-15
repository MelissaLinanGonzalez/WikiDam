# Usamos la versión SLIM (Debian) en lugar de Alpine para evitar errores de librerías
FROM node:20-slim AS base

# Instalamos OpenSSL, obligatorio para que Prisma funcione en Linux
RUN apt-get update -y && apt-get install -y openssl

# Preparamos las dependencias
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# Construimos la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# --- CAMBIO AQUÍ: Quitamos el "|| true" ---
# Esto obliga al build a completarse correctamente o mostrar el error real.
RUN npm run build

# Preparamos la imagen final
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiamos los archivos necesarios
COPY --from=builder /app/public ./public
# Esta es la línea que fallaba antes porque el build anterior no generaba la carpeta:
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]