'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteFinanceEntryAction } from '@/app/actions/finance-entries';
import type { FinanceEntry } from '@/lib/types';

export function FinanceEntryManager({ initialEntries }: { initialEntries: FinanceEntry[] }) {
  const [entries,setEntries]=useState<FinanceEntry[]>(initialEntries);
  const [dialogEntry,setDialogEntry]=useState<FinanceEntry|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<FinanceEntry|null>(null);
  const del=useServerAction((id:string)=>deleteFinanceEntryAction(id));
  const totals=useMemo(()=>{const income=entries.filter((e)=>e.type==='income').reduce((sum,e)=>sum+Number(e.amount),0);const expenses=entries.filter((e)=>e.type==='expense').reduce((sum,e)=>sum+Number(e.amount),0);const savings=entries.filter((e)=>e.type==='saving').reduce((sum,e)=>sum+Number(e.amount),0);return{income,expenses,savings};},[entries]);
  const handleSaved=(entry:FinanceEntry)=>{setEntries((current)=>{const exists=current.some((e)=>e.id===entry.id);const next=exists?current.map((e)=>(e.id===entry.id?entry:e)):[entry,...current];return [...next].sort((a,b)=>(a.entryDate<b.entryDate?1:-1));});setDialogEntry(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setEntries((current)=>current.filter((e)=>e.id!==deleteTarget.id));setDeleteTarget(null);});};

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.3fr_.7fr]"><Card className="relative overflow-hidden bg-[linear-gradient(145deg,#edf1e8,#f5eee7)] p-5"><PiggyBank size={54} strokeWidth={.8} className="absolute right-5 top-3 text-[#72806a]/18"/><p className="glow-eyebrow">Financial journal</p><p className="glow-display mt-2 text-[25px] text-[#43503f]">Visibility without anxiety.</p><p className="mt-2 text-[9px] leading-4 text-[#74806f]">Your transactions become a calm record of what came in, what went out, and what you protected.</p></Card><Card className="flex flex-col justify-between"><div><p className="glow-display text-[16px] text-[#45513f]">Add a money entry</p><p className="mt-2 text-[8px] leading-4 text-[#7c8676]">Log it once and let Financial Brain use the record later.</p></div><Button onClick={()=>setDialogEntry('new')} className="mt-4 flex items-center gap-1.5 self-start"><Plus size={12}/>Add entry</Button></Card></div>

    <div className="grid gap-3 md:grid-cols-3"><Card><div className="flex items-center justify-between"><p className="text-[8px] text-[#7b8675]">Income</p><ArrowUpRight size={14} className="text-[#70886b]"/></div><p className="glow-display mt-2 text-[24px] text-[#50634b]">${totals.income.toLocaleString('en',{minimumFractionDigits:2})}</p></Card><Card><div className="flex items-center justify-between"><p className="text-[8px] text-[#8a766f]">Expenses</p><ArrowDownRight size={14} className="text-[#a36b70]"/></div><p className="glow-display mt-2 text-[24px] text-[#8c575e]">${totals.expenses.toLocaleString('en',{minimumFractionDigits:2})}</p></Card><Card><div className="flex items-center justify-between"><p className="text-[8px] text-[#857963]">Savings</p><PiggyBank size={14} className="text-[#987d52]"/></div><p className="glow-display mt-2 text-[24px] text-[#7e6748]">${totals.savings.toLocaleString('en',{minimumFractionDigits:2})}</p></Card></div>

    {entries.length>0?<Card className="p-0 overflow-hidden"><div className="border-b border-[#e2e7de] px-5 py-4"><p className="glow-eyebrow">Ledger</p><p className="glow-display mt-1 text-[18px] text-[#43503f]">Recent entries</p></div><div className="divide-y divide-[#e7eae4]">{entries.slice(0,12).map((entry,index)=><div key={entry.id} className={`grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 ${index===0?'bg-[#edf2ea]/55':''}`}><div className="min-w-0"><p className="truncate text-[9px] font-medium text-[#4b5747]">{entry.title}</p><p className="mt-0.5 text-[7px] text-[#83907e]">{entry.category} · {entry.entryDate}</p></div><div className="flex items-center gap-2"><span className={`glow-display text-[12px] ${entry.type==='income'?'text-[#587154]':entry.type==='saving'?'text-[#806b4a]':'text-[#985c63]'}`}>{entry.type==='income'?'+':entry.type==='expense'?'−':''}${Number(entry.amount).toLocaleString('en',{minimumFractionDigits:2})}</span><button type="button" onClick={()=>setDialogEntry(entry)} aria-label="Edit entry" className="rounded-full p-1.5 text-[#7d8878] hover:bg-white/55"><Pencil size={11}/></button><button type="button" onClick={()=>setDeleteTarget(entry)} aria-label="Delete entry" className="rounded-full p-1.5 text-[#7d8878] hover:bg-white/55"><Trash2 size={11}/></button></div></div>)}</div></Card>:<Card><p className="py-8 text-center text-[9px] text-[#7d8878]">No entries yet. Add your first financial record.</p></Card>}

    <Dialog open={dialogEntry!==null} onClose={()=>setDialogEntry(null)} title={dialogEntry==='new'?'Add entry':'Edit entry'}><FinanceEntryForm entry={dialogEntry==='new'?null:dialogEntry} onSaved={handleSaved} onCancel={()=>setDialogEntry(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this entry?" description={deleteTarget?`"${deleteTarget.title}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}
