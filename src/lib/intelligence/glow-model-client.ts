import 'server-only';

type GlowModelContent =
  | { type: 'input_text'; text: string }
  | { type: 'input_image'; image_url: string; detail?: 'low' | 'high' | 'auto' }
  | { type: 'input_file'; file_data: string; filename: string };

type GlowModelOptions = {
  content: GlowModelContent[];
  maxOutputTokens?: number;
  model?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

export function extractGlowModelText(payload: unknown): string {
  const root = asRecord(payload);
  if (!root) return '';
  if (typeof root.output_text === 'string') return root.output_text.trim();
  const output = Array.isArray(root.output) ? root.output : [];
  const chunks: string[] = [];
  for (const itemValue of output) {
    const item = asRecord(itemValue);
    const content = item && Array.isArray(item.content) ? item.content : [];
    for (const contentValue of content) {
      const part = asRecord(contentValue);
      if (part && typeof part.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
}

export function glowModelIsConfigured() {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.OPENAI_API_KEY);
}

export async function requestGlowModel(options: GlowModelOptions): Promise<string> {
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || '';
  const directOpenAIKey = process.env.OPENAI_API_KEY || '';

  if (!gatewayToken && !directOpenAIKey) return '';

  const usingGateway = Boolean(gatewayToken);
  const url = usingGateway
    ? 'https://ai-gateway.vercel.sh/v1/responses'
    : 'https://api.openai.com/v1/responses';
  const token = usingGateway ? gatewayToken : directOpenAIKey;
  const model = options.model || (usingGateway
    ? process.env.OPENAI_GLOW_GATEWAY_MODEL || 'openai/gpt-5.6-sol'
    : process.env.OPENAI_GLOW_MODEL || 'gpt-5');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [{ role: 'user', content: options.content }],
      max_output_tokens: options.maxOutputTokens ?? 900,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Glow model request failed (${response.status}).`);
  }

  return extractGlowModelText(await response.json());
}
