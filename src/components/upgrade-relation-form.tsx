'use client';
import { useMemo, useState } from 'react';
import { Link2 } from 'lucide-react';
import { createUpgradeRelationAction } from '@/app/actions/upgrade-actions';

type Entity={id:string;type:string;title:string};
export function UpgradeRelationForm({room,toolId,entities}:{room:string;toolId:string;entities:Entity[]}){
  const [fromId,setFromId]=useState(entities[0]?.id??'');
  const [toId,setToId]=useState(entities[1]?.id??entities[0]?.id??'');
  const byId=useMemo(()=>new Map(entities.map(e=>[e.id,e])),[entities]);
  const from=byId.get(fromId),to=byId.get(toId);
  return <form action={createUpgradeRelationAction} className="paper-card rounded-[24px] border border-[#EFE2DC] bg-white p-5 sm:p-6">
    <input type="hidden" name="room" value={room}/><input type="hidden" name="toolId" value={toolId}/>
    <input type="hidden" name="fromType" value={from?.type??''}/><input type="hidden" name="fromId" value={from?.id??''}/><input type="hidden" name="toType" value={to?.type??''}/><input type="hidden" name="toId" value={to?.id??''}/>
    <div className="flex items-center gap-2"><Link2 size={15} className="text-[#C9727E]"/><h2 className="font-medium text-[#342B27]">Connect Glow Objects</h2></div><p className="mt-1 text-xs text-[#93867E]">Create a real relationship used by Brain and Graph. This does not imply causation.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
      <label className="text-[10px] uppercase tracking-[.12em] text-[#9A8B84]">From<select value={fromId} onChange={e=>setFromId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#EDE1DC] bg-white px-3 py-3 text-sm">{entities.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
      <span className="hidden pb-3 text-[#C9B9B0] sm:block">→</span>
      <label className="text-[10px] uppercase tracking-[.12em] text-[#9A8B84]">To<select value={toId} onChange={e=>setToId(e.target.value)} className="mt-2 w-full rounded-xl border border-[#EDE1DC] bg-white px-3 py-3 text-sm">{entities.map(e=><option key={e.id} value={e.id}>{e.title}</option>)}</select></label>
    </div>
    <input name="relation" defaultValue="related_to" className="mt-3 w-full rounded-xl border border-[#EDE1DC] px-3 py-3 text-sm"/>
    <button disabled={entities.length<2||fromId===toId} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DDB9BA] px-4 text-xs font-semibold text-[#A85F69] disabled:opacity-40"><Link2 size={13}/>Create connection</button>
  </form>;
}
