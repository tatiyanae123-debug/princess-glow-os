import Link from 'next/link';
import { ArrowUpRight, PiggyBank, Sparkles, Target, Wallet } from 'lucide-react';
import type { FinanceEntry } from '@/lib/types';

type FinanceGoalLite = { id: string; name: string; goalType: string; targetCents: number; currentCents: number; targetDate: Date | string | null };

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const CATEGORY_DOTS = ['#C9727E', '#D9A5AC', '#E9C4C9', '#E4EBDD', '#DDE7EE', '#F1E8D9'];

function monthKey(value: string) {
  return value.slice(0, 7);
}

export function MoneyGrowthExperience({ entries, goals }: { entries: FinanceEntry[]; goals: FinanceGoalLite[] }) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  function totals(monthKeyValue: string) {
    const monthEntries = entries.filter((entry) => monthKey(entry.entryDate) === monthKeyValue);
    const income = monthEntries.filter((e) => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
    const spent = monthEntries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
    const saved = monthEntries.filter((e) => e.type === 'saving').reduce((sum, e) => sum + Number(e.amount), 0);
    return { income, spent, saved, available: income - spent - saved };
  }

  const current = totals(currentMonth);
  const previous = totals(lastMonth);
  const pctChange = (curr: number, prev: number) => (prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null);

  const currentMonthExpenses = entries.filter((e) => e.type === 'expense' && monthKey(e.entryDate) === currentMonth);
  const byCategory = new Map<string, number>();
  for (const entry of currentMonthExpenses) {
    const category = entry.category || 'Other';
    byCategory.set(category, (byCategory.get(category) ?? 0) + Number(entry.amount));
  }
  const categoryList = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalSpentThisMonth = categoryList.reduce((sum, [, amount]) => sum + amount, 0) || 1;

  // Donut chart via conic-gradient
  let cursor = 0;
  const gradientStops = categoryList.map(([, amount], index) => {
    const start = cursor;
    const pct = (amount / totalSpentThisMonth) * 100;
    cursor += pct;
    return `${CATEGORY_DOTS[index % CATEGORY_DOTS.length]} ${start}% ${cursor}%`;
  }).join(', ');

  const recentTransactions = [...entries].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1)).slice(0, 5);

  // "Net worth" here means the real running total of everything recorded: income minus
  // spending plus savings, cumulative — not a true assets-vs-liabilities figure, since
  // this app doesn't track accounts/liabilities separately.
  const sortedAll = [...entries].sort((a, b) => (a.entryDate < b.entryDate ? -1 : 1));
  let running = 0;
  const runningPoints: number[] = [];
  for (const entry of sortedAll) {
    const amount = Number(entry.amount);
    running += entry.type === 'income' ? amount : entry.type === 'expense' ? -amount : 0;
    runningPoints.push(running);
  }
  const netWorth = running;
  const netWorthMonthAgo = runningPoints.length > 5 ? runningPoints[Math.max(0, runningPoints.length - 6)] : 0;
  const netWorthChange = netWorthMonthAgo !== 0 ? Math.round(((netWorth - netWorthMonthAgo) / Math.abs(netWorthMonthAgo)) * 100) : null;
  const chartPoints = runningPoints.slice(-12);
  const chartMax = Math.max(1, ...chartPoints);
  const chartMin = Math.min(0, ...chartPoints);
  const range = chartMax - chartMin || 1;
  const polyline = chartPoints.length > 1
    ? chartPoints.map((value, index) => `${(index / (chartPoints.length - 1)) * 100},${100 - ((value - chartMin) / range) * 100}`).join(' ')
    : '0,50 100,50';

  const spentChange = pctChange(current.spent, previous.spent);
  const insightText = spentChange !== null
    ? spentChange < 0
      ? `You spent ${Math.abs(spentChange)}% less this month compared to last. Great job staying mindful!`
      : `Spending is up ${spentChange}% from last month. Review your top categories below.`
    : 'Log a few months of entries to start seeing real month-over-month trends.';

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-2"><h1 className="glow-display text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Money &amp; Growth</h1><Sparkles size={20} className="text-[#C9727E]" /></div>
          <p className="mt-2 text-[13px] text-[#8A8078]">Build wealth. Grow consistently. Live with freedom.</p>
        </div>
        <div className="relative overflow-hidden rounded-[18px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-4">
          <p className="glow-display text-[14px] italic leading-5 text-[#4A3238]">&ldquo;Financial freedom is freedom of choices.&rdquo;</p>
          <p className="mt-1.5 text-[10.5px] text-[#B15A68]">— Glow Note</p>
        </div>
      </div>

      <div>
        <p className="text-[12px] font-medium text-[#2B2420]">This Month</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Income', value: current.income, change: pctChange(current.income, previous.income), icon: Wallet },
            { label: 'Spent', value: current.spent, change: spentChange, icon: Wallet },
            { label: 'Saved', value: current.saved, change: pctChange(current.saved, previous.saved), icon: PiggyBank },
            { label: 'Available', value: current.available, change: pctChange(current.available, previous.available), icon: Target },
          ].map(({ label, value, change, icon: Icon }) => (
            <div key={label} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
              <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Icon size={14} /></span><p className="text-[12px] text-[#8A8078]">{label}</p></div>
              <p className="glow-display mt-2.5 text-[22px] text-[#2B2420]">{money(value)}</p>
              {change !== null ? <p className={`mt-1 text-[10.5px] ${change >= 0 ? 'text-[#5A6E52]' : 'text-[#A2505E]'}`}>{change >= 0 ? '↗' : '↘'} {Math.abs(change)}% from last month</p> : <p className="mt-1 text-[10.5px] text-[#9A9088]">No prior month data</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Spending Breakdown</p><span className="text-[10.5px] text-[#9A9088]">This Month</span></div>
          {categoryList.length === 0 ? <p className="mt-6 text-center text-[12px] text-[#9A9088]">No expenses logged this month.</p> : (
            <div className="mt-4 flex items-center gap-4">
              <div className="h-24 w-24 shrink-0 rounded-full" style={{ background: `conic-gradient(${gradientStops})` }}>
                <div className="flex h-full w-full items-center justify-center">
                  <div className="flex h-14 w-14 flex-col items-center justify-center rounded-full bg-white text-center">
                    <p className="glow-display text-[11px] text-[#2B2420]">{money(totalSpentThisMonth).replace('.00', '')}</p>
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                {categoryList.map(([category, amount], index) => (
                  <div key={category} className="flex items-center gap-1.5 text-[10.5px]">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CATEGORY_DOTS[index % CATEGORY_DOTS.length] }} />
                    <span className="min-w-0 flex-1 truncate capitalize text-[#4A4440]">{category}</span>
                    <span className="shrink-0 text-[#9A9088]">{Math.round((amount / totalSpentThisMonth) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Goals</p><Link href="/finance/brain" className="text-[11px] font-medium text-[#C9727E]">View all</Link></div>
          <div className="mt-3 space-y-3">
            {goals.length === 0 ? <p className="text-[12px] text-[#9A9088]">No savings goals yet.</p> : goals.slice(0, 3).map((goal) => {
              const progress = goal.targetCents > 0 ? Math.min(100, Math.round((goal.currentCents / goal.targetCents) * 100)) : 0;
              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1E8D9] text-[#9A7A3D]"><Target size={14} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><p className="truncate text-[12px] font-medium text-[#3A332E]">{goal.name}</p><span className="shrink-0 text-[11px] text-[#9A9088]">{progress}%</span></div>
                    <p className="text-[10.5px] text-[#9A9088]">{money(goal.currentCents / 100)} of {money(goal.targetCents / 100)}</p>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${progress}%` }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
          <p className="text-[11px] font-medium italic text-[#B15A68]">Insight</p>
          <p className="mt-2 text-[12.5px] leading-5 text-[#4A3238]">{insightText}</p>
          <Link href="/finance/brain" className="mt-3 inline-block rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[#B15A68]">View Details</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-3.5"><p className="text-[13px] font-medium text-[#2B2420]">Recent Transactions</p><Link href="/finance" className="text-[11px] font-medium text-[#C9727E]">View all</Link></div>
          {recentTransactions.length === 0 ? <p className="p-6 text-center text-[12px] text-[#9A9088]">No transactions yet.</p> : (
            <div className="divide-y divide-[#F4ECE8]">
              {recentTransactions.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 px-5 py-2.5 text-[12px]">
                  <span className="text-[10.5px] text-[#9A9088]">{new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="min-w-0"><span className="block truncate font-medium text-[#3A332E]">{entry.title}</span><span className="text-[10.5px] capitalize text-[#9A9088]">{entry.category}</span></span>
                  <span className={`shrink-0 font-medium ${entry.type === 'income' ? 'text-[#5A6E52]' : 'text-[#A2505E]'}`}>{entry.type === 'income' ? '+' : '−'}{money(Number(entry.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Net Worth</p><span className="text-[10.5px] text-[#9A9088]">View over time</span></div>
          <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{money(netWorth)}</p>
          {netWorthChange !== null ? <p className={`text-[10.5px] ${netWorthChange >= 0 ? 'text-[#5A6E52]' : 'text-[#A2505E]'}`}><ArrowUpRight size={11} className="inline" /> {netWorthChange}% from last month</p> : null}
          <svg viewBox="0 0 100 40" className="mt-3 h-16 w-full" preserveAspectRatio="none">
            <polyline points={polyline.split(' ').map((p) => { const [x, y] = p.split(','); return `${x},${Number(y) * 0.4}`; }).join(' ')} fill="none" stroke="#C9727E" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
