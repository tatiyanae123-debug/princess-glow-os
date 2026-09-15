export type WaveAFamily='today'|'planning'|'routines';
export type WaveAPlan={family:WaveAFamily;templates:string[];canonicalObjects:string[];sharedCapabilities:string[];preserveExistingRoutes:true;retireOnlyAfterQa:true};

export const WAVE_A_TODAY_PLANNING_ROUTINES:WaveAPlan[]=[
 {family:'today',templates:['T02','T07','T08','T09','T10','T14'],canonicalObjects:['task','event','routine','routine-session','habit','goal'],sharedCapabilities:['what-now','energy-mode','capacity','timeline','calendar','completion-history','attention'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
 {family:'planning',templates:['T02','T03','T04','T06','T08','T09','T10','T11','T14'],canonicalObjects:['task','event','goal','project','routine','habit'],sharedCapabilities:['calendar','time-blocking','capacity','energy-planning','recurrence','reviews','completion-history'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
 {family:'routines',templates:['T02','T03','T04','T06','T07','T08','T09','T11','T14'],canonicalObjects:['routine','routine-session','habit','task','event'],sharedCapabilities:['routine-resolution','energy-mode','recurrence','guided-session','timeline','completion-history','recommendation'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
];

export const WAVE_A_SHARED_ANCESTORS=['global-shell','glow-context','canonical-object-layer','timeline-engine','planner-engine','guided-engine','intelligence-engine','state-machine-factory','overlay-factory','environment-tokens','history-layer'] as const;
export const WAVE_A_GATES=['route-inventory-mapped','canonical-data-preserved','shared-shell','shared-context','template-resolution','states-and-overlays','history-connected','capacity-and-energy-laws','responsive','accessibility','runtime-errors-clear','golden-exceptions-approved'] as const;

export function waveASummary(){return {families:WAVE_A_TODAY_PLANNING_ROUTINES.map(x=>x.family),sharedAncestors:WAVE_A_SHARED_ANCESTORS,gates:WAVE_A_GATES};}

// This wave is intentionally cross-family: Today, Planning and Routines share time, task, routine, energy, capacity and history infrastructure and should not be migrated independently.
