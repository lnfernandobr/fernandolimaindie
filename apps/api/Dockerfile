# syntax=docker/dockerfile:1.7
# Minimal image to run the API on any host (AWS Lightsail, ECS, EC2, Fly, Railway).
# Build:  docker build -t fernandolimaindie-api -f apps/api/Dockerfile .
# Run:    docker run -d --restart=always --name api -p 4000:4000 \
#           -v $(pwd)/apps/api/.env:/app/apps/api/.env \
#           fernandolimaindie-api

FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
RUN pnpm install --filter @fernandolimaindie/api... --frozen-lockfile

FROM node:24-alpine
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/api apps/api

WORKDIR /app/apps/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "start"]
