# ── Dependencies ──
# Cached separately from the sources so a code change does not reinstall
# node_modules on every build.
FROM node:22-alpine AS deps
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ── Builder ──
# Compiles the app. `output: 'standalone'` traces only the dependencies the app
# actually reaches, which is what keeps the runtime image small.
FROM node:22-alpine AS builder
WORKDIR /build

COPY --from=deps /build/node_modules ./node_modules
COPY package.json package-lock.json next.config.mjs jsconfig.json postcss.config.mjs ./
COPY app ./app
COPY components ./components
COPY database ./database
COPY models ./models
COPY utils ./utils
COPY public ./public
COPY scenarios ./scenarios
COPY studies ./studies
COPY proxy.js ./

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

ENV STANDALONE=/build/.next/standalone

# Next does not trace the custom server, so socket.io and its transitive deps
# are installed separately and merged into the traced tree.
RUN SOCKET_IO=$(node -p "require('./package.json').dependencies['socket.io']") \
	&& npm install --prefix /deps --omit=dev --no-audit --no-fund --no-package-lock "socket.io@$SOCKET_IO" \
	# Copied entry by entry, skipping names the traced tree already provides:
	# BusyBox `cp -n` silently copies nothing here, and blindly overwriting
	# could swap a package Next traced for a different version.
	&& for pkg in /deps/node_modules/*; do \
		target="$STANDALONE/node_modules/$(basename "$pkg")"; \
		[ -e "$target" ] || cp -R "$pkg" "$target"; \
	done \
	&& test -d "$STANDALONE/node_modules/socket.io"

# Assets Next keeps outside the standalone bundle by design.
RUN cp -r /build/.next/static "$STANDALONE/.next/static"

# Standalone mirrors the project root, which drags in the sources and tooling
# configs. Everything the server needs is already compiled into .next/server,
# so only the data read from disk at runtime is kept.
WORKDIR /build/.next/standalone
RUN rm -rf app components database models utils tests scripts public \
		node_modules/@types \
		*.md *.txt jsconfig.json postcss.config.mjs vitest.config.mjs \
		playwright.config.mjs proxy.js docker-compose.yml Dockerfile \
		package-lock.json server.js

# ── Production image ──
# Plain Alpine plus the distro's nodejs: same Node build as node:22-alpine at
# roughly half the size, since it omits npm, the C++ headers and the toolchain.
FROM alpine:3.22 AS runner

RUN apk add --no-cache nodejs \
	&& adduser -D -u 1000 node

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# --chown on each copy: a `chown -R` afterwards would rewrite every file and
# duplicate the whole tree into a second layer.
COPY --from=builder --chown=node:node /build/.next/standalone ./
COPY --chown=node:node public ./public
COPY --chown=node:node scenarios ./scenarios
COPY --chown=node:node studies ./studies
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node server.mjs ./

EXPOSE 3000
USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.mjs"]
