import type { Habit, HabitLog } from '@/lib/types';
import { buildHabitInsights } from '@/lib/habits/insights';

export type HabitCategory = 'Mind' | 'Health' | 'Fitness' | 'Wellness' | 'General';

const CATEGORY_KEYWORDS: Array<[HabitCategory, RegExp]> = [
  ['Mind', /meditat|journal|read|mindful|gratitude|learn|study/i],
  ['Fitness', /workout|move|walk|run|gym|stretch|steps|exercise|yoga|pilates/i],
  ['Health', /water|sleep|vitamin|supplement|skincare|protein|meal|floss|medic/i],
  ['Wellness', /phone|screen|scroll|breathe|rest|relax|declutter|budget|spend/i],
];

export function categorize(habit: Pick<Habit, 'name' | 'description'>): HabitCategory {
  const text = `${habit.name} ${habit.description ?? ''}`;
  for (const [category, pattern] of CATEGORY_KEYWORDS) {
    if (pattern.test(text)) return category;
  }
  return 'General';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function targetOf(habit: Habit) {
  return Math.max(1, Number(habit.targetCount ?? 1));
}

function countFor(logs: HabitLog[], habitId: string, date: string) {
  return logs
    .filter((log) => log.habitId === habitId && log.loggedDate === date)
    .reduce((sum, log) => sum + Math.max(0, Number(log.count ?? 0)), 0);
}

export function buildHabitDashboardStats(habits: Habit[], logs: HabitLog[], now = new Date()) {
  const insights = buildHabitInsights(habits, logs, now);
  const insightList = [...insights.values()];

  const bestCurrentStreak = insightList.reduce((max, item) => Math.max(max, item.currentStreak), 0);
  const bestEverStreak = insightList.reduce((max, item) => Math.max(max, item.bestStreak), 0);

  const todayKey = now.toISOString().slice(0, 10);
  const completedTodayIds = new Set(
    habits
      .filter((habit) => countFor(logs, habit.id, todayKey) >= targetOf(habit))
      .map((habit) => habit.id),
  );
  const completedToday = completedTodayIds.size;

  // Weekly bars use true target completion, not merely "has any log".
  const weeklyBars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const completed = habits.filter((habit) => countFor(logs, habit.id, key) >= targetOf(habit)).length;
    return { label: WEEKDAYS[date.getDay()], ratio: habits.length ? completed / habits.length : 0 };
  });
  const weeklyProgress = weeklyBars.length ? Math.round((weeklyBars.reduce((sum, bar) => sum + bar.ratio, 0) / weeklyBars.length) * 100) : 0;

  const categories = new Map<HabitCategory, { count: number; totalRate: number }>();
  for (const habit of habits) {
    const category = categorize(habit);
    const insight = insights.get(habit.id);
    const bucket = categories.get(category) ?? { count: 0, totalRate: 0 };
    bucket.count += 1;
    bucket.totalRate += insight?.completionRate ?? 0;
    categories.set(category, bucket);
  }
  const categoryBreakdown = [...categories.entries()].map(([category, bucket]) => ({
    category,
    count: bucket.count,
    percent: bucket.count ? Math.round(bucket.totalRate / bucket.count) : 0,
  })).sort((a, b) => b.count - a.count);

  // Best weekday: count fully completed habit targets only.
  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  const dateKeys = [...new Set(logs.map((log) => log.loggedDate))];
  for (const dateKey of dateKeys) {
    const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
    weekdayTotals[day] += habits.filter((habit) => countFor(logs, habit.id, dateKey) >= targetOf(habit)).length;
  }
  const bestWeekdayIndex = weekdayTotals.indexOf(Math.max(...weekdayTotals));
  const weekdayLogTotal = weekdayTotals.reduce((sum, value) => sum + value, 0);
  const bestWeekdayLabel = weekdayLogTotal > 0 ? WEEKDAYS[bestWeekdayIndex] : null;
  const isWeekdayStrong = bestWeekdayIndex >= 1 && bestWeekdayIndex <= 5;

  // Best time of day remains based on when a user actually logged progress.
  const hourCounts = Array.from({ length: 24 }, () => 0);
  for (const log of logs) hourCounts[log.createdAt.getHours()] += 1;
  const totalLogs = hourCounts.reduce((sum, value) => sum + value, 0);
  const bestHour = totalLogs > 0 ? hourCounts.indexOf(Math.max(...hourCounts)) : null;

  return {
    bestCurrentStreak,
    bestEverStreak,
    completedToday,
    completedTodayIds,
    totalHabits: habits.length,
    weeklyBars,
    weeklyProgress,
    categoryBreakdown,
    bestWeekdayLabel,
    isWeekdayStrong,
    bestHour,
    insights,
  };
}
