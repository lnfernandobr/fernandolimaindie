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
});
