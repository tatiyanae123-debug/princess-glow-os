import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanHabitsRoom, type PlanHabitItem } from '@/components/plan/plan-reference-rooms';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';
import { buildHabitInsights } from '@/lib/habits/insights';

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
  const insights = buildHabitInsights(habits, logs, now);
  const items: PlanHabitItem[] = habits.filter((habit) => !habit.archived).map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    targetCount: habit.targetCount,
    rhythm: insights.get(habit.id)?.completionRate ?? 0,
    streak: insights.get(habit.id)?.currentStreak ?? 0,
  }));

  return <PlanHabitsRoom habits={items} />;
}
