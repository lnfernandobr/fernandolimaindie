'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { SocialAccountDto, SocialCampaignDto } from '@fernandolimaindie/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Save, Loader2, Wand2, Eye, Users, FileText, Settings } from 'lucide-react';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CONTENT_TYPES = [
  { id: 'listicle', label: 'Listicle', eg: '"7 reasons why…"' },
  { id: 'myth-busting', label: 'Myth-busting', eg: '"Stop believing…"' },
  { id: 'before-after', label: 'Before/After', eg: '"This changed…"' },
  { id: 'educational', label: 'Educational', eg: '"How X works"' },
  { id: 'inspirational', label: 'Inspirational', eg: '"What nobody tells you"' },
  { id: 'storytelling', label: 'Storytelling', eg: '"I learned this…"' },
  { id: 'tutorial', label: 'Tutorial', eg: '"Step-by-step"' },
];

const VISUAL_STYLES = [
  'vibrant editorial photography, high contrast, cinematic lighting',
  'dark moody aesthetic, deep shadows, rich colors',
  'minimalist clean aesthetic, white background, soft shadows',
  'natural lifestyle photography, warm tones, authentic',
  'luxury editorial, elegant, high-end fashion photography',
  'bold graphic style, vivid colors, modern design',
];

const TONES = [
  'educational and inspiring',
  'motivational and empowering',
  'conversational and relatable',
  'emotional and deep',
  'bold and provocative',
  'calm and mindful',
];

interface PromptConfig {
  contentTypes: string[];
  visualStyle: string;
  tone: string;
  targetAudience: string;
  extraContext: string;
}

interface FormState {
  name: string;
  niche: string;
  language: string;
  timezone: string;
  active: boolean;
  accountId: string;
  imageCount: number;
  notificationEmail: string;
  publishTimes: string;
  publishWeekdays: number[];
  promptConfig: PromptConfig;
}

export function CampaignForm({ campaign }: { campaign?: SocialCampaignDto }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<SocialAccountDto[]>([]);
  const [form, setForm] = useState<FormState>({
    name: campaign?.name ?? '',
    niche: campaign?.niche ?? '',
    language: campaign?.language ?? 'pt-BR',
    timezone: campaign?.timezone ?? 'America/Sao_Paulo',
    active: campaign?.active ?? true,
    accountId: campaign?.accountId ?? '',
    imageCount: campaign?.imageCount ?? 5,
    notificationEmail: campaign?.notificationEmail ?? '',
    publishTimes: (campaign?.publishTimes ?? ['09:00']).join(', '),
    publishWeekdays: campaign?.publishWeekdays ?? [0, 1, 2, 3, 4, 5, 6],
    promptConfig: {
      contentTypes: campaign?.promptConfig?.contentTypes ?? ['educational', 'listicle'],
      visualStyle: campaign?.promptConfig?.visualStyle ?? VISUAL_STYLES[0]!,
      tone: campaign?.promptConfig?.tone ?? TONES[0]!,
      targetAudience: campaign?.promptConfig?.targetAudience ?? '',
      extraContext: campaign?.promptConfig?.extraContext ?? '',
    },
  });

  useEffect(() => {
    void api<{ items: SocialAccountDto[] }>('/api/v1/social/accounts').then((d) => setAccounts(d.items));
  }, []);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function setPrompt<K extends keyof PromptConfig>(k: K, v: PromptConfig[K]) {
    setForm((prev) => ({ ...prev, promptConfig: { ...prev.promptConfig, [k]: v } }));
  }

  function toggleContentType(id: string) {
    const types = form.promptConfig.contentTypes;
    setPrompt(
      'contentTypes',
      types.includes(id) ? types.filter((t) => t !== id) : [...types, id],
    );
  }

  function toggleWeekday(day: number) {
    set(
      'publishWeekdays',
      form.publishWeekdays.includes(day)
        ? form.publishWeekdays.filter((d) => d !== day)
        : [...form.publishWeekdays, day].sort(),
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const publishTimes = form.publishTimes
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const body = {
        name: form.name,
        niche: form.niche,
        language: form.language,
        timezone: form.timezone,
        active: form.active,
        accountId: form.accountId,
        imageCount: form.imageCount,
        notificationEmail: form.notificationEmail,
        publishTimes,
        publishWeekdays: form.publishWeekdays,
        promptConfig: form.promptConfig,
      };

      if (campaign) {
        await api(`/api/v1/social/campaigns/${campaign.id}`, { method: 'PUT', body });
        toast.success('Campaign updated');
      } else {
        await api('/api/v1/social/campaigns', { method: 'POST', body });
        toast.success('Campaign created');
        router.replace('/campaigns');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {/* Basic settings */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4 text-[var(--color-accent)]" />
            Campaign settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Input
                id="niche"
                placeholder="e.g. sleep science, fitness, personal finance"
                value={form.niche}
                onChange={(e) => set('niche', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account">TikTok account</Label>
            <select
              id="account"
              value={form.accountId}
              onChange={(e) => set('accountId', e.target.value)}
              required
              className="h-9 text-sm"
            >
              <option value="">Select an account…</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  @{a.username} {a.displayName ? `(${a.displayName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="imageCount">Images per carousel</Label>
              <Input
                id="imageCount"
                type="number"
                min={1}
                max={10}
                value={form.imageCount}
                onChange={(e) => set('imageCount', parseInt(e.target.value, 10))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Notification email</Label>
              <Input
                id="email"
                type="email"
                value={form.notificationEmail}
                onChange={(e) => set('notificationEmail', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="times">Publish times (HH:MM, comma-separated)</Label>
            <Input
              id="times"
              placeholder="09:00, 18:00"
              value={form.publishTimes}
              onChange={(e) => set('publishTimes', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Publish days</Label>
            <div className="flex gap-2 flex-wrap">
              {WEEKDAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleWeekday(i)}
                  className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                    form.publishWeekdays.includes(i)
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                placeholder="pt-BR"
                value={form.language}
                onChange={(e) => set('language', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                placeholder="America/Sao_Paulo"
                value={form.timezone}
                onChange={(e) => set('timezone', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
              className="h-4 w-4 w-auto"
              style={{ width: 'auto' }}
            />
            <Label htmlFor="active">Active (runs on schedule)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Prompt configuration */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[var(--color-accent)]" />
            Content & AI settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content types */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              Content formats
              <span className="text-xs text-[var(--color-muted)] font-normal ml-1">select all that apply</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTENT_TYPES.map(({ id, label, eg }) => {
                const active = form.promptConfig.contentTypes.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleContentType(id)}
                    title={eg}
                    className={`px-3 py-2 rounded-lg text-xs border text-left transition-colors leading-snug ${
                      active
                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="font-medium block">{label}</span>
                    <span className="opacity-60 text-[10px]">{eg}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual style */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              Visual style
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VISUAL_STYLES.map((style) => {
                const active = form.promptConfig.visualStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPrompt('visualStyle', style)}
                    className={`px-3 py-2 rounded-lg text-xs border text-left transition-colors ${
                      active
                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {style.split(',')[0]}
                  </button>
                );
              })}
            </div>
            <Input
              placeholder="Or describe a custom visual style…"
              value={VISUAL_STYLES.includes(form.promptConfig.visualStyle) ? '' : form.promptConfig.visualStyle}
              onChange={(e) => e.target.value && setPrompt('visualStyle', e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Tone */}
          <div className="space-y-2">
            <Label>Tone</Label>
            <div className="flex flex-wrap gap-2">
              {TONES.map((tone) => {
                const active = form.promptConfig.tone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setPrompt('tone', tone)}
                    className={`px-3 py-1.5 rounded-md text-xs border transition-colors capitalize ${
                      active
                        ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)] text-[var(--color-accent)]'
                        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {tone}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <Label htmlFor="audience" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[var(--color-muted)]" />
              Target audience
              <span className="text-xs text-[var(--color-muted)] font-normal ml-1">optional</span>
            </Label>
            <Input
              id="audience"
              placeholder="e.g. women 25-40 interested in wellness and mental health"
              value={form.promptConfig.targetAudience}
              onChange={(e) => setPrompt('targetAudience', e.target.value)}
            />
          </div>

          {/* Extra context */}
          <div className="space-y-1.5">
            <Label htmlFor="context">
              Additional context
              <span className="text-xs text-[var(--color-muted)] font-normal ml-1">optional</span>
            </Label>
            <textarea
              id="context"
              rows={3}
              placeholder="Brand voice, recurring themes, things to avoid, product mentions, content pillars…"
              value={form.promptConfig.extraContext}
              onChange={(e) => setPrompt('extraContext', e.target.value)}
              className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save campaign</>}
      </Button>
    </form>
  );
}
