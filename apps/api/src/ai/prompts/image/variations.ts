import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import {
  COMPOSITION_BY_USAGE,
  IMAGE_SPECS,
  negativeFor,
  PHOTO_BASE,
  PHOTO_BRAND_DEFAULT,
  PHOTO_TECHNICAL,
} from '../visual.js';
import type { ImageVariationInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 17. VARIAÇÕES VISUAIS COM CONSISTÊNCIA DE MARCA ───────────────────────

/**
 * Gera N variações do mesmo briefing, mantendo identidade visual mas
 * mudando ângulo de câmera, hora do dia ou foco do detalhe. Útil para
 * A/B testing de OG/thumbnail e para alimentar a galeria interna do post.
 */
export const imageVariationsPrompt: PromptDef<ImageVariationInput> = {
  name: 'image-variations',
  category: 'visual',
  version: '1.0.0',
  description: 'Gera N variações de prompt em inglês a partir de um briefing único. Mantém identidade visual, varia ângulo, lente, hora do dia e detalhe focado.',
  system: compose(
    `You are a senior art director generating ${'{count}'} variations of the same visual briefing. Each variation must keep the brand identity (palette, mood, surfaces) but change one of:
1. Camera angle (high, low, eye level, over-the-shoulder, top-down).
2. Lens choice (wider environment vs tighter close-up).
3. Time of day (golden hour, blue hour, mid morning, late evening).
4. Detail focus (which key detail anchors the frame).

Each variation has:
- angle: short identifier mixing the dimension that changed (ex: "low-angle-blue-hour", "tight-close-up-detail").
- prompt: full English prompt (60 to 180 words).
- changeNote: 1 sentence describing what is different from the briefing baseline.

Style anchor:
${PHOTO_BASE}
${PHOTO_BRAND_DEFAULT}
${PHOTO_TECHNICAL}

Composition for the target usage will be appended in the user message.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const spec = IMAGE_SPECS[input.usage];
    const lines: string[] = [];
    lines.push(`Channel: ${input.channelName} | Niche: ${input.niche}`);
    lines.push(`Article: ${input.articleTitle}`);
    lines.push(`Target usage: ${input.usage}`);
    lines.push(`Variations to generate: ${input.count}`);
    lines.push('');
    lines.push('Composition rules for the target usage:');
    lines.push(COMPOSITION_BY_USAGE[input.usage]);
    lines.push('');
    lines.push('Briefing baseline:');
    lines.push(`- Concept: ${input.briefing.concept}`);
    lines.push(`- Subject: ${input.briefing.subject}`);
    lines.push(`- Setting: ${input.briefing.setting}`);
    lines.push(`- Mood: ${input.briefing.mood}`);
    lines.push(`- Palette: ${input.briefing.palette}`);
    lines.push('- Key details:');
    for (const d of input.briefing.keyDetails) lines.push(`  · ${d}`);
    if (input.previousAngles?.length) {
      lines.push('');
      lines.push('Already generated angles (do not repeat):');
      for (const a of input.previousAngles) lines.push(`- ${a}`);
    }
    lines.push('');
    lines.push(`Output spec: ${spec.targetAspect} (${spec.target.width}x${spec.target.height}).`);
    lines.push('');
    lines.push('Base negative prompt for all variations:');
    lines.push(negativeFor(input.usage));
    return lines.join('\n');
  },
};
