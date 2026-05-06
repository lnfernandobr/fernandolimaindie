# Como clonar este canal para um novo projeto

`apps/sonoprofundo` é o template oficial de canal do Blog Network. Para criar um novo canal a partir dele, copie a pasta inteira e ajuste os 6 pontos abaixo.

## 1. Copiar o app

```bash
cp -r apps/sonoprofundo apps/<novo-canal>
rm -rf apps/<novo-canal>/.next apps/<novo-canal>/node_modules
```

## 2. Renomear o pacote

`apps/<novo-canal>/package.json`:

```json
{
  "name": "@bn/<novo-canal>",
  "scripts": {
    "dev": "next dev -p <PORTA-LIVRE>",
    "start": "next start -p <PORTA-LIVRE>"
  }
}
```

Adicione o atalho no `package.json` da raiz:

```json
"dev:<novo-canal>": "pnpm --filter @bn/<novo-canal> dev"
```

## 3. Variáveis de ambiente

`apps/<novo-canal>/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_CHANNEL_SLUG=<slug-do-canal>
NEXT_PUBLIC_SITE_URL=http://localhost:<PORTA-LIVRE>
REVALIDATE_SECRET=<igual ao da API>
```

Em produção (Vercel), aponte `NEXT_PUBLIC_API_URL` para o domínio público da API e `NEXT_PUBLIC_SITE_URL` para o domínio do canal.

## 4. Identidade visual

Tudo está em `src/app/globals.css` no bloco `@theme`:

- **Cores**: `--color-amber-glow` (acento), `--color-ink-*` (fundos escuros), `--color-text-*`, `--color-cool-*` (4 cores de categoria).
- **Tipografia**: trocar as fontes do `next/font/google` em `src/app/layout.tsx`.

Componentes a revisar:

- `src/components/Logo.tsx` — logotipo SVG inline (mude as letras e a cor).
- `src/components/Moon.tsx` — decoração da home (substituir ou remover).
- `src/app/page.tsx` — copy do hero, kicker, métricas de autoridade.
- `src/app/sobre/page.tsx` — equipe, princípios editoriais.

## 5. Assets

Substitua em `public/`:

- `icon.svg` (favicon)
- `apple-touch-icon.svg`
- `og/default.svg` (referência visual; o OG real é gerado dinamicamente em `src/app/opengraph-image.tsx`)

E o gerador de OG em `src/app/opengraph-image.tsx` (cores, gradientes, copy do título).

## 6. Cadastrar o canal no Mongo

A API tem bootstrap automático: ao subir, ela cria o canal `sonoprofundo` por padrão (ver `apps/api/src/seed/sonoprofundoSeed.ts`). Para o seu canal novo:

**Opção A — pelo Admin** (recomendado):

1. Suba o monorepo (`pnpm dev`).
2. Entre em `http://localhost:3000` (Admin) com o usuário `fernando`.
3. Vá em Canais → Novo canal e preencha tudo (slug deve bater com `NEXT_PUBLIC_CHANNEL_SLUG`).

**Opção B — clonar o seed**:

1. Copie `apps/api/src/seed/sonoprofundoSeed.ts` para `<novo-canal>Seed.ts`.
2. Troque `CHANNEL_SLUG`, `name`, `niche`, posts mock.
3. Importe e chame em `apps/api/src/index.ts` (junto com `seedSonoprofundo`).

## 7. Vercel

1. Vercel → Add New → Project → mesmo repositório.
2. **Root Directory**: `apps/<novo-canal>`. O `vercel.json` cuida do build no monorepo.
3. **Environment Variables**: as 4 do passo 3 (com URLs de produção).
4. **Domains**: aponte o domínio próprio.
5. No Admin (`/canais`), edite o canal e coloque a URL pública em **siteUrl** — é esse campo que a API usa para disparar revalidação.
6. Adicione o domínio em `ALLOWED_ORIGINS` no `.env` da API e reinicie o `pm2 restart bn-api`.

## Checklist pós-clone

- [ ] `pnpm install` da raiz reconhece o novo workspace
- [ ] `pnpm dev:<novo-canal>` sobe na porta certa
- [ ] Home, /blog, /blog/<slug>, /sobre carregam sem erro
- [ ] /sitemap.xml lista as URLs corretas
- [ ] /robots.txt aponta o sitemap correto
- [ ] /feed.xml e /atom.xml renderizam o canal certo
- [ ] /llms.txt tem o nome e os posts do canal
- [ ] /opengraph-image renderiza com a copy/identidade do canal
- [ ] Cadastrado no Admin, com `siteUrl` apontando para o domínio público
- [ ] `ALLOWED_ORIGINS` da API contém o domínio
