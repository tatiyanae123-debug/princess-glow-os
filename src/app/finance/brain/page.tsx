import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFinanceGoalAction } from '@/app/actions/completion-v1';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { PiggyBank, TrendingUp, WalletCards } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function FinanceBrainPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [goals,entries]=await Promise.all([getFinanceGoals(session.user.id),getFinanceEntriesByUser(session.user.id)]);
  const income=entries.filter((e)=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const expenses=entries.filter((e)=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  const net=income-expenses;

  return <AppShell><SectionPage eyebrow="Financial Brain" title="See the direction of your money" description="Use your existing finance records for trends and pair them with savings or debt goals. Glow OS never moves money automatically.">
    <div className="space-y-4">
      <section className="grid gap-3 sm:grid-cols-3"><Card className="relative overflow-hidden"><WalletCards size={34} strokeWidth={.8} className="absolute right-3 top-3 text-[#71806a]/18"/><p className="text-[8px] text-[#788372]">Recorded income</p><p className="glow-display mt-2 text-[25px] text-[#41503d]">${income.toFixed(2)}</p></Card><Card><p className="text-[8px] text-[#788372]">Recorded expenses</p><p className="glow-display mt-2 text-[25px] text-[#5e4c43]">${expenses.toFixed(2)}</p></Card><Card className="bg-[linear-gradient(145deg,#edf1e8,#f8f2eb)]"><p className="text-[8px] text-[#788372]">Net records</p><p className={`glow-display mt-2 text-[25px] ${net>=0?'text-[#52634d]':'text-[#9b6065]'}`}>${net.toFixed(2)}</p></Card></section>
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <Card className="paper-card"><form action={createFinanceGoalAction} className="space-y-3"><div className="flex items-center gap-2"><PiggyBank size={15} className="text-[#71806a]"/><div><p className="glow-eyebrow">Goal ledger</p><h2 className="glow-display mt-1 text-[20px] text-[#43503f]">Add financial goal</h2></div></div><input name="name" required placeholder="Goal name" className={fieldClass}/><select name="goalType" defaultValue="savings" className={fieldClass}><option value="savings">Savings</option><option value="debt">Debt payoff</option><option value="travel">Travel</option><option value="emergency">Emergency fund</option><option value="purchase">Purchase</option></select><input name="target" required inputMode="decimal" placeholder="Target amount" className={fieldClass}/><input name="current" inputMode="decimal" placeholder="Current amount" className={fieldClass}/><input name="targetDate" type="date" className={fieldClass}/><textarea name="notes" rows={3} placeholder="Notes / scenario" className={fieldClass}/><button className="rounded-[6px] bg-[#3e493a] px-4 py-2 text-[9px] font-medium text-white">Save goal</button></form></Card>
        <Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#dfe5da] px-5 py-4"><TrendingUp size={14} className="text-[#71806a]"/><div><p className="glow-eyebrow">Direction</p><h2 className="glow-display mt-1 text-[19px] text-[#43503f]">Goals</h2></div></div>{goals.length===0?<p className="p-8 text-center text-[9px] text-[#7d8877]">No financial goals yet.</p>:<div className="divide-y divide-[#e5e9e1]">{goals.map((goal,index)=>{const progress=Math.max(0,Math.min(100,goal.targetCents?goal.currentCents/goal.targetCents*100:0));return <div key={goal.id} className={`p-4 ${index===0?'bg-[#edf2ea]/60':''}`}><div className="flex justify-between gap-3"><div><p className="glow-display text-[15px] text-[#44523f]">{goal.name}</p><p className="mt-0.5 text-[7px] uppercase tracking-[.12em] text-[#81907b]">{goal.goalType}</p></div><span className="glow-display text-[14px] text-[#61705c]">{Math.round(progress)}%</span></div><div className="mt-3 h-1.5 rounded-full bg-[#e5ebe1]"><div className="h-1.5 rounded-full bg-[#84977c]" style={{width:`${progress}%`}}/></div><p className="mt-2 text-[7px] text-[#879083]">${(goal.currentCents/100).toFixed(2)} of ${(goal.targetCents/100).toFixed(2)}</p></div>;})}</div>}</Card>
      </div>
    </div>
  </SectionPage></AppShell>;
}
