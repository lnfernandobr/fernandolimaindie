export const DEFAULT_LANG = 'pt-BR';

export const SIGNAL_KINDS = Object.freeze([
  'prayer',
  'psalm',
  'reflection',
  'verse',
  'devotional',
  'novena',
]);

export const SIGNAL_STATUSES = Object.freeze(['draft', 'published']);

export const INTENT_KEYS = Object.freeze([
  'anxiety',
  'sleep',
  'fear',
  'gratitude',
  'protection',
  'faith',
  'hope',
  'family',
  'finances',
  'grief',
  'morning',
  'night',
  'healing',
  'forgiveness',
]);

export const ENTITY_KINDS = Object.freeze([
  'saint',
  'bible_book',
  'concept',
  'place',
  'person',
]);

export const LIMITS = Object.freeze({
  SLUG_MAX: 120,
  TITLE_MAX: 180,
  ANSWER_MAX: 360,
  SUMMARY_MAX: 600,
  BODY_MAX: 60000,
  CHUNK_HTML_MAX: 4000,
  CHUNK_ID_MAX: 60,
  CHUNKS_MAX: 30,
  FAQ_QUESTION_MAX: 200,
  FAQ_ANSWER_MAX: 800,
  FAQ_MAX: 12,
  SYNONYM_MAX: 80,
  SYNONYMS_MAX: 20,
  ENTITY_SLUGS_MAX: 20,
  RELATED_INTENTS_MAX: 12,
  PAGE_DEFAULT: 20,
  PAGE_MAX: 100,
  RELATED_MAX: 6,
});

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SIGNAL_ERRORS = Object.freeze({
  NOT_FOUND: 'Signal not found',
  SLUG_TAKEN: 'A signal with this slug already exists',
  INVALID_TOPIC: 'Referenced topic does not exist',
});

export const TOPIC_ERRORS = Object.freeze({
  NOT_FOUND: 'Topic not found',
  SLUG_TAKEN: 'A topic with this slug already exists',
});

export const ENTITY_ERRORS = Object.freeze({
  NOT_FOUND: 'Entity not found',
  SLUG_TAKEN: 'An entity with this slug already exists',
});

export const MONGO_DUPLICATE_KEY = 11000;
