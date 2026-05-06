'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Radio, Activity, Gauge, LogOut, Moon, Sun, Settings } from 'lucide-react';
import { clearToken, getToken } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from './ui/button';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/canais', label: 'Canais', icon: Radio },
  { href: '/overview', label: 'Overview', icon: Gauge },
  { href: '/execucoes', label: 'Execuções', icon: Activity },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [name, setName] = useState<string>('Fernando');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    const stored = localStorage.getItem('bn_admin_theme');
    const initial = (stored as 'light' | 'dark') ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', initial === 'dark');
    setTheme(initial);
    try {
      const userRaw = localStorage.getItem('bn_admin_user');
      if (userRaw) {
        const u = JSON.parse(userRaw);
        if (u?.name) setName(u.name);
      }
    } catch {}
  }, [router]);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    localStorage.setItem('bn_admin_theme', next);
    setTheme(next);
  }

  function logout() {
    clearToken();
    localStorage.removeItem('bn_admin_user');
    router.replace('/login');
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 flex-col border-r bg-[var(--color-card)] lg:flex">
        <div className="flex h-14 items-center px-5 border-b">
          <span className="text-lg font-semibold tracking-tight">Blog Network</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-medium'
                    : 'hover:bg-black/5 dark:hover:bg-white/5',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 space-y-2">
          <div className="text-xs text-[var(--color-muted)]">Logado como</div>
          <div className="text-sm font-medium">{name}</div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="flex-1">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="lg:hidden border-b bg-[var(--color-card)] px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Blog Network</span>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>
        <div className="p-6 lg:p-10 max-w-screen-xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
