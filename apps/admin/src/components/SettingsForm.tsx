'use client';

import { useMemo, useState } from 'react';
import {
  type AIProviderName,
  type ImageProviderName,
  type SettingsDto,
  type SettingsInput,
} from '@fernandolimaindie/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const AI_PROVIDER_LABEL: Record<AIProviderName, string> = {
  mock: 'Mock (sem API externa)',
  claude: 'Anthropic Claude',
  openai: 'OpenAI',
};

const IMAGE_PROVIDER_LABEL: Record<ImageProviderName, string> = {
  mock: 'Mock (sem geração real)',
  openai: 'OpenAI',
};

interface Props {
  initial: SettingsDto;
  aiModels: Record<AIProviderName, string[]>;
  imageModels: Record<ImageProviderName, string[]>;
  onSave: (input: SettingsInput) => Promise<void>;
}

export function SettingsForm({ initial, aiModels, imageModels, onSave }: Props) {
  const [aiProvider, setAiProvider] = useState<AIProviderName>(initial.aiProvider);
  const [aiModel, setAiModel] = useState<string>(initial.aiModel ?? '');
  const [imageProvider, setImageProvider] = useState<ImageProviderName>(initial.imageProvider);
  const [imageModel, setImageModel] = useState<string>(initial.imageModel ?? '');
  const [saving, setSaving] = useState(false);

  const aiModelOptions = useMemo(() => aiModels[aiProvider] ?? [], [aiModels, aiProvider]);
  const imageModelOptions = useMemo(
    () => imageModels[imageProvider] ?? [],
    [imageModels, imageProvider],
  );

  const aiFellBack = initial.aiProvider !== initial.effectiveAiProvider;
  const imageFellBack = initial.imageProvider !== initial.effectiveImageProvider;

  function handleAiProviderChange(next: AIProviderName) {
    setAiProvider(next);
    // limpa o model — o select abaixo vai oferecer outro set
    setAiModel('');
  }

  function handleImageProviderChange(next: ImageProviderName) {
    setImageProvider(next);
    setImageModel('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        aiProvider,
        aiModel: aiModel.trim() === '' ? null : aiModel,
        imageProvider,
        imageModel: imageModel.trim() === '' ? null : imageModel,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <CardTitle>Provider de texto</CardTitle>
          {aiFellBack ? (
            <Badge variant="warn" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              caindo pra {initial.effectiveAiProvider}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Provider</Label>
            <select
              id="ai-provider"
              value={aiProvider}
              onChange={(e) => handleAiProviderChange(e.target.value as AIProviderName)}
              className="w-full h-10 rounded-md border bg-[var(--color-bg)] px-3 text-sm"
            >
              {(Object.keys(aiModels) as AIProviderName[]).map((p) => (
                <option key={p} value={p}>
                  {AI_PROVIDER_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-model">Modelo</Label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              disabled={aiProvider === 'mock' || aiModelOptions.length === 0}
              className="w-full h-10 rounded-md border bg-[var(--color-bg)] px-3 text-sm disabled:opacity-50"
            >
              <option value="">— default do provider —</option>
              {aiModelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-muted)]">
              Vazio = a API usa o default do provider escolhido (definido no código de cada provider).
            </p>
          </div>
          {aiFellBack ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              A API caiu para <strong>{initial.effectiveAiProvider}</strong> porque a chave de{' '}
              <strong>{initial.aiProvider}</strong> está vazia em <code>apps/api/.env(.local)</code>. Adicione a chave e a próxima requisição já usa o provider escolhido.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <CardTitle>Provider de imagem</CardTitle>
          {imageFellBack ? (
            <Badge variant="warn" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              caindo pra {initial.effectiveImageProvider}
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="image-provider">Provider</Label>
            <select
              id="image-provider"
              value={imageProvider}
              onChange={(e) => handleImageProviderChange(e.target.value as ImageProviderName)}
              className="w-full h-10 rounded-md border bg-[var(--color-bg)] px-3 text-sm"
            >
              {(Object.keys(imageModels) as ImageProviderName[]).map((p) => (
                <option key={p} value={p}>
                  {IMAGE_PROVIDER_LABEL[p]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-model">Modelo</Label>
            <select
              id="image-model"
              value={imageModel}
              onChange={(e) => setImageModel(e.target.value)}
              disabled={imageProvider === 'mock' || imageModelOptions.length === 0}
              className="w-full h-10 rounded-md border bg-[var(--color-bg)] px-3 text-sm disabled:opacity-50"
            >
              <option value="">— default do provider —</option>
              {imageModelOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-muted)]">
              Anthropic não gera imagem — para imagens reais, use OpenAI mesmo com texto Claude.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar configurações'}
        </Button>
        <p className="text-xs text-[var(--color-muted)]">
          Última atualização:{' '}
          {new Date(initial.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      </div>
    </form>
  );
}
