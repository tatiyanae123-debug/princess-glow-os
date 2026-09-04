import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VOICE_INSTRUCTIONS = [
  'Speak like a warm, emotionally intelligent human companion sitting beside the listener.',
  'Use natural conversational American English with subtle warmth, grounded confidence, and varied intonation.',
  'Use realistic micro-pauses and phrasing. Keep the pace calm and natural, not slow or theatrical.',
  'Avoid announcer cadence, sing-song rhythm, exaggerated cheerfulness, over-enunciation, customer-service tone, and robotic AI-assistant delivery.',
  'Do not whisper, perform, or sound overly polished. Sound present, thoughtful, relaxed, and human.',
  'Match the emotional tone of the text without becoming dramatic.',
].join(' ');

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, message: 'Glow voice is not configured on this deployment yet.' }, { status: 503 });
    }

    const body = await request.json() as { text?: string };
    const text = String(body.text ?? '').trim().slice(0, 7000);
    if (!text) {
      return NextResponse.json({ ok: false, message: 'Glow has nothing to say yet.' }, { status: 400 });
    }

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
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ ok: false, message: detail || 'Glow could not generate a voice reply.' }, { status: 502 });
    }

    return new NextResponse(await response.arrayBuffer(), {
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
