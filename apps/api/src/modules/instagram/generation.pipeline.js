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
import { buildMockPlan } from './generation.mock.js';
import { prompts } from './prompts.js';

const PROMPT_LOG_LIMIT = 2000;
const MESSAGE_LOG_LIMIT = 240;

const truncate = (value, limit) => {
  if (!value) return '';
  const str = String(value);
  return str.length > limit ? str.slice(0, limit) : str;
};

const sanitizeHashtag = (raw) => {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  const stripped = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  const cleaned = stripped.replace(/[^a-z0-9_]/g, '');
  return cleaned ? `#${cleaned}` : null;
};

const dedupeKeep = (arr) => {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (!item) continue;
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
};

const normalizeTiers = (tiersRaw) => {
  const tiers = tiersRaw && typeof tiersRaw === 'object' ? tiersRaw : {};
  const clean = (arr) =>
    dedupeKeep((Array.isArray(arr) ? arr : []).map(sanitizeHashtag).filter(Boolean));
  const high = clean(tiers.high);
  const medium = clean(tiers.medium).filter((h) => !high.includes(h));
  const low = clean(tiers.low).filter((h) => !high.includes(h) && !medium.includes(h));
  return { high, medium, low };
};

const validatePlan = (plan, slidesCount) => {
  if (!plan || !Array.isArray(plan.slides)) {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  const slides = plan.slides.slice(0, slidesCount);
  if (slides.length === 0) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  const hashtagTiers = normalizeTiers(plan.hashtags);
  return {
    title: truncate(plan.title, 240),
    designConcept: truncate(plan.designConcept, 1200),
    visualStyle: truncate(plan.visualStyle, 1200) || INSTAGRAM_DEFAULTS.FALLBACK_VISUAL_STYLE,
    slides,
    caption: truncate(plan.caption, 2200),
    hashtagTiers,
    hashtags: [...hashtagTiers.high, ...hashtagTiers.medium, ...hashtagTiers.low],
  };
};

const createRunLog = () => {
  const entries = [];
  const track = async (step, label, fn) => {
    const startedAt = new Date();
    const start = Date.now();
    try {
      const result = await fn();
      entries.push({
        step,
        label,
        status: 'ok',
        durationMs: Date.now() - start,
        message: '',
        at: startedAt,
      });
      return result;
    } catch (err) {
      entries.push({
        step,
        label,
        status: 'error',
        durationMs: Date.now() - start,
        message: truncate(err?.message ?? 'unknown', MESSAGE_LOG_LIMIT),
        at: startedAt,
      });
      throw err;
    }
  };
  return { entries, track };
};

const mockSlideImageUrl = (channelHandle, slideNumber) =>
  `https://placehold.co/1024x1024/111827/F9FAFB?text=${encodeURIComponent(`@${channelHandle} ${slideNumber}`)}`;

const renderSlide = async ({ channel, visualStyle, slide, slideNumber, totalSlides, postKey }) => {
  const promptUsed = prompts.slideImage({
    channelHandle: channel.handle,
    visualStyle,
    slide,
    slideNumber,
    totalSlides,
  });
  if (env.MEDIA_MOCK_MODE) {
    return {
      index: slideNumber - 1,
      role: slide.role,
      text: slide.text,
      imageScene: slide.imageScene,
      imagePrompt: truncate(promptUsed, PROMPT_LOG_LIMIT),
      imageUrl: mockSlideImageUrl(channel.handle, slideNumber),
    };
  }
  const { buffer } = await generateSlideImage({
    channelHandle: channel.handle,
    visualStyle,
    slide,
    slideNumber,
    totalSlides,
  });
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

const runPipeline = async ({ channel, item, runLog }) => {
  const slidesCount = channel.slidesPerCarousel ?? INSTAGRAM_DEFAULTS.SLIDES_PER_CAROUSEL;

  const plan = await runLog.track('plan', 'Plano (Claude)', async () => {
    if (env.OPENAI_MOCK_MODE) {
      return validatePlan(buildMockPlan({ channel, topic: item.topic, slidesCount }), slidesCount);
    }
    const raw = await generateCarouselPlan({
      channel,
      topic: item.topic,
      brief: item.brief,
      slidesCount,
    });
    return validatePlan(raw, slidesCount);
  });

  const postKey = newPostKey();
  const renderedSlides = [];
  for (let i = 0; i < plan.slides.length; i += 1) {
    const slide = plan.slides[i];
    const slideNumber = i + 1;
    const rendered = await runLog.track(
      'slide',
      `Slide ${slideNumber} (${slide.role}) — imagem + upload`,
      () =>
        renderSlide({
          channel,
          visualStyle: plan.visualStyle,
          slide,
          slideNumber,
          totalSlides: plan.slides.length,
          postKey,
        }),
    );
    renderedSlides.push(rendered);
  }

  return runLog.track('save', 'Persistir post', () =>
    createPost({
      channelId: channel._id,
      queueItemId: item._id,
      topic: item.topic,
      title: plan.title || item.topic,
      brief: item.brief,
      designConcept: plan.designConcept,
      visualStyle: plan.visualStyle,
      slides: renderedSlides,
      caption: plan.caption,
      hashtags: plan.hashtags,
      hashtagTiers: plan.hashtagTiers,
      coverImageUrl: renderedSlides[0]?.imageUrl ?? null,
      status: 'ready',
    }),
  );
};

export const generatePostForQueueItem = async ({ channelId, itemId }) => {
  const channelDoc = await ensureChannelById(channelId);
  if (!channelDoc.active) throw badRequest(INSTAGRAM_ERRORS.CHANNEL_INACTIVE);
  const item = await ensureQueueItem(channelId, itemId);
  const startedAt = new Date();
  await markQueueItem(itemId, {
    status: INSTAGRAM_QUEUE_STATUS.GENERATING,
    generationStartedAt: startedAt,
    error: null,
    runLog: [],
    runDurationMs: 0,
  });
  const runLog = createRunLog();
  const startMs = Date.now();
  try {
    const post = await runPipeline({ channel: channelDoc, item, runLog });
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.DONE,
      postId: post._id,
      generationFinishedAt: new Date(),
      error: null,
      runLog: runLog.entries,
      runDurationMs: Date.now() - startMs,
    });
    return toPublicPost(post.toObject());
  } catch (err) {
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.ERROR,
      error: truncate(err?.message ?? INSTAGRAM_ERRORS.GENERATION_FAILED, 500),
      generationFinishedAt: new Date(),
      runLog: runLog.entries,
      runDurationMs: Date.now() - startMs,
    });
    throw err;
  }
};
