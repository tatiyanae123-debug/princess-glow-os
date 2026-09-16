import { WAVE_A_GATES, WAVE_A_SHARED_ANCESTORS, WAVE_A_TODAY_PLANNING_ROUTINES } from './wave-a-today-planning-routines';

export const WAVE_2_FAMILY = 'today-planning-routines' as const;
export type Wave2EnergyMode = 'low' | 'normal' | 'high' | 'recovery';

export const WAVE_2_CANONICAL_ROUTES = {
  today: '/today',
  planning: '/planning',
  routines: '/routines',
} as const;

export const WAVE_2_TIME_WINDOWS = {
  morning: { start: '05:00', end: '10:00' },
  between: { start: '10:00', end: '16:00' },
  evening: { start: '16:00', end: '20:30' },
  night: { start: '20:30', end: '23:00' },
} as const;

export const WAVE_2_ENERGY_CAPACITY = {
  low: { priorityLimit: 1, protectOpenSpace: true },
  normal: { priorityLimit: 3, protectOpenSpace: true },
  high: { priorityLimit: 6, protectOpenSpace: true },
  recovery: { priorityLimit: 1, protectOpenSpace: true, recoveryFirst: true },
} as const;

export const WAVE_2_SHARED_RUNTIME = {
  canonicalObjects: ['task', 'event', 'routine', 'routine-session', 'habit', 'goal', 'project'],
  capabilities: ['what-now','energy-mode','capacity','timeline','calendar','time-blocking','recurrence','guided-session','completion-history','recommendation'],
  ancestors: WAVE_A_SHARED_ANCESTORS,
  gates: WAVE_A_GATES,
  timeWindows: WAVE_2_TIME_WINDOWS,
  energyCapacity: WAVE_2_ENERGY_CAPACITY,
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
    timeWindows: WAVE_2_TIME_WINDOWS,
    energyCapacity: WAVE_2_ENERGY_CAPACITY,
    preserveExistingRoutes: true,
    retireOnlyAfterQa: true,
  } as const;
}

export type Wave2QaEvidence = {
  surface: Wave2Surface;
  route: boolean;
  data: boolean;
  sharedContext: boolean;
  energyCapacity: boolean;
  history: boolean;
  responsive: boolean;
  accessibility: boolean;
  visual: boolean;
  golden: boolean;
  blockers?: string[];
};

export function evaluateWave2Qa(evidence: Wave2QaEvidence[]) {
  const required = (item: Wave2QaEvidence) => item.route && item.data && item.sharedContext && item.energyCapacity && item.history && item.responsive && item.accessibility && item.visual && item.golden;
  const failed = evidence.filter((item) => !required(item));
  return {
    passed: evidence.length === 3 && failed.length === 0,
    failedSurfaces: failed.map((item) => item.surface),
    blockers: [...new Set(failed.flatMap((item) => item.blockers ?? []))],
    canLock: evidence.length === 3 && failed.length === 0,
  };
}

export const WAVE_2_STEPS_16_25 = [
  { step: 16, action: 'bind-family-runtime', owner: 'shared-context' },
  { step: 17, action: 'bind-canonical-objects', owner: 'canonical-object-layer' },
  { step: 18, action: 'bind-time-energy-capacity', owner: 'planner-engine' },
  { step: 19, action: 'preserve-history-and-routes', owner: 'history-layer' },
  { step: 20, action: 'qa-affected-family', owner: 'wave-2' },
  { step: 21, action: 'verify-cumulative-build', owner: 'wave-2' },
  { step: 22, action: 'repair-shared-planning-state', owner: 'planner-engine' },
  { step: 23, action: 'enforce-energy-capacity-laws', owner: 'planner-engine' },
  { step: 24, action: 'run-family-gate-matrix', owner: 'wave-2' },
  { step: 25, action: 'lock-only-on-complete-evidence', owner: 'wave-2' },
] as const;
