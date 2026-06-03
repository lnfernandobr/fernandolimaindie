import { notFound } from '../../errors/factories.js';
import { INSTAGRAM_ERRORS, INSTAGRAM_LIMITS } from '../../constants/instagram.js';
import { ensureChannelById } from './channels.service.js';
import {
  countPostsByChannel,
  findPostById,
  listPostsByChannel as queryListPosts,
} from './posts.repository.js';
import { toPostSummary, toPublicPost } from './posts.dto.js';

export const listPostsForChannel = async (channelId, { page = 1, limit = INSTAGRAM_LIMITS.PAGE_DEFAULT } = {}) => {
  await ensureChannelById(channelId);
  const skip = (page - 1) * limit;
  const [docs, total] = await Promise.all([
    queryListPosts({ channelId, skip, limit }),
    countPostsByChannel(channelId),
  ]);
  return {
    items: docs.map(toPostSummary),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  };
};

export const getPostById = async (postId) => {
  const doc = await findPostById(postId);
  if (!doc) throw notFound(INSTAGRAM_ERRORS.POST_NOT_FOUND);
  return toPublicPost(doc);
};
