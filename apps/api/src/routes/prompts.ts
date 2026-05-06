import { Router } from 'express';
import { inspectAllPrompts } from '../ai/prompts/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * GET /api/v1/prompts — registry de todos os prompts da camada de IA
 * com system + user (renderizado com input sintético) + estimativa de tokens.
 *
 * Read-only. Usado pela página `/configuracoes/prompts` do admin.
 */
export const promptsRouter: Router = Router();

promptsRouter.use(requireAuth);

promptsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json({ items: inspectAllPrompts() });
  }),
);
