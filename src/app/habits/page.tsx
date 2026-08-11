import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { HabitManager } from '@/components/habits/habit-manager';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';

export const dynamic = 'force-dynamic';

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 365);
  const [habits, logs] = await Promise.all([
    getHabitsByUser(session.user.id),
    getHabitLogsForUser(session.user.id, dateKey(start), dateKey(now)),
  ]);

  return (
    <AppShell>
      <SectionPage eyebrow="Habits" title="Tiny rituals that compound" description="See your real streaks, history and patterns, then protect the smallest next repeat.">
        <HabitManager initialHabits={habits} initialLogs={logs} />
      </SectionPage>
    </AppShell>
  );
}
