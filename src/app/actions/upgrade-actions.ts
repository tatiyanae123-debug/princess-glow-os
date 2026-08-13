'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals, entityRelations, focusSessions } from '@/db/schema';
import { ROOM_UPGRADES } from '@/lib/intelligence/room-upgrades';

const clean=(v:FormDataEntryValue|null,n=2000)=>String(v??'').trim().slice(0,n);
async function user(){const s=await auth();if(!s?.user?.id)redirect('/sign-in');return s.user.id;}
function valid(room:string,id:string){const t=ROOM_UPGRADES[room]?.find(x=>x.id===id);if(!t)throw new Error('Unknown Glow upgrade.');return t;}

export async function createUpgradeProposalAction(formData:FormData){
  const userId=await user(),room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100),tool=valid(room,toolId);
  const summary=clean(formData.get('summary'),1200)||tool.label,reason=clean(formData.get('reason'),2400)||`Created from ${room} · ${tool.label}`;
  await db.insert(aiProposals).values({userId,intent:`room_upgrade:${room}:${toolId}`,summary,reason,confidence:1,reversible:true,status:'pending',payload:{room,toolId,source:'room_upgrade'}});
  revalidatePath('/concierge');revalidatePath(`/upgrade/${room}/${toolId}`);
}

export async function startUpgradeFocusAction(formData:FormData){
  const userId=await user(),room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100),tool=valid(room,toolId);
  const raw=Number(clean(formData.get('plannedMinutes'),10)),plannedMinutes=Number.isFinite(raw)&&raw>0?Math.min(Math.round(raw),480):25;
  await db.insert(focusSessions).values({userId,entityType:'room_upgrade',entityId:`${room}:${toolId}`,title:tool.label,plannedMinutes,completed:false});
  revalidatePath('/focus');revalidatePath(`/upgrade/${room}/${toolId}`);
}

export async function createUpgradeRelationAction(formData:FormData){
  const userId=await user(),room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100);valid(room,toolId);
  const fromType=clean(formData.get('fromType'),80),fromId=clean(formData.get('fromId'),160),toType=clean(formData.get('toType'),80),toId=clean(formData.get('toId'),160),relation=clean(formData.get('relation'),80)||'related_to';
  if(!fromType||!fromId||!toType||!toId)throw new Error('Choose both sides of the connection.');
  await db.insert(entityRelations).values({userId,fromType,fromId,relation,toType,toId,weight:1,metadata:{room,toolId,source:'room_upgrade'}});
  revalidatePath('/graph');revalidatePath('/brain/connections');revalidatePath(`/upgrade/${room}/${toolId}`);
}
