import { env } from '../../config/env.js';
import { badRequest } from '../../errors/factories.js';
import {
  INSTAGRAM_DEFAULTS,
  INSTAGRAM_ERRORS,
  INSTAGRAM_QUEUE_STATUS,
} from '../../constants/instagram.js';
import { uploadBuffer } from '../media/media.s3.js';
import { ensureChannelById } from './channels.service.js';
import { ensureQueueItem, markQueueItem } from './queue.service.js';
import { createPost } from './posts.repository.js';
import { toPublicPost } from './posts.dto.js';
import { generateCarouselPlan } from './generation.anthropic.js';
import { generateSlideImage } from './generation.openai.js';
import { buildMockPlan, mockSlideImageUrl } from './generation.mock.js';
import { prompts } from './prompts.js';

const PROMPT_LOG_LIMIT = 2000;

const truncate = (value, limit) => {
  if (!value) return '';
  const str = String(value);
  return str.length > limit ? str.slice(0, limit) : str;
};

const validatePlan = (plan, slidesCount) => {
  if (!plan || !Array.isArray(plan.slides)) {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  const slides = plan.slides.slice(0, slidesCount);
  if (slides.length === 0) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  return {
    title: truncate(plan.title, 240),
    slides,
    caption: truncate(plan.caption, 2200),
    hashtags: Array.isArray(plan.hashtags) ? plan.hashtags.slice(0, 30) : [],
  };
};

const buildPlan = async ({ channel, topic, brief, slidesCount }) => {
  if (env.OPENAI_MOCK_MODE) return buildMockPlan({ channel, topic, slidesCount });
  const raw = await generateCarouselPlan({ channel, topic, brief, slidesCount });
  return validatePlan(raw, slidesCount);
};

const renderSlide = async ({ channel, slide, slideNumber, totalSlides, postKey }) => {
  const promptUsed = prompts.slideImage({ channel, slide, slideNumber, totalSlides });
  if (env.MEDIA_MOCK_MODE) {
    return {
      index: slideNumber - 1,
      role: slide.role,
      text: slide.text,
      imageScene: slide.imageScene,
      imagePrompt: truncate(promptUsed, PROMPT_LOG_LIMIT),
      imageUrl: mockSlideImageUrl({ channel, slideNumber }),
    };
  }
  const { buffer } = await generateSlideImage({ channel, slide, slideNumber, totalSlides });
  const key = `${INSTAGRAM_DEFAULTS.S3_PREFIX}/${channel.handle}/${postKey}/slide-${slideNumber}.${INSTAGRAM_DEFAULTS.IMAGE_FORMAT}`;
  const imageUrl = await uploadBuffer({
    key,
    buffer,
    contentType: INSTAGRAM_DEFAULTS.IMAGE_CONTENT_TYPE,
  });
  return {
    index: slideNumber - 1,
    role: slide.role,
    text: slide.text,
    imageScene: slide.imageScene,
    imagePrompt: truncate(promptUsed, PROMPT_LOG_LIMIT),
    imageUrl,
  };
};

const newPostKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const runPipeline = async ({ channel, item }) => {
  const slidesCount = channel.slidesPerCarousel ?? INSTAGRAM_DEFAULTS.SLIDES_PER_CAROUSEL;
  const plan = await buildPlan({
    channel,
    topic: item.topic,
    brief: item.brief,
    slidesCount,
  });
  const postKey = newPostKey();
  const renderedSlides = [];
  for (let i = 0; i < plan.slides.length; i += 1) {
    const slide = plan.slides[i];
    const rendered = await renderSlide({
      channel,
      slide,
      slideNumber: i + 1,
      totalSlides: plan.slides.length,
      postKey,
    });
    renderedSlides.push(rendered);
  }
  return createPost({
    channelId: channel._id,
    queueItemId: item._id,
    topic: item.topic,
    title: plan.title || item.topic,
    brief: item.brief,
    slides: renderedSlides,
    caption: plan.caption,
    hashtags: plan.hashtags,
    coverImageUrl: renderedSlides[0]?.imageUrl ?? null,
    status: 'ready',
  });
};

export const generatePostForQueueItem = async ({ channelId, itemId }) => {
  const channelDoc = await ensureChannelById(channelId);
  if (!channelDoc.active) throw badRequest(INSTAGRAM_ERRORS.CHANNEL_INACTIVE);
  const item = await ensureQueueItem(channelId, itemId);
  await markQueueItem(itemId, {
    status: INSTAGRAM_QUEUE_STATUS.GENERATING,
    generationStartedAt: new Date(),
    error: null,
  });
  try {
    const post = await runPipeline({ channel: channelDoc, item });
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.DONE,
      postId: post._id,
      generationFinishedAt: new Date(),
      error: null,
    });
    return toPublicPost(post.toObject());
  } catch (err) {
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.ERROR,
      error: truncate(err?.message ?? INSTAGRAM_ERRORS.GENERATION_FAILED, 500),
      generationFinishedAt: new Date(),
    });
    throw err;
  }
};
