'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, CalendarDays, Landmark, Pencil, Plus, ReceiptText, Sparkles, Target, Trash2, TrendingUp, Wallet } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteFinanceEntryAction } from '@/app/actions/finance-entries';
import type { FinanceEntry, Goal } from '@/lib/types';

type Props = { initialEntries: FinanceEntry[]; goals: Goal[] };
const tones = ['#7d8963','#a7ad8c','#c29a76','#a77a75','#8fa39a','#b5a7b8','#d0b997','#6f806b','#c88e92','#aaa394'];
const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function FinanceEntryManager({ initialEntries, goals }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [dialogEntry, setDialogEntry] = useState<FinanceEntry | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceEntry | null>(null);
  const del = useServerAction((id: string) => deleteFinanceEntryAction(id));
  const now = new Date();
  const monthKey = now.toISOString().slice(0,7);
  const current = entries.filter((entry) => entry.entryDate.startsWith(monthKey));
  const financeGoals = goals.filter((goal) => goal.category === 'finance' && !['achieved','abandoned'].includes(goal.status));
  const summary = useMemo(() => {
    const sum = (type: FinanceEntry['type']) => current.filter((entry) => entry.type === type).reduce((total, entry) => total + Number(entry.amount), 0);
    const income = sum('income'), expenses = sum('expense'), savings = sum('saving'), investments = sum('investment');
    return { income, expenses, savings, investments, remaining: income - expenses - savings - investments, rate: income > 0 ? savings / income * 100 : null };
  }, [current]);
  const categories = useMemo(() => {
    const values = new Map<string, number>();
    current.filter((entry) => entry.type === 'expense').forEach((entry) => values.set(entry.category, (values.get(entry.category) ?? 0) + Number(entry.amount)));
    return [...values].map(([name, amount]) => ({ name, amount, percent: summary.expenses ? amount / summary.expenses * 100 : 0 })).sort((a,b) => b.amount-a.amount);
  }, [current, summary.expenses]);
  const bills = entries.filter((entry) => ['subscriptions','utilities'].includes(entry.category) && entry.entryDate >= now.toISOString().slice(0,10)).sort((a,b) => a.entryDate.localeCompare(b.entryDate));
  const insight = categories[0] ? `${categories[0].name} is the largest recorded expense category this month at ${money(categories[0].amount)} (${categories[0].percent.toFixed(1)}%).` : current.length ? `Current recorded cash flow is ${money(summary.remaining)} after expenses, savings, and investments.` : 'There is not enough current-month history to identify a spending pattern.';
  const donut = categories.length ? `conic-gradient(${categories.map((category,index) => `${tones[index%tones.length]} ${categories.slice(0,index).reduce((sum,item)=>sum+item.percent,0)}% ${categories.slice(0,index+1).reduce((sum,item)=>sum+item.percent,0)}%`).join(',')})` : '#e5e2d8';

  function saved(entry: FinanceEntry) { setEntries((rows) => [...rows.filter((item) => item.id !== entry.id),entry].sort((a,b)=>b.entryDate.localeCompare(a.entryDate))); setDialogEntry(null); }
  function remove() { if (deleteTarget) del.run(deleteTarget.id, () => { setEntries((rows)=>rows.filter((item)=>item.id!==deleteTarget.id)); setDeleteTarget(null); }); }

  return <div className="finance-page">
    <header className="finance-heading"><div><h1>Finance <Wallet /></h1><p>Clarity today. Confidence tomorrow.</p></div><button onClick={()=>setDialogEntry('new')}><Plus /> Add Entry</button></header>
    <nav className="finance-tabs">{['Overview','Accounts','Budget','Goals','Investments','Bills & Subscriptions','Transactions','Taxes','Reports'].map((tab,index)=><a className={index===0?'active':''} href={`#${tab.toLowerCase().replaceAll(' ','-')}`} key={tab}>{tab}</a>)}</nav>
    <section className="finance-metrics">{[['Income',summary.income],['Expenses',summary.expenses],['Savings',summary.savings],['Investments',summary.investments],['Remaining Cash Flow',summary.remaining]].map(([label,value],index)=><article key={label as string}><i style={{background:tones[index]}}></i><span>{label as string}</span><strong className={Number(value)<0?'negative':''}>{money(Number(value))}</strong><small>Current month</small></article>)}<article><i></i><span>Savings Rate</span><strong>{summary.rate === null ? '—' : `${summary.rate.toFixed(1)}%`}</strong><small>{summary.rate === null ? 'No income recorded' : 'Savings ÷ income'}</small></article></section>
    <div className="finance-layout"><main>
      <div className="finance-primary"><FinancePanel title="SPENDING BREAKDOWN" icon={<BarChart3 />}><div className="spending-wrap"><div className="spending-donut" style={{background:donut}}><strong>{money(summary.expenses)}<small>Total expenses</small></strong></div><div className="category-legend">{categories.length ? categories.map((category,index)=><p key={category.name}><i style={{background:tones[index%tones.length]}}></i><span>{category.name}</span><b>{money(category.amount)}</b><small>{category.percent.toFixed(1)}%</small></p>) : <Empty title="No expenses this month" text="The chart will populate from real current-period expenses." />}</div></div></FinancePanel>
      <FinancePanel title="CASH FLOW" icon={<TrendingUp />}><div className="cash-flow"><p><span>Income</span><b>{money(summary.income)}</b></p><p><span>Expenses</span><b>−{money(summary.expenses)}</b></p><p><span>Savings</span><b>−{money(summary.savings)}</b></p><p><span>Investments</span><b>−{money(summary.investments)}</b></p><strong><span>Remaining</span><b>{money(summary.remaining)}</b></strong></div><small className="finance-disclosure">Current month only. No historical forecast is inferred.</small></FinancePanel></div>
      <div className="finance-secondary">
        <FinancePanel id="budget" title="BUDGET PROGRESS" icon={<ReceiptText />}><Empty title="Budget data not connected" text="The finance schema stores entries, not category budgets." /></FinancePanel>
        <FinancePanel title="NET WORTH" icon={<Landmark />}><Empty title="Net worth data not connected" text="Assets, liabilities, and account balances are not inferred from transactions." /></FinancePanel>
        <FinancePanel id="goals" title="SAVINGS GOALS" icon={<Target />}>{financeGoals.length ? financeGoals.slice(0,4).map((goal)=><div className="finance-goal" key={goal.id}><b>{goal.title}</b><small>{goal.targetDate ? `Target ${goal.targetDate.toLocaleDateString()}` : 'No deadline'}</small><i><span style={{width:`${Math.min(100,Math.max(0,goal.progress))}%`}}></span></i><em>{goal.progress.toFixed(0)}%</em></div>) : <Empty title="No finance goals" text="Finance-category goals from Goals appear here." />}<Link href="/goals">Manage goals <ArrowRight /></Link></FinancePanel>
      </div>
      <div className="finance-tertiary">
        <FinancePanel title="UPCOMING BILLS + SUBSCRIPTIONS" icon={<CalendarDays />}>{bills.length ? bills.slice(0,5).map((entry)=><div className="bill-row" key={entry.id}><time>{entry.entryDate.slice(5)}</time><span>{entry.title}</span><b>{money(Number(entry.amount))}</b></div>) : <Empty title="Recurring bills not connected" text="Only explicitly future-dated utility or subscription entries can appear." />}</FinancePanel>
        <FinancePanel id="investments" title="INVESTMENT OVERVIEW" icon={<TrendingUp />}><div className="investment-total"><strong>{money(summary.investments)}</strong><span>Current-month investment entries</span></div><p className="finance-disclosure">Holdings, balances, prices, and performance are not connected.</p></FinancePanel>
        <FinancePanel title="CATEGORY SPENDING" icon={<BarChart3 />}>{categories.length ? categories.slice(0,6).map((category)=><div className="category-bar" key={category.name}><span>{category.name}</span><i><b style={{width:`${category.percent}%`}}></b></i><strong>{category.percent.toFixed(1)}%</strong></div>) : <Empty title="No category spending" text="Current expenses will reconcile here." />}</FinancePanel>
      </div>
      <section className="transactions" id="transactions"><header><div><b>RECENT TRANSACTIONS</b><p>Real finance records, newest first.</p></div><button onClick={()=>setDialogEntry('new')}><Plus /> Add entry</button></header><div className="transaction-head"><span>Date</span><span>Description</span><span>Category</span><span>Type</span><span>Amount</span><span></span></div>{entries.length ? entries.slice(0,10).map((entry)=><div className="transaction-row" key={entry.id}><time>{entry.entryDate}</time><span><b>{entry.title}</b><small>{entry.notes || 'No notes'}</small></span><span className="category-pill">{entry.category}</span><span>{entry.type}</span><strong className={entry.type==='income'?'income':''}>{entry.type==='income'?'+':'−'}{money(Number(entry.amount))}</strong><div><button onClick={()=>setDialogEntry(entry)} aria-label={`Edit ${entry.title}`}><Pencil /></button><button onClick={()=>setDeleteTarget(entry)} aria-label={`Delete ${entry.title}`}><Trash2 /></button></div></div>) : <Empty title="No financial records" text="Add the first real entry to begin this command center." />}</section>
      <section className="financial-assistant"><Sparkles /><div><b>AI FINANCIAL ASSISTANT</b><p>{insight}</p></div><a href="#transactions">Show where my money went <ArrowRight /></a></section>
    </main><aside className="finance-rail"><section><h2>THIS MONTH</h2><p>Income <b>{money(summary.income)}</b></p><p>Expenses <b>{money(summary.expenses)}</b></p><p>Remaining <b>{money(summary.remaining)}</b></p></section><section><h2>SAVINGS GOAL</h2>{financeGoals[0]?<><strong>{financeGoals[0].title}</strong><div className="rail-progress"><i style={{width:`${financeGoals[0].progress}%`}}></i></div><p>{financeGoals[0].progress.toFixed(0)}% complete</p><Link href="/goals">View goal <ArrowRight /></Link></>:<Empty title="No active goal" text="Create a finance goal in Goals." />}</section><section><h2>UPCOMING</h2>{bills.length?bills.slice(0,3).map((entry)=><div className="rail-bill" key={entry.id}><span>{entry.title}</span><b>{money(Number(entry.amount))}</b><small>{entry.entryDate}</small></div>):<Empty title="Nothing dated" text="No explicit future bills or subscriptions." />}</section><section><h2>QUICK FINANCIAL CHECK</h2><p>{insight}</p><small>Informational summary, not financial advice.</small></section></aside></div>
    <Dialog open={dialogEntry!==null} onClose={()=>setDialogEntry(null)} title={dialogEntry==='new'?'Add finance entry':'Edit finance entry'}><FinanceEntryForm entry={dialogEntry==='new'?null:dialogEntry} onSaved={saved} onCancel={()=>setDialogEntry(null)} /></Dialog><ConfirmDialog open={deleteTarget!==null} title="Delete this entry?" description={deleteTarget?`“${deleteTarget.title}” will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={remove} />
  </div>;
}
function FinancePanel({title,icon,children,id}:{title:string;icon:React.ReactNode;children:React.ReactNode;id?:string}){return <section className="finance-panel" id={id}><header><h2>{icon}{title}</h2></header><div>{children}</div></section>}
function Empty({title,text}:{title:string;text:string}){return <div className="finance-empty"><Wallet/><b>{title}</b><p>{text}</p></div>}
