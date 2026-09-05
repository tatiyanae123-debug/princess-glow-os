'use client';

import Link from 'next/link';
import {
  ChevronDown,
  Dumbbell,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { KeyboardEvent, useEffect, useState } from 'react';
import styles from './what-now-reference.module.css';
import navStyles from './what-now-navigation.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';
type DayViewMode = 'full' | 'near';

type TemporalRow = {
  key: RoomKey;
  time: string;
  title: string;
  line1: string;
  line2: string;
  first: [string, string, string];
  firstRoom: RoomKey;
  second: [string, string, string];
  secondRoom: RoomKey;
  metric: [string, string];
};

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Pearl({ small = false, warm = false, violet = false }: { small?: boolean; warm?: boolean; violet?: boolean }) {
  return <span aria-hidden="true" className={`${styles.pearl} ${small ? styles.pearlSmall : ''} ${warm ? styles.pearlWarm : ''} ${violet ? styles.pearlViolet : ''}`}><i /></span>;
}

const rows: TemporalRow[] = [
  {
    key: 'next-up',
    time: '11:00 AM',
    title: 'NEXT',
    line1: 'Build and move',
    line2: 'Protect your next hour.',
    first: ['Workout + shower', '11:00 – 11:45 AM', 'Personal'],
    firstRoom: 'next-up',
    second: ['Design review prep', '11:45 AM – 12:30 PM', 'Deep work'],
    secondRoom: 'meeting',
    metric: ['Time to next', '1h 18m'],
  },
  {
    key: 'later',
    time: '1:00 PM',
    title: 'LATER',
    line1: 'Collaborate and create',
    line2: 'Afternoon momentum.',
    first: ['Design review', '1:00 – 2:00 PM', 'Meeting'],
    firstRoom: 'meeting',
    second: ['User research synthesis', '2:30 – 3:30 PM', 'Deep work'],
    secondRoom: 'later',
    metric: ['Time to later', '3h 18m'],
  },
  {
    key: 'tonight',
    time: '7:00 PM',
    title: 'TONIGHT',
    line1: 'Unwind and reset',
    line2: 'Close the day well.',
    first: ['Dinner with Alex', '7:00 – 8:30 PM', 'Personal'],
    firstRoom: 'tonight',
    second: ['Evening routine', '9:15 PM', 'Wellness'],
    secondRoom: 'tonight',
    metric: ['Leave-ready', '2h 09m'],
  },
  {
    key: 'tomorrow',
    time: '',
    title: 'TOMORROW',
    line1: 'Preview your tomorrow',
    line2: 'So today can flow.',
    first: ['Leadership sync', '9:00 – 9:45 AM', 'Meeting'],
    firstRoom: 'tomorrow',
    second: ['Strategy block', '10:30 AM – 12:00 PM', 'Deep work'],
    secondRoom: 'tomorrow',
    metric: ['Preview time', '12h 18m'],
  },
];

export function WhatNowReference() {
  const [visible, setVisible] = useState(false);
  const [askGlowOpen, setAskGlowOpen] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [timeText, setTimeText] = useState('9:41 AM');
  const [dayViewMode, setDayViewMode] = useState<DayViewMode>('full');
  const [previousDayViewMode, setPreviousDayViewMode] = useState<DayViewMode | null>(null);
  const [joinAvailable, setJoinAvailable] = useState(false);

  useEffect(() => {
    const sync = () => {
      const room = new URL(window.location.href).searchParams.get('room');
      const now = new Date();
      setVisible(room === 'what-now' || (!room && now.getHours() >= 12));
      setJoinAvailable(now.getHours() === 12 || now.getHours() === 13);
    };
    const updateTime = () => setTimeText(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    sync();
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    window.addEventListener('popstate', sync);
    const roomTimer = window.setInterval(sync, 160);
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
    setReceipt(next === 'full' ? 'Full day restored · saved' : 'Near-term view active · saved');
  }

  function undoLastChange() {
    if (!previousDayViewMode) return;
    setDayViewMode(previousDayViewMode);
    setPreviousDayViewMode(null);
    setReceipt('Last change undone');
  }

  if (!visible) return null;

  return (
    <div className={styles.overlay} data-what-now-reference="true">
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />

        <header className={styles.topbar}>
          <Link href="/home" className={styles.wordmark} aria-label="Go to Glow OS Home">Glow OS</Link>
          <div className={styles.worldLabel}>TODAY</div>
          <button className={styles.askGlow} type="button" onClick={() => setAskGlowOpen((v) => !v)} aria-expanded={askGlowOpen}>
            <Pearl small />
            <span>Ask Glow<small>⌘ K</small></span>
          </button>
        </header>

        <nav className={`${styles.leftRail} ${navStyles.singleAnchorRail}`} aria-label="Today navigation">
          <button type="button" className={`${styles.railItem} ${styles.railActive}`} onClick={() => goToRoom('what-now')}><Pearl small /><span>Today</span></button>
        </nav>

        <main className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.nowCopy}>
              <span>{timeText}</span>
              <button type="button" className={navStyles.nowTitleButton} onClick={() => goToRoom('focus')} aria-label="Open what is active now"><h1>NOW</h1></button>
              <strong>You’re in flow</strong>
              <p>Keep the momentum.</p>
              <button type="button" className={styles.protected} onClick={() => goToRoom('focus')}><i /> Focus active · 90 min</button>
            </div>

            <div className={styles.heroMatter} aria-hidden="true"><span /><i /><b /></div>

            <div className={styles.promptArea}>
              <strong>What now?</strong>
              <button type="button" className={styles.prompt} onClick={() => setAskGlowOpen(true)}><span>Share intent or ask anything…</span><i>→</i></button>
              <div className={styles.miniCards}>
                <article className={styles.miniCard}><span>Capacity</span><strong>High focus</strong><div className={styles.wave} /></article>
                <article className={styles.miniCard}><span>Energy</span><strong>Clear · Steady</strong><Pearl /></article>
                <article className={`${styles.miniCard} ${styles.priorityCard}`}><span>Top 3 priorities</span>{['Finish partnership proposal','Workout + shower','Prepare for design review'].map((p, i) => <div key={p}><b>{i + 1}</b><em>{p}</em><i /></div>)}</article>
              </div>
            </div>

            <div className={styles.statusBand}>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom('focus')} onKeyDown={(event) => activateWithKeyboard(event, 'focus')}>
                <span>In focus</span><strong>Partnership proposal</strong><div className={styles.progress}><i /></div><small>55 min remaining</small><em>72%</em>
              </div>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom('next-up')} onKeyDown={(event) => activateWithKeyboard(event, 'next-up')}>
                <span>Next up</span><strong>Workout + shower</strong><p><Dumbbell /> 11:00 AM · 45 min</p>
              </div>
              <div className={navStyles.clickableSurface} role="button" tabIndex={0} onClick={() => goToRoom('meeting')} onKeyDown={(event) => activateWithKeyboard(event, 'meeting')}>
                <span>Appointments</span><strong>Design review</strong><p>1:00 – 2:00 PM</p>
                {joinAvailable ? <button type="button" onClick={(event) => { event.stopPropagation(); goToRoom('meeting'); }}>Join</button> : null}
                <button type="button" className={styles.more} onClick={(event) => { event.stopPropagation(); setAskGlowOpen(true); }} aria-label="More appointment options"><MoreHorizontal /></button>
              </div>
            </div>
          </section>

          <section className={`${styles.timeline} ${dayViewMode === 'near' ? navStyles.timelineNear : ''}`} aria-label="Today timeline">
            {rows.map((row, index) => (
              <article key={row.title} className={styles.timelineRow}>
                <button type="button" className={styles.rowLabel} onClick={() => goToRoom(row.key)}>
                  <small>{row.time}</small><strong>{row.title}</strong><span>{row.line1}<br />{row.line2}</span>
                </button>
                <button type="button" className={`${styles.rowItem} ${navStyles.rowItemButton}`} onClick={() => goToRoom(row.firstRoom)} aria-label={`Open ${row.first[0]}`}>
                  <Pearl warm={index === 2} violet={index === 1} /><span><strong>{row.first[0]}</strong><small>{row.first[1]} <em>{row.first[2]}</em></small></span>
                </button>
                <button type="button" className={`${styles.rowItem} ${navStyles.rowItemButton}`} onClick={() => goToRoom(row.secondRoom)} aria-label={`Open ${row.second[0]}`}>
                  <Pearl violet={index === 2} /><span><strong>{row.second[0]}</strong><small>{row.second[1]} <em>{row.second[2]}</em></small></span>
                </button>
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
            <div><Pearl small /><span><strong>Glow</strong><small>Today context is active</small></span><button onClick={() => setAskGlowOpen(false)}>×</button></div>
            <p>Tell me what you want to do or where you want to go. You never need to know which Glow system owns it.</p>
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
