import { NextResponse } from 'next/server';
import { experimental_transcribe as transcribe } from 'ai';
import { gateway } from '@ai-sdk/gateway';
import { auth } from '@/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

function transcriptionCandidates() {
  const configured = process.env.GLOW_TRANSCRIPTION_MODEL?.trim();
  return [
    configured,
    'openai/gpt-4o-transcribe',
    'openai/gpt-4o-mini-transcribe',
    'openai/whisper-1',
  ].filter((value, index, all): value is string => Boolean(value) && all.indexOf(value) === index);
}

async function transcribeAudio(audio: File) {
  const bytes = Buffer.from(await audio.arrayBuffer());
  const failures: string[] = [];

  for (const model of transcriptionCandidates()) {
    try {
      const result = await transcribe({
        model: gateway.transcriptionModel(model),
        audio: bytes,
      });
      const text = String(result.text ?? '').trim();
      if (text) return { text, model };
      failures.push(`${model}: empty transcript`);
    } catch (error) {
      failures.push(`${model}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  throw new Error(`Glow transcription providers were unavailable. ${failures.slice(0, 3).join(' | ')}`);
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

    const result = await transcribeAudio(audio);
    return NextResponse.json({ ok: true, text: result.text, model: result.model });
  } catch (error) {
    console.error('[api/glow/transcribe]', error);
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : 'Glow voice transcription failed.',
    }, { status: 503 });
  }
}
