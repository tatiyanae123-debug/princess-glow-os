import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getGoalsByUser } from '@/lib/data/goals';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getProjectsByUser } from '@/lib/data/user-scope';

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
  insights: Array<{ title: string; detail: string; href: string; confidence: 'grounded' | 'limited' }>;
};

export async function buildCrossSystemSnapshot(userId: string, roomKey = 'dashboard', now = new Date()): Promise<CrossSystemSnapshot> {
  const dateKey = now.toISOString().slice(0, 10);
  const [tasks, events, habits, habitLogs, goals, routines, finance, wellness, projects] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUserByDate(userId, dateKey),
    getGoalsByUser(userId),
    getRoutinesByUser(userId),
    getFinanceEntriesByUser(userId),
    getWellnessEntriesByUser(userId),
    getProjectsByUser(userId),
  ]);

  const start = new Date(now); start.setHours(0,0,0,0);
  const end = new Date(now); end.setHours(23,59,59,999);
  const open = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const overdue = open.filter((task) => task.dueDate && task.dueDate < start);
  const todaysEvents = events.filter((event) => event.startAt >= start && event.startAt <= end);
  const nextEvent = events.filter((event) => event.startAt >= now).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime())[0] ?? null;
  const completedHabitIds = new Set(habitLogs.map((log)=>log.habitId));
  const completed = habits.filter((habit)=>completedHabitIds.has(habit.id)).length;
  const habitPercent = habits.length ? Math.round((completed / habits.length) * 100) : 0;
  const weekday = now.toLocaleDateString('en-US',{weekday:'long'}).toLowerCase();
  const routinesToday = routines.filter((routine)=>!routine.daysOfWeek?.length || routine.daysOfWeek.some((day)=>day.toLowerCase()===weekday)).length;
  const monthKey = dateKey.slice(0,7);
  const monthExpenses = finance.filter((entry)=>entry.type==='expense' && String(entry.entryDate).startsWith(monthKey));
  const monthlyExpenses = monthExpenses.reduce((sum,entry)=>sum + Number(entry.amount),0);
  const beautySpend = monthExpenses.filter((entry)=>entry.category==='beauty').reduce((sum,entry)=>sum+Number(entry.amount),0);
  const activeGoals = goals.filter((goal)=>goal.status==='in_progress'||goal.status==='not_started').length;
  const activeProjects = projects.filter((project)=>project.status==='active').length;
  const latestEnergy = wellness[0]?.energy ?? null;
  const highOverdue = overdue.filter((task)=>task.priority==='urgent'||task.priority==='high');
  const approachingGoals = goals.filter((goal)=>goal.targetDate && goal.status!=='achieved' && goal.status!=='abandoned' && goal.targetDate >= now && goal.targetDate.getTime()-now.getTime() <= 30*86400000);
  const workloadMinutes = open.filter((task)=>task.dueDate && task.dueDate >= start && task.dueDate <= end).length * 45;
  const scheduledMinutes = todaysEvents.reduce((sum,event)=>sum+Math.max(0,((event.endAt ?? event.startAt).getTime()-event.startAt.getTime())/60000),0);
  const insights: CrossSystemSnapshot['insights'] = [];
  if(scheduledMinutes+workloadMinutes>600) insights.push({title:'Today may be overloaded',detail:`Stored events and dated tasks represent roughly ${Math.round((scheduledMinutes+workloadMinutes)/60)} hours before buffers. Review the plan rather than moving work automatically.`,href:'/planning',confidence:'grounded'});
  if(highOverdue.length) insights.push({title:'High-priority work needs a decision',detail:`${highOverdue.length} high or urgent task${highOverdue.length===1?' is':'s are'} overdue and still open.`,href:'/tasks',confidence:'grounded'});
  if(approachingGoals.length) insights.push({title:'A goal date is approaching',detail:`${approachingGoals[0].title} has a stored target date within 30 days.`,href:'/goals',confidence:'grounded'});
  if(latestEnergy==='low'||latestEnergy==='exhausted') insights.push({title:'Plan around recorded energy',detail:'Your latest wellness entry records low energy. Consider a lighter existing routine without treating this as medical guidance.',href:'/wellness',confidence:'grounded'});
  if(!insights.length) insights.push({title:'More history is needed',detail:'Glow has not found a sufficiently supported cross-room pattern yet. Keep using dated tasks, events, habits, and wellness check-ins.',href:'/dashboard',confidence:'limited'});

  const messages: Record<string,string> = {
    tasks: `${open.length} open task${open.length===1?'':'s'} · ${overdue.length} overdue · ${todaysEvents.length} calendar commitment${todaysEvents.length===1?'':'s'} today.`,
    calendar: `${todaysEvents.length} event${todaysEvents.length===1?'':'s'} today · ${open.length} open task${open.length===1?'':'s'} competing for time.`,
    planning: `${activeGoals} active goal${activeGoals===1?'':'s'} · ${activeProjects} active project${activeProjects===1?'':'s'} · ${open.length} open task${open.length===1?'':'s'}.`,
    habits: `${completed}/${habits.length} habits complete today · ${routinesToday} routine${routinesToday===1?'':'s'} relevant today.`,
    fitness: `Energy ${latestEnergy ?? 'not logged'} · ${todaysEvents.length} event${todaysEvents.length===1?'':'s'} today · ${habitPercent}% habit completion.`,
    beauty: `$${beautySpend.toFixed(0)} beauty spend this month · ${routinesToday} routine${routinesToday===1?'':'s'} relevant today.`,
    'beauty-lab': `$${beautySpend.toFixed(0)} beauty spend this month. Product decisions can flow into Finance, Beauty and Memory.`,
    finance: `$${monthlyExpenses.toFixed(0)} expenses logged this month · $${beautySpend.toFixed(0)} in Beauty.`,
    'financial-brain': `$${monthlyExpenses.toFixed(0)} expenses this month · ${activeGoals} life goal${activeGoals===1?'':'s'} can be considered in money decisions.`,
    goals: `${activeGoals} active goal${activeGoals===1?'':'s'} supported by ${activeProjects} active project${activeProjects===1?'':'s'}.`,
    projects: `${activeProjects} active project${activeProjects===1?'':'s'} · ${open.length} open task${open.length===1?'':'s'} across your execution layer.`,
    brain: `${open.length} open tasks · ${todaysEvents.length} events today · ${habitPercent}% habits · ${activeProjects} active projects.`,
    wellness: `Energy ${latestEnergy ?? 'not logged'} · ${habitPercent}% habits complete · ${todaysEvents.length} commitments today.`,
    hair: `${todaysEvents.length} calendar commitment${todaysEvents.length===1?'':'s'} today. Hair maintenance can use schedule and Beauty context.`,
    closet: `$${monthlyExpenses.toFixed(0)} expenses logged this month. Closet can connect cost, calendar and future weather context.`,
    gmail: `${open.length} open task${open.length===1?'':'s'}. Actionable emails can feed Tasks, Projects and Calendar.`,
    notes: `${activeProjects} active project${activeProjects===1?'':'s'} can receive linked notes and references.`,
    memory: `${activeProjects} active project${activeProjects===1?'':'s'} and ${activeGoals} active goal${activeGoals===1?'':'s'} can contribute meaningful memory events.`,
    observations: `${overdue.length} overdue task${overdue.length===1?'':'s'} · ${habitPercent}% habits today · cross-system patterns are available for observation.`,
  };

  return {
    openTasks: open.length,
    overdueTasks: overdue.length,
    eventsToday: todaysEvents.length,
    habitsCompleted: completed,
    habitsTotal: habits.length,
    habitPercent,
    activeGoals,
    activeProjects,
    routinesToday,
    monthlyExpenses,
    beautySpend,
    latestEnergy,
    nextEvent: nextEvent ? { title: nextEvent.title, at: nextEvent.startAt.toISOString() } : null,
    message: messages[roomKey] ?? `${open.length} open tasks · ${todaysEvents.length} events today · ${habitPercent}% habits complete.`,
    insights,
  };
}
