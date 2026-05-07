import { Run } from '../models/Run.js';
import type { ChannelDoc } from '../models/Channel.js';
import { logger } from '../config/logger.js';
import type { PipelineContext, PipelineStep } from './types.js';
import {
  brainstormTopicsStep,
  selectTopicStep,
  outlineArticleStep,
  writeArticleStep,
  generateMetadataStep,
  generateImagePromptStep,
  generateImageStep,
  resolveAuthorStep,
  resolveCategoryStep,
  resolveTagsStep,
  publishPostStep,
  publishInstagramStep,
} from './steps/index.js';

interface PipelineSpec {
  name: string;
  fn: PipelineStep;
  /** Step crítico — se falhar, aborta o pipeline. Não-críticos só logam o erro. */
  critical: boolean;
}

/**
 * Pipeline de geração de conteúdo, em 12 etapas modulares.
 *
 * 1. brainstorm-topics    → 8-10 candidatos de pauta
 * 2. select-topic         → escolhe 1 com critérios (gap, intent, balanceamento)
 * 3. outline-article      → estrutura H1/H2/H3 + must-include + FAQ
 * 4. write-article        → escreve markdown completo seguindo outline
 * 5. generate-metadata    → title/slug/meta/keywords/tags
 * 6. generate-image-prompt → brief visual + alt-text
 * 7. generate-image       → URL da imagem (provider de imagem)
 * 8. resolve-author       → autor padrão do canal
 * 9. resolve-category     → IA escolhe/cria categoria
 * 10. resolve-tags        → cria tags faltantes
 * 11. publish-post        → grava no DB + revalida site
 * 12. publish-instagram   → stub (logaria publicação)
 *
 * Etapas 1-7 e 11 são CRITICAL (falha = aborta). 8-10 e 12 não são (uma falha
 * em tags não pode impedir publicação que já tem tudo o resto).
 */
const STEPS: PipelineSpec[] = [
  { name: 'brainstorm-topics', fn: brainstormTopicsStep, critical: true },
  { name: 'select-topic', fn: selectTopicStep, critical: true },
  { name: 'outline-article', fn: outlineArticleStep, critical: true },
  { name: 'write-article', fn: writeArticleStep, critical: true },
  { name: 'generate-metadata', fn: generateMetadataStep, critical: true },
  { name: 'generate-image-prompt', fn: generateImagePromptStep, critical: true },
  { name: 'generate-image', fn: generateImageStep, critical: true },
  { name: 'resolve-author', fn: resolveAuthorStep, critical: false },
  { name: 'resolve-category', fn: resolveCategoryStep, critical: false },
  { name: 'resolve-tags', fn: resolveTagsStep, critical: false },
  { name: 'publish-post', fn: publishPostStep, critical: true },
  { name: 'publish-instagram', fn: publishInstagramStep, critical: false },
];

export async function runChannelPipeline(
  channel: ChannelDoc & { _id: any },
  opts: {
    trigger: 'cron' | 'manual';
    cronExpression?: string;
    /** Quando definido, instrui o outline a mirar nesse comprimento de leitura. */
    targetReadingMinutes?: number;
  } = { trigger: 'manual' },
) {
  const run = await Run.create({
    channelId: channel._id,
    trigger: opts.trigger,
    cronExpression: opts.cronExpression,
    status: 'running',
    startedAt: new Date(),
    steps: [],
  });

  const ctx: PipelineContext = { channel, run, targetReadingMinutes: opts.targetReadingMinutes };
  const startedAt = Date.now();
  let overall: 'success' | 'error' | 'partial' = 'success';
  let firstError: string | undefined;

  for (const spec of STEPS) {
    const stepStarted = Date.now();
    run.steps.push({
      name: spec.name,
      status: 'running',
      startedAt: new Date(stepStarted),
    } as any);
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
      logger.error({ err, step: spec.name, channel: channel.slug }, 'pipeline step failed');

      if (spec.critical) {
        overall = ctx.post ? 'partial' : 'error';
        if (overall === 'error') break;
      } else {
        overall = 'partial';
      }
    }
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
      channel: channel.slug,
      runId: String(run._id),
      status: run.status,
      durationMs: run.durationMs,
      postSlug: ctx.post?.slug,
    },
    'pipeline finished',
  );
  return run;
}
