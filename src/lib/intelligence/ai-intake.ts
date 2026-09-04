import 'server-only';

import { glowModelIsConfigured, requestGlowModel } from '@/lib/intelligence/glow-model-client';

export type AiIntakeAnalysis = {
  type: string;
  title: string;
  confidence: number;
  destinations: string[];
  extracted: Record<string, unknown>;
  summary?: string;
};

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function parseJson(text: string): AiIntakeAnalysis | null {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const value = asRecord(JSON.parse(cleaned) as unknown);
    if (!value || typeof value.type !== 'string' || typeof value.title !== 'string') return null;
    const extracted = asRecord(value.extracted) ?? {};
    return {
      type: value.type,
      title: value.title.slice(0, 160),
      confidence: typeof value.confidence === 'number' ? Math.max(0, Math.min(1, value.confidence)) : 0.8,
      destinations: Array.isArray(value.destinations) ? value.destinations.filter((x): x is string => typeof x === 'string').slice(0, 8) : [],
      extracted,
      summary: typeof value.summary === 'string' ? value.summary.slice(0, 1000) : undefined,
    };
  } catch {
    return null;
  }
}

type IntakeContent =
  | { type: 'input_text'; text: string }
  | { type: 'input_image'; image_url: string; detail: 'high' }
  | { type: 'input_file'; file_data: string; filename: string };

export async function analyzeUniversalInputWithAI(input: { filename?: string; mimeType?: string; base64?: string; dataUrl?: string; text?: string; note?: string }): Promise<AiIntakeAnalysis | null> {
  if (!glowModelIsConfigured()) return null;

  const instructions = `You are Glow OS Universal Intake. Understand what the user MEANS, not just the exact words they used.

The user may ramble, use fragments, correct themselves mid-thought, imply an obligation instead of saying "create a task", or speak conversationally. Examples that can imply action include "I need to...", "I have to...", "I was supposed to...", "don't let me forget...", "make sure I...", "I should probably...", and "put this somewhere I'll remember". Do not require command syntax.

Return ONLY valid JSON with this shape: {"type":"task|reminder|appointment|schedule|receipt|goal|project|beauty|hair|fitness|career|travel|note|document|image|shopping|reference","title":"short human title","confidence":0.0,"destinations":["tasks","calendar","planning","habits","fitness","beauty","beauty-lab","hair","wellness","finance","financial-brain","goals","projects","memory","timeline","closet","home","notes","inbox"],"extracted":{"dateText":null,"timeText":null,"amount":null,"people":[],"items":[],"location":null,"actions":[]},"summary":"brief description"}.

Choose every destination where the information is genuinely useful. Extract concrete dates, times, totals, product names, tasks, people, places, commitments and dependencies when visible. Preserve uncertainty. Never invent missing facts. A casual thought is not automatically a task; infer an action only when the user expresses an intention, obligation, request, commitment, reminder need, or desired outcome.`;

  const content: IntakeContent[] = [{ type: 'input_text', text: `${instructions}\nFilename: ${input.filename ?? 'none'}\nMIME: ${input.mimeType ?? 'none'}\nUser note: ${input.note ?? ''}\nText content: ${input.text?.slice(0, 30000) ?? ''}` }];
  if (input.mimeType?.startsWith('image/') && input.dataUrl) {
    content.push({ type: 'input_image', image_url: input.dataUrl, detail: 'high' });
  } else if (input.base64 && input.filename) {
    content.push({ type: 'input_file', file_data: input.base64, filename: input.filename });
  }

  try {
    const text = await requestGlowModel({ content, maxOutputTokens: 700 });
    return parseJson(text);
  } catch {
    return null;
  }
}
