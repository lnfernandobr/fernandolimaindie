# Cota de geração por tipo de conteúdo — Design

**Data:** 2026-06-04
**Branch:** `feat/cota-geracao-por-tipo`
**Status:** aprovado pelo usuário (aguardando revisão do spec)

## Problema

Hoje o cron de geração (`apps/api`, módulo `generation`/`cron`) usa um único número global
`dailyLimit` (default 2). A cada execução diária ele pega os `dailyLimit` seeds pendentes de
**todos os tipos juntos**, em ordem de prioridade. Não dá pra dizer "quero 2 orações, 3 bíblia,
1 blog por dia": os tipos disputam o mesmo balde global.

O usuário quer **definir uma cota diária por tipo de conteúdo**, mantendo as ações por item
(gerar agora, pausar, remover) que já existem na fila.

## Objetivo

Substituir o `dailyLimit` global por uma **cota por `seedKind`**. O cron passa a gerar até a
cota de cada tipo por dia. O admin ganha uma tela pra editar essas cotas.

## Decisões (confirmadas com o usuário)

1. **Substituir**, não somar: a cota por tipo é a única configuração. O "Itens por dia" global
   deixa de existir; o total por dia é a soma das cotas.
2. **Cota 0 = desligado**: tipo com cota 0 não é gerado automaticamente (ainda pode ser gerado
   manualmente pelo botão "Gerar agora" da fila).
3. **Sem ações no nível do tipo**: o tipo só ganha o campo de cota. As ações por item já cobrem
   o controle fino.

## Não-objetivos (YAGNI)

- Nada de teto global por cima das cotas.
- Nada de ações por tipo inteiro (pausar/forçar um tipo de uma vez).
- Nenhuma mudança nas ações por item da fila (`ContentQueuePanel`) — ficam como estão.
- Sem agendas/crons separados por tipo (continua uma execução diária única).

## Tipos (seedKind) e rótulos

A cota é chaveada por `seedKind`, que é o campo que o pipeline já filtra
(`listActiveSeedsByKind`, `generateBatch({ seedKind })`). Ordem e rótulos na UI:

| seedKind            | rótulo (admin) | default |
| ------------------- | -------------- | ------- |
| `verse-collection`  | Bíblia         | 1       |
| `psalm`             | Salmo          | 1       |
| `prayer`            | Oração         | 1       |
| `devotional`        | Devocional     | 1       |
| `reflection`        | Reflexão       | 0       |
| `article`           | Blog           | 1       |

Soma default = **5/dia**.

## Design

### 1. Modelo de dados — `generation.config.model.js`

Troca o campo `dailyLimit` por um sub-documento `dailyQuotas` com uma chave por `seedKind`:

```js
const quotaField = { type: Number, required: true, min: 0, max: 20 };
const dailyQuotasSchema = new Schema(
  {
    'verse-collection': { ...quotaField, default: 1 },
    psalm:              { ...quotaField, default: 1 },
    prayer:             { ...quotaField, default: 1 },
    devotional:         { ...quotaField, default: 1 },
    reflection:         { ...quotaField, default: 0 },
    article:            { ...quotaField, default: 1 },
  },
  { _id: false },
);
// no generationConfigSchema:
//   dailyQuotas: { type: dailyQuotasSchema, default: () => ({}) }
```

- Limites por tipo: `0–20` (alinhado com `GENERATION_DEFAULTS.BATCH_LIMIT_MAX = 20`).
- O campo `dailyLimit` é removido do schema. Documentos antigos têm `dailyLimit` no banco; o
  Mongoose simplesmente ignora campos fora do schema, então não quebra.

### 2. Migração

O doc `GenerationConfig` (key `generation`) já existe em produção com `dailyLimit` setado e sem
`dailyQuotas`. Em `getGenerationConfig()`:

- Lê o doc (upsert como hoje).
- Se `doc.dailyQuotas` estiver ausente/incompleto, **mescla com os defaults** por tipo e
  persiste, garantindo que todas as 6 chaves existam.
- Retorna `{ dailyQuotas }` sempre completo (6 chaves).

Como os defaults vivem no sub-schema, um `setDefaultsOnInsert`/merge cobre o caso. Para o doc
já existente (sem o sub-doc), a primeira leitura faz `updateGenerationConfig({ dailyQuotas: DEFAULTS })`.

Sem fatiar o `dailyLimit=2` antigo entre tipos — os defaults da tabela acima valem e o usuário
ajusta na nova tela.

### 3. Config service — `generation.config.js`

- `getGenerationConfig()` → `{ dailyQuotas }` (sempre com as 6 chaves, defaults preenchidos).
- `updateGenerationConfig(patch)` → aceita `{ dailyQuotas: { <seedKind>: 0..20 } }` **parcial**;
  faz merge campo a campo (não zera os tipos omitidos). Usa `$set` com chaves
  `dailyQuotas.<seedKind>` pra atualizar só o que veio.

### 4. Schema de validação — `generation.schema.js`

Troca `updateGenerationConfigSchema`:

```js
const quota = z.coerce.number().int().min(0).max(20);
export const updateGenerationConfigSchema = z.object({
  dailyQuotas: z
    .object({
      'verse-collection': quota.optional(),
      psalm: quota.optional(),
      prayer: quota.optional(),
      devotional: quota.optional(),
      reflection: quota.optional(),
      article: quota.optional(),
    })
    .refine((q) => Object.keys(q).length > 0, { message: 'Informe ao menos uma cota.' }),
});
```

Reaproveita a lista `SEED_KINDS` pra evitar divergência (gerar o shape a partir dela).

### 5. Cron — `cron/generation.job.js`

Troca a chamada única por um loop pelos tipos, na ordem da tabela:

```js
const { dailyQuotas } = await getGenerationConfig();
const results = [];
for (const seedKind of QUOTA_KIND_ORDER) {
  const quota = dailyQuotas[seedKind] ?? 0;
  if (quota > 0) {
    const out = await generateBatch({ seedKind, limit: quota, force: false });
    results.push(...out.results);
  }
}
```

- `QUOTA_KIND_ORDER` = ordem da tabela (constante em `constants/generation.js`).
- Tally (`tallyOutcomes`), gravação do run (`saveRun`), revalidação e IndexNow continuam iguais,
  operando sobre o `results` agregado.
- `generateBatch` já existe e já filtra por `seedKind` + prioridade — sem mudança nele.

### 6. Status — `generation.service.js` (`getGenerationStatus`)

- Troca `dailyLimit` por `dailyQuotas` no retorno.
- Adiciona `pendingByKind`: `{ <seedKind>: <nº de seeds pendentes> }`. Novo helper
  `countPendingSeedsByKind()` (mesma lógica de `countPendingSeeds`, agrupada por `seedKind`).
  Usado pela UI pra mostrar "X pendentes" ao lado de cada cota.
- `pendingSeeds` (total) continua, pra não quebrar o dashboard atual.

### 7. Admin UI — `apps/admin/app/page.jsx` (`CronConfigPanel`)

Troca o input único "Itens por dia" por uma mini-tabela, uma linha por tipo:

```
Geração automática (cron)              [ 5 por dia ]
Cron: ativado   Agenda: 0 3 * * * UTC

  Bíblia       [ 1 ]   118 pendentes
  Salmo        [ 1 ]     6 pendentes
  Oração       [ 1 ]    12 pendentes
  Devocional   [ 1 ]     0 pendentes
  Reflexão     [ 0 ]     3 pendentes
  Blog         [ 1 ]     1 pendente
                ────
  Total/dia      5
                                   [ Salvar ]
```

- Estado local: `quotas` (objeto seedKind→número), carregado do `GET /generation/config`.
- "Pendentes" por linha vem de `status.pendingByKind[seedKind]`.
- Badge do título e "Total/dia" = soma das cotas (derivado, recalcula on-change).
- Salvar → `PATCH /generation/config` com `{ dailyQuotas: quotas }`.
- Rótulos por `seedKind` num mapa local (Bíblia/Salmo/Oração/Devocional/Reflexão/Blog).

`ContentQueuePanel` **não muda**.

## Tratamento de erros / edge cases

- **Cota maior que pendentes do tipo:** `generateBatch` gera o que houver e para — sem erro.
- **Todas as cotas 0:** cron roda, gera nada, grava um run com zeros. Comportamento válido.
- **PATCH parcial:** só atualiza os tipos enviados; os demais ficam intactos.
- **Valor inválido (negativo / >20 / não-int):** rejeitado pelo zod (400) e clampado na UI.
- **Doc legado sem `dailyQuotas`:** preenchido com defaults na primeira leitura (migração).

## Testes

- **Unit (API):**
  - `getGenerationConfig` preenche defaults quando `dailyQuotas` ausente.
  - `updateGenerationConfig` faz merge parcial (não zera tipos omitidos).
  - `updateGenerationConfigSchema` aceita parcial válido e rejeita inválido (negativo/>20).
  - Cron: com cotas `{ prayer: 2, psalm: 1, reflection: 0 }`, chama `generateBatch` 1x por tipo
    com cota >0 e agrega resultados; pula tipos com 0.
- **Manual:** na tela do admin, editar cotas, salvar, recarregar e ver persistido; disparar o
  cron manual (botão/trigger) e conferir os counts por tipo no run.

## Arquivos afetados

**API (`apps/api`):**
- `src/modules/generation/generation.config.model.js` — `dailyLimit` → `dailyQuotas`.
- `src/modules/generation/generation.config.js` — defaults/merge no get/update.
- `src/modules/generation/generation.schema.js` — `updateGenerationConfigSchema`.
- `src/modules/generation/generation.service.js` — `getGenerationStatus` (+`pendingByKind`),
  novo `countPendingSeedsByKind`.
- `src/modules/cron/generation.job.js` — loop por tipo.
- `src/constants/generation.js` — `QUOTA_KIND_ORDER` + defaults de cota.

**Admin (`apps/admin`):**
- `app/page.jsx` — `CronConfigPanel` (mini-tabela de cotas).

## Deploy

- API: push em `main` com mudança em `apps/api/**` → GitHub Actions reload no VPS (automático).
- Admin: deploy Vercel no push (ou `vercel --prod`).
- Migração roda sozinha na primeira leitura da config pós-deploy.
