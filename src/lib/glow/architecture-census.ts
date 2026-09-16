import { PAGE_ARCHITECTURE_MANIFESTS, type PageArchitectureId } from '@/lib/glow/architecture-constitution';

export type ArchitectureCensusSeverity = 'blocker' | 'high' | 'medium' | 'low';
export type ArchitectureCensusState = 'CONFORMING' | 'PARTIAL' | 'MIGRATION_REQUIRED' | 'ROUTE_REQUIRED';

export type ArchitectureCensusRow = {
  manifestId: string;
  route: string;
  architecture: PageArchitectureId;
  state: ArchitectureCensusState;
  severity: ArchitectureCensusSeverity;
  canonicalSystem: string;
  findings: string[];
};

/**
 * This census is intentionally evidence-oriented. It records known migration
 * obligations instead of turning a declared architecture into a false QA pass.
 * Physical route and runtime checks are enforced separately by tests/builds.
 */
export const ARCHITECTURE_CENSUS: ArchitectureCensusRow[] = [
  row('food-overview','PARTIAL','high',[
    'Food already combines meals, recipes, groceries and pantry, but currently contains seeded presentation data that must migrate to canonical Food/Pantry/Grocery objects.',
    'Nutrition, supplements, journal and provenance views still require canonical wiring.',
  ]),
  row('thoughts','ROUTE_REQUIRED','high',[
    'Ambient Capture Field requires a canonical Thought Object and reversible conversion path into Notes, Tasks, Projects and Brain Graph before the route can be considered migrated.',
  ]),
  row('money','PARTIAL','blocker',[
    'Money must prove reconciliation, pending-versus-posted status, sync freshness and provenance for every displayed numerical total.',
    'The /finance and /money surfaces must remain projections of one financial source of truth.',
  ]),
  row('work','PARTIAL','high',[
    'Work route exists but needs Progression Command Center conformance and canonical Application Object workspaces.',
  ]),
  row('grocery','ROUTE_REQUIRED','high',[
    'Grocery currently appears inside Food; a dedicated operational projection must share the same Grocery/Pantry/Purchase identities instead of copying the seeded list.',
  ]),
  row('makeup-studio','PARTIAL','high',[
    'Makeup route exists; precision mapping must read canonical Beauty Inventory and safety/expiry/compatibility state rather than a Studio-private product list.',
  ]),
  row('beauty-command-center','ROUTE_REQUIRED','high',[
    'Cross-domain preparation needs a physical projection over existing event, routine, studio, closet and travel objects with leave-ready deadline logic.',
  ]),
  row('wellness-restoration','ROUTE_REQUIRED','blocker',[
    'Restoration may not ship with a separate energy score; it must read the shared Body/Wellness state and include escalation behavior for concerning symptoms.',
  ]),
  row('movement-studio','PARTIAL','high',[
    'Fitness route exists; program overview and live Guided Workout must remain distinct while sharing the same program/session objects.',
  ]),
  row('body-awareness','ROUTE_REQUIRED','blocker',[
    'Body Awareness requires one provenance-aware shared state source used by Today, Fitness, Restoration, routines, Morning Brief and Tonight.',
  ]),

  row('today-day-view','PARTIAL','high',['Today family already shares the living-day model; Day View still requires architecture-specific runtime/visual conformance evidence.']),
  row('replan-my-day','PARTIAL','blocker',['Replan exists as a Today projection; committed schedule writes must remain proposal-only until explicit approval is verified end to end.']),
  row('morning-brief','PARTIAL','medium',['Morning Brief exists and must continue reading the same active-day/current-state model.']),
  row('what-now','PARTIAL','blocker',['Current prioritization exists; full recommendation output still needs visible downside, alternatives, confidence and source provenance.']),
  row('next-up','PARTIAL','high',['Next Up exists as a projection; preparation shadows and transition requirements must be verified against canonical events.']),
  row('later','PARTIAL','medium',['Later exists; phase timing, recovery adaptation and capacity behavior require matrix evidence.']),
  row('tonight','PARTIAL','medium',['Tonight exists; recovery/cancel-everything reduction and tomorrow preparation require runtime evidence.']),
  row('tomorrow-preview','PARTIAL','medium',['Tomorrow Preview exists; it must use next-day real commitments rather than a parallel preparation record.']),
  row('event-workspace','PARTIAL','high',['Meeting/Event projection exists; lifecycle-specific before/during/after behavior must be verified.']),
  row('focus-session','PARTIAL','high',['Focus exists; result, actual-versus-planned duration and interruption recovery must return to Today state.']),
];

function row(manifestId: string, state: ArchitectureCensusState, severity: ArchitectureCensusSeverity, findings: string[]): ArchitectureCensusRow {
  const manifest = PAGE_ARCHITECTURE_MANIFESTS.find((item) => item.id === manifestId);
  if (!manifest) throw new Error(`Architecture census references missing manifest: ${manifestId}`);
  return {
    manifestId,
    route: manifest.query
      ? `${manifest.path}?${new URLSearchParams(manifest.query).toString()}`
      : manifest.path,
    architecture: manifest.architecture,
    state,
    severity,
    canonicalSystem: manifest.canonicalSystem ?? manifest.primaryObjectType,
    findings,
  };
}

const severityRank: Record<ArchitectureCensusSeverity, number> = { blocker: 4, high: 3, medium: 2, low: 1 };

export function architectureMigrationQueue(rows: ArchitectureCensusRow[] = ARCHITECTURE_CENSUS) {
  return rows
    .filter((item) => item.state !== 'CONFORMING')
    .slice()
    .sort((a,b) => severityRank[b.severity] - severityRank[a.severity] || a.manifestId.localeCompare(b.manifestId));
}

export function architectureCensusSummary(rows: ArchitectureCensusRow[] = ARCHITECTURE_CENSUS) {
  return {
    total: rows.length,
    conforming: rows.filter((item) => item.state === 'CONFORMING').length,
    partial: rows.filter((item) => item.state === 'PARTIAL').length,
    migrationRequired: rows.filter((item) => item.state === 'MIGRATION_REQUIRED').length,
    routesRequired: rows.filter((item) => item.state === 'ROUTE_REQUIRED').length,
    blockers: rows.filter((item) => item.severity === 'blocker' && item.state !== 'CONFORMING').map((item) => item.manifestId),
  } as const;
}
