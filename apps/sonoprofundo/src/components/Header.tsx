import Link from 'next/link';
import type { ChannelDto } from '@bn/shared';
import Logo from './Logo';

export function Header({ channel }: { channel: ChannelDto }) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-bg)]/75">
      <a href="#main" className="skip-link">Pular para o conteúdo</a>
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link href="/" aria-label={channel.name} className="inline-flex items-center">
            <Logo size={18} />
          </Link>
          <nav aria-label="Principal" className="flex items-center gap-5 sm:gap-7 text-sm">
            <Link href="/" className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors">
              Início
            </Link>
            <Link href="/blog" className="text-[var(--color-muted)] hover:text-[var(--color-fg)] transition-colors">
              Blog
            </Link>
            <Link
              href="/teste"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-amber-glow)]/30 text-[var(--color-amber-glow)] hover:bg-[var(--color-amber-ember)] transition-colors"
            >
              Teste do sono
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
