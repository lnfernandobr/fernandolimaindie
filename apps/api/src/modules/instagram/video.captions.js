import fs from 'node:fs';
import { writeFile } from 'node:fs/promises';
import OpenAI from 'openai';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INSTAGRAM_VIDEO } from '../../constants/instagram.js';

const buildClient = () => new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 120000 });

// Transcreve a narração e devolve palavras com tempos (segundos).
// [] se não houver chave/áudio ou se o Whisper falhar (cai no fallback de legenda).
export const transcribeWords = async (audioFile) => {
  if (!env.OPENAI_API_KEY) return [];
  try {
    const res = await buildClient().audio.transcriptions.create({
      file: fs.createReadStream(audioFile),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    });
    return Array.isArray(res?.words)
      ? res.words.map((w) => ({ word: w.word, start: Number(w.start) || 0, end: Number(w.end) || 0 }))
      : [];
  } catch (err) {
    logger.warn({ err: err.message }, 'whisper transcription failed — usando legenda fallback');
    return [];
  }
};

const assTime = (sec) => {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = Math.floor(s % 60);
  const cs = Math.round((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
};

const escapeAss = (t) =>
  String(t ?? '')
    .replace(/[{}\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const header = (variantKey) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variantKey];
  const fontSize = v.aspect === 'vertical' ? 72 : 46;
  const marginV = Math.round(v.height * (v.aspect === 'vertical' ? 0.2 : 0.08));
  return [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${v.width}`,
    `PlayResY: ${v.height}`,
    'WrapStyle: 2',
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // branco, contorno preto grosso + sombra; Alignment 2 = base centralizada
    `Style: Cap,DejaVu Sans,${fontSize},&H00FFFFFF,&H00000000,&H64000000,1,0,0,0,100,100,0,0,1,5,2,2,90,90,${marginV},1`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ];
};

// Gera o .ass de UMA cena (timing 0-based). Word-level se houver palavras;
// senão, fallbackText estático cobrindo a cena. Retorna o caminho ou null.
export const buildSceneAss = async ({ words, durationMs, variant, fallbackText, outFile }) => {
  const durSec = durationMs / 1000;
  const lines = header(variant);

  if (words?.length) {
    for (const w of words) {
      const text = escapeAss(w.word);
      if (!text) continue;
      const start = Math.min(Math.max(w.start, 0), durSec);
      const end = Math.min(Math.max(w.end, start + 0.08), durSec);
      lines.push(`Dialogue: 0,${assTime(start)},${assTime(end)},Cap,,0,0,0,,${text}`);
    }
  } else {
    const text = escapeAss(fallbackText);
    if (!text) return null;
    lines.push(`Dialogue: 0,${assTime(0)},${assTime(durSec)},Cap,,0,0,0,,${text}`);
  }

  await writeFile(outFile, lines.join('\n'), 'utf8');
  return outFile;
};
