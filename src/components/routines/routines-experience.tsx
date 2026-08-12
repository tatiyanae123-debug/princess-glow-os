'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, MoonStar, Pencil, Play, Plus, RefreshCw, Sparkles, SunMedium, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoutineForm } from '@/components/routines/routine-form';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteRoutineAction, createRoutineStepAction, deleteRoutineStepAction } from '@/app/actions/routines';
import type { Routine, RoutineStep } from '@/lib/types';

const TIME_ICON: Record<string, typeof SunMedium> = { morning: SunMedium, afternoon: SunMedium, evening: MoonStar, night: MoonStar, anytime: RefreshCw };
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function RoutinesExperience({ initialRoutines, initialSteps }: { initialRoutines: Routine[]; initialSteps: RoutineStep[] }) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [steps, setSteps] = useState<RoutineStep[]>(initialSteps);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');
  const del = useServerAction((id: string) => deleteRoutineAction(id));
  const addStep = useServerAction(createRoutineStepAction);
  const removeStep = useServerAction((id: string) => deleteRoutineStepAction(id));

  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of steps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [steps]);

  function durationFor(routine: Routine) {
    const routineSteps = stepsByRoutine.get(routine.id) ?? [];
    const total = routineSteps.reduce((sum, step) => sum + (step.durationMinutes ?? 5), 0);
    return total || routineSteps.length * 5;
  }

  const todayName = WEEKDAYS[new Date().getDay()];
  const todaysRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(todayName));
  const featured = routines.slice(0, 3);
  const more = routines.slice(3);

  function handleSaved(routine: Routine) {
    setRoutines((current) => {
      const exists = current.some((r) => r.id === routine.id);
      return exists ? current.map((r) => (r.id === routine.id ? routine : r)) : [routine, ...current];
    });
    setDialogRoutine(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setRoutines((current) => current.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  function handleAddStep(routine: Routine) {
    if (!newStepTitle.trim()) return;
    const order = stepsByRoutine.get(routine.id)?.length ?? 0;
    addStep.run({ routineId: routine.id, title: newStepTitle.trim(), order }, (saved) => {
      setSteps((current) => [...current, saved]);
      setNewStepTitle('');
    });
  }

  function handleRemoveStep(step: RoutineStep) {
    removeStep.run(step.id, () => setSteps((current) => current.filter((item) => item.id !== step.id)));
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[22px] border border-[#F1E7E3]">
        <EditableRoomImage slot="routines:hero" label="Routines hero" className="min-h-[220px] sm:min-h-[260px]">
          <div className="relative z-10 flex h-full items-end bg-[linear-gradient(0deg,rgba(24,18,17,.6),rgba(24,18,17,.05)_65%)] p-6 sm:p-8">
            <div className="max-w-xl">
              <h1 className="glow-display text-[34px] leading-none text-white sm:text-[42px]">Routines</h1>
              <p className="mt-2 text-[13px] text-white/85">Daily rhythms. Meaningful progress.</p>
              <p className="mt-2 max-w-md text-[12px] leading-5 text-white/75">Build routines that support your energy, focus, and well-being — one intentional step at a time.</p>
              <button type="button" onClick={() => setDialogRoutine('new')} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#C9727E] px-4 py-2.5 text-[12.5px] font-medium text-white">
                <Plus size={14} />Create Routine
              </button>
            </div>
          </div>
        </EditableRoomImage>
      </div>

      <div className="flex flex-col gap-5 xl:flex-row">
        <div className="min-w-0 flex-1 space-y-4">
          <p className="text-[13px] font-semibold text-[#2B2420]">Your Routines</p>
          {featured.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-8 text-center">
              <p className="text-[13px] text-[#4A4440]">No routines yet. Create your first ritual to get started.</p>
              <button type="button" onClick={() => setDialogRoutine('new')} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#C9727E] px-4 py-2 text-[12px] font-medium text-white"><Plus size={13} />Create Routine</button>
            </div>
          ) : featured.map((routine) => {
            const routineSteps = stepsByRoutine.get(routine.id) ?? [];
            const isOpen = expanded === routine.id;
            const Icon = TIME_ICON[routine.timeOfDay] ?? RefreshCw;
            return (
              <div key={routine.id} className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
                <div className="flex flex-wrap items-center gap-4 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Icon size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#2B2420]">{routine.name}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-[#8A8078]">{routine.description || `${routineSteps.length} step${routineSteps.length === 1 ? '' : 's'} · ${routine.timeOfDay}`}</p>
                    <p className="mt-1 flex items-center gap-1 text-[10.5px] text-[#9A9088]"><Clock3 size={10} />{durationFor(routine)} min</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button type="button" onClick={() => setPlaying(routine)} className="flex items-center gap-1.5 rounded-full bg-[#4A4440] px-3.5 py-2 text-[11.5px] font-medium text-white"><Play size={12} />Start</button>
                    <button type="button" onClick={() => setExpanded(isOpen ? null : routine.id)} className="rounded-full border border-[#F1E7E3] px-3 py-2 text-[11px] font-medium text-[#8A8078]">{routineSteps.length} steps</button>
                    <button type="button" onClick={() => setDialogRoutine(routine)} aria-label="Edit routine" className="rounded-full p-2 text-[#8A8078] hover:bg-[#FDFAF8]"><Pencil size={13} /></button>
                    <button type="button" onClick={() => setDeleteTarget(routine)} aria-label="Delete routine" className="rounded-full p-2 text-[#8A8078] hover:bg-[#FDFAF8]"><Trash2 size={13} /></button>
                  </div>
                </div>
                {isOpen ? (
                  <div className="border-t border-[#F1E7E3] bg-[#FDFAF8] p-4">
                    {routineSteps.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No steps yet. Add the first one below.</p> : (
                      <ol className="space-y-1.5">
                        {routineSteps.map((step, index) => (
                          <li key={step.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                            <span className="text-[10px] font-semibold text-[#C9727E]">{index + 1}</span>
                            <span className="min-w-0 flex-1 truncate text-[12px] text-[#3A332E]">{step.title}</span>
                            {step.durationMinutes ? <span className="text-[10px] text-[#9A9088]">{step.durationMinutes}m</span> : null}
                            <button type="button" onClick={() => handleRemoveStep(step)} aria-label="Remove step" className="rounded-full p-1 text-[#B5ACA5] hover:bg-[#F4ECE8]"><Trash2 size={11} /></button>
                          </li>
                        ))}
                      </ol>
                    )}
                    <form onSubmit={(event) => { event.preventDefault(); handleAddStep(routine); }} className="mt-3 flex gap-2">
                      <input value={newStepTitle} onChange={(event) => setNewStepTitle(event.target.value)} placeholder="Add a step" className="min-w-0 flex-1 rounded-lg border border-[#F1E7E3] px-3 py-2 text-[11.5px]" />
                      <button type="submit" disabled={addStep.isPending} className="rounded-lg bg-[#4A4440] px-3 py-2 text-[11px] font-medium text-white disabled:opacity-50">Add</button>
                    </form>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="w-full space-y-4 xl:w-[300px] xl:shrink-0">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <p className="text-[13px] font-medium text-[#2B2420]">Routine Timeline</p>
            <div className="mt-4 flex items-start justify-between">
              {featured.map((routine, index) => {
                const Icon = TIME_ICON[routine.timeOfDay] ?? RefreshCw;
                return (
                  <div key={routine.id} className="flex flex-1 flex-col items-center text-center">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Icon size={14} /></span>
                    {index < featured.length - 1 ? <span className="mt-[-18px] h-px w-full bg-[#F1E7E3]" /> : null}
                    <p className="mt-2 line-clamp-1 text-[10px] font-medium text-[#2B2420]">{routine.name}</p>
                    <p className="text-[9px] text-[#9A9088]">{durationFor(routine)} min</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-2"><CalendarDays size={13} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Today&apos;s Rhythm</p></div>
            <div className="mt-3 space-y-2">
              {todaysRoutines.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No routines scheduled for today.</p> : todaysRoutines.map((routine) => (
                <p key={routine.id} className="flex items-center justify-between text-[12px] text-[#3A332E]"><span className="truncate">{routine.name}</span><span className="text-[10px] capitalize text-[#9A9088]">{routine.timeOfDay}</span></p>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-4">
            <Sparkles size={14} className="text-[#C9727E]" />
            <p className="mt-2 text-[11px] font-medium text-[#2B2420]">Focus Today</p>
            <p className="mt-1.5 text-[12px] italic leading-5 text-[#6B6560]">&ldquo;Small routines, repeated daily, create a life you love.&rdquo;</p>
          </div>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-[#2B2420]">More Routines</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {more.map((routine) => {
            const Icon = TIME_ICON[routine.timeOfDay] ?? RefreshCw;
            return (
              <button key={routine.id} type="button" onClick={() => setExpanded(routine.id)} className="rounded-[16px] border border-[#F1E7E3] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Icon size={15} /></span>
                <p className="mt-3 truncate text-[12.5px] font-medium text-[#2B2420]">{routine.name}</p>
                <p className="mt-1 text-[10.5px] text-[#9A9088]">{durationFor(routine)} min</p>
              </button>
            );
          })}
          <button type="button" onClick={() => setDialogRoutine('new')} className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#F1E7E3] bg-white p-4 text-[#C9727E]">
            <Plus size={16} />
            <p className="mt-2 text-[12px] font-medium">New Routine</p>
          </button>
        </div>
      </div>

      <Dialog open={dialogRoutine !== null} onClose={() => setDialogRoutine(null)} title={dialogRoutine === 'new' ? 'Add routine' : 'Edit routine'}>
        <RoutineForm routine={dialogRoutine === 'new' ? null : dialogRoutine} onSaved={handleSaved} onCancel={() => setDialogRoutine(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this routine?" description={deleteTarget ? `"${deleteTarget.name}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      {playing ? <RoutineStepPlayer routine={playing} steps={stepsByRoutine.get(playing.id) ?? []} onClose={() => setPlaying(null)} /> : null}
    </div>
  );
}
