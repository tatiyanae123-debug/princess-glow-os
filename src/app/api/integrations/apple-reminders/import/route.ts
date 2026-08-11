import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { appleReminderImportSchema } from '@/lib/validations/apple-reminders';
import { importAppleReminders, resolveBridgeUser } from '@/lib/apple-reminders/service';
import { normalizeAppleReminderPayload } from '@/lib/apple-reminders/normalize';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const session = await auth();
  let userId = session?.user?.id ?? null;

  if (!userId) {
    const authorization = request.headers.get('authorization') ?? '';
    if (!authorization.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    userId = await resolveBridgeUser(authorization.slice(7));
  }

  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const strict = appleReminderImportSchema.safeParse(json);
  const payload = strict.success ? strict.data : normalizeAppleReminderPayload(json);
  if (!payload) return NextResponse.json({ error: 'Invalid reminders payload' }, { status: 400 });

  const result = await importAppleReminders(userId, payload);
  ['/reminders','/dashboard','/today','/tasks','/calendar','/briefings','/brain','/connections'].forEach(path=>revalidatePath(path));
  return NextResponse.json({ ok: true, mode: strict.success ? 'structured' : 'direct', ...result });
}
