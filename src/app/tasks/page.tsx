import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const tasks = await getTasksByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Tasks" title="What deserves your attention" description="A calm, focused list that protects your energy and keeps your priorities visible.">
        <Card className="space-y-3">
          {tasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No tasks yet. Add your first task to get started.</p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                  {task.description && <p className="text-sm text-slate-500 dark:text-slate-400">{task.description}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-sm ${
                  task.status === 'done'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : task.priority === 'urgent' || task.priority === 'high'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {task.status === 'done' ? 'Done' : task.priority}
                </span>
              </div>
            ))
          )}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
