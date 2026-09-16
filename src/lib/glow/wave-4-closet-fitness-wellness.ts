export const WAVE_4=4 as const;
export const WAVE_4_NAME='Closet + Fitness + Wellness' as const;
export type Wave4Family='closet'|'fitness'|'wellness';
export type Wave4Dimension='route'|'canonical-data'|'shared-shell'|'registered-experiences'|'shared-templates'|'state-machine'|'overlays'|'history'|'runtime'|'responsive'|'accessibility'|'visual'|'golden';
export type Wave4Evidence={family:Wave4Family;dimension:Wave4Dimension;status:'PASS'|'FAIL'|'UNVERIFIED';source:string;blocker?:string};
export type Wave4Blocker={id:string;owner:string;families:Wave4Family[];severity:'blocker'|'high'|'medium';details:string;resolved:boolean};

// Wave 3 Beauty remains evidence-gated. Wave 4 can be prepared and executed in parallel,
// but final family lock/whole-app handoff must not misrepresent unfinished Beauty evidence.
export const WAVE_4_ENTRY={mode:'parallel-completion',priorWave:'beauty',priorWaveEvidenceStillRequired:true} as const;
export const WAVE_4_FAMILIES:Record<Wave4Family,{routeRoots:string[];objects:string[];capabilities:string[]}>= {
 closet:{routeRoots:['/closet','/style','/fashion'],objects:['clothing-item','outfit','accessory','shoe','collection','look','purchase','photo'],capabilities:['inventory','outfit-builder','styling','recommendation','packing','wishlist','history']},
 fitness:{routeRoots:['/fitness','/workouts'],objects:['workout','exercise','workout-session','goal','progress-record','schedule'],capabilities:['workout-plan','guided-session','progress','recovery','schedule','recommendation']},
 wellness:{routeRoots:['/wellness'],objects:['routine','habit','goal','observation','appointment','progress-record'],capabilities:['daily-state','routine','recovery','progress','recommendation','history']},
};
export const WAVE_4_DIMENSIONS:readonly Wave4Dimension[]=['route','canonical-data','shared-shell','registered-experiences','shared-templates','state-machine','overlays','history','runtime','responsive','accessibility','visual','golden'];
export const WAVE_4_SHARED_LAWS={canonicalObjects:true,oneGlobalShell:true,oneGlowContext:true,sharedHistory:true,energyAware:true,capacityAware:true,provenance:true,noPageByPagePatching:true,repairHighestSharedAncestor:true} as const;

export function wave4EvidenceStatus(items:Wave4Evidence[]){const families:Wave4Family[]=['closet','fitness','wellness'];const missing:string[]=[];const failed:string[]=[];for(const family of families)for(const dimension of WAVE_4_DIMENSIONS){const item=items.find(x=>x.family===family&&x.dimension===dimension);if(!item||item.status==='UNVERIFIED')missing.push(`${family}:${dimension}`);else if(item.status==='FAIL')failed.push(item.blocker??`${family}:${dimension}`);}return{required:families.length*WAVE_4_DIMENSIONS.length,provided:items.length,missing,failed:[...new Set(failed)],passed:missing.length===0&&failed.length===0};}
const rank={blocker:3,high:2,medium:1} as const;
export function rankWave4Blockers(items:Wave4Blocker[]){return items.filter(x=>!x.resolved).map(x=>({...x,impact:x.families.length,sharedRepair:x.families.length>1})).sort((a,b)=>rank[b.severity]-rank[a.severity]||b.impact-a.impact);}
export function wave4Checkpoint(evidence:Wave4Evidence[],blockers:Wave4Blocker[]){const e=wave4EvidenceStatus(evidence);const open=rankWave4Blockers(blockers);const canLock=e.passed&&open.length===0;return{wave:WAVE_4,name:WAVE_4_NAME,evidence:e,openBlockers:open,canLock,status:canLock?'LOCKABLE':'BUILDING',nextRepair:open[0]??null}as const;}
export const WAVE_4_COMPLETION_ORDER=['shared-context-and-history','closet','fitness','wellness','cross-family-qa','device-and-state-qa','golden-lock'] as const;
export const WAVE_4_RULE='Converge Closet, Fitness, and Wellness through shared ancestors and existing implementations. Preserve canonical user data and do not claim a family lock without evidence.' as const;
