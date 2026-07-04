# ---- builder: install all deps, compile TS -> JS, then drop devDeps ----
FROM node:22-bookworm-slim AS builder
WORKDIR /app
# Toolchain for building native modules (better-sqlite3, sqlite3) if a
# prebuilt binary isn't available for this platform.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# Install everything (incl. devDeps: typescript) so we can compile.
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
# Compile src/*.ts -> dist/*.js (tsconfig: outDir=dist, ESM/NodeNext).
RUN npm run build
# Remove devDeps now that compilation is done; the already-built native
# production modules (gtfs -> better-sqlite3, sqlite3) are kept.
RUN npm prune --omit=dev

# ---- runtime: slim, glibc, no compiler, no tsx ----
FROM node:22-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends tzdata ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
# package.json provides "type": "module" so Node runs dist/*.js as ESM.
COPY package.json ./
COPY gtfs-config ./gtfs-config
# site/ is provided at runtime via bind mount; create it so the path exists.
RUN mkdir -p /app/site && chown -R node:node /app
USER node
# import THEN extract, sharing one gtfs.sqlite; exit code = extract's.
# `&&` mirrors the two-ExecStart behavior of the old systemd unit.
ENTRYPOINT ["/bin/sh","-c","node dist/import.js && node dist/extract-data.js"]
