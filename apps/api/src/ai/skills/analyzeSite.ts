import { prompts, type AnalyzeSitePromptInput as SiteAnalysisPromptInput } from '../prompts/index.js';
import { getTextProvider } from '../providers/index.js';
import { analyzeSiteSchema } from '../schemas.js';

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

export async function analyzeSite(input: SiteAnalysisPromptInput): Promise<SiteAnalysis> {
  const provider = await getTextProvider();
  const { data, provider: providerName } = await provider.generateStructured({
    schemaName: 'AnalyzeSite',
    schemaDescription: 'Insights estratégicos sobre o site — até 10 itens com severity, area, title e detail.',
    schema: analyzeSiteSchema,
    messages: [
      { role: 'system', content: prompts.analyzeSite.system },
      { role: 'user', content: prompts.analyzeSite.user(input) },
    ],
  });

  return {
    insights: data.insights.slice(0, 10),
    provider: providerName,
    generatedAt: new Date().toISOString(),
  };
}
