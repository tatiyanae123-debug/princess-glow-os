'use client';

import { useEffect } from 'react';

function isIPadLike() {
  if (typeof navigator === 'undefined') return false;
  return /iPad/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function setTodayMode() {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  const ipad = isIPadLike();
  const screenLandscape = window.screen.width > window.screen.height;
  const viewportWideEnough = window.innerWidth >= 640;
  const desktopReference = !ipad && window.innerWidth >= 900 && window.innerWidth / Math.max(1, window.innerHeight) >= 1.15;

  // Critical rule: an iPad that is physically landscape keeps the full Living Center
  // even when Safari chrome or Split View makes the webpage viewport look portrait-ish.
  const mode = (ipad && screenLandscape && viewportWideEnough) || desktopReference ? 'reference' : 'adaptive';
  root.dataset.todayMode = mode;
  root.dataset.todayPhysical = ipad ? (screenLandscape ? 'ipad-landscape' : 'ipad-portrait') : 'other';
}

export function TodayViewportMode() {
  useEffect(() => {
    setTodayMode();
    const onChange = () => requestAnimationFrame(setTodayMode);
    window.addEventListener('resize', onChange);
    window.addEventListener('orientationchange', onChange);
    window.visualViewport?.addEventListener('resize', onChange);
    window.screen.orientation?.addEventListener?.('change', onChange);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('orientationchange', onChange);
      window.visualViewport?.removeEventListener('resize', onChange);
      window.screen.orientation?.removeEventListener?.('change', onChange);
    };
  }, []);
  return null;
}
