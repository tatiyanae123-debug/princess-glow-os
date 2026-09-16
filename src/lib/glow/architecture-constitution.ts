export type ConstitutionWorld = 'today' | 'plan' | 'life' | 'brain' | 'create';

export type BaseArchitectureId =
  | 'contextual-brief'
  | 'transitional-brief'
  | 'operational-calendar'
  | 'scenario-studio'
  | 'object-workspace'
  | 'guided-experience'
  | 'adaptive-program'
  | 'spatial-operations'
  | 'relationship-care'
  | 'knowledge-graph'
  | 'system-constellation'
  | 'living-system-map'
  | 'cultivation-dashboard'
  | 'embodied-state'
  | 'personal-domain-studio'
  | 'resource-command-center';

export type LifeArchitectureId =
  | 'integrated-domain-hub'
  | 'ambient-capture-field'
  | 'progression-command-center'
  | 'shopping-operations-workspace'
  | 'cross-domain-protocol-orchestrator';

export type ArchitectureSpecializationId =
  | 'precision-guided-studio'
  | 'restorative-care-workspace';

export type TodayArchitectureId =
  | 'living-day-orchestrator'
  | 'adaptive-replanning-studio'
  | 'day-phase-workspace'
  | 'immediate-horizon'
  | 'event-workspace'
  | 'protected-execution'
  | 'contextual-decision-resolver';

export type PageArchitectureId =
  | BaseArchitectureId
  | LifeArchitectureId
  | ArchitectureSpecializationId
  | TodayArchitectureId;

export type ArchitectureStateContract = {
  empty: string;
  loading: string;
  error: string;
  offline: string;
};

export type ArchitectureDefinition = {
  id: PageArchitectureId;
  name: string;
  purpose: string;
  permittedWorlds: ConstitutionWorld[];
  organizingDimension: string;
  requiredRegions: string[];
  optionalRegions: string[];
  centerStageRule: string;
  inspectorBehavior: string;
  supportedModes: string[];
  supportedObjectTypes: string[];
  mobileTransformation: string;
  accessibilityRequirements: string[];
  states: ArchitectureStateContract;
  prohibitedUses: string[];
  parentArchitectures?: PageArchitectureId[];
  trustRules?: string[];
};

const state = (noun: string): ArchitectureStateContract => ({
  empty: `Explain that no ${noun} is available and offer the smallest valid next action.`,
  loading: `Preserve the frame while ${noun} loads and expose progress accessibly.`,
  error: `Keep orientation, explain what failed, and provide retry or safe return.`,
  offline: `Preserve readable cached context, mark freshness, and queue only reversible local actions.`,
});

const a11y = [
  'Keyboard parity for every actionable control',
  'Visible focus and semantic landmarks',
  'Reduced-motion behavior without loss of meaning',
  'Touch targets remain operable on compact devices',
  'State and recommendation meaning is not color-only',
];

const modes = ['low', 'normal', 'high', 'recovery'];

function architecture(input: Omit<ArchitectureDefinition, 'accessibilityRequirements' | 'states' | 'supportedModes'> & {
  stateNoun?: string;
  supportedModes?: string[];
  accessibilityRequirements?: string[];
}): ArchitectureDefinition {
  return {
    ...input,
    supportedModes: input.supportedModes ?? modes,
    accessibilityRequirements: [...a11y, ...(input.accessibilityRequirements ?? [])],
    states: state(input.stateNoun ?? 'information'),
  };
}

export const ARCHITECTURE_REGISTRY: Record<PageArchitectureId, ArchitectureDefinition> = {
  'contextual-brief': architecture({ id:'contextual-brief', name:'Contextual Brief', purpose:'Orient the user to what matters now and help them enter the next part of the day.', permittedWorlds:['today','life','plan'], organizingDimension:'present context', requiredRegions:['orientation','current-state','next-commitment','primary-action'], optionalRegions:['weather','care','food','clothing','priorities'], centerStageRule:'Current conditions and the next useful action receive the strongest emphasis.', inspectorBehavior:'Only supporting context that changes the immediate decision.', supportedObjectTypes:['day','event','task','routine','wellness-state'], mobileTransformation:'Collapse to one calm vertical brief with one primary action.', prohibitedUses:['dense historical management','long-range scenario comparison'], stateNoun:'current context' }),
  'transitional-brief': architecture({ id:'transitional-brief', name:'Transitional Brief', purpose:'Prepare the user to move cleanly from one state or time period into another.', permittedWorlds:['today','plan','life'], organizingDimension:'future-to-present preparation', requiredRegions:['destination-state','requirements','preparation','readiness'], optionalRegions:['travel','weather','files','people'], centerStageRule:'Preparation that reduces friction in the next state belongs in the center.', inspectorBehavior:'Show only dependencies and readiness evidence.', supportedObjectTypes:['event','task','routine','trip','document'], mobileTransformation:'Prioritize requirements and readiness as a short sequence.', prohibitedUses:['full calendar replacement','generic dashboard'], stateNoun:'preparation context' }),
  'operational-calendar': architecture({ id:'operational-calendar', name:'Operational Calendar', purpose:'Represent committed time, conflicts, buffers and actual remaining capacity precisely.', permittedWorlds:['plan'], organizingDimension:'committed time', requiredRegions:['time-grid','commitments','capacity','conflicts'], optionalRegions:['travel','buffers','preparation-shadows'], centerStageRule:'The precise chronological record is authoritative.', inspectorBehavior:'Inspect one commitment without obscuring the time grid.', supportedObjectTypes:['event','appointment','time-block','task'], mobileTransformation:'Default to day or agenda composition instead of shrinking a desktop grid.', prohibitedUses:['hypothetical schedules without draft state','silent event movement'], trustRules:['Committed events may not be moved without explicit approval.'], stateNoun:'calendar commitments' }),
  'scenario-studio': architecture({ id:'scenario-studio', name:'Scenario Studio', purpose:'Explore possible futures without changing committed state.', permittedWorlds:['plan','life'], organizingDimension:'possibility', requiredRegions:['scenario-canvas','constraints','comparison','approval'], optionalRegions:['alternatives','simulation','impact'], centerStageRule:'Draft or proposed state must remain visually and behaviorally distinct from committed reality.', inspectorBehavior:'Explain constraints, impacts and what would change if approved.', supportedObjectTypes:['scenario','plan','event','task','budget','routine'], mobileTransformation:'Use focused scenario cards with explicit compare and approve actions.', prohibitedUses:['silent commit','mixing draft and committed data'], trustRules:['Proposals remain reversible until explicit approval.'], stateNoun:'scenario information' }),
  'object-workspace': architecture({ id:'object-workspace', name:'Object Workspace', purpose:'Manage one substantial canonical Glow Object and its connected context.', permittedWorlds:['plan','life','brain','create','today'], organizingDimension:'object identity', requiredRegions:['identity','status','next-action','history'], optionalRegions:['files','people','dates','dependencies','blockers','decisions','automation'], centerStageRule:'One canonical object owns the workspace.', inspectorBehavior:'Inspect related objects without creating copies.', supportedObjectTypes:['project','trip','event','application','purchase','course','creative-project'], mobileTransformation:'Show identity and next action first, then expandable related sections.', prohibitedUses:['multi-domain overview','duplicated object records'], stateNoun:'object data' }),
  'guided-experience': architecture({ id:'guided-experience', name:'Guided Experience', purpose:'Guide a real-time procedure while reducing unnecessary decisions.', permittedWorlds:['life','today','create'], organizingDimension:'active sequence', requiredRegions:['active-step','progress','controls','guidance'], optionalRegions:['tools','products','zone','substitutions','safety'], centerStageRule:'The current step is dominant.', inspectorBehavior:'Contextual tools and safety stay secondary to the active step.', supportedObjectTypes:['routine','session','workout','recipe','procedure'], mobileTransformation:'Make the active step nearly full-screen with persistent playback controls.', prohibitedUses:['program overview','large management dashboard'], stateNoun:'guided session' }),
  'adaptive-program': architecture({ id:'adaptive-program', name:'Adaptive Program Workspace', purpose:'Manage a multi-session program over time and launch individual guided sessions.', permittedWorlds:['life','plan'], organizingDimension:'program sequence', requiredRegions:['program','phase','current-session','progress'], optionalRegions:['week','adaptation','history'], centerStageRule:'Program progression and the next appropriate session are central.', inspectorBehavior:'Explain adaptation reasons without replacing the program record.', supportedObjectTypes:['program','workout','course','routine','treatment-plan'], mobileTransformation:'Show current phase and next session before program detail.', prohibitedUses:['live workout playback inside the dense overview'], stateNoun:'program state' }),
  'spatial-operations': architecture({ id:'spatial-operations', name:'Spatial Operations Map', purpose:'Manage information attached to physical places and zones.', permittedWorlds:['life'], organizingDimension:'location', requiredRegions:['map-or-floorplan','selected-zone','condition','next-action'], optionalRegions:['inventory','tasks','maintenance','projects'], centerStageRule:'The physical place or zone map remains the center.', inspectorBehavior:'Selected-zone detail opens beside the map or as a mobile sheet.', supportedObjectTypes:['place','room','storage-location','home-item','task'], mobileTransformation:'Support pan and zoom with a bottom-sheet zone inspector.', prohibitedUses:['generic list-only home dashboard'], stateNoun:'place data' }),
  'relationship-care': architecture({ id:'relationship-care', name:'Relationship Care System', purpose:'Recover person-centered context and support caring follow-through without gamifying relationships.', permittedWorlds:['life'], organizingDimension:'person and connection', requiredRegions:['people-or-connection','context','commitments','care-action'], optionalRegions:['memories','dates','preferences','boundaries','plans'], centerStageRule:'The person and relationship context, not a score, is central.', inspectorBehavior:'Reveal private relational context only with appropriate permission.', supportedObjectTypes:['person','relationship','event','memory','promise'], mobileTransformation:'Open person context first with care actions below.', prohibitedUses:['affection scores','competitive relationship rankings'], stateNoun:'relationship context' }),
  'knowledge-graph': architecture({ id:'knowledge-graph', name:'Knowledge Graph', purpose:'Explore meaningful connections among established notes, ideas, memories, projects and sources.', permittedWorlds:['brain'], organizingDimension:'meaningful connection', requiredRegions:['graph-or-neighborhood','selection','relationship-evidence'], optionalRegions:['list','timeline','thread','fragments'], centerStageRule:'The selected knowledge neighborhood is central.', inspectorBehavior:'Explain connection type and provenance.', supportedObjectTypes:['note','idea','memory','document','project','source'], mobileTransformation:'Open in focused-node mode, then reveal neighborhood and inspector.', prohibitedUses:['unreviewed AI relationship as confirmed fact'], stateNoun:'knowledge relationships' }),
  'system-constellation': architecture({ id:'system-constellation', name:'System Constellation', purpose:'Explain a modeled personal system in which several factors influence an outcome.', permittedWorlds:['brain','life'], organizingDimension:'influence and causality', requiredRegions:['modeled-system','factors','evidence','intervention'], optionalRegions:['history','confidence'], centerStageRule:'The modeled system and evidence-backed factor relationships are central.', inspectorBehavior:'Distinguish observed, entered, measured and inferred evidence.', supportedObjectTypes:['observation','signal','pattern','intervention'], mobileTransformation:'Focus one factor at a time with an evidence drawer.', prohibitedUses:['medical certainty','unsupported causal claims'], stateNoun:'system evidence' }),
  'living-system-map': architecture({ id:'living-system-map', name:'Living System Map', purpose:'Show how recurring objects work together as a larger rhythm.', permittedWorlds:['plan','life'], organizingDimension:'recurrence and balance', requiredRegions:['system-map','recurring-objects','balance','next-rhythm'], optionalRegions:['history','recovery-rules'], centerStageRule:'The relationship among recurring objects is central.', inspectorBehavior:'Open one recurring contract without duplicating it.', supportedObjectTypes:['habit','routine','maintenance-event'], mobileTransformation:'Use a sequence of recurring groups with one selected-object sheet.', prohibitedUses:['duplicate habit records'], stateNoun:'recurring system' }),
  'cultivation-dashboard': architecture({ id:'cultivation-dashboard', name:'Cultivation Dashboard', purpose:'Maintain continuity and recovery of individual habits and recurring commitments.', permittedWorlds:['plan','life'], organizingDimension:'continuity', requiredRegions:['today','rhythms','minimum-version','recovery'], optionalRegions:['history','proof'], centerStageRule:'Habits needing care today are central.', inspectorBehavior:'Explain minimum and recovery rules for the selected rhythm.', supportedObjectTypes:['habit','routine'], mobileTransformation:'Prioritize today and one habit at a time.', prohibitedUses:['shame scoring','duplicated ecosystem records'], stateNoun:'habit rhythms' }),
  'embodied-state': architecture({ id:'embodied-state', name:'Embodied State Monitor', purpose:'Understand the body’s current condition from shared signals without implying medical certainty.', permittedWorlds:['life','today'], organizingDimension:'current physical state', requiredRegions:['body-state','signals','provenance','care-options'], optionalRegions:['sleep','hydration','movement','medication','symptoms','patterns'], centerStageRule:'Current state and signal evidence are central.', inspectorBehavior:'Every generated state shows inputs, freshness, provenance and confidence.', supportedObjectTypes:['wellness-state','symptom','measurement','medication','sleep','activity'], mobileTransformation:'Present the current state first, then signal cards and care actions.', prohibitedUses:['diagnosis','competing independent energy scores'], trustRules:['Distinguish user-entered, measured and inferred state.','Escalate potentially urgent symptoms instead of reducing them to self-care.'], stateNoun:'body signals' }),
  'personal-domain-studio': architecture({ id:'personal-domain-studio', name:'Personal Domain Studio', purpose:'Deeply manage one specialized personal domain through state, routines, inventory, technique and history.', permittedWorlds:['life'], organizingDimension:'specialized domain', requiredRegions:['current-state','goals','active-routine','inventory','technique'], optionalRegions:['history','inspiration','schedule','maintenance','quick-actions'], centerStageRule:'Domain-specific state and active work remain central.', inspectorBehavior:'Owned objects and domain context stay canonical.', supportedObjectTypes:['product','routine','look','appointment','domain-profile'], mobileTransformation:'Prioritize current state and active routine, then progressive sections.', prohibitedUses:['broad multi-domain coordination','private copy of inventory'], stateNoun:'domain data' }),
  'resource-command-center': architecture({ id:'resource-command-center', name:'Resource Command Center', purpose:'Understand and allocate a limited resource with exact provenance and reconciliation.', permittedWorlds:['life','plan'], organizingDimension:'allocation', requiredRegions:['resource-total','available','commitments','attention'], optionalRegions:['categories','goals','history','anomalies'], centerStageRule:'Reconciled resource truth is central.', inspectorBehavior:'Expose calculation rule, underlying records and freshness.', supportedObjectTypes:['account','transaction','bill','subscription','budget','capacity'], mobileTransformation:'Lead with reconciled available resource, then commitments and records.', prohibitedUses:['decorative totals','untraceable numbers'], trustRules:['Pending and posted values remain distinct.','Spendable cash and investment balances may not be silently combined.'], stateNoun:'resource records' }),

  'integrated-domain-hub': architecture({ id:'integrated-domain-hub', name:'Integrated Domain Hub', purpose:'Coordinate several connected subdomains inside one broad life domain.', permittedWorlds:['life'], organizingDimension:'connected domain systems', requiredRegions:['domain-identity','current-direction','primary-action','subdomain-entry'], optionalRegions:['trends','goals','insights'], centerStageRule:'The current domain direction and cross-system flow are central.', inspectorBehavior:'Open subdomain context without turning the hub into another shell.', supportedObjectTypes:['meal','recipe','grocery-item','supplement','journal-entry','goal'], mobileTransformation:'Turn the broad desktop composition into ordered domain sections.', prohibitedUses:['duplicate subdomain data','second navigation shell'], stateNoun:'domain systems' }),
  'ambient-capture-field': architecture({ id:'ambient-capture-field', name:'Ambient Capture Field', purpose:'Accept unfinished information with low pressure before formal organization.', permittedWorlds:['brain','create'], organizingDimension:'incubation', requiredRegions:['capture-field','capture-controls','timeline','privacy'], optionalRegions:['grouping-suggestions','conversion-actions','similarity'], centerStageRule:'Original captures remain visually primary while structure stays tentative.', inspectorBehavior:'Suggestions explain why items may relate and require reversible approval.', supportedObjectTypes:['thought','note','voice-fragment','image','document','link','observation','question'], mobileTransformation:'Capture first, then show an incubation stream and optional grouping sheet.', prohibitedUses:['destructive auto-organization','forced folder assignment'], trustRules:['Private mode governs storage, AI processing, connection suggestions and visibility.','Original capture form is preserved.'], stateNoun:'captures' }),
  'progression-command-center': architecture({ id:'progression-command-center', name:'Progression Command Center', purpose:'Manage a long-term trajectory made of roles, opportunities, skills, people and decisions.', permittedWorlds:['life'], organizingDimension:'development through stages', requiredRegions:['current-state','active-opportunities','progression-path','next-action'], optionalRegions:['contacts','availability','compensation','portfolio','skills','history'], centerStageRule:'Current trajectory and active opportunities are central.', inspectorBehavior:'Individual applications open as canonical Object Workspaces.', supportedObjectTypes:['job','application','person','company','skill','portfolio-item','event','project'], mobileTransformation:'Show current role and active applications first, then progression sections.', prohibitedUses:['new top-level Work world','copying applications into the dashboard'], stateNoun:'career progression' }),
  'shopping-operations-workspace': architecture({ id:'shopping-operations-workspace', name:'Shopping Operations Workspace', purpose:'Coordinate need, inventory, store, price, route, purchase and restocking.', permittedWorlds:['life'], organizingDimension:'purchasing operation', requiredRegions:['shopping-list','inventory-check','store-context','completion'], optionalRegions:['recipe-needs','substitutions','price-watch','aisle-guidance','shared-activity','reorders'], centerStageRule:'The active purchasing operation and item states are central.', inspectorBehavior:'Expose why an item is needed and its canonical inventory relationship.', supportedObjectTypes:['shopping-item','inventory-item','recipe','store','purchase','person'], mobileTransformation:'Use an in-store list with sticky store/budget context and expandable item detail.', prohibitedUses:['owning the financial source of truth','duplicate pantry records'], trustRules:['Purchased state must flow back to inventory and spending through canonical identities.'], stateNoun:'shopping operation' }),
  'cross-domain-protocol-orchestrator': architecture({ id:'cross-domain-protocol-orchestrator', name:'Cross-Domain Protocol Orchestrator', purpose:'Sequence several domains toward one external deadline.', permittedWorlds:['life','today'], organizingDimension:'deadline-oriented sequencing', requiredRegions:['deadline','protocol-modules','smart-sequence','readiness'], optionalRegions:['conflicts','timeline','effort','desired-result','travel-buffer'], centerStageRule:'The leave-ready deadline and dependency-aware sequence are central.', inspectorBehavior:'Explain timing conflicts and the reason for sequence changes.', supportedObjectTypes:['event','routine','product','outfit','trip','preparation-step'], mobileTransformation:'Present the active protocol module and remaining timeline first.', prohibitedUses:['duplicating studio objects','silent deadline changes'], stateNoun:'preparation protocol' }),
  'precision-guided-studio': architecture({ id:'precision-guided-studio', name:'Precision Guided Studio', purpose:'Combine mapped personal information, owned resources and real-time guidance.', permittedWorlds:['life'], organizingDimension:'mapped real-time procedure', requiredRegions:['stage-sequence','personal-map','owned-resources','active-step'], optionalRegions:['finish','coverage','occasion','lighting','camera'], centerStageRule:'The personal map or live mirror and active application step share the center.', inspectorBehavior:'Only canonical owned resources may be selected; safety context remains visible.', supportedObjectTypes:['product','look','face-map','routine','session'], mobileTransformation:'Alternate between full-screen map/mirror and active-step guidance.', prohibitedUses:['separate product inventory','unverified shade identity'], parentArchitectures:['guided-experience','personal-domain-studio'], trustRules:['Respect allergy, sensitivity, expiration, compatibility, eye/lip safety and camera permission.'], stateNoun:'guided studio state' }),
  'restorative-care-workspace': architecture({ id:'restorative-care-workspace', name:'Restorative Care Workspace', purpose:'Translate shared body signals into a reduced-demand recovery plan.', permittedWorlds:['life','today'], organizingDimension:'recovery response', requiredRegions:['recovery-state','contributing-signals','immediate-care','recovery-plan'], optionalRegions:['appointments','evening-routine','sleep-window','trends'], centerStageRule:'Small supportive actions and the shared recovery state are central.', inspectorBehavior:'Separate measured, reported, inferred and medication-related contributors.', supportedObjectTypes:['wellness-state','symptom','sleep','hydration','activity','medication','routine'], mobileTransformation:'Use a low-cognitive-load vertical care plan with one immediate action.', prohibitedUses:['independent energy calculation','treating urgent symptoms as ordinary self-care'], parentArchitectures:['embodied-state'], trustRules:['Concerning symptoms require escalation behavior.'], stateNoun:'restoration state' }),

  'living-day-orchestrator': architecture({ id:'living-day-orchestrator', name:'Living Day Orchestrator', purpose:'Coordinate the entire active day as a changing projection of canonical commitments and state.', permittedWorlds:['today'], organizingDimension:'lived temporal relevance', requiredRegions:['now','next','later','tonight','tomorrow'], optionalRegions:['rhythm','priorities','notes','replan'], centerStageRule:'Now and Next carry more visual and interaction weight than distant parts of the day.', inspectorBehavior:'Daily support never becomes a second copy of Calendar.', supportedObjectTypes:['day','event','task','routine','habit','preparation-shadow'], mobileTransformation:'Use a vertical active-day stream ordered by relevance.', prohibitedUses:['traditional full calendar grid','duplicated day objects'], stateNoun:'active-day state' }),
  'adaptive-replanning-studio': architecture({ id:'adaptive-replanning-studio', name:'Adaptive Replanning Studio', purpose:'Repair an active day by comparing proposed changes against committed reality before approval.', permittedWorlds:['today','plan'], organizingDimension:'active-day repair', requiredRegions:['current-plan','proposed-plan','conflicts','suggestions','approval'], optionalRegions:['impact','change-count','reset'], centerStageRule:'Current committed state and proposed state remain visibly distinct.', inspectorBehavior:'Each suggestion explains change, benefit, conflict resolved, disruption and approval need.', supportedObjectTypes:['day','event','task','time-block','scenario'], mobileTransformation:'Stack current/proposed comparison with explicit per-change approval.', prohibitedUses:['silent schedule mutation'], parentArchitectures:['scenario-studio'], trustRules:['Committed events never move silently.'], stateNoun:'replanning state' }),
  'day-phase-workspace': architecture({ id:'day-phase-workspace', name:'Day-Phase Workspace', purpose:'Focus on one meaningful phase of the active day without repeating the full Day View.', permittedWorlds:['today'], organizingDimension:'day phase', requiredRegions:['phase-identity','state-summary','phase-sequence','transition'], optionalRegions:['intention','wrap-up','wellness'], centerStageRule:'Only the current phase and its realistic actions are central.', inspectorBehavior:'Phase support adapts to energy, mode and remaining capacity.', supportedObjectTypes:['day','event','task','routine','habit'], mobileTransformation:'Use one phase stream with the transition action fixed near the end.', prohibitedUses:['copying the full day','ignoring recovery mode'], stateNoun:'day-phase state' }),
  'immediate-horizon': architecture({ id:'immediate-horizon', name:'Immediate Horizon', purpose:'Prepare the user for the next block, its hidden requirements and transition.', permittedWorlds:['today'], organizingDimension:'immediate preparation horizon', requiredRegions:['next-block','time-remaining','requirements','transition'], optionalRegions:['following-event','items','preparation'], centerStageRule:'One upcoming block and its readiness requirements are central.', inspectorBehavior:'Show items and constraints required to arrive ready.', supportedObjectTypes:['event','task','routine','preparation-shadow'], mobileTransformation:'Show countdown, requirements and Start action before secondary context.', prohibitedUses:['whole-day summary','running the internal Guided Experience itself'], stateNoun:'next-block context' }),
  'event-workspace': architecture({ id:'event-workspace', name:'Event Workspace', purpose:'Manage one scheduled event before, during and after it.', permittedWorlds:['today','plan','life'], organizingDimension:'event lifecycle', requiredRegions:['event-identity','lifecycle','primary-context','primary-action'], optionalRegions:['participants','preparation','agenda','files','travel','decisions','follow-ups'], centerStageRule:'The same canonical Event Object changes projection with lifecycle.', inspectorBehavior:'Before: preparation. During: agenda and notes. After: decisions and follow-ups.', supportedObjectTypes:['event','person','document','task','decision','place'], mobileTransformation:'Lifecycle-aware action and event essentials appear first.', prohibitedUses:['duplicate event record'], parentArchitectures:['object-workspace'], stateNoun:'event context' }),
  'protected-execution': architecture({ id:'protected-execution', name:'Protected Execution Environment', purpose:'Create a temporary low-distraction environment for one concentration-based objective.', permittedWorlds:['today','create','plan'], organizingDimension:'protected objective execution', requiredRegions:['objective','timer','active-step','session-controls'], optionalRegions:['subtasks','files','parked-thoughts','blockers','ambient-audio','planned-vs-actual'], centerStageRule:'One objective, one active step and time remaining dominate.', inspectorBehavior:'Only resources needed for the objective remain available.', supportedObjectTypes:['task','project','focus-session','document','thought'], mobileTransformation:'Use a protected full-screen session with minimal navigation.', prohibitedUses:['procedure step coaching','multi-project management'], stateNoun:'focus session' }),
  'contextual-decision-resolver': architecture({ id:'contextual-decision-resolver', name:'Contextual Decision Resolver', purpose:'Rank eligible next actions from current context while keeping reasoning visible and user choice final.', permittedWorlds:['today'], organizingDimension:'contextual decision', requiredRegions:['current-evidence','candidate-actions','recommendation','reasoning'], optionalRegions:['alternatives','confidence','sources','downside'], centerStageRule:'Recommendation and visible reasoning share attention.', inspectorBehavior:'Expose inputs, constraints, confidence, sources and alternatives.', supportedObjectTypes:['task','event','routine','habit','wellness-state','goal'], mobileTransformation:'Show recommendation first, followed immediately by Why and Alternatives.', prohibitedUses:['coercive language','disguising recommendation as obligation'], trustRules:['Glow recommends; the user decides.'], stateNoun:'decision context' }),
};

export type ArchitecturePageManifest = {
  id: string;
  path: string;
  query?: Record<string,string>;
  aliases?: string[];
  world: ConstitutionWorld;
  runtimeWorld?: 'today'|'plan'|'life'|'beauty'|'brain'|'create';
  room: string;
  architecture: PageArchitectureId;
  primaryObjectType: string;
  intent: string;
  centerFocus: string;
  supportingRegions: string[];
  inspectorType: string;
  dataSources: string[];
  permissions: string[];
  actions: string[];
  canonicalSystem?: string;
  status: 'ACTIVE' | 'CONFORMANCE_REQUIRED' | 'PLANNED_ROUTE';
};

export const PAGE_ARCHITECTURE_MANIFESTS: ArchitecturePageManifest[] = [
  {id:'food-overview',path:'/food',world:'life',room:'food',architecture:'integrated-domain-hub',primaryObjectType:'food-domain',intent:'understand-plan-eat-learn',centerFocus:'current-nourishment-and-meal-planning',supportingRegions:['nutrition','meals','recipes','groceries','pantry','supplements','journal','insights'],inspectorType:'food-context',dataSources:['meal','recipe','grocery-item','pantry-item','nutrition-record','supplement','food-journal'],permissions:['food-data'],actions:['log-meal','plan-meals','open-recipes','open-grocery','review-supplements'],canonicalSystem:'food',status:'CONFORMANCE_REQUIRED'},
  {id:'thoughts',path:'/thoughts',world:'brain',room:'thoughts',architecture:'ambient-capture-field',primaryObjectType:'thought',intent:'capture-incubate-connect',centerFocus:'unfinished-captures',supportingRegions:['timeline','privacy','grouping','conversion'],inspectorType:'capture-context',dataSources:['thought','note','task','project','brain-graph'],permissions:['private-thought-storage','ai-processing','connection-suggestions','visibility'],actions:['capture','voice-capture','attach','group','convert','archive'],canonicalSystem:'brain-capture',status:'PLANNED_ROUTE'},
  {id:'money',path:'/finance',aliases:['/money'],world:'life',room:'money',architecture:'resource-command-center',primaryObjectType:'financial-state',intent:'understand-allocate-reconcile',centerFocus:'reconciled-available-resources',supportingRegions:['accounts','transactions','bills','subscriptions','budgets','goals','attention'],inspectorType:'financial-provenance',dataSources:['account','balance','transaction','bill','subscription','budget','financial-goal'],permissions:['financial-data'],actions:['inspect-records','review-commitments','open-goal'],canonicalSystem:'money',status:'CONFORMANCE_REQUIRED'},
  {id:'work',path:'/work',world:'life',room:'work',architecture:'progression-command-center',primaryObjectType:'career-state',intent:'progress-career',centerFocus:'current-role-and-active-opportunities',supportingRegions:['applications','opportunities','contacts','skills','portfolio','compensation','schedule','direction','history'],inspectorType:'career-context',dataSources:['job','application','person','event','project','skill','portfolio-item'],permissions:['career-data'],actions:['open-application','prepare-interview','contact-person','review-compensation'],canonicalSystem:'career',status:'CONFORMANCE_REQUIRED'},
  {id:'grocery',path:'/grocery',world:'life',room:'grocery',architecture:'shopping-operations-workspace',primaryObjectType:'shopping-operation',intent:'detect-shop-restock',centerFocus:'categorized-shopping-list-and-store-context',supportingRegions:['inventory-check','recipes','substitutions','stores','prices','aisles','shared-activity','reorders'],inspectorType:'shopping-item-context',dataSources:['grocery-item','pantry-item','recipe','meal-plan','home-inventory','purchase','account','event','person'],permissions:['food-data','financial-summary','shared-list'],actions:['add-item','assign','mark-in-cart','purchase','substitute','restock'],canonicalSystem:'food-shopping',status:'PLANNED_ROUTE'},
  {id:'makeup-studio',path:'/beauty/makeup',world:'life',runtimeWorld:'beauty',room:'makeup',architecture:'precision-guided-studio',primaryObjectType:'makeup-session',intent:'prepare-and-apply',centerFocus:'face-map-and-active-step',supportingRegions:['owned-products','finish','coverage','occasion','time','lighting','camera'],inspectorType:'owned-product-and-safety',dataSources:['beauty-product','look','skin-state','face-map','routine','event'],permissions:['beauty-data','camera-optional'],actions:['configure-look','start-session','next-step','compare-lighting','complete'],canonicalSystem:'beauty',status:'CONFORMANCE_REQUIRED'},
  {id:'beauty-command-center',path:'/beauty/command-center',world:'life',runtimeWorld:'beauty',room:'beauty-preparation',architecture:'cross-domain-protocol-orchestrator',primaryObjectType:'preparation-protocol',intent:'be-ready-by-deadline',centerFocus:'leave-ready-time-and-sequence',supportingRegions:['skin','hair','makeup','body','fragrance','closet','travel','conflicts','timeline'],inspectorType:'protocol-readiness',dataSources:['event','weather','place','trip','outfit','routine','beauty-product','wellness-state','preparation-history'],permissions:['calendar','location-context','beauty-data','closet-data'],actions:['generate-protocol','adjust-effort','resolve-conflict','start-module','complete-check'],canonicalSystem:'beauty-preparation',status:'PLANNED_ROUTE'},
  {id:'wellness-restoration',path:'/wellness/restoration',world:'life',room:'restoration',architecture:'restorative-care-workspace',primaryObjectType:'wellness-state',intent:'recover-gently',centerFocus:'shared-recovery-state-and-immediate-care',supportingRegions:['sleep','hydration','mood','movement','appointments','evening-routine','sleep-window'],inspectorType:'wellness-provenance',dataSources:['wellness-state','symptom','measurement','medication','sleep','activity','routine'],permissions:['health-data'],actions:['choose-care','start-breathing','hydrate','adjust-day','prepare-sleep'],canonicalSystem:'body-state',status:'PLANNED_ROUTE'},
  {id:'movement-studio',path:'/fitness',world:'life',room:'movement-studio',architecture:'adaptive-program',primaryObjectType:'fitness-program',intent:'adapt-and-progress',centerFocus:'current-program-phase-and-next-session',supportingRegions:['week','session','adaptation','progress','recovery'],inspectorType:'program-context',dataSources:['fitness-program','workout','exercise','workout-session','wellness-state'],permissions:['fitness-data','health-summary'],actions:['select-session','adapt-session','start-workout','review-progress'],canonicalSystem:'fitness',status:'CONFORMANCE_REQUIRED'},
  {id:'body-awareness',path:'/wellness/body',world:'life',room:'body-awareness',architecture:'embodied-state',primaryObjectType:'wellness-state',intent:'observe-understand-care',centerFocus:'current-body-state-and-signals',supportingRegions:['sleep','energy','hydration','movement','medication','symptoms','patterns'],inspectorType:'signal-provenance',dataSources:['wellness-state','symptom','measurement','medication','sleep','activity'],permissions:['health-data'],actions:['log-signal','inspect-source','choose-care'],canonicalSystem:'body-state',status:'PLANNED_ROUTE'},

  {id:'what-now',path:'/today',query:{room:'what-now'},world:'today',room:'what-now',architecture:'contextual-decision-resolver',primaryObjectType:'day',intent:'choose-next-action',centerFocus:'evidence-backed-recommendation',supportingRegions:['current-state','candidate-actions','why','alternatives'],inspectorType:'recommendation-evidence',dataSources:['active-day','task','event','routine','habit','wellness-state','goal'],permissions:['day-context'],actions:['start','save','inspect-plan','view-alternatives'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'today-day-view',path:'/today',query:{room:'day-view'},world:'today',room:'day-view',architecture:'living-day-orchestrator',primaryObjectType:'day',intent:'coordinate-active-day',centerFocus:'now-next-later-tonight-tomorrow',supportingRegions:['rhythm','priorities','notes','replan'],inspectorType:'day-context',dataSources:['active-day','event','task','routine','habit','preparation-shadow','travel'],permissions:['day-context'],actions:['start','open','join','view','replan'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'replan-my-day',path:'/today',query:{room:'replan'},world:'today',room:'replan',architecture:'adaptive-replanning-studio',primaryObjectType:'day',intent:'repair-active-day',centerFocus:'current-versus-proposed-plan',supportingRegions:['conflicts','suggestions','impact','approval'],inspectorType:'replan-impact',dataSources:['active-day','event','task','time-block','capacity'],permissions:['calendar-write-on-approval'],actions:['move-proposal','shorten-proposal','protect','defer','cancel-proposal','reset','approve'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'morning-brief',path:'/today',query:{room:'morning'},world:'today',room:'morning',architecture:'contextual-brief',primaryObjectType:'day',intent:'enter-day',centerFocus:'wake-state-and-first-commitment',supportingRegions:['weather','energy','care','food','clothing','priorities'],inspectorType:'morning-context',dataSources:['active-day','wellness-state','weather','event','routine','meal','outfit'],permissions:['day-context'],actions:['meet-need','open-first-commitment','enter-day-view'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'next-up',path:'/today',query:{room:'next-up'},world:'today',room:'next-up',architecture:'immediate-horizon',primaryObjectType:'day',intent:'prepare-next-block',centerFocus:'next-block-and-transition',supportingRegions:['time-remaining','requirements','following-event'],inspectorType:'readiness-context',dataSources:['active-day','event','task','routine','preparation-shadow'],permissions:['day-context'],actions:['gather','prepare','start'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'later',path:'/today',query:{room:'later'},world:'today',room:'later',architecture:'day-phase-workspace',primaryObjectType:'day',intent:'execute-afternoon',centerFocus:'afternoon-capacity-and-sequence',supportingRegions:['energy','phase-goals','preparation','wrap-up'],inspectorType:'phase-context',dataSources:['active-day','event','task','routine','wellness-state'],permissions:['day-context'],actions:['start-block','focus','complete-preparation','wrap-up'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'tonight',path:'/today',query:{room:'tonight'},world:'today',room:'tonight',architecture:'day-phase-workspace',primaryObjectType:'day',intent:'close-day-gently',centerFocus:'evening-sequence-and-restoration',supportingRegions:['dinner','care','unwind','tomorrow-setup','sleep'],inspectorType:'evening-context',dataSources:['active-day','event','task','routine','wellness-state','meal','medication'],permissions:['day-context','health-summary'],actions:['start-evening-block','start-wind-down','prepare-tomorrow','close-day'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'tomorrow-preview',path:'/today',query:{room:'tomorrow'},world:'today',room:'tomorrow',architecture:'transitional-brief',primaryObjectType:'day',intent:'prepare-next-day',centerFocus:'first-commitments-and-readiness',supportingRegions:['projects','routines','people','weather','places','files'],inspectorType:'tomorrow-context',dataSources:['next-day','event','task','project','routine','person','weather','place','document'],permissions:['day-context'],actions:['prepare-materials','close-unfinished-work','confirm-readiness'],canonicalSystem:'active-day',status:'ACTIVE'},
  {id:'event-workspace',path:'/today',query:{room:'meeting'},world:'today',room:'meeting',architecture:'event-workspace',primaryObjectType:'event',intent:'prepare-attend-follow-up',centerFocus:'event-lifecycle-and-current-requirements',supportingRegions:['participants','agenda','files','travel','decisions','follow-ups'],inspectorType:'event-context',dataSources:['event','person','place','document','task','decision'],permissions:['calendar','contacts','files'],actions:['join','message','edit','copy-link','directions','capture-decision','create-follow-up'],canonicalSystem:'events',status:'ACTIVE'},
  {id:'focus-session',path:'/today',query:{room:'focus'},world:'today',room:'focus',architecture:'protected-execution',primaryObjectType:'focus-session',intent:'protect-and-complete-work',centerFocus:'objective-active-step-and-timer',supportingRegions:['subtasks','files','distraction-protection','parked-thoughts','blockers','result'],inspectorType:'focus-resources',dataSources:['active-day','task','project','document','thought','focus-session'],permissions:['focus-state'],actions:['start','pause','resume','extend','complete-early','park-thought','record-result'],canonicalSystem:'active-day',status:'ACTIVE'},
];

function cleanPath(value: string) {
  const [pathname = '/', rawQuery = ''] = value.split('?');
  return { pathname: pathname.replace(/\/$/, '') || '/', query: new URLSearchParams(rawQuery) };
}

function queryMatches(expected: Record<string,string> | undefined, actual: URLSearchParams) {
  if (!expected) return true;
  return Object.entries(expected).every(([key,value]) => actual.get(key) === value);
}

export function architectureManifestFor(path: string): ArchitecturePageManifest | null {
  const { pathname, query } = cleanPath(path);
  const candidates = PAGE_ARCHITECTURE_MANIFESTS.filter((manifest) =>
    (manifest.path === pathname || manifest.aliases?.includes(pathname)) && queryMatches(manifest.query, query),
  );
  if (!candidates.length && pathname === '/today') {
    return PAGE_ARCHITECTURE_MANIFESTS.find((manifest) => manifest.id === 'what-now') ?? null;
  }
  return candidates.sort((a,b) => Number(Boolean(b.query)) - Number(Boolean(a.query)))[0] ?? null;
}

export const ARCHITECTURE_FOUR_LAYER_LAW = [
  'global-glow-shell',
  'world-environment',
  'approved-page-architecture',
  'canonical-glow-object-projection',
] as const;

export const PERMANENT_TOP_LEVEL_WORLDS: ConstitutionWorld[] = ['today','plan','life','brain','create'];

export const ARCHITECTURE_MERGE_LAWS = [
  'gua-sha-guidance-is-one-guided-experience-family',
  'home-designs-are-views-of-one-spatial-home-system',
  'relationships-connection-and-people-views-share-person-objects',
  'notes-web-modes-share-one-knowledge-graph',
  'habit-ecosystem-and-garden-share-habit-objects',
  'movement-program-launches-a-separate-guided-workout-experience',
  'body-fitness-wellness-share-one-current-state-source',
  'studios-use-canonical-product-inventory',
  'today-plan-life-project-the-same-event-object',
  'money-fitness-and-body-repeated-designs-do-not-create-duplicate-pages',
] as const;

export const CANONICAL_CROSS_SYSTEM_FLOWS = {
  foodGrocery: ['meal-plan','recipe','ingredient-need','pantry-check','grocery-list','purchase','home-inventory','meal-plan'],
  bodyWellnessFitness: ['body-state','what-now','fitness-adaptation','restoration-plan','result','body-state'],
  beautyPreparation: ['event','leave-ready-time','beauty-protocol','skin-hair-makeup','final-look'],
  thoughtsBrain: ['capture','thought-incubation','grouping','note-task-project','knowledge-graph'],
  today: ['morning-brief','day-view','what-now','next-up','event-or-focus','later','tonight','tomorrow-preview'],
} as const;

export const TODAY_OBJECT_STATES = ['planned','upcoming','preparing','active','paused','completed','replanned','deferred','reflected'] as const;
export const GROCERY_ITEM_STATES = ['suggested','needed','urgent','added','assigned','in-cart','purchased','unavailable','substituted','removed','restocked-at-home'] as const;
export const EVENT_LIFECYCLE = ['before','starting-soon','in-progress','ended','follow-up-required','complete'] as const;

export const ARCHITECTURE_CONVERGENCE_STAGES = {
  A: 'Constitution: four-layer law, architecture library, selection and merge/preserve rules',
  B: 'Census: route assignments, duplicates, shell violations, data duplication and migration blockers',
  C: 'Shell + Registry: manifests, global shell regions and architecture enforcement',
  D: 'Reusable Frames: structural frames, responsive transforms, states, inspectors and transitions',
  E: 'Page Migration: conformance repairs inside the existing World waves',
  F: 'Architecture QA + Lock: structural, canonical-data, responsive, accessibility and provenance verification',
} as const;

export const LIFE_CAPTURE_CARE_LOCK_CRITERIA = [
  'every-target-route-has-one-primary-architecture',
  'money-fitness-body-not-duplicated',
  'food-grocery-share-canonical-items-and-inventory',
  'beauty-command-uses-existing-studio-and-routine-objects',
  'makeup-uses-canonical-owned-products',
  'thoughts-feed-the-same-brain-graph-as-notes',
  'work-uses-canonical-people-events-applications-projects',
  'restoration-reads-shared-health-and-energy-state',
  'numerical-data-exposes-provenance',
  'ai-organization-explainable-and-reversible',
  'desktop-ipad-iphone-pass',
  'sensitive-health-money-thought-permissions-pass',
] as const;

export const TODAY_EXECUTION_LOCK_CRITERIA = [
  'all-ten-today-manifests-exist',
  'duplicate-page-shells-removed',
  'global-glow-shell-inherited',
  'one-canonical-active-day-source',
  'cross-surface-transitions-correct',
  'what-now-recommendations-explain-evidence',
  'replan-never-applies-silently',
  'focus-records-actual-results',
  'event-workspace-follows-lifecycle',
  'phase-pages-adapt-to-energy-and-mode',
  'desktop-ipad-iphone-pass',
  'accessibility-and-reduced-motion-pass',
  'loading-empty-offline-error-states-exist',
  'visual-and-functional-qa-pass',
] as const;

export const ARCHITECTURE_CONSTITUTION_STATUS = {
  name: 'Glow OS Page Architecture Constitution v1',
  status: 'ADOPTED_CONFORMANCE_IN_PROGRESS',
  permanent: true,
  systemWide: true,
  amendmentRequiredToChange: true,
  lifeCaptureCareLabel: 'Glow OS Architecture Constitution v1 · Life Domains, Capture and Care Family',
  lifeCaptureCareStatus: 'CONFORMANCE_REQUIRED',
  todayExecutionLabel: 'Glow OS Architecture Constitution v1 · Today Execution Family',
  todayExecutionStatus: 'CONFORMANCE_REQUIRED',
} as const;

export function architectureDefinitionFor(id: PageArchitectureId) {
  return ARCHITECTURE_REGISTRY[id];
}

export function architectureContractViolations(path: string): string[] {
  const manifest = architectureManifestFor(path);
  if (!manifest) return [`UNDECLARED_ARCHITECTURE:${cleanPath(path).pathname}`];
  const definition = architectureDefinitionFor(manifest.architecture);
  const violations: string[] = [];
  if (!definition.permittedWorlds.includes(manifest.world)) violations.push(`ARCHITECTURE_WORLD_MISMATCH:${manifest.id}`);
  if (!manifest.dataSources.length) violations.push(`MISSING_DATA_SOURCES:${manifest.id}`);
  if (!manifest.permissions.length) violations.push(`MISSING_PERMISSION_CONTRACT:${manifest.id}`);
  if (!manifest.actions.length) violations.push(`MISSING_ACTION_CONTRACT:${manifest.id}`);
  return violations;
}
