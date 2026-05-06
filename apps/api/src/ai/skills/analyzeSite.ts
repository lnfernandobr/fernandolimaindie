import { prompts, type AnalyzeSitePromptInput as SiteAnalysisPromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { parseJson } from './shared.js';

export type InsightSeverity = 'high' | 'medium' | 'low';
export type InsightArea = 'content' | 'structure' | 'authority' | 'opportunity';

export interface SiteInsight {
  severity: InsightSeverity;
  area: InsightArea;
  title: string;
  detail: string;
}

export interface SiteAnalysis {
  insights: SiteInsight[];
  provider: string;
  generatedAt: string;
}

const VALID_SEVERITY: InsightSeverity[] = ['high', 'medium', 'low'];
const VALID_AREA: InsightArea[] = ['content', 'structure', 'authority', 'opportunity'];

export async function analyzeSite(input: SiteAnalysisPromptInput): Promise<SiteAnalysis> {
  const provider = await getTextProvider();
  const result = await provider.generateText({
    jsonMode: true,
    messages: [
      { role: 'system', content: prompts.analyzeSite.system },
      { role: 'user', content: prompts.analyzeSite.user(input) },
    ],
  });
  const data = parseJson<{ insights?: unknown[] }>(result.text);
  const raw = Array.isArray(data.insights) ? data.insights : [];
  const insights: SiteInsight[] = raw
    .map((r) => normalizeInsight(r))
    .filter((i): i is SiteInsight => i !== null)
    .slice(0, 10);
  return {
    insights,
    provider: result.provider,
    generatedAt: new Date().toISOString(),
  };
}

function normalizeInsight(r: unknown): SiteInsight | null {
  if (!r || typeof r !== 'object') return null;
  const o = r as Record<string, unknown>;
  const severity = String(o.severity ?? '').toLowerCase() as InsightSeverity;
  const area = String(o.area ?? '').toLowerCase() as InsightArea;
  const title = typeof o.title === 'string' ? o.title.trim() : '';
  const detail = typeof o.detail === 'string' ? o.detail.trim() : '';
  if (!title || !detail) return null;
  return {
    severity: VALID_SEVERITY.includes(severity) ? severity : 'medium',
    area: VALID_AREA.includes(area) ? area : 'content',
    title: title.slice(0, 120),
    detail: detail.slice(0, 600),
  };
}
