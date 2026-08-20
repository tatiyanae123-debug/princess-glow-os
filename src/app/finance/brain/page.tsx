import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { createFinanceGoalAction } from '@/app/actions/completion-v1';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { ArrowRight, CircleDollarSign, PiggyBank, Plane, Scissors, Sparkles, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

const fieldClass = 'w-full rounded-lg border border-[#E8E1DC] bg-white px-3.5 py-2.5 text-[11px] text-[#2B2420] placeholder:text-[#A69E98] focus:border-[#71806A] focus:outline-none';

function money(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function dateValue(value: string | Date) {
  return value instanceof Date ? value : new Date(`${value}T12:00:00`);
}

function monthKey(value: string | Date) {
  const date = dateValue(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default async function FinanceBrainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [goals, entries] = await Promise.all([
    getFinanceGoals(session.user.id),
    getFinanceEntriesByUser(session.user.id),
  ]);

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousKey = `${previousDate.getFullYear()}-${String(previousDate.getMonth() + 1).padStart(2, '0')}`;

  const current = entries.filter((entry) => monthKey(entry.entryDate) === currentKey);
  const previous = entries.filter((entry) => monthKey(entry.entryDate) === previousKey);
  const allIncome = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const allExpenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const allSavings = entries.filter((entry) => entry.type === 'saving').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const income = current.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = current.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const savings = current.filter((entry) => entry.type === 'saving').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const previousExpenses = previous.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const cashFlow = income - expenses;
  const netWorthProxy = allIncome - allExpenses + allSavings;
  const savingsRate = income > 0 ? ((savings + Math.max(0, cashFlow)) / income) * 100 : 0;
  const spendingChange = previousExpenses > 0 ? ((expenses - previousExpenses) / previousExpenses) * 100 : 0;
  const subscriptionEntries = current.filter((entry) => entry.type === 'expense' && (entry.category || '').toLowerCase().includes('subscription'));

  const cashFlowScore = income > 0 ? clamp(50 + (cashFlow / income) * 100) : 50;
  const savingsScore = clamp(savingsRate * 3.2);
  const spendingScore = previousExpenses > 0 ? clamp(82 - Math.max(0, spendingChange) * 1.8) : 72;
  const goalScore = goals.length ? clamp(goals.reduce((sum, goal) => sum + (goal.targetCents ? goal.currentCents / goal.targetCents * 100 : 0), 0) / goals.length) : 65;
  const healthScore = Math.round((cashFlowScore + savingsScore + spendingScore + goalScore) / 4);
  const healthLabel = healthScore >= 80 ? 'Strong' : healthScore >= 65 ? 'Good' : healthScore >= 50 ? 'Steady' : 'Needs attention';

  const scenarios = [
    { icon: Target, title: 'What if I save $300 more?', detail: `${money(Math.max(0, cashFlow) + 300)} potential monthly surplus` },
    { icon: Scissors, title: 'What if I cut subscriptions?', detail: `${money(subscriptionEntries.reduce((sum, entry) => sum + Number(entry.amount), 0))} currently recorded` },
    { icon: Plane, title: 'What if I take this trip?', detail: goals.find((goal) => goal.goalType === 'travel')?.name || 'Add a travel goal to model it' },
  ];

  const notices = [
    previousExpenses > 0
      ? `You spent ${Math.abs(spendingChange).toFixed(0)}% ${spendingChange >= 0 ? 'more' : 'less'} than last month.`
      : 'Log another month of spending to unlock month-over-month patterns.',
    income > 0
      ? `Your savings rate is ${Math.max(0, savingsRate).toFixed(0)}% this month.${savingsRate >= 20 ? ' Great job staying consistent.' : ''}`
      : 'Add this month’s income to calculate your savings rate.',
    subscriptionEntries.length
      ? `You have ${subscriptionEntries.length} subscription ${subscriptionEntries.length === 1 ? 'charge' : 'charges'} recorded this month.`
      : 'No subscription expenses are recorded this month.',
  ];

  return (
    <AppShell>
      <SectionPage eyebrow="1. Financial Brain" title="Financial Brain" description="Understand your money. Make confident decisions.">
        <div className="batch5-brain-root">
          <section className="batch5-brain-position batch5-card">
            <div className="batch5-brain-position-main">
              <p className="batch5-eyebrow">Current Position</p>
              <span>Net Worth</span>
              <strong>{money(netWorthProxy)}</strong>
              <small>{cashFlow >= 0 ? '+' : '−'} {money(Math.abs(cashFlow))} this month</small>
            </div>
            <div className="batch5-brain-position-metrics">
              <div><span>Income (Month)</span><strong>{money(income)}</strong></div>
              <div><span>Expenses (Month)</span><strong>{money(expenses)}</strong></div>
              <div><span>Cash Flow</span><strong className={cashFlow >= 0 ? 'positive' : 'negative'}>{cashFlow >= 0 ? '+' : '−'}{money(Math.abs(cashFlow))}</strong></div>
            </div>
          </section>

          <div className="batch5-brain-two">
            <section className="batch5-card batch5-brain-notices">
              <div className="batch5-card-head"><h2>What Glow Notices</h2><Sparkles size={14} /></div>
              <div className="batch5-brain-notice-list">{notices.map((notice, index) => <div key={notice}><span>{index + 1}</span><p>{notice}</p></div>)}</div>
            </section>

            <section className="batch5-card batch5-brain-scenarios">
              <div className="batch5-card-head"><h2>Scenario Planner</h2><span>Explore</span></div>
              {scenarios.map(({ icon: Icon, title, detail }) => <div className="batch5-brain-scenario" key={title}><span><Icon size={14} /></span><div><strong>{title}</strong><small>{detail}</small></div><ArrowRight size={12} /></div>)}
            </section>
          </div>

          <div className="batch5-brain-two batch5-brain-lower">
            <section className="batch5-card batch5-brain-health">
              <div className="batch5-card-head"><h2>Financial Health</h2><span>From logged data</span></div>
              <div className="batch5-brain-health-grid">
                <div className="batch5-brain-score" style={{ background: `conic-gradient(#61715b ${healthScore * 3.6}deg,#ebe7e2 0deg)` }}><span><strong>{healthScore}</strong><small>/100</small><em>{healthLabel}</em></span></div>
                <div className="batch5-brain-bars">
                  {[['Cash Flow', cashFlowScore], ['Savings Rate', savingsScore], ['Goal Pace', goalScore], ['Spending', spendingScore]].map(([label, value]) => <div key={String(label)}><div><span>{label}</span><small>{Number(value) >= 70 ? 'Good' : Number(value) >= 50 ? 'Steady' : 'Needs attention'}</small></div><i><b style={{ width: `${Number(value)}%` }} /></i></div>)}
                </div>
              </div>
            </section>

            <section className="batch5-card batch5-brain-priorities">
              <div className="batch5-card-head"><h2>Top Priorities</h2><a href="#add-finance-goal">Add goal</a></div>
              {goals.length ? goals.slice(0, 4).map((goal, index) => {
                const progress = goal.targetCents ? clamp(goal.currentCents / goal.targetCents * 100) : 0;
                return <div className="batch5-brain-priority" key={goal.id}><span>{index + 1}</span><div><strong>{goal.name}</strong><small>{money(goal.currentCents / 100)} of {money(goal.targetCents / 100)}</small><i><b style={{ width: `${progress}%` }} /></i></div><em>{Math.round(progress)}%</em></div>;
              }) : <div className="batch5-empty">Add a financial goal and Glow will keep your priorities visible here.</div>}
            </section>
          </div>

          <section id="add-finance-goal" className="batch5-card batch5-brain-goal-form">
            <div className="batch5-card-head"><h2>Add Financial Goal</h2><CircleDollarSign size={14} /></div>
            <form action={createFinanceGoalAction}>
              <input name="name" required placeholder="Goal name" className={fieldClass} />
              <select name="goalType" defaultValue="savings" className={fieldClass}><option value="savings">Savings</option><option value="debt">Debt payoff</option><option value="travel">Travel</option><option value="emergency">Emergency fund</option><option value="purchase">Purchase</option></select>
              <input name="target" required inputMode="decimal" placeholder="Target amount" className={fieldClass} />
              <input name="current" inputMode="decimal" placeholder="Current amount" className={fieldClass} />
              <input name="targetDate" type="date" className={fieldClass} />
              <textarea name="notes" rows={2} placeholder="Notes / scenario" className={fieldClass} />
              <button><PiggyBank size={13} /> Save goal</button>
            </form>
          </section>
        </div>
      </SectionPage>
    </AppShell>
  );
}
