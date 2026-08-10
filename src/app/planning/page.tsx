import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { archivePlanningPeriodAction, createPlanningPeriodAction, updatePlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

const fieldClass = 'w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800';

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
                <select name="level" defaultValue="week" className={fieldClass}>
                  <option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option><option value="book">Book</option><option value="bucket">Bucket list</option>
                </select>
                <input name="title" required placeholder="Title, e.g. Strong August week" className={fieldClass} />
                <textarea name="focus" rows={4} placeholder="Focus, priorities, identity goal, reading note, or bucket-list detail" className={fieldClass} />
                <div className="grid gap-3 sm:grid-cols-2"><input name="startsAt" type="date" className={fieldClass} /><input name="endsAt" type="date" className={fieldClass} /></div>
                <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save planning layer</button>
              </form>
            </Card>
            <Card className="space-y-3">
              <div><h2 className="text-xl font-semibold">Saved planning layers</h2><p className="mt-1 text-sm text-slate-500">Edit progress and reflections without leaving Planning.</p></div>
              {periods.length === 0 ? <p className="text-sm text-slate-500">Nothing saved yet. Add Today, Week, Quarter, Year, a book, or a bucket-list item above.</p> : periods.map((period) => (
                <form key={period.id} action={updatePlanningPeriodAction.bind(null, period.id)} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{period.title}</p><p className="text-xs uppercase tracking-[0.18em] text-slate-400">{period.level}</p></div><span className="text-sm text-slate-500">{period.progress}%</span></div>
                  <div className="mt-3 grid gap-3">
                    <textarea name="focus" defaultValue={period.focus ?? ''} rows={2} placeholder="Focus" className={fieldClass} />
                    <textarea name="reflection" defaultValue={period.reflection ?? ''} rows={2} placeholder="Reflection or notes" className={fieldClass} />
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input name="progress" type="number" min="0" max="100" defaultValue={period.progress} className={fieldClass} />
                      <input name="startsAt" type="date" defaultValue={period.startsAt ? period.startsAt.toISOString().slice(0,10) : ''} className={fieldClass} />
                      <input name="endsAt" type="date" defaultValue={period.endsAt ? period.endsAt.toISOString().slice(0,10) : ''} className={fieldClass} />
                    </div>
                    <div className="flex flex-wrap gap-2"><button type="submit" className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Save changes</button><button formAction={archivePlanningPeriodAction.bind(null, period.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">Archive</button></div>
                  </div>
                </form>
              ))}
            </Card>
          </div>

          <PlanningHub />
        </div>
      </SectionPage>
    </AppShell>
  );
}
