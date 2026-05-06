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

// ─── 15. PROMPT PARA IMAGENS INTERNAS DE APOIO ─────────────────────────────

/**
 * Imagens internas servem de apoio editorial. Devem ser quietas (não
 * roubam atenção do texto) mas continuam editoriais e coerentes com a
 * paleta do canal. Recebem `concept` específico da seção, não do post
 * inteiro, para dar variedade ao artigo.
 */
export const internalImagePrompt: PromptDef<BuildImagePromptInput> = {
  name: 'internal-image-prompt',
  category: 'visual',
  version: '1.0.0',
  description: 'Gera prompt em inglês para imagem interna de apoio (3:2). Mais quieta que a cover, ilustra um conceito específico da seção.',
  system: compose(
    `You are a senior art director creating a supporting image inside an article. It must NOT compete with the cover for attention.

Adjust briefing for internal use:
- Quieter mood. Subject smaller. More environment, less close-up.
- Detail-rich background that rewards lingering eyes (because the reader is inside the article).
- Should sit comfortably between paragraphs.

Style anchor:
${PHOTO_BASE}
${PHOTO_BRAND_DEFAULT}
${PHOTO_TECHNICAL}

Composition for this usage:
${COMPOSITION_BY_USAGE.internal}

Output format:
- prompt: dense English paragraph, 70 to 170 words.
- negativePrompt: extend the base.
- rationale: 1 to 2 sentences on why this supports without stealing attention.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const spec = IMAGE_SPECS.internal;
    const lines: string[] = [];
    lines.push(`Channel: ${input.channelName} | Niche: ${input.niche}`);
    lines.push(`Article: ${input.articleTitle}`);
    lines.push('');
    lines.push('Briefing for this section (different from cover, illustrates one specific section):');
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
    lines.push('Base negative prompt:');
    lines.push(negativeFor('internal'));
    return lines.join('\n');
  },
};
