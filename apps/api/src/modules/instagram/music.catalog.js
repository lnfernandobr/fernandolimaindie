import path from 'node:path';
import { access, readFile } from 'node:fs/promises';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const CATALOG_FILE = 'catalog.json';

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'free', 'music', 'copyright', 'royalty', 'sound', 'sounds',
  'background', 'mp3', 'video', 'videos', 'beat', 'beats', 'type', 'release', 'audio',
]);

const tokenize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

// Resolve o diretório de música (relativo ao cwd da API ou absoluto), igual ao pipeline.
const musicDir = () =>
  path.isAbsolute(env.INSTAGRAM_MUSIC_DIR)
    ? env.INSTAGRAM_MUSIC_DIR
    : path.resolve(process.cwd(), env.INSTAGRAM_MUSIC_DIR);

let cache;

// Lê e valida o catalog.json uma vez por processo. Faixa sem file/keywords é descartada.
const loadCatalog = async () => {
  if (cache) return cache;
  try {
    const raw = await readFile(path.join(musicDir(), CATALOG_FILE), 'utf8');
    const parsed = JSON.parse(raw);
    cache = (Array.isArray(parsed) ? parsed : []).filter(
      (t) => t && typeof t.file === 'string' && Array.isArray(t.keywords),
    );
  } catch (err) {
    logger.warn({ err: err.message }, 'catálogo de música indisponível; usando fallback');
    cache = [];
  }
  return cache;
};

const fileExists = async (file) =>
  access(path.join(musicDir(), file)).then(
    () => true,
    () => false,
  );

// Escolhe a faixa do catálogo cujas keywords melhor casam com o musicMood do roteiro.
// Casa por SIGNIFICADO (keywords), não pelo nome do arquivo. Empate ou nenhum match:
// sorteia entre as melhores pra dar variedade. Retorna o caminho absoluto ou null
// (catálogo vazio / nenhuma faixa do catálogo presente no disco → o pipeline faz fallback).
export const selectTrackByMood = async (mood) => {
  const catalog = await loadCatalog();
  const available = [];
  for (const track of catalog) {
    if (await fileExists(track.file)) available.push(track);
  }
  if (!available.length) return null;

  const moodWords = new Set(tokenize(mood));
  const scored = available.map((t) => ({
    file: t.file,
    score: moodWords.size ? t.keywords.filter((k) => moodWords.has(String(k).toLowerCase())).length : 0,
  }));
  const max = Math.max(...scored.map((s) => s.score));
  const pool = max > 0 ? scored.filter((s) => s.score === max) : scored;
  const chosen = pool[Math.floor(Math.random() * pool.length)].file;
  return path.join(musicDir(), chosen);
};
