'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  CircleDot,
  Layers3,
  Sparkles,
  SunMedium,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './glow-home-world.module.css';

type Region = {
  key: 'today' | 'plan' | 'life' | 'brain' | 'create';
  name: string;
  question: string;
  href?: string;
  icon: React.ReactNode;
};

const regions: Region[] = [
  {
    key: 'today',
    name: 'Today',
    question: 'What matters now?',
    href: '/today',
    icon: <SunMedium size={20} strokeWidth={1.45} />,
  },
  {
    key: 'plan',
    name: 'Plan',
    question: 'What is coming?',
    icon: <CalendarDays size={20} strokeWidth={1.45} />,
  },
  {
    key: 'life',
    name: 'Life',
    question: 'What supports me?',
    icon: <Layers3 size={20} strokeWidth={1.45} />,
  },
  {
    key: 'brain',
    name: 'Brain',
    question: 'What am I thinking?',
    icon: <Brain size={20} strokeWidth={1.45} />,
  },
  {
    key: 'create',
    name: 'Create',
    question: 'What wants to become real?',
    icon: <WandSparkles size={20} strokeWidth={1.45} />,
  },
];

function Matter({ small = false }: { small?: boolean }) {
  return <span aria-hidden="true" className={`${styles.matter} ${small ? styles.matterSmall : ''}`}><span /></span>;
}

export function GlowHomeWorld() {
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [shaktiOpen, setShaktiOpen] = useState(false);

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

  return (
    <main className={styles.world}>
      <div className={styles.pearlWash} aria-hidden="true" />
      <div className={styles.prismA} aria-hidden="true" />
      <div className={styles.prismB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Glow OS Home">
        <header className={styles.topbar}>
          <Link href="/home" className={styles.wordmark}>Glow OS</Link>
          <div className={styles.homeLabel}>HOME · THE CENTER</div>
          <button type="button" className={styles.askShakti} onClick={() => setShaktiOpen((value) => !value)} aria-expanded={shaktiOpen}>
            <Matter small />
            <span>Ask Shakti</span>
            <small>⌘ K</small>
          </button>
        </header>

        <div className={styles.orientationCopy}>
          <span>{dateText || 'Friday, Sep 4'}</span>
          <h1>Everything is still here.</h1>
          <p>Return to the center, then move toward what needs you.</p>
        </div>

        <div className={styles.worldField}>
          <div className={styles.currentLine} aria-hidden="true" />
          <div className={styles.currentLineTwo} aria-hidden="true" />

          <div className={styles.shaktiCore}>
            <span className={styles.verticalBeam} aria-hidden="true" />
            <Matter />
            <div className={styles.shaktiCopy}>
              <span>Shakti is with you</span>
              <strong>{timeText || 'Now'}</strong>
              <small>Same context. Same world.</small>
            </div>
          </div>

          {regions.map((region) => {
            const content = (
              <>
                <span className={styles.regionGlow} aria-hidden="true" />
                <span className={styles.regionIcon}>{region.icon}</span>
                <span className={styles.regionWords}>
                  <strong>{region.name}</strong>
                  <small>{region.question}</small>
                </span>
                {region.href ? <ArrowUpRight size={15} strokeWidth={1.4} className={styles.regionArrow} /> : <CircleDot size={12} strokeWidth={1.3} className={styles.regionArrow} />}
              </>
            );

            if (region.href) {
              return <Link key={region.key} href={region.href} className={`${styles.region} ${styles[`region_${region.key}`]}`}>{content}</Link>;
            }

            return <button key={region.key} type="button" className={`${styles.region} ${styles[`region_${region.key}`]}`} onClick={() => setShaktiOpen(true)}>{content}</button>;
          })}
        </div>

        <footer className={styles.footer}>
          <div className={styles.threadReceipt}><Sparkles size={14} strokeWidth={1.4} /><span>Home holds your place. Moving outward keeps the active thread attached.</span></div>
          <Link href="/today" className={styles.continueToday}>Continue Today <ArrowUpRight size={15} strokeWidth={1.4} /></Link>
        </footer>
      </section>

      {shaktiOpen ? (
        <section className={styles.shaktiPanel} role="dialog" aria-label="Shakti at Home">
          <div className={styles.panelHead}><Matter small /><div><strong>Shakti</strong><span>Home context is active</span></div><button onClick={() => setShaktiOpen(false)} aria-label="Close">×</button></div>
          <p>Home is the center of Glow OS. Today is ready now. Plan, Life, Brain, and Create remain visible as connected climates while their new rooms are rebuilt.</p>
          <Link href="/today" className={styles.panelAction}>Move toward Today <ArrowUpRight size={15} /></Link>
        </section>
      ) : null}
    </main>
  );
}
