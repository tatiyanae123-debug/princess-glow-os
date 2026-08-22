'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { buildMyDayAction } from '@/app/actions/build-my-day';
import { acceptPlanningSuggestionAction } from '@/app/actions/intelligence-expansion';
import type { ScheduleProposal } from '@/lib/intelligence/domain';

function time(value: Date | string) {
  return new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function BuildMyDayClient({ initialProposal }: { initialProposal: ScheduleProposal }) {
  const [proposal, setProposal] = useState(initialProposal);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const visibleSuggestions = proposal.suggestions.filter((item) => !dismissed.includes(item.id));

  function rebuild(mode: 'standard' | 'lighter' | ScheduleProposal['mode']) {
    const legacyMode = mode === 'bare-minimum' || mode === 'clear-schedule' ? 'lighter' : 'standard';
    startTransition(async () => {
      const next = await buildMyDayAction(legacyMode);
      setProposal(next);
      setDismissed([]);
      setAccepted([]);
    });
  }

  function accept(item: ScheduleProposal['suggestions'][number]) {
    startTransition(async () => {
      await acceptPlanningSuggestionAction({ proposalId: proposal.id, item });
      setAccepted((current) => current.includes(item.id) ? current : [...current, item.id]);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => rebuild('standard')} disabled={pending}>{pending ? 'Building…' : 'Build My Day'}</Button>
        <Button type="button" variant="secondary" onClick={() => rebuild('lighter')} disabled={pending}>Lighter Day</Button>
        <Button type="button" variant="ghost" onClick={() => rebuild(proposal.mode)} disabled={pending}>Rebuild</Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
        Glow OS protects your fixed calendar commitments. Accepted suggestions become Glow OS planning blocks only. Google Calendar is never changed.
      </div>

      {proposal.fixedCommitments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fixed commitments</p>
          {proposal.fixedCommitments.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-slate-500">{time(item.startAt)}{item.endAt ? `–${time(item.endAt)}` : ''}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Suggested blocks · {proposal.mode}</p>
        {visibleSuggestions.map((item) => (
          <div key={item.id} className="rounded-[22px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{time(item.startAt)}–{time(item.endAt)} · {item.reason}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800">{item.sourceType.replace('_', ' ')}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="button" variant="secondary" disabled={pending || accepted.includes(item.id)} onClick={() => accept(item)}>{accepted.includes(item.id) ? 'Accepted' : 'Accept suggestion'}</Button>
              <Button type="button" variant="ghost" disabled={accepted.includes(item.id)} onClick={() => setDismissed((current) => current.includes(item.id) ? current : [...current, item.id])}>Dismiss</Button>
            </div>
          </div>
        ))}
        {visibleSuggestions.length === 0 && <p className="text-sm text-slate-500">{proposal.suggestions.length === 0 ? 'No schedule suggestions are needed right now.' : 'All current suggestions are dismissed. Rebuild the plan whenever you want a fresh set.'}</p>}
      </div>
    </div>
  );
}