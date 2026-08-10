import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFinanceGoalAction } from '@/app/actions/completion-v1';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

export default async function FinanceBrainPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const [goals, entries] = await Promise.all([getFinanceGoals(session.user.id), getFinanceEntriesByUser(session.user.id)]);
  const income = entries.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const expenses = entries.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  return <AppShell><SectionPage eyebrow="Financial Brain" title="See the direction of your money" description="Use your existing finance records for trends and pair them with savings or debt goals. Glow OS never moves money automatically.">
    <div className="grid gap-4 sm:grid-cols-3"><Card><p className="text-sm text-slate-500">Recorded income</p><p className="mt-2 text-3xl font-semibold">${income.toFixed(2)}</p></Card><Card><p className="text-sm text-slate-500">Recorded expenses</p><p className="mt-2 text-3xl font-semibold">${expenses.toFixed(2)}</p></Card><Card><p className="text-sm text-slate-500">Net records</p><p className="mt-2 text-3xl font-semibold">${(income-expenses).toFixed(2)}</p></Card></div>
    <div className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createFinanceGoalAction} className="space-y-3"><h2 className="text-xl font-semibold">Add financial goal</h2><input name="name" required placeholder="Goal name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><select name="goalType" defaultValue="savings" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"><option value="savings">Savings</option><option value="debt">Debt payoff</option><option value="travel">Travel</option><option value="emergency">Emergency fund</option><option value="purchase">Purchase</option></select><input name="target" required inputMode="decimal" placeholder="Target amount" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="current" inputMode="decimal" placeholder="Current amount" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="targetDate" type="date" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="notes" rows={3} placeholder="Notes / scenario" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save goal</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Goals</h2>{goals.length===0?<p className="text-sm text-slate-500">No financial goals yet.</p>:goals.map(goal=>{const progress=Math.max(0,Math.min(100,goal.targetCents?goal.currentCents/goal.targetCents*100:0));return <div key={goal.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><div><p className="font-semibold">{goal.name}</p><p className="text-sm capitalize text-slate-500">{goal.goalType}</p></div><span className="text-sm">{Math.round(progress)}%</span></div><div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-2 rounded-full bg-slate-900 dark:bg-white" style={{width:`${progress}%`}}/></div><p className="mt-2 text-xs text-slate-400">${(goal.currentCents/100).toFixed(2)} of ${(goal.targetCents/100).toFixed(2)}</p></div>})}</Card>
    </div>
  </SectionPage></AppShell>;
}
