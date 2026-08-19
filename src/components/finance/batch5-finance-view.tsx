import Link from 'next/link';
import type { FinanceEntry } from '@/lib/types';
import { ArrowRight, CalendarDays, CircleDollarSign, CreditCard, Filter, PiggyBank, Search, Sparkles, TrendingUp, WalletCards } from 'lucide-react';

type Mode = 'overview' | 'spending' | 'subscriptions' | 'forecast' | 'transactions';
type FinanceGoalLite = { id: string; name: string; goalType: string; targetCents: number; currentCents: number; targetDate: Date | string | null };

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const monthKey = (value: string) => value.slice(0, 7);
const CATEGORY_COLORS = ['#596753','#8A7563','#C4A98E','#9E8F84','#74816F','#D9C8B6','#A99C8C','#DFD3C6'];

function FinanceHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="batch5-page-header">
    <div><p className="batch5-eyebrow">Money + Goals</p><h1 className="glow-display">{title}</h1><p>{subtitle}</p></div>
    <div className="batch5-header-actions"><button type="button"><Search size={14}/></button><button type="button"><Filter size={14}/></button><Link href="/finance" className="batch5-add"><span>+</span> Add Data</Link></div>
  </div>;
}

function compute(entries: FinanceEntry[]) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthEntries = entries.filter(e => monthKey(e.entryDate) === currentMonth);
  const income = monthEntries.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const expenses = monthEntries.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  const savings = monthEntries.filter(e=>e.type==='saving').reduce((s,e)=>s+Number(e.amount),0);
  const allIncome = entries.filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount),0);
  const allExpenses = entries.filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount),0);
  const netWorth = allIncome-allExpenses;
  const byCategory = new Map<string,number>();
  for (const entry of monthEntries.filter(e=>e.type==='expense')) byCategory.set(entry.category || 'Other',(byCategory.get(entry.category || 'Other')||0)+Number(entry.amount));
  const categories = [...byCategory.entries()].sort((a,b)=>b[1]-a[1]);
  const monthly = new Map<string,{income:number;expenses:number}>();
  for(const e of entries){const k=monthKey(e.entryDate);const b=monthly.get(k)||{income:0,expenses:0};if(e.type==='income')b.income+=Number(e.amount);if(e.type==='expense')b.expenses+=Number(e.amount);monthly.set(k,b)}
  const months=[...monthly.entries()].sort(([a],[b])=>a.localeCompare(b)).slice(-6);
  const avgIncome=months.length?months.reduce((s,[,v])=>s+v.income,0)/months.length:0;
  const avgExpenses=months.length?months.reduce((s,[,v])=>s+v.expenses,0)/months.length:0;
  return { income, expenses, savings, cashFlow: income-expenses, netWorth, categories, months, avgIncome, avgExpenses };
}

function TrendChart({ months, forecast=false }: { months: [string,{income:number;expenses:number}][]; forecast?: boolean }) {
  const points = months.length ? months : [[new Date().toISOString().slice(0,7),{income:0,expenses:0}] as [string,{income:number;expenses:number}]];
  const max=Math.max(1,...points.flatMap(([,v])=>[v.income,v.expenses]));
  const income=points.map(([,v],i)=>`${points.length===1?50:(i/(points.length-1))*100},${90-(v.income/max)*70}`).join(' ');
  const expense=points.map(([,v],i)=>`${points.length===1?50:(i/(points.length-1))*100},${90-(v.expenses/max)*70}`).join(' ');
  return <div className="batch5-chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="0" y1="25" x2="100" y2="25"/><line x1="0" y1="50" x2="100" y2="50"/><line x1="0" y1="75" x2="100" y2="75"/><polyline points={income} className="income"/><polyline points={expense} className="expense" strokeDasharray={forecast?'3 2':undefined}/></svg><div className="batch5-chart-labels">{points.map(([k])=><span key={k}>{new Date(`${k}-01T12:00:00`).toLocaleDateString('en-US',{month:'short'})}</span>)}</div></div>;
}

function TransactionRows({ entries, limit }: { entries: FinanceEntry[]; limit?: number }) {
  const list=[...entries].sort((a,b)=>b.entryDate.localeCompare(a.entryDate)).slice(0,limit);
  if(!list.length) return <div className="batch5-empty">No transactions yet.</div>;
  return <div className="batch5-ledger">{list.map((entry)=><Link key={entry.id} href={`/finance?entryId=${entry.id}`} className="batch5-ledger-row"><span className="batch5-ledger-icon"><CreditCard size={14}/></span><span className="batch5-ledger-main"><strong>{entry.title}</strong><small>{entry.category || 'Other'}</small></span><span className="batch5-ledger-date">{new Date(`${entry.entryDate}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span><span className={entry.type==='income'?'positive':'negative'}>{entry.type==='income'?'+':'−'}{money(Number(entry.amount))}</span><ArrowRight size={12}/></Link>)}</div>;
}

export function Batch5FinanceView({ mode, entries, goals }: { mode: Mode; entries: FinanceEntry[]; goals: FinanceGoalLite[] }) {
  const d=compute(entries);
  const totalCategory=Math.max(1,d.categories.reduce((s,[,v])=>s+v,0));
  if(mode==='overview') return <div className="batch5-root"><FinanceHeader title="Financial Overview" subtitle="Your money at a glance."/><div className="batch5-metric-grid">{[['Net Worth',d.netWorth],['Cash Flow',d.cashFlow],['Income',d.income],['Expenses',d.expenses]].map(([l,v])=><div className="batch5-card batch5-metric" key={String(l)}><small>{l}</small><strong>{money(Number(v))}</strong><span>This month</span></div>)}</div><div className="batch5-two"><section className="batch5-card"><div className="batch5-card-head"><h2>Cash Flow Trend</h2><span>6 months</span></div><TrendChart months={d.months}/></section><section className="batch5-card"><div className="batch5-card-head"><h2>Spending Breakdown</h2><span>This month</span></div><div className="batch5-donut-wrap"><div className="batch5-donut" style={{background:d.categories.length?`conic-gradient(${d.categories.map(([,a],i)=>`${CATEGORY_COLORS[i%CATEGORY_COLORS.length]} ${d.categories.slice(0,i).reduce((s,[,v])=>s+v,0)/totalCategory*100}% ${(d.categories.slice(0,i).reduce((s,[,v])=>s+v,0)+a)/totalCategory*100}%`).join(',')})`:'#eee'}}><span>{money(d.expenses)}</span></div><div className="batch5-categories">{d.categories.slice(0,7).map(([c,a],i)=><div key={c}><i style={{background:CATEGORY_COLORS[i%CATEGORY_COLORS.length]}}/><span>{c}</span><b>{Math.round(a/totalCategory*100)}%</b></div>)}</div></div></section></div><div className="batch5-two"><section className="batch5-card"><div className="batch5-card-head"><h2>Accounts</h2><Link href="/finance">View all</Link></div><div className="batch5-empty">Glow OS currently records finance entries rather than bank-account balances. Your real recorded totals are shown above.</div></section><section className="batch5-card"><div className="batch5-card-head"><h2>Recent Transactions</h2><Link href="/finance/transactions">View all</Link></div><TransactionRows entries={entries} limit={4}/></section></div></div>;

  if(mode==='spending') return <div className="batch5-root"><FinanceHeader title="Spending" subtitle="Track where your money goes."/><div className="batch5-spending-hero"><div className="batch5-card"><small>Total Spent</small><strong>{money(d.expenses)}</strong><span>This month</span></div><div className="batch5-card"><TrendChart months={d.months}/></div></div><div className="batch5-two"><section className="batch5-card"><div className="batch5-card-head"><h2>Top Categories</h2><span>Share</span></div><div className="batch5-category-list">{d.categories.length?d.categories.map(([c,a],i)=><div key={c}><span><i style={{background:CATEGORY_COLORS[i%CATEGORY_COLORS.length]}}/>{c}</span><b>{money(a)}</b><em>{Math.round(a/totalCategory*100)}%</em></div>):<div className="batch5-empty">No spending categories this month.</div>}</div></section><section className="batch5-card"><div className="batch5-card-head"><h2>Recent Transactions</h2><Link href="/finance/transactions">View all</Link></div><TransactionRows entries={entries.filter(e=>e.type==='expense')} limit={7}/></section></div></div>;

  if(mode==='subscriptions') { const subs=entries.filter(e=>e.type==='expense' && (e.category||'').toLowerCase().includes('subscription')); const total=subs.reduce((s,e)=>s+Number(e.amount),0); return <div className="batch5-root"><FinanceHeader title="Subscriptions" subtitle="Manage and optimize your subscriptions."/><div className="batch5-tabs"><button className="active">Active</button><button>Upcoming</button><button>Cancelled</button><div className="batch5-total"><small>Recorded total</small><strong>{money(total)}</strong></div></div><section className="batch5-card"><TransactionRows entries={subs}/>{!subs.length?<div className="batch5-empty">No entries are categorized as subscriptions yet. Categorize a finance expense as “subscriptions” and it will appear here.</div>:null}</section></div> }

  if(mode==='forecast') { const projected=Math.max(0,(d.avgIncome-d.avgExpenses)*6); return <div className="batch5-root"><FinanceHeader title="Forecast" subtitle="See your financial future."/><section className="batch5-card batch5-forecast"><div><small>Cash Flow Forecast</small><strong>{money(projected)}</strong><span>Projected six-month surplus based on your logged monthly averages</span></div><TrendChart months={d.months} forecast/></section><section className="batch5-card"><div className="batch5-card-head"><h2>Forecast Insights</h2><Sparkles size={15}/></div><ul className="batch5-insights"><li>Your recent average income is {money(d.avgIncome)} per month.</li><li>Your recent average expenses are {money(d.avgExpenses)} per month.</li><li>{d.avgIncome>d.avgExpenses?'Your current logged pattern produces a positive monthly surplus.':'Your current logged pattern does not yet produce a monthly surplus.'}</li>{goals[0]?<li>Your next financial goal is {goals[0].name}.</li>:null}</ul></section></div> }

  return <div className="batch5-root"><FinanceHeader title="Purchases & Transactions" subtitle="All your money moves, in one place."/><div className="batch5-tabs"><button className="active">Recent</button><button>This Month</button><button>This Year</button></div><section className="batch5-card"><TransactionRows entries={entries}/></section></div>;
}
