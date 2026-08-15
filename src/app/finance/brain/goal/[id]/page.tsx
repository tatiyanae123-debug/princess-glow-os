import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { updateFinanceGoalAction } from '@/app/actions/completion-v1';

export const dynamic='force-dynamic';
const F='w-full rounded-[10px] border border-[#F7D1D8] bg-white px-3 py-2.5 text-[12px] text-[#2B2420] outline-none focus:border-[#C9727E]';
export default async function FinanceGoalDetail({params}:{params:Promise<{id:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const {id}=await params;const goals=await getFinanceGoals(session.user.id);const goal=goals.find((item)=>item.id===id);if(!goal)notFound();
  const progress=goal.targetCents?Math.max(0,Math.min(100,goal.currentCents/goal.targetCents*100)):0;
  return <AppShell><div className="mx-auto max-w-3xl space-y-5"><div><Link href="/finance/brain" className="text-[11px] text-[#C9727E]">← Financial Brain</Link><p className="glow-eyebrow mt-4">Financial goal</p><h1 className="glow-display mt-1 text-[36px] text-[#2B2420]">{goal.name}</h1><p className="mt-2 text-[12px] text-[#8A8078]">This is the exact saved goal you selected.</p></div><Card><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.1em] text-[#8A8078]">Progress</p><p className="glow-display mt-1 text-[25px] text-[#C9727E]">{progress.toFixed(0)}%</p></div><p className="text-right text-[11px] text-[#8A8078]">${(goal.currentCents/100).toFixed(2)} of ${(goal.targetCents/100).toFixed(2)}</p></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#F7EEED]"><div className="h-full rounded-full bg-[#C9727E]" style={{width:`${progress}%`}}/></div></Card><Card><form action={updateFinanceGoalAction.bind(null,goal.id)} className="space-y-3"><label className="block text-[10.5px] text-[#8A8078]">Target amount<input name="target" inputMode="decimal" defaultValue={(goal.targetCents/100).toFixed(2)} className={`mt-1 ${F}`}/></label><label className="block text-[10.5px] text-[#8A8078]">Current amount<input name="current" inputMode="decimal" defaultValue={(goal.currentCents/100).toFixed(2)} className={`mt-1 ${F}`}/></label><label className="block text-[10.5px] text-[#8A8078]">Target date<input name="targetDate" type="date" defaultValue={goal.targetDate?new Date(goal.targetDate).toISOString().slice(0,10):''} className={`mt-1 ${F}`}/></label><label className="block text-[10.5px] text-[#8A8078]">Notes<textarea name="notes" rows={4} defaultValue={goal.notes??''} className={`mt-1 ${F}`}/></label><button type="submit" className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white">Save goal changes</button></form></Card></div></AppShell>;
}
