import { env } from '../../config/env.js';
import { MEDIA_DEFAULTS, MEDIA_ERRORS, MEDIA_PATHS } from '../../constants/media.js';
import { notFound, conflict } from '../../errors/factories.js';
import {
  findSignalBySlug,
  updateSignalBySlug,
} from '../signals/signals.repository.js';
import { generateSpeech } from './media.elevenlabs.js';
import { generateImage } from './media.image.js';
import { uploadBuffer } from './media.s3.js';
import { mockAudioUrl, mockImageUrl } from './media.mock.js';

const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const buildAudioText = (signal) => {
  if (signal.chunks?.length) {
    return [signal.answer, ...signal.chunks.map((c) => stripHtml(c.html))].join('\n\n');
  }
  return signal.answer;
};

export const generateAudioForSignal = async ({ slug, force }) => {
  const signal = await findSignalBySlug(slug);
  if (!signal) throw notFound(MEDIA_ERRORS.SIGNAL_NOT_FOUND);
  if (signal.audioUrl && !force) throw conflict(MEDIA_ERRORS.ALREADY_HAS_AUDIO);

  let audioUrl;

  if (env.MEDIA_MOCK_MODE) {
    audioUrl = mockAudioUrl(slug);
  } else {
    const text = buildAudioText(signal);
    const buffer = await generateSpeech(text);
    audioUrl = await uploadBuffer({
      key: `${MEDIA_DEFAULTS.S3_PREFIX_AUDIO}/${slug}.mp3`,
      buffer,
      contentType: 'audio/mpeg',
    });
  }

  await updateSignalBySlug(slug, { audioUrl });
  return { slug, audioUrl };
};

export const generateImageForSignal = async ({ slug, force }) => {
  const signal = await findSignalBySlug(slug);
  if (!signal) throw notFound(MEDIA_ERRORS.SIGNAL_NOT_FOUND);
  if (signal.imageUrl && !force) throw conflict(MEDIA_ERRORS.ALREADY_HAS_IMAGE);

  let imageUrl;

  if (env.MEDIA_MOCK_MODE) {
    imageUrl = mockImageUrl(slug);
  } else {
    const buffer = await generateImage(signal);
    imageUrl = await uploadBuffer({
      key: `${MEDIA_DEFAULTS.S3_PREFIX_IMAGE}/${slug}.jpg`,
      buffer,
      contentType: 'image/jpeg',
    });
  }

  await updateSignalBySlug(slug, { imageUrl });
  return { slug, imageUrl };
};
