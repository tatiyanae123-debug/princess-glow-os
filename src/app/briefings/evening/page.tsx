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

export const dynamic = 'force-dynamic';

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EveningDebriefPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const now = new Date();
  const yearAgo = new Date(now);
  yearAgo.setDate(yearAgo.getDate() - 365);

  const [tasks, events, habits, habitLogs, routines, wellnessEntries, financeEntries, medications, supplements, notes, briefings, focusToday] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUser(userId, dateKey(yearAgo), dateKey(now)),
    getRoutinesByUser(userId),
    getWellnessEntriesByUser(userId),
    getFinanceEntriesByUser(userId),
    getMedicationsByUser(userId),
    getSupplementsByUser(userId),
    getNotesByUser(userId),
    getBriefings(userId),
    db.select().from(focusSessions).where(eq(focusSessions.userId, userId)).orderBy(desc(focusSessions.startedAt)).limit(20).catch(() => []),
  ]);

  return (
    <AppShell>
      <EveningDebriefExperience
        tasks={tasks}
        events={events}
        habits={habits}
        habitLogs={habitLogs}
        routines={routines}
        wellnessEntries={wellnessEntries}
        financeEntries={financeEntries}
        medications={medications}
        supplements={supplements}
        notes={notes}
        briefings={briefings}
        focusSessions={focusToday}
      />
    </AppShell>
  );
}
