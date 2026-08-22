import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { FinancialBrainObservatory } from '@/components/finance/financial-brain-observatory';
import { createFinanceGoalAction } from '@/app/actions/completion-v1';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { CircleDollarSign, PiggyBank } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass='w-full rounded-xl border border-white/15 bg-white/[.07] px-3.5 py-2.5 text-[11px] text-[#F4F1E8] placeholder:text-[#8E9098] focus:border-[#CDBF9B]/60 focus:outline-none';

export default async function FinanceBrainPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const [goals,entries]=await Promise.all([
    getFinanceGoals(session.user.id),
    getFinanceEntriesByUser(session.user.id),
  ]);
  const generatedAt=new Date().toISOString();

  return <AppShell>
    <div className="space-y-5">
      <FinancialBrainObservatory entries={entries} goals={goals} generatedAt={generatedAt}/>
      <details id="add-finance-goal" className="rounded-[30px] border border-white/10 bg-[#1D2029] p-5 text-[#F4F1E8] shadow-[0_24px_90px_rgba(0,0,0,.18)]">
        <summary className="cursor-pointer list-none"><div className="flex items-center gap-2"><CircleDollarSign className="h-4 w-4 text-[#D2C39B]"/><span className="glow-display text-[18px]">Add a Financial Goal</span></div><p className="mt-1 text-[10px] text-[#9698A1]">Server-backed Finance Goal. Expand only when you want to create a target.</p></summary>
        <form action={createFinanceGoalAction} className="mt-5 grid gap-3">
          <input name="name" required placeholder="Goal name" className={fieldClass}/>
          <select name="goalType" defaultValue="savings" className={fieldClass}><option value="savings">Savings</option><option value="debt">Debt payoff</option><option value="travel">Travel</option><option value="emergency">Emergency fund</option><option value="purchase">Purchase</option></select>
          <div className="grid gap-3 sm:grid-cols-2"><input name="target" required inputMode="decimal" placeholder="Target amount" className={fieldClass}/><input name="current" inputMode="decimal" placeholder="Current amount" className={fieldClass}/></div>
          <input name="targetDate" type="date" className={fieldClass}/>
          <textarea name="notes" rows={2} placeholder="Notes / scenario" className={fieldClass}/>
          <button className="w-fit rounded-full bg-[#EEE7D6] px-4 py-2 text-xs font-medium text-[#242630]"><PiggyBank className="mr-2 inline h-4 w-4"/>Save goal</button>
        </form>
      </details>
    </div>
  </AppShell>;
}
