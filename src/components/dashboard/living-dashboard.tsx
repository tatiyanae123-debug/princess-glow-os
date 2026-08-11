'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  Droplets,
  Heart,
  ListChecks,
  PiggyBank,
  Sparkles,
  Star,
  SunMedium,
} from 'lucide-react';
import { MoodBoard } from '@/components/dashboard/mood-board';
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
  return <section className={`overflow-hidden rounded-[12px] border border-[#eaded6] bg-[#fffaf6]/72 shadow-[0_12px_36px_rgba(91,62,53,.045)] backdrop-blur-[2px] ${className}`}>{children}</section>;
}

function Heading({ title, href, action = 'View all' }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#eee3dc] px-4 py-3">
      <h2 className="text-[9px] font-semibold uppercase tracking-[.13em] text-[#594a44]">{title}</h2>
      {href ? <Link href={href} className="text-[8px] text-[#a27b79] hover:text-[#bd727c]">{action}</Link> : null}
    </div>
  );
}

function Stat({ href, icon, label, value, note }: { href: string; icon: React.ReactNode; label: string; value: string; note: string }) {
  return (
    <Link href={href} className="group flex min-h-[78px] items-center gap-3 px-4 py-3 transition hover:bg-[#faefed]/70">
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[7px] font-semibold uppercase tracking-[.13em] text-[#917d75]">{label}</p>
        <p className="glow-display mt-1 truncate text-[17px] leading-5 text-[#342a27]">{value}</p>
        <p className="mt-1 truncate text-[8px] text-[#927f77]">{note}</p>
      </div>
    </Link>
  );
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
  ].slice(0, 5);
  const upcoming = [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 4);
  const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <div className="mx-auto w-full max-w-[1500px] animate-fade-in">
      {error ? <div className="mb-4 rounded-[10px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs text-amber-900">Glow OS is showing the safe dashboard while live data reconnects: {error}</div> : null}

      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
        <div className="min-w-0">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="glow-display text-[34px] leading-none tracking-[-.04em] text-[#322824] sm:text-[42px]">Good {greeting},</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="glow-hand text-[55px] leading-none text-[#76524d] sm:text-[64px]">Tatiyana</p>
                <Crown size={18} className="text-[#b58c58]" />
              </div>
              <p className="mt-5 max-w-xl text-[10px] leading-5 text-[#725f57]">{data.greeting.message || 'Anchor one priority early and keep your pace intentional.'}</p>
              <p className="glow-display mt-3 text-[12px] italic text-[#6a554f]">“Every day is a new chapter of the life you’re creating.”</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/briefings" className="rounded-full border border-[#e6d7cf] bg-white/55 p-2.5 text-[#775f57]"><Sparkles size={15}/></Link>
              <Link href="/settings" className="rounded-full border border-[#e6d7cf] bg-white/55 p-2.5 text-[#775f57]"><SunMedium size={15}/></Link>
            </div>
          </div>

          <Surface className="relative min-h-[420px] bg-[linear-gradient(135deg,#fbf3ee,#f5e7e2_65%,#f3dedf)] p-3 sm:p-4">
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_82%_15%,rgba(255,255,255,.75),transparent_25%),radial-gradient(circle_at_15%_88%,rgba(229,190,194,.2),transparent_30%)]" />
            <div className="relative h-full min-h-[390px]">
              <MoodBoard />
            </div>
          </Surface>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <Surface className="p-4">
            <p className="glow-display text-[25px] leading-none text-[#342a27]">{now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p>
            <p className="mt-2 text-[9px] text-[#7d6b64]">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
            <div className="mt-4 flex items-center gap-2 border-t border-[#eee3dc] pt-3 text-[9px] text-[#6f5d56]"><SunMedium size={16} className="text-[#b78d59]"/><span>Weather · open details</span></div>
          </Surface>

          <Surface className="p-4">
            <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#8c7770]">Today&apos;s Focus</p>
            <div className="mt-3 space-y-3">
              {[topTask?.title ?? 'Choose one meaningful priority','Discipline over pressure','Soft life, clear actions'].map((item)=><div key={item} className="flex items-start gap-2 text-[9px] leading-4 text-[#5f4e48]"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#cf8e96]"/><span>{item}</span></div>)}
            </div>
          </Surface>

          <Surface className="p-4">
            <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#8c7770]">Ritual of the Day</p>
            <p className="glow-display mt-3 text-[17px] text-[#3e312d]">{data.routinesForNow[0]?.name ?? data.beautyToday[0]?.name ?? 'Evening Wind-Down'}</p>
            <p className="mt-1 text-[8px] text-[#8e7770]">Your current ritual, ready when you are.</p>
            <div className="mt-4 h-2 rounded-full bg-[#eadfda]"><div className="h-full w-[72%] rounded-full bg-[#d58f9a]"/></div>
            <Link href="/beauty" className="mt-4 flex items-center justify-center gap-1 rounded-[7px] bg-[#d58f9a] px-3 py-2.5 text-[9px] font-medium text-white">Continue Ritual <ArrowRight size={10}/></Link>
          </Surface>
        </div>
      </div>

      <Surface className="mb-4">
        <div className="grid divide-y divide-[#eee3dc] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x lg:divide-[#eee3dc]">
          <Stat href="/tasks" icon={<Star size={20} className="text-[#c77d86]"/>} label="Top Priority" value={topTask?.title ?? 'Choose your focus'} note="Due today"/>
          <Stat href="/tasks" icon={<ListChecks size={20} className="text-[#b98377]"/>} label="Tasks Today" value={`${completedTasks} / ${totalTasks}`} note={`${totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete`}/>
          <Stat href="/habits" icon={<Sparkles size={20} className="text-[#c77784]"/>} label="Habit Score" value={`${habitPercent}%`} note="Keep your rhythm"/>
          <Stat href="/planning" icon={<Clock3 size={20} className="text-[#c28a72]"/>} label="Focus Time" value="Plan" note="Shape your next block"/>
          <Stat href="/wellness" icon={<Droplets size={20} className="text-[#83afc0]"/>} label="Water" value={`${water} / 8`} note="glasses"/>
        </div>
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_1.05fr]">
        <Surface>
          <Heading title="Today's Plan" href="/planning" action="View full plan"/>
          <div className="p-3">
            {scheduled.length ? scheduled.map((item,index)=><Link href="/calendar" key={`${item.id}-${index}`} className="grid grid-cols-[56px_1fr] gap-2 rounded-[7px] px-2 py-2.5 transition hover:bg-[#f9ecec]"><p className="text-[8px] font-semibold text-[#77645d]">{item.start ? time(item.start) : item.note.split('–')[0]}</p><div><p className="text-[9px] font-medium text-[#3b302c]">{item.title}</p><p className="mt-0.5 truncate text-[7px] text-[#917d75]">{item.note}</p></div></Link>) : <p className="px-3 py-8 text-center text-[9px] text-[#917d75]">Your day is open.</p>}
          </div>
        </Surface>

        <Surface>
          <Heading title="Upcoming" href="/calendar" action="View calendar"/>
          <div className="p-3">
            {upcoming.length ? upcoming.map((event)=><Link key={event.id} href="/calendar" className="grid grid-cols-[54px_1fr_12px] items-center gap-2 border-b border-[#eee5df] px-2 py-3 last:border-0"><p className="text-[8px] font-semibold text-[#77645d]">{time(event.startAt)}</p><div><p className="text-[9px] font-medium text-[#3b302c]">{event.title}</p><p className="mt-0.5 text-[7px] text-[#917d75]">{event.location ?? dateLabel(event.startAt)}</p></div><ArrowRight size={9} className="text-[#c7b6ae]"/></Link>) : <p className="px-3 py-8 text-center text-[9px] text-[#917d75]">Nothing urgent coming up.</p>}
          </div>
        </Surface>

        <Surface>
          <Heading title="Today's Meals" href="/food" action="View meal plan"/>
          <div className="space-y-2 p-4">
            {[['Breakfast','Plan breakfast'],['Lunch','Plan lunch'],['Dinner','Plan dinner']].map(([meal,label])=><Link href="/food" key={meal} className="flex items-center gap-3 rounded-[8px] bg-[#faf0eb]/65 p-2.5"><div className="h-9 w-9 rounded-[8px] bg-[radial-gradient(circle_at_35%_35%,#efd2b4,transparent_30%),linear-gradient(145deg,#d9b69b,#8f745f)]"/><div><p className="text-[7px] uppercase tracking-[.12em] text-[#9b8074]">{meal}</p><p className="mt-0.5 text-[9px] font-medium text-[#4a3b35]">{label}</p></div></Link>)}
          </div>
        </Surface>

        <Surface>
          <Heading title="Habit Tracker" href="/habits" action="View habits"/>
          <div className="p-4">
            <div className="space-y-3">
              {['Morning Routine','Workout','Water','Skincare AM','No Spend Day'].map((habit,index)=><div key={habit} className="grid grid-cols-[1fr_auto] items-center gap-3"><p className="text-[8px] text-[#5f4e48]">{habit}</p><div className="flex gap-1">{Array.from({length:6}).map((_,i)=><span key={i} className={`h-3 w-3 rounded-full border ${i < Math.max(1, Math.min(6, Math.round((habitPercent/100)*6) + (index%2))) ? 'border-[#cf9299] bg-[#dfa5aa]' : 'border-[#ddcec8] bg-transparent'}`}/>)}</div></div>)}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#eee3dc] pt-3"><p className="text-[8px] text-[#8f7a73]">Today</p><p className="glow-display text-[17px] text-[#4b3a35]">{habitPercent}%</p></div>
          </div>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_.85fr]">
        <Surface className="p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#d88f99] text-white"><Sparkles size={17}/></div>
              <div><p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#7c6760]">Glow Intelligence</p><p className="mt-1 text-[10px] leading-5 text-[#51413b]">You have a full life system around you. Use Brain to decide the next best move without searching every room.</p></div>
            </div>
            <Link href="/brain" className="shrink-0 rounded-[7px] bg-[#d58f9a] px-5 py-2.5 text-center text-[9px] font-medium text-white">Do It For Me ✨</Link>
          </div>
        </Surface>

        <Surface className="p-4">
          <div className="flex flex-wrap gap-2">
            {[['Build My Day','/planning'],['Plan My Meals','/food'],['Grocery List','/food'],['Prepare My Reset','/routines']].map(([label,href])=><Link key={label} href={href} className="rounded-full border border-[#e6d7cf] bg-white/55 px-3 py-2 text-[8px] text-[#806861] transition hover:bg-[#f7e8e7]">{label}</Link>)}
          </div>
        </Surface>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Surface className="p-4"><p className="text-[8px] uppercase tracking-[.13em] text-[#8f7972]">Workout Plan</p><p className="glow-display mt-2 text-[17px] text-[#3e312d]">{data.workoutOfTheDay.label || 'Movement for today'}</p><p className="mt-2 text-[8px] leading-4 text-[#857069]">{data.workoutOfTheDay.focus || 'Open Fitness to choose the session that fits your time and energy.'}</p><Link href="/fitness" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#b07078]">Start workout <ArrowRight size={9}/></Link></Surface>
        <Surface className="p-4"><p className="text-[8px] uppercase tracking-[.13em] text-[#8f7972]">Beauty OS</p><p className="glow-display mt-2 text-[17px] text-[#3e312d]">Today&apos;s beauty ritual</p><p className="mt-2 text-[8px] leading-4 text-[#857069]">{data.beautyToday.length ? `${data.beautyToday.length} beauty steps are ready.` : 'Your beauty room is ready for today.'}</p><Link href="/beauty" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#b07078]">View routine <ArrowRight size={9}/></Link></Surface>
        <Surface className="p-4"><p className="text-[8px] uppercase tracking-[.13em] text-[#8f7972]">Finance Overview</p><div className="mt-3 flex items-center gap-3"><PiggyBank size={28} className="text-[#9cae92]"/><div><p className="glow-display text-[17px] text-[#3e312d]">Money room</p><p className="text-[8px] text-[#857069]">Budget, spending and savings live together.</p></div></div><Link href="/finance" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#b07078]">View finances <ArrowRight size={9}/></Link></Surface>
        <Surface className="p-4"><p className="text-[8px] uppercase tracking-[.13em] text-[#8f7972]">Tomorrow Preview</p><div className="mt-3 flex items-center gap-3"><CalendarDays size={26} className="text-[#b28d79]"/><div><p className="glow-display text-[17px] text-[#3e312d]">Prepare gently</p><p className="text-[8px] text-[#857069]">Move unfinished work and protect tomorrow.</p></div></div><Link href="/tomorrow" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#b07078]">Prepare tomorrow <ArrowRight size={9}/></Link></Surface>
      </div>

      <Surface className="mt-4 bg-[linear-gradient(90deg,#f1dfda,#fbf5ef,#f2e0dc)] px-5 py-4">
        <div className="flex items-center justify-center gap-3 text-center"><Heart size={13} className="text-[#b8757e]"/><p className="glow-display text-[14px] italic text-[#624f48]">You are becoming everything you prayed for.</p><Heart size={13} className="text-[#b8757e]"/></div>
      </Surface>
    </div>
  );
}
