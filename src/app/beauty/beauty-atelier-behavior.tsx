'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './beauty-personal-atelier.module.css';

type EventContext = {
  title: string;
  iso: string;
  timeLabel: string;
  location?: string | null;
} | null;

type InventoryContext = {
  owned: number;
  backups: number;
  testing: number;
  needsId: number;
  useFirst: number;
};

type Props = {
  nextEvent: EventContext;
  inventory: InventoryContext;
  energy: string;
  travelContext: boolean;
};

type Mode = 'normal' | 'get-ready' | 'inventory' | 'travel' | 'essentials';

const STATE_KEY = 'glow.beauty.atelier.state.v2';
const DEFAULT_PREP = [
  ['Skin prep', 10],
  ['Hair', 25],
  ['Makeup', 25],
  ['Body', 10],
  ['Fragrance', 3],
  ['Closet', 15],
] as const;

function clock(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function readSaved(): { focus?: string; mode?: Mode } {
  try {
    return JSON.parse(window.sessionStorage.getItem(STATE_KEY) ?? '{}') as { focus?: string; mode?: Mode };
  } catch {
    return {};
  }
}

function localGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

export function BeautyAtelierBehavior({ nextEvent, inventory, energy, travelContext }: Props) {
  const [mode, setMode] = useState<Mode>('normal');
  const [focus, setFocus] = useState('');
  const modeRef = useRef<Mode>('normal');
  const focusRef = useRef('');

  const prep = useMemo(() => {
    if (!nextEvent) return [];
    const eventTime = new Date(nextEvent.iso);
    let cursor = new Date(eventTime.getTime());
    const reverse: Array<{ label: string; minutes: number; starts: string; ends: string }> = [];
    for (const [label, minutes] of [...DEFAULT_PREP].reverse()) {
      const end = new Date(cursor.getTime());
      const start = new Date(end.getTime() - minutes * 60_000);
      reverse.push({ label, minutes, starts: clock(start), ends: clock(end) });
      cursor = start;
    }
    return reverse.reverse();
  }, [nextEvent]);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-beauty-atelier]');
    if (!root) return;

    const greeting = root.querySelector<HTMLElement>('[data-local-greeting]');
    if (greeting) greeting.textContent = localGreeting();

    const saved = readSaved();
    const initialMode: Mode = saved.mode ?? ((energy === 'Low' || energy === 'Exhausted') ? 'essentials' : 'normal');
    const initialFocus = saved.focus ?? '';
    modeRef.current = initialMode;
    focusRef.current = initialFocus;
    setMode(initialMode);
    setFocus(initialFocus);
    root.dataset.beautyMode = initialMode;
    if (initialFocus) root.dataset.beautyFocus = initialFocus;

    const persist = (nextFocus: string, nextMode: Mode) => {
      try { window.sessionStorage.setItem(STATE_KEY, JSON.stringify({ focus: nextFocus, mode: nextMode })); } catch {}
    };

    const click = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const ask = target.closest<HTMLElement>('[data-open-glow]');
      if (ask) {
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: 'Beauty: ' } }));
        return;
      }

      const modeTarget = target.closest<HTMLElement>('[data-beauty-mode]');
      if (modeTarget) {
        event.preventDefault();
        const nextMode = (modeTarget.dataset.beautyMode || 'normal') as Mode;
        modeRef.current = nextMode;
        setMode(nextMode);
        root.dataset.beautyMode = nextMode;
        persist(focusRef.current, nextMode);
        return;
      }

      const system = target.closest<HTMLAnchorElement>('[data-beauty-system]');
      if (!system) return;
      const href = system.getAttribute('href');
      const systemName = system.dataset.beautySystem || '';
      if (!href || !systemName) return;
      event.preventDefault();
      focusRef.current = systemName;
      setFocus(systemName);
      root.dataset.beautyFocus = systemName;
      root.dataset.beautyMoving = 'true';
      persist(systemName, modeRef.current);
      window.setTimeout(() => {
        document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path: href } }));
      }, 460);
    };

    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      focusRef.current = '';
      modeRef.current = 'normal';
      setFocus('');
      setMode('normal');
      delete root.dataset.beautyFocus;
      delete root.dataset.beautyMoving;
      root.dataset.beautyMode = 'normal';
      persist('', 'normal');
    };

    document.addEventListener('click', click);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('click', click);
      document.removeEventListener('keydown', key);
    };
  }, [energy]);

  const closeMode = () => {
    modeRef.current = 'normal';
    setMode('normal');
    const root = document.querySelector<HTMLElement>('[data-beauty-atelier]');
    if (root) root.dataset.beautyMode = 'normal';
    try { window.sessionStorage.setItem(STATE_KEY, JSON.stringify({ focus: focusRef.current, mode: 'normal' })); } catch {}
  };

  if (mode === 'normal') return null;

  return (
    <aside className={styles.modeOverlay} aria-live="polite">
      <button type="button" className={styles.modeClose} onClick={closeMode} aria-label="Return to Beauty Atelier">×</button>
      {mode === 'get-ready' ? (
        <>
          <small>GET READY CURRENT</small>
          <h2>{nextEvent ? nextEvent.title : 'No timed event is currently connected'}</h2>
          {nextEvent ? <p>Preparation estimate resolves backward from {nextEvent.timeLabel}{nextEvent.location ? ` · ${nextEvent.location}` : ''}. Travel time is not invented.</p> : <p>When a timed event appears, Skin, Hair, Makeup, Body, Fragrance and Closet will organize around it.</p>}
          {prep.length ? <div className={styles.prepSequence}>{prep.map((step) => <div key={step.label}><span>{step.starts}</span><strong>{step.label}</strong><em>{step.minutes} min · finish {step.ends}</em></div>)}</div> : null}
        </>
      ) : null}
      {mode === 'inventory' ? (
        <>
          <small>INVENTORY LENS</small>
          <h2>Check what you own before buying.</h2>
          <p>Ownership, use and today’s routine remain separate states.</p>
          <div className={styles.modeStats}>
            <span><b>{inventory.owned}</b>Owned</span>
            <span><b>{inventory.backups || '—'}</b>Backups</span>
            <span><b>{inventory.testing || '—'}</b>Testing</span>
            <span><b>{inventory.useFirst || '—'}</b>Use first</span>
            <span><b>{inventory.needsId || '—'}</b>Needs ID</span>
          </div>
          <a className={styles.modeAction} href="/beauty/inventory" data-beauty-system="inventory">Open Beauty Inventory</a>
        </>
      ) : null}
      {mode === 'travel' ? (
        <>
          <small>BEAUTY TRAVEL CURRENT</small>
          <h2>{travelContext ? 'Travel context is in view.' : 'No travel event is currently connected.'}</h2>
          <p>Glow only builds a travel kit from products and plans it can actually verify.</p>
          <a className={styles.modeAction} href="/beauty/skincare?view=travel-kit" data-beauty-system="travel-kit">Open travel kit</a>
        </>
      ) : null}
      {mode === 'essentials' ? (
        <>
          <small>ESSENTIALS ONLY</small>
          <h2>Low-energy Beauty.</h2>
          <p>Glow keeps the surface quiet and prioritizes only already-connected essentials. Nothing extra is invented.</p>
          <button type="button" className={styles.modeAction} data-beauty-mode="normal">Show full Atelier</button>
        </>
      ) : null}
    </aside>
  );
}
