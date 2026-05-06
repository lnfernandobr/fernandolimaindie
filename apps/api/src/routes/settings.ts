import { Router } from 'express';
import { settingsInputSchema, type SettingsDto } from '@bn/shared';
import { Setting, SETTINGS_KEY } from '../models/Setting.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { __resetAIProviders, getEffectiveProviders } from '../ai/providers/index.js';
import { logger } from '../config/logger.js';

export const settingsRouter: Router = Router();

settingsRouter.use(requireAuth);

async function buildDto(): Promise<SettingsDto> {
  const doc = await Setting.findOne({ key: SETTINGS_KEY }).lean();
  const eff = await getEffectiveProviders();
  return {
    aiProvider: eff.config.aiProvider,
    aiModel: eff.config.aiModel,
    imageProvider: eff.config.imageProvider,
    imageModel: eff.config.imageModel,
    updatedAt: (doc?.updatedAt ?? new Date()).toISOString(),
    effectiveAiProvider: eff.effectiveAi,
    effectiveImageProvider: eff.effectiveImage,
  };
}

settingsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await buildDto());
  }),
);

settingsRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const data = settingsInputSchema.parse(req.body);
    await Setting.findOneAndUpdate(
      { key: SETTINGS_KEY },
      {
        $set: {
          key: SETTINGS_KEY,
          aiProvider: data.aiProvider,
          aiModel: data.aiModel,
          imageProvider: data.imageProvider,
          imageModel: data.imageModel,
        },
      },
      { upsert: true, new: true },
    );
    __resetAIProviders();
    logger.info(
      { ...data },
      'settings updated — AI providers cache cleared',
    );
    res.json(await buildDto());
  }),
);
