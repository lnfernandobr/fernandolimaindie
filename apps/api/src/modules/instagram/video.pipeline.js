import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { badRequest } from '../../errors/factories.js';
import { uploadBuffer, downloadBuffer } from '../media/media.s3.js';
import { generateSpeech } from '../media/media.elevenlabs.js';
import * as ff from './video.ffmpeg.js';

const MUSIC_EXT = /\.(mp3|m4a|aac|wav|ogg)$/i;

const isMockMode = () => env.MEDIA_MOCK_MODE || !env.ELEVENLABS_API_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Erros transitórios valem retry; permissão/auth/validação (4xx) não adianta repetir.
const isRetryableTtsError = (err) => {
  const m = String(err?.message ?? '');
  return /\b(429|5\d\d)\b/.test(m) || /timeout|ETIMEDOUT|ECONNRESET|fetch failed|network/i.test(m);
};

// Gera a narração de um slide com retry exponencial pra erros transitórios.
const ttsWithRetry = async (text) => {
  let lastErr;
  for (let attempt = 0; attempt <= INSTAGRAM_VIDEO.TTS_RETRIES; attempt += 1) {
    try {
      return await generateSpeech(text);
    } catch (err) {
      lastErr = err;
      if (!isRetryableTtsError(err) || attempt === INSTAGRAM_VIDEO.TTS_RETRIES) break;
      await sleep(INSTAGRAM_VIDEO.TTS_RETRY_BACKOFF_MS * (attempt + 1));
    }
  }
  throw lastErr;
};

// Duração final do slide no vídeo: narração + respiro, com piso mínimo.
const slideDuration = (narrationMs) =>
  Math.max(narrationMs + INSTAGRAM_VIDEO.SLIDE_PADDING_MS, INSTAGRAM_VIDEO.SLIDE_MIN_MS);

// Em mock, estima a duração pela quantidade de palavras pra a prévia parecer real.
const mockNarrationMs = (text) => {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  if (!words) return INSTAGRAM_VIDEO.SLIDE_FALLBACK_MS;
  return Math.min(Math.max(words * 360, INSTAGRAM_VIDEO.SLIDE_MIN_MS), 9000);
};

const fetchImage = async (url, dest) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${INSTAGRAM_ERRORS.VIDEO_FAILED}: download ${res.status} ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return dest;
};

const pickMusic = async () => {
  const dir = path.isAbsolute(env.INSTAGRAM_MUSIC_DIR)
    ? env.INSTAGRAM_MUSIC_DIR
    : path.resolve(process.cwd(), env.INSTAGRAM_MUSIC_DIR);
  try {
    const files = (await readdir(dir)).filter((f) => MUSIC_EXT.test(f));
    if (!files.length) return null;
    return path.join(dir, files[Math.floor(Math.random() * files.length)]);
  } catch {
    return null;
  }
};

const uploadFile = async (file, key, contentType) =>
  uploadBuffer({ key, buffer: await readFile(file), contentType });

// Resolve a narração de UM slide: reusa do cache no S3 (retoma de onde parou),
// senão gera via TTS (com retry) e cacheia. Falha definitiva -> null (vira silêncio).
const resolveSlideNarration = async ({ tmp, text, index, cacheKey, postId }) => {
  let buffer = null;
  try {
    buffer = await downloadBuffer(cacheKey);
  } catch (err) {
    logger.warn({ err: err.message, postId, slide: index }, 'falha ao consultar cache de narração');
  }
  if (buffer) {
    logger.info({ postId, slide: index }, 'narração reusada do cache');
  } else {
    try {
      buffer = await ttsWithRetry(text);
      await uploadBuffer({
        key: cacheKey,
        buffer,
        contentType: INSTAGRAM_VIDEO.AUDIO_CONTENT_TYPE,
      }).catch((err) =>
        logger.warn({ err: err.message, postId, slide: index }, 'falha ao cachear narração'),
      );
    } catch (err) {
      logger.warn({ err: err.message, postId, slide: index }, 'TTS falhou — slide sairá sem narração');
      return null;
    }
  }
  const narr = path.join(tmp, `narr-${index}.mp3`);
  await writeFile(narr, buffer);
  return narr;
};

// Monta a trilha (narração por slide + opcional música) e devolve a duração de
// cada slide pra dirigir o vídeo (A/V sincronizado). Resiliente: TTS que falha
// vira silêncio; narração já feita é reusada do S3 num novo disparo.
const buildSoundtrack = async ({ tmp, slides, mock, handle, postId }) => {
  const segments = [];
  const perSlideMs = [];
  let ttsFailures = 0;

  for (let i = 0; i < slides.length; i += 1) {
    const text = String(slides[i].text ?? '').trim();
    const seg = path.join(tmp, `seg-${i}.mp3`);

    let narr = null;
    if (!mock && text) {
      const cacheKey = `${INSTAGRAM_DEFAULTS.S3_PREFIX}/${handle}/${postId}/${INSTAGRAM_VIDEO.NARRATION_PREFIX}/slide-${i}.mp3`;
      narr = await resolveSlideNarration({ tmp, text, index: i, cacheKey, postId });
      if (!narr) ttsFailures += 1;
    }

    if (narr) {
      const durMs = slideDuration(await ff.probeDurationMs(narr));
      await ff.padAudioToDuration(narr, seg, durMs);
      perSlideMs.push(durMs);
    } else {
      // mock, slide sem texto, ou TTS falhou: silêncio
      const durMs = mock ? slideDuration(mockNarrationMs(text)) : INSTAGRAM_VIDEO.SLIDE_FALLBACK_MS;
      await ff.makeSilence(seg, durMs);
      perSlideMs.push(durMs);
    }
    segments.push(seg);
  }

  const narrationFile = path.join(tmp, 'narration.mp3');
  await ff.concatAudio(segments, narrationFile);

  const music = await pickMusic();
  let audioFile = narrationFile;
  if (music) {
    const mixed = path.join(tmp, 'soundtrack.mp3');
    await ff.mixMusic(narrationFile, music, mixed);
    audioFile = mixed;
  }
  return { audioFile, perSlideMs, ttsFailures };
};

const renderFormat = async ({ tmp, format, images, perSlideMs, texts, audioFile }) => {
  const clips = [];
  for (let i = 0; i < images.length; i += 1) {
    const textFile = texts[i]
      ? await ff.writeTextFile(tmp, `t-${format.key}-${i}.txt`, texts[i])
      : null;
    const clip = path.join(tmp, `clip-${format.key}-${i}.mp4`);
    await ff.renderSlideClip({
      image: images[i],
      durationMs: perSlideMs[i],
      format,
      textFile,
      fontFile: env.INSTAGRAM_VIDEO_FONT_FILE,
      output: clip,
    });
    clips.push(clip);
  }
  const joined = path.join(tmp, `joined-${format.key}.mp4`);
  await ff.concatClips(clips, path.join(tmp, `list-${format.key}.txt`), joined);

  const final = path.join(tmp, format.file);
  await ff.muxVideoAudio(joined, audioFile, final);
  return final;
};

// Monta os dois formatos de vídeo a partir dos slides já no S3 e devolve as URLs.
export const renderPostVideo = async ({ postId, handle, slides: rawSlides }) => {
  const slides = [...(rawSlides ?? [])].sort((a, b) => a.index - b.index);
  if (!slides.length) throw badRequest(INSTAGRAM_ERRORS.VIDEO_NO_SLIDES);

  const mock = isMockMode();
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'ig-video-'));
  logger.info({ postId, mock, slides: slides.length }, 'instagram video render started');

  try {
    const images = [];
    for (let i = 0; i < slides.length; i += 1) {
      images.push(await fetchImage(slides[i].imageUrl, path.join(tmp, `slide-${i}.png`)));
    }

    const { audioFile, perSlideMs, ttsFailures } = await buildSoundtrack({
      tmp,
      slides,
      mock,
      handle,
      postId,
    });
    if (ttsFailures > 0) {
      logger.warn(
        { postId, ttsFailures, total: slides.length },
        'vídeo gerado com slides sem narração (TTS falhou) — só com a trilha musical',
      );
    }
    const texts = slides.map((s) => String(s.text ?? '').trim());

    const base = `${INSTAGRAM_DEFAULTS.S3_PREFIX}/${handle}/${postId}`;
    const result = { durationMs: perSlideMs.reduce((a, b) => a + b, 0) };

    for (const format of INSTAGRAM_VIDEO.FORMATS) {
      const file = await renderFormat({ tmp, format, images, perSlideMs, texts, audioFile });
      const url = await uploadFile(file, `${base}/${format.file}`, INSTAGRAM_VIDEO.VIDEO_CONTENT_TYPE);
      if (format.key === 'vertical') result.verticalUrl = url;
      else result.squareUrl = url;
    }

    result.narrationUrl = await uploadFile(
      audioFile,
      `${base}/${INSTAGRAM_VIDEO.NARRATION_FILE}`,
      INSTAGRAM_VIDEO.AUDIO_CONTENT_TYPE,
    );

    logger.info({ postId, durationMs: result.durationMs }, 'instagram video render finished');
    return result;
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
};
