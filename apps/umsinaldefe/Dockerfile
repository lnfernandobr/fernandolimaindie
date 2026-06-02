# syntax=docker/dockerfile:1.7
# Imagem pra rodar o Um Sinal de Fé em produção, com cron de geração de conteúdo.
#
# Build:  docker build -t umsinaldefe -f apps/umsinaldefe/Dockerfile .
# Run:    docker run -d --restart=always --name umsinaldefe -p 3001:3001 \
#           -e ELEVENLABS_API_KEY=sk_... \
#           -e ELEVENLABS_VOICE_ID=49Tv7p2Lhmi23Edp9DOI \
#           -e OPENAI_API_KEY=sk-... \
#           -e PEXELS_API_KEY=... \
#           umsinaldefe

# ── Stage 1: deps ────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/umsinaldefe/package.json apps/umsinaldefe/
RUN pnpm install --filter @fernandolimaindie/umsinaldefe... --frozen-lockfile

# ── Stage 2: build ───────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app /app
COPY pnpm-workspace.yaml package.json ./
COPY apps/umsinaldefe apps/umsinaldefe
WORKDIR /app/apps/umsinaldefe
ENV NODE_ENV=production
RUN pnpm build

# ── Stage 3: runner ──────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app/apps/umsinaldefe
RUN corepack enable && apk add --no-cache tini

COPY --from=builder /app /app

# Cron horário: o script (--cron) só gera na hora configurada no admin
# (cron-config.json -> scheduleHourUtc) e, quando gera, reconstrói o site.
# O generate sai com código != 0 quando NÃO gera (hora errada, fila vazia, desativado),
# então o "&& pnpm build" só roda quando há conteúdo novo.
# Obs.: pra SERVIR o novo build, o container precisa reiniciar o next (ou usar redeploy).
RUN echo '0 * * * * cd /app/apps/umsinaldefe && node scripts/generate-post.mjs --cron >> /var/log/cron.log 2>&1 && pnpm build >> /var/log/cron.log 2>&1' > /etc/crontabs/root

ENV NODE_ENV=production
EXPOSE 3001

# tini garante que sinais de shutdown chegam pro Next.js e pro crond.
ENTRYPOINT ["/sbin/tini", "--"]
CMD sh -c "crond -b && pnpm start"
