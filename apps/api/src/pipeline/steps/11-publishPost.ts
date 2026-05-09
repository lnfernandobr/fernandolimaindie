import { Post } from '../../models/Post.js';
import { countWords, readingTimeMinutes } from '../../utils/readingTime.js';
import { revalidateChannel } from '../../services/revalidate.js';
import type { PipelineStep } from '../types.js';

/**
 * Etapa 10 — Persiste o Post no banco e dispara revalidação no site.
 *
 * Toda saída acumulada no `ctx` (article, metadata, cover, category, tagSlugs)
 * entra aqui e vira um documento Post.
 */
export const publishPostStep: PipelineStep = async (ctx) => {
  const { channel, topic, article, metadata, cover, category, tagSlugs } = ctx;
  if (!topic || !article || !metadata || !cover || !category) {
    throw new Error('publishPost: missing required context');
  }

  let slug = metadata.slug;
  if (await Post.exists({ channelId: channel._id, slug } as any)) {
    slug = `${slug}-${Date.now().toString(36).slice(-5)}`.slice(0, 80);
  }

  const wc = countWords(article.content);
  const post = await Post.create({
    channelId: channel._id,
    slug,
    title: topic.refinedTitle,
    excerpt: article.excerpt,
    content: article.content,
    format: topic.selected.format,
    status: 'published',
    categoryId: category._id,
    tags: tagSlugs ?? [],
    coverImage: cover,
    gallery: [],
    metaTitle: metadata.metaTitle,
    metaDescription: metadata.metaDescription,
    keywords: metadata.keywords,
    faq: [], // se quiser, podemos extrair do markdown via regex; por ora deixamos pra futuro
    howToSteps: [],
    references: [],
    language: channel.language,
    wordCount: wc,
    readingTimeMinutes: readingTimeMinutes(wc),
    publishedAt: new Date(),
    featured: false,
  } as any);

  ctx.post = post as any;
  await revalidateChannel(String(channel._id), post.slug);
};
