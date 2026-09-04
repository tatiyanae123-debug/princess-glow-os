import { NextResponse } from 'next/server';
import { experimental_generateSpeech as generateSpeech } from 'ai';
import { gateway } from '@ai-sdk/gateway';
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

type SpeechCandidate = {
  model: string;
  voice: string;
};

function speechCandidates(): SpeechCandidate[] {
  const configured = process.env.GLOW_SPEECH_MODEL?.trim();
  const configuredVoice = process.env.GLOW_SPEECH_VOICE?.trim();
  const candidates: SpeechCandidate[] = [];

  if (configured) {
    candidates.push({
      model: configured,
      voice: configuredVoice || (/grok-tts/i.test(configured) ? 'eve' : 'nova'),
    });
  }

  candidates.push(
    { model: 'spacexai/grok-tts', voice: 'eve' },
    { model: 'openai/tts-1-hd', voice: 'nova' },
    { model: 'openai/tts-1', voice: 'nova' },
  );

  return candidates.filter((candidate, index, all) =>
    all.findIndex((other) => other.model === candidate.model && other.voice === candidate.voice) === index
  );
}

async function createSpeech(text: string) {
  const failures: string[] = [];

  for (const candidate of speechCandidates()) {
    try {
      const result = await generateSpeech({
        model: gateway.speechModel(candidate.model),
        text,
        voice: candidate.voice,
        outputFormat: 'mp3',
        speed: 1,
        language: 'en',
        instructions: VOICE_INSTRUCTIONS,
      });

      const bytes = result.audio.uint8Array;
      if (bytes?.byteLength) {
        return {
          audio: Buffer.from(bytes),
          mediaType: result.audio.mediaType || 'audio/mpeg',
          model: candidate.model,
        };
      }
      failures.push(`${candidate.model}: empty audio`);
    } catch (error) {
      failures.push(`${candidate.model}: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  throw new Error(`Glow voice providers were unavailable. ${failures.slice(0, 3).join(' | ')}`);
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

    const result = await createSpeech(text);
    return new NextResponse(result.audio, {
      status: 200,
      headers: {
        'Content-Type': result.mediaType,
        'Cache-Control': 'no-store',
        'X-Glow-Speech-Model': result.model,
      },
    });
  } catch (error) {
    console.error('[api/glow/speak]', error);
    return NextResponse.json({
      ok: false,
      message: error instanceof Error ? error.message : 'Glow voice playback failed.',
    }, { status: 503 });
  }
}
