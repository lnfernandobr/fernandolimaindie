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

// ── Regras de copy pt-BR (vale pra TODO texto gerado) ───────────────────────
const PTBR_COPY_RULES = list([
  'Brazilian Portuguese copy rules (apply to EVERY pt-BR field: titles, slide text, caption, narration, onScreenText):',
  '- ABSOLUTELY NO em dash or en dash ("—", "–") anywhere, and never a hyphen spliced between clauses as a fake dash. Rewrite with a comma, a period or a colon.',
  '- No robotic AI crutches: "não se trata apenas de", "no final das contas", "a verdade é que", "lembre-se de que", "mais do que nunca", "em um mundo cada vez mais".',
  '- No suspense ellipsis ("...") as a styling device.',
]);

// ── Técnicas de hook (primeiros segundos / primeiro olhar) ───────────────────
const HOOK_TECHNIQUES = list([
  'HOOK CRAFT — the first 1-2 seconds (video) or the first glance (post) decide everything. Pick the ONE technique that genuinely fits the topic, never a generic opener:',
  '- Curiosity gap: open a specific question the viewer NEEDS answered ("Por que essa oração quase ninguém termina?"). The payoff must actually arrive later.',
  '- Bold claim / pattern interrupt: a confident, slightly counterintuitive statement that challenges what the viewer assumes ("Você não precisa sentir fé pra rezar").',
  '- Direct call-out: name the exact person and moment ("Se você rezou e nada mudou, isso é pra você").',
  '- Stakes up front: show what the viewer loses or gains in concrete terms, not vague promise.',
  '- In-progress scene: start in the middle of a concrete moment, never with context-setting.',
  'FORBIDDEN openers: greetings ("oi", "olá", "bom dia"), throat-clearing ("hoje vamos falar sobre", "você sabia que" as a reflex, "neste vídeo"), restating the title, any line that could open ANY other piece on the channel.',
]);

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

// ── Camada de direção de arte ────────────────────────────────────────────────
// Biblioteca de linguagens visuais distintas. A IA escolhe UMA família por peça
// (coerência interna) e DEVE variar entre peças — o objetivo é matar o feed
// monótono escuro/dessaturado. Luz e cor são decisões a serviço da emoção, nunca
// um reflexo. Tom escuro/P&B é uma ferramenta para poucas emoções, não o default.
const VISUAL_LANGUAGE_LIBRARY = list([
  'VISUAL LANGUAGE LIBRARY — choose ONE family per piece and commit to it fully (coherence inside the piece, real variety across pieces). These are starting points, not a cage; bend them to the emotion:',
  '1. Bright airy natural light — luminous daylight, soft open shadows, white + pastel + one fresh accent. Reads as hope, lightness, a fresh start.',
  '2. Warm golden-hour cinema — amber backlight, gentle sun flare, long shadows, honey/terracotta tones. Reads as gratitude, homecoming, warmth.',
  '3. Saturated editorial color — bold color blocking, colored shadows, confident hues (Saul Leiter / Alex Webb / Joel Meyerowitz). Reads as aliveness, modern, scroll-stopping.',
  '4. Painterly still life — oil/gouache/acrylic of a few symbolic objects, tactile brushwork, a warm or fresh palette (NOT muted Morandi-grey). Reads as craft, intimacy, the sacred inside the ordinary.',
  '5. Fine-art illustration — gouache / watercolor / colored-pencil on toned paper, emotional line art, the human hand visible. Reads as gentle, humble, artisanal.',
  '6. Sunlit documentary — real people, real hands, real places in generous natural light, candid and unstaged. Reads as authentic, human, relatable (very strong for faith/community).',
  '7. Organic tactile materials — clay, ochre, moss, terracotta, linen, paper, stone; matte natural color and macro texture. Reads as calm, grounded, current for 2026.',
  '8. Intentional chiaroscuro / nocturne — candlelight, a single warm source, deep shadow, OR true night. RESERVED for grief, fear, night, repentance or intimacy. Use it with purpose — never as a default mood.',
]);

const artDirectionThinking = () =>
  list([
    'Work as a real art director, not on autopilot:',
    '  • Name, in one breath, the dominant EMOTION and the PROMISE of this piece.',
    '  • DELIBERATELY pick one visual language from the library that AMPLIFIES that emotion. Most themes here — hope, faith, gratitude, restart, peace, love, encouragement — call for LIGHT and COLOR. Darkness, sepia and monochrome are a precise tool for a few emotions (grief, night, fear, repentance), NOT your reflex. Never desaturate or darken out of habit.',
    '  • Give THIS piece its own identity. Assume the previous posts exist and do NOT repeat the same muted/dark documentary look — variety across the feed is part of the job.',
    '  • Picture the first slide as a thumbnail competing in a fast feed: strong focal subject, high contrast, instantly readable. That single frame must stop the thumb.',
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
    '1. A senior art director who has mastered MANY visual languages and refuses the tired dark/desaturated default — every piece gets a light, palette and medium chosen on purpose.',
    '2. A director of photography / illustrator who briefs cinematic, signature imagery (never stock, never generic AI sludge).',
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
    slidesCount === 1
      ? `Design ONE standalone single-image Instagram post (EXACTLY 1 slide) for the topic below. Make this single image carry the whole message — a strong visual with its own hook.`
      : `Design ONE Instagram carousel with EXACTLY ${slidesCount} slides for the topic below.`,
    '',
    `Topic: ${topic}`,
    brief ? `Topic brief: ${brief}` : null,
    '',
    VISUAL_LANGUAGE_LIBRARY,
    '',
    HOOK_TECHNIQUES,
    '',
    'Think silently in this order before producing the JSON:',
    '  a) What single insight or transformation does this carousel deliver?',
    '  b) Who exactly (within the channel niche) needs this NOW, and what emotional state are they in?',
    artDirectionThinking(),
    '  c) Which hook technique fits this topic, and which hook copy makes scrolling past feel like a loss?',
    '  d) How do middle slides deliver value with zero filler, each one earning the swipe to the next?',
    '  e) Which CTA matches their state without feeling salesy — and which SPECIFIC comment prompt would this exact reader actually answer?',
    '  f) Which hashtags actually drive reach AND ranking for this exact topic — split across tiers.',
    '',
    'Return a JSON object with this EXACT shape:',
    '{',
    '  "title": string,                        // short internal title for the admin (max 100 chars, pt-BR)',
    '  "youtubeTitle": string,                 // pt-BR title optimized for YouTube / Shorts: curiosity-driven and searchable, <= 70 chars. No clickbait lies, no emojis, no hashtags.',
    '  "designConcept": string,                // 2-4 sentence rationale in pt-BR. MUST name the chosen visual language, its light and palette, and WHY they serve THIS emotion (ex: "luz natural clara e arejada, paleta de brancos e verde-sálvia, para traduzir recomeço e leveza"). Generic words like "limpo", "elegante", "moderno", "minimalista", "escuro", "melancólico" used alone are FORBIDDEN.',
    '  "visualAnchors": {                      // ENGLISH, used DIRECTLY by the image model on every slide. Be specific. Same anchors apply to ALL slides for coherence.',
    '    "medium": string,                     // ex: "documentary photograph on 35mm Kodak Portra 400" / "matte gouache illustration on toned paper" / "still life painted in oil with a palette knife". One specific medium, never a list.',
    '    "palette": string,                    // 3-4 specific colors WITH mood, chosen to fit the emotion. ex: "fresh white #F7F5F0, sage green #9CB3A0, warm clay #C58A6A, soft gold #E7C66B — bright, hopeful, alive". Do NOT default to grey/sepia/muted unless the emotion truly demands it.',
    '    "lighting": string,                   // ex: "bright soft daylight wrapping the subject, open shadows, airy" OR "warm golden-hour backlight with gentle flare". Match the light to the real emotion.',
    '    "lensOrTechnique": string,            // ex: "50mm prime at f/2, shallow depth of field, gentle bokeh" OR "wet-on-wet watercolor with visible paper grain".',
    '    "composition": string,                // ex: "rule of thirds, subject offset to the right, generous negative space upper-left to host typography".',
    '    "texture": string,                    // ex: "fine 200-iso film grain, real surface detail" OR "matte gouache pigment, micro brush texture".',
    '    "reference": string                   // ONE explicit reference: a photographer, illustrator, magazine, film, or art movement. ex: "Joel Meyerowitz color light" / "Apartamento Magazine domestic editorials" / "Mary Blair gouache color".',
    '  },',
    '  "slides": [',
    '    {',
    '      "role": "hook" | "body" | "cta",',
    '      "text": string,                     // SHORT copy that will be RENDERED INSIDE the image (literal). No hashtags, no emojis, no URLs.',
    '      "imageSubject": string,             // ENGLISH. The single primary subject of this slide, as a concrete noun phrase. ex: "a chipped enamel mug resting on a sunlit linen napkin". No abstractions.',
    '      "imageScene": string                // ENGLISH. The environment, time of day, mood and any secondary element. ONE coherent moment, not a list. NEVER mention text, letters, words, captions, signs, books, screens, or typography.',
    '    }',
    '  ],',
    '  "caption": string,                      // full Instagram caption in pt-BR, up to 2000 chars, line breaks allowed. FIRST LINE is a hook on its own (max 125 chars, it is all the feed shows before "mais"). LAST LINE is ONE specific engagement prompt: a question the reader answers in the comments, a word to comment, or an invite to save/share/follow — pick what fits the emotional state, never stack more than one.',
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
    slidesCount === 1
      ? '- EXACTLY 1 slide with role "hook": a complete, self-contained thought with its own visual hook. Put the call-to-action in the caption, NOT on the image.'
      : '- The first slide MUST have role "hook". The last slide MUST have role "cta". All others "body".',
    '- All slides SHARE the same visualAnchors and the same world — coherence is mandatory.',
    '- Each slide must show a DIFFERENT concrete subject and environment, but coherent within the visualAnchors.',
    '- imageSubject and imageScene are English and must NEVER reference any written language (no text, letters, words, captions, signs, books, screens, typography).',
    '- visualAnchors fields must be specific: never write "warm", "dark", "modern", "clean", "minimalist", "editorial illustration", "premium aesthetic" by themselves.',
    '- FORBIDDEN as a default mood: dark, desaturated, sepia, grey, monochrome or "melancholic documentary" applied to a theme that is actually hopeful. Choose darkness ONLY when the emotion is genuinely grief, night, fear or repentance — otherwise commit to light and color.',
    '- Forbidden visual modes anywhere: plastic 3D render, soulless generic-AI clip-art, stock photography, inspirational poster, AI face symmetry, glitch artifacts, Pinterest devotional cliché.',
    '- Caption is in Brazilian Portuguese and respects the channel tone.',
    '- The slide 1 hook MUST use one of the hook techniques above. If it could open any other post on the channel, rewrite it.',
    PTBR_COPY_RULES,
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
    'Honor the chosen medium, palette and lighting EXACTLY. Do NOT default to dark, desaturated, sepia or monochrome unless the palette literally specifies it — render the colors and brightness as briefed.',
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
    'Typography: a bold, highly legible typeface with very high contrast against its local background, in a weight coherent with the chosen visual language (default to a clean modern grotesk sans-serif — Inter, Söhne, Neue Haas Grotesk vibe). Tight, intentional tracking. No cheesy script, no hand-drawn lettering, no drop shadow, no outline, no gradient on the type.',
    '',
    `# Restrictions (must be ABSENT from the final image)`,
    '- watermarks, logos, signatures, URLs, page numbers',
    '- Instagram UI mockups, phone frames, app screenshots',
    '- emojis, hashtags, additional sentences other than the one between triple quotes above',
    '- distorted hands, mangled faces, extra fingers, gibberish letters',
    '- cheap/generic AI look: plastic 3D render, soulless vector clip-art, airbrushed CGI skin, symmetric AI face',
    '- stock-photo cliché poses (arms raised at sunset, silhouette on mountaintop, smiling at camera, hands forming a heart)',
    '- inspirational poster aesthetic, generic Pinterest devotional style, motivational-quote-graphic vibe',
    '- oversaturation blow-out, HDR halos, plastic skin, soap-opera lighting',
  ]);
};

// ── Vídeo (roteiro por IA) ───────────────────────────────────────────────

const videoScriptSystem = (channel) =>
  list([
    'You are THREE experts working as one on ONE faceless narrated video:',
    '1. A viral short-form scriptwriter who hooks in the first 2 seconds and never lets go — no greetings, no warm-up, the first sentence IS the hook.',
    '2. An art director / director of photography who has mastered MANY visual languages and refuses the tired dark/desaturated default — light, palette and medium are chosen on purpose.',
    '3. A retention strategist who paces narration so every line earns the next: open loops early, pay them off late, and convert attention into followers and comments at the end.',
    '',
    'The narration is read aloud by a TTS voice; the images are made by an image model.',
    'Respond with STRICT valid JSON only. No markdown, no code fences, no prose.',
    '',
    channelContext(channel),
  ]);

const videoScriptUser = ({ post, variant, sceneCount, targetSeconds }) => {
  const wordsPerScene = Math.round((targetSeconds / sceneCount) * 2.4);
  return list([
    `Write the script for ONE ${variant.aspect} faceless narrated video (${variant.label}).`,
    `Target length: about ${targetSeconds} seconds, split into EXACTLY ${sceneCount} scenes.`,
    '',
    'The Instagram post below is only the THEME. Do NOT just read it — expand it into a richer, self-contained video with a real arc (hook → development → payoff → soft CTA).',
    '',
    'Source post (theme):',
    `- Topic: ${post.topic}`,
    post.title ? `- Title: ${post.title}` : null,
    post.caption ? `- Caption: ${String(post.caption).slice(0, 1200)}` : null,
    post.designConcept ? `- Visual concept: ${post.designConcept}` : null,
    '',
    VISUAL_LANGUAGE_LIBRARY,
    '',
    HOOK_TECHNIQUES,
    '',
    artDirectionThinking(),
    '',
    'Retention architecture (how the script holds the viewer to the end):',
    '- Scene 1 narration: the FIRST sentence is the hook, using one of the techniques above. Within scene 1, also plant ONE open loop: tease the payoff that only lands in the second half ("e o detalhe que muda tudo vem no final" energy, said naturally, never that literal cliché).',
    '- Middle scenes: every line earns the next. Cut any sentence the viewer could skip without losing the thread. Escalate: each scene adds a NEW angle, never rephrases the previous one.',
    '- Second-to-last scene: close the open loop. The payoff must feel worth the wait.',
    '- Last scene: deliver the soft CTA. When it fits the emotional state, explicitly invite ONE action in natural pt-BR: comment a specific word or answer ("comenta amém se...", "me conta nos comentários..."), or follow/subscribe ("segue o canal pra...", "se inscreve pra..."). ONE action only, one short sentence, woven into the message — never a tacked-on announcer voice.',
    '',
    'Return a JSON object with this EXACT shape:',
    '{',
    '  "title": string,            // short internal title (pt-BR, max 100 chars)',
    '  "bgColor": string,          // ONE hex color from the palette, fallback background. ex: "#F2EDE6"',
    '  "musicMood": string,        // 2-4 EN keywords for the ideal background track. ex: "calm acoustic hopeful" / "tense cinematic" / "uplifting lofi chill"',
    '  "visualAnchors": {          // ENGLISH, applied to EVERY scene image for coherence',
    '    "medium": string, "palette": string, "lighting": string,',
    '    "lensOrTechnique": string, "composition": string, "texture": string, "reference": string',
    '  },',
    `  "scenes": [                 // EXACTLY ${sceneCount} scenes, in order`,
    '    {',
    `      "narration": string,    // pt-BR spoken line(s). Natural speech for TTS: no emojis, no markdown, no hashtags, no stage directions. ~${wordsPerScene} words.`,
    '      "imagePrompt": string,  // ENGLISH. One cinematic still: subject + environment + mood. NEVER mention text, letters, words, captions, signs, books, screens, UI, logos or typography.',
    '      "onScreenText": string  // pt-BR. A SHORT 2-5 word key phrase for this scene (caption fallback).',
    '    }',
    '  ]',
    '}',
    '',
    'Hard rules:',
    `- EXACTLY ${sceneCount} scenes. Scene 1 is a thumb-stopping hook; the last scene is a soft CTA with ONE invited action (comment / follow / subscribe) when it fits.`,
    '- Scene 1 narration starts mid-thought with the hook itself: no greetings, no "hoje vamos falar", no restating the title. The first 6 words must create an itch the viewer needs scratched.',
    '- Scene 1 onScreenText reinforces the hook (the curiosity gap or bold claim), not a topic label.',
    PTBR_COPY_RULES,
    '- All scenes share the same visualAnchors and one coherent visual world; each scene shows a DIFFERENT concrete subject/environment.',
    '- imagePrompt is English and must NEVER reference any written language (no text, letters, words, captions, signs, books, screens, typography, logos).',
    '- narration is Brazilian Portuguese, in the channel tone, flowing naturally when read aloud.',
    '- visualAnchors must be specific (never lone "warm", "clean", "modern", "minimalist", "premium").',
    '- FORBIDDEN as a default mood: dark, desaturated, sepia, grey or monochrome applied to a hopeful theme. Choose darkness ONLY for genuine grief, night, fear or repentance — otherwise commit to light and color.',
    '- Forbidden visual modes: plastic 3D render, soulless generic-AI clip-art, stock photography, inspirational poster, symmetric AI face, glitch.',
    '',
    'Return the JSON object only.',
  ]);
};

const sceneImagePrompt = ({ visualAnchors, scene, sceneNumber, totalScenes, aspect }) => {
  const anchors = anchorsBlock(visualAnchors);
  const vertical = aspect === 'vertical';
  return list([
    '# Objective',
    `Produce scene ${sceneNumber} of ${totalScenes} of a cinematic narrated video.`,
    '',
    '# Deliverable',
    `A single ${vertical ? 'vertical 9:16' : 'horizontal 16:9'} still image, publish-ready. NO text anywhere. No multi-panel, no border, no frame, no mockup.`,
    '',
    '# Scene',
    scene.imagePrompt || 'an intentional, cinematic moment',
    '',
    '# Style (must match across every scene of this video)',
    anchors,
    'Honor the chosen medium, palette and lighting EXACTLY. Do NOT default to dark, desaturated, sepia or monochrome unless the palette literally specifies it — render the colors and brightness as briefed.',
    '',
    '# Composition & framing (CRITICAL — the image will be cropped to fill the frame)',
    vertical
      ? '- Composed for a 9:16 vertical crop: keep the main subject CENTERED horizontally with comfortable margin. The left and right edges WILL be cropped — put nothing important near the side edges.'
      : '- Composed for a 16:9 horizontal crop: keep the main subject within the central safe area; top and bottom edges may be cropped.',
    '- Balanced, intentional framing: a clear medium shot — subject not too tight, with natural headroom and breathing room. Never cramped, never awkwardly cut at the edges.',
    '- One clear focal subject + cinematic depth; rule of thirds; strong visual hierarchy.',
    '- Keep the lower third calmer (room for a caption to sit later) — but put NO text in the image.',
    '',
    '# Restrictions (must be ABSENT from the final image)',
    '- ANY text, letters, words, captions, subtitles, signs, labels, numbers, typography, watermarks, logos, UI',
    '- phone frames, app screenshots, social media mockups',
    '- distorted hands, mangled faces, extra fingers, gibberish shapes',
    '- cheap/generic AI look: plastic 3D render, soulless vector clip-art, airbrushed CGI skin, symmetric AI face',
    '- stock-photo cliché poses, inspirational poster aesthetic, oversaturation blow-out, HDR halos, plastic skin',
  ]);
};

export const prompts = {
  carouselPlan: ({ channel, topic, brief, slidesCount }) => ({
    system: carouselPlanSystem(channel),
    user: carouselPlanUser({ topic, brief, slidesCount }),
  }),
  slideImage: slideImagePrompt,
  videoScript: ({ channel, post, variant, sceneCount, targetSeconds }) => ({
    system: videoScriptSystem(channel),
    user: videoScriptUser({ post, variant, sceneCount, targetSeconds }),
  }),
  sceneImage: sceneImagePrompt,
};
