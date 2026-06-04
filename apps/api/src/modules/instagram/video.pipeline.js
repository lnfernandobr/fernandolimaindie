import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm, readdir, readFile, writeFile } from 'node:fs/promises';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { INSTAGRAM_DEFAULTS, INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { badRequest } from '../../errors/factories.js';
import { uploadBuffer } from '../media/media.s3.js';
import { generateSpeech } from '../media/media.elevenlabs.js';
import * as ff from './video.ffmpeg.js';

const MUSIC_EXT = /\.(mp3|m4a|aac|wav|ogg)$/i;

const isMockMode = () => env.MEDIA_MOCK_MODE || !env.ELEVENLABS_API_KEY;

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

// Gera a trilha de áudio (narração por slide + opcional música) e devolve a
// duração de cada slide pra dirigir o vídeo. Garante A/V sincronizado.
const buildSoundtrack = async ({ tmp, slides, mock }) => {
  const segments = [];
  const perSlideMs = [];

  for (let i = 0; i < slides.length; i += 1) {
    const text = String(slides[i].text ?? '').trim();
    const seg = path.join(tmp, `seg-${i}.mp3`);

    if (mock || !text) {
      const durMs = mock ? slideDuration(mockNarrationMs(text)) : INSTAGRAM_VIDEO.SLIDE_FALLBACK_MS;
      await ff.makeSilence(seg, durMs);
      perSlideMs.push(durMs);
    } else {
      const narr = path.join(tmp, `narr-${i}.mp3`);
      await writeFile(narr, await generateSpeech(text));
      const durMs = slideDuration(await ff.probeDurationMs(narr));
      await ff.padAudioToDuration(narr, seg, durMs);
      perSlideMs.push(durMs);
    }
    segments.push(seg);
  }

  const narrationFile = path.join(tmp, 'narration.mp3');
  await ff.concatAudio(segments, narrationFile);

  const music = await pickMusic();
  if (!music) return { audioFile: narrationFile, perSlideMs, hasMusic: false };

  const mixed = path.join(tmp, 'soundtrack.mp3');
  await ff.mixMusic(narrationFile, music, mixed);
  return { audioFile: mixed, perSlideMs, hasMusic: true };
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

    const { audioFile, perSlideMs } = await buildSoundtrack({ tmp, slides, mock });
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
