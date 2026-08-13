'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { glowEntities } from '@/db/schema/interconnected-os';
import { auditEvents } from '@/db/schema/completion-v1';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
const safeKey=(raw:string)=>/^[a-z0-9][a-z0-9_-]{0,79}$/i.test(raw)?raw:'';
const value=(fd:FormData,key:string,max=5000)=>String(fd.get(key)??'').trim().slice(0,max);
const workspace=(room:string,tool:string)=>`/upgrades/${encodeURIComponent(room)}/${encodeURIComponent(tool)}`;

function metadataFromForm(fd:FormData){
  const out:Record<string,string|number|boolean>={};let count=0;
  for(const [key,raw] of fd.entries()){
    if(!key.startsWith('meta:')||count>=30)continue;
    const field=safeKey(key.slice(5));if(!field)continue;
    const text=String(raw).trim().slice(0,8000);if(!text)continue;
    const numeric=Number(text);
    out[field]=text==='on'?true:Number.isFinite(numeric)&&/^-?\d+(\.\d+)?$/.test(text)?numeric:text;
    count++;
  }
  return out;
}

export async function createUpgradeObjectAction(room:string,tool:string,entityType:string,fd:FormData){
  const userId=await requireUserId(),safeRoom=safeKey(room),safeTool=safeKey(tool),safeType=safeKey(entityType),title=value(fd,'title',300);
  if(!safeRoom||!safeTool||!safeType||!title)return;
  const summary=value(fd,'summary')||null,metadata=metadataFromForm(fd);
  const [created]=await db.insert(glowEntities).values({userId,entityType:safeType,sourceTable:'glow_upgrade',title,summary,searchableText:[title,summary,...Object.values(metadata).map(String)].filter(Boolean).join(' '),metadata:{...metadata,room:safeRoom,tool:safeTool,createdFrom:'room_upgrade'}}).returning();
  if(created)await db.insert(auditEvents).values({userId,action:'upgrade_object_created',entityType:safeType,entityId:created.id,details:{room:safeRoom,tool:safeTool,title}});
  revalidatePath(workspace(safeRoom,safeTool));
}

export async function updateUpgradeObjectAction(id:string,room:string,tool:string,fd:FormData){
  const userId=await requireUserId(),safeRoom=safeKey(room),safeTool=safeKey(tool),safeId=String(id).slice(0,120),title=value(fd,'title',300);
  if(!safeRoom||!safeTool||!safeId||!title)return;
  const [existing]=await db.select().from(glowEntities).where(and(eq(glowEntities.id,safeId),eq(glowEntities.userId,userId))).limit(1);if(!existing)return;
  const summary=value(fd,'summary')||null,metadata={...(existing.metadata??{}),...metadataFromForm(fd),room:safeRoom,tool:safeTool,updatedFrom:'room_upgrade'};
  await db.update(glowEntities).set({title,summary,searchableText:[title,summary,...Object.values(metadata).map(String)].filter(Boolean).join(' '),metadata,updatedAt:new Date()}).where(and(eq(glowEntities.id,safeId),eq(glowEntities.userId,userId)));
  await db.insert(auditEvents).values({userId,action:'upgrade_object_updated',entityType:existing.entityType,entityId:safeId,details:{room:safeRoom,tool:safeTool,title}});
  revalidatePath(workspace(safeRoom,safeTool));
}

export async function archiveUpgradeObjectAction(id:string,room:string,tool:string){
  const userId=await requireUserId(),safeRoom=safeKey(room),safeTool=safeKey(tool),safeId=String(id).slice(0,120);if(!safeRoom||!safeTool||!safeId)return;
  const [updated]=await db.update(glowEntities).set({status:'archived',updatedAt:new Date()}).where(and(eq(glowEntities.id,safeId),eq(glowEntities.userId,userId))).returning();
  if(updated)await db.insert(auditEvents).values({userId,action:'upgrade_object_archived',entityType:updated.entityType,entityId:safeId,details:{room:safeRoom,tool:safeTool}});
  revalidatePath(workspace(safeRoom,safeTool));
}
