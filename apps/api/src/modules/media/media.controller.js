import { z } from 'zod';
import { HTTP_STATUS } from '../../constants/http.js';
import { generateAudioForSignal, generateImageForSignal } from './media.service.js';
import { toMediaResult } from './media.dto.js';

const slugParam = z.object({ slug: z.string().trim().min(1) });
const forceQuery = z.object({ force: z.coerce.boolean().default(false) });

export const handleGenerateAudio = async (req, res) => {
  const { slug } = slugParam.parse(req.params);
  const { force } = forceQuery.parse(req.query);
  const result = await generateAudioForSignal({ slug, force });
  res.status(HTTP_STATUS.OK).json(toMediaResult(result));
};

export const handleGenerateImage = async (req, res) => {
  const { slug } = slugParam.parse(req.params);
  const { force } = forceQuery.parse(req.query);
  const result = await generateImageForSignal({ slug, force });
  res.status(HTTP_STATUS.OK).json(toMediaResult(result));
};
