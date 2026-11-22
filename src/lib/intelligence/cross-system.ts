import 'server-only';

import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { glowEntities } from '@/db/schema/interconnected-os';
import { syncLivingLifeModel } from '@/lib/intelligence/living-kernel-sync';

export type CrossSystemSnapshot = {
  openTasks: number;
  overdueTasks: number;
  eventsToday: number;
  habitsCompleted: number;
  habitsTotal: number;
  habitPercent: number;
  activeGoals: number;
  activeProjects: number;
  routinesToday: number;
  monthlyExpenses: number;
  beautySpend: number;
  latestEnergy: string | number | null;
  nextEvent: { title: string; at: string } | null;
  message: string;
};

function dateValue(value: unknown) {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function meta(row: typeof glowEntities.$inferSelect) {
  return row.metadata as Record<string, unknown>;
}

function timing(row: typeof glowEntities.$inferSelect) {
  return row.timing as Record<string, unknown>;
}

export async function buildCrossSystemSnapshot(userId: string, roomKey = 'dashboard', now = new Date()): Promise<CrossSystemSnapshot> {
  await syncLivingLifeModel(userId, { reason: `Cross-system projection for ${roomKey}` });
  const objects = await db.select().from(glowEntities).where(eq(glowEntities.userId, userId)).orderBy(desc(glowEntities.updatedAt)).limit(1500);
  const active = objects.filter((row) => row.status !== 'archived' && row.state !== 'archived');

  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const openTaskRows = active.filter((row) => row.entityType === 'task' && !['done', 'cancelled', 'completed'].includes(row.state));
  const overdueRows = openTaskRows.filter((row) => {
    const due = dateValue(timing(row).dueAt);
    return Boolean(due && due < start);
  });
  const eventRows = active.filter((row) => row.entityType === 'calendar-event');
  const todayEvents = eventRows.filter((row) => {
    const at = dateValue(timing(row).startAt);
    return Boolean(at && at >= start && at <= end);
  });
  const nextEventRow = eventRows
    .map((row) => ({ row, at: dateValue(timing(row).startAt) }))
    .filter((item): item is { row: typeof glowEntities.$inferSelect; at: Date } => Boolean(item.at && item.at >= now))
    .sort((a, b) => a.at.getTime() - b.at.getTime())[0] ?? null;

  const habitRows = active.filter((row) => row.entityType === 'habit');
  const dateKey = now.toISOString().slice(0, 10);
  const completedHabitIds = new Set(active
    .filter((row) => row.entityType === 'habit-log' && String(timing(row).occurredAt ?? '').slice(0, 10) === dateKey)
    .map((row) => String(meta(row).habitId ?? ''))
    .filter(Boolean));
  const completed = habitRows.filter((row) => completedHabitIds.has(String(row.sourceId ?? ''))).length;
  const habitPercent = habitRows.length ? Math.round((completed / habitRows.length) * 100) : 0;

  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const routineRows = active.filter((row) => row.entityType === 'routine');
  const routinesToday = routineRows.filter((row) => {
    const days = timing(row).daysOfWeek;
    return !Array.isArray(days) || !days.length || days.some((day) => String(day).toLowerCase() === weekday);
  }).length;

  const monthKey = dateKey.slice(0, 7);
  const monthExpenses = active.filter((row) => {
    if (row.entityType !== 'finance') return false;
    const data = meta(row);
    return data.type === 'expense' && String(timing(row).occurredAt ?? '').startsWith(monthKey);
  });
  const monthlyExpenses = monthExpenses.reduce((sum, row) => sum + Number(meta(row).amount ?? 0), 0);
  const beautySpend = monthExpenses.filter((row) => meta(row).category === 'beauty').reduce((sum, row) => sum + Number(meta(row).amount ?? 0), 0);
  const activeGoals = active.filter((row) => row.entityType === 'goal' && ['in_progress', 'not_started', 'active'].includes(row.state)).length;
  const activeProjects = active.filter((row) => row.entityType === 'project' && row.state === 'active').length;
  const latestWellness = active
    .filter((row) => row.entityType === 'wellness-signal')
    .sort((a, b) => String(timing(b).occurredAt ?? '').localeCompare(String(timing(a).occurredAt ?? '')))[0];
  const latestEnergy = latestWellness ? (meta(latestWellness).energy as string | number | null ?? null) : null;

  const messages: Record<string, string> = {
    tasks: `${openTaskRows.length} open task${openTaskRows.length === 1 ? '' : 's'} · ${overdueRows.length} overdue · ${todayEvents.length} calendar commitment${todayEvents.length === 1 ? '' : 's'} today.`,
    calendar: `${todayEvents.length} event${todayEvents.length === 1 ? '' : 's'} today · ${openTaskRows.length} open task${openTaskRows.length === 1 ? '' : 's'} competing for time.`,
    planning: `${activeGoals} active goal${activeGoals === 1 ? '' : 's'} · ${activeProjects} active project${activeProjects === 1 ? '' : 's'} · ${openTaskRows.length} open task${openTaskRows.length === 1 ? '' : 's'}.`,
    habits: `${completed}/${habitRows.length} habits complete today · ${routinesToday} routine${routinesToday === 1 ? '' : 's'} relevant today.`,
    fitness: `Energy ${latestEnergy ?? 'not logged'} · ${todayEvents.length} event${todayEvents.length === 1 ? '' : 's'} today · ${habitPercent}% habit completion.`,
    beauty: `$${beautySpend.toFixed(0)} beauty spend this month · ${routinesToday} routine${routinesToday === 1 ? '' : 's'} relevant today.`,
    'beauty-lab': `$${beautySpend.toFixed(0)} beauty spend this month. Product decisions connect to Finance, Beauty and Memory through the same Life Model.`,
    finance: `$${monthlyExpenses.toFixed(0)} expenses logged this month · $${beautySpend.toFixed(0)} in Beauty.`,
    'financial-brain': `$${monthlyExpenses.toFixed(0)} expenses this month · ${activeGoals} life goal${activeGoals === 1 ? '' : 's'} can be considered in money decisions.`,
    goals: `${activeGoals} active goal${activeGoals === 1 ? '' : 's'} supported by ${activeProjects} active project${activeProjects === 1 ? '' : 's'}.`,
    projects: `${activeProjects} active project${activeProjects === 1 ? '' : 's'} · ${openTaskRows.length} open task${openTaskRows.length === 1 ? '' : 's'} across your execution layer.`,
    brain: `${openTaskRows.length} open tasks · ${todayEvents.length} events today · ${habitPercent}% habits · ${activeProjects} active projects.`,
    wellness: `Energy ${latestEnergy ?? 'not logged'} · ${habitPercent}% habits complete · ${todayEvents.length} commitments today.`,
    hair: `${todayEvents.length} calendar commitment${todayEvents.length === 1 ? '' : 's'} today. Hair maintenance can use schedule and Beauty context from the shared graph.`,
    closet: `$${monthlyExpenses.toFixed(0)} expenses logged this month. Closet can connect cost, calendar and future weather context.`,
    gmail: `${openTaskRows.length} open task${openTaskRows.length === 1 ? '' : 's'}. Actionable emails can feed Tasks, Projects and Calendar without creating separate truth.`,
    notes: `${activeProjects} active project${activeProjects === 1 ? '' : 's'} can receive linked notes and references.`,
    memory: `${activeProjects} active project${activeProjects === 1 ? '' : 's'} and ${activeGoals} active goal${activeGoals === 1 ? '' : 's'} contribute to one connected history.`,
    observations: `${overdueRows.length} overdue task${overdueRows.length === 1 ? '' : 's'} · ${habitPercent}% habits today · cross-system patterns are available for observation.`,
  };

  return {
    openTasks: openTaskRows.length,
    overdueTasks: overdueRows.length,
    eventsToday: todayEvents.length,
    habitsCompleted: completed,
    habitsTotal: habitRows.length,
    habitPercent,
    activeGoals,
    activeProjects,
    routinesToday,
    monthlyExpenses,
    beautySpend,
    latestEnergy,
    nextEvent: nextEventRow ? { title: nextEventRow.row.title, at: nextEventRow.at.toISOString() } : null,
    message: messages[roomKey] ?? `${openTaskRows.length} open tasks · ${todayEvents.length} events today · ${habitPercent}% habits complete.`,
  };
}
