import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { badRequest } from '../../errors/factories.js';
import { uploadBuffer, downloadBuffer } from '../media/media.s3.js';
import { generateSpeech } from '../media/media.elevenlabs.js';
import { generateVideoScript, buildMockScript, sceneCountFor } from './video.script.js';
import { generateSceneImage } from './video.image.js';
import { transcribeWords, buildSceneAss } from './video.captions.js';
import * as ff from './video.ffmpeg.js';

const MUSIC_EXT = /\.(mp3|m4a|aac|wav|ogg)$/i;
const SCENE_COLORS = ['#1f2937', '#4b5563', '#7c2d12', '#365314', '#1e3a5f', '#3b0764', '#7f1d1d', '#134e4a'];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isMock = () => env.MEDIA_MOCK_MODE === true;
const hasAnthropic = () => !!env.ANTHROPIC_API_KEY;
const hasOpenAI = () => !!env.OPENAI_API_KEY;
const hasElevenLabs = () => !!env.ELEVENLABS_API_KEY;

const sceneDuration = (narrationMs) =>
  Math.max(narrationMs + INSTAGRAM_VIDEO.SCENE_PADDING_MS, INSTAGRAM_VIDEO.SCENE_MIN_MS);

const mockSceneMs = (text) => {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return INSTAGRAM_VIDEO.SCENE_FALLBACK_MS;
  return Math.min(Math.max(words * 360, INSTAGRAM_VIDEO.SCENE_MIN_MS), 9000);
};

const isRetryable = (err) => {
  const m = String(err?.message ?? '');
  return /\b(429|5\d\d)\b/.test(m) || /timeout|ETIMEDOUT|ECONNRESET|fetch failed|network/i.test(m);
};

const withRetry = async (fn, retries, backoffMs) => {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === retries) break;
      await sleep(backoffMs * (attempt + 1));
    }
  }
  throw lastErr;
};

const MUSIC_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'free', 'music', 'copyright', 'royalty', 'sound', 'sounds',
  'background', 'mp3', 'video', 'videos', 'beat', 'beats', 'type', 'release', 'audio',
  'library', 'official', 'non', 'commercial', 'use', 'feat', 'remix', 'version',
]);

const tokenize = (s) =>
  String(s ?? '')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !MUSIC_STOPWORDS.has(w));

const musicDir = () =>
  path.isAbsolute(env.INSTAGRAM_MUSIC_DIR)
    ? env.INSTAGRAM_MUSIC_DIR
    : path.resolve(process.cwd(), env.INSTAGRAM_MUSIC_DIR);

// Escolhe a faixa cujo NOME melhor casa com o mood do roteiro (não aleatório).
// Empate ou nenhum match: sorteia entre as melhores pra dar variedade.
const selectMusic = async (mood) => {
  let files;
  try {
    files = (await readdir(musicDir())).filter((f) => MUSIC_EXT.test(f));
  } catch {
    return null;
  }
  if (!files.length) return null;

  const moodWords = new Set(tokenize(mood));
  const scored = files.map((f) => ({
    f,
    score: moodWords.size ? tokenize(f).filter((w) => moodWords.has(w)).length : 0,
  }));
  const max = Math.max(...scored.map((s) => s.score));
  const pool = max > 0 ? scored.filter((s) => s.score === max) : scored;
  const chosen = pool[Math.floor(Math.random() * pool.length)].f;
  return path.join(musicDir(), chosen);
};

const uploadFile = async (file, key, contentType) =>
  uploadBuffer({ key, buffer: await readFile(file), contentType });

// ── Roteiro (com cache no S3) ──────────────────────────────────────────────
const resolveScript = async ({ post, channel, variant, base }) => {
  const key = `${base}/${variant}/${INSTAGRAM_VIDEO.SCRIPT_FILE}`;
  try {
    const cached = await downloadBuffer(key);
    if (cached) return JSON.parse(cached.toString('utf8'));
  } catch (err) {
    logger.warn({ err: err.message, variant }, 'falha ao ler roteiro do cache');
  }
  const script =
    isMock() || !hasAnthropic()
      ? buildMockScript({ post, variant })
      : await generateVideoScript({ post, channel, variant });
  await uploadBuffer({
    key,
    buffer: Buffer.from(JSON.stringify(script)),
    contentType: 'application/json',
  }).catch((err) => logger.warn({ err: err.message, variant }, 'falha ao cachear roteiro'));
  return script;
};

// ── Imagem da cena (cache + retry + fallback) ──────────────────────────────
const resolveSceneImage = async ({ tmp, script, scene, index, total, variant, base, lastGood }) => {
  const dest = path.join(tmp, `scene-${index}.png`);
  const key = `${base}/${variant}/${INSTAGRAM_VIDEO.SCENE_PREFIX}/scene-${index}.png`;

  try {
    const cached = await downloadBuffer(key);
    if (cached) {
      await writeFile(dest, cached);
      return { path: dest, ok: true };
    }
  } catch (err) {
    logger.warn({ err: err.message, index }, 'falha ao ler imagem do cache');
  }

  if (isMock() || !hasOpenAI()) {
    await ff.makeSolidImage(SCENE_COLORS[index % SCENE_COLORS.length], variant, dest);
    return { path: dest, ok: true };
  }

  try {
    const buffer = await withRetry(
      () =>
        generateSceneImage({
          visualAnchors: script.visualAnchors,
          scene,
          sceneNumber: index + 1,
          totalScenes: total,
          variant,
        }),
      INSTAGRAM_VIDEO.IMAGE_RETRIES,
      1500,
    );
    await writeFile(dest, buffer);
    await uploadFile(dest, key, INSTAGRAM_VIDEO.IMAGE_CONTENT_TYPE).catch((err) =>
      logger.warn({ err: err.message, index }, 'falha ao cachear imagem'),
    );
    return { path: dest, ok: true };
  } catch (err) {
    logger.warn({ err: err.message, index }, 'imagem falhou — usando fallback');
    if (lastGood) return { path: lastGood, ok: false }; // reusa a cena anterior
    await ff.makeSolidImage(script.bgColor, variant, dest); // 1ª cena: cor da paleta
    return { path: dest, ok: false };
  }
};

// ── Narração da cena (cache + retry + fallback p/ silêncio) ─────────────────
const resolveSceneNarration = async ({ tmp, scene, index, variant, base }) => {
  const text = String(scene.narration ?? '').trim();
  if (isMock() || !hasElevenLabs() || !text) return null;
  const dest = path.join(tmp, `narr-${index}.mp3`);
  const key = `${base}/${variant}/${INSTAGRAM_VIDEO.NARRATION_PREFIX}/scene-${index}.mp3`;

  try {
    const cached = await downloadBuffer(key);
    if (cached) {
      await writeFile(dest, cached);
      return dest;
    }
  } catch (err) {
    logger.warn({ err: err.message, index }, 'falha ao ler narração do cache');
  }

  try {
    const buffer = await withRetry(
      () => generateSpeech(text),
      INSTAGRAM_VIDEO.TTS_RETRIES,
      INSTAGRAM_VIDEO.TTS_RETRY_BACKOFF_MS,
    );
    await writeFile(dest, buffer);
    await uploadFile(dest, key, INSTAGRAM_VIDEO.AUDIO_CONTENT_TYPE).catch((err) =>
      logger.warn({ err: err.message, index }, 'falha ao cachear narração'),
    );
    return dest;
  } catch (err) {
    logger.warn({ err: err.message, index }, 'TTS falhou — cena sem narração');
    return null;
  }
};

// Renderiza UMA variante (curto ou longo) ponta a ponta.
export const renderVariant = async ({ post, channel, handle, variant }) => {
  const v = INSTAGRAM_VIDEO.VARIANTS[variant];
  if (!v) throw badRequest(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);

  const tmp = await mkdtemp(path.join(os.tmpdir(), `ig-v2-${variant}-`));
  const base = `${INSTAGRAM_DEFAULTS.S3_PREFIX}/${handle}/${post.id || post._id}`;
  logger.info({ postId: post.id || String(post._id), variant }, 'video v2 render started');

  try {
    const script = await resolveScript({ post, channel, variant, base });
    const total = Math.min(script.scenes.length, sceneCountFor(variant));
    const scenes = script.scenes.slice(0, total);

    const clips = [];
    const segments = [];
    const durations = [];
    let lastGood = null;
    let voiced = 0;

    for (let i = 0; i < scenes.length; i += 1) {
      const scene = scenes[i];
      const img = await resolveSceneImage({ tmp, script, scene, index: i, total, variant, base, lastGood });
      if (img.ok) lastGood = img.path;

      const narr = await resolveSceneNarration({ tmp, scene, index: i, variant, base });
      const seg = path.join(tmp, `seg-${i}.mp3`);
      let durMs;
      if (narr) {
        voiced += 1;
        durMs = sceneDuration(await ff.probeDurationMs(narr));
        await ff.padAudioToDuration(narr, seg, durMs);
      } else {
        durMs = isMock() ? sceneDuration(mockSceneMs(scene.narration)) : INSTAGRAM_VIDEO.SCENE_FALLBACK_MS;
        await ff.makeSilence(seg, durMs);
      }

      const words = narr ? await transcribeWords(narr) : [];
      const assFile = await buildSceneAss({
        words,
        durationMs: durMs,
        variant,
        fallbackText: scene.onScreenText,
        outFile: path.join(tmp, `cap-${i}.ass`),
      });

      const clip = path.join(tmp, `clip-${i}.mp4`);
      await ff.renderSceneClip({ image: img.path, durationMs: durMs, variant, assFile, output: clip });

      clips.push(clip);
      segments.push(seg);
      durations.push(durMs);
    }

    const narrationFile = path.join(tmp, 'narration.mp3');
    await ff.crossfadeAudio(segments, narrationFile);
    const totalMs = await ff.probeDurationMs(narrationFile);

    const music = await selectMusic(script.musicMood);
    let audioFile;
    if (music) {
      audioFile = path.join(tmp, 'soundtrack.mp3');
      await ff.mixSoundtrack({
        narration: narrationFile,
        music,
        output: audioFile,
        totalMs,
        hasVoice: voiced > 0,
      });
    } else {
      audioFile = path.join(tmp, 'audio.mp3');
      await ff.narrationOnly(narrationFile, audioFile, totalMs);
    }

    const joined = path.join(tmp, 'joined.mp4');
    await ff.xfadeClips(clips, durations, joined);

    const final = path.join(tmp, v.file);
    await ff.muxVideoAudio(joined, audioFile, final);

    const url = await uploadFile(final, `${base}/${v.file}`, INSTAGRAM_VIDEO.VIDEO_CONTENT_TYPE);
    const durationMs = await ff.probeDurationMs(final);
    logger.info({ variant, durationMs, scenes: scenes.length }, 'video v2 render finished');
    return { url, durationMs, scenes: scenes.length };
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
};
