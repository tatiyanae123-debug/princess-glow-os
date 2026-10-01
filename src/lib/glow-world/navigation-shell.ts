import type { CanonicalGlowWorld, GlowWorld } from '@/lib/glow-world/room-experience';
import { pageManifestChainFor, pageManifestFor } from '@/lib/glow-world/page-manifest';

export type GlowEnclosure = 'open' | 'structured' | 'protected';
export type ShellTarget = { label: string; path: string; cue: string };
export type ShellWorldTarget = ShellTarget & { world: GlowWorld };
export type ShellReturnTarget = { label: string; path: string };

export const WORLD_TARGETS: ShellWorldTarget[] = [
  { world: 'today', label: 'Today', path: '/today?room=what-now', cue: 'the immediate present' },
  { world: 'plan', label: 'Plan', path: '/planning', cue: 'time extending forward' },
  { world: 'life', label: 'Life', path: '/life', cue: 'your inhabited systems' },
  { world: 'brain', label: 'Brain', path: '/brain', cue: 'memory and connection depth' },
  { world: 'create', label: 'Create', path: '/create', cue: 'unfinished possibility' },
];

const WORLD_ROOT: Record<CanonicalGlowWorld, string> = Object.fromEntries(WORLD_TARGETS.map((item) => [item.world, item.path])) as Record<CanonicalGlowWorld, string>;
const WORLD_LABEL: Record<CanonicalGlowWorld, string> = Object.fromEntries(WORLD_TARGETS.map((item) => [item.world, item.label])) as Record<CanonicalGlowWorld, string>;
const canonicalWorld = (world: GlowWorld): CanonicalGlowWorld => world === 'beauty' ? 'life' : world;

const TODAY_ROOM_LABEL: Record<string, string> = {
  morning: 'Morning Brief', 'what-now': 'What Now', focus: 'Focus Session', people: 'People', places: 'Places', resources: 'Library', library: 'Library',
  journey: 'Journeys', journeys: 'Journeys', meeting: 'Event', event: 'Event', 'next-up': 'Next Up', later: 'Later', tonight: 'Tonight',
  tomorrow: 'Tomorrow Preview', replan: 'Replan My Day', 'day-view': 'Day View',
};

const RAIL_TARGETS: Record<CanonicalGlowWorld, ShellTarget[]> = {
  today: [
    { label: 'Today', path: '/today?room=what-now', cue: 'Now' },
    { label: 'Focus', path: '/today?room=focus', cue: 'Protected chamber' },
    { label: 'People', path: '/today?room=people', cue: 'Relationships' },
    { label: 'Places', path: '/today?room=places', cue: 'Places' },
    { label: 'Library', path: '/today?room=library', cue: 'Resources' },
  ],
  plan: [
    { label: 'Plan', path: '/planning', cue: 'Time Observatory' },
    { label: 'Calendar', path: '/calendar', cue: 'Committed time' },
    { label: 'Tasks', path: '/tasks', cue: 'Readiness' },
    { label: 'Reminders', path: '/reminders', cue: 'Context' },
    { label: 'Goals', path: '/goals', cue: 'Horizon' },
    { label: 'Projects', path: '/projects', cue: 'Build' },
    { label: 'Routines', path: '/routines', cue: 'Rhythm' },
    { label: 'Habits', path: '/habits', cue: 'Patterns' },
  ],
  life: [
    { label: 'Life', path: '/life', cue: 'Personal House' },
    { label: 'Body', path: '/body', cue: 'Body model' },
    { label: 'Fitness', path: '/fitness', cue: 'Movement' },
    { label: 'Wellness', path: '/wellness', cue: 'Regulation and care' },
    { label: 'Beauty', path: '/beauty', cue: 'Personal Atelier' },
    { label: 'Closet', path: '/closet', cue: 'Wardrobe' },
    { label: 'Food', path: '/food', cue: 'Nourishment' },
    { label: 'Home', path: '/life/home', cue: 'Place' },
    { label: 'Money', path: '/finance', cue: 'Money' },
    { label: 'Career + Work', path: '/work', cue: 'Work' },
    { label: 'Travel', path: '/travel', cue: 'Journeys' },
    { label: 'Relationships', path: '/relationships', cue: 'People' },
    { label: 'Saint Care', path: '/saint', cue: 'Care' },
  ],
  brain: [
    { label: 'Brain', path: '/brain', cue: 'Knowledge' },
    { label: 'Notes', path: '/notes', cue: 'Thinking' },
    { label: 'Memory', path: '/memory', cue: 'Recall' },
    { label: 'Timeline', path: '/timeline', cue: 'History' },
    { label: 'Connections', path: '/connections', cue: 'Relations' },
    { label: 'Observations', path: '/observations', cue: 'Insights' },
  ],
  create: [
    { label: 'Create', path: '/create', cue: 'Possibility' },
    { label: 'Capture', path: '/inbox', cue: 'Capture' },
    { label: 'Import', path: '/import', cue: 'Transform sources' },
  ],
};

function cleanPath(path: string) { const [pathname = '/', search = ''] = path.split('?'); return { pathname: pathname || '/', search }; }
function friendly(value: string) { return decodeURIComponent(value).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function todayRoom(search: string) { return new URLSearchParams(search).get('room') ?? ''; }

export function currentPathFor(pathname: string, search: string) { return search ? `${pathname}?${search}` : pathname; }
export function worldLabelFor(world: GlowWorld) { return WORLD_LABEL[canonicalWorld(world)]; }
export function worldRootFor(world: GlowWorld) { return WORLD_ROOT[canonicalWorld(world)]; }
export function railTargetsForWorld(world: GlowWorld) { return RAIL_TARGETS[canonicalWorld(world)]; }

export function roomLabelForPath(path: string, world?: GlowWorld) {
  const { pathname, search } = cleanPath(path);
  if (pathname === '/today') {
    const room = todayRoom(search);
    return room ? TODAY_ROOM_LABEL[room] ?? friendly(room) : 'Today';
  }
  if (pathname === '/home') return 'Glow Home';
  const manifest = pageManifestFor(pathname);
  if (manifest) return manifest.label;
  const segments = pathname.split('/').filter(Boolean);
  return segments.length ? friendly(segments.at(-1) ?? 'Today') : (world ? WORLD_LABEL[canonicalWorld(world)] : 'Today');
}

export function depthLabelsForPath(path: string, world: GlowWorld) {
  const { pathname, search } = cleanPath(path);
  if (pathname === '/home') return ['Glow Home'];
  if (pathname === '/today') {
    const room = todayRoom(search);
    return room && room !== 'what-now' ? ['Today', TODAY_ROOM_LABEL[room] ?? friendly(room)] : ['Today'];
  }
  const chain = pageManifestChainFor(pathname);
  if (chain.length) return chain.map((item) => item.label).slice(-4);
  const labels = [WORLD_LABEL[canonicalWorld(world)], ...pathname.split('/').filter(Boolean).map(friendly)];
  return [...new Set(labels)].slice(-4);
}

export function returnTargetForPath(path: string, world: GlowWorld): ShellReturnTarget | null {
  const { pathname, search } = cleanPath(path);
  const normalizedWorld = canonicalWorld(world);
  if (pathname === '/home') return null;
  if (pathname === '/today') {
    const room = todayRoom(search);
    return !room || room === 'what-now' || room === 'morning' ? null : { label: 'Today', path: '/today?room=what-now' };
  }
  const manifest = pageManifestFor(pathname);
  if (manifest?.parent) {
    const parent = pageManifestFor(manifest.parent);
    return { label: parent?.label ?? friendly(manifest.parent.split('/').filter(Boolean).at(-1) ?? WORLD_LABEL[normalizedWorld]), path: manifest.parent };
  }
  if (manifest?.level === 'world') return normalizedWorld === 'today' ? null : { label: 'Today', path: '/today?room=what-now' };
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const parentPath = `/${segments.slice(0, -1).join('/')}`;
    return { label: pageManifestFor(parentPath)?.label ?? friendly(segments.at(-2) ?? WORLD_LABEL[normalizedWorld]), path: parentPath };
  }
  return normalizedWorld === 'today' ? null : { label: WORLD_LABEL[normalizedWorld], path: WORLD_ROOT[normalizedWorld] };
}

export function enclosureForPath(path: string): GlowEnclosure {
  const { pathname, search } = cleanPath(path);
  const params = new URLSearchParams(search);
  const room = params.get('room');
  if (params.get('focus') === '1' || (pathname === '/today' && (room === 'focus' || room === 'replan'))) return 'protected';
  if (pathname === '/today') return room === 'what-now' || room === 'meeting' || room === 'event' || room === 'day-view' ? 'structured' : 'open';
  if (pathname === '/home') return 'open';
  return pageManifestFor(pathname)?.layoutFamily ?? 'structured';
}

export function railTargetIsActive(currentPath: string, targetPath: string) {
  const current = cleanPath(currentPath); const target = cleanPath(targetPath);
  if (current.pathname !== target.pathname) return false;
  if (!target.search) return !current.search || current.pathname !== '/today';
  const currentParams = new URLSearchParams(current.search); const targetParams = new URLSearchParams(target.search);
  for (const [key, value] of targetParams.entries()) if (currentParams.get(key) !== value) return false;
  return true;
}
