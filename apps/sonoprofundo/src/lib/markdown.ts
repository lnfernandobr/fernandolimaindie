import { Marked } from 'marked';
import GithubSlugger from 'github-slugger';

export interface TocEntry {
  id: string;
  text: string;
  depth: number;
}

export function extractToc(markdown: string): TocEntry[] {
  const slug = new GithubSlugger();
  const lines = markdown.split('\n');
  const out: TocEntry[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const depth = m[1]!.length;
    const text = m[2]!.replace(/[*_`~]/g, '');
    const id = slug.slug(text);
    out.push({ id, text, depth });
  }
  return out;
}

export function renderMarkdown(markdown: string): string {
  const slug = new GithubSlugger();
  const m = new Marked({ gfm: true });
  m.use({
    renderer: {
      heading(token: { text: string; depth: number }) {
        const stripped = token.text.replace(/<[^>]+>/g, '').replace(/[*_`~]/g, '');
        const id = slug.slug(stripped);
        return `<h${token.depth} id="${id}">${m.parseInline(token.text)}</h${token.depth}>\n`;
      },
    },
  });
  return m.parse(markdown) as string;
}
