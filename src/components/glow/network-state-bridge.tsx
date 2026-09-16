'use client';

import { useEffect } from 'react';

export function NetworkStateBridge() {
  useEffect(() => {
    const sync = () => {
      document.documentElement.dataset.glowNetwork = navigator.onLine ? 'online' : 'offline';
    };
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
      delete document.documentElement.dataset.glowNetwork;
    };
  }, []);
  return null;
}
