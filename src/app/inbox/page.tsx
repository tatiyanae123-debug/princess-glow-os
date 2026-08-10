import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { addInboxItemFormAction, routeInboxItemAction } from '@/app/actions/adaptive-os';
import { getInbox } from '@/lib/intelligence/adaptive-os';
import { ArrowRight, CheckCircle2, Inbox, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const items = await getInbox(session.user.id);
  const open = items.filter((item) => item.status === 'unprocessed');
  const processed = items.filter((item) => item.status !== 'unprocessed').slice(0, 12);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-rose-700"><Inbox size={18} /><p className="text-[10px] font-bold uppercase tracking-[.2em]">Universal Capture</p></div>
          <h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{ fontFamily: 'var(--glow-font-display)' }}>Glow Inbox</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Dump thoughts once. Glow classifies them, then routes them into Tasks, Goals, or Notes so you do not have to organize first.</p>
        </header>

        <section className="rounded-[24px] border border-stone-200/70 bg-white/75 p-5 shadow-sm">
          <form action={addInboxItemFormAction}>
            <textarea name="rawText" rows={4} placeholder="Need to call the dentist, buy retinol, research manufacturers, remind myself about Sunday..." className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-sm outline-none focus:border-rose-300" />
            <button type="submit" className="mt-3 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-xs text-white"><Sparkles size={14} /> Capture + Classify</button>
          </form>
        </section>

        <section className="rounded-[24px] border border-stone-200/70 bg-white/75 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Needs Routing</p><span className="text-xs text-stone-400">{open.length}</span></div>
          <div className="divide-y divide-stone-100">
            {open.length ? open.map((item) => (
              <div key={item.id} className="grid gap-4 p-5 md:grid-cols-[1fr_180px_150px] md:items-center">
                <div><p className="text-sm font-medium text-stone-900">{item.suggestedTitle || item.rawText}</p><p className="mt-1 text-[10px] text-stone-500">Source: {item.source} · Confidence {Math.round(item.confidence * 100)}%</p></div>
                <div className="rounded-full bg-rose-50 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-[.12em] text-rose-800">{item.suggestedType || 'note'}</div>
                <form action={routeInboxItemAction.bind(null, item.id)}><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs text-white hover:bg-rose-950">Route it <ArrowRight size={12} /></button></form>
              </div>
            )) : <div className="p-10 text-center"><CheckCircle2 size={30} className="mx-auto text-emerald-600" /><p className="mt-3 text-sm text-stone-700">Inbox zero.</p><p className="mt-1 text-xs text-stone-400">Everything has been processed.</p></div>}
          </div>
        </section>

        {processed.length ? <section className="rounded-[24px] border border-stone-200/70 bg-white/60 p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-500">Recently Routed</p><div className="mt-3 space-y-2">{processed.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-600"><CheckCircle2 size={13} className="text-emerald-600" /><span className="truncate">{item.suggestedTitle || item.rawText}</span><span className="ml-auto text-[9px] uppercase text-stone-400">{item.routedEntityType || 'processed'}</span></div>)}</div></section> : null}
      </div>
    </AppShell>
  );
}
