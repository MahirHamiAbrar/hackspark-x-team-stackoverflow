# ── Stage 1: install production deps ─────────────────────────────────────────
FROM oven/bun:1.1.13-slim AS deps
WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# ── Stage 2: install all deps + build ────────────────────────────────────────
FROM oven/bun:1.1.13-slim AS build
WORKDIR /usr/src/app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src ./src
# Try to bundle, but langchain may not bundle cleanly
RUN bun build src/index.ts --outdir dist --target bun || true

# ── Stage 3: lean runtime image ───────────────────────────────────────────────
FROM oven/bun:1.1.13-slim AS runtime
WORKDIR /usr/src/app
ENV NODE_ENV=production
ARG PORT=8004
ENV PORT=$PORT

# Copy production node_modules (needed for langchain/mongo native deps)
COPY --from=deps  /usr/src/app/node_modules ./node_modules
# Copy source (fallback if bundle fails)
COPY src ./src
COPY package.json ./
# Copy bundle if it exists
COPY --from=build /usr/src/app/dist ./dist

USER bun
EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD bun -e "try { const r = await fetch('http://127.0.0.1:' + (process.env.PORT || '8004') + '/status'); if (!r.ok) process.exit(1); } catch { process.exit(1); }"
CMD ["bun", "src/index.ts"]