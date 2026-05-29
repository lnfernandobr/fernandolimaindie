export const MEDIA_DEFAULTS = Object.freeze({
  ELEVENLABS_VOICE_ID: 'pNInz6obpgDQGcFmaJgB',
  ELEVENLABS_MODEL: 'eleven_multilingual_v2',
  ELEVENLABS_STABILITY: 0.5,
  ELEVENLABS_SIMILARITY: 0.75,
  S3_PREFIX_AUDIO: 'audio',
  S3_PREFIX_IMAGE: 'image',
  MOCK_AUDIO_URL: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  MOCK_IMAGE_URL: 'https://placehold.co/1024x1024/B7411E/FBF6EE?text=SoulSignal',
  IMAGE_SIZE: '1024x1024',
  IMAGE_MODEL: 'dall-e-3',
  IMAGE_QUALITY: 'standard',
});

export const MEDIA_ERRORS = Object.freeze({
  ELEVENLABS_KEY_MISSING: 'ELEVENLABS_API_KEY is not configured',
  ELEVENLABS_CALL_FAILED: 'ElevenLabs TTS generation failed',
  OPENAI_IMAGE_FAILED: 'DALL-E image generation failed',
  S3_NOT_CONFIGURED: 'AWS S3 is not configured',
  S3_UPLOAD_FAILED: 'S3 upload failed',
  SIGNAL_NOT_FOUND: 'Signal not found',
  ALREADY_HAS_AUDIO: 'Signal already has audio — use force to overwrite',
  ALREADY_HAS_IMAGE: 'Signal already has image — use force to overwrite',
});

export const MEDIA_PATHS = Object.freeze({
  AUDIO: '/audio',
  IMAGE: '/image',
  SLUG_PARAM: '/:slug',
});
