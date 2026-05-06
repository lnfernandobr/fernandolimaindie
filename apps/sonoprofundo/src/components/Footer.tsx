import Link from 'next/link';
import type { ChannelDto } from '@bn/shared';
import Logo from './Logo';

export function Footer({ channel }: { channel: ChannelDto }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-card)] mt-20">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 py-10 grid gap-6 md:grid-cols-[1fr_auto] items-end">
        <div>
          <Logo size={16} />
        </div>
        <nav aria-label="Navegação" className="flex items-center gap-5 text-sm text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-fg)]">Início</Link>
          <Link href="/blog" className="hover:text-[var(--color-fg)]">Blog</Link>
        </nav>
      </div>
      <div className="border-t border-[var(--color-border)] py-4 px-4 sm:px-6 max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[var(--color-text-faint)]">
        <span>© {year} {channel.name}. Todos os direitos reservados.</span>
        <span className="flex items-center gap-3">
          <a href="/feed.xml" className="hover:text-[var(--color-muted)]">RSS</a>
          <span aria-hidden>·</span>
          <a href="/atom.xml" className="hover:text-[var(--color-muted)]">Atom</a>
          <span aria-hidden>·</span>
          <a href="/sitemap.xml" className="hover:text-[var(--color-muted)]">Sitemap</a>
          <span aria-hidden>·</span>
          <a href="/llms.txt" className="hover:text-[var(--color-muted)]">llms.txt</a>
        </span>
      </div>
    </footer>
  );
}
