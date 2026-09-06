import type { GlowWorld } from '@/lib/glow-world/room-experience';

export type GlowEnclosure = 'open' | 'structured' | 'protected';

export type ShellTarget = {
  label: string;
  path: string;
  cue: string;
};

export type ShellWorldTarget = ShellTarget & {
  world: GlowWorld;
};

export type ShellReturnTarget = {
  label: string;
  path: string;
};

export const WORLD_TARGETS: ShellWorldTarget[] = [
  { world: 'today', label: 'Today', path: '/today?room=what-now', cue: 'the immediate present' },
  { world: 'plan', label: 'Plan', path: '/planning', cue: 'time extending forward' },
  { world: 'life', label: 'Life', path: '/life', cue: 'your inhabited systems' },
  { world: 'beauty', label: 'Beauty', path: '/beauty', cue: 'care and appearance preparation' },
  { world: 'brain', label: 'Brain', path: '/brain', cue: 'memory and connection depth' },
  { world: 'create', label: 'Create', path: '/create', cue: 'unfinished possibility' },
];

const WORLD_ROOT: Record<GlowWorld, string> = {
  today: '/today?room=what-now',
  plan: '/planning',
  life: '/life',
  beauty: '/beauty',
  brain: '/brain',
  create: '/create',
};

const WORLD_LABEL: Record<GlowWorld, string> = {
  today: 'Today',
  plan: 'Plan',
  life: 'Life',
  beauty: 'Beauty',
  brain: 'Brain',
  create: 'Create',
};

const TODAY_ROOM_LABEL: Record<string, string> = {
  morning: 'Morning Brief',
  'what-now': 'What Now',
  focus: 'Focus Session',
  people: 'People',
  places: 'Places',
  resources: 'Resources',
  journey: 'Journeys',
  journeys: 'Journeys',
  meeting: 'Event Detail',
  'next-up': 'Next Up',
  later: 'Later',
  tonight: 'Tonight',
  tomorrow: 'Tomorrow Preview',
  replan: 'Replan My Day',
  'day-view': 'Day View',
};

const RAIL_TARGETS: Record<GlowWorld, ShellTarget[]> = {
  today: [
    { label: 'Today', path: '/today?room=what-now', cue: 'Now' },
    { label: 'Focus', path: '/today?room=focus', cue: 'Protected chamber' },
    { label: 'People', path: '/today?room=people', cue: 'Relationships' },
    { label: 'Places', path: '/today?room=places', cue: 'Places' },
    { label: 'Resources', path: '/today?room=resources', cue: 'Resources' },
    { label: 'Journeys', path: '/today?room=journey', cue: 'Journeys' },
  ],
  plan: [
    { label: 'Plan', path: '/planning', cue: 'Future' },
    { label: 'Calendar', path: '/calendar', cue: 'Time' },
    { label: 'Tasks', path: '/tasks', cue: 'Readiness' },
    { label: 'Reminders', path: '/reminders', cue: 'Context' },
    { label: 'Routines', path: '/routines', cue: 'Rhythm' },
    { label: 'Habits', path: '/habits', cue: 'Patterns' },
    { label: 'Goals', path: '/goals', cue: 'Horizon' },
  ],
  life: [
    { label: 'Life', path: '/life', cue: 'Personal House' },
    { label: 'Body', path: '/wellness', cue: 'Body' },
    { label: 'Fitness', path: '/fitness', cue: 'Movement' },
    { label: 'Food', path: '/food', cue: 'Nourishment' },
    { label: 'Closet', path: '/closet', cue: 'Wardrobe' },
    { label: 'Home', path: '/life?focus=home', cue: 'Place' },
    { label: 'Money', path: '/finance', cue: 'Money' },
    { label: 'Work', path: '/work', cue: 'Work' },
  ],
  beauty: [
    { label: 'Beauty', path: '/beauty', cue: 'Personal Atelier' },
    { label: 'Beauty Today', path: '/beauty/today', cue: 'Now' },
    { label: 'Skin', path: '/beauty/skincare', cue: 'Treatment' },
    { label: 'Hair', path: '/hair', cue: 'Hair' },
    { label: 'Makeup', path: '/beauty/makeup', cue: 'Looks' },
    { label: 'Body', path: '/beauty/body', cue: 'Body care' },
    { label: 'Fragrance', path: '/beauty/fragrance', cue: 'Scent' },
    { label: 'Facial Movement', path: '/beauty/facial-massage', cue: 'Movement' },
    { label: 'Maintenance', path: '/beauty/maintenance', cue: 'Rhythm' },
    { label: 'Devices', path: '/beauty/devices', cue: 'Tools' },
    { label: 'Inventory', path: '/beauty/inventory', cue: 'Owned' },
    { label: 'Progress', path: '/beauty/progress', cue: 'History' },
  ],
  brain: [
    { label: 'Brain', path: '/brain', cue: 'Knowledge' },
    { label: 'Search', path: '/search', cue: 'Universal lens' },
    { label: 'Notes', path: '/notes', cue: 'Thinking' },
    { label: 'Memory', path: '/memory', cue: 'Recall' },
    { label: 'Timeline', path: '/timeline', cue: 'History' },
    { label: 'Connections', path: '/connections', cue: 'Relations' },
    { label: 'Observations', path: '/observations', cue: 'Patterns' },
  ],
  create: [
    { label: 'Create', path: '/create', cue: 'Possibility' },
    { label: 'Import', path: '/import', cue: 'Transform sources' },
    { label: 'Concierge', path: '/concierge', cue: 'Orchestrate' },
  ],
};

function cleanPath(path: string) {
  const [pathname = '/', search = ''] = path.split('?');
  return { pathname: pathname || '/', search };
}

function friendly(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function todayRoom(search: string) {
  return new URLSearchParams(search).get('room') ?? '';
}

export function currentPathFor(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

export function worldLabelFor(world: GlowWorld) {
  return WORLD_LABEL[world];
}

export function worldRootFor(world: GlowWorld) {
  return WORLD_ROOT[world];
}

export function railTargetsForWorld(world: GlowWorld) {
  return RAIL_TARGETS[world];
}

export function roomLabelForPath(path: string, world?: GlowWorld) {
  const { pathname, search } = cleanPath(path);
  if (pathname === '/today') {
    const room = todayRoom(search);
    if (room) return TODAY_ROOM_LABEL[room] ?? friendly(room);
    return 'Today';
  }
  if (pathname === '/home') return 'Glow Home';
  if (pathname === '/beauty') return 'Personal Atelier';
  if (pathname === '/search') return 'Universal Search';
  if (pathname === '/habits') return 'Habits';
  if (pathname === '/habits/daily') return 'Daily Habits';

  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return world ? WORLD_LABEL[world] : 'Today';
  return friendly(segments.at(-1) ?? 'Today');
}

export function depthLabelsForPath(path: string, world: GlowWorld) {
  const { pathname, search } = cleanPath(path);
  if (pathname === '/home') return ['Glow Home'];
  if (pathname === '/search') return ['Universal', 'Search'];
  const labels: string[] = [WORLD_LABEL[world]];

  if (pathname === '/today') {
    const room = todayRoom(search);
    if (room && room !== 'what-now') labels.push(TODAY_ROOM_LABEL[room] ?? friendly(room));
    return labels;
  }

  const segments = pathname.split('/').filter(Boolean);
  for (const segment of segments) {
    const label = friendly(segment);
    const last = labels.at(-1)?.toLowerCase();
    if (label.toLowerCase() !== last && label.toLowerCase() !== WORLD_LABEL[world].toLowerCase()) labels.push(label);
  }

  return labels.slice(-4);
}

export function returnTargetForPath(path: string, world: GlowWorld): ShellReturnTarget | null {
  const { pathname, search } = cleanPath(path);
  const params = new URLSearchParams(search);
  if (pathname === '/home') return null;

  if (pathname === '/today') {
    const room = params.get('room');
    if (!room || room === 'what-now' || room === 'morning') return null;
    return { label: 'Today', path: '/today?room=what-now' };
  }

  if (world === 'beauty' && pathname !== '/beauty') return { label: 'Beauty', path: '/beauty' };

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 1) {
    const parentSegments = segments.slice(0, -1);
    const parentPath = `/${parentSegments.join('/')}`;
    return { label: friendly(parentSegments.at(-1) ?? WORLD_LABEL[world]), path: parentPath };
  }

  const worldRoot = WORLD_ROOT[world].split('?')[0];
  if (pathname === worldRoot) {
    return world === 'today' ? null : { label: 'Today', path: '/today?room=what-now' };
  }

  if (world !== 'today') return { label: WORLD_LABEL[world], path: WORLD_ROOT[world] };
  return { label: 'Today', path: '/today?room=what-now' };
}

export function enclosureForPath(path: string): GlowEnclosure {
  const { pathname, search } = cleanPath(path);
  const params = new URLSearchParams(search);
  const room = params.get('room');

  if (pathname === '/home' || pathname === '/search') return 'open';
  if (params.get('focus') === '1' || (pathname === '/today' && (room === 'focus' || room === 'replan'))) return 'protected';

  if (pathname === '/today') {
    if (room === 'what-now' || room === 'meeting' || room === 'day-view') return 'structured';
    return 'open';
  }

  if (pathname === '/beauty' || pathname.startsWith('/beauty/')) return 'open';

  const protectedStarts = ['/focus'];
  if (protectedStarts.some((prefix) => pathname.startsWith(prefix))) return 'protected';

  const openStarts = [
    '/life',
    '/world',
    '/life-world',
    '/brain',
    '/memory',
    '/timeline',
    '/connections',
    '/observations',
    '/create',
    '/inbox',
    '/concierge',
    '/travel',
    '/relationships',
  ];
  if (openStarts.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return 'open';

  return 'structured';
}

export function railTargetIsActive(currentPath: string, targetPath: string) {
  const current = cleanPath(currentPath);
  const target = cleanPath(targetPath);
  if (current.pathname !== target.pathname) return false;

  if (!target.search) return !current.search || current.pathname !== '/today';

  const currentParams = new URLSearchParams(current.search);
  const targetParams = new URLSearchParams(target.search);
  for (const [key, value] of targetParams.entries()) {
    if (currentParams.get(key) !== value) return false;
  }
  return true;
}
