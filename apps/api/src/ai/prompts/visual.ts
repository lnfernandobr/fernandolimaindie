/**
 * Sistema visual: art direction central, image specs por tipo de uso e
 * negative prompts em camadas.
 *
 * Cada tipo de imagem (cover, OG, thumbnail, internal, variation) tem:
 *   1. Spec técnica (dimensão, aspecto, modelo de geração suportado).
 *   2. Direção de arte específica (composição, ângulo, intenção).
 *   3. Negative prompt apropriado (combina BASE com extras do tipo).
 *
 * Tudo em inglês quando vai pro modelo de imagem (gpt-image-1, dall-e-3,
 * sdxl performam melhor com prompt em inglês). Alt-text segue o idioma
 * do canal e fica em pt-BR no nosso caso.
 */

// ─── ASPECTOS E SIZES ──────────────────────────────────────────────────────

/**
 * Sizes suportados pelo gpt-image-1: 1024x1024, 1024x1536, 1536x1024.
 * Outros aspectos são alcançados via post-processing (crop após gerar).
 */
export type ImageAspect = 'wide' | 'square' | 'portrait';
export type ImageUsage = 'cover' | 'og' | 'thumbnail' | 'internal' | 'pinterest';

export interface ImageSpec {
  /** Tipo de uso/contexto. */
  usage: ImageUsage;
  /** Aspecto enviado ao gerador. */
  aspect: ImageAspect;
  /** Dimensão entregue pelo modelo de geração. */
  generated: { width: number; height: number };
  /** Dimensão final desejada (após eventual crop). */
  target: { width: number; height: number };
  /** Aspecto-alvo (ex: "16:9", "1:1", "1.91:1"). */
  targetAspect: string;
  /** Onde a imagem é usada. */
  description: string;
}

export const IMAGE_SPECS: Record<ImageUsage, ImageSpec> = {
  cover: {
    usage: 'cover',
    aspect: 'wide',
    generated: { width: 1536, height: 1024 },
    target: { width: 1536, height: 864 }, // 16:9 final via crop vertical
    targetAspect: '16:9',
    description: 'Capa do post na home, listagens e topo do artigo. Hero principal.',
  },
  og: {
    usage: 'og',
    aspect: 'wide',
    generated: { width: 1536, height: 1024 },
    target: { width: 1200, height: 630 }, // 1.91:1 OpenGraph oficial
    targetAspect: '1.91:1',
    description: 'OpenGraph (Facebook, LinkedIn, WhatsApp). Precisa funcionar em preview pequeno.',
  },
  thumbnail: {
    usage: 'thumbnail',
    aspect: 'square',
    generated: { width: 1024, height: 1024 },
    target: { width: 1080, height: 1080 },
    targetAspect: '1:1',
    description: 'Instagram feed, Pinterest, card quadrado.',
  },
  internal: {
    usage: 'internal',
    aspect: 'wide',
    generated: { width: 1536, height: 1024 },
    target: { width: 1200, height: 800 }, // 3:2 dentro do artigo
    targetAspect: '3:2',
    description: 'Imagem de apoio dentro do artigo, ilustrando seção específica.',
  },
  pinterest: {
    usage: 'pinterest',
    aspect: 'portrait',
    generated: { width: 1024, height: 1536 },
    target: { width: 1000, height: 1500 },
    targetAspect: '2:3',
    description: 'Pinterest pin alto, para tração via Pinterest SEO.',
  },
};

// ─── ART DIRECTION (em inglês, vai pro modelo) ─────────────────────────────

/**
 * Diretriz fotográfica base. Empurra para o estética documental real ("magazine
 * still", "candid"), adiciona micro-imperfeições e bloqueia os "AI tells" mais
 * comuns (skin plástica, simetria perfeita, halo, glow, CGI-shine).
 */
export const PHOTO_BASE = `Documentary editorial photograph that looks like a real magazine feature still or a published photojournalism frame, NOT an AI render and NOT a glossy stock photo. Authentic candid moment with environmental honesty: real lived-in detail, slight clutter where appropriate, natural asymmetry, imperfect surfaces. If a person appears, they show natural skin texture, visible pores, fine lines, individual hair strands, slight imperfections — never airbrushed, never plastic, never doll-like. Available light or motivated practical light only (window, lamp, sun, screen glow). No studio strobe, no ringlight, no beauty lighting, no halo glow around the subject. Single dominant subject with intentional negative space. No graphic-design overlays, no infographics, no 3D renders, no stylized illustrations. Composition has the slight imperfection of a frame caught in a real moment, not a perfectly arranged scene. Subject and surroundings must feel grounded in a specific real-world place — a real bedroom of a real person, not a "stock-photo bedroom".`;

/**
 * Linguagem visual neutra: dá direção fotográfica forte SEM travar uma paleta
 * fixa. Antes daqui ficava a estética do sonoprofundo (warm amber + navy +
 * aged wood + brass) injetada em TODA imagem de TODOS os posts — resultado:
 * todas as imagens pareciam variações da mesma cena. Agora a paleta é
 * decidida pelo briefing, em função do conteúdo de cada post.
 */
export const PHOTO_BRAND_DEFAULT = `Tone fits the article subject — vary it post to post. Avoid forcing a single mood across all posts of the same channel. Time of day, color, surface and lighting must follow what the article is about: a post about morning routines wants morning light, a post about siesta wants warm afternoon shadow, a post about kids' sleep wants soft twilight, a post about apps and technology wants cooler clean light. NEVER default to a single palette. Avoid sterile minimalism, clinical white, magazine-cover skin smoothing.`;

/**
 * Especificação técnica fotográfica. Calibrada pra parecer foto real, não CGI.
 */
export const PHOTO_TECHNICAL = `Camera: full-frame body, 35mm or 50mm prime lens, f/1.8 to f/2.8, handheld feel. Color emulating Kodak Portra 400 or Fujifilm Pro 400H — warm midtones, gentle highlight rolloff, true blacks (not crushed). Visible micro film grain. Mild lens vignette on edges. Organic, non-uniform bokeh shape. No clarity-slider over-sharpening, no HDR ringing, no plastic smoothing, no over-saturation.`;

/**
 * Hook visual: instrução pra a imagem ter um detalhe que prende o olhar.
 * Critério de "chama atenção" sem virar clickbait visual.
 */
export const PHOTO_HOOK = `Visual hook: include one decisive, slightly unexpected detail that anchors the eye and rewards a second look — a single object out of place, a sliver of contrasting color in an otherwise quiet palette, an asymmetric gesture, a hand caught mid-motion, a textural surprise. Avoid generic, posed, or strictly symmetrical setups. The image should feel like a frame the photographer waited for, not a setup.`;

/**
 * Texto na imagem: o gerador às vezes "alucina" letras. Ao invés de só proibir
 * (instável), proibimos inglês explicitamente e exigimos pt-BR como fallback.
 */
export const TEXT_LANGUAGE_GUARD = `No rendered text, captions, labels, signs, book titles, packaging text, on-screen text, or typography of any kind in the image. If any text inadvertently appears, it MUST be in Brazilian Portuguese (pt-BR) — never English, never Latin gibberish, never decorative foreign-language text, never AI-typography artifacts. Brand names and logos are also forbidden.`;

// ─── NEGATIVE PROMPTS (em camadas) ─────────────────────────────────────────

/**
 * Negative prompt base. gpt-image-1 não tem campo negativo separado, então o
 * skill `generateImage` injeta isso como "Strictly avoid: ..." no final do
 * prompt principal antes de enviar pra API.
 */
export const NEGATIVE_BASE = `text, words, letters, typography, captions, on-screen text, watermark, logo, signature, English text, foreign-language text, gibberish letters, AI-generated typography artifacts, garbled writing, lorem ipsum, fake brand names, stock photo overlay, low quality, jpeg artifacts, oversharpened, oversaturated, neon colors, plastic skin, doll-like skin, airbrushed smooth skin without pores, beauty-filter face, uncanny faces, dead eyes, deformed hands, extra fingers, melted features, fused fingers, glossy CGI surfaces, octane render look, video-game lighting, hdr ringing, glow halo around subject, perfectly symmetrical composition, sterile empty background, generic AI aesthetic, dreamy fantasy haze, surreal floating elements, cartoon, anime, illustration, 3d render, cgi, painting, drawing, sketch, vector art, concept art.`;

/**
 * Negative específico para fotografia editorial (cover, OG, internal).
 */
export const NEGATIVE_EDITORIAL = `clipart, infographic, diagram, chart, generic stock-photo aesthetic, cliche business meeting, corporate handshake, smiling-at-camera lineup, fake studio lighting, ringlight reflection in eyes, beauty filter, instagram filter glow.`;

/**
 * Negative específico para social/thumbnail (foco em escaneabilidade
 * em tamanho pequeno).
 */
export const NEGATIVE_SOCIAL = `cluttered composition, multiple competing subjects, busy background, low contrast, dark muddy areas, text overlay, click-bait visual, exaggerated forced facial expression.`;

export function negativeFor(usage: ImageUsage): string {
  const editorial = ['cover', 'og', 'internal', 'pinterest'];
  const layers: string[] = [NEGATIVE_BASE];
  if (editorial.includes(usage)) layers.push(NEGATIVE_EDITORIAL);
  if (usage === 'thumbnail' || usage === 'pinterest') layers.push(NEGATIVE_SOCIAL);
  return layers.join(' ');
}

// ─── COMPOSIÇÃO ESPECÍFICA POR USO ─────────────────────────────────────────

/**
 * Cada tipo de imagem precisa de instrução de composição diferente. Bloco
 * que entra no `system` do prompt que GERA a string de imagem.
 */
export const COMPOSITION_BY_USAGE: Record<ImageUsage, string> = {
  cover: `Composition for cover (16:9, large hero): off-center subject following rule of thirds, generous negative space on one side for potential headline overlay. Subject occupies 40-60% of frame. Background lightly out of focus, supports mood without competing.`,
  og: `Composition for OG (1.91:1, preview): subject must read clearly at 600x315 thumbnail size. Single dominant subject, high contrast against background. Avoid important detail near edges (Facebook crops). Strong central or rule-of-thirds anchor.`,
  thumbnail: `Composition for square thumbnail (1:1, social feed): single subject centered or slight rule-of-thirds. Strong silhouette and contrast. Reads at 360x360 in feed. Mood over information.`,
  internal: `Composition for in-article support image (3:2): illustrates a specific concept from the section. Quieter than the cover. Subject size moderate. Should make sense alongside body text without stealing attention.`,
  pinterest: `Composition for Pinterest pin (2:3, vertical): subject in upper third, strong vertical line. Designed for vertical scroll consumption. Tall format, story feel.`,
};
