'use client';

import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlowCurrentNavigation } from '@/components/navigation/glow-current-navigation';
import styles from './glow-current-home-world.module.css';

function ShaktiMatter() {
  return <span className={styles.shaktiMatter} aria-hidden="true"><i /><b /></span>;
}

function moveToday(room = 'morning') {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  window.location.assign(url.toString());
}

export function GlowCurrentHomeWorld() {
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [shaktiOpen, setShaktiOpen] = useState(false);
  const [notice, setNotice] = useState('');

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

  function unavailable(region: string) {
    setNotice(`${region} is already part of the Glow geography. Its new Glow Current environment will open here when that region is rebuilt, rather than sending you into an older layout.`);
  }

  return (
    <main className={styles.world}>
      <div className={styles.pearlLight} aria-hidden="true" />
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Glow OS Home">
        <header className={styles.topbar}>
          <span className={styles.centerLabel}>THE CENTER · GLOW CURRENT</span>
          <button type="button" className={styles.askShakti} onClick={() => setShaktiOpen((value) => !value)} aria-expanded={shaktiOpen}>
            <span className={styles.miniMatter} aria-hidden="true" />
            <span>Ask Shakti</span>
            <small>⌘ K</small>
          </button>
        </header>

        <section className={styles.intro}>
          <span>{dateText || 'Friday, Sep 4'}</span>
          <h1>You are still inside Glow.</h1>
          <p>The center does not launch apps. It reveals the larger geography around what you are already doing.</p>
        </section>

        <section className={styles.geography} aria-label="Glow OS geography">
          <div className={styles.threadA} aria-hidden="true" />
          <div className={styles.threadB} aria-hidden="true" />
          <div className={styles.threadC} aria-hidden="true" />

          <div className={styles.centerPresence}>
            <span className={styles.verticalBeam} aria-hidden="true" />
            <ShaktiMatter />
            <div className={styles.centerCopy}>
              <strong>Shakti</strong>
              <span>{timeText || 'Now'} · same context</span>
              <small>Press and hold open space to reveal the Current.</small>
            </div>
          </div>

          <button type="button" className={`${styles.climate} ${styles.todayClimate}`} onClick={() => moveToday()} aria-label="Move toward Today">
            <span className={styles.climateScene} aria-hidden="true" />
            <span className={styles.climateCopy}><strong>Today</strong><small>Immediate present</small></span>
          </button>

          <button type="button" className={`${styles.climate} ${styles.planClimate}`} onClick={() => unavailable('Plan')} aria-label="Preview Plan">
            <span className={styles.climateScene} aria-hidden="true" />
            <span className={styles.climateCopy}><strong>Plan</strong><small>Future depth</small></span>
          </button>

          <button type="button" className={`${styles.climate} ${styles.lifeClimate}`} onClick={() => unavailable('Life')} aria-label="Preview Life">
            <span className={styles.climateScene} aria-hidden="true" />
            <span className={styles.climateCopy}><strong>Life</strong><small>Inhabited systems</small></span>
          </button>

          <button type="button" className={`${styles.climate} ${styles.brainClimate}`} onClick={() => unavailable('Brain')} aria-label="Preview Brain">
            <span className={styles.climateScene} aria-hidden="true" />
            <span className={styles.climateCopy}><strong>Brain</strong><small>Relational depth</small></span>
          </button>

          <button type="button" className={`${styles.climate} ${styles.createClimate}`} onClick={() => unavailable('Create')} aria-label="Preview Create">
            <span className={styles.climateScene} aria-hidden="true" />
            <span className={styles.climateCopy}><strong>Create</strong><small>Open potential</small></span>
          </button>
        </section>

        <div className={styles.homeThread}><Sparkles size={13} /><span>The room you came from remains attached through Glow Thread.</span><button type="button" onClick={() => moveToday()}>Continue Today <ArrowUpRight size={13} /></button></div>
      </section>

      {notice ? <div className={styles.notice}><span>{notice}</span><button onClick={() => setNotice('')}>×</button></div> : null}

      {shaktiOpen ? (
        <aside className={styles.shaktiPanel} role="dialog" aria-label="Shakti at the Glow OS center">
          <div className={styles.panelHead}><span className={styles.miniMatter} /><div><strong>Shakti</strong><small>The center remembers where you came from.</small></div><button onClick={() => setShaktiOpen(false)}>×</button></div>
          <p>Say where you want to go in human terms. Glow Current should connect the meaning instead of making you choose which database or menu owns it.</p>
          <button type="button" onClick={() => moveToday('what-now')}>Take me to what matters now</button>
          <button type="button" onClick={() => moveToday('tomorrow')}>Show me tomorrow</button>
          <button type="button" onClick={() => moveToday('replan')}>Help me replan</button>
        </aside>
      ) : null}

      <GlowCurrentNavigation scope="home" currentLabel="Glow OS Center" />
    </main>
  );
}
