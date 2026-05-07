'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CronExpressionParser } from 'cron-parser';
import { api } from '@/lib/api';
import {
  channelInputSchema,
  publishTimesToCron,
  postsPlanTotal,
  minutesToWordTarget,
  READING_TIME_PRESETS,
  READING_TIME_MIN,
  READING_TIME_MAX,
  DEFAULT_POSTS_PLAN,
  type ChannelDto,
  type ChannelInput,
  type PostPlanItem,
} from '@bn/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { Trash2, Plus, Clock } from 'lucide-react';

const TIMEZONES: { value: string; label: string }[] = [
  { value: 'America/Sao_Paulo', label: 'São Paulo / Brasília (UTC-3)' },
  { value: 'America/Recife', label: 'Recife / Nordeste (UTC-3)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande / MS (UTC-4)' },
  { value: 'America/Cuiaba', label: 'Cuiabá / MT (UTC-4)' },
  { value: 'America/Manaus', label: 'Manaus / AM (UTC-4)' },
  { value: 'UTC', label: 'UTC' },
];
const WEEKDAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

export function ChannelForm({ initial, channelId }: { initial?: ChannelDto; channelId?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ChannelInput>(() =>
    initial
      ? sanitizeForForm(initial)
      : {
          slug: '',
          name: '',
          niche: '',
          siteUrl: '',
          language: 'pt-BR',
          timezone: 'America/Sao_Paulo',
          active: true,
          publishFrequency: 'daily',
          publishTimes: ['09:00'],
          postsPlan: [...DEFAULT_POSTS_PLAN],
          publishWeekdays: [0, 1, 2, 3, 4, 5, 6],
          defaultAuthorName: 'Fernando',
          notes: '',
        },
  );

  const generatedCrons = useMemo(
    () => publishTimesToCron(form.publishTimes, form.publishWeekdays),
    [form.publishTimes, form.publishWeekdays],
  );

  const previews = useMemo(() => {
    return generatedCrons.map((expr) => {
      try {
        const it = CronExpressionParser.parse(expr, { tz: form.timezone });
        const next: string[] = [];
        for (let i = 0; i < 3; i++) next.push(it.next().toDate().toISOString());
        return { expr, next };
      } catch {
        return { expr, next: [] as string[] };
      }
    });
  }, [generatedCrons, form.timezone]);

  function patch<K extends keyof ChannelInput>(k: K, v: ChannelInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const parsed = channelInputSchema.parse(form);
      if (channelId) {
        await api(`/api/v1/channels/${channelId}`, { method: 'PUT', body: parsed });
        toast.success('Canal atualizado');
      } else {
        const created = await api<ChannelDto>('/api/v1/channels', { method: 'POST', body: parsed });
        toast.success('Canal criado');
        router.replace(`/canais/${created.id}` as any);
        return;
      }
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!channelId) return;
    if (!confirm('Excluir este canal? Posts permanecerão no banco.')) return;
    try {
      await api(`/api/v1/channels/${channelId}`, { method: 'DELETE' });
      toast.success('Canal excluído');
      router.replace('/canais');
    } catch {
      toast.error('Falha ao excluir');
    }
  }

  async function triggerNow() {
    if (!channelId) return;
    try {
      await api(`/api/v1/runs/trigger/${channelId}`, { method: 'POST' });
      toast.success('Pipeline disparado — veja em Execuções');
    } catch {
      toast.error('Falha ao disparar pipeline');
    }
  }

  function addTime() {
    const last = form.publishTimes[form.publishTimes.length - 1] ?? '09:00';
    patch('publishTimes', [...form.publishTimes, last]);
  }

  function removeTime(i: number) {
    patch('publishTimes', form.publishTimes.filter((_, idx) => idx !== i));
  }

  function toggleWeekday(d: number) {
    const has = form.publishWeekdays.includes(d);
    const next = has ? form.publishWeekdays.filter((w) => w !== d) : [...form.publishWeekdays, d].sort();
    patch('publishWeekdays', next);
  }

  function patchPlanItem(i: number, partial: Partial<PostPlanItem>) {
    const next = form.postsPlan.map((b, idx) => (idx === i ? { ...b, ...partial } : b));
    patch('postsPlan', next);
  }

  function addPlanBucket() {
    const last = form.postsPlan[form.postsPlan.length - 1];
    patch('postsPlan', [
      ...form.postsPlan,
      { count: 1, targetReadingMinutes: last?.targetReadingMinutes === 15 ? 8 : 15 },
    ]);
  }

  function removePlanBucket(i: number) {
    if (form.postsPlan.length <= 1) return;
    patch('postsPlan', form.postsPlan.filter((_, idx) => idx !== i));
  }

  const postsPerSlotTotal = postsPlanTotal(form.postsPlan);
  const totalPerDay = form.publishTimes.length * postsPerSlotTotal;
  const avgMinutes =
    postsPerSlotTotal > 0
      ? Math.round(
          form.postsPlan.reduce((sum, b) => sum + b.count * b.targetReadingMinutes, 0) /
            postsPerSlotTotal,
        )
      : 0;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome" required hint="Como o site é chamado. Ex: Minha Viola.">
              <Input value={form.name} onChange={(e) => patch('name', e.target.value)} required />
            </Field>
            <Field label="Slug interno" required hint="Identificador único na API. kebab-case.">
              <Input value={form.slug} onChange={(e) => patch('slug', e.target.value)} required />
            </Field>
            <Field label="Nicho" required hint="Input pra IA gerar conteúdo. Ex: violão, café, sono.">
              <Input value={form.niche} onChange={(e) => patch('niche', e.target.value)} required />
            </Field>
            <Field label="URL do site" required hint="Ex: https://minhaviola.com. Usado pra revalidação ISR e pro audit.">
              <Input
                type="url"
                value={form.siteUrl}
                onChange={(e) => patch('siteUrl', e.target.value)}
                placeholder="https://minhaviola.com"
                required
              />
            </Field>
            <Field label="Idioma">
              <Input value={form.language} onChange={(e) => patch('language', e.target.value)} />
            </Field>
            <Field label="Timezone" hint="Define o horário de disparo do scheduler.">
              <select value={form.timezone} onChange={(e) => patch('timezone', e.target.value)}>
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
                {/* Mantém visível um valor salvo fora da lista (não perde a config). */}
                {TIMEZONES.find((tz) => tz.value === form.timezone) ? null : (
                  <option value={form.timezone}>{form.timezone}</option>
                )}
              </select>
            </Field>
            <Field label="Autor padrão" hint="Aparece em todos os posts gerados.">
              <Input
                value={form.defaultAuthorName}
                onChange={(e) => patch('defaultAuthorName', e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => patch('active', e.target.checked)}
              className="h-4 w-4 accent-[var(--color-accent)]"
            />
            <Label htmlFor="active">Canal ativo (scheduler liga/desliga)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agenda de publicação automática</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Frequência">
              <select
                value={form.publishFrequency}
                onChange={(e) => patch('publishFrequency', e.target.value as ChannelInput['publishFrequency'])}
              >
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="custom">Personalizada</option>
              </select>
            </Field>
            <Field label="Total estimado" hint="Calculado automaticamente">
              <div className="h-9 flex items-center text-sm text-[var(--color-muted)]">
                {totalPerDay} post(s)/dia · ~{avgMinutes} min de leitura média
                {form.publishWeekdays.length < 7 ? ` · ${form.publishWeekdays.length} dia(s)/semana` : ''}
              </div>
            </Field>
          </div>

          <div>
            <Label>Dias da semana</Label>
            <div className="flex gap-1.5 mt-2">
              {WEEKDAYS.map((w) => {
                const active = form.publishWeekdays.includes(w.value);
                return (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => toggleWeekday(w.value)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      active
                        ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)] border-[var(--color-accent)]'
                        : 'bg-[var(--color-card)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {w.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Horários de publicação</Label>
            <div className="space-y-2 mt-2">
              {form.publishTimes.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={t}
                    onChange={(e) => {
                      const next = [...form.publishTimes];
                      next[i] = e.target.value;
                      patch('publishTimes', next);
                    }}
                    className="w-40"
                  />
                  <span className="text-xs text-[var(--color-muted)] flex-1">
                    Próximas: {previews[i]?.next.slice(0, 2).map((d) => new Date(d).toLocaleString('pt-BR')).join(' · ') ?? '—'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTime(i)}
                    aria-label="Remover horário"
                    disabled={form.publishTimes.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addTime} className="mt-2">
              <Plus className="h-4 w-4" /> Adicionar horário
            </Button>
            <p className="text-xs text-[var(--color-muted)] mt-3">
              Crons gerados:{' '}
              {generatedCrons.length === 0 ? '—' : <code className="text-xs">{generatedCrons.join(' · ')}</code>}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plano de geração por slot</CardTitle>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Em cada horário acima, a IA gera os posts abaixo. Misture comprimentos para
            cobrir leituras rápidas e aprofundadas no mesmo dia.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {form.postsPlan.map((bucket, i) => {
              const targetWords = minutesToWordTarget(bucket.targetReadingMinutes);
              const isPreset = (READING_TIME_PRESETS as readonly number[]).includes(
                bucket.targetReadingMinutes,
              );
              return (
                <div
                  key={i}
                  className="flex flex-wrap items-center gap-2 rounded-md border bg-[var(--color-card)] p-3"
                >
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={bucket.count}
                    onChange={(e) =>
                      patchPlanItem(i, {
                        count: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      })
                    }
                    className="w-20"
                    aria-label="Quantidade de posts"
                  />
                  <span className="text-sm text-[var(--color-muted)]">
                    {bucket.count === 1 ? 'post de até' : 'posts de até'}
                  </span>
                  <select
                    value={isPreset ? String(bucket.targetReadingMinutes) : 'custom'}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'custom') return;
                      patchPlanItem(i, { targetReadingMinutes: Number(v) });
                    }}
                    className="w-28"
                    aria-label="Tempo de leitura"
                  >
                    {READING_TIME_PRESETS.map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                    <option value="custom">Outro…</option>
                  </select>
                  {!isPreset ? (
                    <Input
                      type="number"
                      min={READING_TIME_MIN}
                      max={READING_TIME_MAX}
                      value={bucket.targetReadingMinutes}
                      onChange={(e) =>
                        patchPlanItem(i, {
                          targetReadingMinutes: Math.max(
                            READING_TIME_MIN,
                            Math.min(READING_TIME_MAX, Number(e.target.value) || READING_TIME_MIN),
                          ),
                        })
                      }
                      className="w-20"
                      aria-label="Minutos personalizados"
                    />
                  ) : null}
                  <span className="flex items-center gap-1 text-xs text-[var(--color-muted)] flex-1">
                    <Clock className="h-3 w-3" />
                    ≈ {targetWords.toLocaleString('pt-BR')} palavras por post
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePlanBucket(i)}
                    aria-label="Remover variação"
                    disabled={form.postsPlan.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPlanBucket}
              disabled={form.postsPlan.length >= 10}
            >
              <Plus className="h-4 w-4" /> Adicionar variação
            </Button>
            <p className="text-xs text-[var(--color-muted)]">
              <strong className="text-[var(--color-fg)]">{postsPerSlotTotal}</strong> post(s)/slot ·
              ~{avgMinutes} min de leitura média
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas internas (opcional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.notes ?? ''}
            onChange={(e) => patch('notes', e.target.value)}
            className="min-h-[80px]"
            placeholder="Anotações livres sobre esse canal — só você vê."
          />
        </CardContent>
      </Card>

      <div className="flex justify-between gap-2">
        <div className="flex gap-2">
          {channelId ? (
            <>
              <Button type="button" variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4" /> Excluir canal
              </Button>
              <Button type="button" variant="outline" onClick={triggerNow}>
                Gerar post agora
              </Button>
            </>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando…' : channelId ? 'Salvar alterações' : 'Criar canal'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? <span className="text-red-600 ml-0.5">*</span> : null}
      </Label>
      {children}
      {hint ? <div className="text-xs text-[var(--color-muted)]">{hint}</div> : null}
    </div>
  );
}

function sanitizeForForm(c: ChannelDto): ChannelInput {
  const plan =
    c.postsPlan && c.postsPlan.length > 0
      ? c.postsPlan.map((b) => ({ count: b.count, targetReadingMinutes: b.targetReadingMinutes }))
      : [...DEFAULT_POSTS_PLAN];
  return {
    slug: c.slug,
    name: c.name,
    niche: c.niche,
    siteUrl: c.siteUrl,
    language: c.language,
    timezone: c.timezone,
    active: c.active,
    publishFrequency: c.publishFrequency ?? 'daily',
    publishTimes: c.publishTimes && c.publishTimes.length > 0 ? c.publishTimes : ['09:00'],
    postsPlan: plan,
    publishWeekdays:
      c.publishWeekdays && c.publishWeekdays.length > 0 ? c.publishWeekdays : [0, 1, 2, 3, 4, 5, 6],
    defaultAuthorName: c.defaultAuthorName ?? 'Fernando',
    notes: c.notes ?? '',
  };
}
