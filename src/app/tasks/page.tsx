import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { TaskManager } from '@/components/tasks/task-manager';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const tasks = await getTasksByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Tasks" title="What deserves your attention" description="A calm, focused list that protects your energy and keeps your priorities visible.">
        <TaskManager initialTasks={tasks} />
      </SectionPage>
    </AppShell>
  );
}
