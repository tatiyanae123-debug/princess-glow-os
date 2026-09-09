import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getLivingKernelContext, type KernelSelectedContext } from '@/lib/intelligence/living-kernel';
import { ensureLivingKernelMutationTriggers } from '@/lib/intelligence/living-kernel-triggers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Body = {
  route?: string;
  selectedContext?: KernelSelectedContext;
  text?: string;
  forceSync?: boolean;
};

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Sign in to load the Glow Life Model.' }, { status: 401 });
    await ensureLivingKernelMutationTriggers();
    const body = await request.json().catch(() => ({})) as Body;
    const context = await getLivingKernelContext({
      userId: session.user.id,
      route: String(body.route ?? '/today'),
      selectedContext: body.selectedContext ?? null,
      text: String(body.text ?? ''),
      forceSync: body.forceSync === true,
      maxObjects: 72,
    });
    return NextResponse.json({ ok: true, context });
  } catch (error) {
    console.error('[api/glow/kernel/context]', error);
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : 'Glow could not load the shared Life Model.' }, { status: 503 });
  }
}
