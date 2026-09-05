import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTasksByUser } from '@/lib/data/tasks';
import { PlanTasksRoom, type PlanTaskItem } from '@/components/plan/plan-tasks-room';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const rows = await getTasksByUser(session.user.id);
  const tasks: PlanTaskItem[] = rows.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString() ?? null,
    completedAt: task.completedAt?.toISOString() ?? null,
    source: task.source,
    createdAt: task.createdAt.toISOString(),
  }));

  return <PlanTasksRoom initialTasks={tasks} />;
}
