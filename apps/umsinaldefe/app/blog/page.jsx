import { listPosts, BLOG_CATEGORIES } from '@/lib/content/blog.js';
import { buildMetadata } from '@/lib/seo/metadata.js';
import { breadcrumbLd, ldGraph, jsonLdScript } from '@/lib/seo/jsonld.js';
import { AdSlot } from '@/components/AdSlot.jsx';
import { IntentNav } from '@/components/IntentNav.jsx';

export const revalidate = 86400;

export const metadata = buildMetadata({
  title: 'Blog: vida com fé, família e superação',
  description:
    'Artigos de ajuda com base bíblica: família, casamento, superação da ansiedade, vida cristã e finanças com fé. Conversa de gente pra gente, sem moralismo.',
  path: '/blog',
});

export default function BlogIndexPage() {
  const posts = listPosts();

  const breadcrumbs = [
    { name: 'Início', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];

  return (
    <main>
      <script {...jsonLdScript(ldGraph(breadcrumbLd(breadcrumbs)))} />

      <nav aria-label="Navegação estrutural" className="breadcrumb">
        <ol>
          {breadcrumbs.map((crumb, i) => (
            <li key={crumb.path}>
              {i < breadcrumbs.length - 1 ? (
                <a href={crumb.path}>{crumb.name}</a>
              ) : (
                <span aria-current="page">{crumb.name}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header style={{ marginBottom: 'var(--space-6)' }}>
        <h1>Vida com fé</h1>
        <p className="lede">
          Textos pra ajudar na vida real: família, casamento, superação e fé no dia a dia.
          Conversa de gente pra gente, com a Bíblia por perto e sem dedo na cara.
        </p>
      </header>

      <AdSlot slot="hub-top" />

      {BLOG_CATEGORIES.map((cat) => {
        const inCat = posts.filter((p) => p.category === cat.slug);
        if (!inCat.length) return null;
        return (
          <section key={cat.slug} aria-label={cat.label} style={{ marginBottom: 'var(--space-6)' }}>
            <h2>{cat.label}</h2>
            <p className="t-soft" style={{ marginBottom: 'var(--space-4)' }}>{cat.description}</p>
            <div className="signal-grid">
              {inCat.map((p) => (
                <a key={p.slug} href={`/blog/${p.slug}`} className="signal-card">
                  <span
                    className="tag"
                    style={{ marginBottom: 'var(--space-3)', display: 'inline-block' }}
                  >
                    {cat.label}
                  </span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      <IntentNav />
    </main>
  );
}
