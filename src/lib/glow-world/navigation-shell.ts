import type { GlowWorld } from '@/lib/glow-world/room-experience';
import { pageManifestChainFor, pageManifestFor } from '@/lib/glow-world/page-manifest';

export type GlowEnclosure = 'open' | 'structured' | 'protected';
export type ShellTarget = { label: string; path: string; cue: string };
export type ShellWorldTarget = ShellTarget & { world: GlowWorld };
export type ShellReturnTarget = { label: string; path: string };

export const WORLD_TARGETS: ShellWorldTarget[] = [
  { world: 'today', label: 'Today', path: '/today?room=what-now', cue: 'the immediate present' },
  { world: 'plan', label: 'Plan', path: '/planning', cue: 'time extending forward' },
  { world: 'life', label: 'Life', path: '/life', cue: 'your inhabited systems' },
  { world: 'beauty', label: 'Beauty', path: '/beauty', cue: 'care and appearance preparation' },
  { world: 'brain', label: 'Brain', path: '/brain', cue: 'memory and connection depth' },
  { world: 'create', label: 'Create', path: '/create', cue: 'unfinished possibility' },
];

const WORLD_ROOT: Record<GlowWorld, string> = Object.fromEntries(WORLD_TARGETS.map((item) => [item.world, item.path])) as Record<GlowWorld, string>;
const WORLD_LABEL: Record<GlowWorld, string> = Object.fromEntries(WORLD_TARGETS.map((item) => [item.world, item.label])) as Record<GlowWorld, string>;

const TODAY_ROOM_LABEL: Record<string, string> = {
  morning: 'Morning Brief', 'what-now': 'What Now', focus: 'Focus Session', people: 'People', places: 'Places', resources: 'Resources',
  journey: 'Journeys', journeys: 'Journeys', meeting: 'Event Detail', 'next-up': 'Next Up', later: 'Later', tonight: 'Tonight',
  tomorrow: 'Tomorrow Preview', replan: 'Replan My Day', 'day-view': 'Day View',
};

const RAIL_TARGETS: Record<GlowWorld, ShellTarget[]> = {
  today: [
    { label: 'Today', path: '/today?room=what-now', cue: 'Now' }, { label: 'Focus', path: '/today?room=focus', cue: 'Protected chamber' },
    { label: 'People', path: '/today?room=people', cue: 'Relationships' }, { label: 'Places', path: '/today?room=places', cue: 'Places' },
    { label: 'Resources', path: '/today?room=resources', cue: 'Resources' }, { label: 'Journeys', path: '/today?room=journey', cue: 'Journeys' },
  ],
  plan: [
    { label: 'Plan', path: '/planning', cue: 'Future' }, { label: 'Calendar', path: '/calendar', cue: 'Time' },
    { label: 'Tasks', path: '/tasks', cue: 'Readiness' }, { label: 'Reminders', path: '/reminders', cue: 'Context' },
    { label: 'Routines', path: '/routines', cue: 'Rhythm' }, { label: 'Habits', path: '/habits', cue: 'Patterns' }, { label: 'Goals', path: '/goals', cue: 'Horizon' },
  ],
  life: [
    { label: 'Life', path: '/life', cue: 'Personal House' }, { label: 'Body', path: '/wellness', cue: 'Body' },
    { label: 'Fitness', path: '/fitness', cue: 'Movement' }, { label: 'Food', path: '/food', cue: 'Nourishment' },
    { label: 'Closet', path: '/closet', cue: 'Wardrobe' }, { label: 'Home', path: '/life?focus=home', cue: 'Place' },
    { label: 'Money', path: '/finance', cue: 'Money' }, { label: 'Work', path: '/work', cue: 'Work' },
  ],
  beauty: [
    { label: 'Beauty', path: '/beauty', cue: 'Personal Atelier' }, { label: 'Beauty Today', path: '/beauty/today', cue: 'Now' },
    { label: 'Skin', path: '/beauty/skincare', cue: 'Treatment' }, { label: 'Hair', path: '/hair', cue: 'Hair' },
    { label: 'Makeup', path: '/beauty/makeup', cue: 'Looks' }, { label: 'Body', path: '/beauty/body', cue: 'Body care' },
    { label: 'Fragrance', path: '/beauty/fragrance', cue: 'Scent' }, { label: 'Gua Sha Studio', path: '/beauty/gua-sha', cue: 'Guided facial movement' },
    { label: 'Maintenance', path: '/beauty/maintenance', cue: 'Rhythm' }, { label: 'Devices', path: '/beauty/devices', cue: 'Tools' },
    { label: 'Inventory', path: '/beauty/inventory', cue: 'Owned' }, { label: 'Progress', path: '/beauty/progress', cue: 'History' },
  ],
  brain: [
    { label: 'Brain', path: '/brain', cue: 'Knowledge' }, { label: 'Search', path: '/search', cue: 'Universal lens' },
    { label: 'Notes', path: '/notes', cue: 'Thinking' }, { label: 'Memory', path: '/memory', cue: 'Recall' },
    { label: 'Timeline', path: '/timeline', cue: 'History' }, { label: 'Connections', path: '/connections', cue: 'Relations' },
    { label: 'Observations', path: '/observations', cue: 'Patterns' },
  ],
  create: [
    { label: 'Create', path: '/create', cue: 'Possibility' }, { label: 'Import', path: '/import', cue: 'Transform sources' },
    { label: 'Concierge', path: '/concierge', cue: 'Orchestrate' },
  ],
};

function cleanPath(path: string) { const [pathname = '/', search = ''] = path.split('?'); return { pathname: pathname || '/', search }; }
function friendly(value: string) { return decodeURIComponent(value).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function todayRoom(search: string) { return new URLSearchParams(search).get('room') ?? ''; }

export function currentPathFor(pathname: string, search: string) { return search ? `${pathname}?${search}` : pathname; }
export function worldLabelFor(world: GlowWorld) { return WORLD_LABEL[world]; }
export function worldRootFor(world: GlowWorld) { return WORLD_ROOT[world]; }
export function railTargetsForWorld(world: GlowWorld) { return RAIL_TARGETS[world]; }

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
  return segments.length ? friendly(segments.at(-1) ?? 'Today') : (world ? WORLD_LABEL[world] : 'Today');
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
  const labels = [WORLD_LABEL[world], ...pathname.split('/').filter(Boolean).map(friendly)];
  return [...new Set(labels)].slice(-4);
}

export function returnTargetForPath(path: string, world: GlowWorld): ShellReturnTarget | null {
  const { pathname, search } = cleanPath(path);
  if (pathname === '/home') return null;
  if (pathname === '/today') {
    const room = todayRoom(search);
    return !room || room === 'what-now' || room === 'morning' ? null : { label: 'Today', path: '/today?room=what-now' };
  }
  const manifest = pageManifestFor(pathname);
  if (manifest?.parent) {
    const parent = pageManifestFor(manifest.parent);
    return { label: parent?.label ?? friendly(manifest.parent.split('/').filter(Boolean).at(-1) ?? WORLD_LABEL[world]), path: manifest.parent };
  }
  if (manifest?.level === 'world') return world === 'today' ? null : { label: 'Today', path: '/today?room=what-now' };

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const parentPath = `/${segments.slice(0, -1).join('/')}`;
    return { label: pageManifestFor(parentPath)?.label ?? friendly(segments.at(-2) ?? WORLD_LABEL[world]), path: parentPath };
  }
  return world === 'today' ? null : { label: WORLD_LABEL[world], path: WORLD_ROOT[world] };
}

export function enclosureForPath(path: string): GlowEnclosure {
  const { pathname, search } = cleanPath(path);
  const params = new URLSearchParams(search);
  const room = params.get('room');
  if (params.get('focus') === '1' || (pathname === '/today' && (room === 'focus' || room === 'replan'))) return 'protected';
  if (pathname === '/today') return room === 'what-now' || room === 'meeting' || room === 'day-view' ? 'structured' : 'open';
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
