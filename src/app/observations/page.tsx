import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { createObservationAction, setObservationStatusAction } from '@/app/actions/completion-v1';
import { proposeObservationAction } from '@/app/actions/adaptive-observations';
import { getObservations } from '@/lib/data/completion-v1';
import { refreshGlowNotices } from '@/lib/intelligence/glow-notices';
import { ArrowRight, BrainCircuit, CheckCircle2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ObservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  await refreshGlowNotices(session.user.id);
  const items = await getObservations(session.user.id);
  const active = items.filter((item) => item.status === 'active');
  const dismissed = items.filter((item) => item.status === 'dismissed');

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div><div className="flex items-center gap-2 text-amber-700"><Sparkles size={18}/><p className="text-[10px] font-bold uppercase tracking-[.2em]">Glow Notices</p></div><h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{ fontFamily:'var(--glow-font-display)' }}>Patterns that deserve attention, not panic.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">Glow now creates evidence-based observations automatically from overdue work, habit completion, project movement, Apple Reminders, and approaching maintenance. You decide what happens next.</p></div>
          <Link href="/concierge" className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs text-white">Proposal Queue <ArrowRight size={12}/></Link>
        </header>

        <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
          <section className="rounded-[24px] border border-stone-200/70 bg-white/75 p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-stone-900">Add something Glow cannot infer</h2>
            <p className="mt-1 text-xs leading-5 text-stone-500">Manual observations stay useful for patterns that exist outside connected data.</p>
            <form action={createObservationAction} className="mt-4 space-y-3"><input name="category" required placeholder="Category" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/><input name="title" required placeholder="Observation title" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/><textarea name="evidence" required rows={4} placeholder="What evidence supports it?" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/><input name="timeWindow" required placeholder="Time window" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm"/><button className="w-full rounded-xl bg-stone-900 py-2.5 text-xs text-white">Save observation</button></form>
          </section>

          <section className="rounded-[24px] border border-stone-200/70 bg-white/75 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div className="flex items-center gap-2"><BrainCircuit size={15} className="text-violet-600"/><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Active Notice Feed</p></div><span className="text-xs text-stone-400">{active.length}</span></div>
            <div className="divide-y divide-stone-100">{active.length ? active.map((item)=><div key={item.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium text-stone-900">{item.title}</p><p className="mt-2 text-xs leading-5 text-stone-500">{item.evidence}</p><p className="mt-2 text-[9px] uppercase tracking-[.12em] text-stone-400">{item.category} · {item.timeWindow} · {Math.round(item.confidence*100)}% confidence</p></div><CheckCircle2 size={15} className="mt-1 shrink-0 text-emerald-600"/></div><div className="mt-4 flex flex-wrap gap-2"><form action={proposeObservationAction.bind(null,item.id)}><button className="rounded-xl bg-violet-950 px-3 py-2 text-[10px] text-white">Ask Concierge to act</button></form><form action={setObservationStatusAction.bind(null,item.id,'dismissed')}><button className="rounded-xl border border-stone-200 px-3 py-2 text-[10px] text-stone-600">Dismiss</button></form></div></div>):<p className="p-8 text-center text-xs text-stone-500">Glow has not found a meaningful pattern that needs attention.</p>}</div>
          </section>
        </div>

        {dismissed.length ? <details className="rounded-[24px] border border-stone-200/70 bg-white/60 p-5"><summary className="cursor-pointer text-xs font-medium text-stone-600">Dismissed notices ({dismissed.length})</summary><div className="mt-4 space-y-2">{dismissed.map((item)=><div key={item.id} className="flex items-center justify-between rounded-xl bg-stone-50 px-3 py-2"><span className="text-xs text-stone-500">{item.title}</span><form action={setObservationStatusAction.bind(null,item.id,'active')}><button className="text-[10px] text-rose-700">Restore</button></form></div>)}</div></details>:null}
      </div>
    </AppShell>
  );
}
