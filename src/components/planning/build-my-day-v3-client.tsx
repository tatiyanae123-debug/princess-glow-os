'use client';

import { useState, useTransition } from 'react';
import { buildMyDayV3Action } from '@/app/actions/build-my-day-v3';
import { acceptPlanningSuggestionAction } from '@/app/actions/intelligence-expansion';
import { GLOW_DAY_MODES, GLOW_DAY_MODE_ORDER, type GlowDayMode } from '@/lib/day-mode';
import type { ScheduleProposal } from '@/lib/intelligence/domain';

function clock(value: Date | string) { return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }

export function BuildMyDayV3Client({ initialProposal }: { initialProposal: ScheduleProposal }) {
  const [proposal, setProposal] = useState(initialProposal);
  const [pending, startTransition] = useTransition();
  const [accepted, setAccepted] = useState<string[]>([]);
  const active = GLOW_DAY_MODES[proposal.mode];

  function select(mode: GlowDayMode) {
    localStorage.setItem('glow-os:day-mode', mode);
    document.documentElement.dataset.dayMode = mode;
    document.dispatchEvent(new CustomEvent('glow:day-mode', { detail: { mode } }));
    startTransition(async () => { setProposal(await buildMyDayV3Action(mode)); setAccepted([]); });
  }

  function accept(item: ScheduleProposal['suggestions'][number]) {
    startTransition(async () => { await acceptPlanningSuggestionAction({ proposalId: proposal.id, item }); setAccepted(v => [...v, item.id]); });
  }

  return <div className="space-y-5">
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {GLOW_DAY_MODE_ORDER.map(mode => <button key={mode} type="button" disabled={pending} onClick={() => select(mode)} className={`rounded-[16px] border px-3.5 py-3 text-left transition ${proposal.mode===mode?'border-[#DDAEB4] bg-[#FDF3F2]':'border-[#F1E7E3] bg-white hover:bg-[#FFFCFA]'}`}><p className="text-[11.5px] font-medium text-[#3A332E]">{GLOW_DAY_MODES[mode].label}</p><p className="mt-1 text-[9.5px] text-[#9A9088]">{mode==='most-productive'?'Fill more available space.':mode==='productive'?'Balanced strong day.':mode==='bare-minimum'?'Only essentials.':'No new Glow blocks.'}</p></button>)}
    </div>
    <div className="rounded-[16px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 text-[11px] leading-5 text-[#7D746F]"><strong className="text-[#4A4440]">{active.label}.</strong> Fixed commitments stay protected. Nothing is written to your calendar until you approve a suggested block.</div>
    {proposal.fixedCommitments.length>0?<section><p className="mb-2 text-[9px] font-semibold uppercase tracking-[.16em] text-[#9A9088]">Fixed commitments</p><div className="space-y-2">{proposal.fixedCommitments.map(item=><div key={item.id} className="rounded-[14px] border border-[#F1E7E3] bg-white p-3"><p className="text-[11.5px] font-medium">{item.title}</p><p className="mt-1 text-[10px] text-[#9A9088]">{clock(item.startAt)}{item.endAt?` – ${clock(item.endAt)}`:''}</p></div>)}</div></section>:null}
    <section><div className="mb-2 flex items-center justify-between"><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#9A9088]">Suggested blocks · {active.label}</p><button type="button" onClick={()=>select(proposal.mode)} disabled={pending} className="text-[10.5px] text-[#C9727E]">{pending?'Building…':'Rebuild'}</button></div><div className="space-y-2">{proposal.suggestions.map(item=><div key={item.id} className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><p className="text-[12px] font-medium">{item.title}</p><p className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">{clock(item.startAt)}–{clock(item.endAt)} · {item.reason}</p><div className="mt-3 flex gap-2"><button type="button" disabled={pending||accepted.includes(item.id)} onClick={()=>accept(item)} className="rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] text-white">{accepted.includes(item.id)?'Accepted':'Accept block'}</button></div></div>)}{proposal.suggestions.length===0?<div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4 text-[11px] text-[#8A8078]">{proposal.mode==='clear-schedule'?'Clear Schedule is active. Glow is adding no new work blocks.':'No extra blocks are needed right now.'}</div>:null}</div></section>
  </div>;
}
