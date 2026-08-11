import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createAiProposalAction, decideAiProposalAction } from '@/app/actions/completion-v1';
import { getAiProposals, getAuditEvents } from '@/lib/data/completion-v1';
import { Check, ShieldCheck, Sparkles, X } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function ConciergePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [proposals,audit]=await Promise.all([getAiProposals(session.user.id),getAuditEvents(session.user.id)]);
  const pending=proposals.filter((p)=>p.status==='pending').length;
  return <AppShell><SectionPage eyebrow="AI Concierge" title="Ask, propose, approve" description="Glow OS can analyze immediately, but important changes stay behind an explicit approval step.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eee6ef,#f6efeb)] p-5"><ShieldCheck size={52} strokeWidth={.8} className="absolute right-5 top-3 text-[#7e6b83]/16"/><p className="glow-eyebrow">Service desk</p><p className="glow-display mt-2 text-[24px] text-[#4d414d]">Glow can suggest. You stay in control.</p><p className="mt-2 text-[9px] leading-4 text-[#796d78]">{pending} proposal{pending===1?'':'s'} currently waiting for a decision.</p></Card>
      <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <Card className="paper-card"><form action={createAiProposalAction} className="space-y-3"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#806b85]"/><h2 className="glow-display text-[20px] text-[#4d414d]">Create a proposal</h2></div><input name="intent" required placeholder="Intent, e.g. Make today lighter" className={fieldClass}/><textarea name="summary" required rows={3} placeholder="What should change?" className={fieldClass}/><textarea name="reason" required rows={4} placeholder="Why is this recommended?" className={fieldClass}/><button className="rounded-[6px] bg-[#443a44] px-4 py-2 text-[9px] text-white">Create proposal</button></form></Card>
        <Card className="p-0 overflow-hidden"><div className="border-b border-[#e4dae4] px-5 py-4"><p className="glow-eyebrow">Approval queue</p><h2 className="glow-display mt-1 text-[19px] text-[#4d414d]">Proposal queue</h2></div>{proposals.length===0?<p className="p-8 text-center text-[9px] text-[#897d88]">No proposals yet.</p>:<div className="divide-y divide-[#ebe3ea]">{proposals.map((p,index)=><div key={p.id} className={`p-4 ${index===0&&p.status==='pending'?'bg-[#f0e5ef]/55':''}`}><div className="flex justify-between gap-3"><div><p className="glow-display text-[14px] text-[#4c404c]">{p.summary}</p><p className="mt-1 text-[8px] leading-4 text-[#7c707b]">{p.reason}</p></div><span className="h-fit rounded-full bg-white/50 px-2 py-1 text-[7px] uppercase text-[#847784]">{p.status}</span></div><p className="mt-2 text-[7px] text-[#998d98]">Confidence {Math.round(p.confidence*100)}% · {p.reversible?'Reversible':'Review carefully'}</p>{p.status==='pending'?<div className="mt-3 flex gap-2"><form action={decideAiProposalAction.bind(null,p.id,'approved')}><button className="inline-flex items-center gap-1 rounded-[6px] bg-[#485047] px-3 py-2 text-[8px] text-white"><Check size={9}/>Approve</button></form><form action={decideAiProposalAction.bind(null,p.id,'rejected')}><button className="inline-flex items-center gap-1 rounded-[6px] border border-[#ded3dd] px-3 py-2 text-[8px] text-[#6e626d]"><X size={9}/>Reject</button></form></div>:null}</div>)}</div>}</Card>
      </div>
      <Card className="p-0 overflow-hidden"><div className="border-b border-[#e4dae4] px-5 py-4"><p className="glow-eyebrow">Audit ribbon</p><h2 className="glow-display mt-1 text-[17px] text-[#4d414d]">Decision history</h2></div><div className="divide-y divide-[#ece5eb]">{audit.length===0?<p className="p-6 text-[9px] text-[#897d88]">No approved or rejected actions yet.</p>:audit.slice(0,12).map((a)=><div key={a.id} className="flex justify-between gap-3 px-5 py-3 text-[8px]"><span className="text-[#685d67]">{a.action}</span><span className="text-[#998d98]">{a.createdAt.toLocaleString()}</span></div>)}</div></Card>
    </div>
  </SectionPage></AppShell>;
}
