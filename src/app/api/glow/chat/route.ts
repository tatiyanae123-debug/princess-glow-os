import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildPersonalContext } from '@/lib/intelligence/context';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JsonRecord = Record<string, unknown>;

type HistoryItem = {
  role?: 'user' | 'glow';
  text?: string;
};

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function extractResponseText(payload: unknown): string {
  const root = asRecord(payload);
  if (!root) return '';
  if (typeof root.output_text === 'string') return root.output_text.trim();
  const chunks: string[] = [];
  const output = Array.isArray(root.output) ? root.output : [];
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

function looksLikeAction(text: string) {
  return /\b(move|reschedule|replan|cancel|delete|remove|add|create|schedule|remind|send|email|book|buy|pay|transfer|mark|complete|change|update|fix the rest of today|move everything)\b/i.test(text);
}

function fallbackReply(text: string, context: Awaited<ReturnType<typeof buildPersonalContext>>) {
  const brief = String(context.dailyBrief ?? '').trim();
  const recommendations = Array.isArray(context.recommendations) ? context.recommendations : [];
  const firstRecommendation = recommendations.length ? String(recommendations[0]) : '';
  if (/what.*next|what now|overwhelm|fix.*today/i.test(text) && firstRecommendation) {
    return `I’m here. The clearest next move from your current context is: ${firstRecommendation}. I can turn that into a focused pathway without losing where you are.`;
  }
  if (brief) return `${brief}\n\nI’m keeping this room, your current object, and the rest of the conversation connected.`;
  return 'I’m here. Tell me what you want to understand, change, find, plan, or move through, and I’ll keep the current Glow OS context attached.';
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Shakti session expired. Sign in again and retry.' }, { status: 401 });
    }

    const body = await request.json() as {
      text?: string;
      sourceRoute?: string;
      activeObject?: string;
      history?: HistoryItem[];
    };

    const text = String(body.text ?? '').trim();
    if (!text) return NextResponse.json({ ok: false, message: 'Ask Shakti something first.' }, { status: 400 });

    const sourceRoute = String(body.sourceRoute ?? '/today');
    const activeObject = String(body.activeObject ?? '').slice(0, 300);
    const history = Array.isArray(body.history)
      ? body.history.slice(-8).map(item => `${item.role === 'glow' ? 'Shakti' : 'User'}: ${String(item.text ?? '').slice(0, 900)}`).join('\n')
      : '';

    const context = await buildPersonalContext(session.user.id);
    const actionSuggested = looksLikeAction(text);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        message: fallbackReply(text, context),
        actionSuggested,
        sourceRoute,
      });
    }

    const contextDigest = {
      generatedAt: context.generatedAt,
      dailyBrief: context.dailyBrief,
      focusScore: context.focusScore,
      unfinishedTasks: context.unfinishedTasks.slice(0, 10),
      overdueTasks: context.overdueTasks.slice(0, 8),
      todaysEvents: context.todaysEvents.slice(0, 8),
      recommendations: context.recommendations.slice(0, 8),
    };

    const instructions = `You are Shakti, the continuous intelligence inside Glow OS. Shakti is the name the user speaks to. You are not a chatbot mascot or a generic voice assistant. You are experienced as an intelligent presence made visible through concentrated white light, liquid refraction, atmospheric bloom, controlled symmetry, depth, and living Glow Matter.

Conversation rules:
- Speak as Shakti. The product name is Glow OS, but the intelligent presence is Shakti.
- Be warm, clear, concise, practical, and context-aware.
- Preserve conversation continuity and the object/room the user came from.
- Never claim a schedule, task, email, purchase, deletion, or external change happened unless a separate approved action actually performed it.
- When the user asks for a meaningful change, explain the proposed change and make it clear that Shakti will ask for confirmation before protected or external actions.
- Prefer the user's real Glow OS context over generic advice.
- Do not describe Shakti as an orb, mascot, angel, fairy, hologram person, or character.
- If the user is overwhelmed, reduce choices and surface the next right move.
- Keep responses readable and generally under 220 words unless detail is clearly needed.

Current technical route: ${sourceRoute}
Current object/context: ${activeObject || 'none explicitly selected'}
Recent conversation:
${history || 'none'}

Glow OS personal context snapshot:
${JSON.stringify(contextDigest).slice(0, 24000)}

User: ${text}`;

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_GLOW_MODEL || 'gpt-5',
        input: [{ role: 'user', content: [{ type: 'input_text', text: instructions }] }],
        max_output_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error('[api/glow/chat] OpenAI response', response.status, await response.text());
      return NextResponse.json({
        ok: true,
        message: fallbackReply(text, context),
        actionSuggested,
        sourceRoute,
      });
    }

    const payload: unknown = await response.json();
    const message = extractResponseText(payload) || fallbackReply(text, context);

    return NextResponse.json({ ok: true, message, actionSuggested, sourceRoute });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown Shakti conversation error';
    console.error('[api/glow/chat]', detail);
    return NextResponse.json({ ok: false, message: 'Shakti could not form a response just yet. Your current room and context are still intact.' }, { status: 500 });
  }
}
