import { pageManifestChainFor, pageManifestFor } from '@/lib/glow-world/page-manifest';

export type VisibleWorldKey =
  | 'home'
  | 'today'
  | 'plan'
  | 'life'
  | 'beauty'
  | 'closet'
  | 'fitness'
  | 'wellness'
  | 'brain'
  | 'create';

export type NavigationDestination = {
  key: VisibleWorldKey;
  label: string;
  path: string;
  group: 'DAILY' | 'LIFE' | 'SELF' | 'MIND + CREATE';
  cue: string;
};

export type NavigationUtility = {
  key: 'search' | 'ask-glow' | 'concierge' | 'attention' | 'settings';
  label: string;
  path?: string;
  event?: string;
};

export type NavigationTab = { label: string; path: string };
export type BreadcrumbTarget = { label: string; path: string };

export const GLOBAL_NAVIGATION: readonly NavigationDestination[] = [
  { key: 'home', label: 'Home', path: '/home', group: 'DAILY', cue: 'Your command center' },
  { key: 'today', label: 'Today', path: '/today?room=what-now', group: 'DAILY', cue: 'What is happening now' },
  { key: 'plan', label: 'Plan', path: '/planning', group: 'DAILY', cue: 'Calendar, tasks, routines and goals' },
  { key: 'life', label: 'Life', path: '/life', group: 'LIFE', cue: 'Home, food, money, travel and career' },
  { key: 'beauty', label: 'Beauty', path: '/beauty', group: 'SELF', cue: 'Skincare, hair, makeup and maintenance' },
  { key: 'closet', label: 'Closet', path: '/closet', group: 'SELF', cue: 'Wardrobe, outfits and style' },
  { key: 'fitness', label: 'Fitness', path: '/fitness', group: 'SELF', cue: 'Training, programs and progress' },
  { key: 'wellness', label: 'Wellness', path: '/wellness', group: 'SELF', cue: 'Energy, sleep and care' },
  { key: 'brain', label: 'Brain', path: '/brain', group: 'MIND + CREATE', cue: 'Notes, memory and knowledge' },
  { key: 'create', label: 'Create', path: '/create', group: 'MIND + CREATE', cue: 'Projects, ideas and creative work' },
] as const;

export const GLOBAL_UTILITIES: readonly NavigationUtility[] = [
  { key: 'search', label: 'Search', path: '/search' },
  { key: 'ask-glow', label: 'Ask Glow', event: 'glow:open' },
  { key: 'concierge', label: 'Concierge', path: '/concierge' },
  { key: 'attention', label: 'Attention Center', path: '/attention' },
  { key: 'settings', label: 'Settings', path: '/settings' },
] as const;

export const CREATE_DESTINATIONS: readonly { label: string; path: string; type: string }[] = [
  { label: 'Task', path: '/tasks?create=1', type: 'task' },
  { label: 'Event', path: '/calendar?create=1', type: 'event' },
  { label: 'Routine', path: '/routines/manage', type: 'routine' },
  { label: 'Goal', path: '/goals/manage', type: 'goal' },
  { label: 'Project', path: '/projects/manage', type: 'project' },
  { label: 'Note', path: '/notes/new', type: 'note' },
  { label: 'Idea', path: '/brain/ideas/new', type: 'idea' },
  { label: 'Meal', path: '/food/meals/new', type: 'meal' },
  { label: 'Workout', path: '/fitness/workouts/new', type: 'workout' },
  { label: 'Beauty entry', path: '/beauty/today?create=1', type: 'beauty-entry' },
  { label: 'Shopping item', path: '/life/shopping?create=1', type: 'shopping-item' },
] as const;

const GROUP_ORDER = ['DAILY', 'LIFE', 'SELF', 'MIND + CREATE'] as const;

export const GLOBAL_NAVIGATION_GROUPS = GROUP_ORDER.map((label) => ({
  label,
  items: GLOBAL_NAVIGATION.filter((item) => item.group === label),
}));

const SECTION_TABS: readonly { match: (pathname: string) => boolean; tabs: readonly NavigationTab[] }[] = [
  {
    match: (pathname) => pathname.startsWith('/beauty/skincare'),
    tabs: [
      { label: 'Overview', path: '/beauty/skincare' },
      { label: 'Routine', path: '/beauty/skincare/routine' },
      { label: 'Products', path: '/beauty/skincare/products' },
      { label: 'Treatments', path: '/beauty/skincare/treatments' },
      { label: 'Skin Log', path: '/beauty/skincare/skin-log' },
      { label: 'Progress', path: '/beauty/skincare/progress' },
      { label: 'Schedule', path: '/beauty/skincare/schedule' },
      { label: 'Goals', path: '/beauty/skincare/goals' },
      { label: 'Recommendations', path: '/beauty/skincare/recommendations' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/beauty/gua-sha') || pathname.startsWith('/beauty/facial-massage'),
    tabs: [
      { label: 'Overview', path: '/beauty/gua-sha' },
      { label: 'Morning', path: '/beauty/gua-sha/morning' },
      { label: 'Midday', path: '/beauty/gua-sha/midday' },
      { label: 'Night', path: '/beauty/gua-sha/night' },
      { label: 'Guided', path: '/beauty/gua-sha/guided' },
      { label: 'Progress', path: '/beauty/gua-sha/progress' },
      { label: 'Tools', path: '/beauty/gua-sha/tools' },
      { label: 'Journal', path: '/beauty/gua-sha/journal' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/beauty') || pathname.startsWith('/hair'),
    tabs: [
      { label: 'Overview', path: '/beauty' },
      { label: 'Skincare', path: '/beauty/skincare' },
      { label: 'Gua Sha', path: '/beauty/gua-sha' },
      { label: 'Hair', path: '/hair' },
      { label: 'Makeup', path: '/beauty/makeup' },
      { label: 'Body', path: '/beauty/body' },
      { label: 'Nails', path: '/beauty/nails' },
      { label: 'Brows + Lashes', path: '/beauty/brows-lashes' },
      { label: 'Oral Care', path: '/beauty/oral-care' },
      { label: 'Fragrance', path: '/beauty/fragrance' },
      { label: 'Tools + Devices', path: '/beauty/devices' },
      { label: 'Maintenance', path: '/beauty/maintenance' },
      { label: 'Inventory', path: '/beauty/inventory' },
      { label: 'Wishlist', path: '/beauty/wishlist' },
      { label: 'Progress', path: '/beauty/progress' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/closet'),
    tabs: [
      { label: 'Overview', path: '/closet' },
      { label: 'Wardrobe', path: '/closet/wardrobe' },
      { label: 'Outfits', path: '/closet/outfits' },
      { label: 'Looks', path: '/closet/looks' },
      { label: 'Planner', path: '/closet/planner' },
      { label: 'Wishlist', path: '/closet/wishlist' },
      { label: 'Shopping', path: '/closet/shopping' },
      { label: 'Style Profile', path: '/closet/style-profile' },
      { label: 'Measurements', path: '/closet/measurements' },
      { label: 'Colors', path: '/closet/colors' },
      { label: 'Inspiration', path: '/closet/inspiration' },
      { label: 'Packing', path: '/closet/packing' },
      { label: 'Laundry + Care', path: '/closet/laundry-care' },
      { label: 'Seasonal Rotation', path: '/closet/seasonal-rotation' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/fitness'),
    tabs: [
      { label: 'Overview', path: '/fitness' },
      { label: 'Today', path: '/fitness/today' },
      { label: 'Workouts', path: '/fitness/workouts' },
      { label: 'Programs', path: '/fitness/programs' },
      { label: 'Exercises', path: '/fitness/exercises' },
      { label: 'Schedule', path: '/fitness/schedule' },
      { label: 'Progress', path: '/fitness/progress' },
      { label: 'Measurements', path: '/fitness/measurements' },
      { label: 'Goals', path: '/fitness/goals' },
      { label: 'Recovery', path: '/fitness/recovery' },
      { label: 'Library', path: '/fitness/library' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/wellness') || pathname.startsWith('/maintenance'),
    tabs: [
      { label: 'Overview', path: '/wellness' },
      { label: 'Check-In', path: '/wellness/check-in' },
      { label: 'Energy', path: '/wellness/energy' },
      { label: 'Sleep', path: '/wellness/sleep' },
      { label: 'Mood', path: '/wellness/mood' },
      { label: 'Symptoms', path: '/wellness/symptoms' },
      { label: 'Nutrition', path: '/wellness/nutrition' },
      { label: 'Hydration', path: '/wellness/hydration' },
      { label: 'Care', path: '/wellness/care' },
      { label: 'Appointments', path: '/wellness/appointments' },
      { label: 'Trends', path: '/wellness/trends' },
      { label: 'Goals', path: '/wellness/goals' },
      { label: 'Journal', path: '/wellness/journal' },
      { label: 'Plans', path: '/wellness/plans' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/planning') || pathname.startsWith('/calendar') || pathname.startsWith('/tasks') || pathname.startsWith('/routines') || pathname.startsWith('/goals') || pathname.startsWith('/projects') || pathname.startsWith('/reminders') || pathname.startsWith('/habits'),
    tabs: [
      { label: 'Overview', path: '/planning' },
      { label: 'Calendar', path: '/calendar' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Routines', path: '/routines' },
      { label: 'Goals', path: '/goals' },
      { label: 'Projects', path: '/projects' },
      { label: 'Day', path: '/planning/planner/today' },
      { label: 'Week', path: '/planning/planner/week' },
      { label: 'Month', path: '/planning/planner/month' },
      { label: 'Reviews', path: '/planning/planner/insights' },
      { label: 'Inbox', path: '/inbox' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/life') || pathname.startsWith('/food') || pathname.startsWith('/finance') || pathname.startsWith('/money') || pathname.startsWith('/travel') || pathname.startsWith('/work') || pathname.startsWith('/relationships') || pathname.startsWith('/saint'),
    tabs: [
      { label: 'Overview', path: '/life' },
      { label: 'Home', path: '/life/home' },
      { label: 'Food + Groceries', path: '/food' },
      { label: 'Money', path: '/finance' },
      { label: 'Travel', path: '/travel' },
      { label: 'Career', path: '/work' },
      { label: 'Shopping', path: '/life/shopping' },
      { label: 'Transportation', path: '/life/transportation' },
      { label: 'Documents', path: '/life/documents' },
      { label: 'Maintenance', path: '/maintenance' },
      { label: 'Personal Admin', path: '/life/personal-admin' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/brain') || pathname.startsWith('/notes') || pathname.startsWith('/memory') || pathname.startsWith('/timeline') || pathname.startsWith('/connections') || pathname.startsWith('/observations') || pathname.startsWith('/resources'),
    tabs: [
      { label: 'Overview', path: '/brain' },
      { label: 'Inbox', path: '/brain/inbox' },
      { label: 'Notes', path: '/notes' },
      { label: 'Ideas', path: '/brain/ideas' },
      { label: 'Knowledge', path: '/brain/knowledge' },
      { label: 'Journal', path: '/brain/journal' },
      { label: 'Decisions', path: '/brain/decisions' },
      { label: 'Questions', path: '/brain/questions' },
      { label: 'Collections', path: '/brain/collections' },
      { label: 'Saved', path: '/brain/saved' },
      { label: 'References', path: '/resources' },
      { label: 'Archive', path: '/memory' },
    ],
  },
  {
    match: (pathname) => pathname.startsWith('/create') || pathname.startsWith('/intake') || pathname.startsWith('/import') || pathname.startsWith('/inbox'),
    tabs: [
      { label: 'Overview', path: '/create' },
      { label: 'Projects', path: '/create/projects' },
      { label: 'Ideas', path: '/create/ideas' },
      { label: 'Moodboards', path: '/create/moodboards' },
      { label: 'Content', path: '/create/content' },
      { label: 'Writing', path: '/create/writing' },
      { label: 'Design', path: '/create/design' },
      { label: 'Reference', path: '/create/reference' },
      { label: 'Assets', path: '/create/assets' },
      { label: 'Templates', path: '/create/templates' },
      { label: 'Drafts', path: '/create/drafts' },
      { label: 'Published', path: '/create/published' },
      { label: 'Archive', path: '/create/archive' },
    ],
  },
  {
    match: (pathname) => pathname === '/today',
    tabs: [
      { label: 'Now', path: '/today?room=what-now' },
      { label: 'Timeline', path: '/today?room=day-view' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Routines', path: '/routines' },
      { label: 'Appointments', path: '/calendar' },
      { label: 'Free Time', path: '/today?room=later' },
      { label: 'Energy', path: '/today?room=morning' },
      { label: 'Tonight', path: '/today?room=tonight' },
      { label: 'Tomorrow', path: '/today?room=tomorrow' },
    ],
  },
];

const VISIBLE_PREFIXES: readonly [VisibleWorldKey, readonly string[]][] = [
  ['home', ['/home']],
  ['today', ['/today']],
  ['beauty', ['/beauty', '/hair']],
  ['closet', ['/closet']],
  ['fitness', ['/fitness']],
  ['wellness', ['/wellness', '/maintenance']],
  ['plan', ['/planning', '/calendar', '/tasks', '/routines', '/goals', '/projects', '/reminders', '/habits', '/tomorrow']],
  ['brain', ['/brain', '/notes', '/memory', '/timeline', '/connections', '/observations', '/resources']],
  ['create', ['/create', '/intake', '/import', '/inbox']],
  ['life', ['/life', '/food', '/finance', '/money', '/travel', '/work', '/relationships', '/saint', '/body', '/gmail']],
];

function friendly(value: string) {
  return decodeURIComponent(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function pathnameOf(path: string) {
  return path.split('?')[0] || '/';
}

export function visibleWorldForPath(pathname: string): VisibleWorldKey {
  const path = pathnameOf(pathname);
  for (const [key, prefixes] of VISIBLE_PREFIXES) {
    if (prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return key;
  }
  return 'today';
}

export function navigationDestinationIsActive(pathname: string, destination: NavigationDestination) {
  return visibleWorldForPath(pathname) === destination.key;
}

export function localTabsForPath(pathname: string): readonly NavigationTab[] {
  return SECTION_TABS.find((entry) => entry.match(pathnameOf(pathname)))?.tabs ?? [];
}

export function localTabIsActive(currentPath: string, targetPath: string) {
  const current = pathnameOf(currentPath);
  const target = pathnameOf(targetPath);
  if (target === '/planning' || target === '/life' || target === '/beauty' || target === '/brain' || target === '/create' || target === '/closet' || target === '/fitness' || target === '/wellness') {
    return current === target;
  }
  return current === target || current.startsWith(`${target}/`);
}

function visibleRootFor(key: VisibleWorldKey) {
  return GLOBAL_NAVIGATION.find((item) => item.key === key)?.path.split('?')[0] ?? '/today';
}

export function breadcrumbsForPath(pathname: string, search = ''): BreadcrumbTarget[] {
  const path = pathnameOf(pathname);
  if (path === '/home') return [{ label: 'Home', path: '/home' }];
  if (path === '/today') {
    const room = new URLSearchParams(search).get('room');
    const labels: Record<string, string> = {
      'what-now': 'Now', morning: 'Morning', focus: 'Focus', people: 'People', places: 'Places',
      library: 'Library', 'next-up': 'Next Up', later: 'Later', tonight: 'Tonight',
      tomorrow: 'Tomorrow', replan: 'Replan', 'day-view': 'Timeline',
    };
    return room && room !== 'what-now'
      ? [{ label: 'Today', path: '/today?room=what-now' }, { label: labels[room] ?? friendly(room), path: `/today?room=${room}` }]
      : [{ label: 'Today', path: '/today?room=what-now' }];
  }

  const visible = visibleWorldForPath(path);
  const chain = pageManifestChainFor(path);
  if (chain.length) {
    let items = chain.map((item) => ({ label: item.label, path: item.match }));
    const root = visibleRootFor(visible);
    const rootIndex = items.findIndex((item) => item.path === root);
    if (rootIndex > 0) items = items.slice(rootIndex);
    if (visible === 'beauty' && path.startsWith('/hair')) items = [{ label: 'Beauty', path: '/beauty' }, ...items.filter((item) => item.path !== '/life')];
    return items.slice(-5);
  }

  const root = visibleRootFor(visible);
  const rootLabel = GLOBAL_NAVIGATION.find((item) => item.key === visible)?.label ?? friendly(visible);
  const segments = path.split('/').filter(Boolean);
  const rootSegments = root.split('/').filter(Boolean);
  const crumbs: BreadcrumbTarget[] = [{ label: rootLabel, path: root }];
  for (let index = rootSegments.length; index < segments.length; index += 1) {
    const partial = `/${segments.slice(0, index + 1).join('/')}`;
    if (partial !== root) crumbs.push({ label: pageManifestFor(partial)?.label ?? friendly(segments[index]), path: partial });
  }
  return crumbs.slice(-5);
}

export function utilityIsActive(pathname: string, utility: NavigationUtility) {
  if (!utility.path) return false;
  const path = pathnameOf(pathname);
  return path === utility.path || path.startsWith(`${utility.path}/`);
}
