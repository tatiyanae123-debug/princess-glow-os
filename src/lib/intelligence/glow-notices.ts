import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { intelligentObservations } from '@/db/schema/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { getMaintenanceSignals, getProjectHealthSignals } from '@/lib/intelligence/signals';

export async function refreshGlowNotices(userId: string, now = new Date()) {
  const [context, projects, maintenance, existing] = await Promise.all([
    buildPersonalContext(userId, now),
    getProjectHealthSignals(userId, now),
    getMaintenanceSignals(userId, now),
    db.select({ title: intelligentObservations.title }).from(intelligentObservations).where(and(eq(intelligentObservations.userId, userId), eq(intelligentObservations.status, 'active'))),
  ]);
  const titles = new Set(existing.map((item) => item.title));
  const candidates: Array<{ category: string; title: string; evidence: string; timeWindow: string; confidence: number }> = [];

  if (context.overdueTasks.length >= 3) {
    candidates.push({ category: 'planning', title: 'Overdue work is starting to compete for attention', evidence: `${context.overdueTasks.length} unfinished tasks are past their due date. Glow recommends a Catch-Up or Low Energy triage pass instead of adding more major tasks.`, timeWindow: 'current backlog', confidence: 0.94 });
  }

  const completedHabits = context.habits.filter((habit) => habit.completedToday).length;
  if (context.dayPart === 'evening' || context.dayPart === 'night') {
    if (context.habits.length >= 3 && completedHabits / context.habits.length < 0.4) {
      candidates.push({ category: 'habits', title: 'Today may need an essentials-only habit reset', evidence: `${completedHabits} of ${context.habits.length} habits are logged. Glow recommends protecting only high-value essentials tonight rather than trying to catch up on everything.`, timeWindow: 'today', confidence: 0.82 });
    }
  }

  const openReminders = context.appleReminders.filter((item) => !item.completed).length;
  if (openReminders >= 8) {
    candidates.push({ category: 'tasks', title: 'Apple Reminders may be creating attention clutter', evidence: `${openReminders} Apple Reminders are still open. Glow recommends routing actionable items into Today and leaving lower-value reminders outside the active view.`, timeWindow: 'current reminder list', confidence: 0.87 });
  }

  for (const project of projects.filter((item) => item.status !== 'green').slice(0, 3)) {
    candidates.push({ category: 'projects', title: `${project.title} needs a clearer next move`, evidence: `${project.reason}${project.nextAction ? ` Current next action: ${project.nextAction}` : ' No next action is defined.'}`, timeWindow: 'recent project activity', confidence: project.status === 'red' ? 0.93 : 0.78 });
  }

  for (const signal of maintenance.filter((item) => item.urgency === 'soon').slice(0, 3)) {
    candidates.push({ category: signal.domain.toLowerCase(), title: `${signal.title}`, evidence: signal.recommendation, timeWindow: 'next 7 days', confidence: 0.88 });
  }

  const fresh = candidates.filter((candidate) => !titles.has(candidate.title));
  if (fresh.length) {
    await db.insert(intelligentObservations).values(fresh.map((candidate) => ({ userId, ...candidate })));
  }
  return fresh.length;
}
