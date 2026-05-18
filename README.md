# fernandolimaindie

Sistema multi-canal de blogs automatizados — monorepo com **API central**, **Admin** e **canal-template**.

## Visão geral

- **`apps/api`** — Backend Express + Mongoose. Modelos, autenticação (JWT), endpoints públicos consumidos pelos blogs, scheduler in-process (node-cron), pipeline modular de geração de conteúdo orquestrando uma camada de IA.
- **`apps/admin`** — Painel Next.js 16 onde Fernando configura **canais** e monitora **execuções**. Posts, autores, categorias e tags são gerados automaticamente — não há mais CRUD manual no painel.
- **`apps/sonoprofundo`** — Canal vivo (sleep blog) **e template de referência para clonar novos canais**. Next.js 16, SSR/ISR, JSON-LD completo, sitemap, RSS/Atom, `llms.txt`, layout responsivo, semântica acessível. Consome o pipeline IA da API. Para clonar este canal num projeto novo, ver `apps/sonoprofundo/SETUP.md`.
- **`packages/shared`** — Schemas Zod e DTOs compartilhados entre API e clients.

## Stack

| Camada       | Tecnologia                                               |
| ------------ | -------------------------------------------------------- |
| Runtime      | Node.js 22+ (testado com 24 LTS)                         |
| Pkg manager  | pnpm 10 + workspaces                                     |
| Linguagem    | TypeScript 5.9 estrito                                   |
| API          | Express 5, Mongoose 9, node-cron 4, cron-parser 5, JWT   |
| Admin        | Next.js 16, React 19, Tailwind 4, shadcn-style, sonner   |
| Canal-template | Next.js 16, React 19, Tailwind 4, marked, feed         |
| Validação    | Zod 4                                                    |
| Auth hash    | bcryptjs                                                 |

## Variáveis de ambiente

**Source of truth: [Doppler](https://doppler.com)**. Veja [`SECRETS.md`](SECRETS.md) pro setup completo.

```bash
doppler login                # uma vez
doppler setup                # escolhe project fernandolimaindie + config dev
pnpm dev                     # scripts já passam por `doppler run --`
```

Os arquivos `.env` em cada app ainda existem como **templates de prod** (commitados, sem valores). `.env.local` em dev é opcional — só faz sentido quando rodando sem Doppler. Os `.env.local.bak` dos apps são backups da migração inicial pro Doppler e estão gitignored.

Em prod:
- **VPS**: GitHub Actions puxa secrets do Doppler e copia o `.env` pro VPS antes de cada deploy
- **Vercel**: integração Doppler ↔ Vercel sincroniza automaticamente

## Pré-requisitos

- **Node.js 22+** (recomendado 24 LTS via nvm)
- **pnpm 10+** (`npm i -g pnpm`)
- **MongoDB Atlas** — em dev e prod usamos a mesma string. Coloque em `apps/api/.env` (template prod) ou `apps/api/.env.local` (override local).

## Setup

```bash
pnpm install
pnpm dev            # sobe API (4000), admin (3000), sonoprofundo (3002) em paralelo

# Ou individualmente:
pnpm dev:api
pnpm dev:admin
pnpm dev:sonoprofundo
```

Configure `MONGODB_URI` em `apps/api/.env.local` apontando para o Atlas antes de subir a API.

## Bootstrap automático

Ao subir a API pela primeira vez:

1. **Usuário admin Fernando** é criado.
   - Usuário: `fernando`
   - Senha: `Fz9mPx7Kq2vRtY8n`
2. **Canal `sonoprofundo`** é criado se ainda não existir, junto com 1 post mockado para validar o layout localmente. Em produção (`NODE_ENV=production`), só o canal vazio é criado — a pipeline real popula.
3. **Scheduler** carrega todos os canais ativos e registra os crons.

## Geração automática de conteúdo

Toda a operação editorial é automatizada. O painel só configura **canais** — categorias, tags e posts emergem da pipeline.

### Configuração por canal

Cada canal define:

- **Nome, nicho, domínio, idioma, timezone, cor primária**
- **Frequência de publicação**: `daily` / `weekly` / `custom`
- **Horários de publicação**: array de `HH:MM` (ex: `["09:00", "18:00"]`)
- **Posts por slot**: 1–10 (quantos posts a IA gera em cada horário)
- **Dias da semana**: subset de `[Dom..Sáb]`
- **Identidade editorial** (input para IA): público-alvo, tom de voz, diretrizes
- **Autor padrão**: nome usado em todos os posts (criado automaticamente se não existir)

O scheduler converte essa configuração em expressões cron e dispara a pipeline nos horários certos. Mudanças no painel são aplicadas imediatamente, sem reiniciar.

### Pipeline (ordem importa)

```
generate-article  →  ctx.article (título, conteúdo, excerpt, meta, faq, ...)
generate-image    →  ctx.cover (URL, alt, dimensões)
resolve-author    →  ctx.author (Fernando ou defaultAuthorName do canal)
resolve-category  →  ctx.category (IA escolhe entre existentes ou cria nova)
resolve-tags      →  ctx.tagSlugs (3-6 tags em kebab-case)
publish-post      →  grava o Post + dispara revalidação no blog
publish-instagram →  stub (loga apenas)
```

Cada step lê do `ctx` e escreve no `ctx`. Falha em uma etapa não-crítica preserva o que já foi feito (status `partial`).

### Camada de IA (`apps/api/src/ai/`)

```
ai/
├── types.ts                   # interface AIProvider, types de input/output
├── prompts/
│   └── index.ts               # mapper centralizado de TODOS os prompts
├── providers/
│   ├── MockProvider.ts        # gera conteúdo procedural útil pra dev (sem API externa)
│   ├── ClaudeProvider.ts      # esqueleto pronto pra plugar Anthropic SDK
│   ├── OpenAIProvider.ts      # esqueleto pronto pra plugar OpenAI SDK
│   └── index.ts               # factory baseado em AI_PROVIDER (cai pra mock se desabilitado)
└── tasks/
    ├── generateArticle.ts
    ├── generateCategory.ts
    ├── generateTags.ts
    ├── generateImage.ts
    └── shared.ts              # parseJson, slugify
```

**Como trocar de modelo**: muda `AI_PROVIDER=claude|openai|mock` no `.env.local` (ou `.env`) e recomeça. O resto do código não muda.

**Onde editar prompts**: `apps/api/src/ai/prompts/index.ts`. Tudo em um lugar só. Cada entrada exporta `system` (string) e `user` (função tipada). Tasks só consomem este módulo, não declaram prompts inline.

## Painel admin (rotas)

| Rota              | Descrição                                                        |
| ----------------- | ---------------------------------------------------------------- |
| `/login`          | Login (Fernando)                                                 |
| `/`               | Dashboard — canais ativos, próximas execuções, posts recentes    |
| `/canais`         | Lista de canais                                                  |
| `/canais/novo`    | Novo canal                                                       |
| `/canais/[id]`    | Edição do canal + lista dos últimos posts gerados nesse canal    |
| `/execucoes`      | Histórico de runs (cron + manual) com status por etapa           |

Na edição do canal há o botão **“Gerar post agora”**, que dispara `POST /api/v1/runs/trigger/:channelId`.

## Como validar

```bash
pnpm typecheck      # typecheck em todos os pacotes
pnpm dev            # sobe API + admin + sonoprofundo em paralelo
```

Smoke test (com Mongo Atlas + apps rodando):

```bash
curl http://localhost:4000/health
curl http://localhost:3000/login            # admin
curl http://localhost:3002/                 # sonoprofundo
curl http://localhost:3002/sitemap.xml
curl http://localhost:3002/llms.txt
```

## Limpeza de canais no Mongo

Para apagar um canal e tudo que pertence a ele (posts, categorias, autores, tags, runs):

```bash
pnpm --filter @fernandolimaindie/api remove-channel -- <slug>
```

## SEO / GEO

Mantido inteiro: meta tags, JSON-LD em todas as páginas (`Organization`, `WebSite`+`SearchAction`, `BlogPosting`/`HowTo`, `BreadcrumbList`, `Person`, `CollectionPage`+`ItemList`, `FAQPage`), `sitemap.xml`, `robots.txt` (com bots de IA explicitamente liberados), RSS, Atom e `llms.txt` dinâmico.

## Estrutura

```
fernandolimaindie/
├── apps/
│   ├── api/               # Express + Mongoose + scheduler + pipeline + AI
│   │   └── src/
│   │       ├── config/        # env, logger, db
│   │       ├── models/        # Channel, Post, Author, Category, Tag, Run, User
│   │       ├── routes/        # auth, channels, posts, runs, public, scheduler
│   │       ├── middleware/    # auth, error handler, request log
│   │       ├── services/      # revalidate
│   │       ├── ai/            # ⭐ providers, prompts, tasks (geração)
│   │       ├── pipeline/      # orchestra as tasks AI + persiste posts
│   │       ├── scheduler/     # node-cron baseado em publishTimes
│   │       ├── seed/          # bootstrap admin + canal demo + posts iniciais
│   │       └── utils/         # dto, errors, readingTime
│   ├── admin/             # Painel Next.js (canais + execuções)
│   └── sonoprofundo/      # Canal vivo + template Next.js com SEO/GEO completo
└── packages/
    └── shared/            # Zod schemas (channelInputSchema, publishTimesToCron, ...)
```

## Roadmap

- Plugar Anthropic SDK em `ClaudeProvider` (corpo de `generateText` é o único ponto que muda).
- Plugar OpenAI SDK em `OpenAIProvider` (especialmente para `generateImage` real).
- Refinar prompts em `apps/api/src/ai/prompts/index.ts` por iteração com saídas reais.
- Implementar publicação real no Instagram em `pipeline/publishInstagram.ts`.

## Licença

Privado — Fernando.
