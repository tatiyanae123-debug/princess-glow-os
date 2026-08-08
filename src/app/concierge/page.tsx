import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createAiProposalAction, decideAiProposalAction } from '@/app/actions/completion-v1';
import { getAiProposals, getAuditEvents } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function ConciergePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [proposals, audit] = await Promise.all([getAiProposals(session.user.id), getAuditEvents(session.user.id)]);
  return <AppShell><SectionPage eyebrow="AI Concierge" title="Ask, propose, approve" description="Glow OS can analyze immediately, but important changes stay behind an explicit approval step.">
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <Card><form action={createAiProposalAction} className="space-y-3"><h2 className="text-xl font-semibold">Create a proposal</h2><input name="intent" required placeholder="Intent, e.g. Make today lighter" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="summary" required rows={3} placeholder="What should change?" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="reason" required rows={4} placeholder="Why is this recommended?" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Create proposal</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Proposal queue</h2>{proposals.length===0?<p className="text-sm text-slate-500">No proposals yet.</p>:proposals.map(p=><div key={p.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><div><p className="font-semibold">{p.summary}</p><p className="mt-1 text-sm text-slate-500">{p.reason}</p></div><span className="text-xs uppercase text-slate-400">{p.status}</span></div><p className="mt-2 text-xs text-slate-400">Confidence {Math.round(p.confidence*100)}% · {p.reversible?'Reversible':'Review carefully'}</p>{p.status==='pending'&&<div className="mt-3 flex gap-2"><form action={decideAiProposalAction.bind(null,p.id,'approved')}><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Approve</button></form><form action={decideAiProposalAction.bind(null,p.id,'rejected')}><button className="rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">Reject</button></form></div>}</div>)}</Card>
    </div>
    <Card className="mt-5"><h2 className="text-lg font-semibold">Audit history</h2><div className="mt-3 space-y-2">{audit.length===0?<p className="text-sm text-slate-500">No approved/rejected actions yet.</p>:audit.slice(0,12).map(a=><div key={a.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"><span>{a.action}</span><span className="text-slate-400">{a.createdAt.toLocaleString()}</span></div>)}</div></Card>
  </SectionPage></AppShell>;
}
