import { NextRequest, NextResponse } from 'next/server';
import { appleRemindersSyncSchema } from '@/lib/validations/apple-reminders';
import { authenticateReminderSyncToken, syncAppleReminders } from '@/lib/apple/reminders-sync';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = await authenticateReminderSyncToken(token);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = appleRemindersSyncSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid reminders payload' }, { status: 400 });

  const result = await syncAppleReminders(userId, parsed.data.reminders);
  return NextResponse.json({ ok: true, ...result });
}
