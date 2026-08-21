import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { AdaptiveWorkoutStudio } from '@/components/fitness/adaptive-workout-studio';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import {
  ensureWorkoutTemplates,
  getReadiness,
  getRecentFitnessSessions,
  getWorkoutExercises,
  getWorkoutPrograms,
  getWorkoutRuns,
  getWorkoutSetLogs,
} from '@/lib/data/advanced-fitness';

export const dynamic='force-dynamic';

function localDateKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export default async function FitnessPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const templates=await ensureWorkoutTemplates(userId);
  const [exercises,runs,setLogs,readiness,sessions,programs,calendarEvents]=await Promise.all([
    getWorkoutExercises(userId),
    getWorkoutRuns(userId),
    getWorkoutSetLogs(userId),
    getReadiness(userId,localDateKey()),
    getRecentFitnessSessions(userId),
    getWorkoutPrograms(userId),
    getCalendarEventsByUser(userId),
  ]);
  return <AppShell><AdaptiveWorkoutStudio templates={templates} exercises={exercises} runs={runs} setLogs={setLogs} readiness={readiness} sessions={sessions} programs={programs} calendarEvents={calendarEvents}/></AppShell>;
}
