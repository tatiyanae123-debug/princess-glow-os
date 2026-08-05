import 'server-only';

import { db } from '@/db';
import { users } from '@/db/schema/auth';
import { eq } from 'drizzle-orm';
import { getGoogleConnectionStatus, type GoogleConnectionStatus } from '@/lib/google/tokens';

export type ConnectionsOverview = GoogleConnectionStatus;

export async function getConnectionsOverview(userId: string): Promise<ConnectionsOverview> {
  const [status, [user]] = await Promise.all([
    getGoogleConnectionStatus(userId),
    db.select({ email: users.email }).from(users).where(eq(users.id, userId)),
  ]);
  return { ...status, email: user?.email ?? null };
}
