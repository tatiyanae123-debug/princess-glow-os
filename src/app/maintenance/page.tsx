import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { Check, Pill, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function MedicationsRoute({searchParams}:{searchParams:Promise<{medicationId?:string;supplementId?:string}>}){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const params=await searchParams;
  if(params.medicationId) redirect(`/wellness?medicationId=${encodeURIComponent(params.medicationId)}#medications-supplements`);
  if(params.supplementId) redirect(`/wellness?supplementId=${encodeURIComponent(params.supplementId)}#medications-supplements`);
  const [medications,supplements]=await Promise.all([getMedicationsByUser(session.user.id),getSupplementsByUser(session.user.id)]);
  const activeMeds=medications.filter(x=>x.active),activeSupps=supplements.filter(x=>x.active);
  const all=[...activeMeds.map(x=>({...x,kind:'medication' as const})),...activeSupps.map(x=>({...x,kind:'supplement' as const}))];
  const groups=groupByTime(all);
  return <AppShell><div className="batch3-medications-reference mx-auto max-w-[1120px] space-y-4">
    <header><p className="text-[9px] uppercase tracking-[.12em] text-[#766d67]">4. Medications &amp; Supplements</p><h1 className="glow-display mt-1 text-[40px] leading-none">Medications &amp; Supplements</h1><p className="mt-2 text-[10.5px] text-[#887e77]">Stay consistent. Stay healthy.</p></header>
    <nav className="flex gap-6 border-b border-[#eee6e1] text-[9px]"><span className="border-b-2 border-[#7c866f] pb-2 font-medium">Today</span><Link href="/wellness#medications-supplements" className="pb-2 text-[#918780]">All Medications</Link><Link href="/wellness#medications-supplements" className="pb-2 text-[#918780]">Supplements</Link><span className="pb-2 text-[#b0a7a1]">Refills</span><span className="pb-2 text-[#b0a7a1]">History</span></nav>
    <section className="grid gap-3 lg:grid-cols-[1.12fr_.88fr]">
      <div className="space-y-3"><h2 className="text-[10px] font-medium">Today&apos;s Schedule</h2>{Object.entries(groups).map(([time,items])=><div key={time} className="rounded-[10px] border border-[#eee6e1] bg-white p-4 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><p className="text-[9px] font-semibold uppercase tracking-[.08em] text-[#625a55]">{time}</p><div className="mt-3 space-y-2">{items.map(item=><Link key={`${item.kind}-${item.id}`} href={`/wellness?${item.kind==='medication'?'medicationId':'supplementId'}=${encodeURIComponent(item.id)}#medications-supplements`} className="flex items-center justify-between gap-3 rounded-[8px] px-2 py-1.5 hover:bg-[#fbf8f5]"><span className="flex items-center gap-2 text-[10px]"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f7eeed] text-[#a95d6d]">{item.kind==='medication'?<Pill size={11}/>:<Sparkles size={11}/>}</span>{item.name}{item.dosage?<span className="text-[#9a9088]">{item.dosage}</span>:null}</span><Check size={13} className="text-[#75866c]"/></Link>)}</div></div>)}{all.length===0?<div className="rounded-[10px] border border-[#eee6e1] bg-white p-5 text-[10px] text-[#9a9088]">No active medications or supplements are saved yet.</div>:null}</div>
      <div className="space-y-3"><div className="rounded-[10px] border border-[#eee6e1] bg-white p-4 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><h2 className="text-[10px] font-medium">Refills Needed</h2><p className="mt-4 text-[10px] leading-5 text-[#8b817a]">Refill dates are not stored in the current medication schema, so Glow does not invent due dates.</p><Link href="/wellness#medications-supplements" className="mt-4 inline-flex text-[9px] font-medium text-[#ad566a]">Manage medication records →</Link></div><div className="rounded-[10px] border border-[#eee6e1] bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Adherence This Week</h2><span className="text-[9px] text-[#9a9088]">—</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f0ece8]"><div className="h-full w-0 rounded-full bg-[#77866c]"/></div><p className="mt-3 text-[9px] leading-4 text-[#9a9088]">Taken/skipped history is not stored yet. This panel remains honest instead of showing fake adherence.</p></div><div className="rounded-[10px] border border-[#eee6e1] bg-white p-4"><h2 className="text-[10px] font-medium">Questions for Doctor</h2><p className="mt-4 text-[10px] text-[#9a9088]">Use the notes field on an exact medication or supplement record to keep appointment questions with the item.</p><Link href="/wellness#medications-supplements" className="mt-4 inline-flex text-[9px] font-medium text-[#ad566a]">Open medication records →</Link></div></div>
    </section>
  </div></AppShell>;
}
function groupByTime<T extends {timeOfDay:string|null}>(items:T[]){const buckets:Record<string,T[]>={};for(const item of items){const raw=(item.timeOfDay||'Any time').trim();const key=raw||'Any time';(buckets[key]??=[]).push(item);}return buckets;}
