import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const goals = await getGoalsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Goals" title="Ambition that feels grounded" description="Let your goals stay visible and aligned with your daily life.">
        {goals.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No goals yet. Define one clear goal to get started.</p>
        ) : (
          <Card className="grid gap-3 md:grid-cols-2">
            {goals.map((goal) => (
              <div key={goal.id} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{goal.title}</p>
                  <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{goal.status.replace('_', ' ')}</span>
                </div>
                {goal.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{goal.description}</p>}
                <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: `${goal.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{goal.progress}% complete</p>
              </div>
            ))}
          </Card>
        )}
      </SectionPage>
    </AppShell>
  );
}
