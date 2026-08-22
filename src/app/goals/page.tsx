import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GoalIntelligenceStudio } from '@/components/goals/goal-intelligence-studio';
import { getGoalsByUser } from '@/lib/data/goals';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';

export const dynamic='force-dynamic';

function localDateKey(date:Date){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
 const map=Object.fromEntries(parts.map(part=>[part.type,part.value]));
 return `${map.year}-${map.month}-${map.day}`;
}

export default async function GoalsPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const userId=session.user.id;
 const now=new Date();
 const today=localDateKey(now);
 const [goals,allTasks,allEvents,projects,habits,habitLogs]=await Promise.all([
  getGoalsByUser(userId),
  getTasksByUser(userId),
  getCalendarEventsByUser(userId),
  getProjectsByUser(userId),
  getHabitsByUser(userId),
  getHabitLogsForUserByDate(userId,today),
 ]);
 const tasks=allTasks.filter(task=>task.status!=='done'&&task.status!=='cancelled');
 const events=allEvents.filter(event=>(event.endAt??event.startAt).getTime()>=now.getTime()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,40);
 return <AppShell><GoalIntelligenceStudio goals={goals} tasks={tasks} events={events} projects={projects} habits={habits} habitLogs={habitLogs} nowIso={now.toISOString()}/></AppShell>;
}
