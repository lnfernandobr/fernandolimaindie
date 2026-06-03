import { z } from 'zod';
import { HTTP_STATUS } from '../../constants/http.js';
import { INSTAGRAM_LIMITS } from '../../constants/instagram.js';
import { channelIdParamSchema } from './queue.schema.js';
import { getPostById, listPostsForChannel } from './posts.service.js';

const postIdParamSchema = z.object({
  postId: z.string().regex(/^[a-f0-9]{24}$/i),
});

const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(INSTAGRAM_LIMITS.PAGE_MAX)
    .default(INSTAGRAM_LIMITS.PAGE_DEFAULT),
});

export const handleListPostsByChannel = async (req, res) => {
  const { channelId } = channelIdParamSchema.parse(req.params);
  const query = listPostsQuerySchema.parse(req.query);
  const result = await listPostsForChannel(channelId, query);
  res.status(HTTP_STATUS.OK).json(result);
};

export const handleGetPost = async (req, res) => {
  const { postId } = postIdParamSchema.parse(req.params);
  const post = await getPostById(postId);
  res.status(HTTP_STATUS.OK).json(post);
};
