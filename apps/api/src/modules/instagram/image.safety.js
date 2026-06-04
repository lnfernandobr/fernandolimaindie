// Reforço anexado ao prompt quando a moderação da OpenAI rejeita uma imagem
// (comum em temas religiosos/"guerreiro": espada, batalha, sangue, etc.).
export const IMAGE_SAFE_SUFFIX =
  '\n\n# SAFETY (mandatory)\n' +
  'The image MUST be entirely peaceful and symbolic. Absolutely NO weapons (swords, ' +
  'spears, guns, knives, shields used in combat), NO blood, NO gore, NO wounds, NO ' +
  'violence, NO combat, NO fighting, NO death, NO creatures being harmed or slain. Any ' +
  'theme of "warrior", "battle", "guardian", "spiritual warfare" or "strength" must be ' +
  'expressed ONLY through calm symbolism — soft dawn light, a serene figure, stillness, ' +
  'a quiet landscape, texture, or a single still-life object. Nothing graphic, gory or ' +
  'threatening. Reverent, gentle, contemplative.';

// Detecta o erro de moderação/safety da OpenAI (status 400 com mensagem de rejeição).
export const isImageSafetyError = (err) => {
  const status = err?.status ?? err?.response?.status;
  const msg = String(err?.message ?? '').toLowerCase();
  return (
    status === 400 &&
    /(safety|moderation|rejected|content[_\s-]?polic|content[_\s-]?management|not allowed)/.test(msg)
  );
};
