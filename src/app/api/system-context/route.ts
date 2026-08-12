import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildCrossSystemSnapshot } from '@/lib/intelligence/cross-system';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const room = new URL(request.url).searchParams.get('room') || 'dashboard';
  try {
    return NextResponse.json(await buildCrossSystemSnapshot(session.user.id, room));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to build system context.' }, { status: 500 });
  }
}
