'use client';

import Link from 'next/link';
import {
  CalendarDays,
  ChevronDown,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import styles from './what-now-reference.module.css';
import navStyles from './what-now-navigation.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';
type DayViewMode = 'full' | 'near';

type DisplayItem = {
  title: string;
  detail: string;
  tag: string;
  room: RoomKey;
};

type TemporalRow = {
  key: RoomKey;
  time: string;
  title: string;
  line1: string;
  line2: string;
  first: DisplayItem | null;
  second: DisplayItem | null;
  metric: [string, string];
};

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

function Pearl({ small = false, warm = false, violet = false }: { small?: boolean; warm?: boolean; violet?: boolean }) {
  return <span aria-hidden="true" className={`${styles.pearl} ${small ? styles.pearlSmall : ''} ${warm ? styles.pearlWarm : ''} ${violet ? styles.pearlViolet : ''}`}><i /></span>;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatEventRange(event: PersonalEvent) {
  if (event.allDay) return 'All day';
  const start = formatTime(event.startAt);
  const end = event.endAt ? formatTime(event.endAt) : null;
  return end ? `${start} – ${end}` : start;
}

function taskDetail(task: PersonalTask) {
  if (task.dueDate) {
    return `Due ${new Date(task.dueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`;
  }
  return task.status === 'in_progress' ? 'In progress' : `${task.priority} priority`;
}

function itemFromEvent(event: PersonalEvent, room: RoomKey): DisplayItem {
  return {
    title: event.title,
    detail: `${formatEventRange(event)}${event.location ? ` · ${event.location}` : ''}`,
    tag: event.source === 'google' ? 'Calendar' : 'Glow',
    room,
  };
}

function itemFromTask(task: PersonalTask, room: RoomKey): DisplayItem {
  return {
    title: task.title,
    detail: taskDetail(task),
    tag: 'Task',
    room,
  };
}

function relativeUntil(iso: string | null | undefined) {
  if (!iso) return 'Not scheduled';
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const minutes = Math.round(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function energyLabel(value: string | null | undefined) {
  if (!value) return 'Not logged';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function WhatNowReference() {
  const personal = usePersonalContext();
  const [visible, setVisible] = useState(false);
  const [askGlowOpen, setAskGlowOpen] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [timeText, setTimeText] = useState('');
  const [dayViewMode, setDayViewMode] = useState<DayViewMode>('full');
  const [previousDayViewMode, setPreviousDayViewMode] = useState<DayViewMode | null>(null);

  useEffect(() => {
    const sync = () => {
      const room = new URL(window.location.href).searchParams.get('room');
      const now = new Date();
      setVisible(room === 'what-now' || (!room && now.getHours() >= 12));
    };
    const updateTime = () => setTimeText(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    sync();
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    window.addEventListener('popstate', sync);
    const roomTimer = window.setInterval(sync, 300);
    return () => {
      window.removeEventListener('popstate', sync);
      window.clearInterval(timer);
      window.clearInterval(roomTimer);
    };
  }, []);

  useEffect(() => {
    if (!receipt) return;
    const timer = window.setTimeout(() => setReceipt(''), 2400);
    return () => window.clearTimeout(timer);
  }, [receipt]);

  const live = personal.status === 'ready' ? personal.data : null;
  const activeTask = live?.activeTask ?? null;
  const nextEvent = live?.todayEvents.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? null;
  const nextTask = live?.tasks.find((task) => task.id !== activeTask?.id) ?? null;

  const rows = useMemo<TemporalRow[]>(() => {
    if (!live) {
      return [
        { key: 'next-up', time: '', title: 'NEXT', line1: 'Your next item', line2: 'Waiting for connected data.', first: null, second: null, metric: ['Time to next', '—'] },
        { key: 'later', time: '', title: 'LATER', line1: 'Later today', line2: 'Only real schedule items appear.', first: null, second: null, metric: ['Later', '—'] },
        { key: 'tonight', time: '', title: 'TONIGHT', line1: 'This evening', line2: 'No sample plans are inserted.', first: null, second: null, metric: ['Tonight', '—'] },
        { key: 'tomorrow', time: '', title: 'TOMORROW', line1: 'Preview tomorrow', line2: 'Your connected schedule only.', first: null, second: null, metric: ['Tomorrow', '—'] },
      ];
    }

    const now = new Date();
    const futureToday = live.todayEvents.filter((event) => new Date(event.startAt) >= now);
    const nextThreeHours = futureToday.filter((event) => new Date(event.startAt).getTime() <= now.getTime() + 3 * 60 * 60 * 1000);
    const later = futureToday.filter((event) => {
      const hour = new Date(event.startAt).getHours();
      return hour >= 12 && hour < 17;
    });
    const tonight = futureToday.filter((event) => new Date(event.startAt).getHours() >= 17);

    const taskItems = live.tasks.filter((task) => task.id !== activeTask?.id).map((task) => itemFromTask(task, 'focus'));
    const nextItems = nextThreeHours.map((event) => itemFromEvent(event, 'meeting'));
    const laterItems = later.map((event) => itemFromEvent(event, 'later'));
    const tonightItems = tonight.map((event) => itemFromEvent(event, 'tonight'));
    const tomorrowItems = live.tomorrowEvents.map((event) => itemFromEvent(event, 'tomorrow'));

    return [
      {
        key: 'next-up',
        time: nextThreeHours[0] ? formatTime(nextThreeHours[0].startAt) : '',
        title: 'NEXT',
        line1: 'The next real thing',
        line2: 'From your tasks and calendar.',
        first: nextItems[0] ?? taskItems[0] ?? null,
        second: nextItems[1] ?? taskItems[1] ?? null,
        metric: ['Time to next', nextThreeHours[0] ? relativeUntil(nextThreeHours[0].startAt) : nextTask?.dueDate ? relativeUntil(nextTask.dueDate) : '—'],
      },
      {
        key: 'later',
        time: later[0] ? formatTime(later[0].startAt) : '',
        title: 'LATER',
        line1: 'Later today',
        line2: 'Only what is actually scheduled.',
        first: laterItems[0] ?? null,
        second: laterItems[1] ?? null,
        metric: ['Later', later[0] ? relativeUntil(later[0].startAt) : 'Clear'],
      },
      {
        key: 'tonight',
        time: tonight[0] ? formatTime(tonight[0].startAt) : '',
        title: 'TONIGHT',
        line1: 'This evening',
        line2: 'Your real calendar and routines.',
        first: tonightItems[0] ?? (live.routines.find((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night') ? {
          title: live.routines.find((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night')!.name,
          detail: 'Your saved routine',
          tag: 'Routine',
          room: 'tonight' as RoomKey,
        } : null),
        second: tonightItems[1] ?? null,
        metric: ['Tonight', tonight[0] ? relativeUntil(tonight[0].startAt) : 'Clear'],
      },
      {
        key: 'tomorrow',
        time: tomorrowItems[0] ? formatTime(live.tomorrowEvents[0].startAt) : '',
        title: 'TOMORROW',
        line1: 'Preview tomorrow',
        line2: 'Your connected schedule only.',
        first: tomorrowItems[0] ?? null,
        second: tomorrowItems[1] ?? null,
        metric: ['Tomorrow', live.tomorrowEvents[0] ? relativeUntil(live.tomorrowEvents[0].startAt) : 'Clear'],
      },
    ];
  }, [activeTask?.id, live, nextTask?.dueDate]);

  function activateWithKeyboard(event: KeyboardEvent<HTMLElement>, room: RoomKey) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      goToRoom(room);
    }
  }

  function toggleDayView() {
    const next = dayViewMode === 'full' ? 'near' : 'full';
    setPreviousDayViewMode(dayViewMode);
    setDayViewMode(next);
    setReceipt(next === 'full' ? 'Full day restored' : 'Near-term view active');
  }

  function undoLastChange() {
    if (!previousDayViewMode) return;
    setDayViewMode(previousDayViewMode);
    setPreviousDayViewMode(null);
    setReceipt('Last view change undone');
  }

  if (!visible) return null;

  const topThree = live?.tasks.slice(0, 3) ?? [];
  const focusTitle = activeTask?.title ?? 'No active focus';
  const focusDetail = activeTask ? taskDetail(activeTask) : 'Choose a real task when you are ready';
  const nextTitle = nextEvent?.title ?? nextTask?.title ?? 'Nothing queued';
  const nextDetail = nextEvent ? `${formatEventRange(nextEvent)}${nextEvent.location ? ` · ${nextEvent.location}` : ''}` : nextTask ? taskDetail(nextTask) : 'Your queue is clear';
  const appointment = nextEvent;

  return (
    <div className={styles.overlay} data-what-now-reference="true">
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />

        <header className={styles.topbar} aria-hidden="true">
          <Link href="/home" className={styles.wordmark} tabIndex={-1}>Glow OS</Link>
          <div className={styles.worldLabel}>TODAY</div>
          <span className={styles.askGlow}><Pearl small /><span>Ask Glow<small>⌘ K</small></span></span>
        </header>

        <nav className={`${styles.leftRail} ${navStyles.singleAnchorRail}`} aria-label="Today navigation">
          <button type="button" className={`${styles.railItem} ${styles.railActive}`} onClick={() => goToRoom('what-now')}><Pearl small /><span>Today</span></button>
        </nav>

        <main className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.nowCopy}>
              <span>{timeText}</span>
              <button type="button" className={navStyles.nowTitleButton} onClick={() => goToRoom('focus')} aria-label="Open active focus"><h1>NOW</h1></button>
              <strong>{activeTask ? 'Your real focus is ready' : 'Your day is open'}</strong>
              <p>{personal.status === 'ready' ? 'No sample data is being substituted.' : 'Connecting your Glow data…'}</p>
              <button type="button" className={styles.protected} onClick={() => goToRoom('focus')}><i /> {activeTask ? `Focus · ${activeTask.priority}` : 'Choose focus'}</button>
            </div>

            <div className={styles.heroMatter} aria-hidden="true"><span /><i /><b /></div>

            <div className={styles.promptArea}>
              <strong>What now?</strong>
              <button type="button" className={styles.prompt} onClick={() => setAskGlowOpen(true)}><span>Ask Glow using your connected context…</span><i>→</i></button>
              <div className={styles.miniCards}>
                <article className={styles.miniCard}><span>Open tasks</span><strong>{live ? live.tasks.length : '—'}</strong><div className={styles.wave} /></article>
                <article className={styles.miniCard}><span>Energy</span><strong>{live ? energyLabel(live.wellness?.energy) : '—'}</strong><Pearl /></article>
                <article className={`${styles.miniCard} ${styles.priorityCard}`}>
                  <span>Top priorities</span>
                  {topThree.length > 0 ? topThree.map((task, i) => <div key={task.id}><b>{i + 1}</b><em>{task.title}</em><i /></div>) : <div><b>—</b><em>No priorities set</em><i /></div>}
                </article>
              </div>
            </div>

            <div className={styles.statusBand}>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom('focus')} onKeyDown={(event) => activateWithKeyboard(event, 'focus')}>
                <span>In focus</span><strong>{focusTitle}</strong><div className={styles.progress}><i style={{ width: activeTask?.status === 'in_progress' ? '72%' : '12%' }} /></div><small>{focusDetail}</small><em>{activeTask?.status === 'in_progress' ? 'Active' : 'Ready'}</em>
              </div>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom(nextEvent ? 'meeting' : 'next-up')} onKeyDown={(event) => activateWithKeyboard(event, nextEvent ? 'meeting' : 'next-up')}>
                <span>Next up</span><strong>{nextTitle}</strong><p><CalendarDays /> {nextDetail}</p>
              </div>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom('meeting')} onKeyDown={(event) => activateWithKeyboard(event, 'meeting')}>
                <span>Appointment</span><strong>{appointment?.title ?? 'No upcoming appointment'}</strong><p>{appointment ? formatEventRange(appointment) : 'Your connected calendar is clear'}</p>
                {appointment ? <button type="button" onClick={(event) => { event.stopPropagation(); goToRoom('meeting'); }}>Open</button> : null}
                <button type="button" className={styles.more} onClick={(event) => { event.stopPropagation(); setAskGlowOpen(true); }} aria-label="More options"><MoreHorizontal /></button>
              </div>
            </div>
          </section>

          <section className={`${styles.timeline} ${dayViewMode === 'near' ? navStyles.timelineNear : ''}`} aria-label="Today timeline">
            {rows.map((row, index) => (
              <article key={row.title} className={styles.timelineRow}>
                <button type="button" className={styles.rowLabel} onClick={() => goToRoom(row.key)}>
                  <small>{row.time}</small><strong>{row.title}</strong><span>{row.line1}<br />{row.line2}</span>
                </button>
                {row.first ? (
                  <button type="button" className={`${styles.rowItem} ${navStyles.rowItemButton}`} onClick={() => goToRoom(row.first!.room)} aria-label={`Open ${row.first.title}`}>
                    <Pearl warm={index === 2} violet={index === 1} /><span><strong>{row.first.title}</strong><small>{row.first.detail} <em>{row.first.tag}</em></small></span>
                  </button>
                ) : <div className={styles.rowItem}><Pearl /><span><strong>Nothing scheduled</strong><small>Your real data is clear here</small></span></div>}
                {row.second ? (
                  <button type="button" className={`${styles.rowItem} ${navStyles.rowItemButton}`} onClick={() => goToRoom(row.second!.room)} aria-label={`Open ${row.second.title}`}>
                    <Pearl violet={index === 2} /><span><strong>{row.second.title}</strong><small>{row.second.detail} <em>{row.second.tag}</em></small></span>
                  </button>
                ) : <div className={styles.rowItem}><Pearl /><span><strong>No second item</strong><small>No placeholder inserted</small></span></div>}
                <button type="button" className={styles.metric} onClick={() => goToRoom(row.key)}><span>{row.metric[0]}</span><strong>{row.metric[1]}</strong></button>
                {index < rows.length - 1 ? <span className={styles.downCue}>↑</span> : null}
              </article>
            ))}
          </section>
        </main>

        <footer className={`${styles.bottomBar} ${navStyles.simpleBottomBar}`}>
          <button type="button" className={styles.dayView} onClick={toggleDayView} aria-pressed={dayViewMode === 'near'}>◫ <span>{dayViewMode === 'full' ? 'Day view' : 'Now view'}</span><ChevronDown /></button>
          <button type="button" className={`${styles.replan} ${navStyles.replanCenter}`} onClick={() => goToRoom('replan')}><Sparkles /> Replan my day</button>
          {receipt ? <span className={styles.receipt} role="status">{receipt}</span> : null}
          {previousDayViewMode ? <button type="button" className={styles.undo} onClick={undoLastChange}>Undo <RotateCcw /></button> : null}
          <span className={navStyles.passivePearl} aria-label="You are already at Now"><Pearl /></span>
        </footer>

        {askGlowOpen ? (
          <aside className={styles.glowPanel} role="dialog" aria-label="Ask Glow">
            <div><Pearl small /><span><strong>Glow</strong><small>Your real Today context is active</small></span><button onClick={() => setAskGlowOpen(false)}>×</button></div>
            <p>Glow will use your connected tasks, calendar, routines, notes, and wellness data. It will not invent missing people or plans.</p>
            <button onClick={() => { setAskGlowOpen(false); goToRoom('what-now'); }}>What should I do now?</button>
            <button onClick={() => { setAskGlowOpen(false); goToRoom('focus'); }}>Open my active focus</button>
            <button onClick={() => { setAskGlowOpen(false); goToRoom('tonight'); }}>Show tonight</button>
            <button onClick={() => { setAskGlowOpen(false); goToRoom('tomorrow'); }}>Preview tomorrow</button>
            <button onClick={() => { setAskGlowOpen(false); goToRoom('replan'); }}>Replan my day</button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
