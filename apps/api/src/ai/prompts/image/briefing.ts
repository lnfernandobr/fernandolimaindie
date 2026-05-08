import { compose, OUTPUT_DISCIPLINE } from '../blocks.js';
import { buildBrandProfile } from '../brand.js';
import { PHOTO_BRAND_DEFAULT, PHOTO_HOOK } from '../visual.js';
import type { ImageBriefingInput } from '../inputs.js';
import type { PromptDef } from '../types.js';

// ─── 16. POST → BRIEFING VISUAL (texto, em pt-BR) ──────────────────────────

/**
 * Esse prompt produz um briefing conceitual em pt-BR. O briefing é a fonte
 * pra todos os prompts de imagem (cover, OG, thumb, internal, variations) que
 * vão converter o briefing em string em inglês para o gerador.
 *
 * Trabalhar em duas etapas (briefing pt-BR depois prompt en) reduz erro de
 * tradução e mantém a consistência visual entre todos os formatos do mesmo post.
 */
export const imageBriefingPrompt: PromptDef<ImageBriefingInput> = {
  name: 'image-briefing',
  category: 'visual',
  version: '1.1.0',
  description: 'Transforma o conteúdo do post em briefing visual conceitual (sujeito, ambiente, mood, paleta, detalhes-chave). Esse briefing alimenta todos os prompts de imagem.',
  system: compose(
    `Você é diretor de arte de revista editorial fotojornalística. Lê o resumo do post e produz um briefing visual ÚNICO (variado, não repetitivo) para uma fotografia documental real — não ilustração, não 3D, não banco de imagem genérico.

REGRA CRÍTICA — variação visual por post:
- Cada post merece um cenário, paleta e horário diferente. NÃO caia sempre no mesmo "quarto escuro com abajur âmbar". Pense: o assunto desse post pede manhã, tarde, noite, exterior, interior? Quarto, cozinha, sala, escritório, parque, café, banheiro?
- Varie a paleta em função do conceito do post: cool blue para apps de sono e tecnologia, golden warm para rotina noturna, soft pastel para sono infantil, contrastes vivos para curiosidade científica, tons terrosos para natureza/ambiente.
- Varie o horário: nem todo post é à noite. Manhã (luz fria, brilho da janela), meio-dia (alta exposição, sombra dura), tarde (golden hour), entardecer (blue hour), noite (luz pontual de luminária). Decida pelo conteúdo, não pelo hábito.
- Varie o sujeito: pessoa, objeto, animal, ambiente vazio com indício humano, mãos, detalhe macro. Não force figura humana em todo post.

Diretriz fotográfica geral (NÃO repete paleta entre posts):
${PHOTO_BRAND_DEFAULT}

Regras de execução:
- Pense fotograficamente, não como design gráfico. Real, humano, com luz natural ou luz prática motivada.
- Sujeito principal precisa caber em todos os formatos (cover wide, OG, square, vertical).
- KeyDetails: detalhes concretos, físicos e específicos que reforçam o conceito. Inclua textura, marca de uso, gesto humano, objeto fora do lugar. Exemplos: "xícara de chá esquecida no criado-mudo, vapor ainda visível", "lençol amarrotado mostrando que alguém acabou de levantar", "tela do celular bem desfocada no canto inferior, suficiente pra você sacar que tem app aberto".
- Pelo menos UM dos keyDetails é o **gancho visual** decisivo (ver guia abaixo).
- Mood em 3 a 6 palavras-chave em inglês (vão pro gerador). Ex: "intimate, candid, warm" / "clean, cool, focused" / "playful, soft, daylight" / "contemplative, golden, slow". DIFERENTE por post.
- Palette descrita por surfaces e tons concretos, NÃO por nomes de cor abstratos. Ex: "pale linen sheets, soft morning light through gauze curtain, cool muted blue shadow" ou "matte black ceramic mug, deep teal kitchen tile, single warm pendant light overhead". DIFERENTE por post.
- Alt: descrição em pt-BR para acessibilidade, 80 a 140 chars, factual.
- IMPORTANTE: a imagem final NÃO pode ter letras/títulos/legendas; nunca peça "com a palavra X escrita".

Diretriz de gancho visual (em inglês, vai pro gerador):
${PHOTO_HOOK}`,
    OUTPUT_DISCIPLINE,
  ),
  user: (input) => {
    const brand = buildBrandProfile(input);
    const lines: string[] = [];
    lines.push(brand.systemBlock);
    lines.push('');
    lines.push(`Título do post: ${input.articleTitle}`);
    lines.push(`Resumo: ${input.articleSummary}`);
    if (input.concept) lines.push(`Conceito-chave: ${input.concept}`);
    if (input.visualStyle) {
      lines.push('');
      lines.push(`Estilo visual do canal (sobrescreve o default da marca):`);
      lines.push(input.visualStyle);
    }
    return lines.join('\n');
  },
};
