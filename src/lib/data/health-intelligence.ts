import 'server-only';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { medications, supplements } from '@/db/schema/health-intelligence';

export async function getMedicationsByUser(userId: string) {
  try {
    return await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .orderBy(desc(medications.active), desc(medications.createdAt));
  } catch (error) {
    console.error('Failed to load medications', error);
    return [];
  }
}

export async function getSupplementsByUser(userId: string) {
  try {
    return await db
      .select()
      .from(supplements)
      .where(eq(supplements.userId, userId))
      .orderBy(desc(supplements.active), desc(supplements.createdAt));
  } catch (error) {
    console.error('Failed to load supplements', error);
    return [];
  }
}
