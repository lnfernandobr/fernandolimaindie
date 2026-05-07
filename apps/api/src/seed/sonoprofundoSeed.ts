/**
 * Seed determinístico do canal `sonoprofundo`.
 *
 * - Sempre garante o canal `sonoprofundo` (criado se não existir).
 * - Em desenvolvimento, garante 1 post mockado completo (cover, FAQ, howToSteps,
 *   referências) — útil para validar o layout localmente sem rodar a pipeline IA.
 * - Em produção, cria o canal vazio se não existir e deixa a pipeline real
 *   popular os posts.
 *
 * O post é "upserted" por slug — editar este arquivo e reiniciar sobrescreve
 * o conteúdo do post mock no banco.
 */

import { Channel, type ChannelDoc } from '../models/Channel.js';
import { Author, type AuthorDoc } from '../models/Author.js';
import { Category, type CategoryDoc } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Post } from '../models/Post.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { countWords, readingTimeMinutes } from '../utils/readingTime.js';

const CHANNEL_SLUG = 'sonoprofundo';

interface FixedPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  tags: string[];
  categorySlug: string;
  categoryName: string;
  faq: { question: string; answer: string }[];
  howToSteps: { name: string; text: string }[];
  references: { title: string; url: string; publisher?: string }[];
  format: 'article' | 'how-to' | 'list' | 'review' | 'opinion';
  featured: boolean;
  publishedAtDaysAgo: number;
}

const FIXED_CATEGORIES = [
  { slug: 'higiene-do-sono', name: 'Higiene do Sono', color: '#e8b66a' },
  { slug: 'ciencia-do-sono', name: 'Ciência do Sono', color: '#5b7aa8' },
];

const FIXED_POSTS: FixedPost[] = [
  {
    slug: 'higiene-do-sono-em-7-habitos',
    title: 'Higiene do sono em 7 hábitos com base científica',
    excerpt:
      'Os 7 hábitos com maior evidência científica para melhorar a qualidade do sono — o que cada um faz, em quanto tempo aparece resultado e por onde começar.',
    metaTitle: 'Higiene do sono em 7 hábitos com base científica',
    metaDescription:
      'Os 7 hábitos com maior evidência para dormir melhor: horário fixo, luz, temperatura, cafeína, álcool, exercício e tela. Por onde começar.',
    keywords: ['higiene do sono', 'dormir melhor', 'insônia', 'ritmo circadiano'],
    tags: ['higiene-do-sono', 'iniciante', 'ciencia'],
    categorySlug: 'higiene-do-sono',
    categoryName: 'Higiene do Sono',
    format: 'how-to',
    featured: true,
    publishedAtDaysAgo: 1,
    faq: [
      {
        question: 'Em quanto tempo aparece resultado?',
        answer:
          'Em 1 a 3 semanas, segundo os estudos clínicos mais consistentes. Os primeiros sinais — dormir mais rápido, acordar menos vezes — costumam aparecer entre o 7º e o 10º dia. Mudanças estruturais no ritmo circadiano levam até 4 semanas.',
      },
      {
        question: 'Preciso aplicar todos os 7 ao mesmo tempo?',
        answer:
          'Não. A evidência mostra que aplicar 2 ou 3 hábitos com consistência rende mais que mudar tudo de uma vez e abandonar. Comece pelo horário fixo de acordar — é o que ancora os outros.',
      },
      {
        question: 'Funciona pra insônia clínica?',
        answer:
          'Higiene do sono sozinha não trata insônia crônica (DSM-5). Para insônia clínica, o tratamento de primeira linha é a TCC-I (terapia cognitivo-comportamental para insônia), que inclui higiene mas vai além. Procure um profissional.',
      },
    ],
    howToSteps: [
      { name: 'Horário fixo de acordar', text: 'Acorde no mesmo horário todos os dias, inclusive fim de semana. Variação máxima de 30 minutos. É o sinal mais forte para o ritmo circadiano.' },
      { name: 'Luz forte logo ao acordar', text: 'Exponha-se à luz natural ou luminoterapia (10.000 lux) por 10–20 minutos nos primeiros 60 minutos depois de acordar.' },
      { name: 'Temperatura entre 18 e 20 °C', text: 'O quarto precisa estar mais frio do que o resto da casa. A queda de temperatura corporal é parte do gatilho do sono.' },
      { name: 'Sem cafeína depois das 14h', text: 'Meia-vida da cafeína é de 5 a 6 horas. Café às 16h ainda tem 25% circulando à meia-noite.' },
      { name: 'Sem álcool 3 horas antes', text: 'Álcool acelera o início do sono mas fragmenta a segunda metade da noite, reduzindo o sono REM.' },
      { name: 'Exercício até 4h antes de dormir', text: '150 min/semana de aeróbico moderado melhoram a qualidade do sono. Evite treino intenso nas 4 horas finais do dia.' },
      { name: 'Sem tela na cama', text: 'Use modo escuro ou óculos âmbar a partir das 21h. O alvo não é o azul: é o brilho geral. Reduza para o mínimo legível.' },
    ],
    references: [
      { title: 'Sleep Hygiene Practices and Their Association with Insomnia', url: 'https://pubmed.ncbi.nlm.nih.gov/22119480/', publisher: 'Sleep Medicine Reviews' },
      { title: 'The Effects of Caffeine on Sleep', url: 'https://pubmed.ncbi.nlm.nih.gov/24235903/', publisher: 'Journal of Clinical Sleep Medicine' },
      { title: 'Light as a Modulator of Circadian Rhythms', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4031400/', publisher: 'NIH PMC' },
    ],
    content: `# Higiene do sono em 7 hábitos com base científica

> Conteúdo de demonstração: simula um post gerado pela camada de IA. O slug e o conteúdo são fixos em ambiente local. Em produção, a pipeline real popula posts.

A maioria dos guias de "higiene do sono" mistura prática com mito. Este aqui usa só o que tem evidência clínica consistente — meta-análises, ensaios randomizados — e descarta o resto.

## O que é higiene do sono

Higiene do sono é o conjunto de comportamentos diurnos e noturnos que **regulam o ritmo circadiano** (o relógio biológico interno) e **reduzem a ativação fisiológica** na hora de dormir. Não é cura para insônia clínica — é a base de qualquer protocolo, médico ou não.

## Os 7 hábitos, em ordem de impacto

### 1. Horário fixo de acordar

Esse é o que mais importa. O ritmo circadiano é puxado pelo horário em que você **acorda e recebe luz**, não pelo horário em que vai dormir. Acordar no mesmo horário todos os dias, inclusive fim de semana, com variação máxima de 30 minutos, ancora todo o resto.

### 2. Luz forte logo ao acordar

Nos primeiros 60 minutos depois de acordar, busque luz forte — natural se possível. Isso suprime melatonina residual e marca o início do dia para o relógio biológico. Em dias nublados ou se você acorda antes do sol, considere luminoterapia.

### 3. Temperatura entre 18 e 20 °C

O início do sono está atrelado à queda da temperatura corporal central. Um quarto a 18–20 °C facilita esse processo. Em climas quentes, considere ventilação cruzada, ventilador silencioso ou um banho morno 1 hora antes (paradoxalmente, o banho morno acelera a perda de calor depois).

### 4. Sem cafeína depois das 14h

A meia-vida da cafeína é de 5 a 6 horas em adultos saudáveis — pode ser muito mais em metabolizadores lentos. Um café às 16h ainda tem 25% circulando à meia-noite. Se você é sensível, corte às 12h.

### 5. Sem álcool 3 horas antes de dormir

Álcool é sedativo no início (você apaga rápido) mas fragmenta a segunda metade da noite, reduzindo sono REM e provocando microdespertares. O sono parece "ok" subjetivamente mas é de baixa qualidade restauradora.

### 6. Exercício, mas não tarde

150 minutos por semana de aeróbico moderado é a recomendação. Evite treino intenso nas últimas 4 horas do dia — eleva temperatura corporal, cortisol e adrenalina justamente quando deveriam estar caindo.

### 7. Reduzir tela na cama

A questão não é só luz azul. **Brilho** geral suprime melatonina mais do que comprimento de onda específico. Modo escuro, óculos âmbar e reduzir o brilho ao mínimo legível são suficientes para a maioria das pessoas.

## Como começar sem fracassar

Não tente os 7 ao mesmo tempo. A evidência comportamental é clara: 2 ou 3 hábitos com consistência rendem mais que 7 hábitos por uma semana e abandono.

**Sequência recomendada:**

1. Semana 1–2: horário fixo de acordar + luz pela manhã.
2. Semana 3–4: cafeína cortada às 14h + temperatura do quarto.
3. Semana 5+: o que sobrar.

## Quando higiene do sono não é suficiente

Se depois de 4 semanas com 4+ hábitos consistentes você ainda demora >30 min para dormir, acorda 2+ vezes por noite ou se sente cansado durante o dia — procure um especialista. Insônia crônica tem tratamento (TCC-I) e quanto antes for diagnosticada, mais rápida a remissão.
`,
  },
];

export async function seedSonoprofundo(): Promise<void> {
  const channel = await ensureChannel();

  if (env.NODE_ENV === 'development') {
    await ensureFixedDevPosts(channel);
  }
}

async function ensureChannel(): Promise<ChannelDoc & { _id: any }> {
  let channel = await Channel.findOne({ slug: CHANNEL_SLUG });
  if (!channel) {
    channel = await Channel.create({
      slug: CHANNEL_SLUG,
      name: 'Sonoprofundo',
      niche: 'sono',
      siteUrl: 'http://localhost:3002',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      active: true,
      publishFrequency: 'daily',
      publishTimes: ['09:00'],
      postsPlan: [{ count: 1, targetReadingMinutes: 8 }],
      publishWeekdays: [0, 1, 2, 3, 4, 5, 6],
      defaultAuthorName: 'Equipe Sonoprofundo',
    });
    logger.info({ slug: channel.slug }, 'sonoprofundo channel created');
  }
  return channel as any;
}

async function ensureFixedDevPosts(channel: ChannelDoc & { _id: any }): Promise<void> {
  const categoriesBySlug = new Map<string, CategoryDoc & { _id: any }>();
  for (let i = 0; i < FIXED_CATEGORIES.length; i++) {
    const c = FIXED_CATEGORIES[i]!;
    const cat = await Category.findOneAndUpdate(
      { channelId: channel._id, slug: c.slug } as any,
      {
        $set: {
          channelId: channel._id,
          slug: c.slug,
          name: c.name,
          color: c.color,
          order: i,
          description: `Conteúdo da categoria ${c.name}.`,
        },
      },
      { upsert: true, new: true },
    );
    if (cat) categoriesBySlug.set(c.slug, cat as any);
  }

  const authorSlug = 'fernando';
  const author = (await Author.findOneAndUpdate(
    { channelId: channel._id, slug: authorSlug } as any,
    {
      $set: {
        channelId: channel._id,
        slug: authorSlug,
        name: 'Fernando',
        jobTitle: 'Editor-chefe',
        shortBio: `Editor-chefe do ${channel.name}. Cuida da curadoria e revisão dos conteúdos.`,
        bio: `# Fernando\n\nEditor-chefe do ${channel.name}. Curador editorial responsável pela seleção e revisão dos conteúdos publicados.`,
        expertise: [channel.niche],
        credentials: [],
        socials: {},
      },
    },
    { upsert: true, new: true },
  )) as AuthorDoc & { _id: any };

  const allTagSlugs = Array.from(new Set(FIXED_POSTS.flatMap((p) => p.tags)));
  for (const slug of allTagSlugs) {
    await Tag.updateOne(
      { channelId: channel._id, slug } as any,
      { $setOnInsert: { channelId: channel._id, slug, name: slug.replace(/-/g, ' ') } },
      { upsert: true },
    ).catch(() => {});
  }

  for (const p of FIXED_POSTS) {
    const cat = categoriesBySlug.get(p.categorySlug);
    if (!cat) continue;
    const wc = countWords(p.content);
    const publishedAt = new Date(Date.now() - p.publishedAtDaysAgo * 24 * 60 * 60 * 1000);
    publishedAt.setHours(9, 0, 0, 0);

    await Post.findOneAndUpdate(
      { channelId: channel._id, slug: p.slug } as any,
      {
        $set: {
          channelId: channel._id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          content: p.content,
          format: p.format,
          status: 'published',
          authorId: author._id,
          categoryId: cat._id,
          tags: p.tags,
          coverImage: {
            url: `https://picsum.photos/seed/${encodeURIComponent(p.slug)}/1600/900`,
            alt: `Imagem ilustrativa: ${p.title.toLowerCase()}.`,
            width: 1600,
            height: 900,
          },
          gallery: [],
          metaTitle: p.metaTitle.slice(0, 70),
          metaDescription: p.metaDescription.slice(0, 180),
          keywords: p.keywords,
          faq: p.faq,
          howToSteps: p.howToSteps,
          references: p.references,
          language: channel.language,
          wordCount: wc,
          readingTimeMinutes: readingTimeMinutes(wc),
          publishedAt,
          featured: p.featured,
        },
      },
      { upsert: true, new: true },
    );
  }

  logger.info(
    { channel: channel.slug, posts: FIXED_POSTS.length, categories: FIXED_CATEGORIES.length },
    'fixed dev posts ensured',
  );
}
