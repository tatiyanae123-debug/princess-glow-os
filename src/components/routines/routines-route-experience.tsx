'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { RoutineForm } from '@/components/routines/routine-form';
import { RoutinesExperience } from '@/components/routines/routines-experience';
import type { Routine, RoutineStep } from '@/lib/types';

function withoutRoutineParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('routineId');
  next.delete('selected');
  return next;
}

export function RoutinesRouteExperience({ initialRoutines, initialSteps }: { initialRoutines: Routine[]; initialSteps: RoutineStep[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('routineId') ?? searchParams.get('selected');
  const selectedRoutine = useMemo(
    () => (requestedId ? initialRoutines.find((routine) => routine.id === requestedId) ?? null : null),
    [initialRoutines, requestedId],
  );

  function closeRecord() {
    const next = withoutRoutineParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/routines?${next.toString()}` : '/routines', { scroll: false });
  }

  return (
    <>
      <RoutinesExperience initialRoutines={initialRoutines} initialSteps={initialSteps} />
      <Dialog open={Boolean(requestedId && selectedRoutine)} onClose={closeRecord} title={selectedRoutine ? `Routine · ${selectedRoutine.name}` : 'Routine'}>
        {selectedRoutine ? (
          <RoutineForm
            routine={selectedRoutine}
            onSaved={() => {
              closeRecord();
              router.refresh();
            }}
            onCancel={closeRecord}
          />
        ) : null}
      </Dialog>
      {requestedId && !selectedRoutine ? (
        <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">
          That routine is no longer available.
        </div>
      ) : null}
    </>
  );
}
