import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createObservationAction, setObservationStatusAction } from '@/app/actions/completion-v1';
import { getObservations } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function ObservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const items = await getObservations(session.user.id);
  return <AppShell><SectionPage eyebrow="Intelligent observations" title="Notice patterns without judgment" description="Every observation carries evidence, a time window, and a confidence score. You stay in control.">
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createObservationAction} className="space-y-3"><h2 className="text-xl font-semibold">Add an observation</h2><input name="category" required placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="title" required placeholder="Observation title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="evidence" required rows={4} placeholder="Evidence used" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="timeWindow" required placeholder="Time window, e.g. past 4 weeks" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save observation</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Pattern feed</h2>{items.length===0?<p className="text-sm text-slate-500">No observations yet.</p>:items.map(item=><div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><div><p className="font-semibold">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.evidence}</p></div><span className="text-xs uppercase text-slate-400">{item.status}</span></div><p className="mt-2 text-xs text-slate-400">{item.timeWindow} · confidence {Math.round(item.confidence*100)}%</p><div className="mt-3"><form action={setObservationStatusAction.bind(null,item.id,item.status==='dismissed'?'active':'dismissed')}><button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">{item.status==='dismissed'?'Restore':'Dismiss'}</button></form></div></div>)}</Card>
    </div>
  </SectionPage></AppShell>;
}
