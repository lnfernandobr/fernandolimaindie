# Vídeo v2 — roteiro por IA + imagens novas (Instagram)

Data: 2026-06-04 · Status: aprovado (design) · Entrega: faseada (curto → longo)

## Contexto

Hoje a geração de vídeo do Instagram pega os **slides do carrossel** (imagens que já
têm texto embutido) e ainda queima `slide.text` por cima — gerando legenda duplicada,
sem sentido. As imagens do carrossel nunca foram pensadas pra vídeo (são 1:1 e contêm
tipografia).

O objetivo é trocar isso por um pipeline onde o **post publicado é só o tema**: a IA
escreve um **roteiro em cenas**, cada cena gera **imagem nova e limpa** (sem texto),
**narração** e **legenda dinâmica**, e o FFmpeg monta com movimento e transições. Dois
formatos selecionáveis: **curto 9:16** (Reels/Shorts) e **longo 16:9** (YouTube).

## Decisões (fechadas no brainstorming)

- **Motor**: FFmpeg avançado (libass p/ legendas, xfade p/ transições). Remotion fica
  como possível evolução futura — por isso roteiro/cenas são modelados como dados.
- **Formatos**: curto **9:16** (~75s, ≥1min) · longo **16:9** (~5min). Imagens geradas
  na proporção de cada um.
- **Legendas**: dinâmicas palavra-a-palavra (transcrição via OpenAI `whisper-1`),
  principalmente no curto; no longo, mais discretas.
- **Densidade de imagens**: ~1 imagem a cada 9s (curto ≈ 8 imagens, longo ≈ 30).
- **Substitui** a geração atual (slides → vídeo); a lógica antiga de queimar `slide.text`
  é removida.
- **Configuração**: escolha no disparo (curto/longo/ambos) + default por canal
  (`videoVariant`) usado pelo modo automático (`autoVideo`).
- **Entrega faseada**: Fase 1 = curto 9:16 completo; Fase 2 = longo 16:9.
- **Fallback de imagem**: ao falhar (após retry), reusa a imagem da cena anterior com um
  Ken Burns diferente; na 1ª cena (sem anterior), usa fundo de cor sólida da paleta.

## Arquitetura

Reaproveita o padrão existente: Claude com prompt JSON estrito
(`generation.anthropic.js` + `prompts.js`), gpt-image-2 (`generation.openai.js`),
ElevenLabs (`media.elevenlabs.js`), S3 (`media.s3.js`, com `downloadBuffer` p/ cache),
e o render FFmpeg (`video.ffmpeg.js`).

### Módulos
- **`video.script.js`** (novo) — `generateVideoScript({ post, channel, variant })` chama
  Claude e retorna o roteiro. Prompt novo em `prompts.js`: `videoScript(...)`.
- **`video.image.js`** (novo) — `generateSceneImage({ scene, visualAnchors, aspect })` no
  gpt-image-2: `1024x1536` (vertical) ou `1536x1024` (horizontal); prompt cinematográfico
  com **proibição explícita de texto/tipografia/legenda**.
- **`video.captions.js`** (novo) — transcreve cada narração (`whisper-1`, `verbose_json`,
  `timestamp_granularities:["word"]`) e gera um arquivo **`.ass`** (libass) com destaque
  palavra-a-palavra, posicionado na faixa segura do formato.
- **`video.ffmpeg.js`** (estende) — `renderSceneClip` (Ken Burns na proporção do
  variant), **`xfadeConcat`** (encadeia clipes com transição e offsets, re-encodando),
  queima legenda `.ass`, mux com narração + música.
- **`video.pipeline.js`** (reescreve) — orquestra por variante; remove o caminho de slides.
- **narração** — reusa `resolveSlideNarration`/retry/fallback/cache já existentes.

### Roteiro (formato retornado pelo Claude)
```json
{
  "title": "string (pt-BR, interno)",
  "palette": "string (cores da paleta, p/ fallback de fundo)",
  "visualAnchors": { "...": "EN, coerência visual entre cenas" },
  "scenes": [
    {
      "narration": "string pt-BR — a fala dessa cena (1-3 frases)",
      "imagePrompt": "string EN — cena cinematográfica, SEM texto/tipografia",
      "onScreenText": "string pt-BR — frase-chave (fallback de legenda)"
    }
  ]
}
```
Curto: alvo ~75s, ~8 cenas. Longo: ~5min, ~30 cenas. O prompt deriva o tema do post
(`title`, `topic`, `caption`, e `imageSubject/imageScene` dos slides como inspiração).

## Fluxo de dados
```
post (tema) ─► roteiro (Claude)[cache] ─► [cenas]
  cena ──► imagem nova (gpt-image-2)[cache S3]
       └─► narração (ElevenLabs)[cache S3] ──► transcrição (whisper-1) ──► .ass
                                   ▼
              render por cena (Ken Burns) ─► xfade concat ─► legenda + áudio
                                   ▼
            curto 9:16 / longo 16:9 ─► S3 ─► post.video.{short,long}
```

## Modelo de dados / API / Painel
- **`posts.model.js`**: `video` passa a `{ short:{status,url,durationMs,error,generatedAt},
  long:{...} }` (substitui `verticalUrl/squareUrl/narrationUrl`). DTO e painel acompanham.
- **`channels.model.js`**: novo `videoVariant` (`short|long|both`, default `short`);
  `autoVideo` já existe.
- **API**: `POST /posts/:id/video` com body `{ variant: 'short'|'long'|'both' }` (default =
  `videoVariant` do canal). Status via `GET /posts/:id`.
- **Painel** (`instagram-panel.jsx`): botão com escolha curto/longo/ambos; um player por
  variante (9:16 e 16:9) + download; polling enquanto `generating`; select de
  `videoVariant` no `ChannelForm`.

## Resiliência / erros
- **Cache no S3 por cena** (roteiro, imagem, narração) → um novo disparo **retoma de onde
  parou**, reusando o que já deu certo.
- **TTS** falha → silêncio na cena (já implementado). **Imagem** falha (após retry) →
  reusa imagem da cena anterior (Ken Burns diferente); 1ª cena → cor sólida da paleta.
  **Whisper** falha → legenda por cena (`onScreenText`) em vez de palavra-a-palavra.
- Erros transitórios (429/5xx/rede) com retry+backoff; 4xx (ex: permissão) não repete.

## Custo
- Curto ≈ 1 roteiro + ~8 imagens + ~8 TTS + ~8 transcrições. Longo ≈ ~30 de cada.
- O custo de imagem é capturado pelo módulo `media.cost.js` (trabalho paralelo) — sem
  acoplamento direto aqui.

## Escopo por fase
- **Fase 1 (esta entrega)**: variante **curto 9:16** ponta a ponta — roteiro, imagens
  novas, narração, legenda word-level, Ken Burns + xfade, áudio; schema/API/painel já com
  a forma `{short,long}` (long fica `idle`). Remove o pipeline de slides.
- **Fase 2**: variante **longo 16:9** (mais cenas, legenda discreta, possíveis
  capítulos/intro-outro).

## Verificação
1. **Mock (sem APIs)**: roteiro mock + imagens placeholder + narração silêncio + legenda
   por cena → valida render do curto 9:16 (Ken Burns, xfade, legenda queimada, durações).
2. **Real**: `POST /posts/:id/video {variant:'short'}` num post do @umsinaldefe; acompanhar
   `video.short.status` até `ready`; abrir no painel e conferir conteúdo/coerência.
3. **Retomada**: falhar 1 imagem de propósito e redisparar → confirma reuso do cache.

## Riscos
- **xfade** exige filtergraph com offsets acumulados (não dá `concat -c copy`); render mais
  pesado — mitigar com `-preset veryfast` e resolução final única por variante.
- **gpt-image-2** não tem 9:16/16:9 exatos (`1024x1536`/`1536x1024`); FFmpeg ajusta via
  Ken Burns + crop/pad. Validar enquadramento no teste real.
- **Tempo/custo do longo** (Fase 2): ~30 imagens + render xfade de 5min em CPU; medir e,
  se preciso, baixar FPS ou densidade.
