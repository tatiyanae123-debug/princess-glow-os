import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

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

    const incoming = await request.formData();
    const audio = incoming.get('audio');
    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ ok: false, message: 'Glow did not receive any audio.' }, { status: 400 });
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ ok: false, message: 'That voice message is too long. Try a shorter recording.' }, { status: 413 });
    }

    const upstream = new FormData();
    upstream.append('file', audio, audio.name || 'glow-voice.m4a');
    upstream.append('model', process.env.OPENAI_GLOW_TRANSCRIBE_MODEL || 'gpt-transcribe');
    upstream.append('language', 'en');
    upstream.append(
      'prompt',
      'Glow OS vocabulary: Glow, Glow Matter, Today, Plan, Life, Brain, Create, Ask Glow, Routine Conductor, Attention Center, Planning With Me, What Now.'
    );

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstream,
    });

    const payload = await response.json() as { text?: string; error?: { message?: string } };
    if (!response.ok) {
      return NextResponse.json({ ok: false, message: payload.error?.message || 'Glow could not transcribe that recording.' }, { status: 502 });
    }

    const text = String(payload.text ?? '').trim();
    if (!text) {
      return NextResponse.json({ ok: false, message: 'Glow could not hear enough speech in that recording.' }, { status: 422 });
    }

    return NextResponse.json({ ok: true, text });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow voice transcription failed.' }, { status: 500 });
  }
}
