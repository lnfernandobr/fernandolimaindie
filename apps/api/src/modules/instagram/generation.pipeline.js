import { env } from '../../config/env.js';
import { badRequest } from '../../errors/factories.js';
import {
  INSTAGRAM_DEFAULTS,
  INSTAGRAM_ERRORS,
  INSTAGRAM_QUEUE_STATUS,
} from '../../constants/instagram.js';
import { uploadBuffer } from '../media/media.s3.js';
import { logger } from '../../config/logger.js';
import { ensureChannelById } from './channels.service.js';
import { appendQueueItemRunLog, ensureQueueItem, markQueueItem } from './queue.service.js';
import { createPost } from './posts.repository.js';
import { toPublicPost } from './posts.dto.js';
import { generateCarouselPlan } from './generation.anthropic.js';
import { generateSlideImage } from './generation.openai.js';
import { buildMockPlan } from './generation.mock.js';
import { startVideoGeneration } from './video.service.js';
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

const normalizeAnchors = (raw) => {
  const a = raw && typeof raw === 'object' ? raw : {};
  return {
    medium: truncate(a.medium, 400),
    palette: truncate(a.palette, 400),
    lighting: truncate(a.lighting, 400),
    lensOrTechnique: truncate(a.lensOrTechnique || a.lens || a.technique, 400),
    composition: truncate(a.composition, 400),
    texture: truncate(a.texture, 400),
    reference: truncate(a.reference, 400),
  };
};

const flattenAnchors = (a) =>
  [
    a.medium && `medium: ${a.medium}`,
    a.palette && `palette: ${a.palette}`,
    a.lighting && `lighting: ${a.lighting}`,
    a.lensOrTechnique && `lens/technique: ${a.lensOrTechnique}`,
    a.composition && `composition: ${a.composition}`,
    a.texture && `texture: ${a.texture}`,
    a.reference && `reference: ${a.reference}`,
  ]
    .filter(Boolean)
    .join(' · ');

const validatePlan = (plan, slidesCount) => {
  if (!plan || !Array.isArray(plan.slides)) {
    throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  }
  const slides = plan.slides.slice(0, slidesCount).map((s) => ({
    role: s.role,
    text: s.text,
    imageSubject: truncate(s.imageSubject, 400),
    imageScene: truncate(s.imageScene, 800),
  }));
  if (slides.length === 0) throw badRequest(INSTAGRAM_ERRORS.ANTHROPIC_INVALID_OUTPUT);
  const visualAnchors = normalizeAnchors(plan.visualAnchors);
  const visualStyle =
    flattenAnchors(visualAnchors) ||
    truncate(plan.visualStyle, 1200) ||
    INSTAGRAM_DEFAULTS.FALLBACK_VISUAL_STYLE;
  const hashtagTiers = normalizeTiers(plan.hashtags);
  return {
    title: truncate(plan.title, 240),
    designConcept: truncate(plan.designConcept, 1200),
    visualAnchors,
    visualStyle,
    slides,
    caption: truncate(plan.caption, 2200),
    hashtagTiers,
    hashtags: [...hashtagTiers.high, ...hashtagTiers.medium, ...hashtagTiers.low],
  };
};

const createRunLog = ({ itemId, runStartedAt }) => {
  const entries = [];
  const persist = async (entry) => {
    try {
      await appendQueueItemRunLog(itemId, entry, Date.now() - runStartedAt);
    } catch (err) {
      logger.warn({ err: err.message, itemId }, 'failed to persist run log entry');
    }
  };
  const track = async (step, label, fn) => {
    const startedAt = new Date();
    const start = Date.now();
    try {
      const result = await fn();
      const entry = {
        step,
        label,
        status: 'ok',
        durationMs: Date.now() - start,
        message: '',
        at: startedAt,
      };
      entries.push(entry);
      await persist(entry);
      return result;
    } catch (err) {
      const entry = {
        step,
        label,
        status: 'error',
        durationMs: Date.now() - start,
        message: truncate(err?.message ?? 'unknown', MESSAGE_LOG_LIMIT),
        at: startedAt,
      };
      entries.push(entry);
      await persist(entry);
      throw err;
    }
  };
  const trackFallback = async (step, attempts) => {
    let lastErr;
    for (const attempt of attempts) {
      try {
        return await track(step, attempt.label, attempt.fn);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr ?? new Error(`${step} failed`);
  };
  return { entries, track, trackFallback };
};

const mockSlideImageUrl = (channelHandle, slideNumber) =>
  `https://placehold.co/1024x1024/111827/F9FAFB?text=${encodeURIComponent(`@${channelHandle} ${slideNumber}`)}`;

const renderSlide = async ({ channel, visualAnchors, slide, slideNumber, totalSlides, postKey }) => {
  const promptUsed = prompts.slideImage({
    channelHandle: channel.handle,
    visualAnchors,
    slide,
    slideNumber,
    totalSlides,
  });
  if (env.MEDIA_MOCK_MODE) {
    return {
      index: slideNumber - 1,
      role: slide.role,
      text: slide.text,
      imageSubject: slide.imageSubject,
      imageScene: slide.imageScene,
      imagePrompt: truncate(promptUsed, PROMPT_LOG_LIMIT),
      imageUrl: mockSlideImageUrl(channel.handle, slideNumber),
    };
  }
  const { buffer } = await generateSlideImage({
    channelHandle: channel.handle,
    visualAnchors,
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
    imageSubject: slide.imageSubject,
    imageScene: slide.imageScene,
    imagePrompt: truncate(promptUsed, PROMPT_LOG_LIMIT),
    imageUrl,
  };
};

const newPostKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const runPipeline = async ({ channel, item, runLog }) => {
  const slidesCount = channel.slidesPerCarousel ?? INSTAGRAM_DEFAULTS.SLIDES_PER_CAROUSEL;

  const plan = env.OPENAI_MOCK_MODE
    ? await runLog.track('plan', 'Plano (mock)', () =>
        validatePlan(buildMockPlan({ channel, topic: item.topic, slidesCount }), slidesCount),
      )
    : await runLog.track('plan', 'Plano (Claude)', async () => {
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
          visualAnchors: plan.visualAnchors,
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
      visualAnchors: plan.visualAnchors,
      slides: renderedSlides,
      caption: plan.caption,
      hashtags: plan.hashtags,
      hashtagTiers: plan.hashtagTiers,
      coverImageUrl: renderedSlides[0]?.imageUrl ?? null,
      status: 'ready',
    }),
  );
};

const runPostJob = async ({ channelDoc, item, itemId, startMs }) => {
  const runLog = createRunLog({ itemId, runStartedAt: startMs });
  try {
    const post = await runPipeline({ channel: channelDoc, item, runLog });
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.DONE,
      postId: post._id,
      generationFinishedAt: new Date(),
      error: null,
      runDurationMs: Date.now() - startMs,
    });
    if (channelDoc.autoVideo) {
      startVideoGeneration({
        postId: String(post._id),
        variant: channelDoc.videoVariant || 'short',
      }).catch((err) =>
        logger.error({ err: err.message, postId: String(post._id) }, 'auto video generation failed'),
      );
    }
    return toPublicPost(post.toObject());
  } catch (err) {
    await markQueueItem(itemId, {
      status: INSTAGRAM_QUEUE_STATUS.ERROR,
      error: truncate(err?.message ?? INSTAGRAM_ERRORS.GENERATION_FAILED, 500),
      generationFinishedAt: new Date(),
      runDurationMs: Date.now() - startMs,
    });
    throw err;
  }
};

export const startPostGeneration = async ({ channelId, itemId }) => {
  const channelDoc = await ensureChannelById(channelId);
  if (!channelDoc.active) throw badRequest(INSTAGRAM_ERRORS.CHANNEL_INACTIVE);
  const item = await ensureQueueItem(channelId, itemId);
  const startedAt = new Date();
  await markQueueItem(itemId, {
    status: INSTAGRAM_QUEUE_STATUS.GENERATING,
    generationStartedAt: startedAt,
    generationFinishedAt: null,
    error: null,
    runLog: [],
    runDurationMs: 0,
    postId: null,
  });
  const startMs = Date.now();
  runPostJob({ channelDoc, item, itemId, startMs }).catch((err) => {
    logger.error(
      { err: err.message, itemId, channelId: String(channelId) },
      'instagram post generation failed',
    );
  });
  return { itemId, status: INSTAGRAM_QUEUE_STATUS.GENERATING, startedAt };
};
