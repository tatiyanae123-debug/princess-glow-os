'use client';

import { useState, useTransition } from 'react';
import { Link2, Sparkles, X } from 'lucide-react';
import { createHabitSourceLinkAction, deleteHabitSourceLinkAction } from '@/app/actions/advanced-habits';
import type { Goal, Habit, HabitSourceLink, Routine, Task } from '@/lib/types';

type LinkType = 'task' | 'fitness' | 'goal' | 'routine';

export function HabitConnectionsPanel({ habits, tasks, goals, routines, initialLinks }: {
  habits: Habit[];
  tasks: Task[];
  goals: Goal[];
  routines: Routine[];
  initialLinks: HabitSourceLink[];
}) {
  const [links, setLinks] = useState(initialLinks);
  const [habitId, setHabitId] = useState(habits[0]?.id ?? '');
  const [linkType, setLinkType] = useState<LinkType>('task');
  const [targetId, setTargetId] = useState('');
  const [fitnessKeyword, setFitnessKeyword] = useState('Workout');
  const [notice, setNotice] = useState('');
  const [pending, startTransition] = useTransition();

  const chosenTarget = linkType === 'fitness' ? fitnessKeyword.trim() : targetId;

  function saveLink() {
    if (!habitId || !chosenTarget) {
      setNotice('Choose a habit and a real source first.');
      return;
    }
    startTransition(async () => {
      const result = await createHabitSourceLinkAction({ habitId, sourceType: linkType, sourceId: chosenTarget });
      if (!result.data) {
        setNotice(result.error ?? 'Glow could not save that connection.');
        return;
      }
      setLinks((current) => current.some((link) => link.id === result.data?.id) ? current : [...current, result.data!]);
      setNotice(linkType === 'task' || linkType === 'fitness' ? 'Connected. Completion now syncs in both directions.' : 'Relationship saved. This connection adds context without falsely auto-completing the related record.');
    });
  }

  function removeLink(id: string) {
    startTransition(async () => {
      const result = await deleteHabitSourceLinkAction(id);
      if (!result.data) {
        setNotice(result.error ?? 'Glow could not remove that connection.');
        return;
      }
      setLinks((current) => current.filter((link) => link.id !== id));
      setNotice('Connection removed. Future completions will no longer sync through it.');
    });
  }

  const selectedHabit = habits.find((habit) => habit.id === habitId);
  const habitLinks = links.filter((link) => link.habitId === habitId && link.enabled);

  return (
    <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Connections</p>
          <h2 className="glow-display mt-1 text-[26px] text-[#2B2420]">One behavior, one source of truth</h2>
          <p className="mt-2 max-w-2xl text-[10.5px] leading-5 text-[#81756e]">Task and Fitness links are bidirectional. Goal and Routine links add real relationship context; Routine step completion should be linked from the Routines Studio so Glow never pretends a whole routine was completed by one habit.</p>
        </div>
        <Link2 size={18} className="text-[#8a7a96]" />
      </div>

      {habits.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_.8fr_1.2fr_auto] lg:items-end">
          <label className="text-[9px] text-[#786d67]">Habit
            <select value={habitId} onChange={(event) => setHabitId(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e5dcd6] bg-[#fffdfc] px-3 py-2.5 text-[10.5px]">
              {habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}
            </select>
          </label>
          <label className="text-[9px] text-[#786d67]">Connect to
            <select value={linkType} onChange={(event) => { setLinkType(event.target.value as LinkType); setTargetId(''); }} className="mt-1 w-full rounded-xl border border-[#e5dcd6] bg-[#fffdfc] px-3 py-2.5 text-[10.5px]">
              <option value="task">Task</option>
              <option value="fitness">Fitness workout</option>
              <option value="goal">Goal</option>
              <option value="routine">Routine relationship</option>
            </select>
          </label>
          {linkType === 'fitness' ? (
            <label className="text-[9px] text-[#786d67]">Workout keyword
              <input value={fitnessKeyword} onChange={(event) => setFitnessKeyword(event.target.value)} placeholder="Workout, Pilates, Walk…" className="mt-1 w-full rounded-xl border border-[#e5dcd6] bg-[#fffdfc] px-3 py-2.5 text-[10.5px]" />
            </label>
          ) : (
            <label className="text-[9px] text-[#786d67]">Real source
              <select value={targetId} onChange={(event) => setTargetId(event.target.value)} className="mt-1 w-full rounded-xl border border-[#e5dcd6] bg-[#fffdfc] px-3 py-2.5 text-[10.5px]">
                <option value="">Choose…</option>
                {linkType === 'task' ? tasks.filter((task) => !task.archived).map((task) => <option key={task.id} value={task.id}>{task.title}{task.status === 'done' ? ' · done' : ''}</option>) : null}
                {linkType === 'goal' ? goals.filter((goal) => goal.status !== 'abandoned').map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>) : null}
                {linkType === 'routine' ? routines.filter((routine) => !routine.archived).map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>) : null}
              </select>
            </label>
          )}
          <button type="button" disabled={pending || !habitId || !chosenTarget} onClick={saveLink} className="rounded-xl bg-[#2B2420] px-4 py-2.5 text-[10.5px] font-semibold text-white disabled:opacity-40">{pending ? 'Saving…' : 'Connect'}</button>
        </div>
      ) : <p className="mt-4 text-[11px] text-[#8a7e77]">Create a habit first.</p>}

      {selectedHabit ? (
        <div className="mt-4 rounded-[16px] bg-[#f8f4f1] p-4">
          <div className="flex items-center gap-2"><Sparkles size={12} className="text-[#ae7079]"/><p className="text-[10px] font-medium text-[#4e433e]">{selectedHabit.name} connections</p></div>
          {habitLinks.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {habitLinks.map((link) => (
                <span key={link.id} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[9px] text-[#756a64]">
                  <span>{link.sourceType} · {link.sourceType === 'task' ? tasks.find((task) => task.id === link.sourceId)?.title ?? 'Task' : link.sourceType === 'goal' ? goals.find((goal) => goal.id === link.sourceId)?.title ?? 'Goal' : link.sourceType === 'routine' ? routines.find((routine) => routine.id === link.sourceId)?.name ?? 'Routine' : link.sourceId}</span>
                  <button type="button" disabled={pending} onClick={() => removeLink(link.id)} aria-label={`Remove ${link.sourceType} connection`} className="rounded-full p-0.5 text-[#a08f87] hover:bg-[#f3ece8] disabled:opacity-40"><X size={10} /></button>
                </span>
              ))}
            </div>
          ) : <p className="mt-2 text-[9.5px] text-[#8d817a]">No explicit connections yet.</p>}
        </div>
      ) : null}
      {notice ? <p aria-live="polite" className="mt-3 text-[10px] text-[#8a6068]">{notice}</p> : null}
    </section>
  );
}
