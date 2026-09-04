import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || '';
}

async function transcribeThroughGateway(audio: File, token: string) {
  const audioBuffer = Buffer.from(await audio.arrayBuffer());
  const base64 = audioBuffer.toString('base64');
  const mediaType = audio.type || 'audio/mp4';
  const models = [
    process.env.OPENAI_GLOW_TRANSCRIBE_MODEL || 'openai/gpt-4o-transcribe',
    'openai/whisper-1',
  ];

  let lastDetail = '';
  for (const model of [...new Set(models)]) {
    const response = await fetch('https://ai-gateway.vercel.sh/v4/ai/transcription-model', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ai-model-id': model,
      },
      body: JSON.stringify({ audio: base64, mediaType }),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => null) as { text?: string; error?: { message?: string }; message?: string } | null;
    const text = String(payload?.text ?? '').trim();
    if (response.ok && text) return text;
    lastDetail = payload?.error?.message || payload?.message || `Transcription model ${model} returned ${response.status}.`;
  }
  throw new Error(lastDetail || 'Glow could not transcribe that recording.');
}

async function transcribeDirectOpenAI(audio: File, apiKey: string) {
  const upstream = new FormData();
  upstream.append('file', audio, audio.name || 'glow-voice.m4a');
  upstream.append('model', process.env.OPENAI_GLOW_TRANSCRIBE_MODEL || 'gpt-4o-transcribe');
  upstream.append('language', 'en');
  upstream.append(
    'prompt',
    'Glow OS vocabulary: Glow, Glow Matter, Today, Plan, Life, Brain, Create, Ask Glow, Routine Conductor, Attention Center, Planning With Me, What Now.'
  );

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
    cache: 'no-store',
  });
  const payload = await response.json() as { text?: string; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || 'Glow could not transcribe that recording.');
  const text = String(payload.text ?? '').trim();
  if (!text) throw new Error('Glow could not hear enough speech in that recording.');
  return text;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    }

    const incoming = await request.formData();
    const audio = incoming.get('audio');
    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ ok: false, message: 'Glow did not receive any audio.' }, { status: 400 });
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ ok: false, message: 'That voice message is too long. Try a shorter recording.' }, { status: 413 });
    }

    const token = gatewayToken();
    const openaiKey = process.env.OPENAI_API_KEY || '';
    if (!token && !openaiKey) {
      return NextResponse.json({ ok: false, message: 'Glow voice could not authenticate right now.' }, { status: 503 });
    }

    const text = token
      ? await transcribeThroughGateway(audio, token)
      : await transcribeDirectOpenAI(audio, openaiKey);

    return NextResponse.json({ ok: true, text });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow voice transcription failed.' }, { status: 500 });
  }
}
