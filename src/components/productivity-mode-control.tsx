'use client';

import { useState } from 'react';
import { Check, ChevronDown, Cloud, Leaf, Sparkles, Zap } from 'lucide-react';
import { PRODUCTIVITY_MODES, type ProductivityMode, useGlow } from '@/lib/context/glow-provider';

const ICONS: Record<ProductivityMode, typeof Sparkles> = {
  'very-productive': Zap,
  normal: Leaf,
  low: Sparkles,
  'cancel-everything': Cloud,
};

export function ProductivityModeControl({ compact = false }: { compact?: boolean }) {
  const { productivityMode, productivityModeInfo, setProductivityMode } = useGlow();
  const [open, setOpen] = useState(false);
  const ActiveIcon = ICONS[productivityMode];

  return (
    <div className="relative" data-glow-productivity-control>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-2 rounded-full border border-[#eadfdb] bg-white/90 text-[#4d4541] shadow-[0_6px_22px_rgba(65,45,37,.06)] backdrop-blur-xl transition hover:bg-[#fff8f7] ${compact ? 'h-9 px-3 text-[11px]' : 'h-10 px-3.5 text-[11.5px]'}`}
      >
        <ActiveIcon size={14} className="text-[#bd6678]" />
        <span className="font-medium">Today · {productivityModeInfo.shortLabel}</span>
        <ChevronDown size={13} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <>
          <button aria-label="Close productivity modes" className="fixed inset-0 z-[94] cursor-default" onClick={() => setOpen(false)} />
          <div role="menu" className="absolute right-0 top-[calc(100%+9px)] z-[95] w-[min(330px,calc(100vw-28px))] overflow-hidden rounded-[22px] border border-[#eadfdb] bg-white p-2 shadow-[0_24px_70px_rgba(64,43,36,.15)]">
            <div className="px-3 pb-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#a1958e]">Glow Modes</p>
              <p className="mt-1 text-[11px] leading-4 text-[#7f756f]">This changes the operating system's priorities, density, routines, prompts, and recommendations for today.</p>
            </div>
            {(Object.keys(PRODUCTIVITY_MODES) as ProductivityMode[]).map((mode) => {
              const info = PRODUCTIVITY_MODES[mode];
              const Icon = ICONS[mode];
              const active = productivityMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => { setProductivityMode(mode); setOpen(false); }}
                  className={`flex w-full items-start gap-3 rounded-[16px] px-3 py-3 text-left transition ${active ? 'bg-[#fcebed]' : 'hover:bg-[#fbf7f5]'}`}
                >
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? 'bg-white text-[#ba6174]' : 'bg-[#f7f1ee] text-[#756b65]'}`}><Icon size={15} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] font-semibold text-[#3e3834]">{info.label}</span>
                    <span className="mt-1 block text-[10.5px] leading-4 text-[#857b74]">{info.description}</span>
                  </span>
                  {active ? <Check size={15} className="mt-2 shrink-0 text-[#ba6174]" /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
