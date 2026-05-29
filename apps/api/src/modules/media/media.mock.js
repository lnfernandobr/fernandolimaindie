import { MEDIA_DEFAULTS } from '../../constants/media.js';

export const mockAudioBuffer = () =>
  Buffer.from('mock-audio-content-placeholder');

export const mockImageBuffer = () =>
  Buffer.from('mock-image-content-placeholder');

export const mockAudioUrl = (slug) =>
  `${MEDIA_DEFAULTS.MOCK_AUDIO_URL}?slug=${slug}`;

export const mockImageUrl = (slug) =>
  `${MEDIA_DEFAULTS.MOCK_IMAGE_URL}&slug=${slug}`;
