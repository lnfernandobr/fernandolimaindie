import { z } from 'zod';
import {
  ENTITY_KINDS,
  LIMITS,
  SLUG_PATTERN,
  DEFAULT_LANG,
} from '../../constants/content.js';

const slugString = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(LIMITS.SLUG_MAX)
  .regex(SLUG_PATTERN);

export const createEntitySchema = z.object({
  slug: slugString,
  name: z.string().trim().min(1).max(LIMITS.TITLE_MAX),
  kind: z.enum(ENTITY_KINDS),
  description: z.string().trim().min(1).max(LIMITS.SUMMARY_MAX),
  synonyms: z
    .array(z.string().trim().min(1).max(LIMITS.SYNONYM_MAX))
    .max(LIMITS.SYNONYMS_MAX)
    .default([]),
  imageUrl: z.string().url().optional().nullable(),
  lang: z.string().trim().min(2).max(10).default(DEFAULT_LANG),
});

export const updateEntitySchema = createEntitySchema.partial().omit({ slug: true });

export const entitySlugParamSchema = z.object({ slug: slugString });

export const listEntitiesQuerySchema = z.object({
  kind: z.enum(ENTITY_KINDS).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(LIMITS.PAGE_MAX).default(LIMITS.PAGE_DEFAULT),
});
