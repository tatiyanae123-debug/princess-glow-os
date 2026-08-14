import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight, CalendarDays, CircleDollarSign, CreditCard, Repeat2, Sparkles, TrendingUp } from 'lucide-react';

export type FinanceEntry = {
  id:string;
  title:string;
  amount:string;
  type:'income'|'expense'|'saving'|'investment';
  category:string;
  entryDate:string;
  notes:string|null;
};

type Mode = 'spending'|'subscriptions'|'transactions'|'forecast';

function money(value:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value)}
function amount(entry:FinanceEntry){const parsed=Number(entry.amount);return Number.isFinite(parsed)?parsed:0}
function signed(entry:FinanceEntry){const value=amount(entry);return entry.type==='expense'?-value:value}

export function ReferenceFinanceView({mode,entries}:{mode:Mode;entries:FinanceEntry[]}){
  const expenses=entries.filter(e=>e.type==='expense');
  const income=entries.filter(e=>e.type==='income');
  const spendingTotal=expenses.reduce((sum,e)=>sum+amount(e),0);
  const incomeTotal=income.reduce((sum,e)=>sum+amount(e),0);
  const net=entries.reduce((sum,e)=>sum+signed(e),0);
  const subscriptions=expenses.filter(e=>e.category==='subscriptions');
  const categories=new Map<string,number>();
  expenses.forEach(e=>categories.set(e.category,(categories.get(e.category)??0)+amount(e)));
  const categoryRows=[...categories.entries()].sort((a,b)=>b[1]-a[1]);
  const monthKeys=[...new Set(entries.map(e=>e.entryDate.slice(0,7)))].sort();
  const monthlyNet=monthKeys.map(key=>({key,value:entries.filter(e=>e.entryDate.startsWith(key)).reduce((sum,e)=>sum+signed(e),0)}));
  const avgNet=monthlyNet.length?monthlyNet.reduce((s,m)=>s+m.value,0)/monthlyNet.length:0;
  const projected=Array.from({length:6},(_,i)=>({label:`Month ${i+1}`,value:net+avgNet*(i+1)}));

  const title=mode==='spending'?'Spending':mode==='subscriptions'?'Subscriptions':mode==='transactions'?'Purchases & Transactions':'Forecast';
  const subtitle=mode==='spending'?'Track where your money is going.':mode==='subscriptions'?'Manage recurring spending from your logged finance entries.':mode==='transactions'?'All your logged money movements in one place.':'A simple projection based only on your current logged finance history.';

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="glow-eyebrow text-[#6E8064]">Money + Goals</p><h1 className="glow-display mt-1 text-[42px] leading-none sm:text-[54px]">{title}</h1><p className="mt-2 text-[12.5px] text-[#8A8078]">{subtitle}</p></div><Link href="/finance" className="rounded-full border border-[#E6E1DB] bg-white px-4 py-2 text-[11px] text-[#6E8064]">Financial Overview</Link></header>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card><p className="text-[10px] uppercase tracking-[.12em] text-[#9A9088]">Income logged</p><p className="glow-display mt-2 text-[24px]">{money(incomeTotal)}</p></Card>
      <Card><p className="text-[10px] uppercase tracking-[.12em] text-[#9A9088]">Expenses logged</p><p className="glow-display mt-2 text-[24px]">{money(spendingTotal)}</p></Card>
      <Card><p className="text-[10px] uppercase tracking-[.12em] text-[#9A9088]">Net logged</p><p className="glow-display mt-2 text-[24px]">{money(net)}</p></Card>
      <Card><p className="text-[10px] uppercase tracking-[.12em] text-[#9A9088]">Entries</p><p className="glow-display mt-2 text-[24px]">{entries.length}</p></Card>
    </section>

    {mode==='spending'?<section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
      <Card><div className="flex items-center gap-2"><CircleDollarSign size={14} className="text-[#6E8064]"/><h2 className="glow-display text-[18px]">Category Breakdown</h2></div><div className="mt-4 space-y-3">{categoryRows.length?categoryRows.map(([category,value])=><div key={category}><div className="flex items-center justify-between text-[11px]"><span className="capitalize">{category}</span><span>{money(value)}</span></div><div className="mt-1 h-1.5 rounded-full bg-[#EEECE7]"><div className="h-full rounded-full bg-[#6E8064]" style={{width:`${spendingTotal?Math.max(3,(value/spendingTotal)*100):0}%`}}/></div></div>):<p className="text-[11px] text-[#9A9088]">No expense entries yet.</p>}</div></Card>
      <Card><h2 className="glow-display text-[18px]">Recent Spending</h2><div className="mt-4 divide-y divide-[#EFEAE6]">{expenses.slice(0,8).map(e=><div key={e.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-[11.5px] font-medium">{e.title}</p><p className="text-[9.5px] capitalize text-[#9A9088]">{e.category} · {e.entryDate}</p></div><span className="text-[11px]">-{money(amount(e))}</span></div>)}</div></Card>
    </section>:null}

    {mode==='subscriptions'?<section className="grid gap-4 lg:grid-cols-[1fr_.7fr]">
      <Card><div className="flex items-center gap-2"><Repeat2 size={14} className="text-[#6E8064]"/><h2 className="glow-display text-[18px]">Logged Subscriptions</h2></div><div className="mt-4 divide-y divide-[#EFEAE6]">{subscriptions.length?subscriptions.map(e=><div key={e.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-[11.5px] font-medium">{e.title}</p><p className="text-[9.5px] text-[#9A9088]">{e.entryDate}{e.notes?` · ${e.notes}`:''}</p></div><span className="text-[11px]">{money(amount(e))}</span></div>):<p className="py-5 text-[11px] text-[#9A9088]">No entries categorized as subscriptions yet.</p>}</div></Card>
      <Card><p className="text-[10px] uppercase tracking-[.12em] text-[#9A9088]">Logged total</p><p className="glow-display mt-2 text-[32px]">{money(subscriptions.reduce((s,e)=>s+amount(e),0))}</p><p className="mt-3 text-[10.5px] leading-5 text-[#8A8078]">This view does not invent renewal dates. Add dates or notes to your finance entries when you want Glow to reason about future renewals.</p></Card>
    </section>:null}

    {mode==='transactions'?<Card><div className="flex items-center gap-2"><CreditCard size={14} className="text-[#6E8064]"/><h2 className="glow-display text-[18px]">Recent Entries</h2></div><div className="mt-4 divide-y divide-[#EFEAE6]">{entries.length?entries.slice(0,20).map(e=><div key={e.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_120px_120px] sm:items-center"><div><p className="text-[11.5px] font-medium">{e.title}</p><p className="text-[9.5px] capitalize text-[#9A9088]">{e.category}</p></div><p className="text-[10px] text-[#9A9088]">{e.entryDate}</p><p className={`text-right text-[11px] ${e.type==='expense'?'text-[#B15A68]':'text-[#5A6E52]'}`}>{e.type==='expense'?'-':'+'}{money(amount(e))}</p></div>):<p className="py-5 text-[11px] text-[#9A9088]">No finance entries yet.</p>}</div></Card>:null}

    {mode==='forecast'?<section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card><div className="flex items-center gap-2"><TrendingUp size={14} className="text-[#6E8064]"/><h2 className="glow-display text-[18px]">Six-Month Projection</h2></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">{projected.map(point=><div key={point.label} className="rounded-[14px] border border-[#EFEAE6] p-3"><p className="text-[9px] text-[#9A9088]">{point.label}</p><p className="glow-display mt-1 text-[18px]">{money(point.value)}</p></div>)}</div><p className="mt-4 text-[10px] leading-5 text-[#9A9088]">Projection = current logged net plus your average logged monthly net. It is a planning estimate, not a bank balance or financial guarantee.</p></Card>
      <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#6E8064]"/><h2 className="glow-display text-[18px]">History Used</h2></div><p className="glow-display mt-4 text-[30px]">{monthlyNet.length}</p><p className="text-[10px] text-[#9A9088]">month{monthlyNet.length===1?'':'s'} with logged entries</p><p className="mt-4 text-[11px]">Average logged monthly net: <strong>{money(avgNet)}</strong></p></Card>
    </section>:null}

    <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#F5F7F0)] sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex items-center gap-2"><Sparkles size={13} className="text-[#6E8064]"/><p className="text-[10px] uppercase tracking-[.12em] text-[#6E8064]">Glow Insight</p></div><p className="glow-display mt-2 text-[17px] italic">One money system, many useful views.</p></div><Link href="/finance/brain" className="inline-flex items-center gap-1 text-[11px] text-[#6E8064]">Open Financial Brain <ArrowRight size={11}/></Link></Card>
  </div>
}
