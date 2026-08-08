import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rotateReminderSyncToken } from '@/lib/apple/reminders-sync';

export const runtime = 'nodejs';

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = await rotateReminderSyncToken(session.user.id);
  return NextResponse.json({ token });
}
