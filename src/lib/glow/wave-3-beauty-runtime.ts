import { BEAUTY_FACTORY_GATES, BEAUTY_FACTORY_ROOMS } from './beauty-factory-wave';
import { WAVE_2_LOCK } from './wave-2-runtime';

export const WAVE_3 = 3 as const;
export const WAVE_3_FAMILY = 'beauty' as const;
export type BeautySurface = typeof BEAUTY_FACTORY_ROOMS[number]['room'];
export type BeautyEvidenceDimension = 'route'|'canonical-data'|'shared-shell'|'registered-experiences'|'shared-templates'|'state-machine'|'overlays'|'history'|'runtime'|'responsive'|'accessibility'|'visual'|'golden';
export type BeautyEvidence = {surface:BeautySurface;dimension:BeautyEvidenceDimension;status:'PASS'|'FAIL'|'UNVERIFIED';source:string;blocker?:string};
export type BeautyBlocker = {id:string;owner:string;surfaces:BeautySurface[];severity:'blocker'|'high'|'medium';details:string;resolved:boolean};

export const WAVE_3_ENTRY = {
  allowed: WAVE_2_LOCK.status === 'LOCKED',
  requires: 'wave-2-locked',
  family: WAVE_3_FAMILY,
  rooms: BEAUTY_FACTORY_ROOMS.map(room=>room.room),
  factoryGates: BEAUTY_FACTORY_GATES,
} as const;

export const BEAUTY_REQUIRED_DIMENSIONS:readonly BeautyEvidenceDimension[]=['route','canonical-data','shared-shell','registered-experiences','shared-templates','state-machine','overlays','history','runtime','responsive','accessibility','visual','golden'];

export const BEAUTY_CANONICAL_OBJECTS=['product','routine','routine-step','routine-session','beauty-tool','treatment','goal','appointment','progress-record','photo'] as const;
export const BEAUTY_INVENTORY_LAWS={oneCanonicalProductRecord:true,physicalBackupsSeparate:true,unclearProductsRemainNeedsIdentification:true,medicationSeparateFromCosmeticProducts:true,preserveSourceProvenance:true} as const;

export function beautyEvidenceStatus(items:BeautyEvidence[]){
  const missing:string[]=[]; const failed:string[]=[];
  for(const room of BEAUTY_FACTORY_ROOMS) for(const dimension of BEAUTY_REQUIRED_DIMENSIONS){
    const item=items.find(x=>x.surface===room.room&&x.dimension===dimension);
    if(!item||item.status==='UNVERIFIED') missing.push(`${room.room}:${dimension}`);
    else if(item.status==='FAIL') failed.push(item.blocker??`${room.room}:${dimension}`);
  }
  return {required:BEAUTY_FACTORY_ROOMS.length*BEAUTY_REQUIRED_DIMENSIONS.length,provided:items.length,missing,failed:[...new Set(failed)],passed:missing.length===0&&failed.length===0};
}

const severity={blocker:3,high:2,medium:1} as const;
export function rankBeautyBlockers(blockers:BeautyBlocker[]){return blockers.filter(x=>!x.resolved).map(x=>({...x,impact:x.surfaces.length,sharedRepair:x.surfaces.length>1})).sort((a,b)=>severity[b.severity]-severity[a.severity]||b.impact-a.impact);}
export function nextBeautyRepair(blockers:BeautyBlocker[]){return rankBeautyBlockers(blockers)[0]??null;}

export function wave3Checkpoint(items:BeautyEvidence[],blockers:BeautyBlocker[]){
  const evidence=beautyEvidenceStatus(items); const open=rankBeautyBlockers(blockers);
  const canLock=WAVE_3_ENTRY.allowed&&evidence.passed&&open.length===0;
  return {wave:WAVE_3,family:WAVE_3_FAMILY,entryAllowed:WAVE_3_ENTRY.allowed,evidence,openBlockers:open,canLock,status:canLock?'LOCKABLE':'BUILDING',nextRepair:open[0]??null} as const;
}

export const WAVE_3_COMPLETION_ORDER=['skincare','gua-sha','hair','makeup','body','nails','brows','lashes','oral','fragrance','tools-devices','maintenance'] as const;
export const WAVE_3_RULE='Finish existing Beauty implementations by highest-impact shared blocker. Do not create replacement page architecture when an inherited factory/template/engine repair can fix the family.' as const;
