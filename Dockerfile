# ─── Stage 1: builder ────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Copy manifests first to leverage layer caching — rebuilds only when deps change
COPY package*.json ./
RUN npm ci

COPY . .
RUN HUSKY=0 npm run build

# ─── Stage 2: runner ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner

ENV NODE_ENV=production
# Bind on all interfaces inside the container (default 127.0.0.1 would be unreachable)
ENV SERVER_ADDRESS=0.0.0.0

WORKDIR /app

COPY package*.json ./
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO /dev/null http://localhost:3000/health

# Use the built-in non-root user from the official Node image
USER node


CMD ["node", "dist/main.js"]
