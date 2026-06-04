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
  // Variantes de vídeo. Cada uma define proporção, tamanho de imagem (gpt-image-2),
  // duração-alvo e densidade de cenas (~1 imagem a cada secondsPerScene).
  VARIANTS: Object.freeze({
    short: Object.freeze({
      key: 'short',
      label: 'Curto 9:16',
      width: 1080,
      height: 1920,
      aspect: 'vertical',
      imageSize: '1024x1536', // gpt-image-2 retrato
      file: 'short-9x16.mp4',
      targetSeconds: 75,
      secondsPerScene: 9,
      minScenes: 6,
      maxScenes: 12,
      captionStyle: 'word', // legenda palavra-a-palavra
    }),
    long: Object.freeze({
      key: 'long',
      label: 'Longo 16:9',
      width: 1920,
      height: 1080,
      aspect: 'horizontal',
      imageSize: '1536x1024', // gpt-image-2 paisagem
      file: 'long-16x9.mp4',
      targetSeconds: 300,
      secondsPerScene: 10,
      minScenes: 20,
      maxScenes: 36,
      captionStyle: 'discreet', // legenda mais discreta no longo
    }),
  }),
  VARIANT_KEYS: Object.freeze(['short', 'long']),
  REQUEST_VARIANTS: Object.freeze(['short', 'long', 'both']),
  // Render
  XFADE_MS: 500, // duração da transição (crossfade) entre cenas
  ZOOM_MAX: 1.12, // zoom final do Ken Burns (começa em 1.0)
  UPSCALE: 2, // pré-upscale antes do zoompan, evita o jitter do filtro
  MUSIC_VOLUME: 0.15, // volume da trilha sob a narração
  // Cena / áudio
  SCENE_PADDING_MS: 600, // respiro depois que a narração da cena termina
  SCENE_MIN_MS: 2500, // duração mínima de uma cena
  SCENE_FALLBACK_MS: 4000, // duração quando não há narração (mock / TTS falhou)
  // Resiliência
  TTS_RETRIES: 2, // tentativas extras de TTS em erro transitório (429/5xx/rede)
  TTS_RETRY_BACKOFF_MS: 1500,
  IMAGE_RETRIES: 2, // tentativas extras de geração de imagem
  // S3 (cache por post/variante — retoma de onde parou)
  SCRIPT_FILE: 'script.json',
  SCENE_PREFIX: 'scenes', // imagens das cenas
  NARRATION_PREFIX: 'narration', // narração por cena
  STATUS: Object.freeze({
    IDLE: 'idle',
    GENERATING: 'generating',
    READY: 'ready',
    ERROR: 'error',
  }),
  VIDEO_CONTENT_TYPE: 'video/mp4',
  AUDIO_CONTENT_TYPE: 'audio/mpeg',
  IMAGE_CONTENT_TYPE: 'image/png',
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
  VIDEO_VARIANT_INVALID: 'Invalid video variant (expected short | long | both)',
  VIDEO_SCRIPT_FAILED: 'Video script generation failed',
  VIDEO_IMAGE_FAILED: 'Scene image generation failed',
  FFMPEG_FAILED: 'ffmpeg command failed',
});
