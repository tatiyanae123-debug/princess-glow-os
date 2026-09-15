import type { LiveClassification } from './live-app-classifier';

export type MigrationPlan={path:string;action:string;preserve:string[];target:string;blocked:boolean;reason?:string};

export function generateMigrationPlan(surface:LiveClassification):MigrationPlan{
 const preserve=surface.canonicalData?['canonical data access','object identity','history/provenance']:[];
 switch(surface.disposition){
  case 'CONFIGURE': return {path:surface.path,action:'replace page-owned composition with thin route + experience config',preserve,target:'Universal Glow Experience Renderer',blocked:false};
  case 'MIGRATE': return {path:surface.path,action:'extract reusable projection; preserve data; migrate visual/behavioral architecture to shared engine',preserve,target:'Registry-selected shared engine',blocked:false};
  case 'MERGE': return {path:surface.path,action:'audit data/actions then redirect or merge projection into canonical sibling',preserve,target:surface.duplicatesAnotherPath??'canonical experience',blocked:true,reason:'requires identity and route-compatibility verification before retirement'};
  case 'TRUE_EXCEPTION': return {path:surface.path,action:'register explicit exception while retaining inherited shell/state/QA',preserve,target:'registered custom composition',blocked:false};
  case 'KEEP': return {path:surface.path,action:'keep implementation and attach registry/lock metadata',preserve,target:'existing implementation',blocked:false};
  case 'RETIRE': return {path:surface.path,action:'retire after redirect/data/history verification',preserve,target:'replacement experience',blocked:true,reason:'retirement requires explicit verification'};
  default:return {path:surface.path,action:'collect more implementation evidence',preserve,target:'unresolved',blocked:true,reason:'needs review'};
 }
}

export function generateMigrationWave(surfaces:LiveClassification[]){
 const plans=surfaces.map(generateMigrationPlan);
 return {ready:plans.filter(x=>!x.blocked),blocked:plans.filter(x=>x.blocked),plans};
}

export const MIGRATION_ORDER=['preserve canonical data','register experience','connect shared engine','switch route/projection','run QA','verify history/context','retire obsolete code'] as const;
