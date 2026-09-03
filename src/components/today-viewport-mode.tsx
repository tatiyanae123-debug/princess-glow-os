'use client';

import { useEffect } from 'react';

type TodayMode = 'reference' | 'adaptive';

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

function chooseTodayMode(): TodayMode {
  const { width, height } = viewportBox();
  if (isPhoneLike()) return 'adaptive';

  const ipad = isIPadLike();
  const paneIsLandscape = width > height;

  // iPad rule: use the architectural Living Center whenever the ACTUAL Glow pane
  // is landscape, even when Safari/Stage Manager/Split View reports misleading
  // physical screen dimensions. A very wide pane also wins as a safety net.
  if (ipad) {
    if ((paneIsLandscape && width >= 640) || width >= 900) return 'reference';
    return 'adaptive';
  }

  // Desktop/laptop rule. Never use aspect-ratio thresholds here; browser chrome
  // and split windows must not flip the room just because the viewport is short.
  return width >= 900 ? 'reference' : 'adaptive';
}

function forceTodaySurfaces(mode: TodayMode) {
  const root = document.documentElement;
  const { width, height } = viewportBox();
  const ipad = isIPadLike();

  root.dataset.todayMode = mode;
  root.dataset.todayPhysical = ipad ? 'ipad-like' : (isPhoneLike() ? 'phone-like' : 'other');
  root.dataset.todayViewport = `${width}x${height}`;

  const landscape = document.querySelectorAll<HTMLElement>('.today-landscape');
  const adaptive = document.querySelectorAll<HTMLElement>('.today-portrait');

  landscape.forEach((node) => {
    node.style.setProperty('display', mode === 'reference' ? 'block' : 'none', 'important');
    node.style.setProperty('visibility', mode === 'reference' ? 'visible' : 'hidden', 'important');
    node.style.setProperty('pointer-events', mode === 'reference' ? 'auto' : 'none', 'important');
  });

  adaptive.forEach((node) => {
    node.style.setProperty('display', mode === 'adaptive' ? 'block' : 'none', 'important');
    node.style.setProperty('visibility', mode === 'adaptive' ? 'visible' : 'hidden', 'important');
    node.style.setProperty('pointer-events', mode === 'adaptive' ? 'auto' : 'none', 'important');
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
        // Safari often changes visualViewport again after its bars settle.
        settleTimer = window.setTimeout(applyTodayMode, 180);
      });
    };

    schedule();

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    window.visualViewport?.addEventListener('resize', schedule, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedule, { passive: true });
    window.screen.orientation?.addEventListener?.('change', schedule);

    // This is the important part the old implementation was missing: Today can be
    // inserted after this controller's effect during navigation/hydration. Reapply
    // the authoritative inline !important display as soon as either room appears.
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
