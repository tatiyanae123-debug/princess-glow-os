'use client';

import Link from 'next/link';
import {
  BriefcaseBusiness,
  ChevronDown,
  Dumbbell,
  FileText,
  Focus,
  MapPin,
  MoreHorizontal,
  RotateCcw,
  Sparkles,
  Users,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './what-now-reference.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Pearl({ small = false, warm = false, violet = false }: { small?: boolean; warm?: boolean; violet?: boolean }) {
  return <span aria-hidden="true" className={`${styles.pearl} ${small ? styles.pearlSmall : ''} ${warm ? styles.pearlWarm : ''} ${violet ? styles.pearlViolet : ''}`}><i /></span>;
}

const rows = [
  {
    key: 'next-up' as const,
    time: '11:00 AM',
    title: 'NEXT',
    line1: 'Build and move',
    line2: 'Protect your next hour.',
    first: ['Workout + shower', '11:00 – 11:45 AM', 'Personal'],
    second: ['Design review prep', '11:45 AM – 12:30 PM', 'Deep work'],
    metric: ['Time to next', '1h 18m'],
  },
  {
    key: 'later' as const,
    time: '1:00 PM',
    title: 'LATER',
    line1: 'Collaborate and create',
    line2: 'Afternoon momentum.',
    first: ['Design review', '1:00 – 2:00 PM', 'Meeting'],
    second: ['User research synthesis', '2:30 – 3:30 PM', 'Deep work'],
    metric: ['Time to later', '3h 18m'],
  },
  {
    key: 'tonight' as const,
    time: '7:00 PM',
    title: 'TONIGHT',
    line1: 'Unwind and reset',
    line2: 'Close the day well.',
    first: ['Dinner with Alex', '7:00 – 8:30 PM', 'Personal'],
    second: ['Evening routine', '9:15 PM', 'Wellness'],
    metric: ['Leave-ready', '2h 09m'],
  },
  {
    key: 'tomorrow' as const,
    time: '',
    title: 'TOMORROW',
    line1: 'Preview your tomorrow',
    line2: 'So today can flow.',
    first: ['Leadership sync', '9:00 – 9:45 AM', 'Meeting'],
    second: ['Strategy block', '10:30 AM – 12:00 PM', 'Deep work'],
    metric: ['Preview time', '12h 18m'],
  },
];

export function WhatNowReference() {
  const [visible, setVisible] = useState(false);
  const [askGlowOpen, setAskGlowOpen] = useState(false);
  const [receipt, setReceipt] = useState('All changes saved');
  const [timeText, setTimeText] = useState('9:41 AM');

  useEffect(() => {
    const sync = () => {
      const room = new URL(window.location.href).searchParams.get('room');
      setVisible(room === 'what-now');
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

  if (!visible) return null;

  return (
    <div className={styles.overlay} data-what-now-reference="true">
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />

        <header className={styles.topbar}>
          <Link href="/home" className={styles.wordmark} aria-label="Go to Glow OS Home">Glow OS</Link>
          <div className={styles.worldLabel}>world 1: TODAY&nbsp;&nbsp;·&nbsp;&nbsp;THE LIVING CENTER</div>
          <button className={styles.askGlow} type="button" onClick={() => setAskGlowOpen((v) => !v)} aria-expanded={askGlowOpen}>
            <Pearl small />
            <span>Ask Glow<small>⌘ K</small></span>
          </button>
        </header>

        <nav className={styles.leftRail} aria-label="Today navigation">
          <button type="button" className={`${styles.railItem} ${styles.railActive}`} onClick={() => goToRoom('what-now')}><Pearl small /><span>Today</span></button>
          <button type="button" className={styles.railItem} onClick={() => goToRoom('focus')}><Focus /><span>Focus</span></button>
          <button type="button" className={styles.railItem} onClick={() => goToRoom('meeting')}><Users /><span>People</span></button>
          <button type="button" className={styles.railItem} onClick={() => goToRoom('meeting')}><MapPin /><span>Places</span></button>
          <button type="button" className={styles.railItem} onClick={() => goToRoom('tomorrow')}><FileText /><span>Resources</span></button>
          <button type="button" className={styles.railItem} onClick={() => goToRoom('replan')}><WandSparkles /><span>Journeys</span></button>
        </nav>

        <main className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.nowCopy}>
              <span>{timeText}</span>
              <h1>NOW</h1>
              <strong>You’re in flow</strong>
              <p>Keep the momentum.</p>
              <button type="button" className={styles.protected}><i /> Protected 90 min</button>
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
              <div><span>In focus</span><strong>Partnership proposal</strong><div className={styles.progress}><i /></div><small>55 min remaining</small><em>72%</em></div>
              <div><span>Next up</span><strong>Workout + shower</strong><p><Dumbbell /> 11:00 AM · 45 min</p></div>
              <div><span>Appointments</span><strong>Design review</strong><p>1:00 – 2:00 PM</p><button type="button" onClick={() => goToRoom('meeting')}>Join</button><button type="button" className={styles.more}><MoreHorizontal /></button></div>
            </div>
          </section>

          <section className={styles.timeline}>
            {rows.map((row, index) => (
              <article key={row.title} className={styles.timelineRow}>
                <button type="button" className={styles.rowLabel} onClick={() => goToRoom(row.key)}>
                  <small>{row.time}</small><strong>{row.title}</strong><span>{row.line1}<br />{row.line2}</span>
                </button>
                <div className={styles.rowItem}><Pearl warm={index === 2} violet={index === 1} /><span><strong>{row.first[0]}</strong><small>{row.first[1]} <em>{row.first[2]}</em></small></span></div>
                <div className={styles.rowItem}><Pearl violet={index === 2} /><span><strong>{row.second[0]}</strong><small>{row.second[1]} <em>{row.second[2]}</em></small></span></div>
                <button type="button" className={styles.metric} onClick={() => goToRoom(row.key)}><span>{row.metric[0]}</span><strong>{row.metric[1]}</strong></button>
                {index < rows.length - 1 ? <span className={styles.downCue}>↑</span> : null}
              </article>
            ))}
          </section>
        </main>

        <button type="button" className={styles.addButton} onClick={() => setAskGlowOpen(true)}>+</button>
        <footer className={styles.bottomBar}>
          <button type="button" className={styles.dayView}>◫ <span>Day view</span><ChevronDown /></button>
          <button type="button" className={styles.glowMini} onClick={() => setAskGlowOpen(true)}><Sparkles /></button>
          <button type="button" className={styles.replan} onClick={() => goToRoom('replan')}><Sparkles /> Replan my day</button>
          <span className={styles.receipt}>{receipt}</span>
          <button type="button" className={styles.undo} onClick={() => setReceipt('Changes undone')}>Undo <RotateCcw /></button>
          <Pearl />
        </footer>

        {askGlowOpen ? (
          <aside className={styles.glowPanel} role="dialog" aria-label="Ask Glow">
            <div><Pearl small /><span><strong>Glow</strong><small>Today context is active</small></span><button onClick={() => setAskGlowOpen(false)}>×</button></div>
            <p>Tell me what you want to do next. I’ll keep your Today context attached.</p>
            <button onClick={() => goToRoom('focus')}>Start my focus block</button>
            <button onClick={() => goToRoom('replan')}>Replan my day</button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
