const ROLE_TEXT_PLACEMENT = {
  hook: 'top-center, oversized, dominant focal point',
  body: 'centered, large, the main reading element',
  cta: 'bottom-center, oversized, dominant focal point',
};

const ROLE_TEXT_LIMITS = {
  hook: { maxChars: 60, hint: 'a thumb-stopping headline' },
  body: { maxChars: 140, hint: 'one tight idea, no fluff' },
  cta: { maxChars: 70, hint: 'a direct call to action' },
};

const list = (parts) => parts.filter(Boolean).join('\n');

const channelContextBlock = (channel) =>
  list([
    `Channel handle: @${channel.handle}`,
    channel.displayName ? `Channel name: ${channel.displayName}` : null,
    channel.niche ? `Niche: ${channel.niche}` : null,
    channel.brief ? `Channel brief: ${channel.brief}` : null,
    channel.tone ? `Tone of voice: ${channel.tone}` : null,
    channel.captionStyle ? `Caption style guide: ${channel.captionStyle}` : null,
    channel.imagePrompt ? `Default visual style: ${channel.imagePrompt}` : null,
  ]);

const slideRolesBlock = () =>
  list([
    'Slide roles and constraints:',
    `- "hook" (slide 1): ${ROLE_TEXT_LIMITS.hook.hint}. Max ${ROLE_TEXT_LIMITS.hook.maxChars} characters.`,
    `- "body" (middle slides): ${ROLE_TEXT_LIMITS.body.hint}. Max ${ROLE_TEXT_LIMITS.body.maxChars} characters.`,
    `- "cta" (last slide): ${ROLE_TEXT_LIMITS.cta.hint}. Max ${ROLE_TEXT_LIMITS.cta.maxChars} characters.`,
  ]);

const carouselPlanSystem = ({ channel }) =>
  list([
    'You are a senior Instagram creative director.',
    'You design carousel posts where every slide is ONE AI-generated square image that already includes short, bold typography rendered directly inside the image.',
    'Your job is to produce a structured plan that downstream tools will use to render each image and publish the post.',
    'Respond with STRICT valid JSON only — no markdown, no prose, no code fences.',
    '',
    channelContextBlock(channel),
  ]);

const carouselPlanUser = ({ topic, brief, slidesCount, channel }) =>
  list([
    `Plan exactly ONE Instagram carousel with EXACTLY ${slidesCount} slides for the topic below.`,
    '',
    `Topic: ${topic}`,
    brief ? `Topic brief: ${brief}` : null,
    '',
    'Return a JSON object with this exact shape:',
    '{',
    '  "title": string,                       // short internal title used by the admin',
    '  "slides": [',
    '    {',
    '      "role": "hook" | "body" | "cta",',
    '      "text": string,                    // the SHORT text that will be RENDERED INSIDE the image',
    '      "imageScene": string               // visual description in ENGLISH of the scene/composition/mood. NEVER mention text, letters, words, typography, captions or signage.',
    '    }',
    '  ],',
    '  "caption": string,                     // full Instagram caption in Brazilian Portuguese (pt-BR). Up to 2000 chars. Line breaks allowed.',
    '  "hashtags": string[]                   // 8 to 15 relevant hashtags, each starting with "#"',
    '}',
    '',
    slideRolesBlock(),
    '',
    'Hard rules:',
    '- The first slide MUST have role "hook".',
    '- The last slide MUST have role "cta".',
    '- All other slides MUST have role "body".',
    '- Each "text" field must be self-contained and readable on its own slide.',
    '- "text" must NOT contain hashtags, emojis, or URLs.',
    '- "imageScene" must be written in English and must NEVER reference text, letters, words, signs, typography, books, screens, captions or anything that implies written language.',
    '- Caption must be in Brazilian Portuguese and respect the channel tone/style.',
    `- Hashtag pool you may reuse and extend: ${(channel.hashtagsPool || []).join(' ') || '(none provided)'}`,
    '',
    'Return the JSON object only. No commentary.',
  ]);

const slideImagePrompt = ({ channel, slide, slideNumber, totalSlides }) => {
  const placement = ROLE_TEXT_PLACEMENT[slide.role] || ROLE_TEXT_PLACEMENT.body;
  const baseStyle = channel.imagePrompt || 'editorial illustration, clean composition, premium aesthetic';
  return list([
    `Square 1:1 Instagram carousel slide ${slideNumber} of ${totalSlides} for the channel @${channel.handle}.`,
    `Base visual style: ${baseStyle}.`,
    `Scene to depict: ${slide.imageScene}.`,
    '',
    'Render the following text DIRECTLY INSIDE the image as crisp, large, perfectly spelled typography:',
    `"""`,
    slide.text,
    `"""`,
    `Text placement: ${placement}.`,
    'Typography: bold modern sans-serif, generous tracking, very high contrast against the background, no decorative serifs, no script fonts.',
    `Color palette — background: ${channel.brandBg}; primary text color: ${channel.brandFg}; accent color: ${channel.brandAccent}.`,
    'Composition rules: keep a safe margin of at least 8% on every edge; text is the dominant focal point; never crop letters.',
    'Forbidden in the image: watermarks, logos, URLs, page numbers, instagram UI mockup, phone frames, hashtags, emojis, extra captions, additional sentences other than the one above.',
    'Output: a single still photograph or illustration, square 1024x1024, ready to publish.',
  ]);
};

export const prompts = {
  carouselPlan: ({ channel, topic, brief, slidesCount }) => ({
    system: carouselPlanSystem({ channel }),
    user: carouselPlanUser({ topic, brief, slidesCount, channel }),
  }),
  slideImage: slideImagePrompt,
};
