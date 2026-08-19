'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { GoalForm } from '@/components/goals/goal-form';
import { GoalManager } from '@/components/goals/goal-manager';
import type { Goal } from '@/lib/types';

function cleanGoalParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('goalId');
  next.delete('selected');
  next.delete('new');
  return next;
}

export function GoalsRouteExperience({ initialGoals, showManager = true }: { initialGoals: Goal[]; showManager?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('goalId') ?? searchParams.get('selected');
  const creating = searchParams.get('new') === '1';
  const selectedGoal = useMemo(() => (requestedId ? initialGoals.find((goal) => goal.id === requestedId) ?? null : null), [initialGoals, requestedId]);

  function closeRecord() {
    const next = cleanGoalParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/goals?${next.toString()}` : '/goals', { scroll: false });
  }

  return <>
    {showManager ? <GoalManager initialGoals={initialGoals} /> : null}
    <Dialog open={Boolean(creating || (requestedId && selectedGoal))} onClose={closeRecord} title={creating ? 'New Goal' : selectedGoal ? `Goal · ${selectedGoal.title}` : 'Goal'}>
      {creating || selectedGoal ? <GoalForm goal={selectedGoal ?? undefined} onSaved={() => { closeRecord(); router.refresh(); }} onCancel={closeRecord} /> : null}
    </Dialog>
    {requestedId && !selectedGoal ? <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">That goal is no longer available.</div> : null}
  </>;
}
