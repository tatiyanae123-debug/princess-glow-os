import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ARCHITECTURE_CONSTITUTION_STATUS,
  ARCHITECTURE_FOUR_LAYER_LAW,
  ARCHITECTURE_MERGE_LAWS,
  ARCHITECTURE_REGISTRY,
  LIFE_CAPTURE_CARE_LOCK_CRITERIA,
  PAGE_ARCHITECTURE_MANIFESTS,
  PERMANENT_TOP_LEVEL_WORLDS,
  TODAY_EXECUTION_LOCK_CRITERIA,
  architectureContractViolations,
  architectureManifestFor,
  type PageArchitectureId,
} from '@/lib/glow/architecture-constitution';
import { ARCHITECTURE_CENSUS, architectureCensusSummary } from '@/lib/glow/architecture-census';

const root = process.cwd();
const source = (path: string) => readFileSync(resolve(root, path), 'utf8');

const BASE_ARCHITECTURES: PageArchitectureId[] = [
  'contextual-brief','transitional-brief','operational-calendar','scenario-studio','object-workspace','guided-experience',
  'adaptive-program','spatial-operations','relationship-care','knowledge-graph','system-constellation','living-system-map',
  'cultivation-dashboard','embodied-state','personal-domain-studio','resource-command-center',
];
const LIFE_ADDITIONS: PageArchitectureId[] = [
  'integrated-domain-hub','ambient-capture-field','progression-command-center','shopping-operations-workspace',
  'cross-domain-protocol-orchestrator','precision-guided-studio','restorative-care-workspace',
];
const TODAY_ADDITIONS: PageArchitectureId[] = [
  'living-day-orchestrator','adaptive-replanning-studio','day-phase-workspace','immediate-horizon','event-workspace',
  'protected-execution','contextual-decision-resolver',
];
const TODAY_MANIFESTS = [
  'today-day-view','replan-my-day','morning-brief','what-now','next-up','later','tonight','tomorrow-preview','event-workspace','focus-session',
];
const LIFE_MANIFESTS = [
  'food-overview','thoughts','money','work','grocery','makeup-studio','beauty-command-center','wellness-restoration','movement-studio','body-awareness',
];

describe('Glow OS Page Architecture Constitution v1', () => {
  it('locks the four construction layers and permanent top-level World model without promoting Work or Beauty', () => {
    expect([...ARCHITECTURE_FOUR_LAYER_LAW]).toEqual([
      'global-glow-shell','world-environment','approved-page-architecture','canonical-glow-object-projection',
    ]);
    expect(PERMANENT_TOP_LEVEL_WORLDS).toEqual(['today','plan','life','brain','create']);
    expect(PERMANENT_TOP_LEVEL_WORLDS).not.toContain('beauty');
    expect(PERMANENT_TOP_LEVEL_WORLDS).not.toContain('work');
  });

  it('registers every base, Life/Capture/Care and Today architecture with full operational contracts', () => {
    const required = [...BASE_ARCHITECTURES, ...LIFE_ADDITIONS, ...TODAY_ADDITIONS];
    expect(Object.keys(ARCHITECTURE_REGISTRY).sort()).toEqual([...required].sort());
    for (const id of required) {
      const definition = ARCHITECTURE_REGISTRY[id];
      expect(definition.id).toBe(id);
      expect(definition.purpose.length).toBeGreaterThan(20);
      expect(definition.permittedWorlds.length).toBeGreaterThan(0);
      expect(definition.requiredRegions.length).toBeGreaterThan(0);
      expect(definition.mobileTransformation.length).toBeGreaterThan(20);
      expect(definition.accessibilityRequirements.length).toBeGreaterThanOrEqual(5);
      expect(definition.states.empty).toBeTruthy();
      expect(definition.states.loading).toBeTruthy();
      expect(definition.states.error).toBeTruthy();
      expect(definition.states.offline).toBeTruthy();
    }
  });

  it('keeps specializations attached to the correct parent architectures', () => {
    expect(ARCHITECTURE_REGISTRY['precision-guided-studio'].parentArchitectures).toEqual(['guided-experience','personal-domain-studio']);
    expect(ARCHITECTURE_REGISTRY['restorative-care-workspace'].parentArchitectures).toEqual(['embodied-state']);
    expect(ARCHITECTURE_REGISTRY['adaptive-replanning-studio'].parentArchitectures).toEqual(['scenario-studio']);
    expect(ARCHITECTURE_REGISTRY['event-workspace'].parentArchitectures).toEqual(['object-workspace']);
  });

  it('declares the full Life/Capture/Care and Today manifest families exactly once', () => {
    for (const id of [...LIFE_MANIFESTS, ...TODAY_MANIFESTS]) {
      expect(PAGE_ARCHITECTURE_MANIFESTS.filter((item) => item.id === id)).toHaveLength(1);
    }
    expect(TODAY_MANIFESTS).toHaveLength(10);
    expect(LIFE_MANIFESTS).toHaveLength(10);
  });

  it('resolves every Today projection to a distinct architecture while preserving one canonical active-day system', () => {
    const cases: Array<[string,string,string]> = [
      ['/today?room=day-view','today-day-view','living-day-orchestrator'],
      ['/today?room=replan','replan-my-day','adaptive-replanning-studio'],
      ['/today?room=morning','morning-brief','contextual-brief'],
      ['/today?room=what-now','what-now','contextual-decision-resolver'],
      ['/today?room=next-up','next-up','immediate-horizon'],
      ['/today?room=later','later','day-phase-workspace'],
      ['/today?room=tonight','tonight','day-phase-workspace'],
      ['/today?room=tomorrow','tomorrow-preview','transitional-brief'],
      ['/today?room=meeting','event-workspace','event-workspace'],
      ['/today?room=focus','focus-session','protected-execution'],
    ];
    for (const [path,id,architecture] of cases) {
      const manifest = architectureManifestFor(path);
      expect(manifest?.id).toBe(id);
      expect(manifest?.architecture).toBe(architecture);
      expect(manifest?.canonicalSystem).toBe(id === 'event-workspace' ? 'events' : 'active-day');
      expect(architectureContractViolations(path)).toEqual([]);
    }
    expect(architectureManifestFor('/today')?.id).toBe('what-now');
  });

  it('keeps repeated Money, Movement and Body references as canonical systems instead of new architectures', () => {
    expect(architectureManifestFor('/finance')?.architecture).toBe('resource-command-center');
    expect(architectureManifestFor('/money')?.id).toBe('money');
    expect(architectureManifestFor('/fitness')?.architecture).toBe('adaptive-program');
    expect(architectureManifestFor('/wellness/body')?.architecture).toBe('embodied-state');
    expect(ARCHITECTURE_MERGE_LAWS).toContain('money-fitness-and-body-repeated-designs-do-not-create-duplicate-pages');
  });

  it('makes autonomy, provenance and safety part of architecture rather than decorative copy', () => {
    expect(ARCHITECTURE_REGISTRY['contextual-decision-resolver'].trustRules).toContain('Glow recommends; the user decides.');
    expect(ARCHITECTURE_REGISTRY['resource-command-center'].prohibitedUses).toContain('decorative totals');
    expect(ARCHITECTURE_REGISTRY['ambient-capture-field'].trustRules?.join(' ')).toContain('Private mode');
    expect(ARCHITECTURE_REGISTRY['restorative-care-workspace'].prohibitedUses.join(' ')).toContain('urgent symptoms');
    expect(ARCHITECTURE_REGISTRY['adaptive-replanning-studio'].prohibitedUses).toContain('silent schedule mutation');
  });

  it('ships reusable frames and intentional phone/tablet transformations inside the global shell', () => {
    const frames = source('src/components/glow/architecture-frames.tsx');
    const css = source('src/app/architecture-frames.css');
    const layout = source('src/app/layout.tsx');
    const expectedFrames = [
      'IntegratedDomainHubFrame','AmbientCaptureFieldFrame','ProgressionCommandCenterFrame','ShoppingOperationsFrame','CrossDomainProtocolFrame',
      'PrecisionGuidedStudioFrame','RestorativeCareFrame','LivingDayFrame','ReplanStudioFrame','DayPhaseFrame','ImmediateHorizonFrame',
      'EventWorkspaceFrame','ProtectedExecutionFrame','DecisionResolverFrame','ContextualBriefFrame','TransitionalBriefFrame',
    ];
    for (const name of expectedFrames) expect(frames).toContain(`export const ${name}`);
    expect(css).toContain('@media (max-width: 1180px)');
    expect(css).toContain('@media (max-width: 700px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain("grid-template-areas:\n      'primary'\n      'supporting'\n      'inspector'");
    expect(layout).toContain("import './architecture-frames.css';");
    expect(layout).toContain('<ArchitectureContextBridge />');
  });

  it('keeps an explicit evidence census instead of claiming the new family locks prematurely', () => {
    expect(ARCHITECTURE_CENSUS).toHaveLength(20);
    const summary = architectureCensusSummary();
    expect(summary.total).toBe(20);
    expect(summary.conforming).toBe(0);
    expect(summary.blockers.length).toBeGreaterThan(0);
    expect(ARCHITECTURE_CONSTITUTION_STATUS.status).toBe('ADOPTED_CONFORMANCE_IN_PROGRESS');
    expect(ARCHITECTURE_CONSTITUTION_STATUS.lifeCaptureCareStatus).toBe('CONFORMANCE_REQUIRED');
    expect(ARCHITECTURE_CONSTITUTION_STATUS.todayExecutionStatus).toBe('CONFORMANCE_REQUIRED');
    expect(LIFE_CAPTURE_CARE_LOCK_CRITERIA.length).toBeGreaterThanOrEqual(10);
    expect(TODAY_EXECUTION_LOCK_CRITERIA.length).toBeGreaterThanOrEqual(12);
  });

  it('keeps manifests for already-physical target routes tied to real route files', () => {
    const physical = [
      ['food-overview','src/app/food/page.tsx'],
      ['money','src/app/finance/page.tsx'],
      ['work','src/app/work/page.tsx'],
      ['makeup-studio','src/app/beauty/makeup/page.tsx'],
      ['movement-studio','src/app/fitness/page.tsx'],
      ['what-now','src/app/today/page.tsx'],
    ] as const;
    for (const [id,path] of physical) {
      expect(PAGE_ARCHITECTURE_MANIFESTS.some((item) => item.id === id)).toBe(true);
      expect(existsSync(resolve(root,path)), `${path} must exist`).toBe(true);
    }
  });
});
