'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  ArrowRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Circle,
  Clock3,
  Droplets,
  Flame,
  MoonStar,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { updateTaskAction } from '@/app/actions/tasks';
import { saveEveningReflectionAction, closeEveningAction } from '@/app/actions/evening-debrief';
import type { CalendarEvent, Habit, HabitLog, Note, Routine, Task, WellnessEntry, FinanceEntry } from '@/lib/types';

type MedicationLite = { id: string; name: string; active: boolean };
type BriefingLite = { id: string; kind: string; periodKey: string; generatedAt: Date; content: unknown };
type FocusSessionLite = { id: string; title: string; startedAt: Date; actualMinutes: number | null; completed: boolean };

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString();
}
function isTomorrow(date: Date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}
function money(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function EveningDebriefExperience({
  tasks,
  events,
  habits,
  habitLogs,
  routines,
  wellnessEntries,
  financeEntries,
  medications,
  supplements,
  notes,
  briefings,
  focusSessions,
}: {
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  wellnessEntries: WellnessEntry[];
  financeEntries: FinanceEntry[];
  medications: MedicationLite[];
  supplements: MedicationLite[];
  notes: Note[];
  briefings: BriefingLite[];
  focusSessions: FocusSessionLite[];
}) {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [isPending, startTransition] = useTransition();
  const alreadyClosedToday = briefings.some((briefing) => briefing.kind === 'evening' && briefing.periodKey === new Date().toISOString().slice(0, 10));
  const [closed, setClosed] = useState(alreadyClosedToday);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const todayName = WEEKDAYS[today.getDay()];
  const tomorrowName = WEEKDAYS[(today.getDay() + 1) % 7];

  const completedToday = localTasks.filter((task) => task.status === 'done' && task.completedAt && isToday(task.completedAt));
  const dueToday = localTasks.filter((task) => task.dueDate && isToday(task.dueDate));
  const openTasks = localTasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const overdueTasks = openTasks.filter((task) => task.dueDate && task.dueDate < today && !isToday(task.dueDate));
  const noDateUrgent = openTasks.filter((task) => !task.dueDate && (task.priority === 'urgent' || task.priority === 'high'));
  const needsAttention = [...overdueTasks, ...noDateUrgent].slice(0, 5);

  const eventsToday = events.filter((event) => isToday(event.startAt));
  const attendedToday = eventsToday.filter((event) => event.startAt <= today);

  const routinesToday = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(todayName));

  const loggedTodaySet = new Set(habitLogs.filter((log) => log.loggedDate === todayKey && log.count > 0).map((log) => log.habitId));
  const habitsCompleted = habits.filter((habit) => loggedTodaySet.has(habit.id)).length;

  const focusMinutesToday = focusSessions.filter((session) => isToday(session.startedAt)).reduce((sum, session) => sum + (session.actualMinutes ?? 0), 0);

  const latestWellness = wellnessEntries[0] ?? null;
  const wellnessIsToday = latestWellness ? isToday(new Date(latestWellness.entryDate)) : false;

  const spentToday = financeEntries.filter((entry) => entry.type === 'expense' && new Date(entry.entryDate).toDateString() === today.toDateString());
  const totalSpentToday = spentToday.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const spendByCategory = new Map<string, number>();
  for (const entry of spentToday) spendByCategory.set(entry.category || 'Other', (spendByCategory.get(entry.category || 'Other') ?? 0) + Number(entry.amount));

  const tomorrowEvents = events.filter((event) => isTomorrow(event.startAt)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const tomorrowDeadlines = localTasks.filter((task) => task.dueDate && isTomorrow(task.dueDate) && task.status !== 'done');
  const tomorrowRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(tomorrowName));

  const latestReflection = notes.find((note) => note.tags?.includes('evening-reflection'));

  const activeMeds = medications.filter((m) => m.active).length + supplements.filter((s) => s.active).length;

  const glanceStats = [
    { label: 'Tasks completed', value: `${completedToday.length}/${dueToday.length || completedToday.length}`, icon: CheckCircle2 },
    { label: 'Events attended', value: String(attendedToday.length), icon: CalendarIcon },
    { label: 'Routines today', value: String(routinesToday.length), icon: Sparkles },
    { label: 'Habits completed', value: `${habitsCompleted}/${habits.length}`, icon: Flame },
    { label: 'Focus time', value: focusMinutesToday ? `${Math.floor(focusMinutesToday / 60)}h ${focusMinutesToday % 60}m` : '—', icon: Clock3 },
    { label: 'Hydration', value: wellnessIsToday && latestWellness?.waterGlasses != null ? `${latestWellness.waterGlasses} glasses` : '—', icon: Droplets },
    { label: 'Spent today', value: money(totalSpentToday), icon: Wallet },
    { label: 'Mood', value: wellnessIsToday && latestWellness?.mood ? latestWellness.mood : '—', icon: MoonStar },
  ];

  function moveToTomorrow(task: Task) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    startTransition(async () => {
      await updateTaskAction(task.id, { dueDate: tomorrow });
      setLocalTasks((current) => current.map((item) => (item.id === task.id ? { ...item, dueDate: tomorrow } : item)));
    });
  }

  function carryForward(task: Task) {
    moveToTomorrow(task);
  }

  const reflectionText = latestReflection?.content && isToday(latestReflection.createdAt) ? latestReflection.content : null;

  const glowReflection = completedToday.length > 0
    ? `You completed ${completedToday.length} task${completedToday.length === 1 ? '' : 's'} and logged ${habitsCompleted} habit${habitsCompleted === 1 ? '' : 's'} today. Rest well — tomorrow is a new opportunity to build on this.`
    : 'Today was quieter than most. Rest is part of the process, too.';

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-[12px] font-medium text-[#8A8078]">← Back to Today</Link>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">{today.toLocaleDateString('en-US', { weekday: 'long' })} · {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          <h1 className="glow-display mt-1 text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Evening Debrief</h1>
          <p className="mt-2 text-[13px] text-[#8A8078]">Close the day with clarity. Carry forward only what matters.</p>
        </div>
        <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3]">
          <EditableRoomImage slot="evening:hero" label="Evening debrief hero" className="min-h-[120px] sm:min-h-[150px]" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-[#F1E7E3] bg-white">
        <div className="flex min-w-max divide-x divide-[#F4ECE8]">
          {glanceStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-w-[130px] flex-1 flex-col gap-1 px-4 py-4">
              <Icon size={14} className="text-[#C9727E]" />
              <p className="glow-display text-[18px] capitalize text-[#2B2420]">{value}</p>
              <p className="text-[10px] text-[#9A9088]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">What you completed</p>
          <div className="mt-3 space-y-2">
            {completedToday.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Nothing marked complete yet today.</p> : completedToday.slice(0, 5).map((task) => (
              <p key={task.id} className="flex items-center gap-2 text-[12px] text-[#3A332E]"><CheckCircle2 size={13} className="shrink-0 text-[#5A6E52]" />{task.title}</p>
            ))}
          </div>
          <Link href="/tasks?view=done" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">See all completed <ArrowRight size={10} /></Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">What needs attention</p>
          <div className="mt-3 space-y-2.5">
            {needsAttention.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Nothing overdue. Well paced today.</p> : needsAttention.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="truncate text-[12px] text-[#3A332E]">{task.title}</p><p className="text-[10px] text-[#9A9088]">{task.dueDate ? `Due ${task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No due date'}</p></div>
                <button type="button" disabled={isPending} onClick={() => moveToTomorrow(task)} className="shrink-0 text-[10.5px] font-medium text-[#C9727E]">Move to Tomorrow</button>
              </div>
            ))}
          </div>
          <Link href="/tasks?view=all" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">See all open items <ArrowRight size={10} /></Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">Carry forward to tomorrow</p>
          <div className="mt-3 space-y-2">
            {openTasks.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Your list is clear.</p> : openTasks.slice(0, 5).map((task) => (
              <button key={task.id} type="button" disabled={isPending} onClick={() => carryForward(task)} className="flex w-full items-center gap-2 text-left">
                <Circle size={12} className="shrink-0 text-[#D8CDC8]" />
                <span className="min-w-0 flex-1 truncate text-[12px] text-[#3A332E]">{task.title}</span>
              </button>
            ))}
          </div>
          <Link href="/tomorrow" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Edit carry forward <ArrowRight size={10} /></Link>
        </div>

        <ReflectionCard existingText={reflectionText} />
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">Mood + Energy</p>
          {wellnessIsToday && latestWellness ? (
            <div className="mt-3 flex items-center justify-around text-center">
              <div><p className="text-[20px] capitalize">{latestWellness.mood ?? '—'}</p><p className="text-[10px] text-[#9A9088]">mood</p></div>
              <ArrowRight size={13} className="text-[#D8CDC8]" />
              <div><p className="text-[20px] capitalize">{latestWellness.energy ?? '—'}</p><p className="text-[10px] text-[#9A9088]">energy</p></div>
            </div>
          ) : <p className="mt-3 text-[11.5px] text-[#9A9088]">No check-in logged today.</p>}
          <Link href="/wellness" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Log check-in →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">Wellness closeout</p>
          <div className="mt-3 space-y-2 text-[12px] text-[#3A332E]">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><Droplets size={11} className="text-[#C9727E]" />Water</span><span>{wellnessIsToday ? `${latestWellness?.waterGlasses ?? 0} glasses` : 'Not logged'}</span></div>
            <div className="flex items-center justify-between"><span>Active medications</span><span>{activeMeds}</span></div>
            <div className="flex items-center justify-between"><span>Focus sessions</span><span>{focusSessions.filter((s) => isToday(s.startedAt)).length}</span></div>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]"><Wallet size={12} className="text-[#C9727E]" />Spending today</div>
          <p className="glow-display mt-2 text-[20px] text-[#2B2420]">{money(totalSpentToday)}</p>
          <div className="mt-2 space-y-1">
            {[...spendByCategory.entries()].slice(0, 3).map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between text-[11px] text-[#8A8078]"><span className="capitalize">{category}</span><span>{money(amount)}</span></div>
            ))}
          </div>
          <Link href="/finance" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">View spending summary →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">Tomorrow preview</p>
          <div className="mt-3 space-y-2 text-[12px] text-[#3A332E]">
            <div><p className="text-[10px] text-[#9A9088]">First appointment</p><p>{tomorrowEvents[0]?.title ?? 'Nothing scheduled'}</p></div>
            <div><p className="text-[10px] text-[#9A9088]">Top deadlines</p><p>{tomorrowDeadlines.length ? tomorrowDeadlines.map((t) => t.title).join(', ') : 'None'}</p></div>
            <div><p className="text-[10px] text-[#9A9088]">Routines</p><p>{tomorrowRoutines.length ? tomorrowRoutines.map((r) => r.name).join(', ') : 'None scheduled'}</p></div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[18px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
          <div className="flex items-center gap-1.5 text-[#B15A68]"><Sparkles size={13} /><p className="text-[11px] font-medium">Glow Reflection</p></div>
          <p className="glow-display mt-2 text-[16px] italic leading-6 text-[#4A3238]">{glowReflection}</p>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex flex-wrap gap-2">
            <Link href="/planning?view=tomorrow" className="rounded-full border border-[#F1E7E3] px-4 py-2 text-[12px] font-medium text-[#4A4440]">Plan Tomorrow</Link>
            <Link href="/planning" className="rounded-full border border-[#F1E7E3] px-4 py-2 text-[12px] font-medium text-[#4A4440]">Set Top Three</Link>
            <form action={closeEveningAction}>
              <button type="submit" onClick={() => setClosed(true)} className="rounded-full bg-[#4A4440] px-5 py-2 text-[12px] font-medium text-white">
                <span className="flex items-center gap-1.5"><MoonStar size={13} />Close Today</span>
              </button>
            </form>
          </div>
          <p className="text-[10.5px] text-[#9A9088]">{closed ? 'Today is closed. Saved to your briefing archive.' : 'Finish your day and mark it complete.'}</p>
        </div>
      </div>
    </div>
  );
}

function ReflectionCard({ existingText }: { existingText: string | null }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[.08em] text-[#9A9088]">Day reflection</p>
      {!open ? (
        <>
          <div className="mt-3 max-h-[110px] overflow-hidden text-[11.5px] leading-5 text-[#4A4440]">
            {existingText ? <p className="whitespace-pre-line italic">{existingText.slice(0, 220)}</p> : <p className="text-[#9A9088]">No reflection saved today.</p>}
          </div>
          <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Edit reflection <ArrowRight size={10} /></button>
        </>
      ) : (
        <form
          action={async (formData) => {
            await saveEveningReflectionAction(formData);
            setSaved(true);
            setOpen(false);
          }}
          className="mt-3 space-y-2"
        >
          <textarea name="wentWell" rows={2} placeholder="What went well?" className="w-full rounded-lg border border-[#F1E7E3] px-2.5 py-2 text-[11px]" />
          <textarea name="feltDifficult" rows={2} placeholder="What felt difficult?" className="w-full rounded-lg border border-[#F1E7E3] px-2.5 py-2 text-[11px]" />
          <textarea name="proudOf" rows={2} placeholder="What are you proud of?" className="w-full rounded-lg border border-[#F1E7E3] px-2.5 py-2 text-[11px]" />
          <textarea name="doDifferently" rows={2} placeholder="What do you want to do differently tomorrow?" className="w-full rounded-lg border border-[#F1E7E3] px-2.5 py-2 text-[11px]" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-[#4A4440] px-3 py-1.5 text-[10.5px] font-medium text-white">Save</button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-[#F1E7E3] px-3 py-1.5 text-[10.5px] font-medium text-[#8A8078]">Cancel</button>
          </div>
        </form>
      )}
      {saved ? <p className="mt-2 text-[10px] text-[#5A6E52]">Saved to Notes.</p> : null}
    </div>
  );
}
