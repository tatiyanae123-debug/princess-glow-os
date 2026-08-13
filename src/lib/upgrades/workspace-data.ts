import 'server-only';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { glowEntities, glowNotices } from '@/db/schema/interconnected-os';
import { entityRelations } from '@/db/schema/adaptive-os';
import { aiProposals, auditEvents, intelligentObservations } from '@/db/schema/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';

export function getUpgradeObjects(userId:string,entityType:string){return db.select().from(glowEntities).where(and(eq(glowEntities.userId,userId),eq(glowEntities.entityType,entityType),eq(glowEntities.status,'active'))).orderBy(desc(glowEntities.updatedAt)).limit(100);}
export function getUpgradeRelations(userId:string){return db.select().from(entityRelations).where(eq(entityRelations.userId,userId)).orderBy(desc(entityRelations.createdAt)).limit(150);}
export function getUpgradeAudit(userId:string){return db.select().from(auditEvents).where(eq(auditEvents.userId,userId)).orderBy(desc(auditEvents.createdAt)).limit(120);}
export async function getUpgradeObservations(userId:string){const[observations,notices]=await Promise.all([db.select().from(intelligentObservations).where(eq(intelligentObservations.userId,userId)).orderBy(desc(intelligentObservations.createdAt)).limit(40),db.select().from(glowNotices).where(eq(glowNotices.userId,userId)).orderBy(desc(glowNotices.createdAt)).limit(40)]);return{observations,notices};}
export function getUpgradeProposals(userId:string){return db.select().from(aiProposals).where(eq(aiProposals.userId,userId)).orderBy(desc(aiProposals.createdAt)).limit(50);}
export async function getUpgradeContext(userId:string){try{return await buildPersonalContext(userId);}catch{return null;}}
