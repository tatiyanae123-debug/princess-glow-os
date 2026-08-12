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

export function buildHabitDashboardStats(habits: Habit[], logs: HabitLog[], now = new Date()) {
  const insights = buildHabitInsights(habits, logs, now);
  const insightList = [...insights.values()];

  const bestCurrentStreak = insightList.reduce((max, item) => Math.max(max, item.currentStreak), 0);
  const bestEverStreak = insightList.reduce((max, item) => Math.max(max, item.bestStreak), 0);

  const todayKey = now.toISOString().slice(0, 10);
  const loggedToday = new Set(logs.filter((log) => log.loggedDate === todayKey && log.count > 0).map((log) => log.habitId));
  const completedToday = habits.filter((habit) => loggedToday.has(habit.id)).length;

  // Weekly bars: for each of the last 7 days, what fraction of habits were logged.
  const weeklyBars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const loggedCount = new Set(logs.filter((log) => log.loggedDate === key && log.count > 0).map((log) => log.habitId)).size;
    return { label: WEEKDAYS[date.getDay()], ratio: habits.length ? loggedCount / habits.length : 0 };
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

  // Best weekday: which day-of-week has the highest historical logging rate.
  const weekdayTotals = Array.from({ length: 7 }, () => 0);
  const weekdayCounts = Array.from({ length: 7 }, () => 0);
  for (const log of logs) {
    if (log.count <= 0) continue;
    const day = new Date(`${log.loggedDate}T00:00:00.000Z`).getUTCDay();
    weekdayTotals[day] += 1;
  }
  for (let i = 0; i < 7; i += 1) weekdayCounts[i] = weekdayTotals[i];
  const bestWeekdayIndex = weekdayCounts.indexOf(Math.max(...weekdayCounts));
  const weekdayLogTotal = weekdayCounts.reduce((sum, value) => sum + value, 0);
  const bestWeekdayLabel = weekdayLogTotal > 0 ? WEEKDAYS[bestWeekdayIndex] : null;
  const isWeekdayStrong = bestWeekdayIndex >= 1 && bestWeekdayIndex <= 5;

  // Best time of day: mode of the hour a log entry was actually created.
  const hourCounts = Array.from({ length: 24 }, () => 0);
  for (const log of logs) hourCounts[log.createdAt.getHours()] += 1;
  const totalLogs = hourCounts.reduce((sum, value) => sum + value, 0);
  const bestHour = totalLogs > 0 ? hourCounts.indexOf(Math.max(...hourCounts)) : null;

  return {
    bestCurrentStreak,
    bestEverStreak,
    completedToday,
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
