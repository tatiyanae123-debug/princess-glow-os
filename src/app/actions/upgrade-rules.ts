'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {db} from '@/db';
import {personalRules} from '@/db/schema';
import {ROOM_UPGRADES} from '@/lib/intelligence/room-upgrades';
const clean=(v:FormDataEntryValue|null,n=3000)=>String(v??'').trim().slice(0,n);
export async function createUpgradeRuleAction(formData:FormData){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100),tool=ROOM_UPGRADES[room]?.find(x=>x.id===toolId);if(!tool)throw new Error('Unknown Glow upgrade.');
 const ruleText=clean(formData.get('ruleText'));if(!ruleText)throw new Error('Describe the rule first.');
 await db.insert(personalRules).values({userId:s.user.id,title:clean(formData.get('title'),240)||tool.label,ruleType:`upgrade:${room}:${toolId}`,condition:{text:ruleText},effect:{mode:'guidance'},priority:50,enabled:true,source:'user'});
 revalidatePath('/rules');revalidatePath(`/upgrade/${room}/${toolId}`);
}
