'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, PiggyBank, ReceiptText, CalendarDays, WalletCards, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteFinanceEntryAction } from '@/app/actions/finance-entries';
import type { FinanceEntry } from '@/lib/types';

type FinanceGoal = {
  id: string;
  name: string;
  goalType: string;
  targetCents: number;
  currentCents: number;
  targetDate: Date | string | null;
  notes: string | null;
};

type View = 'overview' | 'transactions' | 'bills' | 'savings';

const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const normalized = (value?: string | null) => value?.trim().toLowerCase() ?? '';

function monthKey(value: string) {
  return value.slice(0, 7);
}

function isRecurring(entry: FinanceEntry) {
  const haystack = `${normalized(entry.category)} ${normalized(entry.title)} ${normalized(entry.notes)}`;
  return ['subscription', 'rent', 'mortgage', 'insurance', 'phone', 'internet', 'utility', 'utilities', 'membership', 'bill'].some((token) => haystack.includes(token));
}

export function FinanceEntryManager({ initialEntries, initialGoals = [] }: { initialEntries: FinanceEntry[]; initialGoals?: FinanceGoal[] }) {
  const [entries,setEntries]=useState<FinanceEntry[]>(initialEntries);
  const [view,setView]=useState<View>('overview');
  const [dialogEntry,setDialogEntry]=useState<FinanceEntry|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<FinanceEntry|null>(null);
  const del=useServerAction((id:string)=>deleteFinanceEntryAction(id));

  const insights=useMemo(()=>{
    const income=entries.filter((e)=>e.type==='income').reduce((sum,e)=>sum+Number(e.amount),0);
    const expenses=entries.filter((e)=>e.type==='expense').reduce((sum,e)=>sum+Number(e.amount),0);
    const savings=entries.filter((e)=>e.type==='saving').reduce((sum,e)=>sum+Number(e.amount),0);
    const now=new Date();
    const currentMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const expenseEntries=entries.filter((entry)=>entry.type==='expense');
    const currentMonthExpenses=expenseEntries.filter((entry)=>monthKey(entry.entryDate)===currentMonth);
    const byCategory=new Map<string,{current:number;history:number;months:Set<string>}>();
    for(const entry of expenseEntries){
      const category=entry.category || 'other';
      const bucket=byCategory.get(category)??{current:0,history:0,months:new Set<string>()};
      const amount=Number(entry.amount);
      if(monthKey(entry.entryDate)===currentMonth) bucket.current+=amount;
      else {bucket.history+=amount;bucket.months.add(monthKey(entry.entryDate));}
      byCategory.set(category,bucket);
    }
    const categoryBudgets=[...byCategory.entries()].map(([category,bucket])=>({
      category,
      spent:bucket.current,
      guide:bucket.months.size?bucket.history/bucket.months.size:bucket.current,
    })).sort((a,b)=>b.spent-a.spent).slice(0,6);
    const recurring=expenseEntries.filter(isRecurring).sort((a,b)=>a.entryDate<b.entryDate?1:-1);
    const recurringLatest=new Map<string,FinanceEntry>();
    for(const entry of recurring){
      const key=`${normalized(entry.title)}|${normalized(entry.category)}`;
      if(!recurringLatest.has(key)) recurringLatest.set(key,entry);
    }
    const obligations=[...recurringLatest.values()].slice(0,8);
    const recurringMonthly=obligations.reduce((sum,entry)=>sum+Number(entry.amount),0);
    return {income,expenses,savings,currentMonthExpenses,categoryBudgets,obligations,recurringMonthly};
  },[entries]);

  const handleSaved=(entry:FinanceEntry)=>{setEntries((current)=>{const exists=current.some((e)=>e.id===entry.id);const next=exists?current.map((e)=>(e.id===entry.id?entry:e)):[entry,...current];return [...next].sort((a,b)=>(a.entryDate<b.entryDate?1:-1));});setDialogEntry(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setEntries((current)=>current.filter((e)=>e.id!==deleteTarget.id));setDeleteTarget(null);});};

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#E4EBDD,#FDF8F6)]"><PiggyBank size={54} strokeWidth={.8} className="absolute right-5 top-4 text-[#5A6E52]/20"/><p className="glow-eyebrow">Financial journal</p><p className="glow-display mt-2 text-[25px] text-[#2B2420]">Visibility without anxiety.</p><p className="mt-2 max-w-xl text-[12px] leading-5 text-[#8A8078]">See transactions, category guardrails, recurring bills and subscriptions, savings goals, and upcoming money pressure from the records you already keep in Glow OS.</p></Card>
      <Card className="flex flex-col justify-between"><div><p className="glow-display text-[16px] text-[#2B2420]">Add a money entry</p><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">Log it once. Finance and Financial Brain both use the same persisted record.</p></div><Button onClick={()=>setDialogEntry('new')} className="mt-4 flex items-center gap-1.5 self-start"><Plus size={12}/>Add entry</Button></Card>
    </div>

    <div className="flex flex-wrap gap-2">{(['overview','transactions','bills','savings'] as View[]).map((item)=><button key={item} type="button" onClick={()=>setView(item)} className={`rounded-full border px-3.5 py-2 text-[11px] font-medium capitalize transition ${view===item?'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]':'border-[#F1E7E3] bg-white text-[#8A8078] hover:bg-[#FDF8F6]'}`}>{item==='bills'?'Bills + subscriptions':item}</button>)}</div>

    <div className="grid gap-3 md:grid-cols-4">
      <Card><div className="flex items-center justify-between"><p className="text-[10.5px] text-[#8A8078]">Income</p><ArrowUpRight size={14} className="text-[#5A6E52]"/></div><p className="glow-display mt-2 text-[24px] text-[#5A6E52]">{money(insights.income)}</p></Card>
      <Card><div className="flex items-center justify-between"><p className="text-[10.5px] text-[#8A8078]">Expenses</p><ArrowDownRight size={14} className="text-[#B15A68]"/></div><p className="glow-display mt-2 text-[24px] text-[#B15A68]">{money(insights.expenses)}</p></Card>
      <Card><div className="flex items-center justify-between"><p className="text-[10.5px] text-[#8A8078]">Savings</p><PiggyBank size={14} className="text-[#9A7A3D]"/></div><p className="glow-display mt-2 text-[24px] text-[#9A7A3D]">{money(insights.savings)}</p></Card>
      <Card><div className="flex items-center justify-between"><p className="text-[10.5px] text-[#8A8078]">Detected recurring</p><ReceiptText size={14} className="text-[#8A8078]"/></div><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{money(insights.recurringMonthly)}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">latest recurring records</p></Card>
    </div>

    {view==='overview'&&<div className="grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="overflow-hidden p-0"><div className="border-b border-[#F1E7E3] px-5 py-4"><div className="flex items-center gap-2"><WalletCards size={14} className="text-[#C9727E]"/><div><p className="glow-eyebrow">Monthly guardrails</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Category budget pulse</p></div></div><p className="mt-2 text-[11px] text-[#8A8078]">Guides use your prior logged monthly average when history exists. They are not automatic spending limits.</p></div>{insights.categoryBudgets.length?<div className="divide-y divide-[#F1E7E3]">{insights.categoryBudgets.map((budget)=>{const ratio=budget.guide>0?budget.spent/budget.guide:0;return <div key={budget.category} className="px-5 py-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[12px] font-medium capitalize text-[#2B2420]">{budget.category}</p><p className="mt-1 text-[10.5px] text-[#8A8078]">{money(budget.spent)} this month · guide {money(budget.guide)}</p></div><span className={`text-[11px] font-medium ${ratio>1?'text-[#B15A68]':'text-[#5A6E52]'}`}>{Math.round(ratio*100)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4ECE8]"><div className={`h-full rounded-full ${ratio>1?'bg-[#B15A68]':'bg-[#5A6E52]'}`} style={{width:`${Math.min(100,ratio*100)}%`}}/></div></div>})}</div>:<div className="p-8 text-center text-[12px] text-[#8A8078]">Add expense entries to build category guardrails.</div>}</Card>
      <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><div><p className="glow-eyebrow">Upcoming pressure</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Recurring-cost watch</p></div></div>{insights.obligations.length?<div className="mt-4 space-y-3">{insights.obligations.slice(0,5).map((entry)=><div key={entry.id} className="rounded-[12px] bg-[#FDF8F6] p-3"><div className="flex justify-between gap-3"><p className="text-[12px] font-medium text-[#2B2420]">{entry.title}</p><span className="glow-display text-[13px] text-[#9A7A3D]">{money(Number(entry.amount))}</span></div><p className="mt-1 text-[10.5px] text-[#B5ACA5]">Last logged {entry.entryDate} · {entry.category}</p></div>)}</div>:<p className="mt-4 text-[11.5px] leading-4 text-[#8A8078]">No recurring bill or subscription patterns detected yet. Use clear titles/categories when you log them and Glow OS will surface them here.</p>}<Link href="/finance/brain" className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Open Financial Brain <TrendingUp size={11}/></Link></Card>
    </div>}

    {view==='transactions'&&<Card className="p-0 overflow-hidden"><div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Transactions</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Full recent ledger</p></div>{entries.length?<div className="divide-y divide-[#F1E7E3]">{entries.slice(0,40).map((entry,index)=><div key={entry.id} className={`grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 ${index===0?'bg-[#FDF8F6]':''}`}><div className="min-w-0"><p className="truncate text-[12px] font-medium text-[#2B2420]">{entry.title}</p><p className="mt-0.5 text-[10.5px] text-[#B5ACA5]">{entry.category} · {entry.entryDate}</p></div><div className="flex items-center gap-2"><span className={`glow-display text-[13px] ${entry.type==='income'?'text-[#5A6E52]':entry.type==='saving'?'text-[#9A7A3D]':'text-[#B15A68]'}`}>{entry.type==='income'?'+':entry.type==='expense'?'−':''}{money(Number(entry.amount))}</span><button type="button" onClick={()=>setDialogEntry(entry)} aria-label="Edit entry" className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(entry)} aria-label="Delete entry" className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><Trash2 size={11}/></button></div></div>)}</div>:<div className="p-10 text-center"><p className="text-[12px] text-[#8A8078]">No transactions yet.</p><button type="button" onClick={()=>setDialogEntry('new')} className="mt-3 text-[11px] font-medium text-[#C9727E]">Add your first entry →</button></div>}</Card>}

    {view==='bills'&&<Card className="overflow-hidden p-0"><div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Bills + subscriptions</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Detected recurring obligations</p><p className="mt-2 text-[11px] text-[#8A8078]">Glow OS groups the latest matching rent, utility, insurance, phone, internet, membership, bill, and subscription records. This does not invent a due date you have not logged.</p></div>{insights.obligations.length?<div className="divide-y divide-[#F1E7E3]">{insights.obligations.map((entry)=><div key={entry.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1fr_auto]"><div><p className="text-[12px] font-medium text-[#2B2420]">{entry.title}</p><p className="mt-1 text-[10.5px] capitalize text-[#8A8078]">{entry.category} · last recorded {entry.entryDate}</p></div><span className="glow-display text-[14px] text-[#9A7A3D]">{money(Number(entry.amount))}</span></div>)}</div>:<div className="p-10 text-center"><p className="text-[12px] text-[#8A8078]">No recurring obligations detected yet.</p><button type="button" onClick={()=>setDialogEntry('new')} className="mt-3 text-[11px] font-medium text-[#C9727E]">Log a bill or subscription →</button></div>}</Card>}

    {view==='savings'&&<div className="grid gap-3 lg:grid-cols-[.9fr_1.1fr]">
      <Card><p className="glow-eyebrow">Savings ledger</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Protected so far</p><p className="glow-display mt-4 text-[30px] text-[#9A7A3D]">{money(insights.savings)}</p><p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">Savings entries stay in the same finance ledger, so the Financial Brain can use them for forecasting.</p><Link href="/finance/brain" className="mt-4 inline-flex text-[11px] font-medium text-[#C9727E]">Open savings intelligence →</Link></Card>
      <Card className="overflow-hidden p-0"><div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Goals</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Savings + payoff progress</p></div>{initialGoals.length?<div className="divide-y divide-[#F1E7E3]">{initialGoals.map((goal)=>{const progress=goal.targetCents>0?Math.min(100,Math.max(0,goal.currentCents/goal.targetCents*100)):0;return <div key={goal.id} className="px-5 py-4"><div className="flex items-center justify-between gap-3"><div><p className="text-[12px] font-medium text-[#2B2420]">{goal.name}</p><p className="mt-1 text-[10.5px] capitalize text-[#8A8078]">{goal.goalType}{goal.targetDate?` · target ${new Date(goal.targetDate).toLocaleDateString()}`:''}</p></div><span className="glow-display text-[13px] text-[#C9727E]">{Math.round(progress)}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{width:`${progress}%`}}/></div><p className="mt-2 text-[10.5px] text-[#B5ACA5]">{money(goal.currentCents/100)} of {money(goal.targetCents/100)}</p></div>})}</div>:<div className="p-10 text-center"><p className="text-[12px] text-[#8A8078]">No savings or payoff goals yet.</p><Link href="/finance/brain" className="mt-3 inline-flex text-[11px] font-medium text-[#C9727E]">Create a financial goal →</Link></div>}</Card>
    </div>}

    {view==='overview'&&entries.length===0?<Card><div className="py-8 text-center"><p className="text-[12px] text-[#8A8078]">No finance records yet.</p><button type="button" onClick={()=>setDialogEntry('new')} className="mt-3 text-[11px] font-medium text-[#C9727E]">Add the first entry and build your money picture →</button></div></Card>:null}

    <Dialog open={dialogEntry!==null} onClose={()=>setDialogEntry(null)} title={dialogEntry==='new'?'Add entry':'Edit entry'}><FinanceEntryForm entry={dialogEntry==='new'?null:dialogEntry} onSaved={handleSaved} onCancel={()=>setDialogEntry(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this entry?" description={deleteTarget?`"${deleteTarget.title}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}
