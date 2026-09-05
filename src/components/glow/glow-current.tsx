'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { roomExperienceFor, type GlowWorld } from '@/lib/glow-world/room-experience';

type ThreadEntry = {
  path: string;
  room: string;
  world: GlowWorld;
  visitedAt: number;
};

type WorldTarget = {
  world: GlowWorld;
  label: string;
  path: string;
  cue: string;
};

const THREAD_KEY = 'glow.current.thread.v1';
const MAX_THREAD = 8;

const WORLD_TARGETS: WorldTarget[] = [
  { world: 'today', label: 'Today', path: '/today', cue: 'the immediate present' },
  { world: 'plan', label: 'Plan', path: '/planning', cue: 'time extending forward' },
  { world: 'life', label: 'Life', path: '/world', cue: 'your inhabited systems' },
  { world: 'brain', label: 'Brain', path: '/brain', cue: 'memory and connection depth' },
  { world: 'create', label: 'Create', path: '/inbox', cue: 'unfinished possibility' },
];

function readableRoom(pathname: string) {
  const experience = roomExperienceFor(pathname);
  return experience.room
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function dispatchMove(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

export function GlowCurrent() {
  const pathname = usePathname();
  const currentExperience = useMemo(() => roomExperienceFor(pathname), [pathname]);
  const [worldFoldOpen, setWorldFoldOpen] = useState(false);
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const previousPathRef = useRef(pathname);
  const suppressNextHistoryRef = useRef(false);

  const persistThread = useCallback((next: ThreadEntry[]) => {
    const trimmed = next.slice(-MAX_THREAD);
    setThread(trimmed);
    try {
      window.sessionStorage.setItem(THREAD_KEY, JSON.stringify(trimmed));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(THREAD_KEY);
      if (saved) setThread(JSON.parse(saved) as ThreadEntry[]);
    } catch {}
  }, []);

  useEffect(() => {
    const previous = previousPathRef.current;
    if (previous && previous !== pathname) {
      if (suppressNextHistoryRef.current) {
        suppressNextHistoryRef.current = false;
      } else if (previous !== '/sign-in' && !previous.startsWith('/api/')) {
        const experience = roomExperienceFor(previous);
        persistThread([
          ...thread.filter((entry, index) => entry.path !== previous || index !== thread.length - 1),
          {
            path: previous,
            room: readableRoom(previous),
            world: experience.world,
            visitedAt: Date.now(),
          },
        ]);
      }
    }
    previousPathRef.current = pathname;
  }, [pathname, persistThread, thread]);

  const travel = useCallback((path: string) => {
    if (!path || path === pathname) {
      setWorldFoldOpen(false);
      return;
    }
    setWorldFoldOpen(false);
    dispatchMove(path);
  }, [pathname]);

  const reverseCurrent = useCallback(() => {
    const destination = thread.at(-1);
    if (!destination) return;
    suppressNextHistoryRef.current = true;
    persistThread(thread.slice(0, -1));
    setWorldFoldOpen(false);
    dispatchMove(destination.path);
  }, [persistThread, thread]);

  useEffect(() => {
    const openCurrent = () => setWorldFoldOpen(true);
    const reverse = () => reverseCurrent();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWorldFoldOpen(false);
      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        reverseCurrent();
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setWorldFoldOpen((open) => !open);
      }
    };

    document.addEventListener('glow:current-open', openCurrent);
    document.addEventListener('glow:world-fold', openCurrent);
    document.addEventListener('glow:reverse-current', reverse);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('glow:current-open', openCurrent);
      document.removeEventListener('glow:world-fold', openCurrent);
      document.removeEventListener('glow:reverse-current', reverse);
      document.removeEventListener('keydown', key);
    };
  }, [reverseCurrent]);

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;

  return (
    <div className="glow-current" data-world={currentExperience.world}>
      <button
        type="button"
        className="glow-current__return-anchor"
        onClick={() => travel('/today')}
        aria-label="Return to Today"
        title="Return to Today"
      >
        <span className="glow-current__return-light" aria-hidden="true" />
      </button>

      <button
        type="button"
        className="glow-current__seam"
        onClick={() => setWorldFoldOpen((open) => !open)}
        aria-label="Open Glow Current"
        aria-expanded={worldFoldOpen}
        title="Glow Current · Command/Control-Shift-G"
      >
        <span className="glow-current__seam-core" aria-hidden="true" />
        <span className="glow-current__seam-wave" aria-hidden="true" />
      </button>

      {thread.length ? (
        <button
          type="button"
          className="glow-current__reverse"
          onClick={reverseCurrent}
          aria-label={`Reverse the Current to ${thread.at(-1)?.room ?? 'previous space'}`}
          title="Reverse the Current · Alt-Left Arrow"
        >
          <span aria-hidden="true">‹</span>
        </button>
      ) : null}

      {worldFoldOpen ? (
        <section className="glow-current__fold" aria-label="Glow OS world fold">
          <button
            type="button"
            className="glow-current__fold-dismiss"
            onClick={() => setWorldFoldOpen(false)}
            aria-label="Close Glow Current"
          />

          <div className="glow-current__field" role="dialog" aria-modal="true" aria-labelledby="glow-current-room">
            <div className="glow-current__field-light" aria-hidden="true" />

            <div className="glow-current__center" data-world={currentExperience.world}>
              <span className="glow-current__center-kicker">You are here</span>
              <strong id="glow-current-room">{readableRoom(pathname)}</strong>
              <span>{currentExperience.primaryQuestion}</span>
            </div>

            <div className="glow-current__geography" aria-label="Major Glow regions">
              {WORLD_TARGETS.map((target) => (
                <button
                  key={target.world}
                  type="button"
                  className="glow-current__climate"
                  data-world={target.world}
                  data-current={currentExperience.world === target.world ? 'true' : 'false'}
                  onClick={() => travel(target.path)}
                  aria-label={`Travel to ${target.label}, ${target.cue}`}
                >
                  <span className="glow-current__climate-depth" aria-hidden="true" />
                  <span className="glow-current__climate-light" aria-hidden="true" />
                  <span className="glow-current__climate-copy">
                    <strong>{target.label}</strong>
                    <small>{target.cue}</small>
                  </span>
                </button>
              ))}
            </div>

            {thread.length ? (
              <div className="glow-current__thread" aria-label="Glow Thread recent journey">
                <span className="glow-current__thread-label">Glow Thread</span>
                <div className="glow-current__thread-line" aria-hidden="true" />
                <div className="glow-current__thread-memories">
                  {thread.slice(-5).map((entry, index) => (
                    <button
                      key={`${entry.path}-${entry.visitedAt}-${index}`}
                      type="button"
                      className="glow-current__memory"
                      data-world={entry.world}
                      onClick={() => travel(entry.path)}
                      aria-label={`Return to ${entry.room}`}
                    >
                      <span aria-hidden="true" />
                      <small>{entry.room}</small>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="glow-current__hint" aria-hidden="true">
              <span>Focus · Reveal · Drift · Transform · Orbit · Dive · Surface</span>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
