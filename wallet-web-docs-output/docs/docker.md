# Docker and Compose Integration

Each deployable repository owns its own Dockerfile. The local infrastructure repository owns multi-service orchestration.

## Repository Responsibility

```text
wallet-web/
  Dockerfile

wallet-service/
  Dockerfile

api-gateway/
  Dockerfile

wallet-local-infra/
  docker-compose.yml
```

## Production Dockerfile

```dockerfile
# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

## Compose Service

```yaml
wallet-web:
  build:
    context: ../wallet-web
    dockerfile: Dockerfile
    args:
      NEXT_PUBLIC_API_BASE_URL: http://localhost:8080
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      NEXT_PUBLIC_RAZORPAY_KEY_ID: ${NEXT_PUBLIC_RAZORPAY_KEY_ID}
  container_name: wallet-web
  ports:
    - "3000:3000"
  depends_on:
    - api-gateway
  networks:
    - wallet-network
```

## Image Build Verification

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
  --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
  -t wallet-web:local .

docker run --rm -p 3000:3000 wallet-web:local
```
