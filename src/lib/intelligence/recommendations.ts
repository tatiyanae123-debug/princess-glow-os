import type { Recommendation } from './domain';

const priorityWeight: Record<string, number> = { urgent: 55, high: 40, medium: 25, low: 10 };

export function rankRecommendations(input: {
  tasks: { id: string; title: string; priority: string; dueDate: Date | null }[];
  reminders: { id: string; title: string; dueAt: Date | null; completed: boolean }[];
  routines: { id: string; name: string; incomplete?: boolean }[];
  habits: { id: string; name: string; completedToday: boolean }[];
  nextEventAt?: Date | null;
  now?: Date;
}): Recommendation[] {
  const now = input.now ?? new Date();
  const untilNextEvent = input.nextEventAt ? Math.max(0, Math.floor((input.nextEventAt.getTime() - now.getTime()) / 60000)) : null;
  const recommendations: Recommendation[] = [];

  for (const task of input.tasks) {
    let score = priorityWeight[task.priority] ?? 20;
    const overdue = Boolean(task.dueDate && task.dueDate < now);
    if (overdue) score += 45;
    else if (task.dueDate && task.dueDate.getTime() - now.getTime() <= 86400000) score += 30;
    const estimatedMinutes = task.priority === 'urgent' ? 45 : 30;
    if (untilNextEvent !== null && estimatedMinutes <= untilNextEvent) score += 10;
    recommendations.push({ id: `task:${task.id}`, sourceType: 'task', sourceId: task.id, title: task.title, reason: overdue ? 'Overdue and needs attention.' : task.dueDate ? 'Due soon and fits the current planning window.' : 'High-value unfinished work.', score, estimatedMinutes, dueAt: task.dueDate });
  }

  for (const reminder of input.reminders.filter((item) => !item.completed)) {
    let score = 24;
    if (reminder.dueAt && reminder.dueAt < now) score += 45;
    else if (reminder.dueAt && reminder.dueAt.getTime() - now.getTime() <= 86400000) score += 30;
    recommendations.push({ id: `apple:${reminder.id}`, sourceType: 'apple_reminder', sourceId: reminder.id, title: reminder.title, reason: reminder.dueAt ? 'Apple Reminder is due soon.' : 'Incomplete Apple Reminder.', score, estimatedMinutes: 20, dueAt: reminder.dueAt });
  }

  for (const routine of input.routines.filter((item) => item.incomplete !== false)) recommendations.push({ id: `routine:${routine.id}`, sourceType: 'routine', sourceId: routine.id, title: routine.name, reason: 'Scheduled routine is still incomplete.', score: 22, estimatedMinutes: 25, dueAt: null });
  for (const habit of input.habits.filter((item) => !item.completedToday)) recommendations.push({ id: `habit:${habit.id}`, sourceType: 'habit', sourceId: habit.id, title: habit.name, reason: 'Habit has not been logged today.', score: 18, estimatedMinutes: 10, dueAt: null });

  return recommendations.sort((a, b) => b.score - a.score || (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity));
}
