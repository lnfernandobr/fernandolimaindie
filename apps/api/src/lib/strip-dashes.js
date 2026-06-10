// Remove travessões (— – ‒ ―) de textos gerados por IA — rede de segurança para
// quando o modelo ignora a regra do prompt. Reescreve com vírgula/hífen sem
// quebrar a frase; nunca toca em hífens de palavras compostas ("guarda-roupa").
const DASH = '[\\u2012\\u2013\\u2014\\u2015]';

export const stripDashes = (value) => {
  if (typeof value !== 'string' || !value) return value;
  return (
    value
      // faixa numérica ("10–15") vira hífen simples
      .replace(new RegExp(`(\\d)\\s*${DASH}\\s*(\\d)`, 'g'), '$1-$2')
      // travessão de diálogo/abertura de linha some
      .replace(new RegExp(`(^|\\n)[^\\S\\n]*${DASH}+[^\\S\\n]*`, 'g'), '$1')
      // travessão no fim da linha vira vírgula, preservando a quebra
      .replace(new RegExp(`[^\\S\\n]*${DASH}+[^\\S\\n]*\\n`, 'g'), ',\n')
      // travessão no meio da frase vira vírgula
      .replace(new RegExp(`[^\\S\\n]*${DASH}+[^\\S\\n]*`, 'g'), ', ')
      // limpa artefatos: vírgula inserida colada em outra pontuação
      .replace(/([,:;.!?¿¡])\s*,\s*/g, '$1 ')
      .replace(/,\s*([,.;:!?])/g, '$1')
      .replace(/ {2,}/g, ' ')
  );
};

// Aplica stripDashes apenas nos campos string indicados, sem mutar o original.
export const stripDashesIn = (obj, fields) => {
  if (!obj || typeof obj !== 'object') return obj;
  const out = { ...obj };
  for (const field of fields) {
    if (typeof out[field] === 'string') out[field] = stripDashes(out[field]);
  }
  return out;
};
