'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ListChecks,
  Repeat,
  Sparkles,
  Target,
  CalendarPlus,
  NotebookPen,
  Wand2,
  HeartPulse,
  Wallet,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { HabitForm } from '@/components/habits/habit-form';
import { RoutineForm } from '@/components/routines/routine-form';
import { GoalForm } from '@/components/goals/goal-form';
import { EventForm } from '@/components/calendar/event-form';
import { NoteForm } from '@/components/notes/note-form';
import { BeautyRoutineForm } from '@/components/beauty/beauty-routine-form';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';

type QuickAddModule =
  | 'task'
  | 'habit'
  | 'routine'
  | 'goal'
  | 'event'
  | 'note'
  | 'beauty'
  | 'wellness'
  | 'finance';

const MODULES: { id: QuickAddModule; label: string; icon: typeof Plus }[] = [
  { id: 'task', label: 'New task', icon: ListChecks },
  { id: 'event', label: 'New event', icon: CalendarPlus },
  { id: 'habit', label: 'New habit', icon: Repeat },
  { id: 'routine', label: 'New routine', icon: Sparkles },
  { id: 'goal', label: 'New goal', icon: Target },
  { id: 'note', label: 'New note', icon: NotebookPen },
  { id: 'beauty', label: 'Beauty step', icon: Wand2 },
  { id: 'wellness', label: 'Wellness check-in', icon: HeartPulse },
  { id: 'finance', label: 'Finance entry', icon: Wallet },
];

const MODULE_LABEL: Record<QuickAddModule, string> = {
  task: 'Add task',
  habit: 'Add habit',
  routine: 'Add routine',
  goal: 'Add goal',
  event: 'Add event',
  note: 'Add note',
  beauty: 'Add beauty step',
  wellness: 'Log check-in',
  finance: 'Add finance entry',
};

export function QuickAdd() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<QuickAddModule | null>(null);

  function close() {
    setOpen(false);
    setActiveModule(null);
  }

  function handleSaved() {
    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Quick add"
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105"
        style={{ background: 'var(--glow-accent)', color: '#fff' }}
      >
        <Plus size={22} />
      </button>

      <Dialog
        open={open && activeModule === null}
        onClose={close}
        title="Quick add"
        description="Add something new without leaving where you are."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveModule(id)}
              className="flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium transition hover:opacity-80"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text)' }}
            >
              <Icon size={18} style={{ color: 'var(--glow-accent)' }} />
              {label}
            </button>
          ))}
        </div>
      </Dialog>

      <Dialog
        open={activeModule !== null}
        onClose={close}
        title={activeModule ? MODULE_LABEL[activeModule] : ''}
      >
        {activeModule === 'task' && <TaskForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'habit' && <HabitForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'routine' && <RoutineForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'goal' && <GoalForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'event' && <EventForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'note' && <NoteForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'beauty' && <BeautyRoutineForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'wellness' && <WellnessEntryForm onSaved={handleSaved} onCancel={close} />}
        {activeModule === 'finance' && <FinanceEntryForm onSaved={handleSaved} onCancel={close} />}
      </Dialog>
    </>
  );
}
