import { db } from '@/db';
import { wellnessEntries } from '@/db/schema/wellness-entries';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateWellnessEntryInput, UpdateWellnessEntryInput } from '@/lib/validations/wellness-entries';

export async function getWellnessEntriesByUser(userId:string){
  try{return await db.select().from(wellnessEntries).where(eq(wellnessEntries.userId,userId)).orderBy(desc(wellnessEntries.entryDate));}
  catch(error){console.error('[Glow OS] wellness entries unavailable',error);return [];}
}

export async function getWellnessEntryById(id:string,userId:string){
  try{const [entry]=await db.select().from(wellnessEntries).where(and(eq(wellnessEntries.id,id),eq(wellnessEntries.userId,userId)));return entry??null;}
  catch(error){console.error('[Glow OS] wellness entry unavailable',error);return null;}
}

export async function createWellnessEntry(userId:string,data:CreateWellnessEntryInput){const [entry]=await db.insert(wellnessEntries).values({...data,userId}).returning();return entry;}
export async function updateWellnessEntry(id:string,userId:string,data:UpdateWellnessEntryInput){const [entry]=await db.update(wellnessEntries).set({...data,updatedAt:new Date()}).where(and(eq(wellnessEntries.id,id),eq(wellnessEntries.userId,userId))).returning();return entry??null;}
export async function deleteWellnessEntry(id:string,userId:string){const [entry]=await db.delete(wellnessEntries).where(and(eq(wellnessEntries.id,id),eq(wellnessEntries.userId,userId))).returning();return entry??null;}
