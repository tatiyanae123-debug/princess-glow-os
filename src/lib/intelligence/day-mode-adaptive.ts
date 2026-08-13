import 'server-only';
import {and,eq} from 'drizzle-orm';
import {db} from '@/db';
import {lifeModes} from '@/db/schema/adaptive-os';
import type {GlowDayMode} from '@/lib/day-mode';

const ADAPTIVE_SLUG:Record<GlowDayMode,string>={
 'most-productive':'deep-work',
 productive:'normal',
 'bare-minimum':'low-energy',
 'clear-schedule':'sick',
};

const MODE_CONFIG:Record<GlowDayMode,{name:string;description:string;maxMajorTasks:number;energyTarget:number;workoutPolicy:string;routinePolicy:string;schedulingPolicy:string}>={
 'most-productive':{name:'Most Productive',description:'High-capacity day with more focused output and useful extras.',maxMajorTasks:5,energyTarget:8,workoutPolicy:'normal',routinePolicy:'full',schedulingPolicy:'max-output'},
 productive:{name:'Productive',description:'Balanced default day with important work and breathing room.',maxMajorTasks:3,energyTarget:6,workoutPolicy:'normal',routinePolicy:'full',schedulingPolicy:'balanced'},
 'bare-minimum':{name:'Bare Minimum',description:'Reduce the day to essential care and the smallest critical workload.',maxMajorTasks:1,energyTarget:3,workoutPolicy:'recovery',routinePolicy:'essentials',schedulingPolicy:'light'},
 'clear-schedule':{name:'Clear Schedule',description:'Create no optional pressure and protect only critical commitments.',maxMajorTasks:0,energyTarget:1,workoutPolicy:'rest',routinePolicy:'minimum',schedulingPolicy:'critical-only'},
};

export async function ensureV3DayModes(userId:string){
 const rows=await db.select().from(lifeModes).where(eq(lifeModes.userId,userId));
 const canonicalSlugs=new Set(Object.values(ADAPTIVE_SLUG));
 const activeCanonical=rows.find(row=>row.isActive&&canonicalSlugs.has(row.slug));
 for(const mode of Object.keys(MODE_CONFIG) as GlowDayMode[]){
  const slug=ADAPTIVE_SLUG[mode];const config=MODE_CONFIG[mode];const existing=rows.find(row=>row.slug===slug);
  if(existing)await db.update(lifeModes).set({...config,updatedAt:new Date()}).where(and(eq(lifeModes.id,existing.id),eq(lifeModes.userId,userId)));
  else await db.insert(lifeModes).values({userId,slug,...config,isActive:false});
 }
 if(!activeCanonical){await db.update(lifeModes).set({isActive:false,updatedAt:new Date()}).where(eq(lifeModes.userId,userId));await db.update(lifeModes).set({isActive:true,updatedAt:new Date()}).where(and(eq(lifeModes.userId,userId),eq(lifeModes.slug,ADAPTIVE_SLUG.productive)));}
}

export async function setV3DayMode(userId:string,mode:GlowDayMode){
 await ensureV3DayModes(userId);
 await db.update(lifeModes).set({isActive:false,updatedAt:new Date()}).where(eq(lifeModes.userId,userId));
 await db.update(lifeModes).set({isActive:true,updatedAt:new Date()}).where(and(eq(lifeModes.userId,userId),eq(lifeModes.slug,ADAPTIVE_SLUG[mode])));
}

export async function getV3DayMode(userId:string):Promise<GlowDayMode>{
 await ensureV3DayModes(userId);
 const rows=await db.select().from(lifeModes).where(and(eq(lifeModes.userId,userId),eq(lifeModes.isActive,true))).limit(1);
 const slug=rows[0]?.slug;
 return (Object.keys(ADAPTIVE_SLUG) as GlowDayMode[]).find(mode=>ADAPTIVE_SLUG[mode]===slug)??'productive';
}
