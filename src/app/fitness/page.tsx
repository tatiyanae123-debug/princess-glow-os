import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFitnessSessionAction } from '@/app/actions/completion-v1';
import { getFitnessSessions } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function FitnessPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const sessions = await getFitnessSessions(session.user.id);
  const recent = sessions.slice(0,7);
  const minutes = recent.reduce((sum,s)=>sum+(s.durationMinutes??0),0);
  return <AppShell><SectionPage eyebrow="Fitness Intelligence" title="Train around your real energy" description="Log workouts, time, energy, soreness, and equipment so Glow OS can make better schedule-aware recommendations.">
    <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Recent sessions</p><p className="mt-2 text-3xl font-semibold">{recent.length}</p></Card><Card><p className="text-sm text-slate-500">Recent minutes</p><p className="mt-2 text-3xl font-semibold">{minutes}</p></Card><Card><p className="text-sm text-slate-500">Last workout</p><p className="mt-2 text-lg font-semibold">{sessions[0]?.workoutType??'None yet'}</p></Card></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createFitnessSessionAction} className="space-y-3"><h2 className="text-xl font-semibold">Log session</h2><input name="workoutType" required placeholder="Pilates, strength, walk…" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="occurredAt" type="datetime-local" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="durationMinutes" inputMode="numeric" placeholder="Minutes" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><div className="grid grid-cols-2 gap-2"><input name="energy" inputMode="numeric" placeholder="Energy 1–10" className="rounded-2xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-800"/><input name="soreness" inputMode="numeric" placeholder="Soreness 1–10" className="rounded-2xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-800"/></div><input name="equipment" placeholder="Equipment" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="notes" rows={3} placeholder="Recovery / session notes" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save workout</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Session history</h2>{sessions.length===0?<p className="text-sm text-slate-500">No workouts logged yet.</p>:sessions.map(s=><div key={s.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><p className="font-semibold">{s.workoutType}</p><span className="text-xs text-slate-400">{s.occurredAt.toLocaleDateString()}</span></div><p className="mt-1 text-sm text-slate-500">{s.durationMinutes??'—'} min · energy {s.energy??'—'} · soreness {s.soreness??'—'}</p>{s.notes&&<p className="mt-2 text-sm">{s.notes}</p>}</div>)}</Card>
    </div>
  </SectionPage></AppShell>;
}
