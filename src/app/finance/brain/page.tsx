import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFinanceGoalAction } from '@/app/actions/completion-v1';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { Calculator, PiggyBank, ShieldCheck, Sparkles, TrendingUp, WalletCards } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full border px-4 py-3 text-[10px]';

function money(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function monthKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export default async function FinanceBrainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [goals, entries] = await Promise.all([
    getFinanceGoals(session.user.id),
    getFinanceEntriesByUser(session.user.id),
  ]);

  const income = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const savings = entries.filter((entry) => entry.type === 'saving').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const net = income - expenses;

  const monthly = new Map<string, { income: number; expenses: number; savings: number }>();
  for (const entry of entries) {
    const key = monthKey(entry.entryDate);
    const bucket = monthly.get(key) ?? { income: 0, expenses: 0, savings: 0 };
    if (entry.type === 'income') bucket.income += Number(entry.amount);
    if (entry.type === 'expense') bucket.expenses += Number(entry.amount);
    if (entry.type === 'saving') bucket.savings += Number(entry.amount);
    monthly.set(key, bucket);
  }

  const recentMonths = [...monthly.entries()].sort(([a], [b]) => b.localeCompare(a)).slice(0, 3);
  const monthCount = Math.max(1, recentMonths.length);
  const avgIncome = recentMonths.reduce((sum, [, value]) => sum + value.income, 0) / monthCount;
  const avgExpenses = recentMonths.reduce((sum, [, value]) => sum + value.expenses, 0) / monthCount;
  const avgSavings = recentMonths.reduce((sum, [, value]) => sum + value.savings, 0) / monthCount;
  const avgSurplus = avgIncome - avgExpenses;
  const savingsRate = avgIncome > 0 ? ((avgSavings + Math.max(0, avgSurplus)) / avgIncome) * 100 : 0;

  const subscriptionAverage = recentMonths.reduce((sum, [, value], index) => {
    const key = recentMonths[index]?.[0];
    if (!key) return sum;
    return sum + entries.filter((entry) => entry.type === 'expense' && entry.category === 'subscriptions' && monthKey(entry.entryDate) === key).reduce((subtotal, entry) => subtotal + Number(entry.amount), 0);
  }, 0) / monthCount;

  const nextMonthBaseline = avgSurplus;
  const trim10 = avgIncome - avgExpenses * 0.9;
  const trimSubscriptions = avgSurplus + subscriptionAverage * 0.25;
  const protect15 = avgIncome * 0.15;
  const affordabilityBuffer = Math.max(0, avgSurplus * 0.35);

  const now = new Date();
  const goalPaces = goals.map((goal) => {
    const remaining = Math.max(0, (goal.targetCents - goal.currentCents) / 100);
    const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
    const monthsRemaining = targetDate ? Math.max(1, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.4))) : null;
    const neededMonthly = monthsRemaining ? remaining / monthsRemaining : null;
    return { ...goal, remaining, monthsRemaining, neededMonthly };
  });

  const highestPressureGoal = goalPaces
    .filter((goal) => goal.neededMonthly !== null && goal.remaining > 0)
    .sort((a, b) => (b.neededMonthly ?? 0) - (a.neededMonthly ?? 0))[0];

  const affordabilityMessage = avgIncome === 0
    ? 'Add a few income and expense entries so Glow OS can estimate a safe discretionary buffer.'
    : avgSurplus <= 0
      ? 'Your recent baseline does not show a surplus yet. Treat new discretionary purchases cautiously until the monthly picture improves.'
      : `A conservative discretionary buffer is about ${money(affordabilityBuffer)} per month while preserving most of your recent surplus.`;

  return (
    <AppShell>
      <SectionPage eyebrow="Financial Brain" title="See the direction of your money" description="Forecast from your real records, compare safer scenarios, and understand what your goals require. Glow OS never moves money automatically.">
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-4">
            <Card className="relative overflow-hidden">
              <WalletCards size={34} strokeWidth={0.8} className="absolute right-3 top-3 text-[#71806a]/18" />
              <p className="text-[8px] text-[#788372]">Recorded income</p>
              <p className="glow-display mt-2 text-[24px] text-[#41503d]">{money(income)}</p>
            </Card>
            <Card>
              <p className="text-[8px] text-[#788372]">Recorded expenses</p>
              <p className="glow-display mt-2 text-[24px] text-[#5e4c43]">{money(expenses)}</p>
            </Card>
            <Card>
              <p className="text-[8px] text-[#788372]">Recorded savings</p>
              <p className="glow-display mt-2 text-[24px] text-[#7e6748]">{money(savings)}</p>
            </Card>
            <Card className="bg-[linear-gradient(145deg,#edf1e8,#f8f2eb)]">
              <p className="text-[8px] text-[#788372]">Net records</p>
              <p className={`glow-display mt-2 text-[24px] ${net >= 0 ? 'text-[#52634d]' : 'text-[#9b6065]'}`}>{money(net)}</p>
            </Card>
          </section>

          <section className="grid gap-3 lg:grid-cols-3">
            <Card className="paper-card lg:col-span-2">
              <div className="flex items-start gap-3">
                <TrendingUp size={16} className="mt-0.5 text-[#71806a]" />
                <div className="min-w-0 flex-1">
                  <p className="glow-eyebrow">30-day outlook</p>
                  <h2 className="glow-display mt-1 text-[20px] text-[#43503f]">Baseline forecast</h2>
                  <p className="mt-2 text-[8px] leading-4 text-[#7d8877]">Built from up to your three most recent months of logged income and expenses.</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[8px] bg-[#f4f6f1] p-4"><p className="text-[7px] uppercase tracking-[.12em] text-[#83907d]">Avg income</p><p className="glow-display mt-2 text-[18px] text-[#4d5c48]">{money(avgIncome)}</p></div>
                <div className="rounded-[8px] bg-[#f7f2ee] p-4"><p className="text-[7px] uppercase tracking-[.12em] text-[#8d7d74]">Avg expenses</p><p className="glow-display mt-2 text-[18px] text-[#745e55]">{money(avgExpenses)}</p></div>
                <div className="rounded-[8px] bg-[#eef2ea] p-4"><p className="text-[7px] uppercase tracking-[.12em] text-[#7d8978]">Projected surplus</p><p className={`glow-display mt-2 text-[18px] ${nextMonthBaseline >= 0 ? 'text-[#52634d]' : 'text-[#9b6065]'}`}>{money(nextMonthBaseline)}</p></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[8px] text-[#74806f]"><span className="rounded-full bg-white/70 px-3 py-1.5">Savings pace {Math.max(0, savingsRate).toFixed(0)}%</span><span className="rounded-full bg-white/70 px-3 py-1.5">Subscriptions avg {money(subscriptionAverage)}/mo</span></div>
            </Card>

            <Card className="bg-[linear-gradient(155deg,#eef2ea,#f7f0e9)]">
              <div className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#71806a]" /><p className="glow-eyebrow">Affordability</p></div>
              <h2 className="glow-display mt-2 text-[19px] text-[#43503f]">Purchase guardrail</h2>
              <p className="mt-3 text-[9px] leading-5 text-[#6f7b6a]">{affordabilityMessage}</p>
              <p className="mt-4 text-[7px] leading-4 text-[#899184]">This is planning guidance from logged data, not financial advice or an automatic spending approval.</p>
            </Card>
          </section>

          <section className="grid gap-3 lg:grid-cols-3">
            <Card>
              <div className="flex items-center gap-2"><Calculator size={14} className="text-[#71806a]" /><p className="glow-eyebrow">Scenario A</p></div>
              <h3 className="glow-display mt-2 text-[17px] text-[#45513f]">Trim expenses 10%</h3>
              <p className="mt-2 text-[8px] leading-4 text-[#7c8676]">Projected monthly surplus becomes <span className="font-medium text-[#52634d]">{money(trim10)}</span>.</p>
              <p className="mt-3 text-[7px] text-[#889184]">Difference from baseline: {money(trim10 - avgSurplus)}.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#8b775b]" /><p className="glow-eyebrow">Scenario B</p></div>
              <h3 className="glow-display mt-2 text-[17px] text-[#45513f]">Reduce subscriptions 25%</h3>
              <p className="mt-2 text-[8px] leading-4 text-[#7c8676]">Projected monthly surplus becomes <span className="font-medium text-[#52634d]">{money(trimSubscriptions)}</span>.</p>
              <p className="mt-3 text-[7px] text-[#889184]">Potential monthly lift: {money(subscriptionAverage * 0.25)}.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2"><PiggyBank size={14} className="text-[#987d52]" /><p className="glow-eyebrow">Scenario C</p></div>
              <h3 className="glow-display mt-2 text-[17px] text-[#45513f]">Protect 15% of income</h3>
              <p className="mt-2 text-[8px] leading-4 text-[#7c8676]">A 15% savings target equals <span className="font-medium text-[#7e6748]">{money(protect15)}</span> per month at your recent income pace.</p>
              <p className="mt-3 text-[7px] text-[#889184]">Compare this with your current average savings of {money(avgSavings)}.</p>
            </Card>
          </section>

          <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
            <Card className="paper-card">
              <form action={createFinanceGoalAction} className="space-y-3">
                <div className="flex items-center gap-2"><PiggyBank size={15} className="text-[#71806a]" /><div><p className="glow-eyebrow">Goal ledger</p><h2 className="glow-display mt-1 text-[20px] text-[#43503f]">Add financial goal</h2></div></div>
                <input name="name" required placeholder="Goal name" className={fieldClass} />
                <select name="goalType" defaultValue="savings" className={fieldClass}><option value="savings">Savings</option><option value="debt">Debt payoff</option><option value="travel">Travel</option><option value="emergency">Emergency fund</option><option value="purchase">Purchase</option></select>
                <input name="target" required inputMode="decimal" placeholder="Target amount" className={fieldClass} />
                <input name="current" inputMode="decimal" placeholder="Current amount" className={fieldClass} />
                <input name="targetDate" type="date" className={fieldClass} />
                <textarea name="notes" rows={3} placeholder="Notes / scenario" className={fieldClass} />
                <button className="rounded-[6px] bg-[#3e493a] px-4 py-2 text-[9px] font-medium text-white">Save goal</button>
              </form>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between gap-3 border-b border-[#dfe5da] px-5 py-4">
                <div className="flex items-center gap-2"><TrendingUp size={14} className="text-[#71806a]" /><div><p className="glow-eyebrow">Savings intelligence</p><h2 className="glow-display mt-1 text-[19px] text-[#43503f]">Goal pace</h2></div></div>
                {highestPressureGoal && <span className="rounded-full bg-[#f3eee7] px-3 py-1.5 text-[7px] text-[#7f6d59]">Highest pace: {highestPressureGoal.name}</span>}
              </div>
              {goalPaces.length === 0 ? <div className="p-8 text-center"><p className="text-[9px] text-[#7d8877]">No financial goals yet.</p><p className="mt-2 text-[8px] text-[#969e92]">Add a savings, debt, travel, emergency, or purchase goal to see required monthly pace.</p></div> : <div className="divide-y divide-[#e5e9e1]">{goalPaces.map((goal, index) => {
                const progress = Math.max(0, Math.min(100, goal.targetCents ? goal.currentCents / goal.targetCents * 100 : 0));
                const paceGap = goal.neededMonthly !== null ? avgSurplus - goal.neededMonthly : null;
                return <div key={goal.id} className={`p-4 ${index === 0 ? 'bg-[#edf2ea]/60' : ''}`}>
                  <div className="flex justify-between gap-3"><div><p className="glow-display text-[15px] text-[#44523f]">{goal.name}</p><p className="mt-0.5 text-[7px] uppercase tracking-[.12em] text-[#81907b]">{goal.goalType}</p></div><span className="glow-display text-[14px] text-[#61705c]">{Math.round(progress)}%</span></div>
                  <div className="mt-3 h-1.5 rounded-full bg-[#e5ebe1]"><div className="h-1.5 rounded-full bg-[#84977c]" style={{ width: `${progress}%` }} /></div>
                  <div className="mt-2 flex flex-wrap justify-between gap-2 text-[7px] text-[#879083]"><span>{money(goal.currentCents / 100)} of {money(goal.targetCents / 100)}</span><span>{money(goal.remaining)} remaining</span></div>
                  {goal.neededMonthly !== null && <p className={`mt-2 text-[8px] ${paceGap !== null && paceGap >= 0 ? 'text-[#5f745a]' : 'text-[#9a6868]'}`}>Needs about {money(goal.neededMonthly)}/month for the next {goal.monthsRemaining} month{goal.monthsRemaining === 1 ? '' : 's'}. {paceGap !== null && paceGap >= 0 ? 'Your recent surplus can cover that pace.' : 'That pace is above your recent surplus.'}</p>}
                </div>;
              })}</div>}
            </Card>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
