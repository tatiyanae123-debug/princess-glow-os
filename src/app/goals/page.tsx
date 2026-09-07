import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  PlanGoalsV2,
  type PlanGoalHabit,
  type PlanGoalItem as NeverUsed,
  type PlanGoalProject,
  type PlanGoalRoutine,
  type PlanGoalV2,
  type PlanSettingSnapshot,
} from '@/components/plan/plan-reference-v2';
import { getGoalsByUser } from '@/lib/data/goals';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';
import { buildHabitInsights } from '@/lib/habits/insights';
import { getPlanObjectSettingsByPrefix } from '@/lib/plan/object-settings';

export const dynamic = 'force-dynamic';

function dateKey(date: Date) { return date.toISOString().slice(0, 10); }

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();
  const start = new Date(now.getTime() - 365 * 86_400_000);
  const [goals, projectsRows, routineRows, habitRows, logs, settingsMap] = await Promise.all([
    getGoalsByUser(userId),
    getProjectsByUser(userId),
    getRoutinesByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUser(userId, dateKey(start), dateKey(now)),
    getPlanObjectSettingsByPrefix(userId, 'plan:goal:'),
  ]);
  const insights = buildHabitInsights(habitRows, logs, now);
  const goalsItems: PlanGoalV2[] = goals.filter((goal) => !goal.archived).map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    status: goal.status,
    targetDate: goal.targetDate?.toISOString() ?? null,
    progress: goal.progress,
  }));
  const projects: PlanGoalProject[] = projectsRows.filter((project) => project.status !== 'archived').map((project) => ({ id: project.id, title: project.title, progress: project.progress, status: project.status }));
  const routines: PlanGoalRoutine[] = routineRows.map((routine) => ({ id: routine.id, name: routine.name }));
  const habits: PlanGoalHabit[] = habitRows.filter((habit) => !habit.archived).map((habit) => ({ id: habit.id, name: habit.name, rhythm: insights.get(habit.id)?.completionRate ?? 0 }));
  const settings: PlanSettingSnapshot = Object.fromEntries(Array.from(settingsMap.entries()).map(([key, row]) => [key, row.preferences]));
  return <PlanGoalsV2 goals={goalsItems} projects={projects} routines={routines} habits={habits} settings={settings} />;
}
