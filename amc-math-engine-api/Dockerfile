# syntax = docker/dockerfile:1
FROM node:20-slim AS deps
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

FROM node:20-slim AS builder
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma
RUN pnpm run prisma:generate
COPY . .
RUN pnpm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
RUN corepack enable
ENV NODE_ENV=production
COPY --from=builder /app/prisma ./prisma
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod
RUN pnpm run prisma:generate
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
EXPOSE 3000
CMD ["pnpm","run","start:prod"]
