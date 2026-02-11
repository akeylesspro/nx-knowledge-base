# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml .npmrc* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG ENV
RUN if [ -z "$ENV" ]; then echo "ENV build argument is required" && exit 1; fi
COPY env/${ENV}/.env .env

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8004

ENV PORT=8004
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8004', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]
