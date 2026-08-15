import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { addInboxItemFormAction } from '@/app/actions/adaptive-os';
import { routeInboxItemAction, dismissInboxItemAction } from '@/app/actions/inbox-routing';
import { getInbox } from '@/lib/intelligence/adaptive-os';
import { getInboxRoutingOptions } from '@/lib/intelligence/inbox-routing-options';
import { ArrowRight, CheckCircle2, Inbox, Sparkles, TriangleAlert, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

function metadataDestinations(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [] as string[];
  const destinations = (value as Record<string, unknown>).destinations;
  return Array.isArray(destinations) ? destinations.filter((value): value is string => typeof value === 'string').slice(0, 5) : [];
}

function routeErrorMessage(code?: string) {
  if (code === 'calendar_needs_date') return 'Glow did not find a reliable date for that item. Add the date/time to the captured text, then route it to Calendar again.';
  if (code === 'finance_needs_amount') return 'Glow did not find a reliable amount for that item. Add the amount to the captured text, then route it to Finance again.';
  if (code === 'not_available') return 'That Inbox item was already handled or is no longer available.';
  return null;
}

export default async function InboxPage({ searchParams }: { searchParams?: Promise<{ routeError?: string; itemId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const params = await searchParams;
  const routeError = routeErrorMessage(params?.routeError);
  let items;
  try {
    items = await getInbox(session.user.id);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Glow Inbox is installed and needs one-time intelligence activation.</p>
          <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">Activate the connected intelligence tables, then this page will classify and route information throughout Glow OS.</p>
          <Link href="/settings/intelligence" className="mt-4 inline-block rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] text-white">Activate Glow Intelligence →</Link>
        </div>
      </AppShell>
    );
  }
  const open = items.filter((item) => item.status === 'unprocessed');
  const processed = items.filter((item) => item.status !== 'unprocessed').slice(0, 12);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#C9727E]"><Inbox size={18} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Universal Capture</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">Glow Inbox</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#8A8078]">Capture once, review Glow&apos;s classification, then explicitly choose where the information belongs. Nothing is routed until you approve a destination.</p>
        </header>

        {routeError ? (
          <div role="alert" className="flex items-start gap-2 rounded-[14px] border border-[#F0D9D6] bg-[#FFF5F3] px-4 py-3 text-[11.5px] leading-5 text-[#9B5660]">
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
            <span>{routeError} The item remains in your Inbox and nothing was written to the wrong room.</span>
          </div>
        ) : null}

        <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <form action={addInboxItemFormAction}>
            <textarea name="rawText" rows={4} placeholder="Need to call the dentist, buy retinol, research manufacturers, remind myself about Sunday..." className="w-full resize-none rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 text-[13px] text-[#2B2420] outline-none focus:border-[#C9727E]" />
            <button type="submit" className="mt-3 flex items-center gap-2 rounded-full bg-[#2B2420] px-5 py-2.5 text-[12px] font-medium text-white"><Sparkles size={14} />Capture + Classify</button>
          </form>
        </section>
        <section className="rounded-[20px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4">
            <div><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Review + Route</p><p className="mt-1 text-[11px] text-[#B5ACA5]">Glow recommends a destination, but you choose the final home.</p></div>
            <span className="text-[12px] text-[#B5ACA5]">{open.length}</span>
          </div>
          <div className="divide-y divide-[#F1E7E3]">
            {open.length ? open.map((item) => {
              const options = getInboxRoutingOptions(item.suggestedType);
              const destinations = metadataDestinations(item.metadata);
              const highlighted = params?.itemId === item.id;
              return (
                <article key={item.id} className={`p-5 ${highlighted ? 'bg-[#FFF9F7]' : ''}`}>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#FBE4E8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.1em] text-[#B15A68]">{item.suggestedType || 'note'}</span>
                        <span className="text-[10.5px] uppercase tracking-[.08em] text-[#B5ACA5]">{Math.round(item.confidence * 100)}% confidence</span>
                      </div>
                      <p className="mt-3 text-[13px] font-medium text-[#2B2420]">{item.suggestedTitle || item.rawText}</p>
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-[11.5px] leading-5 text-[#8A8078]">{item.rawText}</p>
                      <p className="mt-2 text-[10.5px] uppercase tracking-[.08em] text-[#B5ACA5]">Source: {item.source}</p>
                      {destinations.length ? <div className="mt-3 flex flex-wrap gap-1.5">{destinations.map((destination) => <span key={destination} className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-2.5 py-1 text-[10.5px] text-[#8A8078]">Also relevant: {destination}</span>)}</div> : null}
                    </div>
                    <form action={dismissInboxItemAction.bind(null, item.id)}><button type="submit" aria-label="Dismiss" title="Dismiss without routing" className="rounded-full border border-[#F1E7E3] bg-white p-2 text-[#8A8078] hover:bg-[#FDF8F6]"><X size={14} /></button></form>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Choose destination</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                      {options.map((option) => <form key={option.destination} action={routeInboxItemAction.bind(null, item.id)}><button name="destination" value={option.destination} type="submit" className={`flex w-full items-center justify-between gap-2 rounded-[12px] border px-3 py-2.5 text-[11px] font-medium transition ${option.recommended ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68] hover:bg-[#F5D3D8]' : 'border-[#F1E7E3] bg-white text-[#4A4440] hover:bg-[#FDF8F6]'}`}><span>{option.label}{option.recommended ? <span className="ml-1 text-[9px] uppercase text-[#B15A68]">Best</span> : null}</span><ArrowRight size={11} /></button></form>)}
                    </div>
                  </div>
                </article>
              );
            }) : <div className="p-10 text-center"><CheckCircle2 size={30} className="mx-auto text-[#5A6E52]" /><p className="mt-3 text-[13px] text-[#2B2420]">Inbox zero.</p><p className="mt-1 text-[11.5px] text-[#8A8078]">Everything has been reviewed or dismissed.</p><Link href="/intake" className="mt-4 inline-flex rounded-full border border-[#F1E7E3] bg-white px-4 py-2 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">Add something new</Link></div>}
          </div>
        </section>
        {processed.length ? <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Recent Decisions</p><div className="mt-3 space-y-2">{processed.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-[12px] bg-[#FDF8F6] px-3 py-2 text-[12px] text-[#4A4440]"><CheckCircle2 size={13} className="text-[#5A6E52]" /><span className="truncate">{item.suggestedTitle || item.rawText}</span><span className="ml-auto text-[10px] uppercase text-[#B5ACA5]">{item.routedEntityType || 'dismissed'}</span></div>)}</div></section> : null}
      </div>
    </AppShell>
  );
}
