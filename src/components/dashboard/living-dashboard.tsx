'use client';

import Link from 'next/link';
import { AlarmClock, ArrowRight, CalendarDays, CheckCircle2, Dumbbell, Droplets, Flag, Inbox, Link2, Moon, NotebookPen, Sparkles } from 'lucide-react';
import type { LivingDashboardData, GoogleWidgetStatus } from '@/lib/dashboard/types';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { Card } from '@/components/ui/card';

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function priorityTone(priority: string) {
  if (priority === 'urgent' || priority === 'high') return { label: '● High', tone: 'text-[#C15C63]' };
  if (priority === 'medium') return { label: '● Medium', tone: 'text-[#B08B4F]' };
  return { label: '● Low', tone: 'text-[#6E8064]' };
}

const STATUS_COPY: Record<GoogleWidgetStatus, { label: string; tone: string; dot: string }> = {
  connected: { label: 'Connected', tone: 'text-[#5A6E52]', dot: 'bg-[#5A6E52]' },
  not_connected: { label: 'Not connected', tone: 'text-[#9A9088]', dot: 'bg-[#C9C2BB]' },
  insufficient_scope: { label: 'Needs permission', tone: 'text-[#9A7A3D]', dot: 'bg-[#9A7A3D]' },
  revoked: { label: 'Access revoked', tone: 'text-[#9A7A3D]', dot: 'bg-[#9A7A3D]' },
  error: { label: 'Temporarily unavailable', tone: 'text-[#B15A68]', dot: 'bg-[#B15A68]' },
};

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening';
  const name = userName ?? 'there';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const scheduled = [...data.todaySchedule.events].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const workSlots = data.todaySchedule.workSlots;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const googleStatus = STATUS_COPY[data.googleCalendar.status];
  const gmailStatus = STATUS_COPY[data.gmailInbox.status];

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-[16px] border border-[#F1E8D9] bg-[#FDF6F1] p-4 text-[12px] text-[#9A7A3D]">Live data is reconnecting. Showing what Glow OS can confirm right now.</div> : null}

      <section className="grid gap-5 lg:grid-cols-[1.1fr_.85fr]">
        <div className="flex flex-col justify-center">
          <p className="glow-eyebrow">{data.weekTheme.title}</p>
          <p className="glow-display mt-2 text-[38px] leading-[1.05] text-[#2B2420] sm:text-[46px]">Good {greeting}, <em className="text-[#C9727E] not-italic">{name}</em></p>
          <p className="mt-3 text-[13px] text-[#8A8078]">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="mt-4 max-w-[46ch] text-[13px] italic leading-5 text-[#8A8078]">&ldquo;{data.weekTheme.note}&rdquo;</p>
        </div>
        <EditableRoomImage slot="dashboard:hero" label="Dashboard hero" className="min-h-[190px] rounded-[20px] lg:min-h-[220px]" />
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="rounded-[16px] border-[#F1E7E3] p-4 text-center"><p className="glow-display text-[24px] text-[#2B2420]">{data.todayOverview.tasksDueToday}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Due today</p></Card>
        <Card className="rounded-[16px] border-[#F1E7E3] p-4 text-center"><p className="glow-display text-[24px] text-[#2B2420]">{data.todayOverview.eventsToday}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Events today</p></Card>
        <Card className="rounded-[16px] border-[#F1E7E3] p-4 text-center"><p className="glow-display text-[24px] text-[#2B2420]">{data.habitSummary.completedToday}<span className="text-[14px] text-[#B5ACA5]">/{data.habitSummary.totalHabits}</span></p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Habits done</p></Card>
        <Card className="rounded-[16px] border-[#F1E7E3] p-4 text-center"><p className="glow-display text-[24px] text-[#2B2420]">{data.todayOverview.activeGoals}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Goals active</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_.9fr]">
        <div className="space-y-4">
          <Card className="rounded-[20px] border-[#F1E7E3] p-5 shadow-[0_1px_3px_rgba(60,40,30,.03)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2B2420]"><CalendarDays size={15} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Today at a Glance</p></div>
              <span className="text-[11px] text-[#9A9088]">{scheduled.length} event{scheduled.length === 1 ? '' : 's'}</span>
            </div>
            <div className="mt-3 divide-y divide-[#F4ECE8]">
              {scheduled.length === 0 && workSlots.length === 0 ? <p className="py-6 text-center text-[12px] text-[#9A9088]">Nothing scheduled yet today.</p> : (
                <>
                  {scheduled.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9727E]" />
                      <span className="w-[80px] shrink-0 text-[#9A9088]">{event.allDay ? 'All day' : fmtTime(event.startAt)}</span>
                      <span className="min-w-0 flex-1 truncate text-[#3A332E]">{event.title}</span>
                      {event.endAt ? <span className="shrink-0 text-[11px] text-[#B5ACA5]">{Math.max(1, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60000))} min</span> : null}
                    </div>
                  ))}
                  {workSlots.slice(0, 2).map((slot) => (
                    <div key={slot.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#7C6B9C]" />
                      <span className="w-[80px] shrink-0 text-[#9A9088]">{slot.startTime}</span>
                      <span className="min-w-0 flex-1 truncate text-[#3A332E]">{slot.title}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">Work</span>
                    </div>
                  ))}
                </>
              )}
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
        </div>

        <div className="space-y-4">
          <Card className="rounded-[20px] border-none bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
            <div className="flex items-center gap-2 text-[#B15A68]"><Sparkles size={14} /><p className="text-[11px] font-medium uppercase tracking-[.1em]">Glow Insight</p></div>
            <p className="glow-display mt-4 text-[16px] leading-6 text-[#4A3238]">{insight ?? 'Discipline today, freedom tomorrow.'}</p>
            <Link href="/brain" className="mt-4 inline-flex items-center gap-1 text-[12px] font-medium text-[#B15A68]">Explore more insights <ArrowRight size={11} /></Link>
          </Card>

          <Card className="rounded-[20px] border-[#F1E7E3] p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#2B2420]"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium">Wellness Snapshot</p></div>
              <Link href="/wellness" className="text-[12px] font-medium text-[#C9727E]">See all</Link>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-[18px] border-[#F1E7E3] p-4">
          <div className="flex items-center justify-between"><p className="text-[11px] font-medium uppercase tracking-[.1em] text-[#9A9088]">Habits Today</p><Link href="/habits" className="text-[11px] font-medium text-[#C9727E]">Open</Link></div>
          {data.habitSummary.habits.length === 0 ? <p className="mt-3 text-[11.5px] text-[#9A9088]">No habits tracked yet.</p> : (
            <div className="mt-3 space-y-1.5">
              {data.habitSummary.habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center gap-2 text-[12px]">
                  <CheckCircle2 size={12} className={habit.completedToday ? 'shrink-0 text-[#5A6E52]' : 'shrink-0 text-[#D9D2CB]'} />
                  <span className={`min-w-0 flex-1 truncate ${habit.completedToday ? 'text-[#3A332E]' : 'text-[#9A9088]'}`}>{habit.name}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="rounded-[18px] border-[#F1E7E3] p-4">
          <div className="flex items-center justify-between"><p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-[#9A9088]"><NotebookPen size={12} />Notes</p><Link href="/notes" className="text-[11px] font-medium text-[#C9727E]">Open</Link></div>
          {data.notesSummary.recentNotes.length === 0 ? <p className="mt-3 text-[11.5px] text-[#9A9088]">No notes yet.</p> : (
            <div className="mt-3 space-y-1.5">
              {data.notesSummary.recentNotes.slice(0, 3).map((note) => (
                <p key={note.id} className="truncate text-[12px] text-[#3A332E]">{note.pinned ? '📌 ' : ''}{note.title || 'Untitled note'}</p>
              ))}
            </div>
          )}
          {data.beautyToday.length > 0 ? <p className="mt-3 border-t border-[#F1E7E3] pt-2 text-[10.5px] leading-4 text-[#9A9088]">{data.beautyToday.length} beauty step{data.beautyToday.length === 1 ? '' : 's'} for this time of day</p> : null}
        </Card>

        <Card className="rounded-[18px] border-[#F1E7E3] p-4">
          <div className="flex items-center justify-between"><p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-[#9A9088]"><Dumbbell size={12} />Workout of the Day</p><Link href="/fitness" className="text-[11px] font-medium text-[#C9727E]">Open</Link></div>
          <p className="glow-display mt-2 text-[15px] text-[#2B2420]">{data.workoutOfTheDay.label}</p>
          <p className="mt-1 text-[11px] text-[#9A9088]">{data.workoutOfTheDay.focus}</p>
          {data.workoutOfTheDay.exercises.length > 0 ? <p className="mt-2 truncate text-[10.5px] leading-4 text-[#B5ACA5]">{data.workoutOfTheDay.exercises.slice(0, 3).join(' · ')}</p> : null}
        </Card>
      </div>

      <Card className="rounded-[18px] border-[#F1E7E3] p-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.1em] text-[#9A9088]"><Link2 size={12} />Connections</p>
          <Link href="/connections" className="flex items-center gap-2 text-[12px]"><span className={`h-1.5 w-1.5 rounded-full ${googleStatus.dot}`} />Google Calendar <span className={googleStatus.tone}>{googleStatus.label}</span></Link>
          <Link href="/gmail" className="flex items-center gap-2 text-[12px]"><span className={`h-1.5 w-1.5 rounded-full ${gmailStatus.dot}`} />Gmail <span className={gmailStatus.tone}>{gmailStatus.label}</span>{data.gmailInbox.status === 'connected' && data.gmailInbox.unreadCount > 0 ? <span className="text-[#9A9088]">· {data.gmailInbox.unreadCount} unread</span> : null}</Link>
          <Link href="/import" className="ml-auto flex items-center gap-1.5 text-[12px] text-[#9A9088]"><Inbox size={12} />{data.importStatus.totalConfirmed} item{data.importStatus.totalConfirmed === 1 ? '' : 's'} imported{data.importStatus.lastImportAt ? ` · last ${data.importStatus.lastImportAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</Link>
        </div>
      </Card>

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
    </div>
  );
}
