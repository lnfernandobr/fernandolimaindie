export const SEED_KINDS = Object.freeze([
  'psalm',
  'saint-prayer',
  'intent-prayer',
  'devotional',
]);

export const SEED_KIND_TO_SIGNAL_KIND = Object.freeze({
  psalm: 'psalm',
  'saint-prayer': 'prayer',
  'intent-prayer': 'prayer',
  devotional: 'devotional',
});

export const GENERATION_DEFAULTS = Object.freeze({
  BATCH_LIMIT: 5,
  BATCH_LIMIT_MAX: 20,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 60000,
  STATUS_PUBLISHED: 'published',
  STATUS_DRAFT: 'draft',
});

export const GENERATION_OUTCOMES = Object.freeze({
  CREATED: 'created',
  SKIPPED_PUBLISHED: 'skipped_published',
  REGENERATED_DRAFT: 'regenerated_draft',
  FAILED: 'failed',
});

export const GENERATION_ERRORS = Object.freeze({
  SEED_NOT_FOUND: 'Seed not found in catalog',
  OPENAI_KEY_MISSING: 'OPENAI_API_KEY is not configured',
  OPENAI_CALL_FAILED: 'OpenAI structured completion failed',
  OPENAI_INVALID_OUTPUT: 'OpenAI returned content that failed validation',
  UNKNOWN_SEED_KIND: 'Unknown seed kind',
});

export const OPENAI_RESPONSE_FORMAT_NAME = 'signal_content';
