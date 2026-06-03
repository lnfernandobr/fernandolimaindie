import { INSTAGRAM_DEFAULTS } from '../../constants/instagram.js';

const ROLE_TEXT_PLACEMENT = {
  hook: 'upper third, hugging a clean band of negative space; typography is the dominant focal point',
  body: 'centered within a generous safe zone, mid-size, integrated with the composition; never covers the main subject',
  cta: 'lower third, hugging a clean band of negative space; typography is the dominant focal point',
};

const ROLE_TEXT_LIMITS = {
  hook: { maxChars: 60, hint: 'a thumb-stopping headline that promises payoff' },
  body: { maxChars: 140, hint: 'one tight idea that delivers value, no fluff' },
  cta: { maxChars: 70, hint: 'a direct call to action (save, share, comment, follow)' },
};

const list = (parts) => parts.filter(Boolean).join('\n');

const channelContext = (channel) =>
  list([
    `Channel handle: @${channel.handle}`,
    channel.displayName ? `Channel name: ${channel.displayName}` : null,
    channel.niche ? `Niche: ${channel.niche}` : null,
    channel.brief ? `Channel brief: ${channel.brief}` : null,
    channel.tone ? `Tone of voice: ${channel.tone}` : null,
    channel.captionStyle ? `Caption style guide: ${channel.captionStyle}` : null,
  ]);

const slideRoles = () =>
  list([
    'Slide roles:',
    `- "hook" (slide 1): ${ROLE_TEXT_LIMITS.hook.hint}. Max ${ROLE_TEXT_LIMITS.hook.maxChars} chars.`,
    `- "body" (middle slides): ${ROLE_TEXT_LIMITS.body.hint}. Max ${ROLE_TEXT_LIMITS.body.maxChars} chars.`,
    `- "cta" (last slide): ${ROLE_TEXT_LIMITS.cta.hint}. Max ${ROLE_TEXT_LIMITS.cta.maxChars} chars.`,
  ]);

const carouselPlanSystem = (channel) =>
  list([
    'You are THREE experts working as one on a single Instagram carousel:',
    '1. A senior creative director who designs scroll-stopping editorial visual systems.',
    '2. A director of photography who briefs cinematic, signature imagery (never stock, never generic).',
    '3. A viral growth strategist who reverse-engineers what gets saved, shared, and ranked on Instagram in 2026.',
    '',
    'You produce structured plans that will be consumed by an image model. Every visual decision must be specific enough to repeat across slides — never abstract.',
    '',
    'Respond with STRICT valid JSON only. No markdown, no code fences, no prose.',
    '',
    channelContext(channel),
  ]);

const carouselPlanUser = ({ topic, brief, slidesCount }) =>
  list([
    `Design ONE Instagram carousel with EXACTLY ${slidesCount} slides for the topic below.`,
    '',
    `Topic: ${topic}`,
    brief ? `Topic brief: ${brief}` : null,
    '',
    'Think silently in this order before producing the JSON:',
    '  a) What single insight or transformation does this carousel deliver?',
    '  b) Who exactly (within the channel niche) needs this NOW, and what emotional state are they in?',
    '  c) Which visual world (palette, lighting, atmosphere, material, subject matter) will stop them in the feed?',
    '  d) Which hook copy converts that visual into a save?',
    '  e) How do middle slides deliver value with zero filler?',
    '  f) Which CTA matches their state without feeling salesy?',
    '  g) Which hashtags actually drive reach AND ranking for this exact topic — split across tiers.',
    '',
    'Return a JSON object with this EXACT shape:',
    '{',
    '  "title": string,                        // short internal title for the admin (max 100 chars, pt-BR)',
    '  "designConcept": string,                // 2-4 sentence rationale in pt-BR. MUST name a specific visual direction (ex: "documental analogico em 35mm inspirado em editoriais da Apartamento Magazine"). Words like "limpo", "elegante", "moderno", "minimalista" used alone are FORBIDDEN.',
    '  "visualAnchors": {                      // ENGLISH, used DIRECTLY by the image model on every slide. Be specific. Same anchors apply to ALL slides for coherence.',
    '    "medium": string,                     // ex: "documentary photograph on 35mm Kodak Portra 400" / "matte gouache illustration on toned paper" / "still life painted in oil with palette knife". One specific medium, never a list.',
    '    "palette": string,                    // 3-4 specific colors with mood. ex: "muted sage #8FA68C, warm sand #C9B8A2, ink black #1A1A1A, ivory paper #F2EDE6 — restrained, dusty, melancholic".',
    '    "lighting": string,                   // ex: "soft window light coming from camera left, deep shadow fall-off on the right, slight haze in the air, golden hour quality".',
    '    "lensOrTechnique": string,            // ex: "50mm prime at f/2, shallow depth of field, gentle bokeh, slight halation on highlights" OR "wet-on-wet watercolor with visible paper grain".',
    '    "composition": string,                // ex: "rule of thirds, subject offset to the right, generous negative space upper-left to host typography".',
    '    "texture": string,                    // ex: "fine 400-iso film grain, faint dust specks, paper weight visible" OR "matte gouache pigment, micro brush texture".',
    '    "reference": string                   // ONE explicit reference: a photographer, magazine, film, or art movement. ex: "Saul Leiter color street photography" / "the matte stillness of Tarkovsky\'s Stalker" / "Apartamento Magazine domestic editorials".',
    '  },',
    '  "slides": [',
    '    {',
    '      "role": "hook" | "body" | "cta",',
    '      "text": string,                     // SHORT copy that will be RENDERED INSIDE the image (literal). No hashtags, no emojis, no URLs.',
    '      "imageSubject": string,             // ENGLISH. The single primary subject of this slide, expressed as a concrete noun phrase. ex: "a chipped enamel mug resting on a worn linen napkin". No abstractions.',
    '      "imageScene": string                // ENGLISH. The environment, time of day, mood and any secondary element. ONE coherent moment, not a list. NEVER mention text, letters, words, captions, signs, books, screens, or typography.',
    '    }',
    '  ],',
    '  "caption": string,                      // full Instagram caption in pt-BR, up to 2000 chars, line breaks allowed, hook line first',
    '  "hashtags": {',
    '    "high": string[],                     // 3-5 broad-reach hashtags. Posts in the millions. Strong topical relevance.',
    '    "medium": string[],                   // 4-6 niche hashtags. Posts in the hundreds of thousands. Best balance of reach and competition.',
    '    "low": string[]                       // 3-5 long-tail / community hashtags. Posts in the tens of thousands. Highest ranking probability.',
    '  }',
    '}',
    '',
    slideRoles(),
    '',
    'Hard rules:',
    '- The first slide MUST have role "hook". The last slide MUST have role "cta". All others "body".',
    '- All slides SHARE the same visualAnchors and the same world — coherence is mandatory.',
    '- Each slide must show a DIFFERENT concrete subject and environment, but coherent within the visualAnchors.',
    '- imageSubject and imageScene are English and must NEVER reference any written language (no text, letters, words, captions, signs, books, screens, typography).',
    '- visualAnchors fields must be specific: never write "warm", "dark", "modern", "clean", "minimalist", "editorial illustration", "premium aesthetic" by themselves.',
    '- Forbidden visual modes anywhere: plastic 3D render, generic AI illustration, stock photography, inspirational poster, AI face symmetry, glitch artifacts, Pinterest devotional cliché.',
    '- Caption is in Brazilian Portuguese and respects the channel tone.',
    '- Every hashtag starts with "#", lowercase, no spaces, no accents.',
    '- Hashtags MUST be distinct across tiers (no duplicates). Each tier has at least 3 hashtags. Hashtags must be topically tied to the EXACT topic.',
    '',
    'Return the JSON object only.',
  ]);

const anchorsBlock = (anchors) => {
  if (!anchors) return INSTAGRAM_DEFAULTS.FALLBACK_VISUAL_STYLE;
  return list([
    `Medium: ${anchors.medium}.`,
    `Palette: ${anchors.palette}.`,
    `Lighting: ${anchors.lighting}.`,
    `Lens / technique: ${anchors.lensOrTechnique}.`,
    `Composition principle: ${anchors.composition}.`,
    `Texture: ${anchors.texture}.`,
    `Reference: ${anchors.reference}.`,
  ]);
};

const slideImagePrompt = ({ visualAnchors, slide, slideNumber, totalSlides, channelHandle }) => {
  const placement = ROLE_TEXT_PLACEMENT[slide.role] || ROLE_TEXT_PLACEMENT.body;
  const anchors = anchorsBlock(visualAnchors);

  return list([
    `# Objective`,
    `Produce slide ${slideNumber} of ${totalSlides} of an Instagram carousel${channelHandle ? ` for @${channelHandle}` : ''}.`,
    '',
    `# Deliverable`,
    'A single square 1:1 still image, 1024x1024, publish-ready. No multi-panel layout, no border, no frame, no mockup.',
    '',
    `# Scene`,
    slide.imageScene || 'an intentional, calm environment that supports the subject',
    '',
    `# Subject`,
    slide.imageSubject || 'a single, clearly defined primary subject',
    '',
    `# Style (must match across every slide of this carousel)`,
    anchors,
    '',
    `# Composition`,
    `- One primary subject + generous negative space — strict visual hierarchy.`,
    `- Text placement: ${placement}.`,
    `- Subject and typography never compete for the same area.`,
    `- Safe margin of at least 8% on every edge; never crop letters or the subject.`,
    `- Square 1:1 framing.`,
    '',
    `# Text`,
    'Render LITERALLY the text between the triple quotes, perfectly spelled, with no additional words, captions, labels or alternative spellings:',
    '"""',
    slide.text,
    '"""',
    'Typography: bold modern sans-serif (Inter, Söhne, Neue Haas Grotesk vibe), tight tracking, very high contrast against its local background. No decorative serifs, no script fonts, no hand-drawn lettering, no shadow, no outline, no gradient on the type.',
    '',
    `# Restrictions (must be ABSENT from the final image)`,
    '- watermarks, logos, signatures, URLs, page numbers',
    '- Instagram UI mockups, phone frames, app screenshots',
    '- emojis, hashtags, additional sentences other than the one between triple quotes above',
    '- distorted hands, mangled faces, extra fingers, gibberish letters',
    '- plastic 3D render look, generic AI illustration look, symmetric AI face',
    '- stock-photo cliché poses (arms raised at sunset, silhouette on mountaintop, smiling at camera, hands forming a heart)',
    '- inspirational poster aesthetic, generic Pinterest devotional style, motivational-quote-graphic vibe',
    '- oversaturation, HDR halos, plastic skin, soap-opera lighting',
  ]);
};

export const prompts = {
  carouselPlan: ({ channel, topic, brief, slidesCount }) => ({
    system: carouselPlanSystem(channel),
    user: carouselPlanUser({ topic, brief, slidesCount }),
  }),
  slideImage: slideImagePrompt,
};
