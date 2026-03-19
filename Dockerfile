# ── Production image ──
FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY scenarios ./scenarios
copy studies ./studies
COPY server.mjs ./
COPY next.config.mjs ./
COPY scripts ./scripts

# Unpack pre-built Next.js output
COPY .next.tar.gz ./
RUN tar -xzf .next.tar.gz && rm .next.tar.gz

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.mjs"]