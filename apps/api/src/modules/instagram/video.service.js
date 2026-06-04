import { logger } from '../../config/logger.js';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { badRequest, conflict, notFound } from '../../errors/factories.js';
import { findPostById, updatePostVideoVariant } from './posts.repository.js';
import { ensureChannelById } from './channels.service.js';
import { renderVariant } from './video.pipeline.js';

const { STATUS } = INSTAGRAM_VIDEO;

const truncate = (value, limit = 500) => {
  const str = String(value ?? '');
  return str.length > limit ? str.slice(0, limit) : str;
};

const resolveVariants = (variant) => {
  if (variant === 'both') return ['short', 'long'];
  if (variant === 'short' || variant === 'long') return [variant];
  throw badRequest(INSTAGRAM_ERRORS.VIDEO_VARIANT_INVALID);
};

const runVariant = async ({ post, channel, variant }) => {
  try {
    const result = await renderVariant({ post, channel, handle: channel.handle, variant });
    await updatePostVideoVariant(post._id, variant, {
      status: STATUS.READY,
      url: result.url,
      durationMs: result.durationMs ?? 0,
      scenes: result.scenes ?? 0,
      error: null,
      generatedAt: new Date(),
    });
  } catch (err) {
    logger.error({ err: err.message, variant, postId: String(post._id) }, 'video v2 variant failed');
    await updatePostVideoVariant(post._id, variant, {
      status: STATUS.ERROR,
      error: truncate(err.message),
    }).catch(() => {});
  }
};

const runJob = async ({ postId, variants }) => {
  const post = await findPostById(postId);
  if (!post) return;
  const channel = await ensureChannelById(post.channelId);
  for (const variant of variants) {
    // sequencial: variantes pesadas não competem por CPU/render no host
    // eslint-disable-next-line no-await-in-loop
    await runVariant({ post, channel, variant });
  }
};

// Dispara a geração assíncrona das variantes pedidas (short | long | both).
export const startVideoGeneration = async ({ postId, variant = 'short' }) => {
  const post = await findPostById(postId);
  if (!post) throw notFound(INSTAGRAM_ERRORS.POST_NOT_FOUND);
  const variants = resolveVariants(variant);

  for (const v of variants) {
    if (post.video?.[v]?.status === STATUS.GENERATING) {
      throw conflict(INSTAGRAM_ERRORS.VIDEO_IN_PROGRESS);
    }
  }
  for (const v of variants) {
    // eslint-disable-next-line no-await-in-loop
    await updatePostVideoVariant(postId, v, { status: STATUS.GENERATING, error: null });
  }

  runJob({ postId, variants }).catch((err) =>
    logger.error({ err: err.message, postId }, 'video v2 job crashed'),
  );
  return { postId, variants, status: STATUS.GENERATING };
};
