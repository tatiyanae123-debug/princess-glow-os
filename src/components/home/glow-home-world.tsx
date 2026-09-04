'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  CalendarDays,
  Layers3,
  Sparkles,
  SunMedium,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './glow-home-world.module.css';
import previewStyles from './glow-region-preview.module.css';

type RegionKey = 'today' | 'plan' | 'life' | 'brain' | 'create';

type Region = {
  key: RegionKey;
  name: string;
  question: string;
  description: string;
  icon: React.ReactNode;
};

const regions: Region[] = [
  {
    key: 'today',
    name: 'Today',
    question: 'What matters now?',
    description: 'The immediate present: what is happening now, what comes next, and what needs your attention today.',
    icon: <SunMedium size={20} strokeWidth={1.45} />,
  },
  {
    key: 'plan',
    name: 'Plan',
    question: 'What is coming?',
    description: 'The future: tomorrow, your week, projects, commitments, goals, and longer time horizons.',
    icon: <CalendarDays size={20} strokeWidth={1.45} />,
  },
  {
    key: 'life',
    name: 'Life',
    question: 'What supports me?',
    description: 'Your inhabited systems: beauty, hair, fitness, food, money, home, relationships, health, routines, and more.',
    icon: <Layers3 size={20} strokeWidth={1.45} />,
  },
  {
    key: 'brain',
    name: 'Brain',
    question: 'What am I thinking?',
    description: 'Memory, notes, observations, knowledge, questions, ideas, learning, patterns, and connections.',
    icon: <Brain size={20} strokeWidth={1.45} />,
  },
  {
    key: 'create',
    name: 'Create',
    question: 'What wants to become real?',
    description: 'Writing, designing, building, drafts, references, versions, experiments, and active creative work.',
    icon: <WandSparkles size={20} strokeWidth={1.45} />,
  },
];

function Matter({ small = false }: { small?: boolean }) {
  return <span aria-hidden="true" className={`${styles.matter} ${small ? styles.matterSmall : ''}`}><span /></span>;
}

export function GlowHomeWorld() {
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [glowOpen, setGlowOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);

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

  const selected = activeRegion ? regions.find((region) => region.key === activeRegion) ?? null : null;

  function openRegion(region: RegionKey) {
    if (region === 'today') {
      window.location.assign('/today');
      return;
    }
    setActiveRegion(region);
  }

  return (
    <main className={styles.world}>
      <div className={styles.pearlWash} aria-hidden="true" />
      <div className={styles.prismA} aria-hidden="true" />
      <div className={styles.prismB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Glow OS Home">
        <header className={styles.topbar}>
          <Link href="/home" className={styles.wordmark}>Glow OS</Link>
          <div className={styles.homeLabel}>HOME · THE CENTER</div>
          <button type="button" className={styles.askShakti} onClick={() => setGlowOpen((value) => !value)} aria-expanded={glowOpen} aria-label="Ask Glow">
            <Matter small />
            <span>Ask Glow</span>
            <small>⌘ K</small>
          </button>
        </header>

        <div className={styles.orientationCopy}>
          <span>{dateText || 'Friday, Sep 4'}</span>
          <h1>Everything is still here.</h1>
          <p>Return to the center, then press where you want to go.</p>
        </div>

        <div className={styles.worldField}>
          <div className={styles.currentLine} aria-hidden="true" />
          <div className={styles.currentLineTwo} aria-hidden="true" />

          <div className={styles.shaktiCore}>
            <span className={styles.verticalBeam} aria-hidden="true" />
            <Matter />
            <div className={styles.shaktiCopy}>
              <span>Glow is with you</span>
              <strong>{timeText || 'Now'}</strong>
              <small>Same context. Same world.</small>
            </div>
          </div>

          {regions.map((region) => (
            <button
              key={region.key}
              type="button"
              className={`${styles.region} ${styles[`region_${region.key}`]}`}
              onClick={() => openRegion(region.key)}
              aria-label={`Open ${region.name}`}
            >
              <span className={styles.regionGlow} aria-hidden="true" />
              <span className={styles.regionIcon}>{region.icon}</span>
              <span className={styles.regionWords}>
                <strong>{region.name}</strong>
                <small>{region.question}</small>
              </span>
              <ArrowUpRight size={15} strokeWidth={1.4} className={styles.regionArrow} />
            </button>
          ))}
        </div>

        <footer className={styles.footer}>
          <div className={styles.threadReceipt}><Sparkles size={14} strokeWidth={1.4} /><span>Press a visible destination. Glow handles the movement underneath.</span></div>
          <Link href="/today" className={styles.continueToday}>Continue Today <ArrowUpRight size={15} strokeWidth={1.4} /></Link>
        </footer>

        {selected ? (
          <section className={`${previewStyles.preview} ${previewStyles[`preview_${selected.key}`]}`} aria-label={`${selected.name} region preview`}>
            <div className={previewStyles.environment} aria-hidden="true"><span /><i /><b /></div>
            <button type="button" className={previewStyles.backButton} onClick={() => setActiveRegion(null)}><ArrowLeft size={15} /> Home</button>
            <div className={previewStyles.copy}>
              <span className={previewStyles.eyebrow}>{selected.name}</span>
              <h2>{selected.question}</h2>
              <p>{selected.description}</p>
              <div className={previewStyles.status}><Sparkles size={14} /> This region stays in the new Glow Matter world. Its full room is being built without falling back to an old layout.</div>
            </div>
            <Matter />
          </section>
        ) : null}
      </section>

      {glowOpen ? (
        <section className={styles.shaktiPanel} role="dialog" aria-label="Ask Glow">
          <div className={styles.panelHead}><Matter small /><div><strong>Glow</strong><span>Home context is active</span></div><button onClick={() => setGlowOpen(false)} aria-label="Close">×</button></div>
          <p>Tell me where you want to go or what you want to do. You do not need to remember gestures or navigation vocabulary.</p>
          <Link href="/today" className={styles.panelAction}>Open Today <ArrowUpRight size={15} /></Link>
        </section>
      ) : null}
    </main>
  );
}
