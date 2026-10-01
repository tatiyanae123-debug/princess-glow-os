import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { TaskDetailWorkspace } from '@/components/tasks/task-detail-workspace';
import { getTaskById } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const { id } = await params;
  const task = await getTaskById(id, session.user.id);
  if (!task || task.archived) notFound();

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Plan · Tasks · Detail"
        title={task.title}
        question="One task, one identity. Edit it here and let every Glow projection reconcile from the same object."
        climate="work"
        destinations={[
          { label: 'Tasks', href: '/tasks', cue: 'Return to task workspace' },
          { label: 'What Now?', href: '/living/what-now', cue: 'Current next action' },
          { label: 'Planning Studio', href: '/living/planning-studio', cue: 'Place it in time' },
        ]}
      >
        <TaskDetailWorkspace task={task} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
