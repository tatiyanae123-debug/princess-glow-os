'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/auth';
import * as data from '@/lib/data/advanced-fitness';

async function requireUser(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
function refresh(){['/fitness','/habits','/routines','/dashboard','/today','/tomorrow','/calendar','/briefings/morning','/briefings/evening'].forEach(revalidatePath);}

export async function saveWorkoutReadinessAction(raw:unknown){
 const userId=await requireUser();
 const parsed=z.object({dateKey:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),energy:z.number().int().min(1).max(5),sleep:z.number().int().min(1).max(5),soreness:z.number().int().min(1).max(5),stress:z.number().int().min(1).max(5),availableMinutes:z.number().int().min(5).max(180),equipment:z.string().min(1).max(80),locationMode:z.string().min(1).max(40)}).safeParse(raw);
 if(!parsed.success)return{error:'Glow could not save readiness.'};
 const {dateKey,...values}=parsed.data;const row=await data.saveReadiness(userId,dateKey,values);revalidatePath('/fitness');return{data:row};
}
export async function startWorkoutRunAction(raw:unknown){
 const userId=await requireUser();const parsed=z.object({templateId:z.string().min(1),version:z.enum(['full','quick','minimum']),energy:z.number().int().min(1).max(5),soreness:z.number().int().min(1).max(5),equipment:z.string().min(1).max(80)}).safeParse(raw);if(!parsed.success)return{error:'Glow could not start that workout.'};const row=await data.startWorkoutRun(userId,parsed.data);if(!row)return{error:'That workout template is unavailable.'};revalidatePath('/fitness');return{data:row};
}
export async function logWorkoutSetAction(raw:unknown){
 const userId=await requireUser();const parsed=z.object({runId:z.string().min(1),exerciseId:z.string().nullable(),exerciseName:z.string().min(1).max(160),setNumber:z.number().int().min(1).max(99),reps:z.number().int().min(0).max(999).optional(),seconds:z.number().int().min(0).max(7200).optional(),weightLb:z.number().min(0).max(3000).optional(),rpe:z.number().int().min(1).max(10).optional(),skipped:z.boolean().optional()}).safeParse(raw);if(!parsed.success)return{error:'Glow could not save that set.'};const row=await data.logWorkoutSet(userId,parsed.data);if(!row)return{error:'That workout is no longer active.'};revalidatePath('/fitness');return{data:row};
}
export async function advanceWorkoutAction(runId:string,index:number,activeSeconds:number){const userId=await requireUser();const row=await data.advanceWorkout(userId,runId,index,activeSeconds);revalidatePath('/fitness');return row?{data:row}:{error:'Workout run unavailable.'};}
export async function finishWorkoutRunAction(raw:unknown){
 const userId=await requireUser();const parsed=z.object({runId:z.string().min(1),activeSeconds:z.number().int().min(1).max(86400),feelingAfter:z.string().max(40).optional(),notes:z.string().max(1200).optional()}).safeParse(raw);if(!parsed.success)return{error:'Glow could not finish that workout.'};const row=await data.finishWorkoutRun(userId,parsed.data.runId,{activeSeconds:parsed.data.activeSeconds,feelingAfter:parsed.data.feelingAfter,notes:parsed.data.notes});if(!row)return{error:'Workout run unavailable.'};refresh();return{data:row};
}
