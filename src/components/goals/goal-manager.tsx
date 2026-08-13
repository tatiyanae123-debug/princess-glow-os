'use client';

import { useState } from 'react';
import { ArrowUpRight, CalendarDays, Flag, Pencil, Plus, Sparkles, Star, Target, Trash2, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { GoalForm } from '@/components/goals/goal-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteGoalAction } from '@/app/actions/goals';
import type { Goal } from '@/lib/types';

type GoalView = 'overview' | 'journeys' | 'milestones' | 'next';

const milestoneStops = [25, 50, 75, 100];

function targetDate(goal: Goal) {
  if (!goal.targetDate) return null;
  const date = goal.targetDate instanceof Date ? goal.targetDate : new Date(goal.targetDate);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(goal: Goal) {
  const date = targetDate(goal);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function deadlineLabel(goal: Goal) {
  const days = daysUntil(goal);
  if (days === null) return 'No target date';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d remaining`;
}

function nextMove(goal: Goal) {
  if (goal.status === 'achieved' || goal.progress >= 100) return 'Celebrate the win, capture what worked, then choose what this unlocks next.';
  if (goal.status === 'paused') return 'Decide whether to restart this goal, move its target date, or keep it intentionally paused.';
  if (goal.status === 'abandoned') return 'Archive the lesson from this goal so it can inform a better future direction.';
  const days = daysUntil(goal);
  if (days !== null && days < 0) return 'Reset the target date and choose one concrete recovery action you can complete now.';
  if (goal.progress === 0) return 'Define the smallest visible first move and schedule it before adding more planning.';
  if (goal.progress < 25) return 'Protect momentum with one small action that gets this goal to its first 25% milestone.';
  if (goal.progress < 50) return 'Choose the action that would create the biggest jump toward the halfway milestone.';
  if (goal.progress < 75) return 'Remove the biggest friction point and advance the goal toward 75% completion.';
  return 'Finish the final high-impact step, verify the outcome, and close the loop intentionally.';
}

function nextMilestone(goal: Goal) {
  return milestoneStops.find((stop) => goal.progress < stop) ?? 100;
}

export function GoalManager({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [view, setView] = useState<GoalView>('overview');
  const [dialogGoal, setDialogGoal] = useState<Goal | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const del = useServerAction((id: string) => deleteGoalAction(id));
  const handleSaved = (goal: Goal) => {
    setGoals((current) => {
      const exists = current.some((g) => g.id === goal.id);
      return exists ? current.map((g) => (g.id === goal.id ? goal : g)) : [goal, ...current];
    });
    setDialogGoal(null);
  };
  const handleDelete = () => {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setGoals((current) => current.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  const avg = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;
  const activeGoals = goals.filter((g) => g.status !== 'achieved' && g.status !== 'abandoned');
  const achieved = goals.filter((g) => g.status === 'achieved' || g.progress >= 100).length;
  const atRisk = activeGoals.filter((goal) => {
    const days = daysUntil(goal);
    return days !== null && days <= 14 && goal.progress < 75;
  });
  const priorityGoal = [...activeGoals].sort((a, b) => {
    const aDays = daysUntil(a) ?? Number.MAX_SAFE_INTEGER;
    const bDays = daysUntil(b) ?? Number.MAX_SAFE_INTEGER;
    if (aDays !== bDays) return aDays - bDays;
    return a.progress - b.progress;
  })[0];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.25fr_.75fr]">
        <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#FBE4E8,#F1E8D9)]">
          <Star size={54} strokeWidth={0.8} className="absolute right-5 top-3 text-[#C9727E]/22" />
          <p className="glow-eyebrow">Future-self wall</p>
          <p className="glow-display mt-2 text-[25px] text-[#2B2420]">Keep the destination visible.</p>
          <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#8A8078]">Goals are not another task list. They are the direction that gives projects, milestones, and daily actions meaning.</p>
        </Card>
        <Card>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Active</p><p className="glow-display mt-1 text-[25px] text-[#2B2420]">{activeGoals.length}</p></div>
            <div><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Progress</p><p className="glow-display mt-1 text-[25px] text-[#2B2420]">{avg}%</p></div>
            <div><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">Won</p><p className="glow-display mt-1 text-[25px] text-[#2B2420]">{achieved}</p></div>
          </div>
          <Button onClick={() => setDialogGoal('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12} />Add goal</Button>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          ['overview', 'Overview'],
          ['journeys', 'Journeys'],
          ['milestones', 'Milestones'],
          ['next', 'Next moves'],
        ] as const).map(([key, label]) => (
          <button key={key} type="button" onClick={() => setView(key)} className={`rounded-full px-3.5 py-2 text-[11px] font-medium uppercase tracking-[.08em] transition ${view === key ? 'bg-[#C9727E] text-white' : 'border border-[#F1E7E3] bg-white text-[#8A8078] hover:bg-[#FDF8F6]'}`}>{label}</button>
        ))}
      </div>

      {goals.length === 0 ? (
        <Card className="p-6 text-center">
          <Target className="mx-auto text-[#C9727E]" size={22} />
          <p className="glow-display mt-3 text-[18px] text-[#2B2420]">Choose one direction worth moving toward.</p>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-4 text-[#8A8078]">Add a goal with a target date and progress. Glow will turn it into a visible journey with milestone and next-action guidance.</p>
          <Button onClick={() => setDialogGoal('new')} className="mt-4"><Plus size={12} className="mr-1" />Add your first goal</Button>
        </Card>
      ) : null}

      {goals.length > 0 && view === 'overview' ? (
        <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
          <Card>
            <div className="flex items-center justify-between gap-3"><div><p className="glow-eyebrow">Goal pulse</p><p className="glow-display mt-1 text-[20px] text-[#2B2420]">Where your ambition stands now</p></div><Sparkles size={18} className="text-[#C9727E]" /></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[16px] bg-[#FDF8F6] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[#B5ACA5]">On the board</p><p className="glow-display mt-1 text-[22px] text-[#2B2420]">{goals.length}</p></div>
              <div className="rounded-[16px] bg-[#F1E8D9] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[#9A7A3D]">Needs attention</p><p className="glow-display mt-1 text-[22px] text-[#2B2420]">{atRisk.length}</p></div>
              <div className="rounded-[16px] bg-[#E4EBDD] p-3"><p className="text-[10px] uppercase tracking-[.12em] text-[#5A6E52]">Completed</p><p className="glow-display mt-1 text-[22px] text-[#2B2420]">{achieved}</p></div>
            </div>
          </Card>
          <Card>
            <p className="glow-eyebrow">Glow next-action intelligence</p>
            {priorityGoal ? <><p className="glow-display mt-2 text-[18px] text-[#2B2420]">{priorityGoal.title}</p><p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">{nextMove(priorityGoal)}</p><div className="mt-3 flex items-center justify-between text-[10.5px] text-[#8A8078]"><span>{deadlineLabel(priorityGoal)}</span><span>Next milestone {nextMilestone(priorityGoal)}%</span></div></> : <p className="mt-3 text-[11.5px] leading-4 text-[#8A8078]">Every active journey is complete. Capture the win or define the next direction.</p>}
          </Card>
        </div>
      ) : null}

      {goals.length > 0 && view === 'journeys' ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{goals.map((goal, index) => <Card key={goal.id} className="relative overflow-hidden"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.1em] text-[#B5ACA5]">Journey {String(index + 1).padStart(2, '0')} · {goal.category}</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{goal.title}</p></div><span className="rounded-full bg-[#FBE4E8] px-2 py-1 text-[10px] text-[#B15A68]">{goal.status.replace('_', ' ')}</span></div>{goal.description ? <p className="mt-2 line-clamp-2 min-h-[32px] text-[11px] leading-4 text-[#8A8078]">{goal.description}</p> : <div className="min-h-[32px]" />}<div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-[#F4ECE8]"><div className="h-1.5 rounded-full bg-[linear-gradient(90deg,#C9727E,#D8C09F)]" style={{ width: `${goal.progress}%` }} /></div><span className="glow-display text-[12px] text-[#B15A68]">{goal.progress}%</span></div><div className="mt-3 flex items-center justify-between text-[10.5px] text-[#8A8078]"><span className="inline-flex items-center gap-1"><CalendarDays size={9} />{deadlineLabel(goal)}</span><span className="inline-flex items-center gap-1"><Flag size={9} />{nextMilestone(goal)}%</span></div><p className="mt-3 rounded-[12px] bg-[#FDF8F6] p-3 text-[10.5px] leading-4 text-[#4A4440]">{nextMove(goal)}</p><div className="mt-4 flex items-center justify-between"><span className="inline-flex items-center gap-1 text-[10px] text-[#B5ACA5]">next chapter <ArrowUpRight size={8} /></span><div className="flex gap-1"><button type="button" onClick={() => setDialogGoal(goal)} aria-label="Edit goal" className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><Pencil size={11} /></button><button type="button" onClick={() => setDeleteTarget(goal)} aria-label="Delete goal" className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><Trash2 size={11} /></button></div></div></Card>)}</div>
      ) : null}

      {goals.length > 0 && view === 'milestones' ? (
        <div className="space-y-3">{goals.map((goal) => <Card key={goal.id}><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="glow-display text-[16px] text-[#2B2420]">{goal.title}</p><p className="mt-1 text-[11px] text-[#8A8078]">{goal.progress}% complete · {deadlineLabel(goal)}</p></div><button type="button" onClick={() => setDialogGoal(goal)} className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Update progress</button></div><div className="mt-4 grid grid-cols-4 gap-2">{milestoneStops.map((stop) => { const reached = goal.progress >= stop; const current = !reached && nextMilestone(goal) === stop; return <div key={stop} className={`rounded-[16px] border p-3 ${reached ? 'border-[#F1E7E3] bg-[#FDF3F2]' : current ? 'border-[#C9727E] bg-[#FBE4E8]' : 'border-[#F1E7E3] bg-white'}`}><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.1em] text-[#8A8078]">{stop}%</span>{reached ? <Trophy size={11} className="text-[#B15A68]" /> : <Flag size={10} className="text-[#B5ACA5]" />}</div><p className="mt-2 text-[10.5px] text-[#8A8078]">{reached ? 'Reached' : current ? 'Next milestone' : 'Ahead'}</p></div>; })}</div></Card>)}</div>
      ) : null}

      {goals.length > 0 && view === 'next' ? (
        <div className="space-y-3">{activeGoals.length ? activeGoals.map((goal, index) => <Card key={goal.id}><div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FBE4E8] text-[11px] font-medium text-[#B15A68]">{index + 1}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="glow-display text-[16px] text-[#2B2420]">{goal.title}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">{goal.category} · {deadlineLabel(goal)} · {goal.progress}%</p></div><button type="button" onClick={() => setDialogGoal(goal)} className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Update goal</button></div><p className="mt-3 text-[11.5px] leading-4 text-[#4A4440]">{nextMove(goal)}</p></div></div></Card>) : <Card className="p-6 text-center"><Trophy className="mx-auto text-[#C9727E]" size={20} /><p className="glow-display mt-2 text-[18px] text-[#2B2420]">No active next moves.</p><p className="mt-2 text-[11.5px] text-[#8A8078]">Your current goals are complete or archived. Add a new direction when you are ready.</p></Card>}</div>
      ) : null}

      <Dialog open={dialogGoal !== null} onClose={() => setDialogGoal(null)} title={dialogGoal === 'new' ? 'Add goal' : 'Edit goal'}><GoalForm goal={dialogGoal === 'new' ? null : dialogGoal} onSaved={handleSaved} onCancel={() => setDialogGoal(null)} /></Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this goal?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
