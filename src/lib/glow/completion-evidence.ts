import type { CompletionWaveId, WaveEvidence } from './completion-waves';

export type EvidenceStatus = 'PASS' | 'BLOCKED' | 'UNVERIFIED';
export type CompletionEvidenceRecord = {
  step: number;
  wave: CompletionWaveId;
  surface: string;
  gate: string;
  status: EvidenceStatus;
  evidence: string[];
  blockers: string[];
};

/**
 * Evidence ledger for completion execution. A PASS must be backed by repository,
 * build, runtime, or explicit QA evidence. Unknown evidence stays UNVERIFIED.
 */
export const COMPLETION_10_15_EVIDENCE: CompletionEvidenceRecord[] = [
  {
    step: 10,
    wave: 1,
    surface: 'global-core',
    gate: 'build',
    status: 'PASS',
    evidence: ['Vercel READY: bd17470c55f9684780d4b26256a715e808e38b3a'],
    blockers: [],
  },
  {
    step: 11,
    wave: 1,
    surface: 'global-core',
    gate: 'runtime',
    status: 'UNVERIFIED',
    evidence: ['Protected preview returns Vercel SSO redirect; authenticated browser runtime not yet proven.'],
    blockers: ['authenticated-runtime-qa'],
  },
  {
    step: 12,
    wave: 1,
    surface: 'global-core',
    gate: 'navigation',
    status: 'PASS',
    evidence: ['Root GlowCurrent owns world fold, reverse-current history and navigation.', 'GlobalCoreBridge forwards compatibility events to canonical runtime.'],
    blockers: [],
  },
  {
    step: 13,
    wave: 1,
    surface: 'global-core',
    gate: 'canonical-data',
    status: 'PASS',
    evidence: ['GlobalCoreBridge resolves page manifest + room experience and publishes canonical location context.'],
    blockers: [],
  },
  {
    step: 14,
    wave: 1,
    surface: 'global-core',
    gate: 'history',
    status: 'PASS',
    evidence: ['GlowCurrent persists thread and per-world state anchors in session storage.'],
    blockers: [],
  },
  {
    step: 15,
    wave: 2,
    surface: 'today-planning-routines',
    gate: 'data',
    status: 'PASS',
    evidence: ['Today requires authenticated canonical experience family.', 'Planning reads authenticated calendar-event data.', 'Routines requires authenticated routine world.'],
    blockers: [],
  },
];

export function completionEvidenceAsWaveEvidence(records = COMPLETION_10_15_EVIDENCE): WaveEvidence[] {
  return records.map((record) => ({
    wave: record.wave,
    gate: record.gate,
    passed: record.status === 'PASS',
    blockers: record.status === 'PASS' ? [] : record.blockers,
  }));
}

export const STEP_15_WAVE_2_ENTRY = {
  family: 'Today + Planning + Routines',
  routes: ['/today', '/planning', '/routines'],
  law: 'Repair shared Today/Planning/Routines blockers at the highest correct ancestor; do not fork page-local infrastructure.',
} as const;
