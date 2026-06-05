# Trilhas de fundo dos vídeos

Faixas **instrumentais royalty-free** (sem vocal) mixadas por baixo da narração dos vídeos.

## Como funciona

- Cada faixa é um arquivo de áudio nesta pasta (`.mp3`, `.m4a`, `.aac`, `.wav`, `.ogg`) **+**
  uma entrada correspondente no [`catalog.json`](./catalog.json).
- O roteiro do vídeo (gerado pela IA) traz um **`musicMood`** — 2-4 palavras em inglês com a
  vibe ideal da trilha (ex: `"calm acoustic hopeful"`, `"tense cinematic"`).
- `selectMusic` casa esse `musicMood` com as **`keywords`** (em inglês) de cada faixa do
  catálogo e escolhe a de melhor encaixe. Empate ou nenhum match → sorteia entre as melhores,
  pra dar variedade. **A escolha é por significado (keywords), não pelo nome do arquivo.**
- No render, a faixa é mixada sob a narração com **ducking** (a música abaixa quando a voz
  entra), em loop, com fade in/out — voz sempre clara (`mixSoundtrack`).
- Fallbacks: sem catálogo → cai no match pelo **nome do arquivo** (legado); nenhuma faixa
  disponível → vídeo sai **só com a narração** (sem erro).
- O caminho da pasta é configurável por `INSTAGRAM_MUSIC_DIR` (relativo ao diretório da API
  ou absoluto). O `catalog.json` fica **dentro** dessa pasta.

## Estrutura de uma entrada do catálogo

```json
{
  "id": "calmo-piano-intimista",
  "file": "calmo-piano-intimista.mp3",
  "mood": "calmo",
  "keywords": ["calm", "piano", "intimate", "slow", "melancholic"],
  "description": "Piano solo lento e intimista...",
  "tags": ["reflexao", "luto", "saudade"]
}
```

- `file` — nome exato do arquivo nesta pasta.
- `keywords` — **em inglês**, é o que casa com o `musicMood` da IA. Capriche aqui.
- `mood`/`description`/`tags` — em pt-BR, pra organização humana.

## Regras das faixas

- **Instrumental, sem vocal/letra cantada** — voz na música compete com a narração e suja o áudio.
- Royalty-free, sem direitos autorais. **Os arquivos de áudio não são versionados** (ver `.gitignore`).
- Para adicionar: baixe o `.mp3`, coloque aqui e crie a entrada no `catalog.json` com
  `keywords` em inglês que descrevam a vibe.

## Fontes royalty-free instrumentais

- Pixabay Music — https://pixabay.com/music/ (licença livre, sem atribuição)
- YouTube Audio Library — https://www.youtube.com/audiolibrary
- Free Music Archive — https://freemusicarchive.org
- Chosic — https://www.chosic.com/free-music/all/
