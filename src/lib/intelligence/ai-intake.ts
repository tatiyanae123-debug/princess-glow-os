import 'server-only';

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

function extractResponseText(payload: unknown): string {
  const root = asRecord(payload);
  if (!root) return '';
  if (typeof root.output_text === 'string') return root.output_text;
  const chunks: string[] = [];
  const output = Array.isArray(root.output) ? root.output : [];
  for (const itemValue of output) {
    const item = asRecord(itemValue);
    const contentList = item && Array.isArray(item.content) ? item.content : [];
    for (const contentValue of contentList) {
      const content = asRecord(contentValue);
      if (content && typeof content.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const instructions = `You are Glow OS Universal Intake. Analyze the user's input and return ONLY valid JSON with this shape: {"type":"task|reminder|appointment|schedule|receipt|goal|project|beauty|hair|fitness|career|travel|note|document|image|shopping|reference","title":"short human title","confidence":0.0,"destinations":["tasks","calendar","planning","habits","fitness","beauty","beauty-lab","hair","wellness","finance","financial-brain","goals","projects","memory","timeline","closet","home","notes","inbox"],"extracted":{"dateText":null,"timeText":null,"amount":null,"people":[],"items":[],"location":null,"actions":[]},"summary":"brief description"}. Choose every destination where the information is genuinely useful, not just one. Extract concrete dates, times, totals, product names, tasks, people, places and commitments when visible. Never invent missing facts.`;

  const content: IntakeContent[] = [{ type: 'input_text', text: `${instructions}\nFilename: ${input.filename ?? 'none'}\nMIME: ${input.mimeType ?? 'none'}\nUser note: ${input.note ?? ''}\nText content: ${input.text?.slice(0, 30000) ?? ''}` }];
  if (input.mimeType?.startsWith('image/') && input.dataUrl) {
    content.push({ type: 'input_image', image_url: input.dataUrl, detail: 'high' });
  } else if (input.base64 && input.filename) {
    content.push({ type: 'input_file', file_data: input.base64, filename: input.filename });
  }

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_GLOW_MODEL || 'gpt-5',
      input: [{ role: 'user', content }],
      max_output_tokens: 700,
    }),
  });
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  return parseJson(extractResponseText(payload));
}
