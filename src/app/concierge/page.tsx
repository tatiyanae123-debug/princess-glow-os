import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { createConciergeProposalAction, decideConciergeProposalAction, reverseConciergeProposalAction } from '@/app/actions/concierge';
import { getAiProposals } from '@/lib/data/completion-v1';
import { Check, RotateCcw, Sparkles, X } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass='w-full rounded-[8px] border border-[#eee4e0] bg-white px-3 py-2 text-[9px] outline-none focus:border-[#c86a7b]';
type Payload=Record<string,unknown>&{actionType?:string;task?:{title?:string;priority?:string;dueDate?:string|null};execution?:{entityType?:string;entityId?:string;reversedAt?:string}};
const payloadOf=(v:unknown)=>v&&typeof v==='object'?v as Payload:{};

export default async function ConciergePage(){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const proposals=await getAiProposals(s.user.id);
 const active=proposals.filter(p=>p.status==='pending').slice(0,4);
 const upcoming=proposals.filter(p=>p.status!=='pending').slice(0,3);
 return <AppShell><div className="batch2-page space-y-4">
  <header><p className="batch2-kicker">2. Concierge</p><h1 className="batch2-title mt-3">Concierge</h1><p className="batch2-subtitle">Your personal assistant, anticipating and handling the details.</p></header>
  <nav className="batch2-tabs"><span className="active">Requests</span><Link href="/planning">Planning</Link><Link href="/calendar">Reservations</Link><Link href="/projects">Shopping</Link><Link href="/search">Research</Link></nav>
  <section>
   <div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-[15px]">Today&apos;s Requests</h2><details className="relative"><summary className="batch2-btn list-none cursor-pointer">+ New Request</summary><form action={createConciergeProposalAction} className="absolute right-0 z-30 mt-2 w-[330px] space-y-2 rounded-[12px] border border-[#eee4e0] bg-white p-4 shadow-xl"><input type="hidden" name="actionType" value="advisory"/><input name="intent" required placeholder="Request" className={fieldClass}/><textarea name="summary" required rows={2} placeholder="What should Glow help with?" className={fieldClass}/><textarea name="reason" required rows={3} placeholder="Why does this matter?" className={fieldClass}/><button className="batch2-btn batch2-btn-primary w-full">Save request</button></form></details></div>
   <div className="batch2-request-list">{active.length?active.map((p,i)=>{const payload=payloadOf(p.payload);return <div key={p.id} className="batch2-row batch2-request-item"><span className="grid h-6 w-6 place-items-center rounded-[6px] border border-[#eee6e2] text-[#b45d70]">{i+1}</span><div><p className="text-[9px] font-medium">{p.summary}</p><p className="batch2-mini mt-1 line-clamp-1">{p.reason}</p></div><span className="batch2-mini">{p.createdAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><div className="flex gap-1"><form action={decideConciergeProposalAction.bind(null,p.id,'approved')}><button className="rounded-[6px] bg-[#edf3e9] px-2 py-1.5 text-[7.5px] text-[#61755a]"><Check size={9}/></button></form><form action={decideConciergeProposalAction.bind(null,p.id,'rejected')}><button className="rounded-[6px] border border-[#eee4e0] px-2 py-1.5 text-[7.5px] text-[#9b7b75]"><X size={9}/></button></form>{payload.actionType==='create_task'?<span className="batch2-mini self-center">Task</span>:null}</div></div>}):<div className="batch2-card p-7 text-center text-[9px] text-[#968b84]">No pending requests. Add one when you want Glow to help coordinate something.</div>}</div>
  </section>
  <section><h2 className="mb-3 font-serif text-[15px]">Upcoming</h2><div className="grid gap-3 sm:grid-cols-3">{upcoming.length?upcoming.map(p=>{const payload=payloadOf(p.payload);const canReverse=p.status==='approved'&&p.reversible&&payload.execution?.entityId&&!payload.execution.reversedAt;return <div key={p.id} className="batch2-card min-h-[115px] p-4"><p className="text-[8px] font-medium line-clamp-2">{p.summary}</p><p className="batch2-mini mt-3 capitalize">{p.status}</p>{canReverse?<form action={reverseConciergeProposalAction.bind(null,p.id)} className="mt-3"><button className="inline-flex items-center gap-1 text-[7.5px] text-[#b45d70]"><RotateCcw size={9}/>Undo action</button></form>:null}</div>}):['Travel planning','Client dinner','Interview prep'].map(label=><div key={label} className="batch2-card min-h-[115px] p-4"><p className="text-[8px] font-medium">{label}</p><p className="batch2-mini mt-3">No saved request yet</p></div>)}</div></section>
  <section className="batch2-card grid min-h-[120px] items-center overflow-hidden p-5 sm:grid-cols-[120px_1fr] bg-[linear-gradient(100deg,#f6eee8,#fff)]"><div className="h-[78px] rounded-[9px] bg-[radial-gradient(circle_at_40%_35%,#fff,#e6d8cc_60%,#cbb7a7)]"/><div className="px-5"><Sparkles size={12} className="text-[#b55d70]"/><p className="mt-2 font-serif text-[18px] leading-6">How can I help make<br/>your life easier today?</p><Link href="/search" className="mt-2 inline-block text-[8px] text-[#b45d70]">Ask Glow →</Link></div></section>
 </div></AppShell>;
}
