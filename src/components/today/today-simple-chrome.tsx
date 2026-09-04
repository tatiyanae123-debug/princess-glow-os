'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './today-simple-chrome.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function TodaySimpleChrome() {
  const [room, setRoom] = useState<RoomKey>('morning');
  const [glowOpen, setGlowOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const value = new URL(window.location.href).searchParams.get('room') as RoomKey | null;
      setRoom(value || 'morning');
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  // Morning Brief and What Now each carry their own locked reference navigation.
  if (room === 'morning' || room === 'what-now') return null;

  return (
    <>
      <div className={styles.chrome} aria-label="Glow OS navigation">
        <div className={styles.leftCover}>
          <Link href="/home" className={styles.homeLink}>Glow OS</Link>
        </div>
        <div className={styles.rightCover}>
          <button type="button" className={styles.askGlow} onClick={() => setGlowOpen((value) => !value)} aria-expanded={glowOpen}>
            <span className={styles.pearl} aria-hidden="true" />
            <span>Ask Glow</span>
          </button>
        </div>
      </div>

      {glowOpen ? (
        <aside className={styles.panel} role="dialog" aria-label="Ask Glow">
          <div className={styles.panelHead}><strong>Glow</strong><button className={styles.close} onClick={() => setGlowOpen(false)} aria-label="Close">×</button></div>
          <p>Tell me what you want to do next. You do not need to remember any navigation gestures.</p>
          <button onClick={() => { setGlowOpen(false); goToRoom('what-now'); }}>What should I do now?</button>
          <button onClick={() => { setGlowOpen(false); goToRoom('replan'); }}>Replan my day</button>
          <button onClick={() => { setGlowOpen(false); goToRoom('morning'); }}>Return to Morning Brief</button>
        </aside>
      ) : null}
    </>
  );
}
