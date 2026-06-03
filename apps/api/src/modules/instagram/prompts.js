import { INSTAGRAM_DEFAULTS } from '../../constants/instagram.js';

const ROLE_TEXT_PLACEMENT = {
  hook: 'upper third, hugging a clean band of negative space; the typography is the dominant focal point',
  body: 'centered within a generous safe zone, mid-size, integrated with the composition (never covering the main subject)',
  cta: 'lower third, hugging a clean band of negative space; the typography is the dominant focal point',
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
    '1. A senior creative director who designs scroll-stopping visual systems for premium editorial magazines.',
    '2. A director of photography who briefs cinematic, signature imagery (never stock, never generic).',
    '3. A viral growth strategist who reverse-engineers what gets saved, shared, and ranked on Instagram in 2026.',
    '',
    'Your goal: maximize saves, shares and discoverability for this specific topic. Every decision (design, copy, hashtags) must be specific — never generic, never AI-cliché.',
    '',
    'You must respond with STRICT valid JSON only. No markdown, no code fences, no prose.',
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
    'Reason silently in this order before producing the JSON:',
    '  a) What is the single insight or transformation this carousel must deliver?',
    '  b) Who exactly (within the channel niche) needs this NOW, and what emotional state are they in?',
    '  c) Which visual world will stop them in their feed — palette, lighting, atmosphere, subject matter?',
    '  d) Which hook copy converts that visual into a save?',
    '  e) How do middle slides deliver value with zero filler?',
    '  f) Which CTA matches their state without feeling salesy?',
    '  g) Which hashtags actually drive reach AND ranking for this exact topic — split across tiers.',
    '',
    'Return a JSON object with this exact shape:',
    '{',
    '  "title": string,                        // short internal title for the admin (max 100 chars, pt-BR)',
    '  "designConcept": string,                // 2-4 sentence rationale (pt-BR). MUST name a specific visual direction (ex: "rotogravura editorial em paleta dessaturada inspirada na revista Apartamento"). No vague words like "limpo", "elegante", "moderno" sozinhos.',
    '  "visualStyle": string,                  // ENGLISH visual brief used DIRECTLY by the image model. Must specify, in this order: medium (photograph / painted illustration / mixed), palette (3-4 specific colors with mood, never just "warm" or "dark"), lighting (direction, quality, contrast), camera/lens treatment (focal length, depth-of-field, film vs digital), composition principle (negative space, leading lines, rule-of-thirds), texture/grain, ONE explicit reference (a photographer, magazine, film, or art movement). Forbidden: the words "editorial illustration", "clean", "modern", "minimalist" used alone, "premium aesthetic", "instagram post". Forbidden: stock photo look, generic AI illustration look, plastic 3D render look.',
    '  "slides": [',
    '    {',
    '      "role": "hook" | "body" | "cta",',
    '      "text": string,                     // SHORT copy RENDERED inside the image',
    '      "imageScene": string                // ENGLISH scene brief: subject, action, environment, time of day, atmosphere. Must be ONE coherent moment, not a list. NEVER mention text, letters, words, captions, signs, books, screens, or typography.',
    '    }',
    '  ],',
    '  "caption": string,                      // full Instagram caption in pt-BR, up to 2000 chars, line breaks allowed, hook line first',
    '  "hashtags": {',
    '    "high": string[],                     // 3-5 broad-reach hashtags. Posts in the millions. Strong topical relevance is mandatory.',
    '    "medium": string[],                   // 4-6 niche hashtags. Posts in the hundreds of thousands. Best balance of reach and competition.',
    '    "low": string[]                       // 3-5 long-tail / community hashtags. Posts in the tens of thousands. Highest ranking probability.',
    '  }',
    '}',
    '',
    slideRoles(),
    '',
    'Hard rules:',
    '- The first slide MUST have role "hook". The last slide MUST have role "cta". All other slides MUST have role "body".',
    '- All slides in the carousel SHARE the same visualStyle and the same world — coherence is mandatory.',
    '- Each "imageScene" must be a different concrete moment (different subject, framing or environment) — but all coherent within the visualStyle.',
    '- "text" must be self-contained, no hashtags, no emojis, no URLs.',
    '- "imageScene" must be English and must NEVER reference text, letters, words, signs, books, screens, typography or anything that implies written language inside the image.',
    '- Caption is in Brazilian Portuguese and respects the channel tone.',
    '- Every hashtag starts with "#", lowercase, no spaces, no accents.',
    '- Hashtags MUST be distinct across tiers (no duplicates). Each tier has at least 3 hashtags.',
    '- Hashtags must be topically tied to the EXACT topic, not generic niche fillers.',
    '',
    'Return the JSON object only.',
  ]);

const slideImagePrompt = ({ visualStyle, slide, slideNumber, totalSlides, channelHandle }) => {
  const placement = ROLE_TEXT_PLACEMENT[slide.role] || ROLE_TEXT_PLACEMENT.body;
  const style = visualStyle || INSTAGRAM_DEFAULTS.FALLBACK_VISUAL_STYLE;
  return list([
    `Square 1:1 Instagram carousel slide ${slideNumber} of ${totalSlides}${channelHandle ? ` for @${channelHandle}` : ''}.`,
    '',
    'CARROUSEL VISUAL DIRECTION (apply consistently across every slide of this set):',
    style,
    '',
    'SCENE FOR THIS SLIDE:',
    slide.imageScene,
    '',
    'TYPOGRAPHY — render EXACTLY this short text directly inside the image, perfectly spelled, no extra words:',
    '"""',
    slide.text,
    '"""',
    `Text placement: ${placement}.`,
    'Typography style: bold modern sans-serif (Inter, Söhne, Neue Haas Grotesk vibe), tight tracking, very high contrast against its background, no decorative serifs, no script fonts, no hand-drawn lettering, no shadow, no outline, no gradient on the type.',
    'Type-image integration: the type sits inside negative space; never crops the main subject; subject and text do not fight for the same area.',
    '',
    'TECHNICAL CRAFT (must be visible in the final image):',
    '- Cinematic photography quality — real lens character, real depth of field, real lighting falloff. No flat AI illustration look. No plastic 3D render. No symmetrical AI face. No glitch artifacts.',
    '- Color grading consistent with the visual direction above; subtle film grain or paper texture if the direction implies it; no oversaturation; no HDR halos.',
    '- Composition follows a clear hierarchy: one primary subject, generous negative space, intentional framing.',
    '- Safe margins of at least 8% on every edge; never crop the type.',
    '',
    'STRICTLY FORBIDDEN in the final image:',
    'watermarks, logos, signatures, URLs, page numbers, instagram UI mockups, phone frames, hashtags, emojis, additional sentences other than the one above, distorted hands, mangled faces, extra fingers, gibberish letters, stock-photo cliché poses (arms raised at sunset, silhouette on mountaintop, smiling at camera), inspirational poster aesthetic, generic Pinterest devotional style.',
    '',
    'Output: a single still image, square 1024x1024, ready to publish.',
  ]);
};

export const prompts = {
  carouselPlan: ({ channel, topic, brief, slidesCount }) => ({
    system: carouselPlanSystem(channel),
    user: carouselPlanUser({ topic, brief, slidesCount }),
  }),
  slideImage: slideImagePrompt,
};
