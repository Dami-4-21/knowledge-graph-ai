# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first (layer-cached unless package.json changes)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Build Vite frontend only
RUN npx vite build

# ── Stage 2: Runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Force Node's built-in fetch (undici) to prefer IPv4.
# Docker bridge networks have no IPv6 routing, so undici's default IPv6-first
# preference causes ETIMEDOUT on every outbound TLS connection.
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Install ALL deps (including tsx for running server.ts directly in prod)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy the full source (server.ts + src/services needed at runtime)
COPY --from=builder /app/dist ./dist
COPY server.ts ./server.ts
COPY src/services ./src/services
COPY tsconfig.json ./tsconfig.json



EXPOSE ${PORT}

# Run server.ts directly with tsx (avoids ESM/CJS bundling issues)
CMD ["npx", "tsx", "server.ts"]
