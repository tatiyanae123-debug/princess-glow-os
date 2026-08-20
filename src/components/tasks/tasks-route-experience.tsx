'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { TasksExecutionStudioV2 } from '@/components/tasks/tasks-execution-studio-v2';
import type { CalendarEvent, Task } from '@/lib/types';

function stripRecordParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('taskId');
  next.delete('selected');
  return next;
}

export function TasksRouteExperience({ initialTasks, blockedTaskIds, calendarEvents, modeName }: { initialTasks: Task[]; blockedTaskIds: Record<string, string[]>; calendarEvents: CalendarEvent[]; modeName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('taskId') ?? searchParams.get('selected');
  const selectedTask = useMemo(() => requestedId ? initialTasks.find(task => task.id === requestedId) ?? null : null, [initialTasks, requestedId]);
  function closeRecord() {
    const next = stripRecordParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/tasks?${next.toString()}` : '/tasks', { scroll: false });
  }
  return <>
    <TasksExecutionStudioV2 initialTasks={initialTasks} blockedTaskIds={blockedTaskIds} calendarEvents={calendarEvents} modeName={modeName} />
    <Dialog open={Boolean(requestedId && selectedTask)} onClose={closeRecord} title={selectedTask ? `Task · ${selectedTask.title}` : 'Task'}>
      {selectedTask ? <TaskForm task={selectedTask} onSaved={() => { closeRecord(); router.refresh(); }} onCancel={closeRecord} /> : null}
    </Dialog>
    {requestedId && !selectedTask ? <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">That task is no longer available.</div> : null}
  </>;
}
