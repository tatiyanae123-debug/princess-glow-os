import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions } from '@/db/schema/adaptive-os';
import { AppShell } from '@/components/app-shell';
import { EveningDebriefExperience } from '@/components/briefings/evening-debrief-experience';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getHabitsByUser, getHabitLogsForUser } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { getNotesByUser } from '@/lib/data/notes';
import { getBriefings } from '@/lib/data/completion-v1';
export const dynamic='force-dynamic';
const dateKey=(d:Date)=>d.toISOString().slice(0,10);
export default async function EveningDebriefPage(){const s=await auth();if(!s?.user?.id)redirect('/sign-in');const id=s.user.id,now=new Date(),ago=new Date(now);ago.setDate(ago.getDate()-365);const[tasks,events,habits,habitLogs,routines,wellnessEntries,financeEntries,medications,supplements,notes,briefings,focus]=await Promise.all([getTasksByUser(id),getCalendarEventsByUser(id),getHabitsByUser(id),getHabitLogsForUser(id,dateKey(ago),dateKey(now)),getRoutinesByUser(id),getWellnessEntriesByUser(id),getFinanceEntriesByUser(id),getMedicationsByUser(id),getSupplementsByUser(id),getNotesByUser(id),getBriefings(id),db.select().from(focusSessions).where(eq(focusSessions.userId,id)).orderBy(desc(focusSessions.startedAt)).limit(20).catch(()=>[])]);return <AppShell><div className="evening-debrief-reference"><EveningDebriefExperience tasks={tasks} events={events} habits={habits} habitLogs={habitLogs} routines={routines} wellnessEntries={wellnessEntries} financeEntries={financeEntries} medications={medications} supplements={supplements} notes={notes} briefings={briefings} focusSessions={focus}/></div></AppShell>}
