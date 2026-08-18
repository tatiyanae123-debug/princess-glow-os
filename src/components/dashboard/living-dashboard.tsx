'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  Bell, BookOpen, CalendarDays, Check, ChevronRight, CirclePlus, Droplets, Dumbbell,
  ListTodo, MessageCircle, Moon, NotebookPen, Plus, Search, Smile, Sparkles, Sun,
  Target, Utensils, type LucideIcon,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { updateTaskAction } from '@/app/actions/tasks';
import { logHabitAction } from '@/app/actions/habits';

const HERO_IMAGE = 'https://media.licdn.com/dms/image/v2/C4E1BAQFxkCCuXBf1rw/company-background_10000/company-background_10000/0/1651792059318/fantastic_frank_lisbon_cover?e=2147483647&t=hrd5Ip8w0WIhE0spIuRyw1zfC7k4faJJF8OXpOD8dKA&v=beta';
const INSIGHT_IMAGE = 'https://comportahouse.pt/wp-content/uploads/2024/03/1825-2204J-SAMA-T4-LIVING-02.jpg';
const RECENT_IMAGES = [
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=420&q=75',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=420&q=75',
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=420&q=75',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=420&q=75',
  'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=420&q=75',
];

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDuration(start: Date, end?: Date | null) {
  if (!end) return '';
  const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes} min`;
}

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-[11px] border border-[#e8e1dd] bg-white shadow-[0_2px_10px_rgba(57,40,31,.018)] ${className}`}>{children}</section>;
}

function Metric({ icon: Icon, label, title, meta, href, tone = 'rose' }: { icon: LucideIcon; label: string; title: string; meta: React.ReactNode; href: string; tone?: 'rose' | 'gold' | 'sage' }) {
  const palette = tone === 'gold'
    ? { bg: '#f8efe4', fg: '#a78050' }
    : tone === 'sage'
      ? { bg: '#edf3ea', fg: '#698366' }
      : { bg: '#fae7e9', fg: '#bf5a71' };
  return (
    <Link href={href} className="group block min-h-[110px] min-w-0 border-r border-[#ece7e4] px-[14px] py-[12px] transition hover:bg-[#fffafa] last:border-r-0">
      <div className="flex items-center gap-[8px] text-[9px] font-medium text-[#514a46]">
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full" style={{ background: palette.bg, color: palette.fg }}>
          <Icon size={13} strokeWidth={1.55} />
        </span>
        <span>{label}</span>
      </div>
      <p className="mt-[9px] min-h-[34px] line-clamp-2 text-[15px] font-medium leading-[1.13] text-[#25211f]">{title}</p>
      <div className="mt-[7px] flex items-center justify-between text-[8px] text-[#8e8580]">
        {meta}
        <ChevronRight size={10} className="transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function PulseOrb({ energy, mood, schedule, focus, goals }: { energy: string; mood: string; schedule: string; focus: string; goals: string }) {
  const labels = [
    ['Energy', energy, '#7f9d78'],
    ['Schedule', schedule, '#d8aa61'],
    ['Wellness', 'Good', '#8aa684'],
    ['Focus', focus, '#a2778b'],
    ['Finances', goals, '#799277'],
    ['Mood', mood, '#7d9e73'],
  ];
  return (
    <div className="grid min-h-[188px] grid-cols-[150px_minmax(0,1fr)] items-center gap-2 px-3 py-2">
      <div className="relative mx-auto flex h-[132px] w-[132px] items-center justify-center rounded-full border-[5px] border-[#dfe9d8] bg-[radial-gradient(circle_at_50%_55%,#fff_0%,#fbf6f4_49%,#eef4ea_50%,#fff_72%)] shadow-[inset_0_0_0_10px_#fff]">
        <div className="absolute inset-[27px] rounded-[47%_53%_58%_42%/45%_41%_59%_55%] bg-[radial-gradient(ellipse_at_50%_30%,#f8dce4_0%,#ead7e6_27%,#eadbc9_52%,#d9e8cf_72%,#f6efe8_100%)] opacity-95 shadow-[0_7px_22px_rgba(165,121,137,.14)]" />
        <Sparkles size={17} className="relative z-10 text-[#c68195]" strokeWidth={1.25} />
      </div>
      <div className="space-y-[7px]">
        {labels.map(([label, value, color]) => (
          <div key={label} className="grid grid-cols-[8px_1fr_auto] items-center gap-2 text-[8px]">
            <span className="h-[5px] w-[5px] rounded-full" style={{ background: color }} />
            <span className="text-[#69615c]">{label}</span>
            <span className="font-medium text-[#3f3935]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniProgress({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / Math.max(1, max)) * 100)));
  return (
    <div>
      <div className="mb-1 flex justify-between text-[7px] text-[#7f7670]"><span>{label}</span><span>{value}/{max}</span></div>
      <div className="h-[3px] rounded-full bg-[#eee9e6]"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: tone }} /></div>
    </div>
  );
}

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [busyHabit, setBusyHabit] = useState<string | null>(null);
  const now = new Date();
  const name = userName ?? 'Tatiyana';
  const topTask = data.topPriorityTasks[0] ?? null;
  const scheduled = useMemo(() => [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()), [data.todaySchedule.events]);
  const nextEvent = scheduled.find((event) => event.startAt.getTime() >= now.getTime()) ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const tasks = data.topPriorityTasks.slice(0, 5);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const dateTop = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const alertTitle = data.todayOverview.tasksDueToday > 0
    ? `${data.todayOverview.tasksDueToday} task${data.todayOverview.tasksDueToday === 1 ? '' : 's'} due today`
    : data.gmailInbox.unreadCount > 0
      ? `${data.gmailInbox.unreadCount} unread Gmail message${data.gmailInbox.unreadCount === 1 ? '' : 's'}`
      : 'No urgent alerts';
  const alertMeta = data.todayOverview.tasksDueToday > 0 ? 'Needs attention' : data.gmailInbox.unreadCount > 0 ? 'Open inbox' : 'All clear';
  const energy = wellness?.energy != null ? `${wellness.energy * 10}%` : 'Not logged';
  const mood = wellness?.mood ?? 'Good';
  const focus = topTask?.priority ? topTask.priority[0].toUpperCase() + topTask.priority.slice(1) : 'Medium';
  const water = wellness?.waterGlasses ?? 0;
  const sleep = wellness?.sleepHours ?? 0;
  const habits = data.habitSummary.habits.slice(0, 4);
  const recentNotes = data.notesSummary.recentNotes.slice(0, 3);

  function openSearch() { document.dispatchEvent(new CustomEvent('glow:search-open')); }
  function quickAdd(module?: string) { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: module ? { module } : {} })); }
  function completeTask(id: string) {
    setBusyTask(id);
    startTransition(async () => {
      await updateTaskAction(id, { status: 'done' });
      setBusyTask(null);
      router.refresh();
    });
  }
  function logHabit(id: string) {
    setBusyHabit(id);
    startTransition(async () => {
      await logHabitAction({ habitId: id, loggedDate: dateKey(), count: 1 });
      setBusyHabit(null);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen w-full bg-[#f8f4f2] text-[#2a2522]">
      {error ? <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full border border-[#f0d7da] bg-white px-3 py-1.5 text-[9px] text-[#9b7277] shadow-sm">Some live data could not load. Glow is showing confirmed data.</div> : null}

      <header className="relative h-[228px] overflow-hidden border-b border-[#ebe5e2] bg-[#f6f2ef]">
        <div className="absolute inset-0 bg-cover bg-[center_58%]" style={{ backgroundImage: `linear-gradient(90deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.86) 22%,rgba(255,255,255,.28) 48%,rgba(255,255,255,.05) 72%,rgba(255,255,255,.08) 100%),url(${HERO_IMAGE})` }} />
        <div className="relative h-full">
          <div className="dashboard-hero-tools absolute right-[18px] top-[14px] z-20 flex items-center gap-[10px]">
            <button type="button" onClick={openSearch} className="dashboard-search flex h-[34px] w-[270px] items-center gap-2 rounded-full border border-white/90 bg-white/92 px-[13px] text-left text-[8.5px] text-[#776f6a] shadow-[0_2px_8px_rgba(50,40,35,.04)] backdrop-blur"><Search size={12} /><span className="min-w-0 flex-1 truncate">Ask Glow anything...</span><span className="text-[8px] text-[#9c948e]">⌘K</span></button>
            <Link href="/wellness" className="dashboard-weather flex items-center gap-[6px] border-r border-[#d6cfca] pr-[12px]"><Sun size={18} className="text-[#d9aa4b]" /><span className="text-[9px] leading-[1.15]"><b className="font-medium">72°F</b><br /><span className="text-[7px] text-[#77706a]">Boston, MA</span></span></Link>
            <Link href="/calendar" className="dashboard-date w-[92px] border-r border-[#d6cfca] pr-[12px] text-[8px] leading-[1.22]">{dateTop}</Link>
            <button type="button" onClick={() => quickAdd()} aria-label="Create" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#c1506d] text-white"><Plus size={16} /></button>
            <Link href="/calendar" aria-label="Calendar" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/92 text-[#423b37]"><CalendarDays size={14} /></Link>
            <Link href="/gmail" aria-label="Messages" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/92 text-[#423b37]"><MessageCircle size={14} /></Link>
            <Link href="/settings?section=profile" aria-label="Profile" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f7d1d8] text-[10px] font-medium text-[#6f3d49]">T</Link>
          </div>

          <div className="dashboard-greeting absolute left-[48px] top-[46px] z-10">
            <h1 className="font-serif text-[42px] leading-[.95] tracking-[-.028em] text-[#211e1c]">{data.greeting.label},<br /><span className="text-[#c45c74]">{name}</span></h1>
            <p className="mt-[10px] max-w-[340px] text-[10.5px] text-[#625b56]">{data.greeting.message}</p>
            <Link href="/briefings" className="mt-[11px] inline-flex h-[30px] items-center rounded-[4px] bg-[#b94f69] px-[14px] text-[9.5px] font-medium text-white">Morning Brief</Link>
          </div>
        </div>
      </header>

      <div className="dashboard-page-grid grid gap-[10px] px-[9px] pb-[18px] pt-0 xl:grid-cols-[minmax(0,1fr)_276px]">
        <main className="min-w-0 space-y-[10px]">
          <Card className="dashboard-metrics grid grid-cols-2 rounded-t-none p-0 sm:grid-cols-4">
            <Metric icon={Target} label="Today's Focus" title={topTask?.title ?? 'Choose your focus'} href={topTask ? `/tasks?taskId=${encodeURIComponent(topTask.id)}&view=all` : '/tasks'} meta={<span>{topTask ? topTask.priority : 'Set priority'}</span>} />
            <Metric icon={CalendarDays} tone="gold" label="Next Event" title={nextEvent?.title ?? 'No upcoming event'} href={nextEvent ? `/calendar?eventId=${encodeURIComponent(nextEvent.id)}&view=day` : '/calendar'} meta={<span>{nextEvent ? `${fmtTime(nextEvent.startAt)}${nextEvent.endAt ? ` – ${fmtTime(nextEvent.endAt)}` : ''}` : 'Calendar is clear'}</span>} />
            <Metric icon={Sun} tone="sage" label="Morning Routine" title={routine?.name ?? 'No routine active'} href={routine ? `/routines?routineId=${encodeURIComponent(routine.id)}` : '/routines'} meta={<span>{routine ? routine.timeOfDay : 'Open routines'}</span>} />
            <Metric icon={Bell} label="Important Alert" title={alertTitle} href={data.todayOverview.tasksDueToday > 0 ? '/tasks' : data.gmailInbox.unreadCount > 0 ? '/gmail' : '/notices'} meta={<span>{alertMeta}</span>} />
          </Card>

          <div className="dashboard-primary-grid grid gap-[10px] lg:grid-cols-[.92fr_.92fr_1.08fr]">
            <Card className="p-[14px]">
              <div className="flex items-center justify-between"><h2 className="text-[10.5px] font-medium">Today at a Glance</h2><Link href="/calendar" className="text-[7.5px] text-[#b85d72]">View full day</Link></div>
              <div className="mt-[9px] space-y-[2px]">
                {scheduled.slice(0, 5).map((event, index) => <Link key={event.id} href={`/calendar?eventId=${encodeURIComponent(event.id)}&view=day`} className={`grid min-h-[27px] grid-cols-[58px_1fr_auto] items-center gap-[5px] rounded-[5px] px-[5px] text-[8px] transition hover:bg-[#fae6e7] ${index === 2 ? 'bg-[#fae7e9]' : ''}`}><span>{event.allDay ? 'All day' : fmtTime(event.startAt)}</span><span className="truncate">{event.title}</span><span className="text-[7px] text-[#9a918b]">{fmtDuration(event.startAt, event.endAt)}</span></Link>)}
                {scheduled.length === 0 ? <p className="py-10 text-center text-[8px] text-[#918782]">Nothing scheduled today.</p> : null}
              </div>
            </Card>

            <Card className="p-[14px]">
              <div className="flex items-center justify-between"><h2 className="text-[10.5px] font-medium">Top Tasks</h2><Link href="/tasks" className="text-[7.5px] text-[#b85d72]">View all</Link></div>
              <div className="mt-[9px] space-y-[2px]">
                {tasks.map((task) => <div key={task.id} className="flex min-h-[28px] items-center gap-[7px] text-[8px]"><button type="button" disabled={pending && busyTask === task.id} onClick={() => completeTask(task.id)} aria-label={`Complete ${task.title}`} className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border border-[#b9b0ab] transition hover:border-[#c45f76] hover:bg-[#fae6e7] disabled:opacity-40">{busyTask === task.id ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c45f76]" /> : null}</button><Link href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="min-w-0 flex-1 truncate hover:text-[#b85d72]">{task.title}</Link></div>)}
                {tasks.length === 0 ? <p className="py-10 text-center text-[8px] text-[#918782]">No priority tasks yet.</p> : null}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between px-[14px] pt-[13px]"><h2 className="text-[10.5px] font-medium">Life Pulse</h2><Link href="/graph" className="text-[7.5px] text-[#b85d72]">View full pulse</Link></div>
              <PulseOrb energy={energy} schedule={scheduled.length ? 'Busy' : 'Open'} focus={focus} goals={data.projectStatus.goalsInProgress > 0 ? 'On Track' : 'Open'} mood={mood} />
            </Card>
          </div>

          <div className="dashboard-wellness-row grid gap-[10px] sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr_.8fr_.8fr]">
            <Card className="p-[13px]">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Habit Tracker</h2><Link href="/habits" className="text-[7px] text-[#b85d72]">View all habits</Link></div>
              <div className="mt-[12px] grid grid-cols-4 gap-2">
                {(habits.length ? habits : [
                  { id: 'move', name: 'Move', completedToday: false, targetCount: 1, color: '#87a17d' },
                  { id: 'hydrate', name: 'Hydrate', completedToday: water >= 6, targetCount: 8, color: '#8d93bf' },
                  { id: 'meditate', name: 'Meditate', completedToday: false, targetCount: 1, color: '#83a28b' },
                  { id: 'read', name: 'Read', completedToday: false, targetCount: 1, color: '#c39b62' },
                ]).slice(0, 4).map((habit) => <button key={habit.id} type="button" onClick={() => data.habitSummary.habits.some((item) => item.id === habit.id) ? logHabit(habit.id) : router.push('/habits')} disabled={busyHabit === habit.id} className="text-center disabled:opacity-40"><span className="mx-auto flex h-[31px] w-[31px] items-center justify-center rounded-full border-[2px]" style={{ borderColor: habit.color ?? '#a6a09b', color: habit.color ?? '#777' }}>{habit.completedToday ? <Check size={13} /> : habit.name.toLowerCase().includes('water') || habit.name.toLowerCase().includes('hydrate') ? <Droplets size={12} /> : <CirclePlus size={11} />}</span><span className="mt-1 block truncate text-[6.5px] text-[#6d6560]">{habit.name}</span><span className="block text-[7.5px] font-medium text-[#3b3531]">{habit.completedToday ? 'Done' : habit.targetCount}</span></button>)}
              </div>
            </Card>

            <Card className="p-[13px]">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Nutrition</h2><Link href="/food" className="text-[7px] text-[#b85d72]">View nutrition</Link></div>
              <p className="mt-[8px] text-[17px] font-medium">1,350 <span className="text-[8px] font-normal text-[#817872]">/ 2,000 cal</span></p>
              <div className="mt-2 h-[4px] rounded-full bg-[#eee7e4]"><div className="h-full w-[67%] rounded-full bg-[#bd5e73]" /></div>
              <div className="mt-[10px] grid grid-cols-3 gap-2"><MiniProgress label="Protein" value={90} max={120} tone="#7b956d" /><MiniProgress label="Carbs" value={120} max={180} tone="#a7859d" /><MiniProgress label="Fat" value={45} max={70} tone="#c6a15f" /></div>
            </Card>

            <Card className="p-[13px]">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Sleep</h2><Moon size={12} className="text-[#8b86b5]" /></div>
              <p className="mt-[8px] text-[19px] font-medium">{sleep > 0 ? `${sleep.toFixed(1)}h` : 'Not logged'}</p>
              <p className="text-[7px] text-[#79936d]">{sleep >= 7 ? 'Good' : sleep > 0 ? 'Below goal' : 'Log sleep'}</p>
              <div className="mt-[12px] flex h-[22px] items-end gap-[3px]">{[8, 14, 11, 18, 16, 21, 17, 20, 15, 19, 13].map((height, index) => <span key={index} className="w-[4px] rounded-t bg-[#aaa5c8]" style={{ height }} />)}</div>
            </Card>

            <Card className="p-[13px] text-center">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Mood</h2><span className="text-[6.5px] text-[#9c938d]">Today</span></div>
              <div className="mx-auto mt-[10px] flex h-[47px] w-[47px] items-center justify-center rounded-full bg-[#e8e5f3] text-[#7671a2]"><Smile size={27} strokeWidth={1.3} /></div>
              <p className="mt-1 text-[8px] font-medium capitalize">{mood}</p>
              <Link href="/wellness" className="mt-1 block text-[7px] text-[#b85d72]">Log your mood</Link>
            </Card>
          </div>

          <div className="dashboard-bottom-grid grid gap-[10px] lg:grid-cols-[1.55fr_.85fr]">
            <Card className="p-[13px]">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Recently Opened</h2><Link href="/all-rooms" className="text-[7px] text-[#b85d72]">View all</Link></div>
              <div className="mt-[9px] grid grid-cols-5 gap-[8px]">
                {[
                  ['Terrain Design', '/projects'], ['Financial Brain', '/finance/brain'], ['Beauty Routine', '/beauty'], ['Workout Plan', '/fitness'], ["Saint's Space", '/home'],
                ].map(([label, href], index) => <Link key={label} href={href} className="group"><div className="aspect-[1.45] overflow-hidden rounded-[6px] bg-[#eee7e2]"><img src={RECENT_IMAGES[index]} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div><p className="mt-1 truncate text-[7.5px] font-medium">{label}</p><p className="text-[6.5px] text-[#958c86]">{index === 0 ? 'Project' : index === 1 ? 'Spending' : index === 2 ? 'Morning' : index === 3 ? 'Glute Focus' : 'Today'}</p></Link>)}
              </div>
            </Card>

            <Card className="p-[13px]">
              <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Recent Activity</h2><Link href="/timeline" className="text-[7px] text-[#b85d72]">View all</Link></div>
              <div className="mt-[8px] space-y-[8px]">
                {recentNotes.length ? recentNotes.map((note) => <Link key={note.id} href={`/notes?noteId=${encodeURIComponent(note.id)}`} className="grid grid-cols-[22px_1fr_auto] items-center gap-2 text-[7.5px]"><span className="flex h-[20px] w-[20px] items-center justify-center rounded-[5px] bg-[#fae9ec] text-[#bd6175]"><NotebookPen size={10} /></span><span className="truncate">{note.title}</span><span className="text-[6.5px] text-[#9d938d]">Recent</span></Link>) : <><div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 text-[7.5px]"><span className="flex h-[20px] w-[20px] items-center justify-center rounded-[5px] bg-[#fae9ec] text-[#bd6175]"><ListTodo size={10} /></span><span>Dashboard reviewed</span><span className="text-[6.5px] text-[#9d938d]">Today</span></div><div className="grid grid-cols-[22px_1fr_auto] items-center gap-2 text-[7.5px]"><span className="flex h-[20px] w-[20px] items-center justify-center rounded-[5px] bg-[#eef2ea] text-[#768b70]"><BookOpen size={10} /></span><span>Glow OS opened</span><span className="text-[6.5px] text-[#9d938d]">Today</span></div></>}
              </div>
            </Card>
          </div>
        </main>

        <aside className="dashboard-right-rail min-w-0 space-y-[10px] pb-4 pt-[10px] xl:pt-[10px]">
          <Card className="p-[13px]">
            <div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Upcoming</h2><Link href="/calendar" className="text-[7px] text-[#b85d72]">View all</Link></div>
            <div className="mt-[9px] space-y-[8px]">
              {(scheduled.slice(0, 3).length ? scheduled.slice(0, 3) : [
                { id: 'none-1', title: 'Open calendar', startAt: now, endAt: null, allDay: false, location: null },
              ]).map((event) => <Link key={event.id} href={event.id.startsWith('none-') ? '/calendar' : `/calendar?eventId=${encodeURIComponent(event.id)}&view=day`} className="grid grid-cols-[44px_1fr] gap-2 border-b border-[#eee8e5] pb-[7px] last:border-b-0 last:pb-0"><div className="text-[7px] leading-[1.35] text-[#827974]"><b className="font-medium">{event.startAt.toLocaleDateString('en-US', { weekday: 'short' })}</b><br />{event.startAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div><div><p className="truncate text-[7.5px] font-medium">{event.title}</p><p className="mt-[1px] text-[6.5px] text-[#968d87]">{event.allDay ? 'All day' : fmtTime(event.startAt)}</p></div></Link>)}
            </div>
          </Card>

          <Card className="relative min-h-[148px] overflow-hidden border-0 text-white">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg,rgba(54,43,36,.78),rgba(54,43,36,.34)),url(${INSIGHT_IMAGE})` }} />
            <div className="relative z-10 p-[14px]"><h2 className="text-[9.5px] font-medium">Glow Insight</h2><p className="mt-[13px] font-serif text-[15px] leading-[1.25]">{insight ?? 'Protect the part of your day with the most open space.'}</p><Link href="/observations" className="mt-[11px] inline-flex items-center rounded-[4px] border border-white/60 px-[8px] py-[5px] text-[6.5px]">See more insights <ChevronRight size={8} /></Link></div>
          </Card>

          <Card className="p-[13px]">
            <h2 className="text-[9.5px] font-medium">Quick Actions</h2>
            <div className="mt-[9px] grid grid-cols-2 gap-[7px]">
              <button type="button" onClick={() => quickAdd('task')} className="flex min-h-[36px] items-center gap-2 rounded-[6px] border border-[#ece6e2] px-[9px] text-[7px]"><ListTodo size={11} />New Task</button>
              <button type="button" onClick={() => router.push('/calendar?create=1')} className="flex min-h-[36px] items-center gap-2 rounded-[6px] border border-[#ece6e2] px-[9px] text-[7px]"><CalendarDays size={11} />Add Event</button>
              <button type="button" onClick={() => router.push('/habits')} className="flex min-h-[36px] items-center gap-2 rounded-[6px] border border-[#ece6e2] px-[9px] text-[7px]"><Check size={11} />Log Habit</button>
              <button type="button" onClick={() => quickAdd('note')} className="flex min-h-[36px] items-center gap-2 rounded-[6px] border border-[#ece6e2] px-[9px] text-[7px]"><NotebookPen size={11} />Add Note</button>
            </div>
          </Card>

          <Card className="p-[13px]">
            <div className="flex items-center justify-between"><div><h2 className="text-[9.5px] font-medium">Tomorrow Preview</h2><p className="mt-[1px] text-[6.5px] text-[#968d87]">{tomorrowLabel}</p></div><Sun size={12} className="text-[#c8a25e]" /></div>
            <div className="mt-[9px] space-y-[6px] text-[7px]">
              <div className="grid grid-cols-[50px_1fr] gap-2"><span className="text-[#918984]">9:00 AM</span><span>Deep Work</span></div>
              <div className="grid grid-cols-[50px_1fr] gap-2"><span className="text-[#918984]">12:00 PM</span><span>Lunch</span></div>
              <div className="grid grid-cols-[50px_1fr] gap-2"><span className="text-[#918984]">3:00 PM</span><span>Workout</span></div>
              <div className="grid grid-cols-[50px_1fr] gap-2"><span className="text-[#918984]">6:00 PM</span><span>Dinner</span></div>
            </div>
            <Link href="/tomorrow" className="mt-[10px] inline-flex items-center text-[7px] text-[#b85d72]">Plan tomorrow <ChevronRight size={8} /></Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
