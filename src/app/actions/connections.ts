'use server';

import { auth, signIn } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { disconnectGoogleAccount } from '@/lib/google/tokens';

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
