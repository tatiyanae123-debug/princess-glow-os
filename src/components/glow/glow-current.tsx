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

type FoldWorld = 'home' | GlowWorld;

type FoldTarget = {
  key: FoldWorld;
  label: string;
  path: string;
  cue: string;
  symbol: string;
};

type WorldStateAnchor = {
  path: string;
  room: string;
  scrollY: number;
  updatedAt: number;
  state?: Record<string, unknown> | null;
  stateLabel?: string | null;
};

type WorldAnchorMap = Partial<Record<FoldWorld, WorldStateAnchor>>;

type PendingWorldRestore = WorldStateAnchor & { world: FoldWorld };

const THREAD_KEY = 'glow.current.thread.v2';
const WORLD_ANCHOR_KEY = 'glow.world.state-anchors.v2';
const WORLD_RESTORE_KEY = 'glow.world.pending-restore.v2';
const MAX_THREAD = 10;

const FOLD_TARGETS: FoldTarget[] = [
  { key: 'home', label: 'Home', path: '/home', cue: 'Your life, in one view', symbol: '●' },
  ...WORLD_TARGETS.map((target) => ({
    key: target.world,
    label: target.label,
    path: target.path,
    cue:
      target.world === 'today' ? 'The immediate present' :
      target.world === 'plan' ? 'Time becoming you' :
      target.world === 'life' ? 'Your inhabited world' :
      target.world === 'beauty' ? 'Care · confidence · you' :
      target.world === 'brain' ? 'Knowledge in motion' :
      'Ideas into reality',
    symbol:
      target.world === 'today' ? '☼' :
      target.world === 'plan' ? '◎' :
      target.world === 'life' ? '◇' :
      target.world === 'beauty' ? '✦' :
      target.world === 'brain' ? '⌘' :
      '✧',
  })),
];

function dispatchMove(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function readJson<T>(key: string): T | null {
  try {
    const value = window.sessionStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
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
  const currentFoldWorld: FoldWorld = pathname === '/home' ? 'home' : currentExperience.world;

  const [worldFoldOpen, setWorldFoldOpen] = useState(false);
  const [selectedFoldWorld, setSelectedFoldWorld] = useState<FoldWorld | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const [dockActions, setDockActions] = useState<DockActions>({});
  const [worldAnchors, setWorldAnchors] = useState<WorldAnchorMap>({});
  const previousPathRef = useRef(currentPath);
  const suppressNextHistoryRef = useRef(false);
  const foldTravelTimerRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);

  const persistThread = useCallback((next: ThreadEntry[]) => {
    const trimmed = next.slice(-MAX_THREAD);
    setThread(trimmed);
    writeJson(THREAD_KEY, trimmed);
  }, []);

  const persistAnchor = useCallback((world: FoldWorld, anchor: WorldStateAnchor) => {
    setWorldAnchors((previous) => {
      const next = { ...previous, [world]: anchor };
      writeJson(WORLD_ANCHOR_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    const savedThread = readJson<ThreadEntry[]>(THREAD_KEY);
    const savedAnchors = readJson<WorldAnchorMap>(WORLD_ANCHOR_KEY);
    if (savedThread) setThread(savedThread);
    if (savedAnchors) setWorldAnchors(savedAnchors);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.glowShellWorld = currentExperience.world;
    document.documentElement.dataset.glowShellRoom = currentRoom;
    document.documentElement.dataset.glowEnclosure = enclosure;
    document.documentElement.dataset.glowWorldFold = worldFoldOpen ? 'open' : 'closed';
    document.documentElement.dataset.glowFoldWorld = currentFoldWorld;
    return () => {
      delete document.documentElement.dataset.glowShellWorld;
      delete document.documentElement.dataset.glowShellRoom;
      delete document.documentElement.dataset.glowEnclosure;
      delete document.documentElement.dataset.glowWorldFold;
      delete document.documentElement.dataset.glowFoldWorld;
    };
  }, [currentExperience.world, currentFoldWorld, currentRoom, enclosure, worldFoldOpen]);

  useEffect(() => {
    const pending = readJson<PendingWorldRestore>(WORLD_RESTORE_KEY);
    if (!pending || pending.path !== currentPath) return;

    try { window.sessionStorage.removeItem(WORLD_RESTORE_KEY); } catch {}
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, pending.scrollY || 0), behavior: 'auto' });
      document.dispatchEvent(new CustomEvent('glow:world-state-restore', {
        detail: { world: pending.world, state: pending.state ?? null, room: pending.room },
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [currentPath]);

  useEffect(() => {
    const capture = () => {
      const existing = worldAnchors[currentFoldWorld];
      persistAnchor(currentFoldWorld, {
        path: currentPath,
        room: currentRoom,
        scrollY: window.scrollY,
        updatedAt: Date.now(),
        state: existing?.state ?? null,
        stateLabel: existing?.stateLabel ?? null,
      });
    };

    const initial = window.setTimeout(capture, 260);
    const onScroll = () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(capture, 180);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(initial);
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      window.removeEventListener('scroll', onScroll);
    };
  }, [currentFoldWorld, currentPath, currentRoom, persistAnchor, worldAnchors]);

  useEffect(() => {
    const registerState = (event: Event) => {
      const detail = (event as CustomEvent<{ state?: Record<string, unknown> | null; label?: string | null }>).detail;
      const existing = worldAnchors[currentFoldWorld];
      persistAnchor(currentFoldWorld, {
        path: currentPath,
        room: currentRoom,
        scrollY: window.scrollY,
        updatedAt: Date.now(),
        state: detail?.state ?? existing?.state ?? null,
        stateLabel: detail?.label ?? existing?.stateLabel ?? null,
      });
    };
    document.addEventListener('glow:world-state', registerState as EventListener);
    return () => document.removeEventListener('glow:world-state', registerState as EventListener);
  }, [currentFoldWorld, currentPath, currentRoom, persistAnchor, worldAnchors]);

  useEffect(() => {
    const previous = previousPathRef.current;
    if (previous && previous !== currentPath) {
      if (suppressNextHistoryRef.current) {
        suppressNextHistoryRef.current = false;
      } else if (previous !== '/sign-in' && !previous.startsWith('/api/')) {
        const previousPathname = previous.split('?')[0] || '/today';
        const experience = roomExperienceFor(previousPathname);
        const entry: ThreadEntry = {
          path: previous,
          room: roomLabelForPath(previous, experience.world),
          world: experience.world,
          visitedAt: Date.now(),
        };
        const next = [...thread.filter((item, index) => item.path !== previous || index !== thread.length - 1), entry];
        persistThread(next);
      }
    }
    previousPathRef.current = currentPath;
  }, [currentPath, persistThread, thread]);

  useEffect(() => () => {
    if (foldTravelTimerRef.current) window.clearTimeout(foldTravelTimerRef.current);
  }, []);

  const travel = useCallback((path: string) => {
    if (!path || path === currentPath) {
      setWorldFoldOpen(false);
      setRailOpen(false);
      setSelectedFoldWorld(null);
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

  const previewFor = useCallback((target: FoldTarget) => {
    const anchor = worldAnchors[target.key];
    if (target.key === currentFoldWorld) {
      return anchor?.stateLabel || (currentRoom !== target.label ? currentRoom : target.cue);
    }
    if (anchor?.stateLabel) return anchor.stateLabel;
    if (anchor?.room && anchor.room !== target.label && anchor.room !== 'Glow Home') return `Return to ${anchor.room}`;
    return target.cue;
  }, [currentFoldWorld, currentRoom, worldAnchors]);

  const selectFoldTarget = useCallback((target: FoldTarget) => {
    if (target.key === currentFoldWorld) {
      setWorldFoldOpen(false);
      setSelectedFoldWorld(null);
      return;
    }

    const anchor = worldAnchors[target.key];
    const destination = anchor?.path || target.path;
    const before = new CustomEvent('glow:before-world-travel', {
      cancelable: true,
      detail: { from: currentFoldWorld, to: target.key, currentPath, destination },
    });
    if (!document.dispatchEvent(before)) return;

    const restore: PendingWorldRestore = {
      world: target.key,
      path: destination,
      room: anchor?.room || target.label,
      scrollY: anchor?.scrollY || 0,
      updatedAt: anchor?.updatedAt || Date.now(),
      state: anchor?.state ?? null,
      stateLabel: anchor?.stateLabel ?? null,
    };
    writeJson(WORLD_RESTORE_KEY, restore);
    setSelectedFoldWorld(target.key);

    if (foldTravelTimerRef.current) window.clearTimeout(foldTravelTimerRef.current);
    foldTravelTimerRef.current = window.setTimeout(() => travel(destination), 180);
  }, [currentFoldWorld, currentPath, travel, worldAnchors]);

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
        setSelectedFoldWorld(null);
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

  return (
    <div
      className="glow-current"
      data-world={currentExperience.world}
      data-enclosure={enclosure}
      data-fold-open={worldFoldOpen ? 'true' : 'false'}
    >
      <div className="glow-current__world-boundary" aria-hidden="true" />

      <header className="glow-current__top-band" aria-label="Glow OS orientation">
        <div className="glow-current__top-left">
          <button type="button" className="glow-current__brand" onClick={() => travel('/home')} aria-label="Glow OS Home">
            <span className="glow-current__brand-pearl" aria-hidden="true" />
            <span className="glow-current__brand-copy"><strong>Glow OS</strong><small>Your life, in harmony</small></span>
          </button>
          <button
            type="button"
            className="glow-current__fold-seam-trigger"
            onClick={() => setWorldFoldOpen((open) => !open)}
            aria-label={worldFoldOpen ? 'Close World Fold' : 'Open worlds'}
            aria-expanded={worldFoldOpen}
            title="Open worlds · Command/Control-Shift-G"
          ><span aria-hidden="true" /></button>
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
          ) : null}
        </div>

        <div className="glow-current__orientation" aria-live="polite">
          {worldFoldOpen ? (
            <span className="glow-current__fold-title"><strong>World Fold</strong><small>One life. Many worlds. Always you.</small></span>
          ) : (
            <span className="glow-current__sr-only">{worldLabelFor(currentExperience.world)}. {depth.join(', ')}.</span>
          )}
        </div>

        <div className="glow-current__top-right">
          <button
            type="button"
            className="glow-current__today-shortcut"
            onClick={() => travel('/today?room=what-now')}
            aria-label="Go to Today"
          >
            <span className="glow-current__today-sun" aria-hidden="true">☼</span>
            <span><strong>Today</strong><small>{currentFoldWorld === 'today' ? currentRoom : 'The immediate present'}</small></span>
          </button>
          <button
            type="button"
            className="glow-current__shakti"
            onClick={openGlow}
            aria-label={`Ask Glow from ${currentRoom}`}
          >
            <span className="glow-current__shakti-light" aria-hidden="true" />
            <span className="glow-current__shakti-copy"><strong>Ask Glow</strong><small>Always here</small></span>
          </button>
        </div>
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
          <span className="glow-current__rail-current-copy"><small>{worldLabelFor(currentExperience.world)}</small><strong>{currentRoom}</strong></span>
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
                <span className="glow-current__rail-label"><strong>{target.label}</strong><small>{target.cue}</small></span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="glow-current__dock" aria-label="Glow OS universal action layer">
        <div className="glow-current__dock-zone glow-current__dock-zone--left">
          {dockActions.left ? (
            <button type="button" className="glow-current__dock-action" onClick={() => runDockAction(dockActions.left)} aria-label={dockActions.left.ariaLabel ?? dockActions.left.label}>{dockActions.left.label}</button>
          ) : thread.length ? (
            <button type="button" className="glow-current__reverse" onClick={reverseCurrent} aria-label={`Reverse the Current to ${thread.at(-1)?.room ?? 'previous space'}`} title="Reverse the Current · Alt-Left Arrow">
              <span className="glow-current__reverse-mark" aria-hidden="true">‹</span><span className="glow-current__reverse-copy">{thread.at(-1)?.room}</span>
            </button>
          ) : <span className="glow-current__dock-quiet" aria-hidden="true">Current</span>}
        </div>

        {dockActions.center ? (
          <button type="button" className="glow-current__dock-action glow-current__dock-action--primary" onClick={() => runDockAction(dockActions.center)} aria-label={dockActions.center.ariaLabel ?? dockActions.center.label}>{dockActions.center.label}</button>
        ) : (
          <button type="button" className="glow-current__seam" onClick={() => setWorldFoldOpen((open) => !open)} aria-label="Open World Fold" aria-expanded={worldFoldOpen} title="World Fold · Command/Control-Shift-G">
            <span className="glow-current__seam-core" aria-hidden="true" /><span className="glow-current__seam-wave" aria-hidden="true" /><span className="glow-current__seam-label">World Fold</span>
          </button>
        )}

        <div className="glow-current__dock-zone glow-current__dock-zone--right">
          {dockActions.right ? (
            <button type="button" className="glow-current__dock-action" onClick={() => runDockAction(dockActions.right)} aria-label={dockActions.right.ariaLabel ?? dockActions.right.label}>{dockActions.right.label}</button>
          ) : <span className="glow-current__dock-state" aria-live="polite">{currentRoom}</span>}
        </div>
      </div>

      {worldFoldOpen ? (
        <section className="glow-current__fold living-fold" aria-label="World Fold">
          <button type="button" className="glow-current__fold-dismiss" onClick={() => { setWorldFoldOpen(false); setSelectedFoldWorld(null); }} aria-label="Close World Fold" />
          <div className="living-fold__atmosphere" aria-hidden="true"><i/><i/><i/><i/></div>

          <div className="living-fold__intro" aria-hidden="true">
            <strong>World Fold 2.0</strong><span>The Living Fold</span>
            <p>Not a menu.<br/>A reveal.<br/>One life. Many lenses.</p>
          </div>

          <div className="living-fold__scene" role="dialog" aria-modal="true" aria-label="Glow OS worlds">
            <div className="living-fold__fan" data-active-world={currentFoldWorld}>
              {FOLD_TARGETS.map((target) => {
                const preview = previewFor(target);
                return (
                  <button
                    key={target.key}
                    type="button"
                    className="living-fold__lens"
                    data-world={target.key}
                    data-current={currentFoldWorld === target.key ? 'true' : 'false'}
                    data-selecting={selectedFoldWorld === target.key ? 'true' : 'false'}
                    onClick={() => selectFoldTarget(target)}
                    aria-label={`${target.label}. ${preview}. ${currentFoldWorld === target.key ? 'Current world.' : 'Press to move here.'}`}
                  >
                    <span className="living-fold__lens-shadow" aria-hidden="true" />
                    <span className="living-fold__lens-rear" aria-hidden="true" />
                    <span className="living-fold__lens-body" aria-hidden="true">
                      <span className="living-fold__micro-scene"><i/><i/><i/><i/></span>
                    </span>
                    <span className="living-fold__lens-copy">
                      <span className="living-fold__symbol" aria-hidden="true">{target.symbol}</span>
                      <strong>{target.label}</strong>
                      <small>{preview}</small>
                    </span>
                  </button>
                );
              })}

              <div className="living-fold__context-thread" aria-hidden="true">
                <i/><span>{currentRoom}</span><b/>
              </div>
            </div>
          </div>

          <div className="living-fold__side-note living-fold__side-note--left" aria-hidden="true">Your current world<br/>remains alive behind you.</div>
          <div className="living-fold__side-note living-fold__side-note--right" aria-hidden="true">See a world.<br/>Press it.<br/>Glow transforms toward it.</div>
          <div className="living-fold__mantra" aria-hidden="true">SAME YOU. · MORE YOU.</div>
          <div className="living-fold__sr-status glow-current__sr-only" aria-live="polite">World Fold open. Home is the root. Today is nearest. Plan, Life, Beauty, Brain and Create are lenses into the same Glow OS.</div>
        </section>
      ) : null}
    </div>
  );
}
