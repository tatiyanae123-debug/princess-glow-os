'use client';

import Link from 'next/link';
import { AlarmClock, ArrowRight, CalendarDays, CheckCircle2, Droplets, Flag, Moon, Sparkles } from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { Card } from '@/components/ui/card';

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function priorityTone(priority: string) {
  if (priority === 'urgent' || priority === 'high') return { label: `● High`, tone: 'text-[#C15C63]' };
  if (priority === 'medium') return { label: '● Medium', tone: 'text-[#B08B4F]' };
  return { label: '● Low', tone: 'text-[#6E8064]' };
}

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening';
  const name = userName ?? 'there';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const scheduled = [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const nextEvent = scheduled[0] ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;

  return (
    <div className="space-y-5">
      {error ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-800">Live data is reconnecting. Showing what Glow OS can confirm right now.</div> : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_.85fr]">
        <div className="flex flex-col justify-center">
          <p className="glow-display text-[40px] leading-[1.05] text-[#2B2420] sm:text-[46px]">Good {greeting}, <em className="text-[#C9727E] not-italic">{name}</em></p>
          <p className="mt-3 text-[14px] text-[#8A8078]">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <EditableRoomImage slot="dashboard:hero" label="Dashboard hero" className="min-h-[210px] rounded-[20px] lg:min-h-[240px]" />
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#8A8078]">Today at a Glance</p>
        <Link href="/planning" className="text-[12px] font-medium text-[#C9727E]">See all</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_.9fr_.9fr]">
        <Card className="rounded-[20px] border-[#F1E7E3] p-5 shadow-[0_1px_3px_rgba(60,40,30,.03)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2B2420]"><CalendarDays size={15} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Today at a Glance</p></div>
            <span className="text-[11px] text-[#9A9088]">{scheduled.length} event{scheduled.length === 1 ? '' : 's'}</span>
          </div>
          <div className="mt-3 divide-y divide-[#F4ECE8]">
            {scheduled.length === 0 ? <p className="py-6 text-center text-[12px] text-[#9A9088]">Nothing scheduled yet today.</p> : scheduled.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9727E]" />
                <span className="w-[80px] shrink-0 text-[#9A9088]">{event.allDay ? 'All day' : fmtTime(event.startAt)}</span>
                <span className="min-w-0 flex-1 truncate text-[#3A332E]">{event.title}</span>
                {event.endAt ? <span className="shrink-0 text-[11px] text-[#B5ACA5]">{Math.max(1, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60000))} min</span> : null}
              </div>
            ))}
          </div>
          <Link href="/calendar" className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-[#C9727E]">View full calendar <ArrowRight size={11} /></Link>
        </Card>

        <Card className="rounded-[20px] border-[#F1E7E3] p-5 shadow-[0_1px_3px_rgba(60,40,30,.03)]">
          <div className="flex items-center gap-2 text-[#9A9088]"><Flag size={14} className="text-[#C9727E]" /><p className="text-[11px] font-medium uppercase tracking-[.1em]">Top Priority</p></div>
          {topTask ? (
            <>
              <p className="glow-display mt-3 text-[19px] leading-tight text-[#2B2420]">{topTask.title}</p>
              <p className={`mt-3 text-[12px] font-medium ${priorityTone('priority' in topTask ? topTask.priority : 'medium').tone}`}>{priorityTone('priority' in topTask ? topTask.priority : 'medium').label}</p>
              {'dueDate' in topTask && topTask.dueDate ? <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#9A9088]"><CalendarDays size={11} />Due {topTask.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p> : null}
              <Link href="/tasks?view=now" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#C9727E]">Open in Tasks <ArrowRight size={11} /></Link>
            </>
          ) : <p className="mt-4 text-[12px] text-[#9A9088]">No priority task yet — add one in Tasks.</p>}
        </Card>

        <Card className="rounded-[20px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
          <div className="flex items-center gap-2 text-[#B15A68]"><Sparkles size={14} /><p className="text-[11px] font-medium uppercase tracking-[.1em]">Glow Insight</p></div>
          <p className="glow-display mt-4 text-[16px] leading-6 text-[#4A3238]">{insight ?? 'Discipline today, freedom tomorrow.'}</p>
          <Link href="/brain" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#B15A68]">Explore more insights <ArrowRight size={11} /></Link>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="overflow-hidden rounded-[20px] border-[#F1E7E3] p-0">
          <EditableRoomImage slot="dashboard:brief" label="Morning brief" className="min-h-[130px]" />
          <div className="p-5">
            <div className="flex items-center gap-2 text-[#2B2420]"><AlarmClock size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Morning Brief</p></div>
            <div className="mt-3 space-y-2.5">
              {wellness?.sleepHours != null ? <p className="flex items-center gap-2 text-[12.5px] text-[#4A4440]"><CheckCircle2 size={13} className="shrink-0 text-[#C9727E]" />You slept for {wellness.sleepHours}h{wellness.sleepHours >= 7 ? ' — great recovery!' : ''}</p> : null}
              {routine ? <p className="flex items-center gap-2 text-[12.5px] text-[#4A4440]"><CheckCircle2 size={13} className="shrink-0 text-[#C9727E]" />{routine.name} is scheduled for {routine.timeOfDay}</p> : null}
              <p className="flex items-center gap-2 text-[12.5px] text-[#4A4440]"><CheckCircle2 size={13} className="shrink-0 text-[#C9727E]" />{data.todayOverview.tasksDueToday} task{data.todayOverview.tasksDueToday === 1 ? '' : 's'} scheduled today</p>
              <p className="flex items-center gap-2 text-[12.5px] text-[#4A4440]"><CheckCircle2 size={13} className="shrink-0 text-[#C9727E]" />Take a deep breath. You&apos;ve got this.</p>
            </div>
            <Link href="/briefings" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#C9727E]">View full brief <ArrowRight size={11} /></Link>
          </div>
        </Card>

        <Card className="rounded-[20px] border-[#F1E7E3] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2B2420]"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Wellness Snapshot</p></div>
            <Link href="/wellness" className="text-[12px] font-medium text-[#C9727E]">See all</Link>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E9E4F2] text-[#7C6B9C]"><Moon size={16} /></span>
              <p className="glow-display text-[15px] text-[#2B2420]">{wellness?.sleepHours != null ? `${wellness.sleepHours}h` : '—'}</p>
              <p className="text-[10px] text-[#9A9088]">Sleep</p>
              <p className="text-[9px] font-medium text-[#6E8064]">{wellness?.sleepHours != null ? (wellness.sleepHours >= 7 ? 'Good' : 'Low') : 'Not logged'}</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Droplets size={16} /></span>
              <p className="glow-display text-[15px] text-[#2B2420]">{wellness?.waterGlasses ?? '—'}</p>
              <p className="text-[10px] text-[#9A9088]">Water</p>
              <p className="text-[9px] font-medium text-[#B08B4F]">{wellness?.waterGlasses != null ? (wellness.waterGlasses >= 6 ? 'On Track' : 'Log more') : 'Not logged'}</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F1E8D9] text-[#B08B4F]"><Sparkles size={16} /></span>
              <p className="glow-display text-[15px] capitalize text-[#2B2420]">{wellness?.energy ?? '—'}</p>
              <p className="text-[10px] text-[#9A9088]">Energy</p>
              <p className="text-[9px] font-medium text-[#6E8064]">{wellness ? 'Logged' : 'Check in'}</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E4EBDD] text-[#6E8064]"><CheckCircle2 size={16} /></span>
              <p className="glow-display text-[15px] capitalize text-[#2B2420]">{wellness?.mood ?? '—'}</p>
              <p className="text-[10px] text-[#9A9088]">Mood</p>
              <p className="text-[9px] font-medium text-[#6E8064]">{wellness ? 'Logged' : 'Check in'}</p>
            </div>
          </div>
          {!wellness ? <Link href="/wellness" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#C9727E]">Log today&apos;s check-in <ArrowRight size={11} /></Link> : null}
        </Card>
      </div>
    </div>
  );
}
