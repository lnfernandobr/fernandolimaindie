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
 * Diretriz fotográfica base. Define que tudo é editorial, fotográfico,
 * humano. Aplicada a todas as imagens.
 */
export const PHOTO_BASE = `Editorial photography style. Real photographic look. Natural lighting. Shallow depth of field. Visual focus on a single subject. No graphic design overlays. No infographic. No 3D render. No stylized illustration.`;

/**
 * Linguagem visual da marca Sonoprofundo (default quando o canal não
 * sobrescreve). Outros canais podem sobrescrever via brand.notes ou
 * extensão futura do BrandProfile.
 */
export const PHOTO_BRAND_DEFAULT = `Tone: warm, calm, intimate. Time of day: late afternoon golden hour or pre-dawn. Color palette: warm amber accent (#e8b66a feel), deep navy and charcoal shadows (#10141d feel), creamy off-white highlights. Surfaces: aged wood, soft linen, ceramic, brass. Avoid sterile minimalism and clinical white.`;

/**
 * Especificação técnica fotográfica. Coerente com editorial moderno.
 */
export const PHOTO_TECHNICAL = `Camera direction: shot on full-frame with 50mm or 85mm prime lens at f/2.0 to f/2.8. Subtle film grain. Natural color, no oversaturation. Sharp on subject, soft falloff on background.`;

// ─── NEGATIVE PROMPTS (em camadas) ─────────────────────────────────────────

/**
 * Negative prompt base aplicado em qualquer imagem.
 */
export const NEGATIVE_BASE = `text, words, letters, typography, watermark, logo, signature, stock photo overlay, low quality, blurry, jpeg artifacts, oversharpen, oversaturated, neon colors, plastic look, doll-like skin, uncanny faces, deformed hands, extra fingers, melted features, cartoon, anime, illustration, 3d render, cgi, painting, drawing, sketch.`;

/**
 * Negative específico para fotografia editorial (cover, OG, internal).
 */
export const NEGATIVE_EDITORIAL = `clipart, infographic, diagram, chart, generic stock photography aesthetic, cliche business meeting, corporate handshake, smiling at camera, fake-looking studio lighting, ringlight reflection, beauty filter.`;

/**
 * Negative específico para social/thumbnail (foco em escaneabilidade
 * em tamanho pequeno).
 */
export const NEGATIVE_SOCIAL = `cluttered composition, multiple competing subjects, busy background, low contrast, dark muddy areas, text overlay, click-bait visual, exaggerated facial expression.`;

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
