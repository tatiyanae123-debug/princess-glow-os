import type { GlowWorld } from '@/lib/glow-world/room-experience';

export type GlowPageLevel = 'world' | 'room' | 'studio' | 'experience' | 'object' | 'detail' | 'overlay';
export type GlowSyncDimension = 'data' | 'state' | 'time' | 'navigation' | 'intelligence' | 'action' | 'visual' | 'history';

export type GlowPageManifest = {
  id: string;
  match: string;
  label: string;
  world: GlowWorld;
  level: GlowPageLevel;
  parent?: string | null;
  family: string;
  designFamily: string;
  layoutFamily: 'open' | 'structured' | 'protected';
  objectTypes: string[];
  specialists: string[];
  sync: GlowSyncDimension[];
  preservesReturnContext: boolean;
};

export const REQUIRED_SYNC_DIMENSIONS: GlowSyncDimension[] = [
  'data', 'state', 'time', 'navigation', 'intelligence', 'action', 'visual', 'history',
];

/**
 * Canonical location registry for Glow OS.
 *
 * Rules:
 * - A page is an experience projected through the operating system, never its own shell.
 * - Exact matches win over prefix matches.
 * - New routes must be registered here (or generated into this registry) before they are complete.
 * - Families may change art direction, but never navigation physics, state ownership, or sync semantics.
 */
export const GLOW_PAGE_MANIFESTS: GlowPageManifest[] = [
  manifest('today.world', '/today', 'Today', 'today', 'world', null, 'today', 'today-living', 'open', ['day','task','event','routine']),
  manifest('plan.world', '/planning', 'Plan', 'plan', 'world', null, 'planning', 'planning-studio', 'open', ['plan','task','event','goal']),
  manifest('plan.calendar', '/calendar', 'Calendar', 'plan', 'room', '/planning', 'planning', 'temporal-observatory', 'structured', ['event','appointment']),
  manifest('plan.tasks', '/tasks', 'Tasks', 'plan', 'room', '/planning', 'planning', 'planning-studio', 'structured', ['task']),
  manifest('plan.reminders', '/reminders', 'Reminders', 'plan', 'room', '/planning', 'planning', 'planning-studio', 'structured', ['reminder']),
  manifest('plan.routines', '/routines', 'Routines', 'plan', 'room', '/planning', 'routines', 'routine-world', 'structured', ['routine']),
  manifest('plan.habits', '/habits', 'Habits', 'plan', 'room', '/planning', 'habits', 'routine-world', 'structured', ['habit']),
  manifest('plan.goals', '/goals', 'Goals', 'plan', 'room', '/planning', 'goals', 'future-landscape', 'open', ['goal','milestone']),

  manifest('life.world', '/life', 'Life', 'life', 'world', null, 'life', 'inhabited-world', 'open', ['person','place','resource']),
  manifest('life.wellness', '/wellness', 'Wellness', 'life', 'room', '/life', 'wellness', 'wellness-room', 'structured', ['wellness-entry']),
  manifest('life.fitness', '/fitness', 'Fitness', 'life', 'room', '/life', 'fitness', 'fitness-room', 'structured', ['workout','exercise']),
  manifest('life.food', '/food', 'Food', 'life', 'room', '/life', 'food', 'food-room', 'structured', ['meal','food']),
  manifest('life.closet', '/closet', 'Closet', 'life', 'room', '/life', 'closet', 'dressing-room', 'open', ['clothing-item','outfit']),
  manifest('life.finance', '/finance', 'Money', 'life', 'room', '/life', 'money', 'money-room', 'structured', ['transaction','account','bill']),
  manifest('life.money', '/money', 'Money', 'life', 'room', '/life', 'money', 'money-room', 'structured', ['transaction','account','bill']),
  manifest('life.work', '/work', 'Work', 'life', 'room', '/life', 'work', 'work-room', 'structured', ['work-shift','job']),
  manifest('life.travel', '/travel', 'Travel', 'life', 'room', '/life', 'travel', 'travel-room', 'open', ['trip','reservation','place']),
  manifest('life.relationships', '/relationships', 'Relationships', 'life', 'room', '/life', 'relationships', 'relationship-room', 'open', ['person','relationship']),

  manifest('beauty.world', '/beauty', 'Beauty', 'beauty', 'world', null, 'beauty', 'personal-atelier', 'open', ['product','routine','look']),
  manifest('beauty.today', '/beauty/today', 'Beauty Today', 'beauty', 'room', '/beauty', 'beauty', 'personal-atelier', 'structured', ['routine','product']),
  manifest('beauty.skincare', '/beauty/skincare', 'Skincare', 'beauty', 'studio', '/beauty', 'skincare', 'skincare-studio', 'open', ['routine','product']),
  manifest('beauty.gua-sha', '/beauty/gua-sha', 'Gua Sha Studio', 'beauty', 'studio', '/beauty', 'gua-sha', 'gua-sha-studio', 'open', ['routine','tool','session']),
  manifest('beauty.gua-sha.guided', '/beauty/gua-sha/guided', 'Guided Facial Movement', 'beauty', 'experience', '/beauty/gua-sha', 'gua-sha', 'gua-sha-studio', 'protected', ['routine','session']),
  manifest('beauty.gua-sha.morning', '/beauty/gua-sha/morning', 'Morning Light Gua Sha', 'beauty', 'experience', '/beauty/gua-sha', 'gua-sha', 'gua-sha-studio', 'protected', ['routine','session']),
  manifest('beauty.gua-sha.midday', '/beauty/gua-sha/midday', 'Midday Mini Reset', 'beauty', 'experience', '/beauty/gua-sha', 'gua-sha', 'gua-sha-studio', 'protected', ['routine','session']),
  manifest('beauty.gua-sha.night', '/beauty/gua-sha/night', 'Night Full Sculpt', 'beauty', 'experience', '/beauty/gua-sha', 'gua-sha', 'gua-sha-studio', 'protected', ['routine','session']),
  manifest('beauty.makeup', '/beauty/makeup', 'Makeup', 'beauty', 'studio', '/beauty', 'makeup', 'makeup-studio', 'open', ['product','look']),
  manifest('beauty.body', '/beauty/body', 'Body Care', 'beauty', 'studio', '/beauty', 'body-care', 'beauty-studio', 'open', ['product','routine']),
  manifest('beauty.fragrance', '/beauty/fragrance', 'Fragrance', 'beauty', 'studio', '/beauty', 'fragrance', 'beauty-studio', 'open', ['product']),
  manifest('beauty.maintenance', '/beauty/maintenance', 'Beauty Maintenance', 'beauty', 'studio', '/beauty', 'beauty-maintenance', 'beauty-studio', 'structured', ['routine','appointment']),
  manifest('beauty.devices', '/beauty/devices', 'Devices', 'beauty', 'room', '/beauty', 'beauty-devices', 'beauty-studio', 'structured', ['device','tool']),
  manifest('beauty.inventory', '/beauty/inventory', 'Inventory', 'beauty', 'room', '/beauty', 'beauty-inventory', 'inventory-room', 'structured', ['product','device','tool']),
  manifest('beauty.progress', '/beauty/progress', 'Progress', 'beauty', 'room', '/beauty', 'beauty-progress', 'history-room', 'structured', ['history','routine','product']),

  manifest('brain.world', '/brain', 'Brain', 'brain', 'world', null, 'brain', 'knowledge-world', 'open', ['note','memory','connection']),
  manifest('brain.search', '/search', 'Universal Search', 'brain', 'room', '/brain', 'search', 'universal-lens', 'open', ['glow-object']),
  manifest('brain.notes', '/notes', 'Notes', 'brain', 'room', '/brain', 'notes', 'knowledge-room', 'structured', ['note']),
  manifest('brain.memory', '/memory', 'Memory', 'brain', 'room', '/brain', 'memory', 'knowledge-room', 'open', ['memory']),
  manifest('brain.timeline', '/timeline', 'Timeline', 'brain', 'room', '/brain', 'timeline', 'history-room', 'open', ['history']),
  manifest('brain.connections', '/connections', 'Connections', 'brain', 'room', '/brain', 'connections', 'knowledge-room', 'open', ['relationship']),
  manifest('brain.observations', '/observations', 'Observations', 'brain', 'room', '/brain', 'observations', 'knowledge-room', 'open', ['observation']),

  manifest('create.world', '/create', 'Create', 'create', 'world', null, 'create', 'creation-world', 'open', ['creation']),
  manifest('create.import', '/import', 'Import', 'create', 'room', '/create', 'import', 'creation-room', 'structured', ['source','document']),
  manifest('create.concierge', '/concierge', 'Concierge', 'create', 'room', '/create', 'concierge', 'creation-room', 'open', ['glow-object']),
];

function manifest(
  id: string,
  match: string,
  label: string,
  world: GlowWorld,
  level: GlowPageLevel,
  parent: string | null,
  family: string,
  designFamily: string,
  layoutFamily: GlowPageManifest['layoutFamily'],
  objectTypes: string[],
): GlowPageManifest {
  return {
    id, match, label, world, level, parent, family, designFamily, layoutFamily, objectTypes,
    specialists: ['glow-kernel'],
    sync: [...REQUIRED_SYNC_DIMENSIONS],
    preservesReturnContext: true,
  };
}

function normalize(path: string) {
  return (path.split('?')[0] || '/').replace(/\/$/, '') || '/';
}

export function pageManifestFor(path: string): GlowPageManifest | null {
  const pathname = normalize(path);
  const exact = GLOW_PAGE_MANIFESTS.find((item) => item.match === pathname);
  if (exact) return exact;

  // Registered descendants inherit their nearest registered parent contract.
  return [...GLOW_PAGE_MANIFESTS]
    .filter((item) => pathname.startsWith(`${item.match}/`))
    .sort((a, b) => b.match.length - a.match.length)[0] ?? null;
}

export function pageManifestChainFor(path: string): GlowPageManifest[] {
  const current = pageManifestFor(path);
  if (!current) return [];
  const chain: GlowPageManifest[] = [current];
  let parent = current.parent ? pageManifestFor(current.parent) : null;
  const seen = new Set([current.id]);
  while (parent && !seen.has(parent.id)) {
    seen.add(parent.id);
    chain.unshift(parent);
    parent = parent.parent ? pageManifestFor(parent.parent) : null;
  }
  return chain;
}

export function pageContractViolations(path: string): string[] {
  const manifest = pageManifestFor(path);
  if (!manifest) return [`UNREGISTERED_PAGE:${normalize(path)}`];
  const missing = REQUIRED_SYNC_DIMENSIONS.filter((item) => !manifest.sync.includes(item));
  return [
    ...missing.map((item) => `MISSING_SYNC:${item}`),
    ...(manifest.preservesReturnContext ? [] : ['RETURN_CONTEXT_DISABLED']),
  ];
}
