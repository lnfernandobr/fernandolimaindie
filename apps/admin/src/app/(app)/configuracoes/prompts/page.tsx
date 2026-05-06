'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';

interface PromptInspection {
  key: string;
  name: string;
  version: string;
  description: string;
  system: string;
  systemTokens: number;
  userSample: string;
  userSampleTokens: number;
  totalTokens: number;
}

export default function PromptsPage() {
  const [items, setItems] = useState<PromptInspection[] | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void (async () => {
      try {
        const data = await api<{ items: PromptInspection[] }>('/api/v1/prompts');
        setItems(data.items);
      } catch {
        toast.error('Não consegui carregar os prompts da API');
      }
    })();
  }, []);

  const totals = useMemo(() => {
    if (!items) return null;
    return {
      count: items.length,
      systemTokens: items.reduce((s, i) => s + i.systemTokens, 0),
      userTokens: items.reduce((s, i) => s + i.userSampleTokens, 0),
    };
  }, [items]);

  if (!items) return <PageHeader title="Carregando…" />;

  function toggle(k: string) {
    setOpen((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  return (
    <div className="space-y-6">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-fg)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para configurações
      </Link>

      <PageHeader
        title="Prompts da pipeline de IA"
        description="Visualização read-only de todos os prompts em uso. Para editar, abra apps/api/src/ai/prompts.ts."
      />

      {totals ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge variant="secondary">{totals.count} prompts</Badge>
          <Badge variant="secondary">~{totals.systemTokens.toLocaleString('pt-BR')} tokens em system (cacheável)</Badge>
          <Badge variant="secondary">~{totals.userTokens.toLocaleString('pt-BR')} tokens médios em user (sample)</Badge>
        </div>
      ) : null}

      <ol className="space-y-3">
        {items.map((p, idx) => {
          const isOpen = !!open[p.key];
          return (
            <li key={p.key}>
              <Card>
                <button
                  type="button"
                  onClick={() => toggle(p.key)}
                  className="w-full text-left"
                  aria-expanded={isOpen}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[var(--color-muted)]">{idx + 1}.</span>
                        <span>{p.name}</span>
                        <Badge variant="default" className="text-[10px]">v{p.version}</Badge>
                      </CardTitle>
                      <p className="text-sm text-[var(--color-muted)] mt-1.5">{p.description}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right text-xs text-[var(--color-muted)]">
                        <div>~{p.systemTokens} sys</div>
                        <div>~{p.userSampleTokens} user</div>
                      </div>
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardHeader>
                </button>
                {isOpen ? (
                  <CardContent className="pt-0 space-y-4">
                    <PromptBlock title="System (cacheável)" content={p.system} tokens={p.systemTokens} />
                    <PromptBlock
                      title="User (renderizado com sample input)"
                      content={p.userSample}
                      tokens={p.userSampleTokens}
                    />
                  </CardContent>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function PromptBlock({ title, content, tokens }: { title: string; content: string; tokens: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          {title}
        </h3>
        <span className="text-xs text-[var(--color-muted)] font-mono">~{tokens} tokens</span>
      </div>
      <pre className="text-xs leading-relaxed font-mono whitespace-pre-wrap break-words bg-[var(--color-bg)] border rounded-md p-4 max-h-[400px] overflow-auto">
        {content}
      </pre>
    </div>
  );
}
