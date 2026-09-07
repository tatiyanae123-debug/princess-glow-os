import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanHabitsV2, type PlanHabitV2, type PlanSettingSnapshot } from '@/components/plan/plan-reference-v2';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';
import { buildHabitInsights } from '@/lib/habits/insights';
import { getPlanObjectSettingsByPrefix } from '@/lib/plan/object-settings';

export const dynamic = 'force-dynamic';

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const now = new Date();
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - 365);
  const [habits, logs, settingsMap] = await Promise.all([
    getHabitsByUser(userId),
    getHabitLogsForUser(userId, dateKey(start), dateKey(now)),
    getPlanObjectSettingsByPrefix(userId, 'plan:habit:'),
  ]);
  const insights = buildHabitInsights(habits, logs, now);
  const weekStart = new Date(now.getTime() - 6 * 86_400_000);
  weekStart.setHours(0, 0, 0, 0);

  const items: PlanHabitV2[] = habits.filter((habit) => !habit.archived).map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    targetCount: habit.targetCount,
    rhythm: insights.get(habit.id)?.completionRate ?? 0,
    streak: insights.get(habit.id)?.currentStreak ?? 0,
    icon: habit.icon,
    color: habit.color,
    history: logs
      .filter((log) => log.habitId === habit.id && new Date(`${log.loggedDate}T12:00:00`).getTime() >= weekStart.getTime())
      .map((log) => ({ date: log.loggedDate, count: log.count, target: habit.targetCount })),
  }));
  const settings: PlanSettingSnapshot = Object.fromEntries(Array.from(settingsMap.entries()).map(([key, row]) => [key, row.preferences]));

  return <PlanHabitsV2 habits={items} settings={settings} />;
}
