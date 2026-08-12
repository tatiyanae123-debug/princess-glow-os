'use client';

import { Sparkles } from 'lucide-react';

export function GlowActionButton(){
  return <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="fixed bottom-5 right-5 z-[90] inline-flex h-12 items-center gap-2 rounded-full bg-[#1C1C1E] px-5 text-[13px] font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-black active:translate-y-0" aria-label="Open Glow actions">
    <Sparkles size={16}/><span>Glow</span>
  </button>;
}
