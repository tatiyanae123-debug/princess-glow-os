'use client';

import { useState } from 'react';
import { ArrowRight, Check, PartyPopper, SkipForward, X } from 'lucide-react';
import type { Routine, RoutineStep } from '@/lib/types';

/**
 * The Focus Mode ritual player: one step at a time, with progress, matching
 * "Routine Mode should show one step at a time with progress" from the
 * master spec and the rulebook's Focus Mode direction for Routines.
 */
export function RoutineStepPlayer({ routine, steps, onClose }: { routine: Routine; steps: RoutineStep[]; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const step = steps[index];
  const finished = index >= steps.length;
  const completedCount = done.size;

  function complete() {
    if (step) setDone((current) => new Set(current).add(step.id));
    setIndex((value) => value + 1);
  }

  function skip() {
    setIndex((value) => value + 1);
  }

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#231b18]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${routine.name} guided ritual`}>
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/20 bg-[linear-gradient(150deg,#fffaf6,#f4e6e1)] shadow-[0_30px_80px_rgba(40,25,20,.35)]">
        <div className="flex items-center justify-between border-b border-[#eadad2] px-5 py-4">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#a16c72]">{routine.name}</p>
            <p className="mt-0.5 text-[8px] text-[#8a746d]">{Math.min(index, steps.length)} of {steps.length} steps</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Exit ritual" className="rounded-full border border-[#e6d5cd] bg-white/70 p-2 text-[#6e5951]"><X size={14} /></button>
        </div>

        <div className="h-1 w-full bg-[#f0e2db]"><div className="h-full bg-[#bd7c85] transition-all" style={{ width: `${steps.length ? (Math.min(index, steps.length) / steps.length) * 100 : 0}%` }} /></div>

        <div className="p-6 sm:p-8">
          {steps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="glow-display text-[19px] text-[#443632]">No steps yet for this ritual.</p>
              <p className="mt-2 text-[9px] text-[#8a746d]">Add steps below to turn this into a guided, one-step-at-a-time ritual.</p>
            </div>
          ) : finished ? (
            <div className="py-6 text-center">
              <PartyPopper size={28} className="mx-auto text-[#bd7c85]" />
              <p className="glow-display mt-3 text-[24px] text-[#443632]">Ritual complete.</p>
              <p className="mt-2 text-[9px] text-[#8a746d]">{completedCount} of {steps.length} steps completed this pass.</p>
              <button type="button" onClick={onClose} className="mt-5 rounded-[11px] bg-[#322926] px-5 py-3 text-[9px] font-semibold text-white">Close</button>
            </div>
          ) : (
            <>
              <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#a16c72]">Current step</p>
              <h2 className="glow-display mt-2 text-[26px] leading-tight text-[#392e2a]">{step.title}</h2>
              {step.notes ? <p className="mt-3 text-[10px] leading-5 text-[#78665f]">{step.notes}</p> : null}
              {step.durationMinutes ? <p className="mt-3 text-[8px] uppercase tracking-[.1em] text-[#9c837b]">~{step.durationMinutes} min</p> : null}
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={complete} className="flex items-center gap-2 rounded-[11px] bg-[#322926] px-4 py-3 text-[9px] font-semibold text-white"><Check size={13} />Done, next step</button>
                <button type="button" onClick={skip} className="flex items-center gap-2 rounded-[11px] border border-[#e0cfc6] bg-white/70 px-4 py-3 text-[9px] font-medium text-[#6e5951]"><SkipForward size={12} />Skip step</button>
              </div>
            </>
          )}
        </div>

        {steps.length > 0 && !finished ? (
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#eadad2] px-5 py-3">
            {steps.map((item, itemIndex) => (
              <span key={item.id} className={`h-1.5 flex-1 rounded-full ${itemIndex < index ? 'bg-[#bd7c85]' : itemIndex === index ? 'bg-[#e2a4ab]' : 'bg-[#eee1da]'}`} />
            ))}
          </div>
        ) : null}
        {!finished && steps.length > 0 ? <div className="flex items-center justify-end gap-1 px-5 pb-4 text-[7px] text-[#9c837b]"><ArrowRight size={9} />step {index + 1} of {steps.length}</div> : null}
      </div>
    </div>
  );
}
