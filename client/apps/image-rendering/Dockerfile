# syntax=docker/dockerfile:1
FROM node:22-alpine AS prune
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable
COPY . .
RUN npx turbo prune image-rendering --docker

FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable
COPY --from=prune /app/out/json/ .
COPY --from=prune /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=prune /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
ARG NEXT_PUBLIC_API_URL
ARG BACKEND_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL
RUN pnpm turbo run build --filter=image-rendering

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=build --chown=nextjs:nodejs /app/apps/image-rendering/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/image-rendering/.next/static ./apps/image-rendering/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/image-rendering/server.js"]
