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

const HORIZONS: { id: PlanHorizon; label: string }[] = [
  { id: 'today', label: 'TODAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'two-weeks', label: '2 WEEKS' },
  { id: 'month', label: 'MONTH' },
  { id: 'three-months', label: '3 MONTHS' },
];

const RAIL = [
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Routines', href: '/routines', icon: RotateCcw },
  { label: 'Habits', href: '/habits', icon: Orbit },
] as const;

type Props = {
  title: string;
  subtitle: string;
  activeInstrument: 'Tasks' | 'Reminders';
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
        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>GLOW OS <span>·</span> PLAN</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <nav className={styles.modeSwitch} aria-label="Plan modes">
            <Link href="/planning" className={styles.active}>PLAN</Link>
            <Link href="/today?room=focus">FOCUS</Link>
            <Link href="/projects">BUILD</Link>
            <Link href="/planning?mode=reflect">REFLECT</Link>
          </nav>

          <div className={styles.askWrap}>
            <Link href="/ask-glow" className={styles.askButton}>Ask Glow</Link>
            <Link href="/ask-glow" className={styles.askPearl} aria-label="Ask Glow" />
          </div>
        </header>

        <aside className={styles.planRail} aria-label="Plan instruments">
          {RAIL.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className={label === activeInstrument ? styles.active : undefined}>
              <span className={styles.railIcon}><Icon /></span>
              <span>{label}</span>
            </Link>
          ))}
        </aside>

        {children}

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
