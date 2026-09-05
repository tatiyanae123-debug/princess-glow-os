'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './glow-current-home-world.module.css';

function GlowMatter() {
  return <span className={styles.glowMatter} aria-hidden="true"><i /><b /></span>;
}

function moveToday(room = 'what-now') {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  window.location.assign(url.toString());
}

const regions = ['Today', 'Plan', 'Life', 'Brain', 'Create'] as const;

type Region = (typeof regions)[number];

export function GlowCurrentHomeWorld() {
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [glowOpen, setGlowOpen] = useState(false);
  const [glowPrompt, setGlowPrompt] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateText(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
      setTimeText(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function openGlow(prompt = '') {
    setGlowPrompt(prompt);
    setGlowOpen(true);
  }

  function openRegion(region: Region) {
    if (region === 'Today') {
      moveToday('what-now');
      return;
    }
    openGlow(`Take me into ${region}`);
  }

  return (
    <main className={styles.world}>
      <div className={styles.pearlLight} aria-hidden="true" />
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Glow OS Home">
        <header className={styles.topbar}>
          <strong className={styles.wordmark}>Glow OS</strong>
          <span className={styles.homeLabel}>HOME</span>
          <button type="button" className={styles.askGlow} onClick={() => openGlow()} aria-expanded={glowOpen}>
            <span className={styles.miniMatter} aria-hidden="true" />
            <span>Ask Glow</span>
            <small>⌘ K</small>
          </button>
        </header>

        <section className={styles.intro}>
          <span>{dateText || 'Friday, Sep 4'} · {timeText || 'Now'}</span>
          <h1>What matters now?</h1>
          <p>Home stays simple. Continue what matters, return to Today, or ask Glow for anything.</p>
        </section>

        <section className={styles.homeCenter}>
          <div className={styles.centerMatter} aria-hidden="true"><GlowMatter /></div>

          <button type="button" className={`${styles.choice} ${styles.todayChoice}`} onClick={() => moveToday('what-now')}>
            <span className={styles.choiceEyebrow}>What matters now?</span>
            <strong>Today</strong>
            <span>Partnership proposal · 55 min remaining</span>
            <small>Open the current-day center</small>
            <ArrowRight />
          </button>

          <button type="button" className={`${styles.choice} ${styles.continueChoice}`} onClick={() => moveToday('focus')}>
            <span className={styles.choiceEyebrow}>Where was I?</span>
            <strong>Continue focus</strong>
            <span>Partnership proposal</span>
            <small>Your active work stays attached</small>
            <ArrowRight />
          </button>

          <button type="button" className={`${styles.choice} ${styles.askChoice}`} onClick={() => openGlow()}>
            <span className={styles.choiceEyebrow}>What do I want to do?</span>
            <strong>Ask Glow</strong>
            <span>Say it naturally. Glow finds the right place.</span>
            <small>No category knowledge required</small>
            <Sparkles />
          </button>
        </section>

        <nav className={styles.regionStrip} aria-label="Glow regions">
          {regions.map((region) => (
            <button key={region} type="button" onClick={() => openRegion(region)} className={region === 'Today' ? styles.regionActive : ''}>
              {region}
            </button>
          ))}
        </nav>
      </section>

      {glowOpen ? (
        <aside className={styles.glowPanel} role="dialog" aria-label="Ask Glow">
          <div className={styles.panelHead}>
            <span className={styles.miniMatter} />
            <div><strong>Glow</strong><small>Ask for anything in your own words.</small></div>
            <button onClick={() => setGlowOpen(false)} aria-label="Close">×</button>
          </div>
          {glowPrompt ? <div className={styles.promptPreview}>{glowPrompt}</div> : null}
          <p>You do not need to know whether something lives in Today, Plan, Life, Brain, or Create. Tell Glow what you mean.</p>
          <button type="button" onClick={() => moveToday('what-now')}>What should I do now?</button>
          <button type="button" onClick={() => moveToday('tomorrow')}>Show me tomorrow</button>
          <button type="button" onClick={() => moveToday('replan')}>Help me replan</button>
        </aside>
      ) : null}
    </main>
  );
}
