import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { decideKernelScenario } from '@/lib/intelligence/living-kernel-registry';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { scenarioId?: string; decision?: 'accepted' | 'rejected' };

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Glow session expired.' }, { status: 401 });
    const body = await request.json() as Body;
    const scenarioId = String(body.scenarioId ?? '').trim();
    const decision = body.decision;
    if (!scenarioId || (decision !== 'accepted' && decision !== 'rejected')) {
      return NextResponse.json({ ok: false, message: 'A valid scenario decision is required.' }, { status: 400 });
    }
    const scenario = await decideKernelScenario(session.user.id, scenarioId, decision);
    if (!scenario) return NextResponse.json({ ok: false, message: 'That proposed reality is no longer available.' }, { status: 404 });
    return NextResponse.json({ ok: true, scenario: { id: scenario.id, status: scenario.status } });
  } catch (error) {
    console.error('[api/glow/kernel/scenario]', error);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow could not update the proposed reality.' }, { status: 500 });
  }
}
