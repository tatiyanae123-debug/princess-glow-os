import Link from 'next/link';
import { ArrowLeft, Brain, Link2, Save, Sparkles, Timer } from 'lucide-react';
import { createUpgradeProposalAction, createUpgradeRelationAction, startUpgradeFocusAction } from '@/app/actions/upgrade-actions';
import { saveUpgradeWorkspaceAction } from '@/app/actions/upgrade-workspace';
import type { UpgradeTool } from '@/lib/intelligence/room-upgrades';

type Entity={id:string;type:string;title:string};
type Props={room:string;tool:UpgradeTool;state?:{title:string;summary:string|null;status:string}|null;entities:Entity[];proposalCount:number;focusCount:number;relationCount:number};

export function UpgradeWorkspace({room,tool,state,entities,proposalCount,focusCount,relationCount}:Props){
  const back=tool.href??'/all-rooms';
  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex items-center justify-between gap-4"><Link href={back} className="inline-flex items-center gap-2 text-xs font-medium text-[#9A7C76]"><ArrowLeft size={14}/>Back</Link><span className="glow-eyebrow">Glow Upgrade Workspace</span></div>
    <header className="editorial-surface rounded-[28px] border border-[#EFE2DC] bg-white p-6 sm:p-8">
      <p className="glow-eyebrow">{room.replaceAll('-',' ')}</p><h1 className="glow-display mt-2 text-4xl text-[#2B2420] sm:text-5xl">{tool.label}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#82756D]">{tool.description}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-[10px] uppercase tracking-[.12em] text-[#9A8B84]"><span>{proposalCount} proposals</span><span>·</span><span>{relationCount} connections</span><span>·</span><span>{focusCount} focus sessions</span></div>
    </header>

    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <form action={saveUpgradeWorkspaceAction} className="paper-card rounded-[24px] border border-[#EFE2DC] bg-white p-5 sm:p-6">
        <input type="hidden" name="room" value={room}/><input type="hidden" name="toolId" value={tool.id}/>
        <div className="flex items-center gap-2"><Save size={15} className="text-[#C9727E]"/><h2 className="font-medium text-[#342B27]">Workspace</h2></div>
        <label className="mt-5 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#9A8B84]">Title<input name="title" defaultValue={state?.title??tool.label} className="mt-2 w-full rounded-2xl border border-[#EDE1DC] bg-[#FFFCFA] px-4 py-3 text-sm outline-none focus:border-[#D7A9AF]"/></label>
        <label className="mt-4 block text-[10px] font-semibold uppercase tracking-[.14em] text-[#9A8B84]">Notes / plan<textarea name="notes" defaultValue={state?.summary??''} rows={9} placeholder="Capture the real plan, details, checklist, data notes, or decisions for this tool…" className="mt-2 w-full resize-y rounded-2xl border border-[#EDE1DC] bg-[#FFFCFA] px-4 py-3 text-sm leading-6 outline-none focus:border-[#D7A9AF]"/></label>
        <input type="hidden" name="status" value="active"/><button type="submit" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#C9727E] px-5 text-sm font-medium text-white"><Save size={14}/>Save workspace</button>
      </form>

      <div className="space-y-5">
        <form action={createUpgradeProposalAction} className="paper-card rounded-[24px] border border-[#EFE2DC] bg-[#FFF8F6] p-5">
          <input type="hidden" name="room" value={room}/><input type="hidden" name="toolId" value={tool.id}/><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#C9727E]"/><h2 className="font-medium text-[#342B27]">Ask Glow to propose</h2></div><textarea name="summary" rows={3} placeholder={`What should Glow propose for ${tool.label}?`} className="mt-3 w-full rounded-2xl border border-[#E9D8D4] bg-white px-4 py-3 text-sm outline-none"/><input name="reason" placeholder="Why this matters (optional)" className="mt-2 w-full rounded-2xl border border-[#E9D8D4] bg-white px-4 py-3 text-sm outline-none"/><button className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DDB9BA] bg-white px-4 text-xs font-semibold text-[#A85F69]"><Brain size={13}/>Create approval proposal</button>
        </form>
        <form action={startUpgradeFocusAction} className="paper-card rounded-[24px] border border-[#EFE2DC] bg-white p-5"><input type="hidden" name="room" value={room}/><input type="hidden" name="toolId" value={tool.id}/><div className="flex items-center gap-2"><Timer size={15} className="text-[#A88B63]"/><h2 className="font-medium text-[#342B27]">Focus on this</h2></div><div className="mt-3 flex gap-2"><input type="number" min="1" max="480" name="plannedMinutes" defaultValue="25" className="min-w-0 flex-1 rounded-full border border-[#EDE1DC] px-4 py-2 text-sm"/><button className="rounded-full bg-[#302A27] px-4 text-xs font-medium text-white">Start session</button></div></form>
      </div>
    </div>

    <form action={createUpgradeRelationAction} className="paper-card rounded-[24px] border border-[#EFE2DC] bg-white p-5 sm:p-6">
      <input type="hidden" name="room" value={room}/><input type="hidden" name="toolId" value={tool.id}/><div className="flex items-center gap-2"><Link2 size={15} className="text-[#C9727E]"/><h2 className="font-medium text-[#342B27]">Connect Glow Objects</h2></div><p className="mt-1 text-xs text-[#93867E]">Create a real relationship used by Brain and Graph. This does not imply causation.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end"><label className="text-[10px] uppercase tracking-[.12em] text-[#9A8B84]">From<select name="fromEntity" className="mt-2 w-full rounded-xl border border-[#EDE1DC] bg-white px-3 py-3 text-sm" onChange={undefined}>{entities.map(e=><option key={e.id} value={`${e.type}|${e.id}`}>{e.title}</option>)}</select></label><span className="hidden pb-3 text-[#C9B9B0] sm:block">→</span><label className="text-[10px] uppercase tracking-[.12em] text-[#9A8B84]">To<select name="toEntity" className="mt-2 w-full rounded-xl border border-[#EDE1DC] bg-white px-3 py-3 text-sm">{entities.map(e=><option key={e.id} value={`${e.type}|${e.id}`}>{e.title}</option>)}</select></label></div>
      <input type="hidden" name="fromType" value={entities[0]?.type??''}/><input type="hidden" name="fromId" value={entities[0]?.id??''}/><input type="hidden" name="toType" value={entities[1]?.type??entities[0]?.type??''}/><input type="hidden" name="toId" value={entities[1]?.id??entities[0]?.id??''}/><input name="relation" defaultValue="related_to" className="mt-3 w-full rounded-xl border border-[#EDE1DC] px-3 py-3 text-sm"/><button disabled={entities.length<2} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#DDB9BA] px-4 text-xs font-semibold text-[#A85F69] disabled:opacity-40"><Link2 size={13}/>Create connection</button>
    </form>
  </div>;
}
