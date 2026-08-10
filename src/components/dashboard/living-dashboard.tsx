'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Crown,
  Droplets,
  Dumbbell,
  Flower2,
  Heart,
  ListChecks,
  MapPin,
  Music2,
  NotebookText,
  PiggyBank,
  Plus,
  Quote,
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
  return <section className={`editorial-surface ${className}`}>{children}</section>;
}

function Heading({ title, href, action = 'View all' }: { title: string; href?: string; action?: string }) {
  return <div className="flex items-center justify-between border-b border-[#eadfd6] px-4 py-3">
    <h2 className="text-[9px] font-semibold uppercase tracking-[.13em] text-[#554741]">{title}</h2>
    {href ? <Link href={href} className="text-[8px] text-[#907b73] hover:text-[#a45f69]">{action}</Link> : null}
  </div>;
}

function PhotoTile({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`editorial-photo relative ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,255,255,.32),transparent_18%),linear-gradient(160deg,#d8c4ba,#9a8177_55%,#574944)]" />
    <span className="absolute inset-x-0 bottom-2 text-center text-[6px] uppercase tracking-[.18em] text-white/80">{label}</span>
  </div>;
}

export function LivingDashboard({ data, error }: { data: LivingDashboardData; error?: string }) {
  const now = new Date();
  const habitPercent = data.habitSummary.totalHabits ? Math.round((data.habitSummary.completedToday / data.habitSummary.totalHabits) * 100) : 0;
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const water = data.wellnessToday.entry?.waterGlasses ?? 0;
  const totalTasks = Math.max(data.todayOverview.tasksDueToday, data.topPriorityTasks.length);
  const completedTasks = Math.min(data.projectStatus.completedTaskCount, Math.max(totalTasks, 1));
  const scheduled = [
    ...data.todaySchedule.events.map((event) => ({ id: event.id, title: event.title, start: event.startAt, note: event.location ?? (event.allDay ? 'All day' : 'Calendar') })),
    ...data.todaySchedule.workSlots.map((slot) => ({ id: slot.id, title: slot.title, start: null, note: `${slot.startTime.slice(0, 5)} – ${slot.endTime.slice(0, 5)}` })),
  ].slice(0, 7);
  const upcoming = [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 4);

  return <div className="mx-auto w-full max-w-[1540px] space-y-4 animate-fade-in">
    {error ? <div className="rounded-[10px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">Glow OS is showing the safe dashboard while live data reconnects: {error}</div> : null}

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-4">
        <section className="relative min-h-[360px] overflow-hidden rounded-[7px] border border-[#e8dbd2] bg-[#f8f0ea] px-5 py-5 sm:px-7 sm:py-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_38%,rgba(227,177,184,.27),transparent_23%),radial-gradient(circle_at_80%_15%,rgba(205,183,151,.2),transparent_22%),linear-gradient(130deg,#fbf5f1,#f1e3da)]" />
          <Flower2 size={105} strokeWidth={.8} className="absolute right-3 top-2 text-[#c8989e]/28" />
          <div className="relative z-10 grid min-h-[310px] gap-6 lg:grid-cols-[.72fr_1.28fr]">
            <div className="pt-2">
              <p className="glow-display text-[31px] leading-none tracking-[-.04em] text-[#302622] sm:text-[38px]">Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'},</p>
              <div className="mt-1 flex items-center gap-2"><p className="glow-hand text-[50px] leading-none text-[#6e4d49]">Tatiyana</p><Crown size={18} className="text-[#b68a53]" /></div>
              <p className="mt-5 text-[10px] text-[#6e5b54]">{data.greeting.message || 'Welcome to your GLOW OS ✨'}</p>
              <p className="glow-display mt-5 max-w-[240px] text-[12px] italic leading-5 text-[#554641]">“Every day is a new chapter of the life you’re creating.”</p>
              <div className="paper-card tape mt-7 w-[215px] rotate-[-2deg] p-4">
                <p className="glow-display text-[11px] text-[#51413b]">Today&apos;s Focus</p>
                <ul className="mt-2 space-y-1 text-[9px] leading-4 text-[#66544e]"><li>• {topTask?.title ?? 'Choose one meaningful priority'}</li><li>• Discipline over pressure</li><li>• Soft life, clear actions</li></ul>
                <Heart size={12} className="ml-auto mt-2 text-[#ad7178]" />
              </div>
            </div>

            <div className="relative min-h-[300px]">
              <div className="absolute left-[5%] top-[12%] h-36 w-24 rounded-[58%_42%_55%_45%] bg-[#e8b7bd]/70" />
              <PhotoTile label="Daily portrait" className="absolute left-[43%] top-[2%] h-[172px] w-[138px] rotate-[-4deg] grayscale" />
              <PhotoTile label="Mood" className="absolute right-[5%] top-[24%] h-[126px] w-[100px] rotate-[4deg]" />
              <div className="absolute left-[21%] top-[36%] h-[185px] w-[130px] rounded-[46%_46%_18%_18%] bg-[linear-gradient(180deg,#5e463e_0_28%,#d7c0b4_29%_46%,#f2e9e4_47%_100%)] shadow-[0_18px_35px_rgba(68,47,40,.18)]"><div className="absolute left-1/2 top-[-25px] h-16 w-16 -translate-x-1/2 rounded-full bg-[#4b3731]" /></div>
              <div className="absolute left-[5%] top-[52%] rounded-[3px] border border-[#d9ccc5] bg-[#f9f6f1] px-3 py-2 text-[#3e3531] shadow-sm"><p className="text-[7px] font-bold">PANTONE</p><p className="text-[15px] font-semibold leading-none">685 C</p></div>
              <div className="absolute right-[2%] top-[2%] flex h-18 w-18 items-center justify-center rounded-full border-[7px] border-white/80 bg-[#dfb2ab] p-3 shadow-md"><div className="h-9 w-9 rounded-full bg-[#c78680]" /></div>
              <div className="absolute bottom-[9%] right-[7%] flex gap-2"><div className="h-12 w-16 rounded-[4px] bg-[#e8ddd6] shadow-sm" /><div className="h-10 w-10 rounded-full bg-[#d69da6] shadow-sm" /><div className="h-10 w-10 rounded-full bg-[#e7bdb9] shadow-sm" /></div>
            </div>
          </div>
        </section>

        <Surface className="overflow-hidden">
          <div className="grid divide-y divide-[#eadfd6] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x lg:divide-[#eadfd6]">
            <Link href="/tasks" className="flex min-h-[88px] items-center gap-3 px-4 py-3 hover:bg-[#faeeee]"><Star size={20} className="text-[#c97882]" /><div className="min-w-0"><p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Top Priority</p><p className="glow-display mt-1 line-clamp-2 text-[13px] leading-4 text-[#332a27]">{topTask?.title ?? 'Choose your focus'}</p><p className="mt-1 text-[8px] text-[#c06572]">Due today</p></div></Link>
            <Link href="/tasks" className="flex min-h-[88px] items-center gap-3 px-4 py-3 hover:bg-[#faeeee]"><CheckCircle2 size={20} className="text-[#c97882]" /><div><p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Tasks Today</p><p className="glow-display mt-1 text-[20px] text-[#332a27]">{completedTasks} / {totalTasks}</p><p className="text-[8px] text-[#8e7770]">{totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}% completed</p></div></Link>
            <Link href="/habits" className="flex min-h-[88px] items-center gap-3 px-4 py-3 hover:bg-[#fff8ed]"><Crown size={20} className="text-[#b68a53]" /><div><p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Habit Score</p><p className="glow-display mt-1 text-[20px] text-[#332a27]">{habitPercent}%</p><p className="text-[8px] text-[#8e7770]">Keep going</p></div></Link>
            <Link href="/planning" className="flex min-h-[88px] items-center gap-3 px-4 py-3 hover:bg-[#fff8ed]"><Clock3 size={20} className="text-[#b68a53]" /><div><p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Focus Time</p><p className="glow-display mt-1 text-[20px] text-[#332a27]">Plan</p><p className="text-[8px] text-[#8e7770]">Shape your next block</p></div></Link>
            <Link href="/wellness" className="flex min-h-[88px] items-center gap-3 px-4 py-3 hover:bg-[#eff8fb] sm:col-span-2 lg:col-span-1"><Droplets size={20} className="text-[#77aac1]" /><div><p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Water Intake</p><p className="glow-display mt-1 text-[20px] text-[#332a27]">{water} / 8</p><p className="text-[8px] text-[#8e7770]">glasses</p></div></Link>
          </div>
        </Surface>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.15fr_1.18fr]">
          <Surface className="overflow-hidden"><Heading title="Today's Plan" href="/planning" action="Plan day" /><div className="p-3">{scheduled.length ? scheduled.map((item,index)=><Link href="/calendar" key={`${item.id}-${index}`} className={`grid grid-cols-[60px_1fr] gap-2 rounded-[7px] px-2.5 py-2.5 hover:bg-[#f8eceb] ${index===2?'bg-[#f4d9d7]/65':''}`}><p className="text-[9px] font-semibold text-[#74635e]">{item.start?time(item.start):item.note.split('–')[0]}</p><div><p className="text-[10px] font-medium text-[#3b302c]">{item.title}</p><p className="mt-0.5 line-clamp-1 text-[8px] text-[#8e7770]">{item.note}</p></div></Link>) : <div className="px-3 py-8 text-center"><CalendarDays className="mx-auto text-[#cdbcb3]" /><p className="mt-2 text-[9px] text-[#8e7770]">Your day is open.</p></div>}</div></Surface>

          <Surface className="overflow-hidden bg-[#f1e3da]"><Heading title="Ritual of the Day" href="/beauty" action="Enter ritual" /><div className="grid min-h-[270px] grid-cols-[.9fr_1.1fr]"><div className="relative m-3 overflow-hidden rounded-[5px] bg-[linear-gradient(145deg,#6a5047,#a97e70_50%,#d7b6a6)]"><Sparkles className="absolute bottom-4 left-4 text-white/80" size={26} /></div><div className="flex flex-col p-4 pl-1"><p className="glow-display text-[20px] leading-5 text-[#3e312d]">{data.routinesForNow[0]?.name ?? data.beautyToday[0]?.name ?? 'Sculpt & Glow'}</p><p className="mt-1 text-[7px] uppercase tracking-[.1em] text-[#8d7972]">Focused daily ritual</p><div className="mt-4 space-y-2">{(data.beautyToday.length?data.beautyToday.slice(0,4).map((x)=>x.name):['Prep with intention','Sculpt cheekbones','Define jawline','Relax + finish']).map((step)=><p key={step} className="flex items-center gap-2 text-[9px] text-[#66544e]"><CheckCircle2 size={11} className="text-[#c6888f]" />{step}</p>)}</div><Link href="/beauty" className="mt-auto flex items-center justify-center gap-1 rounded-[6px] bg-[#2f2522] px-3 py-2 text-[8px] text-white">Start Ritual <ArrowRight size={10} /></Link></div></div></Surface>

          <Surface className="overflow-hidden"><Heading title="Upcoming" href="/calendar" action="View calendar" /><div className="p-3">{upcoming.length?upcoming.map((event)=><Link key={event.id} href="/calendar" className="grid grid-cols-[60px_1fr_12px] items-center gap-2 border-b border-[#eee4dd] px-2 py-3.5 last:border-0"><p className="text-[9px] font-semibold text-[#74635e]">{time(event.startAt)}</p><div><p className="text-[10px] font-medium text-[#3b302c]">{event.title}</p><p className="mt-0.5 text-[8px] text-[#8e7770]">{event.location ?? dateLabel(event.startAt)}</p></div><ArrowRight size={10} className="text-[#c7b6ae]" /></Link>):<p className="px-3 py-10 text-center text-[9px] text-[#8e7770]">No upcoming events yet.</p>}</div></Surface>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Surface className="overflow-hidden"><Heading title="Habit Tracker" href="/habits" /><div className="space-y-2 p-4">{data.habitSummary.habits.slice(0,5).map((habit)=><div key={habit.id} className="flex items-center justify-between gap-3"><p className="truncate text-[9px] text-[#5d4e48]">{habit.name}</p>{habit.completedToday?<CheckCircle2 size={13} className="text-[#789678]" />:<Circle size={13} className="text-[#cdbcb3]" />}</div>)}<div className="pt-2"><div className="h-1.5 overflow-hidden rounded-full bg-[#eee3dc]"><div className="h-full rounded-full bg-[#d99ca3]" style={{width:`${habitPercent}%`}} /></div><p className="mt-2 text-[8px] text-[#8e7770]">{data.habitSummary.completedToday}/{data.habitSummary.totalHabits} completed</p></div></div></Surface>
          <Surface className="overflow-hidden"><Heading title="Workout Plan" href="/fitness" /><div className="p-3"><div className="flex h-24 items-center justify-center rounded-[5px] bg-[linear-gradient(145deg,#8f8078,#d1c2b9)]"><Dumbbell className="text-white/85" size={30} /></div><p className="glow-display mt-3 text-[13px] text-[#3b302c]">{data.workoutOfTheDay.focus || 'Movement for today'}</p><p className="mt-1 line-clamp-1 text-[8px] text-[#8e7770]">{data.workoutOfTheDay.exercises.slice(0,3).join(' • ') || 'Personalized around your day'}</p><Link href="/fitness" className="mt-3 block rounded-[6px] border border-[#e2d5cd] py-2 text-center text-[8px] text-[#5f504b]">Start Workout</Link></div></Surface>
          <Surface className="overflow-hidden"><Heading title="Beauty OS" href="/beauty" /><div className="p-3"><div className="flex h-24 items-center justify-center rounded-[5px] bg-[linear-gradient(145deg,#f2dcbf,#eac9c8,#f9f3ee)]"><Sparkles className="text-[#ae7d53]" size={30} /></div><p className="glow-display mt-3 text-[13px] text-[#3b302c]">{data.beautyToday[0]?.name ?? 'Morning Routine'}</p><p className="mt-1 text-[8px] text-[#8e7770]">Sculpt, protect, glow</p><Link href="/beauty" className="mt-3 block rounded-[6px] border border-[#e2d5cd] py-2 text-center text-[8px] text-[#5f504b]">View Routine</Link></div></Surface>
          <Surface className="overflow-hidden"><Heading title="Finance Overview" href="/finance/brain" /><div className="p-4"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(#e4a4ad_0_30%,#edd4a3_30%_55%,#b9d1b4_55%_77%,#eaded0_77%_100%)]"><div className="h-9 w-9 rounded-full bg-[#fffaf6]" /></div><div><p className="text-[8px] text-[#8e7770]">Active goals</p><p className="glow-display text-[21px] text-[#3b302c]">{data.projectStatus.goalsInProgress}</p><p className="text-[8px] text-[#668066]">{data.projectStatus.averageGoalProgress}% avg. progress</p></div></div><Link href="/finance/brain" className="mt-4 flex items-center gap-2 rounded-[6px] bg-[#eef4eb] px-3 py-2 text-[8px] text-[#5e765e]"><PiggyBank size={12} />Go to Finance</Link></div></Surface>
        </div>

        <div className="grid gap-4 lg:grid-cols-[.8fr_2fr_1fr]">
          <Surface className="paper-card p-4"><p className="glow-display text-[15px] text-[#3f342f]">Journal Entry</p><p className="mt-1 text-[7px] text-[#9a857d]">Today</p><p className="glow-display mt-5 text-[13px] italic text-[#65544e]">Grateful for...</p><div className="mt-3 space-y-1 text-[9px] text-[#75635c]">{data.notesSummary.recentNotes.slice(0,3).map((note)=><p key={note.id}>• {note.title || note.content || 'A quiet thought'}</p>)}{!data.notesSummary.recentNotes.length?<><p>• Slow mornings</p><p>• Good conversations</p><p>• Room to think</p></>:null}</div><Link href="/notes" className="mt-5 inline-flex items-center gap-1 text-[8px] text-[#8d5e66]"><Plus size={10} />New Entry</Link></Surface>

          <Link href="/world" className="relative overflow-hidden rounded-[7px] border border-[#e5d9d0] bg-[#f3ece4] p-5 shadow-[0_10px_30px_rgba(84,62,52,.05)]"><Flower2 size={92} strokeWidth={.7} className="absolute -bottom-4 left-3 text-[#9fa887]/50" /><div className="relative ml-auto max-w-[62%] text-center"><p className="glow-display text-[22px] text-[#40342f]">Garden Wonders</p><p className="mt-1 text-[8px] uppercase tracking-[.13em] text-[#8c786f]">Your Life World Collection</p><p className="mt-4 text-[9px] leading-4 text-[#76635d]">Step into the rooms, memories, projects and rituals that make your world feel alive.</p><span className="mt-4 inline-flex rounded-[5px] bg-[#eadbd2] px-4 py-2 text-[8px] text-[#6a554e]">Explore World</span></div></Link>

          <Surface className="overflow-hidden"><div className="grid h-full grid-cols-[.75fr_1.25fr]"><div className="p-4"><p className="glow-display text-[18px] leading-5 text-[#423631]">Dream Destination</p><p className="mt-3 text-[9px] text-[#66544e]">Your next beautiful place.</p><p className="mt-2 text-[8px] leading-4 text-[#8e7770]">Use World and Notes to collect travel plans, inspiration and memories.</p><Link href="/world" className="mt-4 inline-flex items-center gap-1 rounded-[5px] border border-[#e2d5cd] px-3 py-2 text-[8px] text-[#6a554e]">View World <MapPin size={9} /></Link></div><div className="m-3 ml-0 rounded-[5px] bg-[linear-gradient(160deg,#a4aa9b,#ddd4c2_47%,#786f63)]" /></div></Surface>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Surface className="p-4"><p className="glow-display text-[15px] text-[#40342f]">Habit Tracker</p><p className="mt-1 text-[8px] text-[#8e7770]">This Week</p><div className="mt-4 space-y-3">{data.habitSummary.habits.slice(0,4).map((habit,index)=><div key={habit.id} className="grid grid-cols-[72px_repeat(7,1fr)] items-center gap-1"><span className="truncate text-[8px] text-[#66544e]">{habit.name}</span>{Array.from({length:7}).map((_,day)=><span key={day} className={`mx-auto h-3 w-3 rounded-full border border-[#bca9a0] ${day<=index || habit.completedToday?'bg-[#a4a18e]':'bg-transparent'}`} />)}</div>)}</div></Surface>

          <Surface className="overflow-hidden"><Heading title="Wellness Essentials" href="/wellness" action="Open wellness" /><div className="flex h-[160px] items-end justify-center gap-3 bg-[linear-gradient(180deg,#fbf5f0,#eaded5)] p-5"><div className="h-20 w-10 rounded-t-[5px] bg-[#85877b]" /><div className="h-24 w-11 rounded-t-[5px] bg-[#d3c0ab]" /><div className="h-16 w-16 rounded-[16px] bg-[#dfc7bd]" /></div></Surface>

          <Surface className="overflow-hidden"><Heading title="Pinned Inspiration" href="/notes" action="Open notes" /><div className="grid h-[160px] grid-cols-2 gap-2 p-3"><div className="tape flex items-center justify-center rounded-[4px] bg-[#d9c8bc] p-3 text-center"><span className="glow-hand text-[25px] leading-6 text-[#5e4a44]">Dream<br/>Plan<br/>Do</span></div><div className="rounded-[4px] bg-[linear-gradient(145deg,#ccb49f,#efe4db_52%,#9c8b7d)]" /></div></Surface>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.35fr_.65fr]">
          <Surface className="p-5"><div className="flex items-start justify-between gap-4"><div><Quote size={18} className="text-[#b8898f]" /><p className="glow-display mt-3 text-[22px] leading-8 text-[#433631]">“What you focus on grows.”</p><p className="mt-4 text-[8px] uppercase tracking-[.12em] text-[#927e77]">Quote of the day</p></div><Flower2 size={75} strokeWidth={.7} className="text-[#c4979e]/55" /></div></Surface>
          <Link href="/brain" className="relative overflow-hidden rounded-[7px] border border-[#e5d7cd] bg-[linear-gradient(110deg,#ead7c8,#d8b4a0)] p-5"><Crown size={54} strokeWidth={1} className="absolute right-4 top-3 text-white/30" /><p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#6e554c]">Princess Reminder</p><p className="glow-display mt-4 text-[19px] leading-6 text-[#453530]">You are becoming everything you prayed for.</p><p className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#70554e]">Ask Glow Brain <ArrowRight size={9} /></p></Link>
        </div>

        <div className="relative overflow-hidden rounded-[7px] border border-[#e4d7cf] bg-[linear-gradient(90deg,#f3e5df,#f9f1ec,#efd7d7)] px-6 py-4 text-center"><Flower2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69ca0]/50" size={48} strokeWidth={1} /><p className="glow-display text-[16px] italic text-[#6b514b]">You are becoming everything you prayed for.</p><div className="absolute right-5 top-1/2 hidden -translate-y-1/2 items-center gap-3 md:flex"><span className="glow-display text-[15px] text-[#40322f]">MY <span className="glow-hand text-[22px]">Universe</span></span><Link href="/memory" className="rounded-[5px] bg-[#dba8ad] px-4 py-2 text-[8px] font-medium text-white">+ New Entry</Link></div></div>
      </div>

      <aside className="space-y-4">
        <div className="px-1 text-right"><p className="text-[7px] font-medium uppercase tracking-[.1em] text-[#8d7972]">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p><p className="glow-display mt-1 text-[27px] text-[#302724]">{now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><p className="mt-1 text-[8px] text-[#7f6c66]">Your local day in Glow OS</p></div>

        <Surface className="overflow-hidden"><Heading title="Calendar Overview" href="/calendar" action="Full calendar" /><div className="p-4"><div className="mb-4 flex items-center justify-between"><button type="button" className="text-[#a49088]">‹</button><p className="text-[10px] font-medium text-[#66554f]">{now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p><button type="button" className="text-[#a49088]">›</button></div><div className="grid grid-cols-7 gap-1 text-center text-[8px] text-[#8e7770]">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}-${i}`} className="py-1">{d}</span>)}{Array.from({length:28}).map((_,index)=>{const day=index+1;const active=day===now.getDate();return <span key={day} className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${active?'bg-[#d49aa0] text-white':'text-[#6f5d57]'}`}>{day}</span>;})}</div><div className="mt-4 space-y-2">{upcoming.slice(0,3).map((event,index)=><Link key={event.id} href="/calendar" className={`block rounded-[6px] px-3 py-3 ${index===0?'bg-[#f2cfd1]':index===1?'bg-[#ddd8e8]':'bg-[#efddcf]'}`}><p className="text-[9px] font-medium text-[#4c3e39]">{event.title}</p><p className="mt-0.5 text-[8px] text-[#76645d]">{time(event.startAt)}</p></Link>)}</div><Link href="/calendar" className="mt-3 block rounded-[5px] border border-[#e4d8d0] py-2 text-center text-[8px] text-[#66544e]">Open Full Calendar</Link></div></Surface>

        <Surface className="overflow-hidden"><Heading title="Morning Soundscape" href="/notes" action="Save links" /><div className="p-4"><div className="flex items-center gap-2 text-[#5f504b]"><Music2 size={15} /><p className="text-[9px]">Mood + focus audio</p></div><p className="mt-3 text-[8px] leading-4 text-[#8e7770]">Save your preferred playlist, meditation or focus sound links in Notes and Important Websites.</p><Link href="/notes" className="mt-3 inline-flex items-center gap-1 text-[8px] text-[#8f5f67]">Choose soundscape <ArrowRight size={9} /></Link></div></Surface>

        <Surface className="overflow-hidden"><Heading title="Top Tasks" href="/tasks" action="All tasks" /><div className="p-3">{data.topPriorityTasks.slice(0,6).map((task,index)=><Link href="/tasks" key={task.id} className="flex items-center gap-2 border-b border-[#eee4dd] px-1 py-3 last:border-0"><Circle size={12} className="shrink-0 text-[#cdbcb3]" /><span className="min-w-0 flex-1 truncate text-[9px] text-[#5d4e48]">{task.title}</span>{index===0?<Star size={11} className="fill-[#b68a53] text-[#b68a53]" />:null}</Link>)}{!data.topPriorityTasks.length?<p className="px-2 py-5 text-center text-[9px] text-[#8e7770]">Your priority list is clear.</p>:null}<Link href="/tasks" className="mt-2 flex items-center gap-2 px-1 py-2 text-[8px] text-[#a6606c]">＋ Add new task</Link></div></Surface>

        <Surface className="overflow-hidden"><Heading title="Connected World" href="/connections" action="Manage" /><div className="grid grid-cols-2 gap-2 p-3">{[['Calendar',CalendarDays,'/calendar'],['Gmail',NotebookText,'/gmail'],['Connections',ListChecks,'/connections'],['Notes',BookOpen,'/notes']].map(([label,Icon,href])=>{const I=Icon as typeof CalendarDays;return <Link key={String(label)} href={String(href)} className="rounded-[6px] bg-[#f7f0eb] p-3 text-center"><I size={14} className="mx-auto text-[#a66f76]" /><p className="mt-1 text-[8px] text-[#705d57]">{String(label)}</p></Link>;})}</div></Surface>
      </aside>
    </div>
  </div>;
}
