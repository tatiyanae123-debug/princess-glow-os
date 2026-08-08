import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createHairLogAction } from '@/app/actions/completion-v1';
import { getHairLogs } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function HairPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const logs = await getHairLogs(session.user.id);
  return <AppShell><SectionPage eyebrow="Hair Intelligence" title="Keep your hair routine visible" description="Track wash days, treatments, styling, heat, buildup, wig maintenance, trims, breakage notes, and the next action.">
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createHairLogAction} className="space-y-3"><h2 className="text-xl font-semibold">Log hair care</h2><input name="eventType" required placeholder="Wash, bond treatment, scalp care, trim…" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="occurredAt" type="datetime-local" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="style" placeholder="Style" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="products" placeholder="Products used" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><label className="flex items-center gap-2 text-sm"><input name="heatUsed" type="checkbox"/> Heat used</label><textarea name="notes" rows={3} placeholder="Buildup, breakage, scalp, result" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="nextAction" placeholder="Next required action" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save hair log</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Hair timeline</h2>{logs.length===0?<p className="text-sm text-slate-500">No hair care logged yet.</p>:logs.map(log=><div key={log.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><p className="font-semibold">{log.eventType}</p><span className="text-xs text-slate-400">{log.occurredAt.toLocaleDateString()}</span></div>{log.style&&<p className="mt-1 text-sm text-slate-500">Style: {log.style}</p>}{log.notes&&<p className="mt-2 text-sm">{log.notes}</p>}{log.nextAction&&<p className="mt-2 text-sm font-medium">Next: {log.nextAction}</p>}</div>)}</Card>
    </div>
  </SectionPage></AppShell>;
}
