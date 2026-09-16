import { WAVE_A_GATES, WAVE_A_SHARED_ANCESTORS, WAVE_A_TODAY_PLANNING_ROUTINES } from './wave-a-today-planning-routines';

export const WAVE_2_FAMILY = 'today-planning-routines' as const;

export const WAVE_2_CANONICAL_ROUTES = {
  today: '/today',
  planning: '/planning',
  routines: '/routines',
} as const;

export const WAVE_2_SHARED_RUNTIME = {
  canonicalObjects: ['task', 'event', 'routine', 'routine-session', 'habit', 'goal', 'project'],
  capabilities: [
    'what-now',
    'energy-mode',
    'capacity',
    'timeline',
    'calendar',
    'time-blocking',
    'recurrence',
    'guided-session',
    'completion-history',
    'recommendation',
  ],
  ancestors: WAVE_A_SHARED_ANCESTORS,
  gates: WAVE_A_GATES,
} as const;

export type Wave2Surface = keyof typeof WAVE_2_CANONICAL_ROUTES;

export function wave2SurfaceForPath(pathname: string): Wave2Surface | null {
  if (pathname === '/today' || pathname.startsWith('/today/')) return 'today';
  if (pathname === '/planning' || pathname.startsWith('/planning/')) return 'planning';
  if (pathname === '/routines' || pathname.startsWith('/routines/')) return 'routines';
  return null;
}

export function wave2RuntimeContext(pathname: string) {
  const surface = wave2SurfaceForPath(pathname);
  if (!surface) return null;
  const family = WAVE_A_TODAY_PLANNING_ROUTINES.find((entry) => entry.family === surface);
  return {
    family: WAVE_2_FAMILY,
    surface,
    route: WAVE_2_CANONICAL_ROUTES[surface],
    canonicalObjects: family?.canonicalObjects ?? [],
    sharedCapabilities: family?.sharedCapabilities ?? [],
    preserveExistingRoutes: true,
    retireOnlyAfterQa: true,
  } as const;
}

export const WAVE_2_STEPS_16_20 = [
  { step: 16, action: 'bind-family-runtime', owner: 'shared-context' },
  { step: 17, action: 'bind-canonical-objects', owner: 'canonical-object-layer' },
  { step: 18, action: 'bind-time-energy-capacity', owner: 'planner-engine' },
  { step: 19, action: 'preserve-history-and-routes', owner: 'history-layer' },
  { step: 20, action: 'qa-affected-family', owner: 'wave-2' },
] as const;
