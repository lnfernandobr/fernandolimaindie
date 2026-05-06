'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  AI_MODELS,
  IMAGE_MODELS,
  type SettingsDto,
  type SettingsInput,
} from '@bn/shared';
import { PageHeader } from '@/components/PageHeader';
import { SettingsForm } from '@/components/SettingsForm';
import { toast } from '@/components/ui/toast';

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
    </div>
  );
}
