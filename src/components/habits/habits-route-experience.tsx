'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { HabitsExperience } from '@/components/habits/habits-experience';
import type { Habit, HabitLog } from '@/lib/types';

function withoutHabitParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('habitId');
  next.delete('selected');
  return next;
}

export function HabitsRouteExperience({ initialHabits, initialLogs }: { initialHabits: Habit[]; initialLogs: HabitLog[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('habitId') ?? searchParams.get('selected');
  const selectedHabit = useMemo(
    () => (requestedId ? initialHabits.find((habit) => habit.id === requestedId) ?? null : null),
    [initialHabits, requestedId],
  );

  function closeRecord() {
    const next = withoutHabitParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/habits?${next.toString()}` : '/habits', { scroll: false });
  }

  return (
    <>
      <HabitsExperience initialHabits={initialHabits} initialLogs={initialLogs} />
      <Dialog open={Boolean(requestedId && selectedHabit)} onClose={closeRecord} title={selectedHabit ? `Habit · ${selectedHabit.name}` : 'Habit'}>
        {selectedHabit ? (
          <HabitForm
            habit={selectedHabit}
            onSaved={() => {
              closeRecord();
              router.refresh();
            }}
            onCancel={closeRecord}
          />
        ) : null}
      </Dialog>
      {requestedId && !selectedHabit ? (
        <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">
          That habit is no longer available.
        </div>
      ) : null}
    </>
  );
}
