import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureGlowIntelligenceSchema } from '@/app/actions/intelligence-activation';
import { ingestText } from '@/lib/intelligence/universal-intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Risk = 'low' | 'medium' | 'high';

function splitVoiceBrainDump(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized
    .split(/(?:\s*,\s*and\s+|\s*;\s*|\s+then\s+|\s+also\s+)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);
  return parts.length > 1 ? parts.slice(0, 12) : [normalized];
}

function requiresProtectedProposal(text: string, risk: Risk) {
  return risk === 'high' || /\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account)\b/i.test(text);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Shakti session expired. Sign in again and retry.' }, { status: 401 });
    const body = await request.json() as { text?: string; sourceRoute?: string; risk?: Risk };
    const text = String(body.text ?? '').trim();
    const sourceRoute = String(body.sourceRoute ?? '').trim() || undefined;
    const risk: Risk = body.risk === 'high' || body.risk === 'medium' ? body.risk : 'low';
    if (!text) return NextResponse.json({ ok: false, message: 'Say or type a command first.' }, { status: 400 });

    await ensureGlowIntelligenceSchema();
    const clauses = splitVoiceBrainDump(text);
    const protectedAction = requiresProtectedProposal(text, risk);
    const actions = [] as Array<{ title: string; type: string; destinations: string[]; confidence: number }>;

    for (const clause of clauses) {
      const prefix = protectedAction
        ? '[SHAKTI VOICE · PROTECTED ACTION PROPOSAL — REQUIRE CONFIRMATION BEFORE DESTRUCTIVE/EXTERNAL CHANGE]'
        : '[SHAKTI VOICE · ACTION COMMAND]';
      const result = await ingestText(session.user.id, `${prefix}\n${clause}`, { sourceRoute });
      actions.push({
        title: result.classification.title,
        type: result.classification.type,
        destinations: result.classification.destinations,
        confidence: result.classification.confidence,
      });
    }

    return NextResponse.json({
      ok: true,
      risk,
      requiresConfirmation: protectedAction,
      actions,
      message: protectedAction
        ? `Shakti understood ${actions.length} action${actions.length === 1 ? '' : 's'} and created a protected proposal for review.`
        : `Shakti understood and routed ${actions.length} action${actions.length === 1 ? '' : 's'} using context from ${sourceRoute ?? 'your current room'}.`,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown voice command error';
    console.error('[api/voice/command]', detail);
    return NextResponse.json({ ok: false, message: `Shakti could not route that voice command yet. ${detail}` }, { status: 500 });
  }
}
