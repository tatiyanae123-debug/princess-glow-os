'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { roomExperienceFor, type GlowWorld } from '@/lib/glow-world/room-experience';
import {
  WORLD_TARGETS,
  currentPathFor,
  depthLabelsForPath,
  enclosureForPath,
  railTargetIsActive,
  railTargetsForWorld,
  returnTargetForPath,
  roomLabelForPath,
  worldLabelFor,
} from '@/lib/glow-world/navigation-shell';

type ThreadEntry = {
  path: string;
  room: string;
  world: GlowWorld;
  visitedAt: number;
};

type DockAction = {
  label: string;
  path?: string;
  event?: string;
  ariaLabel?: string;
};

type DockActions = {
  left?: DockAction | null;
  center?: DockAction | null;
  right?: DockAction | null;
};

const THREAD_KEY = 'glow.current.thread.v2';
const MAX_THREAD = 10;

function dispatchMove(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

export function GlowCurrent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = useMemo(() => currentPathFor(pathname, search), [pathname, search]);
  const currentExperience = useMemo(() => roomExperienceFor(pathname), [pathname]);
  const currentRoom = useMemo(() => roomLabelForPath(currentPath, currentExperience.world), [currentExperience.world, currentPath]);
  const depth = useMemo(() => depthLabelsForPath(currentPath, currentExperience.world), [currentExperience.world, currentPath]);
  const returnTarget = useMemo(() => returnTargetForPath(currentPath, currentExperience.world), [currentExperience.world, currentPath]);
  const railTargets = useMemo(() => railTargetsForWorld(currentExperience.world), [currentExperience.world]);
  const enclosure = useMemo(() => enclosureForPath(currentPath), [currentPath]);

  const [worldFoldOpen, setWorldFoldOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const [dockActions, setDockActions] = useState<DockActions>({});
  const previousPathRef = useRef(currentPath);
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
    document.documentElement.dataset.glowShellWorld = currentExperience.world;
    document.documentElement.dataset.glowShellRoom = currentRoom;
    document.documentElement.dataset.glowEnclosure = enclosure;
    return () => {
      delete document.documentElement.dataset.glowShellWorld;
      delete document.documentElement.dataset.glowShellRoom;
      delete document.documentElement.dataset.glowEnclosure;
    };
  }, [currentExperience.world, currentRoom, enclosure]);

  useEffect(() => {
    const previous = previousPathRef.current;
    if (previous && previous !== currentPath) {
      if (suppressNextHistoryRef.current) {
        suppressNextHistoryRef.current = false;
      } else if (previous !== '/sign-in' && !previous.startsWith('/api/')) {
        const previousPathname = previous.split('?')[0] || '/today';
        const experience = roomExperienceFor(previousPathname);
        persistThread([
          ...thread.filter((entry, index) => entry.path !== previous || index !== thread.length - 1),
          {
            path: previous,
            room: roomLabelForPath(previous, experience.world),
            world: experience.world,
            visitedAt: Date.now(),
          },
        ]);
      }
    }
    previousPathRef.current = currentPath;
  }, [currentPath, persistThread, thread]);

  const travel = useCallback((path: string) => {
    if (!path || path === currentPath) {
      setWorldFoldOpen(false);
      setRailOpen(false);
      return;
    }
    setWorldFoldOpen(false);
    setRailOpen(false);
    setDockActions({});
    dispatchMove(path);
  }, [currentPath]);

  const reverseCurrent = useCallback(() => {
    const destination = thread.at(-1);
    if (!destination) return;
    suppressNextHistoryRef.current = true;
    persistThread(thread.slice(0, -1));
    setWorldFoldOpen(false);
    setRailOpen(false);
    setDockActions({});
    dispatchMove(destination.path);
  }, [persistThread, thread]);

  const openGlow = useCallback(() => {
    document.dispatchEvent(new CustomEvent('glow:open'));
  }, []);

  const runDockAction = useCallback((action?: DockAction | null) => {
    if (!action) return;
    if (action.path) {
      travel(action.path);
      return;
    }
    if (action.event) document.dispatchEvent(new CustomEvent(action.event));
  }, [travel]);

  useEffect(() => {
    const openCurrent = () => setWorldFoldOpen(true);
    const reverse = () => reverseCurrent();
    const toggleRail = () => setRailOpen((open) => !open);
    const registerDock = (event: Event) => {
      const detail = (event as CustomEvent<DockActions>).detail;
      setDockActions(detail ?? {});
    };
    const clearDock = () => setDockActions({});
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setWorldFoldOpen(false);
        setRailOpen(false);
      }
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
    document.addEventListener('glow:current-rail', toggleRail);
    document.addEventListener('glow:shell-actions', registerDock as EventListener);
    document.addEventListener('glow:shell-actions-clear', clearDock);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('glow:current-open', openCurrent);
      document.removeEventListener('glow:world-fold', openCurrent);
      document.removeEventListener('glow:reverse-current', reverse);
      document.removeEventListener('glow:current-rail', toggleRail);
      document.removeEventListener('glow:shell-actions', registerDock as EventListener);
      document.removeEventListener('glow:shell-actions-clear', clearDock);
      document.removeEventListener('keydown', key);
    };
  }, [reverseCurrent]);

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;

  // Beauty renders the same shared destination model inside its reference-specific
  // optical slab. Keep Glow Current alive for history/events, but do not stack a
  // second visible navigation layer over the Personal Atelier.
  if (currentExperience.world === 'beauty') return null;

  return (
    <div className="glow-current" data-world={currentExperience.world} data-enclosure={enclosure}>
      <div className="glow-current__world-boundary" aria-hidden="true" />

      <header className="glow-current__top-band" aria-label="Glow OS orientation">
        <div className="glow-current__top-left">
          <span className="glow-current__brand" aria-label="Glow OS">Glow OS</span>
          <span className="glow-current__return-slot">
            {returnTarget ? (
              <button
                type="button"
                className="glow-current__return-anchor"
                onClick={() => travel(returnTarget.path)}
                aria-label={`Return to ${returnTarget.label}`}
                title={`Return to ${returnTarget.label}`}
              >
                <span className="glow-current__return-light" aria-hidden="true" />
                <span className="glow-current__return-copy">{returnTarget.label}</span>
              </button>
            ) : (
              <span className="glow-current__return-placeholder" aria-hidden="true" />
            )}
          </span>
        </div>

        <div className="glow-current__orientation">
          <button
            type="button"
            className="glow-current__world-identity"
            onClick={() => setWorldFoldOpen(true)}
            aria-label={`Open World Fold from ${worldLabelFor(currentExperience.world)}`}
          >
            {worldLabelFor(currentExperience.world)}
          </button>
          <div className="glow-current__depth-signal" aria-label={`Current depth: ${depth.join(', ')}`}>
            {depth.map((label, index) => (
              <span key={`${label}-${index}`} className="glow-current__depth-node" data-active={index === depth.length - 1 ? 'true' : 'false'}>
                <i aria-hidden="true" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="glow-current__shakti"
          onClick={openGlow}
          aria-label={`Ask Glow from ${currentRoom}`}
        >
          <span className="glow-current__shakti-light" aria-hidden="true" />
          <span className="glow-current__shakti-copy">
            <strong>Ask Glow</strong>
            <small>Available</small>
          </span>
        </button>
      </header>

      <nav
        className="glow-current__rail"
        data-expanded={railOpen ? 'true' : 'false'}
        aria-label={`${worldLabelFor(currentExperience.world)} Glow Current`}
        onPointerEnter={() => setRailOpen(true)}
        onPointerLeave={() => setRailOpen(false)}
        onFocusCapture={() => setRailOpen(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setRailOpen(false);
        }}
      >
        <button
          type="button"
          className="glow-current__rail-current"
          onClick={() => setRailOpen((open) => !open)}
          aria-label={`${currentRoom}. ${railOpen ? 'Hide' : 'Reveal'} nearby destinations`}
          aria-expanded={railOpen}
        >
          <span className="glow-current__rail-current-node" aria-hidden="true" />
          <span className="glow-current__rail-current-copy">
            <small>{worldLabelFor(currentExperience.world)}</small>
            <strong>{currentRoom}</strong>
          </span>
        </button>

        <div className="glow-current__rail-paths">
          {railTargets.map((target) => {
            const active = railTargetIsActive(currentPath, target.path);
            return (
              <button
                key={target.path}
                type="button"
                className="glow-current__rail-destination"
                data-active={active ? 'true' : 'false'}
                onClick={() => travel(target.path)}
                aria-label={`Travel to ${target.label}. ${target.cue}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="glow-current__rail-node" aria-hidden="true" />
                <span className="glow-current__rail-label">
                  <strong>{target.label}</strong>
                  <small>{target.cue}</small>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="glow-current__dock" aria-label="Glow OS universal action layer">
        <div className="glow-current__dock-zone glow-current__dock-zone--left">
          {dockActions.left ? (
            <button type="button" className="glow-current__dock-action" onClick={() => runDockAction(dockActions.left)} aria-label={dockActions.left.ariaLabel ?? dockActions.left.label}>
              {dockActions.left.label}
            </button>
          ) : thread.length ? (
            <button
              type="button"
              className="glow-current__reverse"
              onClick={reverseCurrent}
              aria-label={`Reverse the Current to ${thread.at(-1)?.room ?? 'previous space'}`}
              title="Reverse the Current · Alt-Left Arrow"
            >
              <span className="glow-current__reverse-mark" aria-hidden="true">‹</span>
              <span className="glow-current__reverse-copy">{thread.at(-1)?.room}</span>
            </button>
          ) : (
            <span className="glow-current__dock-quiet" aria-hidden="true">Current</span>
          )}
        </div>

        {dockActions.center ? (
          <button type="button" className="glow-current__dock-action glow-current__dock-action--primary" onClick={() => runDockAction(dockActions.center)} aria-label={dockActions.center.ariaLabel ?? dockActions.center.label}>
            {dockActions.center.label}
          </button>
        ) : (
          <button
            type="button"
            className="glow-current__seam"
            onClick={() => setWorldFoldOpen((open) => !open)}
            aria-label="Open World Fold"
            aria-expanded={worldFoldOpen}
            title="World Fold · Command/Control-Shift-G"
          >
            <span className="glow-current__seam-core" aria-hidden="true" />
            <span className="glow-current__seam-wave" aria-hidden="true" />
            <span className="glow-current__seam-label">World Fold</span>
          </button>
        )}

        <div className="glow-current__dock-zone glow-current__dock-zone--right">
          {dockActions.right ? (
            <button type="button" className="glow-current__dock-action" onClick={() => runDockAction(dockActions.right)} aria-label={dockActions.right.ariaLabel ?? dockActions.right.label}>
              {dockActions.right.label}
            </button>
          ) : (
            <span className="glow-current__dock-state" aria-live="polite">{currentRoom}</span>
          )}
        </div>
      </div>

      {worldFoldOpen ? (
        <section className="glow-current__fold" aria-label="Glow OS World Fold">
          <button
            type="button"
            className="glow-current__fold-dismiss"
            onClick={() => setWorldFoldOpen(false)}
            aria-label="Close World Fold"
          />

          <div className="glow-current__field" role="dialog" aria-modal="true" aria-labelledby="glow-current-room">
            <div className="glow-current__field-light" aria-hidden="true" />

            <div className="glow-current__center" data-world={currentExperience.world}>
              <span className="glow-current__center-kicker">You are here</span>
              <strong id="glow-current-room">{currentRoom}</strong>
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
