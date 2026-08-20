import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch8InterviewModeView } from '@/components/batch8/system-special-reference';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic='force-dynamic';
export default async function InterviewModePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [events,tasks]=await Promise.all([getCalendarEventsByUser(session.user.id),getTasksByUser(session.user.id)]);
  const now=Date.now();
  const interviewEvents=events.filter(e=>{
    const text=`${e.title} ${e.description??''} ${e.location??''}`.toLowerCase();
    const ends=(e.endAt??e.startAt).getTime();
    return ends>=now&&text.includes('interview');
  }).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,4);
  const prepTasks=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled'&&['interview','company','resume','portfolio','question','prepare'].some(w=>`${t.title} ${t.description??''}`.toLowerCase().includes(w))).slice(0,8);
  return <AppShell><Batch8InterviewModeView events={interviewEvents} tasks={prepTasks}/></AppShell>;
}
