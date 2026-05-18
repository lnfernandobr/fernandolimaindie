'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  AI_MODELS,
  IMAGE_MODELS,
  type SettingsDto,
  type SettingsInput,
} from '@fernandolimaindie/shared';
import { PageHeader } from '@/components/PageHeader';
import { SettingsForm } from '@/components/SettingsForm';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { ScrollText } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [settings, setSettings] = useState<SettingsDto | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<SettingsDto>('/api/v1/settings');
        setSettings(data);
      } catch {
        toast.error('Não consegui carregar as configurações');
      }
    })();
  }, []);

  async function handleSave(input: SettingsInput) {
    try {
      const data = await api<SettingsDto>('/api/v1/settings', {
        method: 'PUT',
        body: input,
      });
      setSettings(data);
      toast.success(
        data.aiProvider !== data.effectiveAiProvider
          ? `Salvo. Provider caiu pra mock: chave ${data.aiProvider} ausente na API.`
          : 'Configurações atualizadas. O cache de providers foi recarregado.',
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar';
      toast.error(msg);
    }
  }

  if (!settings) {
    return <PageHeader title="Carregando…" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Provedores e modelos usados pela pipeline de IA. Mudanças tomam efeito sem restart."
      />
      <SettingsForm
        initial={settings}
        aiModels={AI_MODELS}
        imageModels={IMAGE_MODELS}
        onSave={handleSave}
      />

      <Card>
        <CardContent className="py-5">
          <Link
            href="/configuracoes/prompts"
            className="flex items-start gap-3 sm:gap-4 group"
          >
            <span className="rounded-lg bg-[var(--color-accent)]/15 p-2.5 text-[var(--color-accent)] flex-shrink-0">
              <ScrollText className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold group-hover:text-[var(--color-accent)] transition-colors">
                Prompts da pipeline de IA
              </h2>
              <p className="text-sm text-[var(--color-muted)] mt-1 break-words">
                Ver todos os prompts (system + user) com estimativa de tokens. Read-only. Para editar, mexa em <code className="break-all">apps/api/src/ai/prompts/</code>.
              </p>
            </div>
            <span className="text-[var(--color-muted)] group-hover:text-[var(--color-fg)] transition-colors flex-shrink-0 self-center">→</span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
