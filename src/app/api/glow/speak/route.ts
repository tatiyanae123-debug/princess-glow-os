import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VOICE_INSTRUCTIONS = [
  'Speak like a warm, emotionally intelligent human companion sitting beside the listener.',
  'Use natural conversational American English with subtle warmth, grounded confidence, and varied intonation.',
  'Use realistic micro-pauses and phrasing. Keep the pace natural, never theatrical.',
  'Avoid announcer cadence, sing-song rhythm, exaggerated cheerfulness, over-enunciation, customer-service tone, and robotic AI-assistant delivery.',
  'Do not whisper or sound overly polished. Sound present, thoughtful, relaxed, spontaneous, and human.',
  'Match the emotional tone of the text. Use contractions and conversational phrasing naturally.',
  'Do not read punctuation, markdown, headings, bullets, or interface labels mechanically. Turn them into natural speech.',
].join(' ');

function gatewayToken() {
  return process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || '';
}

async function speakThroughGateway(text: string, token: string) {
  const models = [
    process.env.OPENAI_GLOW_TTS_MODEL || 'openai/gpt-4o-mini-tts',
    'openai/tts-1',
  ];

  let lastDetail = '';
  for (const model of [...new Set(models)]) {
    const response = await fetch('https://ai-gateway.vercel.sh/v4/ai/speech-model', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ai-model-id': model,
      },
      body: JSON.stringify({
        text,
        voice: process.env.OPENAI_GLOW_VOICE || 'coral',
        outputFormat: 'mp3',
        instructions: VOICE_INSTRUCTIONS,
        speed: 1,
        language: 'en',
      }),
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => null) as { audio?: string; error?: { message?: string }; message?: string } | null;
    if (response.ok && payload?.audio) {
      return Buffer.from(payload.audio, 'base64');
    }
    lastDetail = payload?.error?.message || payload?.message || `Speech model ${model} returned ${response.status}.`;
  }
  throw new Error(lastDetail || 'Glow could not generate a voice reply.');
}

async function speakDirectOpenAI(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_GLOW_TTS_MODEL || 'gpt-4o-mini-tts',
      voice: process.env.OPENAI_GLOW_VOICE || 'coral',
      input: text,
      instructions: VOICE_INSTRUCTIONS,
      response_format: 'mp3',
    }),
    cache: 'no-store',
  });
  if (!response.ok) throw new Error((await response.text()) || 'Glow could not generate a voice reply.');
  return Buffer.from(await response.arrayBuffer());
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    }

    const body = await request.json() as { text?: string };
    const text = String(body.text ?? '').trim().slice(0, 7000);
    if (!text) {
      return NextResponse.json({ ok: false, message: 'Glow has nothing to say yet.' }, { status: 400 });
    }

    const token = gatewayToken();
    const openaiKey = process.env.OPENAI_API_KEY || '';
    if (!token && !openaiKey) {
      return NextResponse.json({ ok: false, message: 'Glow voice could not authenticate right now.' }, { status: 503 });
    }

    const audio = token
      ? await speakThroughGateway(text, token)
      : await speakDirectOpenAI(text, openaiKey);

    return new NextResponse(audio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow voice playback failed.' }, { status: 500 });
  }
}
