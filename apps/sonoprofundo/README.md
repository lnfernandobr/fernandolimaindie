# sonoprofundo

Canal vivo do Blog Network e **template de referência** para clonar novos canais. Next.js 16 (App Router) + React 19 + Tailwind 4. Layout responsivo (mobile-first com breakpoints até `max-w-screen-xl`), tema escuro fixo, tipografia Newsreader + Inter Tight + JetBrains Mono.

Para clonar este app em um canal novo, ver [SETUP.md](./SETUP.md).

## Rodando localmente

A partir da raiz do monorepo:

```bash
pnpm dev:sonoprofundo
```

Sobe em `http://localhost:3002`. A API (porta 4000) precisa estar no ar — `pnpm dev` na raiz sobe os 3 apps.

## Build

```bash
pnpm --filter @bn/sonoprofundo build
pnpm --filter @bn/sonoprofundo start
```

## Estrutura

```
src/
├── app/
│   ├── layout.tsx                # root + Header + Footer + JSON-LD raiz
│   ├── globals.css               # Tailwind + tokens (CSS vars) + prose-editorial
│   ├── opengraph-image.tsx       # OG dinâmico (1200×630)
│   ├── twitter-image.tsx         # Twitter card (reusa OG)
│   ├── page.tsx                  # Home
│   ├── blog/
│   │   ├── page.tsx              # Lista com busca + categorias
│   │   └── [slug]/page.tsx       # Post + sumário sticky + JSON-LD article/HowTo/FAQ
│   ├── sobre/page.tsx
│   ├── sitemap.ts                # Dinâmico
│   ├── robots.ts                 # Permite GPTBot, ClaudeBot, PerplexityBot, etc.
│   ├── feed.xml/route.ts         # RSS 2.0
│   ├── atom.xml/route.ts         # Atom 1.0
│   ├── llms.txt/route.ts         # llms.txt para descoberta por LLMs
│   └── api/revalidate/route.ts   # Webhook de revalidação chamado pela API
├── components/
│   ├── Header.tsx                # Logo + nav + skip-link
│   ├── Footer.tsx                # Links institucionais + feeds
│   ├── Logo.tsx                  # Logotipo SVG inline
│   └── Moon.tsx                  # Lua decorativa (hero)
└── lib/
    ├── api.ts                    # Cliente da API (safeGet, ISR tags)
    ├── seo.ts                    # buildBaseMetadata, postMetadata, etc.
    ├── jsonld.ts                 # Organization, Article, FAQ, HowTo, Person, ...
    ├── markdown.ts               # Marked + GithubSlugger + extractToc
    ├── adapt.ts                  # PostDto/CategoryDto → shape visual
    └── config.ts                 # Env vars normalizadas
```

## SEO / GEO

- Sitemap dinâmico (`/sitemap.xml`)
- Robots com bots de IA explicitamente liberados (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`, etc.)
- RSS 2.0 (`/feed.xml`) e Atom 1.0 (`/atom.xml`)
- `llms.txt` (`/llms.txt`) com posts em destaque, categorias e recentes
- JSON-LD por página: `Organization`, `WebSite`+`SearchAction`, `BlogPosting`/`HowTo`/`Review`, `BreadcrumbList`, `FAQPage`, `CollectionPage`+`ItemList`, `Person`
- Open Graph dinâmico via `opengraph-image.tsx` (gerado em runtime)
- HTML semântico: `<header>`, `<main>`, `<article>`, `<aside>`, `<nav aria-label>`, skip-link, `<time dateTime>`, `<figure>`/`<figcaption>`

## Performance

- `next/font/google` com `display: swap`
- `next/image` em todas as capas (AVIF/WebP)
- Headers de cache imutáveis para assets (`/svg|jpg|png|webp|woff2/`)
- ISR estratégico (300s home, 120s post, 600s sitemap/feeds)
- Headers de segurança (X-Content-Type-Options, Referrer-Policy, etc.)
