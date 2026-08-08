import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildPersonalContext } from '@/lib/intelligence/context';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const context = await buildPersonalContext(session.user.id);
  return NextResponse.json({ data: context });
}
