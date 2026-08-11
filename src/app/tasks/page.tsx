import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { TaskManager } from '@/components/tasks/task-manager';
import { TaskDependencyPanel } from '@/components/tasks/task-dependency-panel';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const tasks = await getTasksByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Tasks" title="What deserves your attention" description="A calm execution desk for what matters now, what comes next, and what is blocked by something else.">
        <div className="space-y-5">
          <TaskManager initialTasks={tasks} />
          <TaskDependencyPanel userId={session.user.id} tasks={tasks.map(task=>({id:task.id,title:task.title,status:task.status}))} />
        </div>
      </SectionPage>
    </AppShell>
  );
}
