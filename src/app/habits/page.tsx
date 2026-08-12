import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { HabitManager } from '@/components/habits/habit-manager';
import { getHabitLogsByHabit, getHabitsByUser } from '@/lib/data/habits';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const habits = await getHabitsByUser(session.user.id);
  const logs = (await Promise.all(habits.map((habit) => getHabitLogsByHabit(habit.id, session.user!.id!)))).flat();

  return (
    <AppShell>
      <HabitManager initialHabits={habits} initialLogs={logs} />
    </AppShell>
  );
}
