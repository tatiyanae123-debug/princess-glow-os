import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TodayLivingCenter } from '@/components/today-living-center';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { buildCrossSystemSnapshot } from '@/lib/intelligence/cross-system';

export const dynamic = 'force-dynamic';

const priorityWeight: Record<string,number>={urgent:100,high:80,medium:55,low:30};

function levelToNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const normalized=value.toLowerCase();
  const scale: Record<string,number>={
    exhausted:3, very_low:3, low:4, okay:5, neutral:5, medium:6,
    good:7, high:8, great:9, excellent:9,
  };
  return scale[normalized] ?? null;
}

function dayStart(date: Date) {
  const value=new Date(date);
  value.setHours(0,0,0,0);
  return value;
}

function taskDueLabel(dueDate: Date | null, now: Date) {
  if (!dueDate) return null;
  const due=dayStart(dueDate).getTime();
  const today=dayStart(now).getTime();
  const diff=Math.round((due-today)/86400000);
  if(diff<0)return 'Overdue';
  if(diff===0)return 'Today';
  if(diff===1)return 'Tomorrow';
  return dueDate.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}

export default async function TodayPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const userId=session.user.id;
  const now=new Date();
  const [tasks,wellnessEntries,beautyRoutines,events,snapshot]=await Promise.all([
    getTasksByUser(userId),
    getWellnessEntriesByUser(userId),
    getBeautyRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
    buildCrossSystemSnapshot(userId,'today',now),
  ]);

  const open=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled');
  const ranked=[...open].sort((a,b)=>{
    const aDue=a.dueDate?Math.max(-40,30-Math.floor((a.dueDate.getTime()-now.getTime())/86400000)*5):0;
    const bDue=b.dueDate?Math.max(-40,30-Math.floor((b.dueDate.getTime()-now.getTime())/86400000)*5):0;
    return (priorityWeight[b.priority]??0)+bDue-((priorityWeight[a.priority]??0)+aDue);
  });

  const todaysEvents=events
    .filter(e=>e.startAt.toDateString()===now.toDateString())
    .sort((a,b)=>{
      if(a.allDay&&!b.allDay)return -1;
      if(!a.allDay&&b.allDay)return 1;
      return a.startAt.getTime()-b.startAt.getTime();
    });

  const latestWellness=wellnessEntries[0]??null;
  const routines=beautyRoutines
    .filter(r=>r.timeOfDay==='morning'||r.timeOfDay==='evening'||r.timeOfDay==='night')
    .slice(0,5);

  return <TodayLivingCenter
    tasks={ranked.slice(0,8).map(t=>({
      id:t.id,
      title:t.title,
      priority:t.priority,
      dueLabel:taskDueLabel(t.dueDate,now),
    }))}
    events={todaysEvents.slice(0,8).map(e=>({
      id:e.id,
      title:e.title,
      timeLabel:e.allDay?'All day':e.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}),
      location:e.location,
    }))}
    routines={routines.map(r=>({id:r.id,name:r.name,timeOfDay:r.timeOfDay}))}
    energy={levelToNumber(latestWellness?.energy)}
    mood={levelToNumber(latestWellness?.mood)}
    sleepHours={latestWellness?.sleepHours??null}
    glowMessage={snapshot.message}
  />;
}
