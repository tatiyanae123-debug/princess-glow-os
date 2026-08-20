'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { FinanceEntry } from '@/lib/types';
import { ArrowRight, CreditCard, Filter, Search, Sparkles } from 'lucide-react';

type Mode = 'overview' | 'spending' | 'subscriptions' | 'forecast' | 'transactions';
type FinanceGoalLite = { id: string; name: string; goalType: string; targetCents: number; currentCents: number; targetDate: Date | string | null };
type TransactionTab = 'recent' | 'month' | 'year';

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const monthKey = (value: string) => value.slice(0, 7);
const CATEGORY_COLORS = ['#596753', '#8A7563', '#C4A98E', '#9E8F84', '#74816F', '#D9C8B6', '#A99C8C', '#DFD3C6'];

function FinanceHeader({ title, subtitle, mode }: { title: string; subtitle: string; mode: Mode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function openSearch() {
    document.dispatchEvent(new Event('glow:search-open'));
  }

  return <div className="batch5-page-header">
    <div>
      <p className="batch5-eyebrow">Money + Goals</p>
      <h1 className="glow-display">{title}</h1>
      <p>{subtitle}</p>
    </div>
    <div className="batch5-header-actions">
      <span className="batch5-period-label">{monthLabel}</span>
      <button type="button" onClick={openSearch} aria-label="Search Glow OS"><Search size={14} /></button>
      <div className="batch5-filter-wrap">
        <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-label="Open finance views"><Filter size={14} /></button>
        {menuOpen ? <div className="batch5-filter-menu" role="menu">
          {[
            ['/finance/overview', 'Overview'],
            ['/finance/spending', 'Spending'],
            ['/finance/subscriptions', 'Subscriptions'],
            ['/finance/forecast', 'Forecast'],
            ['/finance/transactions', 'Transactions'],
          ].map(([href, label]) => <Link key={href} href={href} role="menuitem" className={mode === href.split('/').pop() ? 'active' : ''}>{label}</Link>)}
        </div> : null}
      </div>
      <Link href="/finance" className="batch5-add"><span>+</span> Add Data</Link>
    </div>
  </div>;
}

function compute(entries: FinanceEntry[]) {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthEntries = entries.filter((entry) => monthKey(entry.entryDate) === currentMonth);
  const income = monthEntries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = monthEntries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const savings = monthEntries.filter((entry) => entry.type === 'saving').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const allIncome = entries.filter((entry) => entry.type === 'income').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const allExpenses = entries.filter((entry) => entry.type === 'expense').reduce((sum, entry) => sum + Number(entry.amount), 0);
  const netWorth = allIncome - allExpenses;
  const byCategory = new Map<string, number>();
  for (const entry of monthEntries.filter((entry) => entry.type === 'expense')) {
    byCategory.set(entry.category || 'Other', (byCategory.get(entry.category || 'Other') || 0) + Number(entry.amount));
  }
  const categories = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const monthly = new Map<string, { income: number; expenses: number }>();
  for (const entry of entries) {
    const key = monthKey(entry.entryDate);
    const bucket = monthly.get(key) || { income: 0, expenses: 0 };
    if (entry.type === 'income') bucket.income += Number(entry.amount);
    if (entry.type === 'expense') bucket.expenses += Number(entry.amount);
    monthly.set(key, bucket);
  }
  const months = [...monthly.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const avgIncome = months.length ? months.reduce((sum, [, value]) => sum + value.income, 0) / months.length : 0;
  const avgExpenses = months.length ? months.reduce((sum, [, value]) => sum + value.expenses, 0) / months.length : 0;
  return { income, expenses, savings, cashFlow: income - expenses, netWorth, categories, months, avgIncome, avgExpenses };
}

function TrendChart({ months, forecast = false }: { months: [string, { income: number; expenses: number }][]; forecast?: boolean }) {
  const points = months.length ? months : [[new Date().toISOString().slice(0, 7), { income: 0, expenses: 0 }] as [string, { income: number; expenses: number }]];
  const max = Math.max(1, ...points.flatMap(([, value]) => [value.income, value.expenses]));
  const income = points.map(([, value], index) => `${points.length === 1 ? 50 : (index / (points.length - 1)) * 100},${90 - (value.income / max) * 70}`).join(' ');
  const expense = points.map(([, value], index) => `${points.length === 1 ? 50 : (index / (points.length - 1)) * 100},${90 - (value.expenses / max) * 70}`).join(' ');
  return <div className="batch5-chart">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Finance trend chart">
      <line x1="0" y1="25" x2="100" y2="25" /><line x1="0" y1="50" x2="100" y2="50" /><line x1="0" y1="75" x2="100" y2="75" />
      <polyline points={income} className="income" /><polyline points={expense} className="expense" strokeDasharray={forecast ? '3 2' : undefined} />
    </svg>
    <div className="batch5-chart-labels">{points.map(([key]) => <span key={key}>{new Date(`${key}-01T12:00:00`).toLocaleDateString('en-US', { month: 'short' })}</span>)}</div>
  </div>;
}

function TransactionRows({ entries, limit }: { entries: FinanceEntry[]; limit?: number }) {
  const list = [...entries].sort((a, b) => b.entryDate.localeCompare(a.entryDate)).slice(0, limit);
  if (!list.length) return <div className="batch5-empty">No transactions yet.</div>;
  return <div className="batch5-ledger">{list.map((entry) => (
    <Link key={entry.id} href={`/finance?entryId=${entry.id}`} className="batch5-ledger-row">
      <span className="batch5-ledger-icon"><CreditCard size={14} /></span>
      <span className="batch5-ledger-main"><strong>{entry.title}</strong><small>{entry.category || 'Other'}</small></span>
      <span className="batch5-ledger-date">{new Date(`${entry.entryDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      <span className={entry.type === 'income' ? 'positive' : 'negative'}>{entry.type === 'income' ? '+' : '−'}{money(Number(entry.amount))}</span>
      <ArrowRight size={12} />
    </Link>
  ))}</div>;
}

export function Batch5FinanceView({ mode, entries, goals }: { mode: Mode; entries: FinanceEntry[]; goals: FinanceGoalLite[] }) {
  const [transactionTab, setTransactionTab] = useState<TransactionTab>('recent');
  const data = compute(entries);
  const totalCategory = Math.max(1, data.categories.reduce((sum, [, value]) => sum + value, 0));
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisYear = String(now.getFullYear());
  const transactionEntries = useMemo(() => transactionTab === 'month'
    ? entries.filter((entry) => monthKey(entry.entryDate) === thisMonth)
    : transactionTab === 'year'
      ? entries.filter((entry) => entry.entryDate.startsWith(thisYear))
      : entries,
  [entries, thisMonth, thisYear, transactionTab]);

  if (mode === 'overview') return <div className="batch5-root">
    <FinanceHeader mode={mode} title="Financial Overview" subtitle="Your money at a glance." />
    <div className="batch5-metric-grid">{[['Net Worth', data.netWorth], ['Cash Flow', data.cashFlow], ['Income', data.income], ['Expenses', data.expenses]].map(([label, value]) => (
      <div className="batch5-card batch5-metric" key={String(label)}><small>{label}</small><strong>{money(Number(value))}</strong><span>This month</span></div>
    ))}</div>
    <div className="batch5-two">
      <section className="batch5-card"><div className="batch5-card-head"><h2>Cash Flow Trend</h2><span>6 months</span></div><TrendChart months={data.months} /></section>
      <section className="batch5-card"><div className="batch5-card-head"><h2>Spending Breakdown</h2><span>This month</span></div><div className="batch5-donut-wrap"><div className="batch5-donut" style={{ background: data.categories.length ? `conic-gradient(${data.categories.map(([, amount], index) => `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${data.categories.slice(0, index).reduce((sum, [, value]) => sum + value, 0) / totalCategory * 100}% ${(data.categories.slice(0, index).reduce((sum, [, value]) => sum + value, 0) + amount) / totalCategory * 100}%`).join(',')})` : '#eee' }}><span>{money(data.expenses)}</span></div><div className="batch5-categories">{data.categories.slice(0, 7).map(([category, amount], index) => <div key={category}><i style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} /><span>{category}</span><b>{Math.round(amount / totalCategory * 100)}%</b></div>)}</div></div></section>
    </div>
    <div className="batch5-two">
      <section className="batch5-card"><div className="batch5-card-head"><h2>Accounts</h2><Link href="/finance">View records</Link></div><div className="batch5-empty">Glow OS currently records finance entries rather than bank-account balances. Your real recorded totals are shown above.</div></section>
      <section className="batch5-card"><div className="batch5-card-head"><h2>Upcoming & Recent</h2><Link href="/finance/transactions">View all</Link></div><TransactionRows entries={entries} limit={4} /></section>
    </div>
  </div>;

  if (mode === 'spending') return <div className="batch5-root">
    <FinanceHeader mode={mode} title="Spending" subtitle="Track where your money goes." />
    <div className="batch5-spending-hero"><div className="batch5-card"><small>Total Spent</small><strong>{money(data.expenses)}</strong><span>This month</span></div><div className="batch5-card"><TrendChart months={data.months} /></div></div>
    <div className="batch5-two"><section className="batch5-card"><div className="batch5-card-head"><h2>Top Categories</h2><span>Share</span></div><div className="batch5-category-list">{data.categories.length ? data.categories.map(([category, amount], index) => <div key={category}><span><i style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />{category}</span><b>{money(amount)}</b><em>{Math.round(amount / totalCategory * 100)}%</em></div>) : <div className="batch5-empty">No spending categories this month.</div>}</div></section><section className="batch5-card"><div className="batch5-card-head"><h2>Recent Transactions</h2><Link href="/finance/transactions">View all</Link></div><TransactionRows entries={entries.filter((entry) => entry.type === 'expense')} limit={7} /></section></div>
  </div>;

  if (mode === 'subscriptions') {
    const subscriptions = entries.filter((entry) => entry.type === 'expense' && (entry.category || '').toLowerCase().includes('subscription'));
    const total = subscriptions.reduce((sum, entry) => sum + Number(entry.amount), 0);
    return <div className="batch5-root">
      <FinanceHeader mode={mode} title="Subscriptions" subtitle="Manage and optimize your subscriptions." />
      <div className="batch5-tabs"><span className="active" aria-current="page">Active</span><button type="button" disabled title="Upcoming billing dates are not stored in the current finance schema">Upcoming</button><button type="button" disabled title="Cancelled subscription status is not stored in the current finance schema">Cancelled</button><div className="batch5-total"><small>Recorded total</small><strong>{money(total)}</strong></div></div>
      <section className="batch5-card"><TransactionRows entries={subscriptions} />{!subscriptions.length ? <div className="batch5-empty">No entries are categorized as subscriptions yet. Categorize a finance expense as “subscriptions” and it will appear here.</div> : null}</section>
    </div>;
  }

  if (mode === 'forecast') {
    const projected = Math.max(0, (data.avgIncome - data.avgExpenses) * 6);
    return <div className="batch5-root">
      <FinanceHeader mode={mode} title="Forecast" subtitle="See your financial future." />
      <section className="batch5-card batch5-forecast"><div><small>Cash Flow Forecast</small><strong>{money(projected)}</strong><span>Projected six-month surplus based on your logged monthly averages</span></div><TrendChart months={data.months} forecast /></section>
      <section className="batch5-card"><div className="batch5-card-head"><h2>Forecast Insights</h2><Sparkles size={15} /></div><ul className="batch5-insights"><li>Your recent average income is {money(data.avgIncome)} per month.</li><li>Your recent average expenses are {money(data.avgExpenses)} per month.</li><li>{data.avgIncome > data.avgExpenses ? 'Your current logged pattern produces a positive monthly surplus.' : 'Your current logged pattern does not yet produce a monthly surplus.'}</li>{goals[0] ? <li>Your next financial goal is {goals[0].name}.</li> : null}</ul></section>
    </div>;
  }

  return <div className="batch5-root">
    <FinanceHeader mode={mode} title="Purchases & Transactions" subtitle="All your money moves, in one place." />
    <div className="batch5-tabs" role="tablist" aria-label="Transaction date range">
      <button type="button" onClick={() => setTransactionTab('recent')} className={transactionTab === 'recent' ? 'active' : ''}>Recent</button>
      <button type="button" onClick={() => setTransactionTab('month')} className={transactionTab === 'month' ? 'active' : ''}>This Month</button>
      <button type="button" onClick={() => setTransactionTab('year')} className={transactionTab === 'year' ? 'active' : ''}>This Year</button>
    </div>
    <section className="batch5-card"><TransactionRows entries={transactionEntries} /></section>
  </div>;
}
