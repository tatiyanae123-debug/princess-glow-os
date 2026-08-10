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
  BookOpen,
  Flower2,
  MapPin,
  Music2,
  Quote,
  Plus,
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

function CardHeading({ title, href, action = 'View all' }: { title: string; href?: string; action?: string }) {
  return <div className="flex items-center justify-between border-b border-[#eadfd6] px-4 py-3">
    <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4b3e39]">{title}</h2>
    {href ? <Link href={href} className="text-[9px] font-medium text-[#8e7770] transition hover:text-[#985963]">{action}</Link> : null}
  </div>;
}

function DecorativePhoto({ label, className = '' }: { label: string; className?: string }) {
  return <div className={`relative overflow-hidden rounded-[4px] border border-white/70 bg-[linear-gradient(145deg,#d7c5bd,#bca69d_45%,#6d5d58)] shadow-[0_10px_22px_rgba(83,61,52,.13)] ${className}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_25%,rgba(255,255,255,.45),transparent_18%),linear-gradient(180deg,transparent,rgba(40,28,24,.12))]" />
    <div className="absolute inset-x-0 bottom-2 text-center text-[7px] uppercase tracking-[.18em] text-white/80">{label}</div>
  </div>;
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

  return <div className="mx-auto w-full max-w-[1540px] animate-fade-in space-y-4">
    {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">Glow OS is showing the safe dashboard while live data reconnects: {error}</div> : null}

    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <section className="relative min-h-[350px] overflow-hidden rounded-[6px] border border-[#eadfd6] bg-[#f8f0ea] px-5 py-5 sm:px-7 sm:py-6">
          <div className="absolute inset-0 opacity-70" style={{background:'radial-gradient(circle at 36% 38%, rgba(227,177,184,.24), transparent 23%), radial-gradient(circle at 78% 20%, rgba(205,183,151,.17), transparent 22%), linear-gradient(130deg,#fbf5f1,#f1e3da)'}} />
          <div className="relative z-10 grid min-h-[300px] gap-6 lg:grid-cols-[.7fr_1.3fr]">
            <div className="relative z-20 pt-2">
              <p className="text-[31px] leading-none tracking-[-.035em] text-[#2d2421] sm:text-[37px]" style={{fontFamily:'var(--glow-font-display)'}}>Good {now.getHours()<12?'morning':now.getHours()<17?'afternoon':'evening'},</p>
              <div className="mt-1 flex items-center gap-2"><p className="text-[44px] leading-none text-[#6d4f49]" style={{fontFamily:'var(--glow-font-hand)'}}>Tatiyana</p><Crown size={18} className="text-[#b98a51]"/></div>
              <p className="mt-6 text-[11px] text-[#65544e]">{data.greeting.message || 'Welcome to your GLOW OS ✨'}</p>
              <p className="mt-5 max-w-[230px] text-[12px] italic leading-5 text-[#554641]" style={{fontFamily:'var(--glow-font-display)'}}>“Every day is a new chapter of the life you’re creating.”</p>
              <div className="paper-card tape mt-7 w-[210px] rotate-[-2deg] p-4">
                <p className="text-[10px] font-semibold text-[#5d4c46]">Today&apos;s Focus</p>
                <ul className="mt-2 space-y-1 text-[10px] text-[#5f514c]"><li>• {topTask?.title ?? 'Choose one meaningful priority'}</li><li>• Protect your energy</li><li>• Make the next action easy</li></ul>
                <Heart size={13} className="ml-auto mt-2 text-[#9b686f]"/>
              </div>
            </div>

            <div className="relative min-h-[300px]">
              <div className="absolute left-[6%] top-[4%] h-40 w-28 rounded-[60%_40%_55%_45%] bg-[#e9b8bd]/70 blur-[1px]" />
              <DecorativePhoto label="Daily Portrait" className="absolute left-[44%] top-[3%] h-[178px] w-[142px] rotate-[-4deg] grayscale"/>
              <DecorativePhoto label="Glow Mood" className="absolute right-[5%] top-[20%] h-[135px] w-[106px] rotate-[3deg]"/>
              <div className="absolute left-[22%] top-[34%] h-[182px] w-[128px] rounded-[44%_44%_22%_22%] bg-[linear-gradient(180deg,#7b6259,#d6c2b8_37%,#eee5df_38%,#f6f0eb)] shadow-[0_18px_35px_rgba(68,47,40,.18)]">
                <div className="absolute left-1/2 top-[-26px] h-16 w-16 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_50%_35%,#6b4e43,#2f241f_65%)]" />
              </div>
              <div className="absolute left-[6%] top-[48%] rounded-[3px] border border-[#d9ccc5] bg-[#f7f4ef] px-3 py-2 text-[#3e3531] shadow-sm"><p className="text-[8px] font-bold">PANTONE</p><p className="text-[15px] font-semibold leading-none">685 C</p></div>
              <div className="absolute right-[1%] top-[2%] flex h-20 w-20 items-center justify-center rounded-full border-[8px] border-white/70 bg-[#dfb2ab] shadow-md"><div className="h-10 w-10 rounded-full bg-[#c78680]"/></div>
              <div className="absolute bottom-[8%] right-[5%] flex gap-2"><div className="h-14 w-16 rounded-md border border-[#d8c8bf] bg-[#f4eee9] shadow-sm"/><div className="h-10 w-10 rounded-full bg-[#d69da6] shadow-sm"/><div className="h-10 w-10 rounded-full bg-[#e4b8b3] shadow-sm"/></div>
              <Flower2 className="absolute bottom-[7%] left-[5%] text-[#c48691]/60" size={78} strokeWidth={1}/>
            </div>
          </div>
        </section>

        <Surface className="overflow-hidden">
          <div className="grid divide-y divide-[#eadfd6] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x lg:divide-[#eadfd6]">
            <Link href="/tasks" className="flex min-h-[88px] items-center gap-3 px-4 py-3 transition hover:bg-[#fbefef]"><Star size={21} className="text-[#c97882]"/><div className="min-w-0"><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Top Priority</p><p className="mt-1 line-clamp-2 text-[13px] leading-4 text-[#332a27]" style={{fontFamily:'var(--glow-font-display)'}}>{topTask?.title ?? 'Choose your focus'}</p><p className="mt-1 text-[8px] text-[#c06572]">Due today</p></div></Link>
            <Link href="/tasks" className="flex min-h-[88px] items-center gap-3 px-4 py-3 transition hover:bg-[#fbefef]"><CheckCircle2 size={20} className="text-[#c97882]"/><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Tasks Today</p><p className="mt-1 text-[20px] text-[#332a27]" style={{fontFamily:'var(--glow-font-display)'}}>{completedTasks} / {totalTasks}</p><p className="text-[8px] text-[#8e7770]">{totalTasks?Math.round((Math.min(completedTasks,totalTasks)/totalTasks)*100):0}% completed</p></div></Link>
            <Link href="/habits" className="flex min-h-[88px] items-center gap-3 px-4 py-3 transition hover:bg-[#fff8ed]"><Crown size={20} className="text-[#b98a51]"/><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Habit Score</p><p className="mt-1 text-[20px] text-[#332a27]" style={{fontFamily:'var(--glow-font-display)'}}>{habitPercent}%</p><p className="text-[8px] text-[#8e7770]">Keep going</p></div></Link>
            <Link href="/today" className="flex min-h-[88px] items-center gap-3 px-4 py-3 transition hover:bg-[#fff8ed]"><Clock3 size={20} className="text-[#b98a51]"/><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Focus Time</p><p className="mt-1 text-[20px] text-[#332a27]" style={{fontFamily:'var(--glow-font-display)'}}>Now</p><p className="text-[8px] text-[#8e7770]">Open your Now Engine</p></div></Link>
            <Link href="/wellness" className="flex min-h-[88px] items-center gap-3 px-4 py-3 transition hover:bg-[#eff8fb] sm:col-span-2 lg:col-span-1"><Droplets size={20} className="text-[#77aac1]"/><div><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8d7972]">Water Intake</p><p className="mt-1 text-[20px] text-[#332a27]" style={{fontFamily:'var(--glow-font-display)'}}>{water} / 8</p><p className="text-[8px] text-[#8e7770]">glasses</p></div></Link>
          </div>
        </Surface>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_1.15fr_1.18fr]">
          <Surface className="overflow-hidden"><CardHeading title="Today's Plan" href="/planning" action="Plan day"/><div className="p-3">{scheduled.length?scheduled.map((item,index)=><Link href="/calendar" key={`${item.id}-${index}`} className={`grid grid-cols-[60px_1fr] gap-2 rounded-[7px] px-2.5 py-2.5 transition hover:bg-[#f8eceb] ${index===2?'bg-[#f4d9d7]/70':''}`}><p className="text-[9px] font-semibold text-[#74635e]">{item.start?time(item.start):item.note.split('–')[0]}</p><div><p className="text-[11px] font-medium text-[#3b302c]">{item.title}</p><p className="mt-0.5 line-clamp-1 text-[8px] text-[#8e7770]">{item.note}</p></div></Link>):<div className="px-3 py-8 text-center"><CalendarDays className="mx-auto text-[#cdbcb3]"/><p className="mt-2 text-[10px] text-[#8e7770]">Your day is open.</p></div>}</div></Surface>

          <Surface className="overflow-hidden bg-[#f1e3da]"><CardHeading title="Ritual of the Day" href="/beauty" action="Enter ritual"/><div className="grid min-h-[270px] grid-cols-[.9fr_1.1fr]"><div className="relative m-3 overflow-hidden rounded-[5px] bg-[linear-gradient(145deg,#6a5047,#a97e70_50%,#d7b6a6)]"><div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgba(28,18,15,.35))]"/><Sparkles className="absolute bottom-4 left-4 text-white/80" size={26}/></div><div className="flex flex-col p-4 pl-1"><p className="text-[21px] leading-5 text-[#3e312d]" style={{fontFamily:'var(--glow-font-display)'}}>{data.routinesForNow[0]?.name??data.beautyToday[0]?.name??'Sculpt & Glow'}</p><p className="mt-1 text-[8px] uppercase tracking-[.1em] text-[#8d7972]">5 min face ritual</p><div className="mt-4 space-y-2">{(data.beautyToday.length?data.beautyToday.slice(0,4).map(x=>x.name):['Prep with intention','Sculpt cheekbones','Define jawline','Relax + finish']).map(step=><p key={step} className="flex items-center gap-2 text-[9px] text-[#66544e]"><CheckCircle2 size={11} className="text-[#c6888f]"/>{step}</p>)}</div><Link href="/beauty" className="mt-auto flex items-center justify-center gap-1 rounded-[6px] bg-[#2f2522] px-3 py-2 text-[9px] text-white">Start Ritual <ArrowRight size={10}/></Link></div></div></Surface>

          <Surface className="overflow-hidden"><CardHeading title="Upcoming" href="/calendar" action="View calendar"/><div className="p-3">{upcoming.length?upcoming.map(event=><Link key={event.id} href="/calendar" className="grid grid-cols-[62px_1fr_12px] items-center gap-2 border-b border-[#eee4dd] px-2 py-3.5 last:border-0"><p className="text-[9px] font-semibold text-[#74635e]">{time(event.startAt)}</p><div><p className="text-[11px] font-medium text-[#3b302c]">{event.title}</p><p className="mt-0.5 text-[8px] text-[#8e7770]">{event.location??dateLabel(event.startAt)}</p></div><ArrowRight size={10} className="text-[#c7b6ae]"/></Link>):<p className="px-3 py-10 text-center text-[10px] text-[#8e7770]">No upcoming events yet.</p>}</div></Surface>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Surface className="overflow-hidden"><CardHeading title="Habit Tracker" href="/habits"/><div className="space-y-2 p-4">{data.habitSummary.habits.slice(0,5).map(habit=><div key={habit.id} className="flex items-center justify-between gap-3"><p className="truncate text-[9px] text-[#5d4e48]">{habit.name}</p>{habit.completedToday?<CheckCircle2 size={13} className="text-[#789678]"/>:<Circle size={13} className="text-[#cdbcb3]"/>}</div>)}<div className="pt-2"><div className="h-1.5 overflow-hidden rounded-full bg-[#eee3dc]"><div className="h-full rounded-full bg-[#d99ca3]" style={{width:`${habitPercent}%`}}/></div><p className="mt-2 text-[8px] text-[#8e7770]">{data.habitSummary.completedToday}/{data.habitSummary.totalHabits} completed</p></div></div></Surface>
          <Surface className="overflow-hidden"><CardHeading title="Workout Plan" href="/fitness"/><div className="p-3"><div className="flex h-24 items-center justify-center rounded-[5px] bg-[linear-gradient(145deg,#8f8078,#d1c2b9)]"><Dumbbell className="text-white/85" size={30}/></div><p className="mt-3 text-[13px] text-[#3b302c]" style={{fontFamily:'var(--glow-font-display)'}}>{data.workoutOfTheDay.focus||'Movement for today'}</p><p className="mt-1 line-clamp-1 text-[8px] text-[#8e7770]">{data.workoutOfTheDay.exercises.slice(0,3).join(' • ')||'Personalized around your day'}</p><Link href="/fitness" className="mt-3 block rounded-[6px] border border-[#e2d5cd] py-2 text-center text-[9px] text-[#5f504b]">Start Workout</Link></div></Surface>
          <Surface className="overflow-hidden"><CardHeading title="Beauty OS" href="/beauty"/><div className="p-3"><div className="flex h-24 items-center justify-center rounded-[5px] bg-[linear-gradient(145deg,#f2dcbf,#eac9c8,#f9f3ee)]"><Sparkles className="text-[#ae7d53]" size={30}/></div><p className="mt-3 text-[13px] text-[#3b302c]" style={{fontFamily:'var(--glow-font-display)'}}>{data.beautyToday[0]?.name??'Morning Routine'}</p><p className="mt-1 text-[8px] text-[#8e7770]">Sculpt, protect, glow</p><Link href="/beauty" className="mt-3 block rounded-[6px] border border-[#e2d5cd] py-2 text-center text-[9px] text-[#5f504b]">View Routine</Link></div></Surface>
          <Surface className="overflow-hidden"><CardHeading title="Finance Overview" href="/finance/brain"/><div className="p-4"><div className="flex items-center gap-3"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[conic-gradient(#e4a4ad_0_30%,#edd4a3_30%_55%,#b9d1b4_55%_77%,#eaded0_77%_100%)]"><div className="h-9 w-9 rounded-full bg-[#fffaf6]"/></div><div><p className="text-[8px] text-[#8e7770]">Active goals</p><p className="text-[21px] text-[#3b302c]" style={{fontFamily:'var(--glow-font-display)'}}>{data.projectStatus.goalsInProgress}</p><p className="text-[8px] text-[#668066]">{data.projectStatus.averageGoalProgress}% avg. progress</p></div></div><Link href="/finance/brain" className="mt-4 flex items-center gap-2 rounded-[6px] bg-[#eef4eb] px-3 py-2 text-[9px] text-[#5e765e]"><PiggyBank size={12}/>Go to Finance</Link></div></Surface>
        </div>

        <div className="grid gap-4 lg:grid-cols-[.8fr_2fr_1fr]">
          <Surface className="paper-card p-4"><p className="text-[15px] text-[#3f342f]" style={{fontFamily:'var(--glow-font-display)'}}>Journal Entry</p><p className="mt-1 text-[8px] text-[#9a857d]">Today</p><p className="mt-5 text-[13px] italic text-[#65544e]" style={{fontFamily:'var(--glow-font-display)'}}>Grateful for...</p><div className="mt-3 space-y-1 text-[9px] text-[#75635c]">{data.notesSummary.recentNotes.slice(0,3).map(note=><p key={note.id}>• {note.title||note.content||'A quiet thought'}</p>)}{!data.notesSummary.recentNotes.length?<><p>• Slow mornings</p><p>• Good conversations</p><p>• Room to think</p></>:null}</div><Link href="/notes" className="mt-5 inline-flex items-center gap-1 text-[9px] text-[#8d5e66]"><Plus size={10}/>New Entry</Link></Surface>
          <Link href="/resources" className="relative overflow-hidden rounded-[6px] border border-[#e7dbd2] bg-[#f5eee6] p-5 shadow-[0_10px_30px_rgba(84,62,52,.05)]"><div className="absolute inset-0 opacity-65" style={{background:'radial-gradient(circle at 15% 70%,rgba(188,145,128,.25),transparent 12%),radial-gradient(circle at 27% 52%,rgba(194,155,133,.23),transparent 10%),radial-gradient(circle at 70% 68%,rgba(150,165,130,.25),transparent 13%)'}}/><div className="relative text-center"><Flower2 className="mx-auto text-[#a88972]" size={45} strokeWidth={1}/><p className="mt-1 text-[22px] text-[#423630]" style={{fontFamily:'var(--glow-font-display)'}}>Garden Wonders Collection</p><p className="mt-2 text-[9px] text-[#857169]">Reusable routines, reset plans, references and life guides</p><span className="mt-4 inline-block rounded-[5px] bg-[#ead7cf] px-3 py-2 text-[9px] text-[#6e554e]">Explore Now</span></div></Link>
          <Link href="/world" className="overflow-hidden rounded-[6px] border border-[#e7dbd2] bg-[#f7f0ea] p-4"><div className="grid h-full grid-cols-[.8fr_1.2fr] gap-3"><div><p className="text-[18px] leading-5 text-[#3f342f]" style={{fontFamily:'var(--glow-font-display)'}}>Dream Destination</p><p className="mt-3 text-[9px] leading-4 text-[#76635d]">Travel ideas, future plans and places that belong in your Life World.</p><span className="mt-5 inline-block rounded-[5px] border border-[#e1d4cc] px-3 py-2 text-[8px] text-[#6d5952]">View Board</span></div><div className="flex items-center justify-center rounded-[4px] bg-[linear-gradient(145deg,#a6b0a0,#d7c7af,#8b786a)]"><MapPin className="text-white/85" size={28}/></div></div></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Surface className="p-4"><div className="flex items-center justify-between"><p className="text-[15px] text-[#3f342f]" style={{fontFamily:'var(--glow-font-display)'}}>Habit Tracker</p><p className="text-[8px] text-[#9a857d]">This Week</p></div><div className="mt-4 grid grid-cols-[1fr_repeat(7,15px)] gap-y-3 text-[8px] text-[#76635d]"><span/><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>{data.habitSummary.habits.slice(0,4).map(habit=><div key={habit.id} className="contents"><span className="truncate">{habit.name}</span>{Array.from({length:7}).map((_,i)=><span key={i} className={`h-3 w-3 rounded-full border border-[#cdbcb3] ${i<4&&habit.completedToday?'bg-[#a8a492]':''}`}/>)}</div>)}</div></Surface>
          <Link href="/wellness" className="rounded-[6px] border border-[#e7dbd2] bg-[#f5eee9] p-4 shadow-[0_10px_30px_rgba(84,62,52,.05)]"><p className="text-[15px] text-[#3f342f]" style={{fontFamily:'var(--glow-font-display)'}}>Wellness Essentials</p><div className="mt-4 flex h-28 items-end justify-center gap-3"><div className="h-20 w-10 rounded-t-md bg-[#6f6d64]"/><div className="h-24 w-9 rounded-t-full bg-[#d8c9be]"/><div className="h-14 w-14 rounded-xl bg-[#e1c8bf]"/></div><span className="mx-auto mt-4 block w-fit rounded-[5px] bg-[#ead6ce] px-3 py-2 text-[8px] text-[#6e554e]">Open Wellness</span></Link>
          <Link href="/world" className="rounded-[6px] border border-[#e7dbd2] bg-[#f6eee7] p-4 shadow-[0_10px_30px_rgba(84,62,52,.05)]"><p className="text-[15px] text-[#3f342f]" style={{fontFamily:'var(--glow-font-display)'}}>Pinned Inspiration</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="paper-card tape flex h-28 items-center justify-center p-3 text-center text-[18px] text-[#6d554e]" style={{fontFamily:'var(--glow-font-hand)'}}>Dream<br/>Plan<br/>Do</div><div className="h-28 rounded-[4px] bg-[linear-gradient(145deg,#d7c3b5,#eadbcf,#a99487)]"/></div></Link>
          <Surface className="relative overflow-hidden p-5"><Quote size={18} className="text-[#a67c79]"/><p className="mt-4 text-[22px] leading-8 text-[#3e312d]" style={{fontFamily:'var(--glow-font-display)'}}>“What you focus on grows.”</p><p className="mt-4 text-[8px] text-[#9a857d]">Glow reminder</p><Flower2 className="absolute bottom-2 right-2 text-[#d0a2a6]/55" size={60} strokeWidth={1}/></Surface>
        </div>

        <div className="relative overflow-hidden rounded-[6px] border border-[#e4d7cf] bg-[linear-gradient(90deg,#f3e5df,#f9f1ec,#efd7d7)] px-6 py-4 text-center"><Flower2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c69ca0]/50" size={48} strokeWidth={1}/><p className="text-[16px] italic text-[#6b514b]" style={{fontFamily:'var(--glow-font-display)'}}>You are becoming everything you prayed for.</p><div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-3"><span className="hidden text-[15px] text-[#40322f] md:block" style={{fontFamily:'var(--glow-font-display)'}}>MY <span style={{fontFamily:'var(--glow-font-hand)'}}>Universe</span></span><Link href="/memory" className="rounded-[5px] bg-[#dba8ad] px-4 py-2 text-[8px] font-medium text-white">+ New Entry</Link></div></div>
      </div>

      <aside className="space-y-4">
        <div className="px-1 text-right"><p className="text-[8px] font-medium uppercase tracking-[.1em] text-[#8d7972]">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p><p className="mt-1 text-[27px] text-[#302724]" style={{fontFamily:'var(--glow-font-display)'}}>{now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><p className="mt-1 text-[9px] text-[#7f6c66]">Your local day in Glow OS</p></div>
        <Surface className="overflow-hidden"><CardHeading title="Calendar Overview" href="/calendar" action="Full calendar"/><div className="p-4"><div className="mb-4 flex items-center justify-between"><button type="button" className="text-[#a49088]">‹</button><p className="text-[10px] font-medium text-[#66554f]">{now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p><button type="button" className="text-[#a49088]">›</button></div><div className="grid grid-cols-7 gap-1 text-center text-[8px] text-[#8e7770]">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}-${i}`} className="py-1">{d}</span>)}{Array.from({length:28}).map((_,index)=>{const day=index+1;const active=day===now.getDate();return <span key={day} className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full ${active?'bg-[#d49aa0] text-white':'text-[#6f5d57]'}`}>{day}</span>})}</div><div className="mt-4 space-y-2">{upcoming.slice(0,3).map((event,index)=><Link key={event.id} href="/calendar" className={`block rounded-[6px] px-3 py-3 ${index===0?'bg-[#f2cfd1]':index===1?'bg-[#ddd8e8]':'bg-[#efddcf]'}`}><p className="text-[9px] font-medium text-[#4c3e39]">{event.title}</p><p className="mt-0.5 text-[8px] text-[#76645d]">{time(event.startAt)}</p></Link>)}</div><Link href="/calendar" className="mt-3 block rounded-[5px] border border-[#e4d8d0] py-2 text-center text-[8px] text-[#66544e]">Open Full Calendar</Link></div></Surface>

        <Surface className="overflow-hidden"><CardHeading title="Morning Soundscape" href="/resources" action="Open library"/><div className="p-4"><div className="flex items-center gap-2 text-[#5f504b]"><Music2 size={15}/><p className="text-[10px]">Mood + focus audio</p></div><p className="mt-3 text-[9px] leading-5 text-[#8e7770]">No playlist is hard-coded. Save your preferred music or sound resources in the Resource Library and open them from here.</p><Link href="/resources" className="mt-3 inline-flex items-center gap-1 text-[9px] text-[#8f5f67]">Choose soundscape <ArrowRight size={10}/></Link></div></Surface>

        <Surface className="overflow-hidden"><CardHeading title="Top Tasks" href="/tasks" action="All tasks"/><div className="p-3">{data.topPriorityTasks.slice(0,6).map((task,index)=><Link href="/tasks" key={task.id} className="flex items-center gap-2 border-b border-[#eee4dd] px-1 py-3 last:border-0"><Circle size={12} className="shrink-0 text-[#cdbcb3]"/><span className="min-w-0 flex-1 truncate text-[9px] text-[#5d4e48]">{task.title}</span>{index===0?<Star size={11} className="fill-[#b98a51] text-[#b98a51]"/>:null}</Link>)}{!data.topPriorityTasks.length?<p className="px-2 py-5 text-center text-[9px] text-[#8e7770]">Your priority list is clear.</p>:null}<Link href="/tasks" className="mt-2 flex items-center gap-2 px-1 py-2 text-[9px] text-[#a6606c]">＋ Add new task</Link></div></Surface>

        <Surface className="overflow-hidden"><CardHeading title="Connected World" href="/connections" action="Manage"/><div className="grid grid-cols-2 gap-2 p-3">{[['Calendar',CalendarDays,'/calendar'],['Gmail',NotebookText,'/gmail'],['Reminders',ListChecks,'/connections'],['Notes',BookOpen,'/notes']].map(([label,Icon,href])=>{const I=Icon as typeof CalendarDays;return <Link key={String(label)} href={String(href)} className="rounded-[6px] bg-[#f7f0eb] p-3 text-center"><I size={14} className="mx-auto text-[#a66f76]"/><p className="mt-1 text-[8px] text-[#705d57]">{String(label)}</p></Link>})}</div></Surface>
      </aside>
    </div>
  </div>;
}
