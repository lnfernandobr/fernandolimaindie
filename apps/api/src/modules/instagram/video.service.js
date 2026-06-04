import { logger } from '../../config/logger.js';
import { INSTAGRAM_ERRORS, INSTAGRAM_VIDEO } from '../../constants/instagram.js';
import { badRequest, conflict, notFound } from '../../errors/factories.js';
import { findPostById, updatePostVideo } from './posts.repository.js';
import { ensureChannelById } from './channels.service.js';
import { renderPostVideo } from './video.pipeline.js';

const { STATUS } = INSTAGRAM_VIDEO;

const truncate = (value, limit = 500) => {
  const str = String(value ?? '');
  return str.length > limit ? str.slice(0, limit) : str;
};

const runVideoJob = async ({ postId }) => {
  try {
    const post = await findPostById(postId);
    if (!post) throw notFound(INSTAGRAM_ERRORS.POST_NOT_FOUND);
    const channel = await ensureChannelById(post.channelId);
    const result = await renderPostVideo({
      postId: String(post._id),
      handle: channel.handle,
      slides: post.slides,
    });
    await updatePostVideo(postId, {
      status: STATUS.READY,
      verticalUrl: result.verticalUrl ?? null,
      squareUrl: result.squareUrl ?? null,
      narrationUrl: result.narrationUrl ?? null,
      durationMs: result.durationMs ?? 0,
      error: null,
      generatedAt: new Date(),
    });
  } catch (err) {
    logger.error({ err: err.message, postId }, 'instagram video generation failed');
    await updatePostVideo(postId, {
      status: STATUS.ERROR,
      error: truncate(err.message),
    }).catch(() => {});
  }
};

// Marca o post como "gerando" e dispara o render em background (não bloqueia a request).
export const startVideoGeneration = async ({ postId }) => {
  const post = await findPostById(postId);
  if (!post) throw notFound(INSTAGRAM_ERRORS.POST_NOT_FOUND);
  if (post.video?.status === STATUS.GENERATING) {
    throw conflict(INSTAGRAM_ERRORS.VIDEO_IN_PROGRESS);
  }
  if (!post.slides?.length) throw badRequest(INSTAGRAM_ERRORS.VIDEO_NO_SLIDES);

  await updatePostVideo(postId, { status: STATUS.GENERATING, error: null });
  runVideoJob({ postId }).catch((err) =>
    logger.error({ err: err.message, postId }, 'instagram video job crashed'),
  );
  return { postId, status: STATUS.GENERATING };
};
