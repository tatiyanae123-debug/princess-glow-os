import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { HabitsRouteExperience } from '@/components/habits/habits-route-experience';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';

export const dynamic = 'force-dynamic';

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await ensurePersonalOsInstalled(session.user.id);
  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 365);
  const [habits, logs] = await Promise.all([
    getHabitsByUser(session.user.id),
    getHabitLogsForUser(session.user.id, dateKey(start), dateKey(now)),
  ]);

  return (
    <AppShell>
      <HabitsRouteExperience initialHabits={habits} initialLogs={logs} />
    </AppShell>
  );
}
