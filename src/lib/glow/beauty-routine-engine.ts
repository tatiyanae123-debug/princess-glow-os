export const BEAUTY_ROUTINE_MODES = ['full','normal','quick','bare-minimum','recovery'] as const;
export type BeautyRoutineMode = typeof BEAUTY_ROUTINE_MODES[number];

export type RoutineCondition = {
  kind: 'energy'|'time'|'skin-state'|'hair-state'|'event'|'provider-rule'|'product-availability';
  operator: 'is'|'is-not'|'includes'|'available';
  value: string;
};

export type BeautyRoutineStep = {
  id: string;
  label: string;
  productObjectId?: string;
  toolObjectId?: string;
  physicalLocation?: string;
  optional?: boolean;
  conditions?: RoutineCondition[];
  sourceAuthority?: 'user'|'clinician'|'manufacturer'|'glow';
};

export type BeautyRoutineDefinition = {
  id: string;
  title: string;
  domain: 'skincare'|'hair'|'makeup'|'body'|'nails'|'brows-lashes'|'oral-beauty'|'gua-sha'|'beauty-maintenance';
  cadence: string;
  supportedModes: BeautyRoutineMode[];
  steps: BeautyRoutineStep[];
};

export type BeautyRoutineSession = {
  id: string;
  routineId: string;
  mode: BeautyRoutineMode;
  startedAt?: string;
  completedAt?: string;
  status: 'ready'|'active'|'paused'|'completed'|'skipped';
  completedStepIds: string[];
  skippedStepIds: string[];
};

export function resolveRoutineSteps(routine: BeautyRoutineDefinition, mode: BeautyRoutineMode) {
  if (!routine.supportedModes.includes(mode)) return routine.steps;
  if (mode === 'bare-minimum') return routine.steps.filter(step => !step.optional).slice(0, 3);
  if (mode === 'quick') return routine.steps.filter(step => !step.optional).slice(0, 5);
  if (mode === 'recovery') return routine.steps.filter(step => step.sourceAuthority !== 'glow' || !step.optional);
  return routine.steps;
}

// Authority law: clinician and manufacturer instructions override Glow-generated routine optimization.
export const BEAUTY_ROUTINE_AUTHORITY = ['clinician','manufacturer','user','glow'] as const;
