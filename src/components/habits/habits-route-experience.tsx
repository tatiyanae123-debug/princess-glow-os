'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { HabitsExperience } from '@/components/habits/habits-experience';
import { HabitConnectionsPanel } from '@/components/habits/habit-connections-panel';
import type {
  CalendarEvent,
  Goal,
  Habit,
  HabitCompletionDetail,
  HabitExperiment,
  HabitLog,
  HabitProfile,
  HabitSourceLink,
  HabitStack,
  HabitTimingStat,
  HabitTrigger,
  Routine,
  Task,
} from '@/lib/types';

function withoutHabitParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('habitId');
  next.delete('selected');
  return next;
}

export function HabitsRouteExperience({
  initialHabits,
  initialLogs,
  profiles,
  details,
  timingStats,
  triggers,
  stacks,
  experiments,
  sourceLinks,
  calendarEvents,
  routines,
  goals,
  tasks,
}: {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
  profiles: HabitProfile[];
  details: HabitCompletionDetail[];
  timingStats: HabitTimingStat[];
  triggers: HabitTrigger[];
  stacks: HabitStack[];
  experiments: HabitExperiment[];
  sourceLinks: HabitSourceLink[];
  calendarEvents: CalendarEvent[];
  routines: Routine[];
  goals: Goal[];
  tasks: Task[];
}) {
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
      <HabitsExperience
        initialHabits={initialHabits}
        initialLogs={initialLogs}
        profiles={profiles}
        details={details}
        timingStats={timingStats}
        triggers={triggers}
        stacks={stacks}
        experiments={experiments}
        sourceLinks={sourceLinks}
        calendarEvents={calendarEvents}
        routines={routines}
        goals={goals}
      />
      <div className="mx-auto mt-6 max-w-[1380px] pb-20">
        <HabitConnectionsPanel habits={initialHabits} tasks={tasks} goals={goals} routines={routines} initialLinks={sourceLinks} />
      </div>
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
