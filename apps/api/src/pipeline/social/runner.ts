import { SocialRun } from '../../models/SocialRun.js';
import { SocialPost } from '../../models/SocialPost.js';
import { SocialCampaign, type SocialCampaignDoc } from '../../models/SocialCampaign.js';
import { logger } from '../../config/logger.js';
import { NotFound } from '../../utils/errors.js';
import type { SocialPipelineContext, SocialPipelineStep } from './types.js';
import { brainstormTopicStep } from './steps/brainstormTopic.js';
import { generateCaptionStep } from './steps/generateCaption.js';
import { generateImagePromptsStep } from './steps/generateImagePrompts.js';
import { generateImagesStep } from './steps/generateImages.js';
import { postToTiktokStep } from './steps/postToTiktok.js';
import { sendNotificationStep } from './steps/sendNotification.js';

interface StepSpec {
  name: string;
  fn: SocialPipelineStep;
  critical: boolean;
}

const FULL_STEPS: StepSpec[] = [
  { name: 'brainstorm-topic', fn: brainstormTopicStep, critical: true },
  { name: 'generate-caption', fn: generateCaptionStep, critical: true },
  { name: 'generate-image-prompts', fn: generateImagePromptsStep, critical: true },
  { name: 'generate-images', fn: generateImagesStep, critical: true },
  // create-post runs inline between generate-images and post-to-tiktok
  { name: 'post-to-tiktok', fn: postToTiktokStep, critical: true },
  { name: 'send-notification', fn: sendNotificationStep, critical: false },
];

const RETRY_STEPS: StepSpec[] = [
  { name: 'post-to-tiktok', fn: postToTiktokStep, critical: true },
  { name: 'send-notification', fn: sendNotificationStep, critical: false },
];

async function executePipeline(
  campaign: SocialCampaignDoc & { _id: any },
  steps: StepSpec[],
  ctx: SocialPipelineContext,
  opts: { trigger: 'cron' | 'manual' | 'retry'; cronExpression?: string },
) {
  const run = ctx.run as any;
  const startedAt = Date.now();
  let overall: 'success' | 'error' | 'partial' = 'success';
  let firstError: string | undefined;

  for (const spec of steps) {
    // After images are generated, persist the post document so TikTok step can update it
    if (spec.name === 'post-to-tiktok' && !ctx.post && ctx.topic && ctx.images) {
      try {
        ctx.post = (await SocialPost.create({
          campaignId: campaign._id,
          platform: 'tiktok',
          status: 'generating',
          topic: ctx.topic,
          caption: ctx.caption ?? '',
          hashtags: ctx.hashtags ?? [],
          images: ctx.images,
        })) as any;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        run.status = 'error';
        run.error = `Failed to create post document: ${msg}`;
        run.finishedAt = new Date();
        run.durationMs = Date.now() - startedAt;
        await run.save();
        return run;
      }
    }

    const stepStarted = Date.now();
    run.steps.push({ name: spec.name, status: 'running', startedAt: new Date(stepStarted) } as any);
    await run.save();

    try {
      await spec.fn(ctx);
      const finished = Date.now();
      const last = run.steps[run.steps.length - 1] as any;
      last.status = 'success';
      last.finishedAt = new Date(finished);
      last.durationMs = finished - stepStarted;
      await run.save();
    } catch (err) {
      const finished = Date.now();
      const last = run.steps[run.steps.length - 1] as any;
      last.status = 'error';
      last.finishedAt = new Date(finished);
      last.durationMs = finished - stepStarted;
      last.message = err instanceof Error ? err.message : String(err);
      await run.save();
      firstError ??= last.message;
      logger.error({ err, step: spec.name, campaign: campaign.name }, 'social pipeline step failed');

      if (spec.critical) {
        overall = ctx.post ? 'partial' : 'error';
        if (overall === 'error') break;
      } else {
        overall = 'partial';
      }
    }
  }

  // Mark failed post if pipeline errored before posting succeeded
  if (ctx.post && (overall === 'error' || (overall === 'partial' && !(ctx.post as any).platformPostId))) {
    await SocialPost.findByIdAndUpdate(ctx.post._id, {
      status: 'failed',
      failedAt: new Date(),
      failureReason: firstError,
    });
  }

  const finishedAt = Date.now();
  run.status = overall;
  run.finishedAt = new Date(finishedAt);
  run.durationMs = finishedAt - startedAt;
  if (ctx.post) run.postId = ctx.post._id;
  if (firstError) run.error = firstError;
  await run.save();

  logger.info(
    {
      campaign: campaign.name,
      runId: String(run._id),
      trigger: opts.trigger,
      status: run.status,
      durationMs: run.durationMs,
    },
    'social pipeline finished',
  );

  return run;
}

export async function runSocialPipeline(
  campaign: SocialCampaignDoc & { _id: any },
  opts: { trigger: 'cron' | 'manual'; cronExpression?: string } = { trigger: 'manual' },
) {
  const run = await SocialRun.create({
    campaignId: campaign._id,
    trigger: opts.trigger,
    cronExpression: opts.cronExpression,
    status: 'running',
    startedAt: new Date(),
    steps: [],
  });

  const ctx: SocialPipelineContext = { campaign, run: run as any };
  return executePipeline(campaign, FULL_STEPS, ctx, opts);
}

/**
 * Retries posting an already-generated post to TikTok.
 * Reuses topic, caption, hashtags, and images — only runs post-to-tiktok + send-notification.
 * Saves ~3 min of generation time and avoids new OpenAI/Anthropic API calls.
 */
export async function retrySocialPost(postId: string) {
  const post = await SocialPost.findById(postId);
  if (!post) throw NotFound('Post not found');

  const campaign = await SocialCampaign.findById(post.campaignId);
  if (!campaign) throw NotFound('Campaign not found');

  // Reset post state so it doesn't show as failed during retry
  post.status = 'generating';
  post.failedAt = undefined as any;
  post.failureReason = undefined as any;
  await post.save();

  const run = await SocialRun.create({
    campaignId: campaign._id,
    trigger: 'manual',
    status: 'running',
    startedAt: new Date(),
    steps: [],
    postId: post._id,
  });

  const ctx: SocialPipelineContext = {
    campaign: campaign as any,
    run: run as any,
    topic: post.topic,
    caption: post.caption,
    hashtags: post.hashtags,
    images: post.images as any,
    post: post as any,
  };

  return executePipeline(campaign as any, RETRY_STEPS, ctx, { trigger: 'retry' as any });
}
