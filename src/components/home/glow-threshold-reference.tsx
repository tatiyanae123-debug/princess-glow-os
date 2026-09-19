'use client';

import { ArrowRight, CalendarDays, Clock3, LocateFixed, Sparkles, SunMedium } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import styles from './glow-threshold-reference.module.css';

type WeatherState = {
  temperature: number;
  high: number | null;
  low: number | null;
  code: number;
};

type FlowItem =
  | { kind: 'event'; key: string; start: Date; end: Date | null; event: PersonalEvent }
  | { kind: 'open'; key: string; start: Date; end: Date; minutes: number };

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function openGlow() {
  document.dispatchEvent(new CustomEvent('glow:open'));
}

function formatTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatRange(event: PersonalEvent) {
  const start = formatTime(event.startAt);
  if (!event.endAt) return start;
  return `${start}–${formatTime(event.endAt)}`;
}

function shortName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || '';
}

function weatherDescription(code: number) {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Partly cloudy';
  if ([45, 48].includes(code)) return 'Foggy';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Storms';
  return 'Current conditions';
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function buildFlow(events: PersonalEvent[], now: Date): FlowItem[] {
  const nowMs = now.getTime();
  const relevant = [...events]
    .filter((event) => {
      const end = event.endAt ? new Date(event.endAt).getTime() : new Date(event.startAt).getTime() + 60 * 60_000;
      return end >= nowMs;
    })
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const items: FlowItem[] = [];
  let cursor = nowMs;

  for (const event of relevant) {
    const start = new Date(event.startAt);
    const end = event.endAt ? new Date(event.endAt) : null;
    const startMs = start.getTime();
    if (startMs - cursor >= 30 * 60_000) {
      const gapEnd = new Date(startMs);
      items.push({
        kind: 'open',
        key: `open-${cursor}-${startMs}`,
        start: new Date(cursor),
        end: gapEnd,
        minutes: Math.round((startMs - cursor) / 60_000),
      });
    }
    items.push({ kind: 'event', key: `event-${event.source}-${event.id}`, start, end, event });
    cursor = Math.max(cursor, end?.getTime() ?? startMs + 60 * 60_000);
  }

  return items.slice(0, 7);
}

function taskReason(task: PersonalTask | null, nextEvent: PersonalEvent | null) {
  if (!task) return 'Your schedule is the strongest signal right now.';
  if (task.status === 'in_progress') return 'You already started this, so Glow is protecting continuity.';
  if (task.priority === 'urgent') return 'This is your highest-priority open task.';
  if (task.priority === 'high') return 'This is a high-priority open task.';
  if (nextEvent) return `This is your strongest open task before ${formatTime(nextEvent.startAt)}.`;
  return 'This is the strongest open task in your current list.';
}

export function GlowThresholdReference() {
  const personal = usePersonalContext();
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const data = personal.status === 'ready' ? personal.data : null;
  const current = now ?? new Date();
  const name = shortName(data?.user.name);
  const hour = current.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateText = current.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const timeText = formatTime(current);

  const unfinishedTasks = useMemo(() => {
    if (!data) return [];
    return [...data.tasks]
      .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
      .sort((a, b) => {
        if (a.status === 'in_progress' && b.status !== 'in_progress') return -1;
        if (b.status === 'in_progress' && a.status !== 'in_progress') return 1;
        const priority = priorityRank[a.priority] - priorityRank[b.priority];
        if (priority !== 0) return priority;
        if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        return a.dueDate ? -1 : b.dueDate ? 1 : 0;
      });
  }, [data]);

  const remainingEvents = useMemo(() => {
    if (!data || !now) return [];
    const nowMs = now.getTime();
    return [...data.todayEvents]
      .filter((event) => {
        const end = event.endAt ? new Date(event.endAt).getTime() : new Date(event.startAt).getTime() + 60 * 60_000;
        return end >= nowMs;
      })
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [data, now]);

  const activeEvent = remainingEvents.find((event) => {
    const start = new Date(event.startAt).getTime();
    const end = event.endAt ? new Date(event.endAt).getTime() : start + 60 * 60_000;
    return start <= current.getTime() && end > current.getTime();
  }) ?? null;

  const nextEvent = remainingEvents.find((event) => new Date(event.startAt).getTime() > current.getTime()) ?? null;
  const bestTask = data?.activeTask ?? unfinishedTasks[0] ?? null;
  const flow = useMemo(() => data && now ? buildFlow(data.todayEvents, now) : [], [data, now]);

  const nowTitle = activeEvent?.title ?? bestTask?.title ?? 'Your next move is open';
  const nowMeta = activeEvent
    ? formatRange(activeEvent)
    : bestTask
      ? `${bestTask.priority} priority · ${bestTask.status === 'in_progress' ? 'in progress' : 'ready'}`
      : nextEvent
        ? `Next fixed commitment at ${formatTime(nextEvent.startAt)}`
        : 'No fixed commitment is competing for attention right now';

  const interpretation = !data
    ? 'Connecting your real schedule, tasks, routines, and goals.'
    : data.todayEvents.length === 0
      ? 'Your calendar is open today. Glow can protect that space instead of filling it.'
      : data.todayEvents.length >= 4
        ? `Today has ${data.todayEvents.length} fixed calendar items. Glow is keeping the open windows visible between them.`
        : nextEvent
          ? `Your next fixed commitment is ${formatTime(nextEvent.startAt)}. The rest of the day stays flexible around it.`
          : 'Your fixed commitments are complete. The rest of today can stay intentionally open.';

  const overdueCount = unfinishedTasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() < current.getTime()).length;
  const tomorrowFirst = data?.tomorrowEvents?.[0] ?? null;
  const goals = data?.goals.filter((goal) => goal.status !== 'complete').slice(0, 3) ?? [];

  async function loadWeather() {
    if (!navigator.geolocation) {
      setWeatherStatus('error');
      return;
    }
    setWeatherStatus('loading');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(coords.latitude)}&longitude=${encodeURIComponent(coords.longitude)}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('weather');
        const json = await response.json() as {
          current?: { temperature_2m?: number; weather_code?: number };
          daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
        };
        if (typeof json.current?.temperature_2m !== 'number') throw new Error('weather');
        setWeather({
          temperature: json.current.temperature_2m,
          code: json.current.weather_code ?? 0,
          high: json.daily?.temperature_2m_max?.[0] ?? null,
          low: json.daily?.temperature_2m_min?.[0] ?? null,
        });
        setWeatherStatus('idle');
      } catch {
        setWeatherStatus('error');
      }
    }, () => setWeatherStatus('error'), { timeout: 10_000, maximumAge: 15 * 60_000 });
  }

  return (
    <main className={styles.world} aria-label="Glow OS Home command center">
      <div className={styles.canvas}>
        <header className={styles.livingHeader}>
          <div>
            <p className={styles.eyebrow}>HOME · {dateText}</p>
            <h1>{greeting}{name ? `, ${name}` : ''}.</h1>
            <p className={styles.dayInterpretation}>{interpretation}</p>
          </div>
          <div className={styles.contextLine} aria-label="Current day context">
            <span><Clock3 size={15}/><b>{timeText}</b><small>local time</small></span>
            <span><Sparkles size={15}/><b>{data?.wellness?.energy || 'Not checked in'}</b><small>energy</small></span>
            <button type="button" onClick={loadWeather} aria-label="Load local weather">
              <SunMedium size={15}/>
              <b>{weather ? `${Math.round(weather.temperature)}° · ${weatherDescription(weather.code)}` : weatherStatus === 'loading' ? 'Loading…' : 'Weather'}</b>
              <small>{weather ? `H ${weather.high === null ? '—' : Math.round(weather.high)}° · L ${weather.low === null ? '—' : Math.round(weather.low)}°` : weatherStatus === 'error' ? 'location unavailable' : 'use location'}</small>
            </button>
          </div>
        </header>

        <section className={styles.primaryGrid}>
          <article className={styles.nowBlock}>
            <div className={styles.sectionKicker}><span>NOW</span><time>{timeText}</time></div>
            <h2>{nowTitle}</h2>
            <p className={styles.nowMeta}>{nowMeta}</p>
            <p className={styles.reason}>{taskReason(bestTask, nextEvent)}</p>
            <div className={styles.nowFooter}>
              <button type="button" className={styles.primaryAction} onClick={() => travel(activeEvent ? `/today?room=meeting&event=${encodeURIComponent(activeEvent.id)}` : '/today?room=what-now')}>
                Open what now <ArrowRight size={16}/>
              </button>
              {nextEvent ? <span>Next · {formatTime(nextEvent.startAt)} · {nextEvent.title}</span> : <span>No fixed event is immediately ahead.</span>}
            </div>
          </article>

          <section className={styles.three} aria-labelledby="today-three-heading">
            <div className={styles.sectionHeading}>
              <div><p className={styles.eyebrow}>TODAY&apos;S THREE</p><h2 id="today-three-heading">What deserves the day</h2></div>
              <button type="button" onClick={() => travel('/tasks')}>Edit priorities</button>
            </div>
            <div className={styles.priorityList}>
              {unfinishedTasks.slice(0, 3).map((task, index) => (
                <button key={task.id} type="button" onClick={() => travel('/today?room=what-now')} className={styles.priorityRow}>
                  <span className={styles.priorityNumber}>0{index + 1}</span>
                  <span><strong>{task.title}</strong><small>{task.status === 'in_progress' ? 'In progress' : `${task.priority} priority`}</small></span>
                  <ArrowRight size={15}/>
                </button>
              ))}
              {!unfinishedTasks.length ? (
                <button type="button" onClick={() => travel('/tasks')} className={styles.openPriority}>
                  <span>Your three outcomes are still open.</span><small>Choose only what deserves today.</small><ArrowRight size={15}/>
                </button>
              ) : null}
            </div>
          </section>
        </section>

        <section className={styles.daySection}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>DAY FLOW</p><h2>Your day, without the empty boxes</h2></div>
            <button type="button" onClick={() => travel('/today?room=day-view')}>Full day view</button>
          </div>

          <div className={styles.dayFlow}>
            <div className={styles.flowStart}><span>NOW</span><time>{timeText}</time></div>
            {flow.length ? flow.map((item) => item.kind === 'event' ? (
              <button key={item.key} type="button" className={styles.eventLine} onClick={() => travel(`/today?room=meeting&event=${encodeURIComponent(item.event.id)}`)}>
                <time>{formatTime(item.start)}</time>
                <span className={styles.flowMark} aria-hidden="true"/>
                <span><strong>{item.event.title}</strong><small>{formatRange(item.event)}{item.event.location ? ` · ${item.event.location}` : ''}</small></span>
                <ArrowRight size={15}/>
              </button>
            ) : (
              <button key={item.key} type="button" className={styles.openLine} onClick={() => travel('/today?room=what-now')}>
                <time>{formatTime(item.start)}</time>
                <span className={styles.flowMark} aria-hidden="true"/>
                <span><strong>Open window · {durationLabel(item.minutes)}</strong><small>{item.minutes >= 90 ? 'Enough room for focus, movement, errands, or protected rest.' : 'Keep it open or fit one realistic next action.'}</small></span>
                <span className={styles.openCue}>OPEN</span>
              </button>
            )) : (
              <button type="button" className={styles.openHorizon} onClick={() => travel('/today?room=what-now')}>
                <span className={styles.flowMark} aria-hidden="true"/>
                <span><strong>The rest of the horizon is open.</strong><small>Glow will not invent plans just to fill the page.</small></span>
                <ArrowRight size={15}/>
              </button>
            )}
            {flow.length ? <div className={styles.afterFlow}><span className={styles.flowMark} aria-hidden="true"/><span><strong>Later stays flexible.</strong><small>Only fixed information earns space here.</small></span></div> : null}
          </div>
        </section>

        <section className={styles.intelligenceGrid}>
          <article className={styles.whatNow}>
            <p className={styles.eyebrow}>GLOW INTELLIGENCE</p>
            <h2>{bestTask ? bestTask.title : 'Protect the open space.'}</h2>
            <p>{taskReason(bestTask, nextEvent)}</p>
            <button type="button" onClick={openGlow}>Ask Glow why or change it <Sparkles size={15}/></button>
          </article>

          <article className={styles.attention}>
            <p className={styles.eyebrow}>ATTENTION</p>
            <strong>{overdueCount ? `${overdueCount} overdue` : 'Nothing urgent'}</strong>
            <span>{overdueCount ? 'Review only the items that genuinely need intervention.' : 'Glow stays quiet when the system does not need you.'}</span>
            <button type="button" onClick={() => travel(overdueCount ? '/tasks' : '/brain')}>{overdueCount ? 'Review' : 'Open Brain'} <ArrowRight size={14}/></button>
          </article>

          <article className={styles.tomorrow}>
            <p className={styles.eyebrow}>TOMORROW</p>
            <strong>{tomorrowFirst ? tomorrowFirst.title : 'Tomorrow is still open'}</strong>
            <span>{tomorrowFirst ? `First fixed item · ${formatTime(tomorrowFirst.startAt)}` : 'No fixed calendar item is connected yet.'}</span>
            <button type="button" onClick={() => travel('/today?room=tomorrow')}>Preview tomorrow <ArrowRight size={14}/></button>
          </article>
        </section>

        <section className={styles.horizonSection}>
          <div className={styles.horizonIntro}>
            <p className={styles.eyebrow}>YOUR HORIZON</p>
            <h2>Go deeper only when you need to.</h2>
          </div>
          <nav className={styles.worldLinks} aria-label="Glow worlds">
            <button onClick={() => travel('/today?room=what-now')}><span>Today</span><small>Operate the day</small></button>
            <button onClick={() => travel('/planning')}><span>Plan</span><small>Shape what comes next</small></button>
            <button onClick={() => travel('/life')}><span>Life</span><small>Home, food, money, care</small></button>
            <button onClick={() => travel('/beauty')}><span>Beauty</span><small>Routines and personal care</small></button>
            <button onClick={() => travel('/brain')}><span>Brain</span><small>Memory and understanding</small></button>
            <button onClick={() => travel('/create')}><span>Create</span><small>Ideas becoming real</small></button>
          </nav>
          {goals.length ? <div className={styles.goalWhisper}><span>Quiet progress</span>{goals.map((goal) => <button key={goal.id} onClick={() => travel('/goals')}><strong>{goal.title}</strong><small>{Math.round(goal.progress)}%</small></button>)}</div> : null}
        </section>

        <button type="button" className={styles.floatingAsk} onClick={openGlow}><Sparkles size={16}/><span>Ask Glow</span><small>Say it naturally</small></button>
        <button type="button" className={styles.locationHint} onClick={loadWeather}><LocateFixed size={13}/><span>Weather uses location only when you choose it.</span></button>
      </div>
    </main>
  );
}
