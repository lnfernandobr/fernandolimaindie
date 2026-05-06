/**
 * Helpers compartilhados entre skills.
 *
 * Skills estruturadas usam `provider.generateStructured(...)` — o Zod schema
 * vira JSON Schema (Anthropic tool / OpenAI Structured Output) e a saída
 * já chega tipada e validada. Não há mais parse manual de JSON.
 */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}
