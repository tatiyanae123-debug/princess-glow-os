'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './glow-current-home-world.module.css';

function GlowMatter() {
  return <span className={styles.glowMatter} aria-hidden="true"><i /><b /></span>;
}

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function moveToday(room = 'what-now') {
  travel(`/today?room=${encodeURIComponent(room)}`);
}

function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function GlowCurrentHomeWorld() {
  const personal = usePersonalContext();
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');

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

  const homeContext = useMemo(() => {
    if (personal.status !== 'ready') {
      return {
        nowTitle: personal.status === 'loading' ? 'Loading your day…' : 'Your day is not connected yet',
        nowDetail: personal.status === 'loading' ? 'Reading your Glow data' : 'Sign in to show your real tasks and schedule',
        continueTitle: 'No active focus yet',
        continueDetail: 'Open Today to choose what matters now',
        focusRoom: 'what-now',
      };
    }

    const data = personal.data;
    const activeTask = data.activeTask;
    const nextEvent = data.todayEvents.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? data.events[0] ?? null;

    const nowTitle = activeTask?.title ?? nextEvent?.title ?? 'Nothing is demanding your attention';
    const nowDetail = activeTask
      ? `${activeTask.priority} priority · ${activeTask.status === 'in_progress' ? 'in progress' : 'ready when you are'}`
      : nextEvent
        ? `${formatEventTime(nextEvent.startAt)}${nextEvent.location ? ` · ${nextEvent.location}` : ''}`
        : 'Your real tasks and calendar are clear right now';

    const continueTask = data.tasks.find((task) => task.status === 'in_progress') ?? null;
    return {
      nowTitle,
      nowDetail,
      continueTitle: continueTask ? 'Continue focus' : 'Choose a focus',
      continueDetail: continueTask?.title ?? 'No in-progress task is currently set',
      focusRoom: continueTask ? 'focus' : 'what-now',
    };
  }, [personal]);

  function openGlow() {
    document.dispatchEvent(new CustomEvent('glow:open'));
  }

  return (
    <main className={styles.world}>
      <div className={styles.pearlLight} aria-hidden="true" />
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Glow OS Home">
        <section className={styles.intro}>
          <span>{dateText} · {timeText}</span>
          <h1>What matters now?</h1>
          <p>{personal.status === 'ready' && personal.data.user.name ? `${personal.data.user.name.split(' ')[0]}, this Home reflects your connected Glow data.` : 'Home shows only information that belongs to the signed-in account.'}</p>
        </section>

        <section className={styles.homeCenter}>
          <div className={styles.centerMatter} aria-hidden="true"><GlowMatter /></div>

          <button type="button" className={`${styles.choice} ${styles.todayChoice}`} onClick={() => moveToday('what-now')}>
            <span className={styles.choiceEyebrow}>What matters now?</span>
            <strong>{homeContext.nowTitle}</strong>
            <span>{homeContext.nowDetail}</span>
            <small>Move into your current-day center</small>
            <ArrowRight />
          </button>

          <button type="button" className={`${styles.choice} ${styles.continueChoice}`} onClick={() => moveToday(homeContext.focusRoom)}>
            <span className={styles.choiceEyebrow}>Where was I?</span>
            <strong>{homeContext.continueTitle}</strong>
            <span>{homeContext.continueDetail}</span>
            <small>Only your real active work appears here</small>
            <ArrowRight />
          </button>

          <button type="button" className={`${styles.choice} ${styles.askChoice}`} onClick={openGlow}>
            <span className={styles.choiceEyebrow}>What do I want to do?</span>
            <strong>Ask Glow</strong>
            <span>Say it naturally. Shakti finds the right path.</span>
            <small>No category knowledge required</small>
            <Sparkles />
          </button>
        </section>
      </section>
    </main>
  );
}
