/**
 * "Versículo do dia": derivado das coletâneas (kind=verse_collection) que o cron
 * gera. Escolha determinística pelo dia (muda à meia-noite UTC). SEM pool
 * estático, a página enche conforme o cron gera a Bíblia por tema, e mostra
 * "em breve" enquanto não houver nada.
 */
import { listSignals, getSignal } from './api.js';

const dayOfYear = (d) => {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
};

const EMPTY = { verse: null, others: [], collection: null };

/** { verse: {ref,text,thought}|null, others: [{ref,text}], collection } */
export async function getVerseOfDayData(date = new Date()) {
  let collections = [];
  try {
    collections = (await listSignals({ kind: 'verse_collection', limit: 100 })).items;
  } catch {
    return EMPTY;
  }
  if (!collections.length) return EMPTY;

  const doy = dayOfYear(date);
  const pick = collections[doy % collections.length];

  let full;
  try {
    full = await getSignal(pick.slug);
  } catch {
    return EMPTY;
  }
  const verses = full.verses ?? [];
  if (!verses.length) return EMPTY;

  const idx = doy % verses.length;
  const chosen = verses[idx];
  return {
    verse: { ref: chosen.ref, text: chosen.text, thought: full.answer },
    others: verses.filter((_, i) => i !== idx).map((v) => ({ ref: v.ref, text: v.text })),
    collection: full,
  };
}

/** Só o versículo do dia (ou null). */
export async function getVerseOfDay(date = new Date()) {
  return (await getVerseOfDayData(date)).verse;
}
