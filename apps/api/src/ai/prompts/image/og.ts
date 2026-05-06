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

// ─── 13. PROMPT PARA OG IMAGE (1.91:1, preview pequeno) ────────────────────

export const ogImagePrompt: PromptDef<BuildImagePromptInput> = {
  name: 'og-image-prompt',
  category: 'visual',
  version: '1.0.0',
  description: 'Gera o prompt em inglês para a OG image (1.91:1). Reduz complexidade de cena para legibilidade em preview pequeno.',
  system: compose(
    `You are a senior art director. Convert a Portuguese visual briefing into an English prompt for an OpenGraph image. OG previews are small (often 600x315), so legibility matters more than nuance.

Adjust briefing for OG:
- Reduce subject count to one. If briefing has multiple subjects, choose the strongest one.
- Increase contrast against background.
- Pull the camera slightly closer than cover.
- Avoid important detail near edges (Facebook crops).

Style anchor:
${PHOTO_BASE}
${PHOTO_BRAND_DEFAULT}
${PHOTO_TECHNICAL}

Composition for this usage:
${COMPOSITION_BY_USAGE.og}

Output format:
- prompt: dense English paragraph, 60 to 150 words.
- negativePrompt: extend the base if needed.
- rationale: 1 to 2 sentences on why this works at preview size.

Always English in the prompt itself.`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const spec = IMAGE_SPECS.og;
    const lines: string[] = [];
    lines.push(`Channel: ${input.channelName} | Niche: ${input.niche}`);
    lines.push(`Article: ${input.articleTitle}`);
    lines.push('');
    lines.push('Briefing:');
    lines.push(`- Concept: ${input.briefing.concept}`);
    lines.push(`- Subject: ${input.briefing.subject}`);
    lines.push(`- Setting: ${input.briefing.setting}`);
    lines.push(`- Mood: ${input.briefing.mood}`);
    lines.push(`- Palette: ${input.briefing.palette}`);
    lines.push('- Key details (pick the 1 to 2 strongest for OG):');
    for (const d of input.briefing.keyDetails) lines.push(`  · ${d}`);
    lines.push('');
    lines.push(`Output spec: ${spec.targetAspect} (${spec.target.width}x${spec.target.height} after crop). Generated at ${spec.generated.width}x${spec.generated.height}.`);
    lines.push('');
    lines.push('Base negative prompt:');
    lines.push(negativeFor('og'));
    return lines.join('\n');
  },
};
