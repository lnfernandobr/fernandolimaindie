import { INSTAGRAM_DEFAULTS } from '../../constants/instagram.js';

const ROLE_TEXT_PLACEMENT = {
  hook: 'upper third of the canvas, oversized, the dominant focal point',
  body: 'centered, large and the main reading element',
  cta: 'lower third of the canvas, oversized, the dominant focal point',
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
    'You are TWO experts collaborating on a single Instagram carousel:',
    '1. A senior creative director who designs scroll-stopping visual systems.',
    '2. A viral growth strategist who reverse-engineers what gets saved, shared, and ranked.',
    '',
    'Your goal: maximize the probability of saves, shares, and discoverability for the specific topic provided.',
    'Every decision (design concept, copy, hashtag tiers) must be grounded in the channel context and the topic — never generic.',
    '',
    'You must respond with STRICT valid JSON only. No markdown, no code fences, no commentary.',
    '',
    channelContext(channel),
  ]);

const carouselPlanUser = ({ topic, brief, slidesCount }) =>
  list([
    `Design and write ONE Instagram carousel for the topic below with EXACTLY ${slidesCount} slides.`,
    '',
    `Topic: ${topic}`,
    brief ? `Topic brief: ${brief}` : null,
    '',
    'Think through this in order before producing the JSON:',
    '  a) What is the single insight or transformation this carousel must deliver?',
    '  b) Who specifically (inside the channel niche) needs this NOW, and what state are they in?',
    '  c) Which visual language will stop them in their feed — given the topic, NOT the channel brand colors?',
    '  d) Which hook copy converts that visual into a save?',
    '  e) How do middle slides deliver value with zero filler?',
    '  f) What CTA matches their state without feeling salesy?',
    '  g) Which hashtags actually drive reach AND ranking for this exact topic — split across tiers.',
    '',
    'Return a JSON object with this exact shape:',
    '{',
    '  "title": string,                        // short internal title for the admin (max 100 chars, pt-BR)',
    '  "designConcept": string,                // ~2-3 sentence rationale (pt-BR) explaining the visual + editorial choice for THIS topic',
    '  "visualStyle": string,                  // ENGLISH visual style brief — palette, mood, lighting, composition, typography vibe. Used directly to brief the image model.',
    '  "slides": [',
    '    {',
    '      "role": "hook" | "body" | "cta",',
    '      "text": string,                     // SHORT copy that will be RENDERED INSIDE the image',
    '      "imageScene": string                // ENGLISH scene description (composition, subject, mood, lighting). NEVER mention any text, letters, words, captions, signs or typography.',
    '    }',
    '  ],',
    '  "caption": string,                      // full Instagram caption in Brazilian Portuguese (pt-BR), up to 2000 chars, line breaks allowed, hook line first',
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
    '- Each "text" must be standalone — it must read as a complete idea on its own slide.',
    '- "text" must NOT contain hashtags, emojis or URLs.',
    '- "imageScene" must be in English and must NEVER reference text, letters, words, signs, books, screens, captions or anything that implies written language inside the image.',
    '- "visualStyle" must be in English and describe palette + mood + composition specific to THIS topic. It must NOT reuse any channel brand colors.',
    '- Caption must be in Brazilian Portuguese and respect the channel tone/style.',
    '- Every hashtag must start with "#", be lowercase, and contain no spaces or accents.',
    '- Hashtags MUST be distinct across tiers (no duplicates). Each tier must have at least 3 hashtags.',
    '- Hashtags must be topically tied to the EXACT topic — not generic niche fillers.',
    '',
    'Return the JSON object only.',
  ]);

const slideImagePrompt = ({ visualStyle, slide, slideNumber, totalSlides, channelHandle }) => {
  const placement = ROLE_TEXT_PLACEMENT[slide.role] || ROLE_TEXT_PLACEMENT.body;
  const style = visualStyle || INSTAGRAM_DEFAULTS.FALLBACK_VISUAL_STYLE;
  return list([
    `Square 1:1 Instagram carousel slide ${slideNumber} of ${totalSlides}${channelHandle ? ` for @${channelHandle}` : ''}.`,
    '',
    `Carousel visual direction (apply consistently across every slide): ${style}.`,
    `Scene to depict on this slide: ${slide.imageScene}.`,
    '',
    'Render the following text DIRECTLY INSIDE the image as crisp, large, perfectly spelled typography:',
    '"""',
    slide.text,
    '"""',
    `Text placement: ${placement}.`,
    'Typography: bold modern sans-serif, generous tracking, extremely high contrast against the background, no decorative serifs, no script fonts, no hand-drawn lettering.',
    'Color palette: derive it from the carousel visual direction above — do not invent arbitrary colors.',
    'Composition rules: safe margins of at least 8% on every edge; text is the dominant focal point; never crop letters; never overlap text with the main subject of the scene.',
    'Forbidden in the image: watermarks, logos, URLs, page numbers, instagram UI mockups, phone frames, hashtags, emojis, extra captions, additional sentences other than the one above.',
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
