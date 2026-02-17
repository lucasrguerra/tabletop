FROM node:22-slim

WORKDIR /usr/src/app
COPY package*.json ./

RUN apt-get update && apt-get install -y curl jq unzip
RUN npm ci
COPY public ./public

COPY .next.zip ./
RUN mkdir -p ./next && \
    if [ -f .next.zip ]; then unzip .next.zip -d .; else echo ".next.zip not found, skipping unzip"; fi

EXPOSE $PORT

CMD ["npm", "start"]