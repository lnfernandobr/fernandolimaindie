export const INSTAGRAM_LIMITS = Object.freeze({
  HANDLE_MAX: 60,
  NAME_MAX: 120,
  BRIEF_MAX: 1000,
  TOPIC_MAX: 240,
  CAPTION_STYLE_MAX: 500,
  HASHTAG_MAX: 60,
  SLIDES_MIN: 3,
  SLIDES_MAX: 10,
  PAGE_DEFAULT: 50,
  PAGE_MAX: 200,
});

export const INSTAGRAM_DEFAULTS = Object.freeze({
  SLIDES_PER_CAROUSEL: 5,
  IMAGE_SIZE: '1024x1024',
  IMAGE_QUALITY: 'medium',
  IMAGE_FORMAT: 'png',
  IMAGE_CONTENT_TYPE: 'image/png',
  S3_PREFIX: 'instagram',
  TONE: 'inspirador, direto, sem clichê',
  CAPTION_STYLE: 'Português do Brasil, voz pessoal, CTA suave no fim.',
  FALLBACK_VISUAL_STYLE:
    'cinematic editorial photography, deep chiaroscuro lighting, considered composition, premium magazine aesthetic, large negative space, no stock-photo look',
});

export const INSTAGRAM_VIDEO = Object.freeze({
  FPS: 30,
  FORMATS: Object.freeze([
    Object.freeze({ key: 'vertical', width: 1080, height: 1920, file: 'video-9x16.mp4' }),
    Object.freeze({ key: 'square', width: 1080, height: 1080, file: 'video-1x1.mp4' }),
  ]),
  NARRATION_FILE: 'narration.mp3',
  NARRATION_PREFIX: 'narration', // subpasta no S3 com a narração por slide (cache p/ retomar)
  TTS_RETRIES: 2, // tentativas extras de TTS em erro transitório (429/5xx/rede)
  TTS_RETRY_BACKOFF_MS: 1500, // base do backoff entre tentativas de TTS
  SLIDE_PADDING_MS: 600, // tempo extra de imagem depois que a narração termina
  SLIDE_MIN_MS: 3000, // duração mínima de um slide
  SLIDE_FALLBACK_MS: 4000, // duração quando não há narração (mock / slide sem texto)
  NARRATION_GAP_MS: 250, // silêncio inserido entre as narrações de cada slide
  ZOOM_MAX: 1.12, // zoom final do Ken Burns (começa em 1.0)
  UPSCALE: 2, // pré-upscale antes do zoompan, evita o jitter conhecido do filtro
  BLUR: 28, // raio do boxblur do fundo no formato vertical
  MUSIC_VOLUME: 0.15, // volume da trilha sob a narração
  TEXT_WRAP_CHARS: 26, // largura de quebra do texto queimado
  STATUS: Object.freeze({
    IDLE: 'idle',
    GENERATING: 'generating',
    READY: 'ready',
    ERROR: 'error',
  }),
  VIDEO_CONTENT_TYPE: 'video/mp4',
  AUDIO_CONTENT_TYPE: 'audio/mpeg',
});

export const INSTAGRAM_QUEUE_STATUS = Object.freeze({
  PENDING: 'pending',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
  SKIP: 'skip',
});

export const INSTAGRAM_QUEUE_STATUSES = Object.freeze([
  INSTAGRAM_QUEUE_STATUS.PENDING,
  INSTAGRAM_QUEUE_STATUS.GENERATING,
  INSTAGRAM_QUEUE_STATUS.DONE,
  INSTAGRAM_QUEUE_STATUS.ERROR,
  INSTAGRAM_QUEUE_STATUS.SKIP,
]);

export const INSTAGRAM_QUEUE_ACTIONS = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  RUN_NOW: 'runNow',
  SKIP: 'skip',
  REACTIVATE: 'reactivate',
});

export const INSTAGRAM_QUEUE_ACTION_VALUES = Object.freeze([
  INSTAGRAM_QUEUE_ACTIONS.UP,
  INSTAGRAM_QUEUE_ACTIONS.DOWN,
  INSTAGRAM_QUEUE_ACTIONS.RUN_NOW,
  INSTAGRAM_QUEUE_ACTIONS.SKIP,
  INSTAGRAM_QUEUE_ACTIONS.REACTIVATE,
]);

export const INSTAGRAM_PATHS = Object.freeze({
  CHANNELS: '/channels',
  CHANNEL_PARAM: '/:channelId',
  QUEUE: '/queue',
  QUEUE_ITEM_PARAM: '/:itemId',
  RUN: '/run',
  POSTS: '/posts',
  POST_PARAM: '/:postId',
  VIDEO: '/video',
});

export const INSTAGRAM_ERRORS = Object.freeze({
  CHANNEL_NOT_FOUND: 'Instagram channel not found',
  CHANNEL_HANDLE_TAKEN: 'Instagram channel handle already in use',
  QUEUE_ITEM_NOT_FOUND: 'Queue item not found',
  POST_NOT_FOUND: 'Instagram post not found',
  CHANNEL_INACTIVE: 'Channel is inactive',
  GENERATION_FAILED: 'Instagram post generation failed',
  ANTHROPIC_KEY_MISSING: 'ANTHROPIC_API_KEY is not configured',
  ANTHROPIC_INVALID_OUTPUT: 'Anthropic returned invalid output',
  OPENAI_KEY_MISSING: 'OPENAI_API_KEY is not configured',
  OPENAI_IMAGE_FAILED: 'OpenAI image generation failed',
  VIDEO_NO_SLIDES: 'Post has no slides to render into video',
  VIDEO_IN_PROGRESS: 'Video generation already in progress for this post',
  VIDEO_FAILED: 'Instagram video generation failed',
  FFMPEG_FAILED: 'ffmpeg command failed',
});
