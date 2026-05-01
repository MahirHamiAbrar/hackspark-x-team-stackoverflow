# ── Stage 1: install ALL deps (Bun for speed) ────────────────────────────────
FROM oven/bun:1.2-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: build Nuxt app ───────────────────────────────────────────────────
FROM oven/bun:1.2-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
# Copy all source files (including root index.js imported by controllers)
COPY app.vue nuxt.config.ts tsconfig.json index.js ./
COPY app          ./app
COPY pages        ./pages
COPY layouts      ./layouts
COPY components   ./components
COPY controllers  ./controllers
COPY services     ./services
COPY store        ./store
COPY utils        ./utils
COPY components    ./components
COPY assets        ./assets
COPY public       ./public
# Nuxt build → self-contained server in .output/
RUN bun run build

# ── Stage 3: lean runtime ─────────────────────────────────────────────────────
FROM oven/bun:1.2-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ARG PORT=3000
ENV PORT=$PORT
ENV HOST=0.0.0.0

# Only the compiled output is needed — no source, no node_modules
COPY --from=build /app/.output ./.output

USER bun
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD bun -e "try { const r = await fetch('http://127.0.0.1:' + (process.env.PORT||'3000') + '/'); if (!r.ok) process.exit(1); } catch { process.exit(1); }"
CMD ["bun", ".output/server/index.mjs"]