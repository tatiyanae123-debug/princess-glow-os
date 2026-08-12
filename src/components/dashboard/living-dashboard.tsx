'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Check, CloudSun, Coffee, Crown, Droplets, Sparkles, Star } from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

const moodImages = [
  ['flowers', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=500&q=80'],
  ['coffee', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80'],
  ['travel', 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=500&q=80'],
  ['camera', 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=500&q=80'],
] as const;

function timeOfDay() {
  const hour = new Date().getHours();
  return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
}

function timeLabel(value: Date | null) {
  return value ? value.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : 'Anytime';
}

export function LivingDashboard({ data, error, userName }: { data: LivingDashboardData; error?: string; userName?: string | null }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const firstName = userName?.trim().split(/\s+/)[0] || 'Princess';
  const events = useMemo(() => [...data.todaySchedule.events, ...data.googleCalendar.events].slice(0, 5), [data]);
  const habitPercent = data.habitSummary.totalHabits
    ? Math.round((data.habitSummary.completedToday / data.habitSummary.totalHabits) * 100)
    : 0;
  const water = data.wellnessToday.entry?.waterGlasses ?? 0;
  const routine = data.routinesForNow[0];

  return (
    <div className="editorial-page dashboard-page">
      <header className="dashboard-heading">
        <div>
          <h1>Good {timeOfDay()},<br /><em>{firstName}</em> <Crown aria-hidden="true" /></h1>
          <p>Anchor one priority early and keep your pace intentional.</p>
          <blockquote>“Every day is a new chapter of the life you’re creating.”</blockquote>
        </div>
        <div className="dashboard-flower" aria-hidden="true">❀</div>
      </header>

      {error && <div className="editorial-error">Live data is temporarily unavailable: {error}</div>}

      <div className="dashboard-layout">
        <div className="dashboard-center">
          <section className="mood-board" aria-label="My mood board">
            <div className="mood-label"><b>MY MOOD BOARD</b><span>pin what feels like you</span></div>
            <Link className="pin-button" href="/notes">＋ Pin</Link>
            <div className="mood-oval">
              <article className="mood-note note-one">Discipline<br />Peace<br />Progress</article>
              <article className="mood-note note-two">I’m becoming<br />everything<br />I prayed for.</article>
              <article className="mood-note note-three">Soft life<br />still means<br />hard work. ♡</article>
              {moodImages.map(([name, src]) => <figure className={`mood-photo ${name}`} key={name}><img src={src} alt={`${name} inspiration`} /></figure>)}
              <div className="mood-candle">REFOCUS<br />RECLAIM<br />RESTART</div>
            </div>
          </section>

          <section className="metric-strip">
            <article><Star /><span>TOP PRIORITY<strong>{data.dailyFocus?.title || data.topPriorityTasks[0]?.title || 'Choose your focus'}</strong></span></article>
            <article><Check /><span>TASKS TODAY<strong>{data.todayOverview.tasksDueToday}</strong></span></article>
            <article><Sparkles /><span>HABIT SCORE<strong>{habitPercent}%</strong></span></article>
            <article><Coffee /><span>FOCUS TIME<strong>{data.todayOverview.eventsToday ? `${data.todayOverview.eventsToday} blocks` : 'Not set'}</strong></span></article>
            <article><Droplets /><span>WATER<strong>{water} / 8</strong></span></article>
          </section>

          <section className="dashboard-detail-grid">
            <article className="dash-paper"><h2>TODAY’S PLAN</h2>{data.topPriorityTasks.slice(0, 5).map(t => <p key={t.id}><i />{t.title}</p>)}{!data.topPriorityTasks.length && <small>Your plan is beautifully clear.</small>}<Link href="/tasks">View Full Plan →</Link></article>
            <article className="dash-paper"><h2>UPCOMING</h2>{events.map(e => <p key={e.id}><time>{e.allDay ? 'All day' : timeLabel(e.startAt)}</time>{e.title}</p>)}{!events.length && <small>No events scheduled today.</small>}<Link href="/calendar">View Calendar →</Link></article>
            <article className="dash-paper meals"><h2>TODAY’S MEALS</h2><div className="meal-empty">No meals planned yet.<br /><span>Keep this space open or plan your menu.</span></div><Link href="/planning">Plan Meals →</Link></article>
            <article className="dash-paper habits"><h2>HABIT TRACKER</h2>{data.habitSummary.habits.slice(0, 5).map(h => <p key={h.id}><span>{h.name}</span><b>{[0,1,2,3,4,5].map(n => <i className={h.completedToday ? 'filled' : ''} key={n} />)}</b></p>)}{!data.habitSummary.habits.length && <small>No habits created yet.</small>}<Link href="/habits">View Habits →</Link></article>
          </section>

          <section className="intelligence-strip"><b><span>AI</span> GLOW INTELLIGENCE</b><p>{data.todayOverview.tasksDueToday ? `You have ${data.todayOverview.tasksDueToday} task${data.todayOverview.tasksDueToday === 1 ? '' : 's'} due today. Protect a focused block for the most important one.` : 'Your day has breathing room. Choose one meaningful priority to move forward.'}</p><Link href="/planning">Build My Day ✨</Link></section>
        </div>

        <aside className="dashboard-rail">
          <section className="rail-time"><strong>{now?.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) || '—'}</strong><p>{now?.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p><p>Local time</p><div><CloudSun /> <b>Weather</b><small>Connect location for conditions</small></div></section>
          <section><h2>TODAY’S FOCUS</h2>{data.topPriorityTasks.slice(0, 3).map(t => <p className="rail-check" key={t.id}><Check />{t.title}</p>)}{!data.topPriorityTasks.length && <small>No focus items yet.</small>}</section>
          <section><h2>RITUAL OF THE DAY</h2><h3>{routine?.name || 'Your next ritual'}</h3><p>{routine?.description || 'No ritual is scheduled for this moment.'}</p><div className="rail-progress"><i style={{ width: routine ? '35%' : '0%' }} /></div><Link className="rail-button" href="/routines">Continue Ritual</Link></section>
          <section><h2>DAY OVERVIEW</h2><div className="overview-number">{data.projectStatus.completedTaskCount}<small>tasks completed</small></div><p>{data.projectStatus.activeTaskCount} active · {data.todayOverview.eventsToday} events</p><Link href="/tasks">View Tasks →</Link></section>
        </aside>
      </div>
    </div>
  );
}
