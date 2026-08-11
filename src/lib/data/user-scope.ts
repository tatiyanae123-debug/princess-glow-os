import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { lifeMemories, planningBlocks, projects } from '@/db/schema/intelligence-expansion';

async function safeRows<T>(label: string, query: Promise<T[]>): Promise<T[]> {
  try {
    return await query;
  } catch (error) {
    console.error(`[Glow OS] ${label} unavailable`, error);
    return [];
  }
}

export function getLifeMemoriesByUser(userId: string) {
  return safeRows('life memories', db.select().from(lifeMemories).where(and(eq(lifeMemories.userId, userId), eq(lifeMemories.archived, false))).orderBy(desc(lifeMemories.createdAt)));
}

export function getAllLifeMemoriesByUser(userId: string) {
  return safeRows('all life memories', db.select().from(lifeMemories).where(eq(lifeMemories.userId, userId)).orderBy(desc(lifeMemories.createdAt)));
}

export function getProjectsByUser(userId: string) {
  return safeRows('projects', db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt)));
}

export function getPlanningBlocksByUser(userId: string) {
  return safeRows('planning blocks', db.select().from(planningBlocks).where(eq(planningBlocks.userId, userId)).orderBy(desc(planningBlocks.startAt)));
}
