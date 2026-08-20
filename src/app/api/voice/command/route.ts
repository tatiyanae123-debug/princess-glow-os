import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensureGlowIntelligenceSchema } from '@/app/actions/intelligence-activation';
import { ingestText } from '@/lib/intelligence/universal-intake';
import { routeInboxItem } from '@/lib/intelligence/inbox-routing';

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
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    const body = await request.json() as { text?: string; sourceRoute?: string; risk?: Risk };
    const text = String(body.text ?? '').trim();
    const sourceRoute = String(body.sourceRoute ?? '').trim() || undefined;
    const risk: Risk = body.risk === 'high' || body.risk === 'medium' ? body.risk : 'low';
    if (!text) return NextResponse.json({ ok: false, message: 'Say or type a command first.' }, { status: 400 });

    await ensureGlowIntelligenceSchema();
    const clauses = splitVoiceBrainDump(text);
    const protectedAction = requiresProtectedProposal(text, risk);
    const actions = [] as Array<{ title: string; type: string; destinations: string[]; confidence: number; routedEntityType?: string; routedEntityId?: string }>;
    let autoRouted = 0;
    let needsReview = 0;

    for (const clause of clauses) {
      const prefix = protectedAction
        ? '[GLOW VOICE · PROTECTED ACTION PROPOSAL — REQUIRE CONFIRMATION BEFORE DESTRUCTIVE/EXTERNAL CHANGE]'
        : '[GLOW VOICE · ACTION COMMAND]';
      const result = await ingestText(session.user.id, `${prefix}\n${clause}`, { sourceRoute });
      let routedEntityType: string | undefined;
      let routedEntityId: string | undefined;

      if (!protectedAction && risk === 'low') {
        const routed = await routeInboxItem(session.user.id, result.inbox.id);
        if (routed.ok) {
          routedEntityType = routed.routedEntityType;
          routedEntityId = routed.routedEntityId;
          autoRouted += 1;
        } else {
          needsReview += 1;
        }
      } else {
        needsReview += 1;
      }

      actions.push({
        title: result.classification.title,
        type: result.classification.type,
        destinations: result.classification.destinations,
        confidence: result.classification.confidence,
        routedEntityType,
        routedEntityId,
      });
    }

    let message: string;
    if (protectedAction) {
      message = `Glow understood ${actions.length} action${actions.length === 1 ? '' : 's'} and created a protected proposal for review.`;
    } else if (risk === 'medium') {
      message = `Glow understood ${actions.length} action${actions.length === 1 ? '' : 's'} and saved ${actions.length === 1 ? 'it' : 'them'} to Inbox for review before making larger changes.`;
    } else if (needsReview > 0) {
      message = `Glow placed ${autoRouted} item${autoRouted === 1 ? '' : 's'} into the right room and kept ${needsReview} in Inbox because it needs one missing detail or review.`;
    } else {
      message = `Glow understood and placed ${autoRouted} item${autoRouted === 1 ? '' : 's'} into the right part of your life.`;
    }

    return NextResponse.json({
      ok: true,
      risk,
      requiresConfirmation: protectedAction,
      autoRouted,
      needsReview,
      actions,
      message,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown voice command error';
    console.error('[api/voice/command]', detail);
    return NextResponse.json({ ok: false, message: `Glow could not route that voice command yet. ${detail}` }, { status: 500 });
  }
}
