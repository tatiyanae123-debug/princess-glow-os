'use client';

import { GlowOrb } from '@/components/glow-orb';

export function GlowActionButton(){
  return (
    <button
      type="button"
      onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))}
      className="group fixed bottom-[calc(env(safe-area-inset-bottom)+14px)] right-[max(14px,env(safe-area-inset-right))] z-[90] inline-flex min-h-14 items-center gap-3 rounded-full border border-white/75 bg-white/82 py-1.5 pl-1.5 pr-4 text-left shadow-[0_16px_50px_rgba(90,76,118,.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_64px_rgba(90,76,118,.24)] active:translate-y-0 sm:bottom-5 sm:right-5"
      aria-label="Open Glow assistant"
    >
      <GlowOrb size={46} />
      <span className="min-w-0 pr-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[.14em] text-[#8B7C91]">Ask Glow</span>
        <span className="block max-w-[132px] truncate text-[12px] text-[#5F5962]">Speak or type anything</span>
      </span>
    </button>
  );
}
