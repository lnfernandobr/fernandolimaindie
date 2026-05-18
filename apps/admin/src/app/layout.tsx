import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin · fernandolimaindie',
  description: 'Painel de administração do sistema multi-canal',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
