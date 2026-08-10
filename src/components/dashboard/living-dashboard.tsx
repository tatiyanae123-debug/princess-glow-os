'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Crown,
  Droplets,
  Dumbbell,
  Heart,
  ListChecks,
  NotebookText,
  PiggyBank,
  Sparkles,
  Star,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

function time(value: Date | null) {
  if (!value) return 'Any time';
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function dateLabel(value: Date | null) {
  if (!value) return '';
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[22px] border border-stone-200/70 bg-white/62 shadow-[0_18px_50px_rgba(108,82,64,.07)] backdrop-blur-md ${className}`}>
      {children}
    </section>
  );
}

function CardHeading({ title, href, action = 'View all' }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200/65 px-4 py-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone-800">{title}</h2>
      {href ? <Link href={href} className="text-[10px] font-medium text-stone-500 transition hover:text-rose-700">{action}</Link> : null}
    </div>
  );
}

export function LivingDashboard({ data, error }: { data: LivingDashboardData; error?: string }) {
  const now = new Date();
  const habitPercent = data.habitSummary.totalHabits ? Math.round((data.habitSummary.completedToday / data.habitSummary.totalHabits) * 100) : 0;
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const scheduled = [
    ...data.todaySchedule.events.map((event) => ({ id: event.id, title: event.title, start: event.startAt, note: event.location ?? (event.allDay ? 'All day' : 'Calendar') })),
    ...data.todaySchedule.workSlots.map((slot) => ({ id: slot.id, title: slot.title, start: null, note: `${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}` })),
  ].slice(0, 7);
  const upcoming = [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 4);
  const water = data.wellnessToday.entry?.waterGlasses ?? 0;
  const totalTasks = Math.max(data.todayOverview.tasksDueToday, data.topPriorityTasks.length);
  const completedTasks = data.projectStatus.completedTaskCount;

  return (
    <div className="mx-auto w-full max-w-[1540px] animate-fade-in">
      {error ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">Glow OS is showing the safe dashboard while live data reconnects: {error}</div> : null}

      <header className="mb-5 flex flex-col justify-between gap-4 px-1 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl tracking-[-0.035em] text-stone-950 sm:text-4xl" style={{ fontFamily: 'var(--glow-font-display)' }}>
              Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, Tatiyana
            </h1>
            <Crown size={22} className="text-amber-700/70" />
          </div>
          <p className="mt-1 text-sm text-stone-500">{data.greeting.message || 'Welcome to your GLOW OS ✨'}</p>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-500">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            <p className="mt-1 text-3xl font-light tracking-tight text-stone-900">{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
          </div>
          <Link href="/brain" className="hidden rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rose-700">Glow Brain</p>
            <p className="mt-1 text-xs text-stone-700">Ask what matters next →</p>
          </Link>
        </div>
      </header>

      <Surface className="mb-4 overflow-hidden">
        <div className="grid divide-y divide-stone-200/65 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
          <Link href="/tasks" className="flex min-h-[108px] items-center gap-3 px-4 py-4 transition hover:bg-rose-50/50"><div className="rounded-full bg-rose-50 p-2.5 text-rose-500"><Star size={20} /></div><div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Top Priority</p><p className="mt-1 line-clamp-2 text-[15px] leading-5 text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{topTask?.title ?? 'Choose your focus'}</p><p className="mt-1 text-[10px] text-rose-500">{topTask ? 'Open focus' : 'Set today'}</p></div></Link>
          <Link href="/tasks" className="flex min-h-[108px] items-center gap-3 px-4 py-4 transition hover:bg-rose-50/50"><div className="rounded-full bg-rose-50 p-2.5 text-rose-500"><CheckCircle2 size={20} /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Tasks Today</p><p className="mt-1 text-2xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{completedTasks} / {totalTasks}</p><p className="text-[10px] text-stone-500">Your active day</p></div></Link>
          <Link href="/habits" className="flex min-h-[108px] items-center gap-3 px-4 py-4 transition hover:bg-amber-50/50"><div className="rounded-full bg-amber-50 p-2.5 text-amber-700"><Crown size={20} /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Habit Score</p><p className="mt-1 text-2xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{habitPercent}%</p><p className="text-[10px] text-stone-500">Keep going, Princess</p></div></Link>
          <Link href="/planning" className="flex min-h-[108px] items-center gap-3 px-4 py-4 transition hover:bg-amber-50/50"><div className="rounded-full bg-amber-50 p-2.5 text-amber-700"><Clock3 size={20} /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Focus Mode</p><p className="mt-1 text-2xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{data.projectStatus.averageGoalProgress}%</p><p className="text-[10px] text-stone-500">Goal progress</p></div></Link>
          <Link href="/wellness" className="flex min-h-[108px] items-center gap-3 px-4 py-4 transition hover:bg-sky-50/50 sm:col-span-2 lg:col-span-1"><div className="rounded-full bg-sky-50 p-2.5 text-sky-500"><Droplets size={20} /></div><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">Water Intake</p><p className="mt-1 text-2xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{water} / 8</p><p className="text-[10px] text-stone-500">glasses today</p></div></Link>
        </div>
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_300px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_1.15fr_1.18fr]">
            <Surface className="overflow-hidden"><CardHeading title="Today's Plan" href="/planning" action="Plan day" /><div className="p-3">{scheduled.length ? scheduled.map((item, index) => <Link href="/calendar" key={`${item.id}-${index}`} className={`grid grid-cols-[64px_1fr] gap-2 rounded-xl px-2.5 py-2.5 transition hover:bg-rose-50/60 ${index === 2 ? 'bg-rose-50/70' : ''}`}><p className="text-[10px] font-semibold text-stone-600">{item.start ? time(item.start) : item.note.split('–')[0]}</p><div><p className="text-xs font-medium text-stone-900">{item.title}</p><p className="mt-0.5 line-clamp-1 text-[9px] text-stone-500">{item.note}</p></div></Link>) : <div className="px-3 py-8 text-center"><CalendarDays className="mx-auto text-stone-300" /><p className="mt-2 text-xs text-stone-500">Your day is open. Build it around what matters.</p></div>}</div></Surface>

            <Surface className="group overflow-hidden bg-[linear-gradient(145deg,rgba(236,216,201,.8),rgba(255,252,248,.9))] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(108,82,64,.12)]"><CardHeading title="Ritual of the Day" href="/beauty" action="Enter ritual" /><div className="flex min-h-[300px] flex-col justify-between p-5"><div className="flex items-start justify-between gap-4"><div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[26px] bg-gradient-to-br from-amber-100 via-stone-100 to-rose-100 shadow-inner"><Sparkles size={34} className="text-amber-700/70" /></div><div className="min-w-0 flex-1 pt-2"><p className="text-2xl leading-7 text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{data.routinesForNow[0]?.name ?? data.beautyToday[0]?.name ?? 'Sculpt & Glow'}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-stone-500">Focused daily ritual</p><div className="mt-4 space-y-2">{(data.beautyToday.length ? data.beautyToday.slice(0, 4).map((x) => x.name) : ['Prep with intention', 'Move slowly', 'Complete the ritual', 'Notice how you feel']).map((step) => <p key={step} className="flex items-center gap-2 text-[11px] text-stone-700"><CheckCircle2 size={13} className="text-amber-700/60" /> {step}</p>)}</div></div></div><Link href="/beauty" className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-3 text-xs font-medium text-white transition group-hover:bg-rose-950">Start Ritual <ArrowRight size={14} /></Link></div></Surface>

            <Surface className="overflow-hidden"><CardHeading title="Upcoming" href="/calendar" action="View calendar" /><div className="p-3">{upcoming.length ? upcoming.map((event) => <Link key={event.id} href="/calendar" className="grid grid-cols-[66px_1fr_14px] items-center gap-2 border-b border-stone-100 px-2 py-4 last:border-0 hover:bg-stone-50/70"><p className="text-[10px] font-semibold text-stone-600">{time(event.startAt)}</p><div><p className="text-xs font-medium text-stone-900">{event.title}</p><p className="mt-0.5 text-[9px] text-stone-500">{event.location ?? dateLabel(event.startAt)}</p></div><ArrowRight size={12} className="text-stone-300" /></Link>) : <p className="px-3 py-10 text-center text-xs text-stone-500">No upcoming events yet.</p>}</div></Surface>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Surface className="overflow-hidden transition duration-300 hover:-translate-y-1"><CardHeading title="Habit Tracker" href="/habits" /><div className="space-y-2 p-4">{data.habitSummary.habits.slice(0, 5).map((habit) => <div key={habit.id} className="flex items-center justify-between gap-3"><p className="truncate text-[11px] text-stone-700">{habit.name}</p>{habit.completedToday ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Circle size={15} className="text-stone-300" />}</div>)}{!data.habitSummary.habits.length ? <p className="text-[11px] text-stone-500">Add habits to begin your streak.</p> : null}<div className="pt-2"><div className="h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-rose-300" style={{ width: `${habitPercent}%` }} /></div><p className="mt-2 text-[9px] text-stone-500">{data.habitSummary.completedToday}/{data.habitSummary.totalHabits} completed</p></div></div></Surface>
            <Surface className="overflow-hidden transition duration-300 hover:-translate-y-1"><CardHeading title="Workout Plan" href="/fitness" /><div className="p-3"><div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-stone-200 to-stone-100"><Dumbbell className="text-stone-500" size={30} /></div><p className="mt-3 text-sm text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{data.workoutOfTheDay.focus || 'Movement for today'}</p><p className="mt-1 line-clamp-1 text-[9px] text-stone-500">{data.workoutOfTheDay.exercises.slice(0, 3).join(' • ') || 'Personalized around your day'}</p><Link href="/fitness" className="mt-3 block rounded-lg border border-stone-200 py-2 text-center text-[10px] text-stone-700 hover:bg-stone-50">Start Workout</Link></div></Surface>
            <Surface className="overflow-hidden transition duration-300 hover:-translate-y-1"><CardHeading title="Beauty OS" href="/beauty" /><div className="p-3"><div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 via-rose-50 to-white"><Sparkles className="text-amber-700/60" size={30} /></div><p className="mt-3 text-sm text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{data.beautyToday[0]?.name ?? 'Morning Routine'}</p><p className="mt-1 text-[9px] text-stone-500">Sculpt, protect, glow</p><Link href="/beauty" className="mt-3 block rounded-lg border border-stone-200 py-2 text-center text-[10px] text-stone-700 hover:bg-stone-50">View Routine</Link></div></Surface>
            <Surface className="overflow-hidden transition duration-300 hover:-translate-y-1"><CardHeading title="Finance Overview" href="/finance/brain" /><div className="p-4"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(#e4a4ad_0_30%,#edd4a3_30%_55%,#b9d1b4_55%_77%,#eaded0_77%_100%)]"><div className="h-9 w-9 rounded-full bg-white" /></div><div><p className="text-[9px] text-stone-500">Active goals</p><p className="text-2xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{data.projectStatus.goalsInProgress}</p><p className="text-[9px] text-emerald-700">{data.projectStatus.averageGoalProgress}% avg. progress</p></div></div><div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50/60 px-3 py-2 text-[10px] text-emerald-800"><PiggyBank size={13} /> Financial Brain ready</div></div></Surface>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1.7fr]">
            <Surface className="overflow-hidden"><CardHeading title="Connected World" href="/connections" action="Manage" /><div className="grid grid-cols-4 gap-2 p-4 text-center">{['Calendar', 'Gmail', 'Reminders', 'Links'].map((label, index) => <Link key={label} href={index === 2 ? '/connections' : index === 0 ? '/calendar' : index === 1 ? '/gmail' : '/connections'} className="rounded-xl bg-stone-50 px-2 py-3 transition hover:bg-rose-50"><div className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg bg-white text-rose-500 shadow-sm">{index === 0 ? <CalendarDays size={14} /> : index === 1 ? <NotebookText size={14} /> : index === 2 ? <ListChecks size={14} /> : <Heart size={14} />}</div><p className="mt-1 text-[8px] text-stone-600">{label}</p></Link>)}</div></Surface>
            <Surface className="overflow-hidden"><CardHeading title="Notes & Brain Dump" href="/notes" action="Open notes" /><div className="space-y-2 p-4">{data.notesSummary.recentNotes.slice(0, 4).map((note) => <Link href="/notes" key={note.id} className="flex items-start gap-2 text-[10px] text-stone-700 hover:text-rose-800"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-stone-400" /><span className="line-clamp-1">{note.title || note.content || 'Untitled note'}</span></Link>)}{!data.notesSummary.recentNotes.length ? <p className="text-[10px] text-stone-500">Your thoughts have a place here.</p> : null}</div></Surface>
            <Link href="/brain" className="group relative min-h-[150px] overflow-hidden rounded-[22px] border border-amber-900/10 bg-[linear-gradient(115deg,#ead1ba,#c49a77)] p-5 shadow-[0_18px_50px_rgba(108,82,64,.12)] transition duration-300 hover:-translate-y-1"><div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[18px] border-amber-100/25" /><div className="absolute right-8 top-5 text-amber-100/70"><Crown size={70} strokeWidth={1} /></div><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-stone-800">Princess Reminder</p><p className="mt-5 max-w-[420px] text-2xl leading-7 text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>You are becoming everything you prayed for.</p><p className="mt-3 text-[10px] text-stone-700">Enter Glow Brain for your next best move <ArrowRight size={11} className="inline" /></p></Link>
          </div>
        </div>

        <aside className="space-y-4">
          <Surface className="overflow-hidden"><CardHeading title="Calendar Overview" href="/calendar" action="Full calendar" /><div className="p-4"><div className="mb-4 flex items-center justify-between"><button type="button" className="text-stone-400">‹</button><p className="text-xs font-medium text-stone-700">{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p><button type="button" className="text-stone-400">›</button></div><div className="grid grid-cols-7 gap-1 text-center text-[9px] text-stone-500">{['S','M','T','W','T','F','S'].map((d, i) => <span key={`${d}-${i}`} className="py-1">{d}</span>)}{Array.from({ length: 28 }).map((_, index) => { const day = index + 1; const active = day === now.getDate(); return <span key={day} className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${active ? 'bg-rose-300 text-white' : 'text-stone-600'}`}>{day}</span>; })}</div><div className="mt-4 space-y-2">{upcoming.slice(0, 3).map((event, index) => <Link key={event.id} href="/calendar" className={`block rounded-xl px-3 py-3 ${index === 0 ? 'bg-rose-100/80' : index === 1 ? 'bg-violet-100/70' : 'bg-amber-100/70'}`}><p className="text-[10px] font-medium text-stone-800">{event.title}</p><p className="mt-0.5 text-[9px] text-stone-600">{time(event.startAt)}</p></Link>)}</div></div></Surface>
          <Surface className="overflow-hidden"><CardHeading title="Top Tasks" href="/tasks" action="All tasks" /><div className="p-3">{data.topPriorityTasks.slice(0, 6).map((task, index) => <Link href="/tasks" key={task.id} className="flex items-center gap-2 border-b border-stone-100 px-1 py-3 last:border-0"><Circle size={14} className="shrink-0 text-stone-300" /><span className="min-w-0 flex-1 truncate text-[10px] text-stone-700">{task.title}</span>{index === 0 ? <Star size={13} className="fill-amber-600 text-amber-600" /> : null}</Link>)}{!data.topPriorityTasks.length ? <p className="px-2 py-5 text-center text-[10px] text-stone-500">Your priority list is clear.</p> : null}<Link href="/tasks" className="mt-2 flex items-center gap-2 px-1 py-2 text-[10px] text-rose-600">＋ Add new task</Link></div></Surface>
          <Link href="/world" className="group block rounded-[22px] border border-stone-200/60 bg-stone-950 p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,.12)] transition hover:-translate-y-1"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-rose-200">Life World</p><p className="mt-2 text-xl" style={{ fontFamily: 'var(--glow-font-display)' }}>Step inside your digital life.</p><p className="mt-2 text-[10px] leading-5 text-stone-300">Beauty, fitness, finance, projects, memory and home become connected rooms instead of disconnected pages.</p><span className="mt-4 inline-flex items-center gap-2 text-[10px] text-rose-200">Enter world <ArrowRight size={12} /></span></Link>
        </aside>
      </div>
    </div>
  );
}
