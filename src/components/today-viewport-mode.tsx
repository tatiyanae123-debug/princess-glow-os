'use client';

import { useEffect } from 'react';

type TodayMode = 'reference' | 'adaptive';

declare global {
  interface Window {
    orientation?: number;
  }
}

function isIPadLike() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const platform = navigator.platform || '';
  const touch = navigator.maxTouchPoints || 0;
  return /iPad/i.test(ua) || (/Mac/i.test(platform) && touch > 1);
}

function isPhoneLike() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  if (/iPhone|iPod/i.test(navigator.userAgent || '')) return true;
  if (isIPadLike()) return false;
  const touch = (navigator.maxTouchPoints || 0) > 0;
  const shortestScreenSide = Math.min(window.screen.width || 9999, window.screen.height || 9999);
  return touch && shortestScreenSide < 700;
}

function viewportBox() {
  const vv = window.visualViewport;
  return {
    width: Math.round(vv?.width || window.innerWidth || document.documentElement.clientWidth || 0),
    height: Math.round(vv?.height || window.innerHeight || document.documentElement.clientHeight || 0),
  };
}

function physicalOrientation(): 'landscape' | 'portrait' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';

  const screenOrientation = window.screen.orientation;
  const type = screenOrientation?.type || '';
  if (type.includes('landscape')) return 'landscape';
  if (type.includes('portrait')) return 'portrait';

  const angle = typeof screenOrientation?.angle === 'number' ? Math.abs(screenOrientation.angle % 180) : null;
  if (angle === 90) return 'landscape';
  if (angle === 0) return 'portrait';

  const legacy = typeof window.orientation === 'number' ? Math.abs(window.orientation % 180) : null;
  if (legacy === 90) return 'landscape';
  if (legacy === 0) return 'portrait';

  const availW = window.screen.availWidth || window.screen.width || 0;
  const availH = window.screen.availHeight || window.screen.height || 0;
  if (availW && availH) return availW > availH ? 'landscape' : 'portrait';

  return 'unknown';
}

function chooseTodayMode(): TodayMode {
  const { width, height } = viewportBox();
  if (isPhoneLike()) return 'adaptive';

  if (isIPadLike()) {
    const physical = physicalOrientation();

    // iPad rule: physical orientation is authoritative. Split View, Safari chrome,
    // zoom and Stage Manager are allowed to change the pane dimensions without
    // replacing the room. A landscape iPad ALWAYS keeps the Living Center.
    if (physical === 'landscape') return 'reference';
    if (physical === 'portrait') return 'adaptive';

    // Only if Safari exposes no orientation API do we fall back to the pane shape.
    return width > height ? 'reference' : 'adaptive';
  }

  // Desktop/laptop keeps the wide room whenever there is enough horizontal canvas.
  return width >= 900 ? 'reference' : 'adaptive';
}

function forceTodaySurfaces(mode: TodayMode) {
  const root = document.documentElement;
  const { width, height } = viewportBox();
  const ipad = isIPadLike();
  const physical = ipad ? physicalOrientation() : 'unknown';

  root.dataset.todayMode = mode;
  root.dataset.todayPhysical = ipad ? `ipad-${physical}` : (isPhoneLike() ? 'phone-like' : 'other');
  root.dataset.todayViewport = `${width}x${height}`;

  const landscape = document.querySelectorAll<HTMLElement>('.today-landscape');
  const adaptive = document.querySelectorAll<HTMLElement>('.today-portrait');

  landscape.forEach((node) => {
    node.style.setProperty('display', mode === 'reference' ? 'block' : 'none', 'important');
    node.style.setProperty('visibility', mode === 'reference' ? 'visible' : 'hidden', 'important');
    node.style.setProperty('pointer-events', mode === 'reference' ? 'auto' : 'none', 'important');
    node.setAttribute('aria-hidden', mode === 'reference' ? 'false' : 'true');
  });

  adaptive.forEach((node) => {
    node.style.setProperty('display', mode === 'adaptive' ? 'block' : 'none', 'important');
    node.style.setProperty('visibility', mode === 'adaptive' ? 'visible' : 'hidden', 'important');
    node.style.setProperty('pointer-events', mode === 'adaptive' ? 'auto' : 'none', 'important');
    node.setAttribute('aria-hidden', mode === 'adaptive' ? 'false' : 'true');
  });
}

function applyTodayMode() {
  if (typeof window === 'undefined') return;
  forceTodaySurfaces(chooseTodayMode());
}

export function TodayViewportMode() {
  useEffect(() => {
    let frame = 0;
    let settleTimer = 0;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        applyTodayMode();
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(applyTodayMode, 180);
      });
    };

    schedule();

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.screen.orientation?.addEventListener?.('change', schedule);

    const observer = new MutationObserver((records) => {
      if (records.some((record) => record.addedNodes.length || record.removedNodes.length)) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('scroll', schedule);
      window.screen.orientation?.removeEventListener?.('change', schedule);
    };
  }, []);

  return null;
}
