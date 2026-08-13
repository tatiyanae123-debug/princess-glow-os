'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {db} from '@/db';
import {dayReviews} from '@/db/schema';
import {ROOM_UPGRADES} from '@/lib/intelligence/room-upgrades';
const clean=(v:FormDataEntryValue|null,n=4000)=>String(v??'').trim().slice(0,n);
export async function saveUpgradeReviewAction(formData:FormData){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const room=clean(formData.get('room'),80),toolId=clean(formData.get('toolId'),100),tool=ROOM_UPGRADES[room]?.find(x=>x.id===toolId);if(!tool)throw new Error('Unknown Glow upgrade.');
 const dateKey=clean(formData.get('dateKey'),20)||new Date().toISOString().slice(0,10),wins=clean(formData.get('wins'),2000),moved=clean(formData.get('moved'),2000),reflection=clean(formData.get('reflection'));
 await db.insert(dayReviews).values({userId:s.user.id,dateKey,completedSummary:wins||null,movedSummary:moved||null,memoryNote:reflection||tool.label,tomorrowTopThree:[]});
 revalidatePath('/briefings/evening');revalidatePath(`/upgrade/${room}/${toolId}`);
}
