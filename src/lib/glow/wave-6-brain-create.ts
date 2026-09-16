export const WAVE_6=6 as const;
export const WAVE_6_NAME='Brain + Create' as const;
export type Wave6Family='brain'|'create';
export type Wave6Dimension='route'|'canonical-data'|'shared-shell'|'registered-experiences'|'shared-templates'|'state-machine'|'overlays'|'history'|'runtime'|'responsive'|'accessibility'|'visual'|'golden';
export type Wave6Evidence={family:Wave6Family;dimension:Wave6Dimension;status:'PASS'|'FAIL'|'UNVERIFIED';source:string;blocker?:string};
export type Wave6Blocker={id:string;owner:string;families:Wave6Family[];severity:'blocker'|'high'|'medium';details:string;resolved:boolean};
export const WAVE_6_ENTRY={mode:'parallel-completion',priorWave:'life',priorWaveEvidenceStillRequired:true} as const;
export const WAVE_6_FAMILIES:Record<Wave6Family,{routeRoots:string[];objects:string[];capabilities:string[]}>= {
 brain:{routeRoots:['/brain','/notes','/ideas'],objects:['note','idea','document','reference','task','goal','collection','attachment'],capabilities:['capture','organize','search','relationships','reference-locking','history','ask-glow']},
 create:{routeRoots:['/create','/projects'],objects:['project','creative-work','idea','reference','asset','task','collection','attachment'],capabilities:['studio','project-building','reference','generation','organization','history','ask-glow']},
};
export const WAVE_6_DIMENSIONS:readonly Wave6Dimension[]=['route','canonical-data','shared-shell','registered-experiences','shared-templates','state-machine','overlays','history','runtime','responsive','accessibility','visual','golden'];
export const WAVE_6_SHARED_LAWS={canonicalObjects:true,oneGlobalShell:true,oneGlowContext:true,sharedHistory:true,captureBeforeOrganization:true,provenance:true,referenceLocking:true,multimodalAttachments:true,noPageByPagePatching:true,repairHighestSharedAncestor:true} as const;
export function wave6EvidenceStatus(items:Wave6Evidence[]){const families:Wave6Family[]=['brain','create'];const missing:string[]=[];const failed:string[]=[];for(const family of families)for(const dimension of WAVE_6_DIMENSIONS){const item=items.find(x=>x.family===family&&x.dimension===dimension);if(!item||item.status==='UNVERIFIED')missing.push(`${family}:${dimension}`);else if(item.status==='FAIL')failed.push(item.blocker??`${family}:${dimension}`);}return{required:families.length*WAVE_6_DIMENSIONS.length,provided:items.length,missing,failed:[...new Set(failed)],passed:missing.length===0&&failed.length===0};}
const rank={blocker:3,high:2,medium:1} as const;
export function rankWave6Blockers(items:Wave6Blocker[]){return items.filter(x=>!x.resolved).map(x=>({...x,impact:x.families.length,sharedRepair:x.families.length>1})).sort((a,b)=>rank[b.severity]-rank[a.severity]||b.impact-a.impact);}
export function wave6Checkpoint(evidence:Wave6Evidence[],blockers:Wave6Blocker[]){const e=wave6EvidenceStatus(evidence);const open=rankWave6Blockers(blockers);const canLock=e.passed&&open.length===0;return{wave:WAVE_6,name:WAVE_6_NAME,evidence:e,openBlockers:open,canLock,status:canLock?'LOCKABLE':'BUILDING',nextRepair:open[0]??null}as const;}
export const WAVE_6_COMPLETION_ORDER=['shared-capture-reference-layer','brain','create','cross-family-qa','device-and-state-qa','golden-lock'] as const;
export const WAVE_6_RULE='Complete Brain and Create as connected projections of the same Glow Graph. Preserve provenance, attachments, references, history and object identity; repair shared ancestors before individual surfaces; do not claim lock without evidence.' as const;
