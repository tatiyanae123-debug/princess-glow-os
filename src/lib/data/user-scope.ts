import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { lifeMemories, planningBlocks, projects } from '@/db/schema/intelligence-expansion';

export async function getLifeMemoriesByUser(userId: string) {
  return db.select().from(lifeMemories).where(and(eq(lifeMemories.userId, userId), eq(lifeMemories.archived, false))).orderBy(desc(lifeMemories.createdAt));
}

export async function getProjectsByUser(userId: string) {
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getPlanningBlocksByUser(userId: string) {
  return db.select().from(planningBlocks).where(eq(planningBlocks.userId, userId)).orderBy(desc(planningBlocks.startAt));
}
