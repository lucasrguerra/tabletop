FROM node:22-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY public ./public
COPY scenarios ./scenarios
COPY server.mjs ./
COPY next.config.mjs ./
COPY scripts ./scripts
COPY app ./app
COPY components ./components
COPY database ./database
COPY models ./models
COPY utils ./utils

RUN npm run build

FROM node:22-slim
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/public ./public
COPY --from=builder /app/scenarios ./scenarios
COPY --from=builder /app/server.mjs ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.next ./.next

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.mjs"]
