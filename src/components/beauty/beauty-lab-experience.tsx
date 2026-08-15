'use client';

import { useMemo, useState } from 'react';
import { Beaker, CalendarClock, FlaskConical, PackageSearch, RotateCcw, Sparkles } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { createBeautyProductAction, setBeautyProductArchivedAction, updateBeautyProductAction } from '@/app/actions/completion-v1';
import type { BeautyRoutine } from '@/lib/types';

type BeautyProductLite = {
  id: string; name: string; category: string; ingredients: string | null;
  openedAt: Date | null; expiresAt: Date | null; routinePosition: string | null;
  reaction: string | null; costCents: number | null; repurchase: string | null; usageFrequency: string | null;
};

const fieldClass = 'w-full rounded-lg border border-[#F7D1D8] bg-white px-3 py-2 text-[11px]';

function testingStatus(repurchase: string | null): { label: string; tone: string } {
  if (repurchase === 'yes') return { label: 'Works for Me', tone: 'bg-[#E4EBDD] text-[#5A6E52]' };
  if (repurchase === 'no') return { label: 'Discontinued', tone: 'bg-[#F1E8E4] text-[#8A5A56]' };
  if (repurchase === 'maybe') return { label: 'Unsure', tone: 'bg-[#F1E8D9] text-[#9A7A3D]' };
  return { label: 'Testing', tone: 'bg-[#FAE6E7] text-[#8B5864]' };
}

function money(cents: number | null) {
  return cents == null ? '—' : `$${(cents / 100).toFixed(2)}`;
}

export function BeautyLabExperience({ products, routines }: { products: BeautyProductLite[]; routines: BeautyRoutine[] }) {
  const [filter, setFilter] = useState<'all' | 'Testing' | 'Works for Me' | 'Unsure' | 'Discontinued'>('all');
  const currentExperiment = useMemo(() => {
    const testing = products.filter((p) => !p.repurchase);
    return [...testing].sort((a, b) => (b.openedAt?.getTime() ?? 0) - (a.openedAt?.getTime() ?? 0))[0] ?? null;
  }, [products]);
  const am = routines.filter((r) => r.timeOfDay === 'morning');
  const pm = routines.filter((r) => r.timeOfDay === 'evening' || r.timeOfDay === 'night');
  const amProductNames = new Set(am.flatMap((r) => r.products ?? []).map((p) => p.toLowerCase()));
  const pmProductNames = new Set(pm.flatMap((r) => r.products ?? []).map((p) => p.toLowerCase()));
  const repurchaseProducts = products.filter((p) => p.repurchase === 'yes');
  const inAm = repurchaseProducts.filter((p) => amProductNames.has(p.name.toLowerCase())).length;
  const inPm = repurchaseProducts.filter((p) => pmProductNames.has(p.name.toLowerCase())).length;
  const withIngredients = products.filter((p) => p.ingredients?.trim());
  const withReactions = products.filter((p) => p.reaction?.trim());
  const filtered = filter === 'all' ? products : products.filter((p) => testingStatus(p.repurchase).label === filter);
  const timeline = [...products].filter((p) => p.openedAt).sort((a, b) => b.openedAt!.getTime() - a.openedAt!.getTime()).slice(0, 8);
  const insight = repurchaseProducts.length > 0 && (inAm > 0 || inPm > 0)
    ? `Products you've marked to repurchase appear most often in your ${inPm >= inAm ? 'evening' : 'morning'} routine (${Math.max(inAm, inPm)} of ${repurchaseProducts.length}).`
    : withReactions.length > 0
      ? `You've logged reactions for ${withReactions.length} product${withReactions.length === 1 ? '' : 's'}. Mark repurchase decisions to start seeing routine correlations here.`
      : 'Log a reaction and a repurchase decision on a product to unlock your first Beauty Lab insight.';

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#B85D72]">Beauty Lab</p><h1 className="glow-display mt-1 text-[36px] leading-[1.05] text-[#2B2420] sm:text-[42px]">Test. Track.<br/>Understand what works.</h1><p className="mt-3 max-w-md text-[13px] text-[#8A8078]">A laboratory for products, ingredients, and progress — connected to your everyday Beauty routine.</p></div>
        <div className="overflow-hidden rounded-[20px] border border-[#F7D1D8]"><EditableRoomImage slot="beauty-lab:hero" label="Beauty Lab hero" className="min-h-[180px] sm:min-h-[220px]"/></div>
      </div>

      <div className="rounded-[20px] border border-[#F7D1D8] bg-[#F7EEED] p-5">
        <div className="flex items-center gap-1.5 text-[#B85D72]"><FlaskConical size={14}/><p className="text-[11px] font-semibold uppercase tracking-[.1em]">Current Experiment</p></div>
        {currentExperiment ? <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_auto]"><div><p className="glow-display text-[22px] text-[#2B2420]">{currentExperiment.name}</p><p className="mt-1 text-[11.5px] text-[#8A8078]">{currentExperiment.category}{currentExperiment.routinePosition ? ` · ${currentExperiment.routinePosition}` : ''}</p>{currentExperiment.openedAt ? <p className="mt-2 text-[11px] text-[#9A9088]">Started {currentExperiment.openedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p> : null}<p className="mt-2 text-[12px] leading-5 text-[#4A4440]">{currentExperiment.reaction || 'No observations logged yet — open the product below to add one.'}</p></div><div className="flex flex-col items-start gap-1.5 sm:items-end"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-medium text-[#B85D72]">In progress</span>{currentExperiment.expiresAt ? <span className="text-[10.5px] text-[#9A9088]">Evaluate by {currentExperiment.expiresAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span> : null}</div></div> : <p className="mt-3 text-[12px] text-[#8A8078]">No active experiment. Add a product without a repurchase decision yet to start one.</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-4"><div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><Beaker size={12} className="text-[#B85D72]"/>Cabinet</div><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{products.length}</p></div>
        <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-4"><div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><FlaskConical size={12} className="text-[#B85D72]"/>Ingredient notes</div><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{withIngredients.length}/{products.length || 0}</p></div>
        <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-4"><div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><Sparkles size={12} className="text-[#B85D72]"/>Reactions logged</div><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{withReactions.length}</p></div>
        <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-4"><div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#9A9088]"><CalendarClock size={12} className="text-[#B85D72]"/>Cabinet value</div><p className="glow-display mt-2 text-[24px] text-[#2B2420]">${(products.reduce((sum,p)=>sum+(p.costCents??0),0)/100).toFixed(0)}</p></div>
      </div>

      <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-5"><p className="text-[13px] font-medium text-[#2B2420]">Routine Comparison</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-[14px] bg-[#F7EEED] p-3.5"><p className="text-[11px] font-medium text-[#9A9088]">AM Routine</p><p className="glow-display mt-1 text-[19px] text-[#2B2420]">{am.length} steps</p><p className="text-[10.5px] text-[#9A9088]">{inAm} repurchase-worthy product{inAm===1?'':'s'}</p></div><div className="rounded-[14px] bg-[#F7EEED] p-3.5"><p className="text-[11px] font-medium text-[#9A9088]">PM Routine</p><p className="glow-display mt-1 text-[19px] text-[#2B2420]">{pm.length} steps</p><p className="text-[10.5px] text-[#9A9088]">{inPm} repurchase-worthy product{inPm===1?'':'s'}</p></div></div></div>

      <details className="rounded-[18px] border border-[#F7D1D8] bg-white p-5"><summary className="cursor-pointer text-[13px] font-medium text-[#2B2420]">+ Add a new product to the Lab</summary><form action={createBeautyProductAction} className="mt-3 grid gap-2 sm:grid-cols-2"><input name="name" required placeholder="Product name" className={fieldClass}/><input name="category" required placeholder="Category" className={fieldClass}/><textarea name="ingredients" rows={2} placeholder="Ingredients / actives" className={`${fieldClass} sm:col-span-2`}/><input name="openedAt" type="date" className={fieldClass}/><input name="expiresAt" type="date" className={fieldClass}/><input name="routinePosition" placeholder="Routine position" className={fieldClass}/><input name="cost" inputMode="decimal" placeholder="Cost" className={fieldClass}/><button type="submit" className="w-fit rounded-lg bg-[#B85D72] px-4 py-2 text-[11px] font-medium text-white sm:col-span-2">Start testing</button></form></details>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-[13px] font-medium text-[#2B2420]">Product Testing</p><div className="flex flex-wrap gap-1.5">{(['all','Testing','Works for Me','Unsure','Discontinued'] as const).map(option=><button key={option} type="button" onClick={()=>setFilter(option)} className={`rounded-full border px-3 py-1.5 text-[10.5px] font-medium transition ${filter===option?'border-[#F7D1D8] bg-[#FAE6E7] text-[#8B5864]':'border-[#F7D1D8] bg-white text-[#8A8078]'}`}>{option==='all'?'All':option}</button>)}</div></div>
        {filtered.length===0 ? <div className="mt-3 rounded-[18px] border border-dashed border-[#F7D1D8] bg-white p-8 text-center"><PackageSearch size={20} className="mx-auto text-[#D8CDC8]"/><p className="mt-2 text-[12px] text-[#9A9088]">Nothing in this state yet.</p></div> : <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(product=>{const status=testingStatus(product.repurchase);return <details key={product.id} className="group overflow-hidden rounded-[16px] border border-[#F7D1D8] bg-white"><summary className="cursor-pointer list-none p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-[13px] font-medium text-[#2B2420]">{product.name}</p><p className="text-[10.5px] text-[#9A9088]">{product.category}</p></div><span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-medium ${status.tone}`}>{status.label}</span></div>{product.reaction?<p className="mt-2 line-clamp-2 text-[11px] text-[#8A8078]">{product.reaction}</p>:null}<p className="mt-2 text-[10.5px] text-[#B5ACA5] group-open:hidden">Open details &amp; edit</p></summary><div className="border-t border-[#F7EEED] p-4"><form action={updateBeautyProductAction.bind(null,product.id)} className="space-y-2"><input type="hidden" name="name" value={product.name}/><input type="hidden" name="category" value={product.category}/><textarea name="ingredients" rows={2} defaultValue={product.ingredients??''} placeholder="Ingredients / actives" className={fieldClass}/><textarea name="reaction" rows={3} defaultValue={product.reaction??''} placeholder="Observations / results" className={fieldClass}/><input name="routinePosition" defaultValue={product.routinePosition??''} placeholder="Routine position" className={fieldClass}/><input name="usageFrequency" defaultValue={product.usageFrequency??''} placeholder="Usage frequency" className={fieldClass}/><input name="cost" inputMode="decimal" defaultValue={product.costCents==null?'':String(product.costCents/100)} placeholder="Cost" className={fieldClass}/><select name="repurchase" defaultValue={product.repurchase??''} className={fieldClass}><option value="">Still testing</option><option value="yes">Works for me — repurchase</option><option value="maybe">Unsure</option><option value="no">Discontinued</option></select><div className="flex gap-2"><button type="submit" className="rounded-lg bg-[#4A4440] px-3 py-1.5 text-[10.5px] font-medium text-white">Save</button><span className="self-center text-[10px] text-[#9A9088]">{money(product.costCents)}</span></div></form><form action={setBeautyProductArchivedAction.bind(null,product.id,true)} className="mt-2"><button type="submit" className="inline-flex items-center gap-1.5 text-[10px] text-[#8A8078]"><RotateCcw size={10}/>Archive product</button></form></div></details>})}</div>}
      </div>

      <div className="rounded-[18px] border border-[#F7D1D8] bg-white p-5"><p className="text-[13px] font-medium text-[#2B2420]">Progress</p>{timeline.length===0?<p className="mt-2 text-[12px] text-[#9A9088]">Add opened dates to your products to build a testing timeline.</p>:<div className="mt-3 space-y-3">{timeline.map(product=>{const status=testingStatus(product.repurchase);return <div key={product.id} className="flex items-center gap-3"><span className="h-2 w-2 shrink-0 rounded-full bg-[#F7D1D8]"/><span className="w-[70px] shrink-0 text-[10.5px] text-[#9A9088]">{product.openedAt?.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span className="min-w-0 flex-1 truncate text-[12px] text-[#3A332E]">{product.name}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-medium ${status.tone}`}>{status.label}</span></div>})}</div>}</div>
      <div className="relative overflow-hidden rounded-[18px] border border-[#F7D1D8] bg-[#F7EEED] p-5"><div className="flex items-center gap-1.5 text-[#B85D72]"><Sparkles size={14}/><p className="text-[12px] font-medium">Beauty Lab Insight</p></div><p className="mt-2 max-w-xl text-[12.5px] leading-5 text-[#4A4440]">{insight}</p></div>
    </div>
  );
}
