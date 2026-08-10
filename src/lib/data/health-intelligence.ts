import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { medications, supplements } from '@/db/schema/health-intelligence';

export async function getMedicationsByUser(userId: string) {
  return db.select().from(medications).where(eq(medications.userId, userId)).orderBy(desc(medications.active), desc(medications.createdAt));
}

export async function getSupplementsByUser(userId: string) {
  return db.select().from(supplements).where(eq(supplements.userId, userId)).orderBy(desc(supplements.active), desc(supplements.createdAt));
}
