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
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#2B2420]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${routine.name} guided ritual`}>
      <div className="w-full max-w-md overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-white shadow-[0_30px_80px_rgba(40,25,20,.25)]">
        <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#C9727E]">{routine.name}</p>
            <p className="mt-0.5 text-[11px] text-[#8A8078]">{Math.min(index, steps.length)} of {steps.length} steps</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Exit ritual" className="rounded-full border border-[#F1E7E3] bg-white p-2 text-[#8A8078] hover:bg-[#FDF8F6]"><X size={14} /></button>
        </div>

        <div className="h-1 w-full bg-[#F4ECE8]"><div className="h-full bg-[#C9727E] transition-all" style={{ width: `${steps.length ? (Math.min(index, steps.length) / steps.length) * 100 : 0}%` }} /></div>

        <div className="p-6 sm:p-8">
          {steps.length === 0 ? (
            <div className="py-8 text-center">
              <p className="glow-display text-[19px] text-[#2B2420]">No steps yet for this ritual.</p>
              <p className="mt-2 text-[12px] text-[#8A8078]">Add steps below to turn this into a guided, one-step-at-a-time ritual.</p>
            </div>
          ) : finished ? (
            <div className="py-6 text-center">
              <PartyPopper size={28} className="mx-auto text-[#C9727E]" />
              <p className="glow-display mt-3 text-[24px] text-[#2B2420]">Ritual complete.</p>
              <p className="mt-2 text-[12px] text-[#8A8078]">{completedCount} of {steps.length} steps completed this pass.</p>
              <button type="button" onClick={onClose} className="mt-5 rounded-full bg-[#2B2420] px-5 py-3 text-[12px] font-medium text-white">Close</button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#C9727E]">Current step</p>
              <h2 className="glow-display mt-2 text-[26px] leading-tight text-[#2B2420]">{step.title}</h2>
              {step.notes ? <p className="mt-3 text-[13px] leading-5 text-[#4A4440]">{step.notes}</p> : null}
              {step.durationMinutes ? <p className="mt-3 text-[10.5px] uppercase tracking-[.08em] text-[#B5ACA5]">~{step.durationMinutes} min</p> : null}
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={complete} className="flex items-center gap-2 rounded-full bg-[#2B2420] px-4 py-3 text-[12px] font-medium text-white"><Check size={13} />Done, next step</button>
                <button type="button" onClick={skip} className="flex items-center gap-2 rounded-full border border-[#F1E7E3] bg-white px-4 py-3 text-[12px] font-medium text-[#4A4440] hover:bg-[#FDF8F6]"><SkipForward size={12} />Skip step</button>
              </div>
            </>
          )}
        </div>

        {steps.length > 0 && !finished ? (
          <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[#F1E7E3] px-5 py-3">
            {steps.map((item, itemIndex) => (
              <span key={item.id} className={`h-1.5 flex-1 rounded-full ${itemIndex < index ? 'bg-[#C9727E]' : itemIndex === index ? 'bg-[#E4C0C6]' : 'bg-[#F1E7E3]'}`} />
            ))}
          </div>
        ) : null}
        {!finished && steps.length > 0 ? <div className="flex items-center justify-end gap-1 px-5 pb-4 text-[10px] text-[#B5ACA5]"><ArrowRight size={9} />step {index + 1} of {steps.length}</div> : null}
      </div>
    </div>
  );
}
