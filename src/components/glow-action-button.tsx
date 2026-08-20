'use client';

import { Sparkles } from 'lucide-react';

export function GlowActionButton(){
  return <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-action-fab fixed bottom-[calc(env(safe-area-inset-bottom)+16px)] right-[max(16px,env(safe-area-inset-right))] z-[90] inline-flex h-12 max-w-[calc(50vw-22px)] items-center gap-2 rounded-full bg-[#1C1C1E] px-5 text-[13px] font-semibold text-white shadow-[0_14px_34px_rgba(0,0,0,.16)] transition hover:-translate-y-0.5 hover:bg-black active:translate-y-0 sm:bottom-5 sm:right-5 sm:max-w-none" aria-label="Open Glow actions">
    <Sparkles size={16} className="shrink-0"/><span className="truncate">Glow</span>
  </button>;
}
