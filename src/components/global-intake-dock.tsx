'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { FileText, Image as ImageIcon, Link2, Plus, Sparkles, UploadCloud, X } from 'lucide-react';
import { UniversalIntakeForm } from '@/components/intake/universal-intake-form';

export function GlobalIntakeDock(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  return <>
    <button type="button" onClick={()=>setOpen(true)} className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full border border-[#d9b9b9] bg-[#3c302c] px-4 py-3 text-[10px] font-semibold text-white shadow-[0_16px_45px_rgba(61,43,38,.25)] transition hover:-translate-y-0.5 hover:bg-[#6d464d] focus:outline-none focus:ring-2 focus:ring-[#dca8ad]" aria-label="Add anything to Glow OS">
      <Plus size={15}/><span className="hidden sm:inline">Add anything</span><Sparkles size={13} className="text-[#f0c7c9]"/>
    </button>
    {open?<div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#241b18]/35 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Universal Glow intake">
      <button type="button" className="absolute inset-0 cursor-default" onClick={()=>setOpen(false)} aria-label="Close intake"/>
      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-[#ead6d0] bg-[#fffaf6] p-5 shadow-[0_28px_90px_rgba(49,35,30,.28)] sm:rounded-[28px] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#a16770]">Universal Intake</p><h2 className="glow-display mt-1 text-[27px] text-[#382c28]">Drop anything into Glow</h2><p className="mt-2 max-w-xl text-[10px] leading-5 text-[#7b6861]">Text, photo, screenshot, PDF, receipt, schedule, recipe, reminder, product, outfit idea, document or link. Glow analyzes it once and proposes where it belongs.</p></div>
          <button type="button" onClick={()=>setOpen(false)} className="rounded-full border border-[#e5d7cf] bg-white p-2 text-[#77645e] hover:bg-[#f7ece8]" aria-label="Close"><X size={15}/></button>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[8px] text-[#806c65]">
          {[[ImageIcon,'Photo'],[FileText,'Document'],[Link2,'Link'],[UploadCloud,'Any file']].map(([Icon,label])=>{const I=Icon as typeof ImageIcon;return <div key={String(label)} className="rounded-xl bg-[#f7eee9] px-2 py-3"><I size={14} className="mx-auto text-[#a86b74]"/><span className="mt-1 block">{String(label)}</span></div>})}
        </div>
        <div className="mt-5"><UniversalIntakeForm compact sourceRoute={pathname}/></div>
        <p className="mt-3 text-[8px] leading-4 text-[#9a857d]">Captured from <span className="font-medium text-[#6e5851]">{pathname}</span>. You can review everything later in Glow Inbox and Universal Intake.</p>
      </div>
    </div>:null}
  </>;
}
