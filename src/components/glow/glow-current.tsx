'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Activity,
  BellRing,
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  Globe2,
  HeartPulse,
  Home as HomeIcon,
  Menu,
  Plus,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';
import { returnTargetForPath, roomLabelForPath } from '@/lib/glow-world/navigation-shell';
import {
  CREATE_DESTINATIONS,
  GLOBAL_NAVIGATION,
  GLOBAL_NAVIGATION_GROUPS,
  GLOBAL_UTILITIES,
  breadcrumbsForPath,
  localTabIsActive,
  localTabsForPath,
  navigationDestinationIsActive,
  utilityIsActive,
  visibleWorldForPath,
  type NavigationUtility,
  type VisibleWorldKey,
} from '@/lib/navigation-system';

type ThreadEntry = { path: string; label: string; visitedAt: number };

const THREAD_KEY = 'glow.navigation.thread.v3';
const SCROLL_KEY = 'glow.navigation.scroll.v1';
const FAVORITES_KEY = 'glow.navigation.favorites.v1';
const MAX_THREAD = 12;

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
  try { window.sessionStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function readLocalJson<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch {
    return null;
  }
}

function writeLocalJson(key: string, value: unknown) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function WorldIcon({ world, size = 16 }: { world: VisibleWorldKey; size?: number }) {
  if (world === 'home') return <HomeIcon size={size}/>;
  if (world === 'today') return <Sparkles size={size}/>;
  if (world === 'plan') return <CalendarDays size={size}/>;
  if (world === 'life') return <Globe2 size={size}/>;
  if (world === 'fitness') return <Activity size={size}/>;
  if (world === 'wellness') return <HeartPulse size={size}/>;
  if (world === 'brain') return <BrainCircuit size={size}/>;
  return <Sparkles size={size}/>;
}

function UtilityIcon({ utility, size = 15 }: { utility: NavigationUtility['key']; size?: number }) {
  if (utility === 'search') return <Search size={size}/>;
  if (utility === 'attention') return <BellRing size={size}/>;
  if (utility === 'settings') return <SettingsIcon size={size}/>;
  if (utility === 'concierge') return <Sparkles size={size}/>;
  return <BrainCircuit size={size}/>;
}

function pathLabel(path: string) {
  const clean = path.split('?')[0] || '/';
  const target = GLOBAL_NAVIGATION.find((item) => item.path.split('?')[0] === clean);
  if (target) return target.label;
  return clean.split('/').filter(Boolean).at(-1)?.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Glow';
}

export function GlowCurrent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const currentPath = search ? `${pathname}?${search}` : pathname;
  const currentExperience = useMemo(() => roomExperienceFor(pathname), [pathname]);
  const currentRoom = useMemo(() => roomLabelForPath(currentPath, currentExperience.world), [currentExperience.world, currentPath]);
  const returnTarget = useMemo(() => returnTargetForPath(currentPath, currentExperience.world), [currentExperience.world, currentPath]);
  const visibleWorld = useMemo(() => visibleWorldForPath(pathname), [pathname]);
  const breadcrumbs = useMemo(() => breadcrumbsForPath(pathname, search), [pathname, search]);
  const localTabs = useMemo(() => localTabsForPath(pathname), [pathname]);

  const [tabletExpanded, setTabletExpanded] = useState(false);
  const [worldsOpen, setWorldsOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [thread, setThread] = useState<ThreadEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const previousPathRef = useRef(currentPath);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const persistThread = useCallback((next: ThreadEntry[]) => {
    const trimmed = next.slice(-MAX_THREAD);
    setThread(trimmed);
    writeJson(THREAD_KEY, trimmed);
  }, []);

  useEffect(() => {
    setThread(readJson<ThreadEntry[]>(THREAD_KEY) ?? []);
    setFavorites(readLocalJson<string[]>(FAVORITES_KEY) ?? []);
  }, []);

  useEffect(() => {
    const previous = previousPathRef.current;
    if (previous && previous !== currentPath && !previous.startsWith('/sign-') && !previous.startsWith('/api/')) {
      const next = [...thread.filter((item) => item.path !== previous), {
        path: previous,
        label: pathLabel(previous),
        visitedAt: Date.now(),
      }];
      persistThread(next);
    }
    previousPathRef.current = currentPath;
  }, [currentPath, persistThread, thread]);

  useEffect(() => {
    const scrollMap = readJson<Record<string, number>>(SCROLL_KEY) ?? {};
    const top = scrollMap[currentPath];
    if (typeof top !== 'number' || top <= 0) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top, behavior: 'auto' }));
    return () => window.cancelAnimationFrame(frame);
  }, [currentPath]);

  useEffect(() => {
    document.documentElement.dataset.glowVisibleWorld = visibleWorld;
    document.documentElement.dataset.glowNavigation = 'unified-v1';
    return () => {
      delete document.documentElement.dataset.glowVisibleWorld;
      delete document.documentElement.dataset.glowNavigation;
    };
  }, [visibleWorld]);

  const closeLayers = useCallback(() => {
    setWorldsOpen(false);
    setCommandOpen(false);
    setCreateOpen(false);
    setTabletExpanded(false);
  }, []);

  const saveScroll = useCallback(() => {
    const map = readJson<Record<string, number>>(SCROLL_KEY) ?? {};
    map[currentPath] = window.scrollY;
    writeJson(SCROLL_KEY, map);
  }, [currentPath]);

  const travel = useCallback((path: string) => {
    if (!path) return;
    saveScroll();
    closeLayers();
    if (path === currentPath) return;
    dispatchMove(path);
  }, [closeLayers, currentPath, saveScroll]);

  const runUtility = useCallback((utility: NavigationUtility) => {
    if (utility.event) {
      closeLayers();
      document.dispatchEvent(new CustomEvent(utility.event));
      return;
    }
    if (utility.path) travel(utility.path);
  }, [closeLayers, travel]);

  const toggleFavorite = useCallback((path: string) => {
    setFavorites((current) => {
      const next = current.includes(path) ? current.filter((item) => item !== path) : [...current, path];
      writeLocalJson(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const createItem = useCallback((type: string, path: string) => {
    writeJson('glow.pending-create.v1', { type, from: currentPath, createdAt: Date.now() });
    document.dispatchEvent(new CustomEvent('glow:create-intent', { detail: { type, from: currentPath } }));
    travel(path);
  }, [currentPath, travel]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
        setWorldsOpen(false);
        setCreateOpen(false);
      }
      if (event.key === 'Escape') closeLayers();
      if (event.altKey && event.key === 'ArrowLeft' && returnTarget) {
        event.preventDefault();
        travel(returnTarget.path);
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [closeLayers, returnTarget, travel]);

  useEffect(() => {
    if (!commandOpen) return;
    const frame = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [commandOpen]);

  const commandDestinations = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return GLOBAL_NAVIGATION;
    return GLOBAL_NAVIGATION.filter((item) => `${item.label} ${item.cue}`.toLowerCase().includes(query));
  }, [commandQuery]);

  const commandUtilities = useMemo(() => {
    const query = commandQuery.trim().toLowerCase();
    if (!query) return GLOBAL_UTILITIES;
    return GLOBAL_UTILITIES.filter((item) => item.label.toLowerCase().includes(query));
  }, [commandQuery]);

  const favoriteTargets = useMemo(
    () => favorites.map((path) => GLOBAL_NAVIGATION.find((item) => item.path === path)).filter(Boolean),
    [favorites],
  );

  const prioritizedCreate = useMemo(() => {
    const score = (type: string) => {
      if (visibleWorld === 'beauty' && type === 'beauty-entry') return 0;
      if (visibleWorld === 'fitness' && type === 'workout') return 0;
      if (visibleWorld === 'create' && (type === 'project' || type === 'idea' || type === 'note')) return 0;
      if (visibleWorld === 'plan' && (type === 'task' || type === 'event' || type === 'routine' || type === 'goal')) return 0;
      if (visibleWorld === 'life' && (type === 'meal' || type === 'shopping-item')) return 0;
      return 1;
    };
    return [...CREATE_DESTINATIONS].sort((a, b) => score(a.type) - score(b.type));
  }, [visibleWorld]);

  const submitCommandSearch = useCallback(() => {
    const query = commandQuery.trim();
    if (!query) return;
    const exact = commandDestinations[0];
    if (exact && commandDestinations.length === 1) return travel(exact.path);
    travel(`/search?q=${encodeURIComponent(query)}`);
  }, [commandDestinations, commandQuery, travel]);

  if (pathname === '/sign-in' || pathname === '/sign-up' || pathname.startsWith('/api/')) return null;

  return (
    <div className="glow-nav" data-visible-world={visibleWorld} data-tablet-expanded={tabletExpanded ? 'true' : 'false'}>
      <aside className="glow-nav__sidebar" aria-label="Glow OS global navigation">
        <div className="glow-nav__brand-row">
          <button type="button" className="glow-nav__brand" onClick={() => travel('/home')} aria-label="Glow OS Home">
            <span className="glow-nav__brand-mark" aria-hidden="true">✦</span>
            <span className="glow-nav__brand-copy"><strong>Glow OS</strong><small>Your life, in harmony</small></span>
          </button>
          <button type="button" className="glow-nav__tablet-toggle" onClick={() => setTabletExpanded((value) => !value)} aria-label={tabletExpanded ? 'Collapse navigation' : 'Expand navigation'} aria-expanded={tabletExpanded}>
            {tabletExpanded ? <X size={16}/> : <Menu size={16}/>}
          </button>
        </div>

        <button type="button" className="glow-nav__create" onClick={() => setCreateOpen(true)}>
          <Plus size={15}/><span>Create</span>
        </button>

        <div className="glow-nav__groups">
          {GLOBAL_NAVIGATION_GROUPS.map((group) => (
            <section key={group.label} className="glow-nav__group">
              <p className="glow-nav__group-label">{group.label}</p>
              {group.items.map((item) => {
                const active = navigationDestinationIsActive(pathname, item);
                return (
                  <button key={item.key} type="button" className="glow-nav__destination" data-active={active ? 'true' : 'false'} onClick={() => travel(item.path)} aria-current={active ? 'page' : undefined} title={item.cue}>
                    <span className="glow-nav__destination-icon"><WorldIcon world={item.key}/></span>
                    <span className="glow-nav__destination-copy"><strong>{item.label}</strong><small>{item.cue}</small></span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>

        <div className="glow-nav__utilities">
          {GLOBAL_UTILITIES.map((utility) => {
            const active = utilityIsActive(pathname, utility);
            return (
              <button key={utility.key} type="button" className="glow-nav__utility" data-active={active ? 'true' : 'false'} onClick={() => utility.key === 'search' ? setCommandOpen(true) : runUtility(utility)}>
                <UtilityIcon utility={utility.key}/><span>{utility.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      <header className="glow-nav__header" aria-label="Page orientation">
        <div className="glow-nav__header-left">
          {returnTarget ? (
            <button type="button" className="glow-nav__back" onClick={() => travel(returnTarget.path)} aria-label={`Back to ${returnTarget.label}`}>
              <ChevronLeft size={17}/><span>{returnTarget.label}</span>
            </button>
          ) : <span className="glow-nav__back-spacer" />}
          <nav className="glow-nav__breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.path}-${index}`} className="glow-nav__crumb-wrap">
                {index ? <span className="glow-nav__crumb-separator" aria-hidden="true">/</span> : null}
                <button type="button" className="glow-nav__crumb" data-current={index === breadcrumbs.length - 1 ? 'true' : 'false'} onClick={() => travel(crumb.path)} aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>{crumb.label}</button>
              </span>
            ))}
          </nav>
        </div>

        <div className="glow-nav__header-actions">
          <button type="button" className="glow-nav__header-action glow-nav__search-trigger" onClick={() => setCommandOpen(true)} aria-label="Search Glow OS"><Search size={15}/><span>Search</span><kbd>⌘K</kbd></button>
          <button type="button" className="glow-nav__header-action" onClick={() => travel('/attention')} aria-label="Attention Center"><BellRing size={15}/><span className="glow-nav__action-label">Attention</span></button>
          <button type="button" className="glow-nav__header-action glow-nav__header-create" onClick={() => setCreateOpen(true)} aria-label="Create"><Plus size={16}/></button>
          <button type="button" className="glow-nav__header-action glow-nav__ask" onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))} aria-label={`Ask Glow from ${currentRoom}`}><Sparkles size={15}/><span className="glow-nav__action-label">Ask Glow</span></button>
        </div>
      </header>

      {localTabs.length ? (
        <nav className="glow-nav__local-tabs" aria-label={`${breadcrumbs.at(-1)?.label ?? currentRoom} navigation`}>
          <div className="glow-nav__local-tabs-scroll">
            {localTabs.map((tab) => {
              const active = localTabIsActive(currentPath, tab.path);
              return <button key={tab.path} type="button" className="glow-nav__local-tab" data-active={active ? 'true' : 'false'} onClick={() => travel(tab.path)} aria-current={active ? 'page' : undefined}>{tab.label}</button>;
            })}
          </div>
        </nav>
      ) : null}

      <nav className="glow-nav__mobile-bottom" aria-label="Glow OS mobile navigation">
        {GLOBAL_NAVIGATION.filter((item) => item.key === 'home' || item.key === 'today' || item.key === 'plan').map((item) => {
          const active = navigationDestinationIsActive(pathname, item);
          return <button key={item.key} type="button" data-active={active ? 'true' : 'false'} onClick={() => travel(item.path)}><WorldIcon world={item.key} size={17}/><span>{item.label}</span></button>;
        })}
        <button type="button" data-active={['life','beauty','closet','fitness','wellness','brain','create'].includes(visibleWorld) ? 'true' : 'false'} onClick={() => setWorldsOpen(true)}><Globe2 size={17}/><span>Worlds</span></button>
        <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}><Sparkles size={17}/><span>Glow</span></button>
      </nav>

      {worldsOpen ? (
        <div className="glow-nav__overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setWorldsOpen(false); }}>
          <section className="glow-nav__sheet glow-nav__world-sheet" role="dialog" aria-modal="true" aria-label="Your Worlds">
            <div className="glow-nav__sheet-header"><div><small>YOUR WORLDS</small><h2>Choose where you want to go</h2></div><button type="button" onClick={() => setWorldsOpen(false)} aria-label="Close Worlds"><X size={18}/></button></div>
            <div className="glow-nav__world-grid">
              {GLOBAL_NAVIGATION.filter((item) => ['life','beauty','closet','fitness','wellness','brain','create'].includes(item.key)).map((item) => (
                <button key={item.key} type="button" className="glow-nav__world-card" data-active={visibleWorld === item.key ? 'true' : 'false'} onClick={() => travel(item.path)}>
                  <WorldIcon world={item.key} size={19}/><span><strong>{item.label}</strong><small>{item.cue}</small></span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {createOpen ? (
        <div className="glow-nav__overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}>
          <section className="glow-nav__sheet glow-nav__create-sheet" role="dialog" aria-modal="true" aria-label="Create in Glow">
            <div className="glow-nav__sheet-header"><div><small>CREATE</small><h2>Add something without losing your place</h2></div><button type="button" onClick={() => setCreateOpen(false)} aria-label="Close Create"><X size={18}/></button></div>
            <div className="glow-nav__create-grid">
              {prioritizedCreate.map((item) => <button key={item.type} type="button" onClick={() => createItem(item.type, item.path)}><Plus size={15}/><span>{item.label}</span></button>)}
            </div>
          </section>
        </div>
      ) : null}

      {commandOpen ? (
        <div className="glow-nav__overlay glow-nav__command-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
          <section className="glow-nav__command" role="dialog" aria-modal="true" aria-label="Search and navigate Glow OS">
            <div className="glow-nav__command-search">
              <Search size={17}/>
              <input ref={searchInputRef} value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); submitCommandSearch(); } }} placeholder="Search Glow or type where you want to go…" aria-label="Search Glow OS"/>
              <button type="button" onClick={() => setCommandOpen(false)} aria-label="Close search"><X size={17}/></button>
            </div>

            <div className="glow-nav__command-body">
              {!commandQuery.trim() && thread.length ? (
                <section className="glow-nav__command-section">
                  <p>CONTINUE</p>
                  <button type="button" className="glow-nav__continue" onClick={() => travel(thread.at(-1)?.path ?? '/home')}><span><strong>{thread.at(-1)?.label}</strong><small>Return to where you were</small></span><ChevronLeft size={16}/></button>
                </section>
              ) : null}

              {!commandQuery.trim() && favoriteTargets.length ? (
                <section className="glow-nav__command-section">
                  <p>FAVORITES</p>
                  <div className="glow-nav__command-list">
                    {favoriteTargets.map((item) => item ? <button key={item.key} type="button" onClick={() => travel(item.path)}><WorldIcon world={item.key}/><span><strong>{item.label}</strong><small>{item.cue}</small></span></button> : null)}
                  </div>
                </section>
              ) : null}

              <section className="glow-nav__command-section">
                <p>{commandQuery.trim() ? 'MATCHES' : 'GO TO'}</p>
                <div className="glow-nav__command-list">
                  {commandDestinations.map((item) => (
                    <div key={item.key} className="glow-nav__command-row">
                      <button type="button" className="glow-nav__command-main" onClick={() => travel(item.path)}><WorldIcon world={item.key}/><span><strong>{item.label}</strong><small>{item.cue}</small></span></button>
                      <button type="button" className="glow-nav__favorite-toggle" data-active={favorites.includes(item.path) ? 'true' : 'false'} onClick={() => toggleFavorite(item.path)} aria-label={favorites.includes(item.path) ? `Remove ${item.label} from favorites` : `Add ${item.label} to favorites`}><Star size={14}/></button>
                    </div>
                  ))}
                  {commandUtilities.map((utility) => <button key={utility.key} type="button" onClick={() => runUtility(utility)}><UtilityIcon utility={utility.key}/><span><strong>{utility.label}</strong><small>Global utility</small></span></button>)}
                </div>
              </section>

              {commandQuery.trim() ? <button type="button" className="glow-nav__search-all" onClick={submitCommandSearch}><Search size={15}/>Search all of Glow for “{commandQuery.trim()}”</button> : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
