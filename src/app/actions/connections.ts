'use server';

import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { disconnectGoogleAccount } from '@/lib/google/tokens';
import { syncCalendarRequestSchema } from '@/lib/validations/google-calendar';
import { syncGoogleCalendar } from '@/lib/google/calendar-sync';

export async function disconnectGoogleAction() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const result = await disconnectGoogleAccount(session.user.id);
  revalidatePath('/connections');
  revalidatePath('/dashboard');
  return { data: result };
}

// Reconnect reuses the exact same Auth.js Google provider/scopes already
// configured in src/auth.ts — this is not a separate auth system, just the
// normal sign-in flow re-triggered with prompt=consent so Google re-issues
// a refresh token and the user can re-approve scopes.
export async function reconnectGoogleAction() {
  await signIn('google', { redirectTo: '/connections' });
}

export async function syncGoogleCalendarAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const parsed = syncCalendarRequestSchema.safeParse(input);
  if (!parsed.success) return { error: { formErrors: ['Invalid sync request.'] } };
  const result = await syncGoogleCalendar(session.user.id);
  revalidatePath('/connections');
  revalidatePath('/calendar');
  revalidatePath('/dashboard');
  revalidatePath('/today');
  return result.ok ? { data: result } : { error: { formErrors: [result.reason] } };
}
