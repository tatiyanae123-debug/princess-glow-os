'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarDays, Check, Leaf, Moon } from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtClock(value: string) {
  const [rawHour, rawMinute = '00'] = value.split(':');
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return value;
  const minute = Number(rawMinute);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(Number.isFinite(minute) ? minute : 0).padStart(2, '0')} ${suffix}`;
}

function dateLabel(value: Date | null | undefined, now: Date) {
  if (!value) return null;
  const target = new Date(value);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = Math.round((targetDay.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return `Due today${fmtTime(target) ? ` at ${fmtTime(target)}` : ''}`;
  if (diff === 1) return `Due tomorrow${fmtTime(target) ? ` at ${fmtTime(target)}` : ''}`;
  return `Due ${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function LivingDashboard({ data, error, userName }: { data: LivingDashboardData; error?: string; userName?: string | null }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
  const firstName = userName?.trim().split(/\s+/)[0] || 'there';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const nextEvent = [...data.todaySchedule.events]
    .filter((event) => event.endAt ? event.endAt.getTime() >= now.getTime() : event.startAt.getTime() >= now.getTime())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const water = wellness?.waterGlasses ?? null;
  const energy = wellness?.energy ?? null;
  const mood = wellness?.mood ?? null;
  const sleep = wellness?.sleepHours ?? null;

  const scheduleRows = [
    ...data.todaySchedule.events.map((event) => ({
      key: `event-${event.id}`,
      sort: event.startAt.getHours() * 60 + event.startAt.getMinutes(),
      time: event.allDay ? 'All day' : fmtTime(event.startAt) ?? '',
      title: event.title,
      href: '/calendar',
      featured: nextEvent?.id === event.id,
    })),
    ...data.todaySchedule.workSlots.map((slot) => {
      const [hour = '0', minute = '0'] = slot.startTime.split(':');
      return {
        key: `work-${slot.id}`,
        sort: Number(hour) * 60 + Number(minute),
        time: fmtClock(slot.startTime),
        title: slot.title,
        href: '/planning',
        featured: false,
      };
    }),
  ].sort((a, b) => a.sort - b.sort).slice(0, 4);

  const urgentTask = data.topPriorityTasks.find((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).getTime();
    return due.getTime() < tomorrowEnd;
  });
  const alert = urgentTask
    ? { title: urgentTask.title, detail: dateLabel(urgentTask.dueDate, now) ?? 'Needs attention', href: '/tasks' }
    : data.gmailInbox.status === 'connected' && data.gmailInbox.unreadCount > 0
      ? { title: `${data.gmailInbox.unreadCount} unread ${data.gmailInbox.unreadCount === 1 ? 'message' : 'messages'}`, detail: 'Review Gmail intelligence', href: '/gmail' }
      : { title: 'No urgent alerts', detail: 'Your attention queue is clear', href: '/briefings' };

  const completionRate = data.habitSummary.totalHabits
    ? Math.round((data.habitSummary.completedToday / data.habitSummary.totalHabits) * 100)
    : null;

  return (
    <div className="dashboard" data-dashboard-reference>
      {error ? <div className="dashboard-error">Live data is reconnecting. Actions remain available while Glow OS retries the connection.</div> : null}

      <section className="dashboard-greeting">
        <h1>Good {greeting}, <em>{firstName}</em></h1>
        <p>{data.greeting.message}</p>
      </section>

      <div className="dashboard-section-heading"><b>TODAY AT A GLANCE</b><Link href="/planning">See all</Link></div>
      <section className="glance-grid">
        <article className="glance-card">
          <span>Top Priority</span>
          <h2>{topTask?.title ?? 'Choose today’s top priority'}</h2>
          <p className="rose-meta"><i/>{topTask ? ('priority' in topTask ? String(topTask.priority) : 'Focused') : 'Ready to plan'}</p>
          {!topTask ? <Link href="/tasks">Add a task</Link> : <Link href="/tasks">Open tasks</Link>}
        </article>
        <article className="glance-card">
          <span>Next Appointment</span>
          <h2>{nextEvent?.title ?? 'No upcoming event today'}</h2>
          <p>{nextEvent ? `${fmtTime(nextEvent.startAt)}${nextEvent.endAt ? ` – ${fmtTime(nextEvent.endAt)}` : ''}` : 'Your calendar is open'}<CalendarDays/></p>
          <Link href="/calendar">Open calendar</Link>
        </article>
        <article className="glance-card">
          <span>Today&apos;s Routine</span>
          <h2>{routine?.name ?? 'No routine queued right now'}</h2>
          <p className="leaf"><Leaf/> {routine ? (routine.description || `${routine.timeOfDay} routine`) : 'Choose or create a routine'}</p>
          <Link href="/routines">Open routines</Link>
        </article>
        <article className="glance-card">
          <span>Important Alert</span>
          <h2>{alert.title}</h2>
          <p>{alert.detail}</p><AlertTriangle className="alert"/>
          <Link href={alert.href}>Review</Link>
        </article>
      </section>

      <section className="dashboard-middle">
        <article className="panel brief">
          <b>{data.greeting.label.toUpperCase()} BRIEF</b>
          <h2>{data.greeting.title}</h2>
          <p>{data.weekTheme.title}: {data.weekTheme.note}</p>
          <Link href="/briefings">View Full Brief</Link>
        </article>
        <article className="panel schedule">
          <b>TODAY&apos;S SCHEDULE</b>
          {scheduleRows.length ? scheduleRows.map((item) => (
            <div key={item.key}><time>{item.time}</time><span className={item.featured ? 'featured' : ''}>{item.featured ? <i/> : null}<Link href={item.href}>{item.title}</Link></span></div>
          )) : <div><time>Open</time><span><Link href="/calendar">Nothing scheduled yet — plan your day</Link></span></div>}
        </article>
        <article className="panel tasks">
          <b>TOP TASKS</b>
          {data.topPriorityTasks.length ? data.topPriorityTasks.slice(0, 4).map((task) => (
            <div key={task.id}><span className={`check ${task.status === 'done' ? 'done' : ''}`}>{task.status === 'done' ? <Check/> : null}</span><span>{task.title}</span></div>
          )) : <div><span className="check"/><span>No active tasks yet</span></div>}
          <Link href="/tasks">{data.topPriorityTasks.length ? 'View all tasks' : 'Add your first task'}</Link>
        </article>
      </section>

      <section className="health-row">
        <article className="health-card wellness">
          <b>WELLNESS</b>
          <div><span>Energy<strong>{energy ? String(energy) : 'Not logged'}</strong><i className="green-arrow"><ArrowRight/></i></span><span>Mood<strong>{mood ? String(mood) : 'Check in'}</strong><i><ArrowRight/></i></span></div>
          <Link href="/wellness">Open wellness</Link>
        </article>
        <article className="health-card hydration">
          <b>HYDRATION</b>
          <div className="water-ring" style={{'--water': `${water === null ? 0 : Math.min(100, (water / 8) * 100)}%`} as React.CSSProperties}><span><strong>{water === null ? '—' : `${water} / 8`}</strong>{water === null ? 'log today' : 'glasses'}</span></div>
          <Link href="/wellness">Log water</Link>
        </article>
        <article className="health-card nutrition">
          <b>HABITS</b>
          <strong>{completionRate === null ? '—' : `${completionRate}%`}</strong>
          <span>{data.habitSummary.totalHabits ? `${data.habitSummary.completedToday} / ${data.habitSummary.totalHabits} complete` : 'No habits tracked yet'}</span>
          <i><small/></i>
          <Link href="/habits">Open habits</Link>
        </article>
        <article className="health-card sleep">
          <b>SLEEP</b><Moon/><strong>{sleep === null ? '—' : `${sleep}h`}</strong><span>{sleep === null ? 'Log sleep in Wellness' : 'Today’s check-in'}</span>
          <Link href="/wellness">Open wellness</Link>
        </article>
        <article className="quote-card"><div className="botanical"><span>⌇</span></div><blockquote>{data.workoutOfTheDay.label || 'Keep your next action small, clear, and doable.'}</blockquote><Link href={data.workoutOfTheDay.label ? '/fitness' : '/today'}>{data.workoutOfTheDay.label ? 'Open workout' : 'Open Today'}</Link><i/></article>
      </section>
    </div>
  );
}
