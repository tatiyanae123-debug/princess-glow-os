import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createPlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const periods = await getPlanningPeriods(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Planning" title="Today, week, quarter, and year in one place" description="Build the day around real commitments, then connect daily action to your bigger direction.">
        <div className="space-y-6">
          <BuildMyDay />

          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Card>
              <form action={createPlanningPeriodAction} className="space-y-3">
                <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Persistent planning</p><h2 className="mt-2 text-xl font-semibold">Create a planning layer</h2></div>
                <select name="level" defaultValue="week" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"><option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option></select>
                <input name="title" required placeholder="Title, e.g. Strong August week" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
                <textarea name="focus" rows={4} placeholder="Focus, priorities, identity goal, or reflection" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
                <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save planning layer</button>
              </form>
            </Card>
            <Card className="space-y-3">
              <h2 className="text-xl font-semibold">Saved planning layers</h2>
              {periods.length === 0 ? <p className="text-sm text-slate-500">Nothing saved yet. Add Today, Week, Quarter, or Year planning above.</p> : periods.map((period) => (
                <div key={period.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{period.title}</p><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{period.level}</p></div><span className="text-sm text-slate-500">{period.progress}%</span></div>
                  {period.focus && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{period.focus}</p>}
                </div>
              ))}
            </Card>
          </div>

          <PlanningHub />
        </div>
      </SectionPage>
    </AppShell>
  );
}
