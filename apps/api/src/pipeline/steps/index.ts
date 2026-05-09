/**
 * Steps do pipeline de geração de conteúdo.
 *
 * Cada step:
 *   1. Lê o que precisa do `ctx` (definido pelos steps anteriores)
 *   2. Chama 1 skill da camada de IA (apps/api/src/ai/skills/)
 *   3. Escreve o resultado no `ctx` para os próximos steps
 *
 * Ordem importa. Numerei o nome do arquivo pra deixar a sequência explícita
 * no filesystem. Se quiser pular um step (ex: pular IA pra postar manualmente),
 * basta remover do array em runner.ts.
 */
export { brainstormTopicsStep } from './01-brainstormTopics.js';
export { selectTopicStep } from './02-selectTopic.js';
export { outlineArticleStep } from './03-outlineArticle.js';
export { writeArticleStep } from './04-writeArticle.js';
export { generateMetadataStep } from './05-generateMetadata.js';
export { generateImagePromptStep } from './06-generateImagePrompt.js';
export { generateImageStep } from './07-generateImage.js';
export { resolveCategoryStep } from './09-resolveCategory.js';
export { resolveTagsStep } from './10-resolveTags.js';
export { publishPostStep } from './11-publishPost.js';
export { publishInstagramStep } from './12-publishInstagram.js';
