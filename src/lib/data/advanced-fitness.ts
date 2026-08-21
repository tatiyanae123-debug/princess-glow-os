import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import { fitnessSessions } from '@/db/schema/completion-v1';
import { workoutExercises, workoutPrograms, workoutReadiness, workoutRuns, workoutSetLogs, workoutTemplates } from '@/db/schema/advanced-fitness';

const DEFAULTS = [
  { name:'Lower Body Strength', category:'strength', equipment:'dumbbells', fullMinutes:45, quickMinutes:25, minimumMinutes:10, muscles:['glutes','quads','hamstrings'], exercises:[['Goblet Squat',3,10,90,'quads'],['Romanian Deadlift',3,10,90,'hamstrings'],['Hip Thrust',3,12,90,'glutes'],['Reverse Lunge',3,10,75,'glutes'],['Calf Raise',2,15,45,'calves']] },
  { name:'Upper Body Strength', category:'strength', equipment:'dumbbells', fullMinutes:35, quickMinutes:20, minimumMinutes:10, muscles:['back','shoulders','arms'], exercises:[['Dumbbell Row',3,10,75,'back'],['Shoulder Press',3,10,75,'shoulders'],['Chest Press',3,10,75,'chest'],['Biceps Curl',2,12,45,'arms'],['Triceps Extension',2,12,45,'arms']] },
  { name:'Pilates Core', category:'pilates', equipment:'bodyweight', fullMinutes:25, quickMinutes:15, minimumMinutes:8, muscles:['core'], exercises:[['Dead Bug',3,10,30,'core'],['Bird Dog',3,10,30,'core'],['Glute Bridge',3,12,30,'glutes'],['Side Plank',2,8,30,'core']] },
  { name:'Mobility Flow', category:'mobility', equipment:'bodyweight', fullMinutes:18, quickMinutes:12, minimumMinutes:5, muscles:['core','hips','back'], exercises:[['Cat Cow',2,8,15,'back'],['90/90 Hip Switch',2,10,20,'hips'],['World’s Greatest Stretch',2,6,20,'hips'],['Child’s Pose Breathing',1,8,0,'back']] },
];

export async function ensureWorkoutTemplates(userId:string) {
  const existing=await db.select().from(workoutTemplates).where(and(eq(workoutTemplates.userId,userId),eq(workoutTemplates.archived,false))).orderBy(asc(workoutTemplates.createdAt));
  if(existing.length) return existing;
  for(const item of DEFAULTS){
    const [template]=await db.insert(workoutTemplates).values({userId,name:item.name,category:item.category,equipment:item.equipment,fullMinutes:item.fullMinutes,quickMinutes:item.quickMinutes,minimumMinutes:item.minimumMinutes,primaryMuscles:item.muscles,lowImpact:item.category==='mobility'||item.category==='pilates'}).returning();
    await db.insert(workoutExercises).values(item.exercises.map((x,i)=>({userId,templateId:template.id,name:String(x[0]),position:i,sets:Number(x[1]),reps:Number(x[2]),restSeconds:Number(x[3]),muscleGroup:String(x[4]),equipment:item.equipment,formCue:i===0?'Move slowly and keep control.':null,substitutions:[]})));
  }
  return db.select().from(workoutTemplates).where(and(eq(workoutTemplates.userId,userId),eq(workoutTemplates.archived,false))).orderBy(asc(workoutTemplates.createdAt));
}
export async function getWorkoutExercises(userId:string){ return db.select().from(workoutExercises).where(eq(workoutExercises.userId,userId)).orderBy(asc(workoutExercises.position)); }
export async function getWorkoutRuns(userId:string){ return db.select().from(workoutRuns).where(eq(workoutRuns.userId,userId)).orderBy(desc(workoutRuns.startedAt)).limit(50); }
export async function getWorkoutSetLogs(userId:string){ return db.select().from(workoutSetLogs).where(eq(workoutSetLogs.userId,userId)).orderBy(desc(workoutSetLogs.completedAt)).limit(500); }
export async function getWorkoutPrograms(userId:string){ return db.select().from(workoutPrograms).where(eq(workoutPrograms.userId,userId)).orderBy(desc(workoutPrograms.updatedAt)); }
export async function getReadiness(userId:string,dateKey:string){ const [row]=await db.select().from(workoutReadiness).where(and(eq(workoutReadiness.userId,userId),eq(workoutReadiness.dateKey,dateKey))).limit(1); return row??null; }
export async function saveReadiness(userId:string,dateKey:string,values:{energy:number;sleep:number;soreness:number;stress:number;availableMinutes:number;equipment:string;locationMode:string}){
  const existing=await getReadiness(userId,dateKey);
  if(existing){ const [row]=await db.update(workoutReadiness).set({...values,updatedAt:new Date()}).where(eq(workoutReadiness.id,existing.id)).returning();return row; }
  const [row]=await db.insert(workoutReadiness).values({userId,dateKey,...values}).returning();return row;
}
export async function startWorkoutRun(userId:string,input:{templateId:string;version:'full'|'quick'|'minimum';energy:number;soreness:number;equipment:string}){
  const [template]=await db.select().from(workoutTemplates).where(and(eq(workoutTemplates.id,input.templateId),eq(workoutTemplates.userId,userId))).limit(1); if(!template) return null;
  const active=await db.select().from(workoutRuns).where(and(eq(workoutRuns.userId,userId),eq(workoutRuns.templateId,template.id),eq(workoutRuns.status,'active'))).limit(1); if(active[0]) return active[0];
  const readiness=input.soreness>=4||input.energy<=2?'recovery':input.soreness===3||input.energy===3?'moderate':'ready';
  const [row]=await db.insert(workoutRuns).values({userId,templateId:template.id,name:template.name,version:input.version,status:'active',energyBefore:input.energy,sorenessBefore:input.soreness,readiness,equipment:input.equipment}).returning(); return row;
}
export async function logWorkoutSet(userId:string,input:{runId:string;exerciseId:string|null;exerciseName:string;setNumber:number;reps?:number;seconds?:number;weightLb?:number;rpe?:number;skipped?:boolean}){
  const [run]=await db.select().from(workoutRuns).where(and(eq(workoutRuns.id,input.runId),eq(workoutRuns.userId,userId))).limit(1); if(!run||run.status!=='active') return null;
  const [row]=await db.insert(workoutSetLogs).values({userId,runId:run.id,exerciseId:input.exerciseId,exerciseName:input.exerciseName,setNumber:input.setNumber,reps:input.reps,seconds:input.seconds,weightLb:input.weightLb,rpe:input.rpe,skipped:input.skipped??false,completed:!(input.skipped??false)}).onConflictDoUpdate({target:[workoutSetLogs.runId,workoutSetLogs.exerciseName,workoutSetLogs.setNumber],set:{reps:input.reps,seconds:input.seconds,weightLb:input.weightLb,rpe:input.rpe,skipped:input.skipped??false,completed:!(input.skipped??false),completedAt:new Date()}}).returning(); return row;
}
export async function advanceWorkout(userId:string,runId:string,index:number,activeSeconds:number){ const [row]=await db.update(workoutRuns).set({currentExerciseIndex:Math.max(0,index),activeSeconds:Math.max(0,activeSeconds)}).where(and(eq(workoutRuns.id,runId),eq(workoutRuns.userId,userId))).returning(); return row??null; }
export async function finishWorkoutRun(userId:string,runId:string,input:{activeSeconds:number;feelingAfter?:string;notes?:string}){
  const [run]=await db.select().from(workoutRuns).where(and(eq(workoutRuns.id,runId),eq(workoutRuns.userId,userId))).limit(1); if(!run) return null; if(run.status==='complete') return run;
  const [template]=run.templateId?await db.select().from(workoutTemplates).where(eq(workoutTemplates.id,run.templateId)).limit(1):[null];
  const [session]=await db.insert(fitnessSessions).values({userId,workoutType:run.name,occurredAt:new Date(),durationMinutes:Math.max(1,Math.round(input.activeSeconds/60)),energy:run.energyBefore,soreness:run.sorenessBefore,equipment:run.equipment,notes:input.notes??`Completed ${run.version} version in Glow Workout Studio.`}).returning();
  const [updated]=await db.update(workoutRuns).set({status:'complete',completedAt:new Date(),activeSeconds:Math.max(1,input.activeSeconds),feelingAfter:input.feelingAfter??null,notes:input.notes??null,sessionId:session.id,currentExerciseIndex:999}).where(eq(workoutRuns.id,run.id)).returning();
  return {...updated,session,template};
}
export async function getExerciseHistory(userId:string,name:string){ return db.select().from(workoutSetLogs).where(and(eq(workoutSetLogs.userId,userId),eq(workoutSetLogs.exerciseName,name),eq(workoutSetLogs.completed,true))).orderBy(desc(workoutSetLogs.completedAt)).limit(20); }
export async function getRecentFitnessSessions(userId:string){ const since=new Date();since.setDate(since.getDate()-35);return db.select().from(fitnessSessions).where(and(eq(fitnessSessions.userId,userId),gte(fitnessSessions.occurredAt,since))).orderBy(desc(fitnessSessions.occurredAt)); }
