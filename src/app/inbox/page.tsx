import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { addInboxItemFormAction } from '@/app/actions/adaptive-os';
import { routeInboxItemAction, dismissInboxItemAction } from '@/app/actions/inbox-routing';
import { getInbox } from '@/lib/intelligence/adaptive-os';
import { getInboxRoutingOptions } from '@/lib/intelligence/inbox-routing-options';
import { ArrowRight, CheckCircle2, Inbox, Sparkles, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

function metadataDestinations(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [] as string[];
  const destinations = (value as Record<string, unknown>).destinations;
  return Array.isArray(destinations) ? destinations.filter((value): value is string => typeof value === 'string').slice(0, 5) : [];
}

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let items;
  try { items = await getInbox(session.user.id); } catch {
    return <AppShell><div className="mx-auto max-w-4xl rounded-[22px] border border-amber-200 bg-amber-50 p-6"><p className="text-sm font-semibold text-stone-900">Glow Inbox is installed and needs one-time intelligence activation.</p><p className="mt-2 text-xs leading-5 text-stone-600">Activate the connected intelligence tables, then this page will classify and route information throughout Glow OS.</p><Link href="/settings/intelligence" className="mt-4 inline-block rounded-xl bg-stone-950 px-4 py-2.5 text-xs text-white">Activate Glow Intelligence →</Link></div></AppShell>;
  }
  const open = items.filter((item) => item.status === 'unprocessed');
  const processed = items.filter((item) => item.status !== 'unprocessed').slice(0, 12);

  return <AppShell><div className="mx-auto max-w-5xl space-y-5">
    <header><div className="flex items-center gap-2 text-rose-700"><Inbox size={18}/><p className="text-[10px] font-bold uppercase tracking-[.2em]">Universal Capture</p></div><h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{fontFamily:'var(--glow-font-display)'}}>Glow Inbox</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Capture once, review Glow’s classification, then explicitly choose where the information belongs. Nothing is routed until you approve a destination.</p></header>
    <section className="rounded-[24px] border border-stone-200/70 bg-white/75 p-5 shadow-sm"><form action={addInboxItemFormAction}><textarea name="rawText" rows={4} placeholder="Need to call the dentist, buy retinol, research manufacturers, remind myself about Sunday..." className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/70 p-4 text-sm outline-none focus:border-rose-300"/><button type="submit" className="mt-3 flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-xs text-white"><Sparkles size={14}/>Capture + Classify</button></form></section>
    <section className="rounded-[24px] border border-stone-200/70 bg-white/75 shadow-sm"><div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Review + Route</p><p className="mt-1 text-[10px] text-stone-400">Glow recommends a destination, but you choose the final home.</p></div><span className="text-xs text-stone-400">{open.length}</span></div><div className="divide-y divide-stone-100">{open.length?open.map(item=>{const options=getInboxRoutingOptions(item.suggestedType);const destinations=metadataDestinations(item.metadata);return <article key={item.id} className="p-5"><div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-rose-50 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-rose-800">{item.suggestedType||'note'}</span><span className="text-[9px] uppercase tracking-[.1em] text-stone-400">{Math.round(item.confidence*100)}% confidence</span></div><p className="mt-3 text-sm font-medium text-stone-900">{item.suggestedTitle||item.rawText}</p><p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-5 text-stone-500">{item.rawText}</p><p className="mt-2 text-[9px] uppercase tracking-[.1em] text-stone-400">Source: {item.source}</p>{destinations.length?<div className="mt-3 flex flex-wrap gap-1.5">{destinations.map(destination=><span key={destination} className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[9px] text-stone-500">Also relevant: {destination}</span>)}</div>:null}</div><form action={dismissInboxItemAction.bind(null,item.id)}><button type="submit" aria-label="Dismiss" title="Dismiss without routing" className="rounded-xl border border-stone-200 bg-white p-2 text-stone-500 hover:bg-stone-50"><X size={14}/></button></form></div><div className="mt-4"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-stone-500">Choose destination</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">{options.map(option=><form key={option.destination} action={routeInboxItemAction.bind(null,item.id)}><button name="destination" value={option.destination} type="submit" className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-medium transition ${option.recommended?'border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100':'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}><span>{option.label}{option.recommended?<span className="ml-1 text-[8px] uppercase text-rose-500">Best</span>:null}</span><ArrowRight size={11}/></button></form>)}</div></div></article>}):<div className="p-10 text-center"><CheckCircle2 size={30} className="mx-auto text-emerald-600"/><p className="mt-3 text-sm text-stone-700">Inbox zero.</p><p className="mt-1 text-xs text-stone-400">Everything has been reviewed or dismissed.</p><Link href="/intake" className="mt-4 inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs text-stone-700">Add something new</Link></div>}</div></section>
    {processed.length?<section className="rounded-[24px] border border-stone-200/70 bg-white/60 p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-500">Recent Decisions</p><div className="mt-3 space-y-2">{processed.map(item=><div key={item.id} className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2 text-xs text-stone-600"><CheckCircle2 size={13} className="text-emerald-600"/><span className="truncate">{item.suggestedTitle||item.rawText}</span><span className="ml-auto text-[9px] uppercase text-stone-400">{item.routedEntityType||'dismissed'}</span></div>)}</div></section>:null}
  </div></AppShell>;
}
