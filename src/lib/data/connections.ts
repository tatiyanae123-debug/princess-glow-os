import 'server-only';

import { db } from '@/db';
import { users } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { getGoogleConnectionStatus, type GoogleConnectionStatus } from '@/lib/google/tokens';
import { getLatestCalendarSync } from '@/lib/google/calendar-sync';

export type ConnectionsOverview = GoogleConnectionStatus & {
  calendarState: 'connected' | 'needs_reauthorization' | 'error' | 'disconnected';
  lastSync: Awaited<ReturnType<typeof getLatestCalendarSync>>;
};

export async function getConnectionsOverview(userId: string): Promise<ConnectionsOverview> {
  const [status, [user], lastSync] = await Promise.all([
    getGoogleConnectionStatus(userId),
    db.select({ email: users.email }).from(users).where(eq(users.id, userId)),
    getLatestCalendarSync(userId),
  ]);
  const calendarState = !status.connected
    ? 'disconnected'
    : status.needsReauthorization || !status.hasCalendarScope || lastSync?.errorCode === 'revoked'
      ? 'needs_reauthorization'
      : lastSync?.status === 'error'
        ? 'error'
        : 'connected';
  return { ...status, email: user?.email ?? null, calendarState, lastSync };
}
