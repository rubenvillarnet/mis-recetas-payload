# Requiere `output: 'standalone'` en next.config.ts (ya configurado).
# Basado en https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci exige que el lockfile describa exactamente cada dependencia
# opcional/peer (yjs y monaco-editor de richtext-lexical, testing-library
# de las devDependencies...), y esas se resuelven de forma no determinista
# entre `npm install` y `npm ci` incluso con el lockfile recién regenerado.
# `npm install` es la solución pragmática estándar para este caso.
RUN npm install

# El build ejecuta generateStaticParams, que consulta Postgres y necesita
# conectividad real en tiempo de build (Neon es accesible desde cualquier
# red, así que basta con pasar las credenciales reales como build-args).
FROM base AS builder
WORKDIR /app
ARG DATABASE_URL
ARG PAYLOAD_SECRET
ARG S3_BUCKET
ARG S3_ENDPOINT
ARG S3_REGION
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_PUBLIC_HOSTNAME
ENV DATABASE_URL=$DATABASE_URL \
  PAYLOAD_SECRET=$PAYLOAD_SECRET \
  S3_BUCKET=$S3_BUCKET \
  S3_ENDPOINT=$S3_ENDPOINT \
  S3_REGION=$S3_REGION \
  S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID \
  S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY \
  S3_PUBLIC_HOSTNAME=$S3_PUBLIC_HOSTNAME \
  NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# server.js lo genera `next build` a partir de output: 'standalone'
CMD ["node", "server.js"]
