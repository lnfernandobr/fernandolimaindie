export const SEED_KINDS = Object.freeze([
  'psalm',
  'prayer',
  'devotional',
  'reflection',
  'article',
  'verse-collection',
]);

export const SEED_KIND_TO_SIGNAL_KIND = Object.freeze({
  psalm: 'psalm',
  prayer: 'prayer',
  devotional: 'devotional',
  reflection: 'reflection',
  article: 'article',
  'verse-collection': 'verse_collection',
});

// Ordem em que o cron percorre os tipos e em que a UI lista as cotas.
export const QUOTA_KIND_ORDER = Object.freeze([
  'verse-collection',
  'psalm',
  'prayer',
  'devotional',
  'reflection',
  'article',
]);

// Cota diária default por seedKind (soma = 5/dia). Editável pelo admin.
export const DEFAULT_DAILY_QUOTAS = Object.freeze({
  'verse-collection': 1,
  psalm: 1,
  prayer: 1,
  devotional: 1,
  reflection: 0,
  article: 1,
});

export const QUOTA_PER_KIND_MAX = 20;

export const GENERATION_DEFAULTS = Object.freeze({
  BATCH_LIMIT: 5,
  BATCH_LIMIT_MAX: 20,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 60000,
  STATUS_PUBLISHED: 'published',
  STATUS_DRAFT: 'draft',
});

export const SEED_RUN_STATUS = Object.freeze({
  IDLE: 'idle',
  GENERATING: 'generating',
  DONE: 'done',
  ERROR: 'error',
});

export const SEED_RUN_STATUSES = Object.freeze([
  SEED_RUN_STATUS.IDLE,
  SEED_RUN_STATUS.GENERATING,
  SEED_RUN_STATUS.DONE,
  SEED_RUN_STATUS.ERROR,
]);

export const GENERATION_OUTCOMES = Object.freeze({
  CREATED: 'created',
  SKIPPED_PUBLISHED: 'skipped_published',
  REGENERATED_DRAFT: 'regenerated_draft',
  FAILED: 'failed',
});

export const GENERATION_ERRORS = Object.freeze({
  SEED_NOT_FOUND: 'Seed not found in catalog',
  ANTHROPIC_KEY_MISSING: 'ANTHROPIC_API_KEY is not configured',
  ANTHROPIC_CALL_FAILED: 'Anthropic structured completion failed',
  ANTHROPIC_INVALID_OUTPUT: 'Anthropic returned content that failed validation',
  UNKNOWN_SEED_KIND: 'Unknown seed kind',
});
