'use client';

import { useEffect, useState } from 'react';
import { GlowCurrentNavigation } from '@/components/navigation/glow-current-navigation';
import styles from './glow-current-today-shell.module.css';

const roomLabels: Record<string, string> = {
  morning: 'Morning Brief',
  'what-now': 'What Now?',
  focus: 'Focus Session',
  meeting: 'Design Review',
  'next-up': 'Next Up',
  later: 'Later',
  tonight: 'Tonight',
  tomorrow: 'Tomorrow Preview',
  replan: 'Replan My Day',
};

export function GlowCurrentTodayShell({ children }: { children: React.ReactNode }) {
  const [room, setRoom] = useState('morning');

  useEffect(() => {
    const sync = () => {
      const value = new URL(window.location.href).searchParams.get('room') || 'morning';
      setRoom(value);
    };
    sync();
    window.addEventListener('popstate', sync);
    const timer = window.setInterval(sync, 180);
    return () => {
      window.removeEventListener('popstate', sync);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={styles.scope} data-glow-current-today="true">
      {children}
      <GlowCurrentNavigation scope="today" currentRoom={room} currentLabel={roomLabels[room] ?? 'Today'} />
    </div>
  );
}
