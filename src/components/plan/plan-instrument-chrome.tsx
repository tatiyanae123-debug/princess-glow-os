'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  { id: 'today', label: 'TODAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'two-weeks', label: '2 WEEKS' },
  { id: 'month', label: 'MONTH' },
  { id: 'three-months', label: '3 MONTHS' },
];

const RAIL: { label: PlanInstrument; href: string; icon: typeof CalendarDays }[] = [
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Routines', href: '/routines', icon: RotateCcw },
  { label: 'Habits', href: '/habits', icon: Orbit },
];

type PlanHistoryState = {
  canUndo?: boolean;
  canRedo?: boolean;
  receipt?: string;
};

type Props = {
  title: string;
  subtitle: string;
  activeInstrument: PlanInstrument;
  horizon: PlanHorizon;
  onHorizonChange: (value: PlanHorizon) => void;
  centerLabel: string;
  rightReceipt?: string;
  remindersLayout?: boolean;
  footerActionLabel?: string;
  onFooterAction?: () => void;
  children: React.ReactNode;
};

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function openGlow(context: Record<string, string> = {}) {
  document.dispatchEvent(new CustomEvent('glow:open', { detail: { context } }));
}

export function PlanInstrumentChrome({
  title,
  subtitle,
  activeInstrument,
  horizon,
  onHorizonChange,
  centerLabel,
  rightReceipt = 'Live state',
  remindersLayout = false,
  footerActionLabel,
  onFooterAction,
  children,
}: Props) {
  const [historyState, setHistoryState] = useState<PlanHistoryState>({ canUndo: false, canRedo: false });

  useEffect(() => {
    const receive = (event: Event) => {
      const detail = (event as CustomEvent<PlanHistoryState>).detail ?? {};
      setHistoryState((current) => ({ ...current, ...detail }));
    };
    const clear = () => setHistoryState({ canUndo: false, canRedo: false });
    document.addEventListener('glow:plan-history-state', receive as EventListener);
    document.addEventListener('glow:plan-history-clear', clear);
    return () => {
      document.removeEventListener('glow:plan-history-state', receive as EventListener);
      document.removeEventListener('glow:plan-history-clear', clear);
    };
  }, []);

  const receipt = historyState.receipt ?? rightReceipt;

  return (
    <main className={`${styles.planInstrumentRoot} planInstrumentRoot`} data-plan-instrument={activeInstrument.toLowerCase()}>
      <section className={styles.shell} data-plan-role="instrument-shell">
        <header className={styles.header} data-plan-role="header">
          <div className={styles.titleBlock}>
            <div className={styles.kicker}>GLOW OS <span>·</span> PLAN</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <nav className={styles.modeSwitch} aria-label="Plan modes" data-plan-role="mode-switch">
            <button type="button" className={styles.active} onClick={() => travel('/planning')}>PLAN</button>
            <button type="button" onClick={() => travel('/today?room=focus')}>FOCUS</button>
            <button type="button" onClick={() => travel('/projects')}>BUILD</button>
            <button type="button" onClick={() => travel('/planning/studio?mode=reflect')}>REFLECT</button>
          </nav>

          <button
            type="button"
            className={styles.askButton}
            onClick={() => openGlow({ room: title, world: 'Plan' })}
            aria-label={`Ask Glow from ${title}`}
            data-plan-role="ask-glow"
          >
            <span className={styles.askPearl} aria-hidden="true" />
            <span>Ask Glow</span>
          </button>
        </header>

        <aside className={styles.planRail} aria-label="Nearby Plan instruments" data-plan-role="instrument-rail">
          {RAIL.map(({ label, href, icon: Icon }) => (
            <Link key={label} href={href} className={label === activeInstrument ? styles.active : undefined} aria-current={label === activeInstrument ? 'page' : undefined}>
              <span className={styles.railIcon}><Icon /></span>
              <span>{label}</span>
            </Link>
          ))}
        </aside>

        <div className={remindersLayout ? styles.remindersStageHost : undefined}>{children}</div>

        <footer className={styles.footer} data-plan-role="footer">
          <div className={styles.horizonSwitch} aria-label="Plan horizon" data-plan-role="horizon-switch">
            {HORIZONS.map((item) => (
              <button key={item.id} type="button" className={horizon === item.id ? styles.active : undefined} onClick={() => onHorizonChange(item.id)}>
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.footerCenter} data-plan-role="date-control">
            <span aria-hidden="true">‹</span>
            <strong>{centerLabel}</strong>
            <span aria-hidden="true">›</span>
            <span aria-hidden="true">▣</span>
          </div>

          <div className={styles.footerRight} data-plan-role="history-controls">
            <button
              type="button"
              className={styles.footerGhost}
              onClick={() => document.dispatchEvent(new CustomEvent('glow:plan-undo'))}
              disabled={!historyState.canUndo}
              aria-disabled={!historyState.canUndo}
            >↶ UNDO</button>
            <button
              type="button"
              className={styles.footerGhost}
              onClick={() => document.dispatchEvent(new CustomEvent('glow:plan-redo'))}
              disabled={!historyState.canRedo}
              aria-disabled={!historyState.canRedo}
            >REDO ↷</button>
            {footerActionLabel && onFooterAction ? (
              <button type="button" className={styles.footerReceipt} onClick={onFooterAction}>{footerActionLabel} <b>✓</b></button>
            ) : (
              <span className={styles.footerReceipt}>{receipt} <b>✓</b></span>
            )}
          </div>
        </footer>
      </section>
    </main>
  );
}
