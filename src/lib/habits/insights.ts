import type { Habit, HabitLog } from '@/lib/types';

export type HabitInsight = {
  habitId: string;
  currentStreak: number;
  bestStreak: number;
  completedDays: number;
  completionRate: number;
  last7: boolean[];
  last28: boolean[];
};

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + amount);
  return next;
}

export function buildHabitInsights(habits: Habit[], logs: HabitLog[], now = new Date()) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const byHabit = new Map<string, Set<string>>();
  for (const log of logs) {
    if (log.count <= 0) continue;
    const dates = byHabit.get(log.habitId) ?? new Set<string>();
    dates.add(log.loggedDate);
    byHabit.set(log.habitId, dates);
  }

  const insights = new Map<string, HabitInsight>();
  for (const habit of habits) {
    const dates = byHabit.get(habit.id) ?? new Set<string>();
    const last28 = Array.from({ length: 28 }, (_, index) => dates.has(dateKey(addDays(end, index - 27))));
    const last7 = last28.slice(-7);

    let currentStreak = 0;
    for (let offset = 0; offset < 366; offset += 1) {
      if (!dates.has(dateKey(addDays(end, -offset)))) break;
      currentStreak += 1;
    }

    const sorted = [...dates].sort();
    let bestStreak = 0;
    let running = 0;
    let previous: string | null = null;
    for (const key of sorted) {
      if (!previous) {
        running = 1;
      } else {
        const prior = new Date(`${previous}T00:00:00.000Z`);
        running = dateKey(addDays(prior, 1)) === key ? running + 1 : 1;
      }
      previous = key;
      bestStreak = Math.max(bestStreak, running);
    }

    const completedDays = last28.filter(Boolean).length;
    insights.set(habit.id, {
      habitId: habit.id,
      currentStreak,
      bestStreak,
      completedDays,
      completionRate: Math.round((completedDays / 28) * 100),
      last7,
      last28,
    });
  }
  return insights;
}

export function habitContextMessage(insight: HabitInsight) {
  if (insight.currentStreak >= 7) return `${insight.currentStreak}-day rhythm protected. Keep the ritual easy to repeat.`;
  if (insight.currentStreak >= 3) return `Momentum is building with a ${insight.currentStreak}-day streak.`;
  if (insight.completionRate >= 70) return `Strong month: ${insight.completionRate}% completion across the last 28 days.`;
  if (insight.completedDays === 0) return 'Fresh start. Logging one small completion today is enough.';
  return `${insight.completedDays} of the last 28 days completed. Aim for the next repeat, not perfection.`;
}
