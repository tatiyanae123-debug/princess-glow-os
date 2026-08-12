import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { AppShell } from '@/components/app-shell';
import { TasksExperience } from '@/components/tasks/tasks-experience';
import { TaskDependencyPanel } from '@/components/tasks/task-dependency-panel';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const tasks = await getTasksByUser(userId);
  const dependencies = await db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId)).catch(() => []);
  const names = new Map(tasks.map((task) => [task.id, task.title]));
  const isOpen = (id: string) => tasks.some((task) => task.id === id && task.status !== 'done' && task.status !== 'cancelled');
  const activeDependencies = dependencies.filter((dep) => isOpen(dep.successorId) && isOpen(dep.predecessorId));
  const blockedTaskIds: Record<string, string[]> = {};
  for (const dependency of activeDependencies) {
    const list = blockedTaskIds[dependency.successorId] ?? [];
    list.push(names.get(dependency.predecessorId) ?? 'a prerequisite');
    blockedTaskIds[dependency.successorId] = list;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <TasksExperience initialTasks={tasks} blockedTaskIds={blockedTaskIds} />
        <TaskDependencyPanel userId={userId} tasks={tasks.map((task) => ({ id: task.id, title: task.title, status: task.status }))} />
      </div>
    </AppShell>
  );
}
