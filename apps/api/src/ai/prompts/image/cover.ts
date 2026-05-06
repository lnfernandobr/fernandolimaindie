import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import {
  COMPOSITION_BY_USAGE,
  IMAGE_SPECS,
  negativeFor,
  PHOTO_BASE,
  PHOTO_BRAND_DEFAULT,
  PHOTO_TECHNICAL,
} from '../visual.js';
import type { BuildImagePromptInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 12. PROMPT PARA IMAGEM DE CAPA (16:9) ─────────────────────────────────

/**
 * Recebe o briefing já produzido por imageBriefingPrompt e gera o prompt
 * em inglês que vai pro gerador (gpt-image-1, dall-e-3, sdxl).
 *
 * Saída: { prompt, negativePrompt, rationale }. O pipeline chama o gerador
 * de imagem com `prompt` e `aspect: 'wide'`.
 */
export const coverImagePrompt: PromptDef<BuildImagePromptInput> = {
  name: 'cover-image-prompt',
  category: 'visual',
  version: '1.0.0',
  description: 'Gera o prompt em inglês para a imagem de capa do post (16:9, hero principal). Composição editorial com espaço para overlay.',
  system: compose(
    `You are a senior art director. Your job: convert a Portuguese visual briefing into a single English prompt that produces a professional editorial cover photograph.

Output format:
- prompt: a single dense English paragraph following editorial photography conventions. Include: subject, action, setting, lighting, time of day, color palette, lens, depth of field, mood. Aim 80 to 200 words.
- negativePrompt: things to avoid (already includes the layered base). Add specific avoidances if the briefing implies them.
- rationale: 1 to 3 sentences explaining why this composition works for cover usage.

Style anchor (use unless the channel explicitly overrides):
${PHOTO_BASE}
${PHOTO_BRAND_DEFAULT}
${PHOTO_TECHNICAL}

Composition for this usage:
${COMPOSITION_BY_USAGE.cover}

Always output the prompt in English. Do not switch to Portuguese.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const spec = IMAGE_SPECS.cover;
    const negativeBase = negativeFor('cover');
    const lines: string[] = [];
    lines.push(`Channel: ${input.channelName} | Niche: ${input.niche}`);
    lines.push(`Article: ${input.articleTitle}`);
    lines.push('');
    lines.push('Visual briefing (in Portuguese, translate the meaning into English in your prompt):');
    lines.push(`- Concept: ${input.briefing.concept}`);
    lines.push(`- Subject: ${input.briefing.subject}`);
    lines.push(`- Setting: ${input.briefing.setting}`);
    lines.push(`- Mood: ${input.briefing.mood}`);
    lines.push(`- Palette: ${input.briefing.palette}`);
    lines.push('- Key details:');
    for (const d of input.briefing.keyDetails) lines.push(`  · ${d}`);
    lines.push('');
    lines.push(`Output spec: ${spec.targetAspect} (${spec.target.width}x${spec.target.height} after crop). Generated at ${spec.generated.width}x${spec.generated.height}.`);
    lines.push('');
    lines.push('Base negative prompt (you may extend, do not remove):');
    lines.push(negativeBase);
    return lines.join('\n');
  },
};
