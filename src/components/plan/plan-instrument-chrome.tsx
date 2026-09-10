'use client';

import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Orbit,
  RotateCcw,
  Target,
} from 'lucide-react';
import styles from './plan-instruments.module.css';

export type PlanHorizon = 'today' | 'week' | 'two-weeks' | 'month' | 'three-months';
export type PlanInstrument = 'Calendar' | 'Tasks' | 'Reminders' | 'Goals' | 'Projects' | 'Routines' | 'Habits';

const HORIZONS: { id: PlanHorizon; label: string }[] = [
  { id: 'today', label: 'DAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'two-weeks', label: 'MONTH' },
  { id: 'month', label: 'QUARTER' },
  { id: 'three-months', label: 'YEAR' },
];

const RAIL: { label: PlanInstrument; href: string; icon: typeof CalendarDays }[] = [
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Routines', href: '/planning/routines', icon: RotateCcw },
  { label: 'Habits', href: '/habits', icon: Orbit },
];

type Props = {
  title: string;
  subtitle: string;
  activeInstrument: PlanInstrument;
  horizon: PlanHorizon;
  onHorizonChange: (value: PlanHorizon) => void;
  centerLabel: string;
  rightReceipt?: string;
  remindersLayout?: boolean;
  children: React.ReactNode;
};

export function PlanInstrumentChrome({
  title,
  subtitle,
  activeInstrument,
  horizon,
  onHorizonChange,
  centerLabel,
  rightReceipt = 'Saved just now',
  remindersLayout = false,
  children,
}: Props) {
  return (
    <main className={`${styles.planInstrumentRoot} planInstrumentRoot`} data-plan-instrument={activeInstrument.toLowerCase()}>
      <section className={styles.shell}>
        <span className={`${styles.shellPearl} ${styles.shellPearlA}`} aria-hidden="true" />
        <span className={`${styles.shellPearl} ${styles.shellPearlB}`} aria-hidden="true" />
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>GLOW OS BATCH 1 <span>·</span> WORLD 2</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <nav className={styles.modeSwitch} aria-label="Plan modes">
            <Link href="/planning" className={styles.active} aria-current="page">PLAN</Link>
            <Link href="/today?room=focus">FOCUS</Link>
            <Link href="/projects">BUILD</Link>
            <Link href="/planning/studio?mode=reflect">REFLECT</Link>
          </nav>

          <div className={styles.askWrap}>
            <Link href="/ask-glow" className={styles.askButton} aria-label="Ask Glow">
              <span className={styles.askPearl} aria-hidden="true" />
              <span>Ask Glow</span>
            </Link>
          </div>
        </header>

        <aside className={styles.planRail} aria-label="Nearby Plan instruments">
          {RAIL.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className={label === activeInstrument ? styles.active : undefined} aria-current={label === activeInstrument ? 'page' : undefined}>
              <span className={styles.railIcon}><Icon /></span>
              <span>{label}</span>
            </Link>
          ))}
        </aside>

        <div className={remindersLayout ? styles.remindersStageHost : undefined}>{children}</div>

        <footer className={styles.footer}>
          <div className={styles.horizonSwitch} aria-label="Plan horizon">
            {HORIZONS.map((item) => (
              <button key={item.id} type="button" className={horizon === item.id ? styles.active : undefined} onClick={() => onHorizonChange(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.footerCenter}>
            <span>‹</span>
            <strong>{centerLabel}</strong>
            <span>›</span>
            <span aria-hidden="true">▣</span>
          </div>

          <div className={styles.footerRight}>
            <button type="button" className={styles.footerGhost} onClick={() => history.back()}>↶ UNDO</button>
            <button type="button" className={styles.footerGhost} onClick={() => history.forward()}>REDO ↷</button>
            <span className={styles.footerReceipt}>{rightReceipt} <b>✓</b></span>
          </div>
        </footer>
      </section>
    </main>
  );
}
