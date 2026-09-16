export const WAVE_5=5 as const;
export const WAVE_5_NAME='Life' as const;
export type LifeFamily='home'|'food'|'money'|'travel'|'career-life';
export type LifeDimension='route'|'canonical-data'|'shared-shell'|'registered-experiences'|'shared-templates'|'state-machine'|'overlays'|'history'|'runtime'|'responsive'|'accessibility'|'visual'|'golden';
export type LifeEvidence={family:LifeFamily;dimension:LifeDimension;status:'PASS'|'FAIL'|'UNVERIFIED';source:string;blocker?:string};
export type LifeBlocker={id:string;owner:string;families:LifeFamily[];severity:'blocker'|'high'|'medium';details:string;resolved:boolean};

export const WAVE_5_ENTRY={mode:'parallel-completion',priorWave:'closet-fitness-wellness',priorWaveEvidenceStillRequired:true} as const;
export const LIFE_FAMILIES:Record<LifeFamily,{routeRoots:string[];objects:string[];capabilities:string[]}>= {
 home:{routeRoots:['/life','/home'],objects:['task','routine','inventory-item','space','maintenance-event','purchase','document'],capabilities:['home-reset','cleaning','inventory','maintenance','planning','history']},
 food:{routeRoots:['/food','/groceries','/meals'],objects:['meal','recipe','grocery-item','shopping-list','inventory-item','routine'],capabilities:['meal-planning','groceries','inventory','prep','recommendation','history']},
 money:{routeRoots:['/money','/finances'],objects:['transaction','account','bill','subscription','budget','goal','purchase'],capabilities:['spending','budgeting','bills','subscriptions','goals','history']},
 travel:{routeRoots:['/travel','/trips'],objects:['trip','place','booking','event','task','document','purchase'],capabilities:['planning','itinerary','packing','booking-context','recommendation','history']},
 'career-life':{routeRoots:['/career','/life/career'],objects:['job','application','interview','contact','task','goal','document','event'],capabilities:['job-search','application-tracking','interviews','career-planning','goals','history']},
};
export const LIFE_DIMENSIONS:readonly LifeDimension[]=['route','canonical-data','shared-shell','registered-experiences','shared-templates','state-machine','overlays','history','runtime','responsive','accessibility','visual','golden'];
export const LIFE_SHARED_LAWS={oneLifeModel:true,canonicalObjects:true,oneGlobalShell:true,oneGlowContext:true,sharedHistory:true,planningHierarchy:true,capacityGuard:true,provenance:true,noPageByPagePatching:true,repairHighestSharedAncestor:true} as const;
export function lifeEvidenceStatus(items:LifeEvidence[]){const families:LifeFamily[]=['home','food','money','travel','career-life'];const missing:string[]=[];const failed:string[]=[];for(const family of families)for(const dimension of LIFE_DIMENSIONS){const item=items.find(x=>x.family===family&&x.dimension===dimension);if(!item||item.status==='UNVERIFIED')missing.push(`${family}:${dimension}`);else if(item.status==='FAIL')failed.push(item.blocker??`${family}:${dimension}`);}return{required:families.length*LIFE_DIMENSIONS.length,provided:items.length,missing,failed:[...new Set(failed)],passed:missing.length===0&&failed.length===0};}
const rank={blocker:3,high:2,medium:1} as const;
export function rankLifeBlockers(items:LifeBlocker[]){return items.filter(x=>!x.resolved).map(x=>({...x,impact:x.families.length,sharedRepair:x.families.length>1})).sort((a,b)=>rank[b.severity]-rank[a.severity]||b.impact-a.impact);}
export function wave5Checkpoint(evidence:LifeEvidence[],blockers:LifeBlocker[]){const e=lifeEvidenceStatus(evidence);const open=rankLifeBlockers(blockers);const canLock=e.passed&&open.length===0;return{wave:WAVE_5,name:WAVE_5_NAME,evidence:e,openBlockers:open,canLock,status:canLock?'LOCKABLE':'BUILDING',nextRepair:open[0]??null}as const;}
export const WAVE_5_COMPLETION_ORDER=['shared-life-model','home','food','money','travel','career-life','cross-family-qa','device-and-state-qa','golden-lock'] as const;
export const WAVE_5_RULE='Complete Life as projections into the same Glow life model. Preserve existing user data and relationships; repair shared ancestors before individual surfaces; do not claim lock without evidence.' as const;
