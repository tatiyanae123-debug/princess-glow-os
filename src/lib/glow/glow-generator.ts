export type GlowGeneratorRequest={world:string;room:string;experience:string;purpose:string;preferredTemplate?:string;canonicalObjects:string[];capabilities?:string[];referenceCritical?:boolean};
export type GlowGeneratorPlan={identity:string;inheritance:string[];template:string;objects:string[];capabilities:string[];exceptionReview:boolean;requiredQa:string[]};

const PURPOSE_TEMPLATE:Record<string,string>={home:'T02',library:'T03',detail:'T04',workspace:'T05',builder:'T06',guided:'T07',recommendation:'T08',timeline:'T09',planner:'T10',progress:'T11',collection:'T12',learn:'T13',completion:'T14',system:'T15'};

export function generateGlowExperience(request:GlowGeneratorRequest):GlowGeneratorPlan{
 const template=request.preferredTemplate??PURPOSE_TEMPLATE[request.purpose]??'REVIEW';
 return {identity:`${request.world}.${request.room}.${request.experience}`.toLowerCase().replace(/\s+/g,'-'),inheritance:['global-constitution',`${request.world}-constitution`,`${request.room}-constitution`,'master-template', 'experience-variant','current-state'],template,objects:request.canonicalObjects,capabilities:request.capabilities??[],exceptionReview:Boolean(request.referenceCritical||template==='REVIEW'),requiredQa:['registry','canonical-identity','inheritance','state','overlay','data-provenance','history','responsive','accessibility','runtime','golden-if-exception']};
}

export const FACTORY_LOCK_GATES=['all-family-waves-accounted-for','whole-glow-convergence-no-blockers','global-shell-parity','canonical-object-integrity','template-factory-stable','shared-engines-stable','state-and-overlay-factories-stable','data-provenance-clear','history-connected','runtime-errors-clear','responsive-and-accessibility-pass','golden-exceptions-approved'] as const;
export type FactoryLockEvidence=Partial<Record<(typeof FACTORY_LOCK_GATES)[number],boolean>>;
export function evaluateFactoryLock(evidence:FactoryLockEvidence){const missing=FACTORY_LOCK_GATES.filter(g=>evidence[g]!==true);return {locked:missing.length===0,missing};}

export const GLOW_GENERATOR_LAW='New Glow experiences are generated from registry + constitutions + template + canonical objects + capabilities + state. Custom page architecture is an exception requiring explicit review.' as const;
