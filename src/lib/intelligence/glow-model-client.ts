import 'server-only';
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

type GlowModelContent =
  | { type: 'input_text'; text: string }
  | { type: 'input_image'; image_url: string; detail?: 'low' | 'high' | 'auto' }
  | { type: 'input_file'; file_data: string; filename: string };

type GlowModelOptions = {
  content: GlowModelContent[];
  maxOutputTokens?: number;
  model?: string;
};

function mediaTypeForFilename(filename: string) {
  const name = filename.toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'text/plain';
  if (name.endsWith('.csv')) return 'text/csv';
  if (name.endsWith('.json')) return 'application/json';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

function toAiSdkContent(content: GlowModelContent[]) {
  return content.map((part) => {
    if (part.type === 'input_text') {
      return { type: 'text', text: part.text };
    }
    if (part.type === 'input_image') {
      return { type: 'image', image: part.image_url };
    }
    return {
      type: 'file',
      data: Buffer.from(part.file_data, 'base64'),
      mediaType: mediaTypeForFilename(part.filename),
      filename: part.filename,
    };
  });
}

function modelCandidates(requested?: string) {
  const configured = process.env.GLOW_REASONING_MODEL?.trim()
    || process.env.OPENAI_GLOW_GATEWAY_MODEL?.trim();
  return [
    requested,
    configured,
    'openai/gpt-5.6-sol',
    'openai/gpt-5.5',
    'google/gemini-3.8-flash',
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

export function glowModelIsConfigured() {
  // In Vercel production, AI Gateway authentication is supplied by the platform
  // at runtime and should not be inferred only from process.env.VERCEL_OIDC_TOKEN.
  return Boolean(
    process.env.VERCEL
    || process.env.AI_GATEWAY_API_KEY
    || process.env.VERCEL_OIDC_TOKEN
    || process.env.OPENAI_API_KEY
  );
}

export async function requestGlowModel(options: GlowModelOptions): Promise<string> {
  const failures: string[] = [];
  const content = toAiSdkContent(options.content);

  for (const model of modelCandidates(options.model)) {
    try {
      const result = await generateText({
        model: gateway.languageModel(model),
        messages: [{ role: 'user', content }] as never,
        maxOutputTokens: options.maxOutputTokens ?? 900,
      });
      const text = String(result.text ?? '').trim();
      if (text) return text;
      failures.push(`${model}: empty response`);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  throw new Error(`Glow reasoning providers were unavailable. ${failures.slice(0, 3).join(' | ')}`);
}
