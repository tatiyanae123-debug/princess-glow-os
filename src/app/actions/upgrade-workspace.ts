'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { glowEntities } from '@/db/schema';
import { ROOM_UPGRADES } from '@/lib/intelligence/room-upgrades';

const clean=(v:FormDataEntryValue|null,n=4000)=>String(v??'').trim().slice(0,n);
function getTool(room:string,id:string){const t=ROOM_UPGRADES[room]?.find(x=>x.id===id);if(!t)throw new Error('Unknown Glow upgrade.');return t;}

export async function saveUpgradeWorkspaceAction(formData:FormData){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id,room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100),tool=getTool(room,toolId);
  const title=clean(formData.get('title'),240)||tool.label,notes=clean(formData.get('notes'),8000),status=clean(formData.get('status'),40)||'active',sourceId=`${room}:${toolId}`;
  const existing=await db.query.glowEntities.findFirst({where:and(eq(glowEntities.userId,userId),eq(glowEntities.sourceTable,'room_upgrade'),eq(glowEntities.sourceId,sourceId))});
  const values={title,summary:notes.slice(0,800)||null,searchableText:`${title} ${notes}`.trim(),status,metadata:{room,toolId,notes,upgradeLabel:tool.label},updatedAt:new Date()};
  if(existing)await db.update(glowEntities).set(values).where(and(eq(glowEntities.id,existing.id),eq(glowEntities.userId,userId)));
  else await db.insert(glowEntities).values({userId,entityType:'upgrade_workspace',sourceTable:'room_upgrade',sourceId,...values});
  revalidatePath(`/upgrade/${room}/${toolId}`);revalidatePath('/search');revalidatePath('/graph');
}
