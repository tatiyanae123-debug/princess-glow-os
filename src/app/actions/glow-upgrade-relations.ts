'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { auditEvents } from '@/db/schema/completion-v1';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
const safeKey=(raw:string)=>/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(raw)?raw:'';
const value=(fd:FormData,key:string,max=160)=>String(fd.get(key)??'').trim().slice(0,max);
const workspace=(room:string,tool:string)=>`/upgrades/${encodeURIComponent(room)}/${encodeURIComponent(tool)}`;

export async function createUpgradeRelationAction(room:string,tool:string,fd:FormData){
  const userId=await requireUserId(),safeRoom=safeKey(room),safeTool=safeKey(tool);
  const fromType=safeKey(value(fd,'fromType',80)),toType=safeKey(value(fd,'toType',80));
  const fromId=value(fd,'fromId'),toId=value(fd,'toId'),relation=safeKey(value(fd,'relation',80))||'related_to';
  if(!safeRoom||!safeTool||!fromType||!toType||!fromId||!toId||(fromType===toType&&fromId===toId))return;
  const [created]=await db.insert(entityRelations).values({userId,fromType,fromId,relation,toType,toId,metadata:{room:safeRoom,tool:safeTool,source:'room_upgrade'}}).returning();
  if(created)await db.insert(auditEvents).values({userId,action:'entity_relation_created',entityType:'entity_relation',entityId:created.id,details:{fromType,fromId,relation,toType,toId,room:safeRoom,tool:safeTool}});
  revalidatePath(workspace(safeRoom,safeTool));revalidatePath('/brain/connections');revalidatePath('/graph');
}

export async function deleteUpgradeRelationAction(id:string,room:string,tool:string){
  const userId=await requireUserId(),safeRoom=safeKey(room),safeTool=safeKey(tool),safeId=String(id).slice(0,120);if(!safeRoom||!safeTool||!safeId)return;
  const [deleted]=await db.delete(entityRelations).where(and(eq(entityRelations.id,safeId),eq(entityRelations.userId,userId))).returning();
  if(deleted)await db.insert(auditEvents).values({userId,action:'entity_relation_deleted',entityType:'entity_relation',entityId:safeId,details:{room:safeRoom,tool:safeTool}});
  revalidatePath(workspace(safeRoom,safeTool));revalidatePath('/brain/connections');revalidatePath('/graph');
}
