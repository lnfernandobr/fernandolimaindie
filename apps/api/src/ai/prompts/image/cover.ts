import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import {
  COMPOSITION_BY_USAGE,
  IMAGE_SPECS,
  negativeFor,
  PHOTO_BASE,
  PHOTO_BRAND_DEFAULT,
  PHOTO_HOOK,
  PHOTO_TECHNICAL,
  TEXT_LANGUAGE_GUARD,
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
  version: '1.1.0',
  description: 'Gera o prompt em inglês para a imagem de capa do post (16:9, hero principal). Composição editorial com espaço para overlay.',
  system: compose(
    `You are a senior art director who shoots for documentary editorial features (think New York Times Magazine, The Atlantic, longform feature photography). Your job: convert a Portuguese visual briefing into a single English prompt that produces a real-looking editorial cover photograph — not an AI render, not a glossy stock photo.

Output format:
- prompt: ONE dense English paragraph (90 to 220 words) describing what the camera sees. Lead with: subject + action / decisive moment + setting. Then: light source and direction, time of day, color palette in concrete terms (surface and tone, not abstract color names), lens + aperture + depth of field, micro-textures, the visual hook detail. End with a short "Strictly avoid:" clause that bakes the negatives into the same prompt (gpt-image-1 has no separate negative parameter, so this is the only way negatives reach the model).
- negativePrompt: same content as the "Strictly avoid:" clause, kept structured for logging.
- rationale: 1 to 3 sentences explaining why this composition reads as a real cover photo.

Anti-AI discipline (must be reflected in the prompt itself):
${PHOTO_BASE}
${PHOTO_TECHNICAL}
${PHOTO_HOOK}

Variation discipline:
${PHOTO_BRAND_DEFAULT}
- The palette and setting come from the briefing for THIS post — do not copy phrasing from any imagined "channel default". If the briefing says morning kitchen with cool blue, write that. If golden hour bedroom, write that. Never force amber-and-navy on every cover.

Text rule (carry into the prompt verbatim if needed):
${TEXT_LANGUAGE_GUARD}

Composition for this usage:
${COMPOSITION_BY_USAGE.cover}

Always output the prompt in English (only the alt-text and briefing are pt-BR). Do not switch to Portuguese in the prompt.`,
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
